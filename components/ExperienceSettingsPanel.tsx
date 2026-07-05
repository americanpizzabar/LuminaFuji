'use client'

/**
 * ゲスト体験機能の構成パネル（管理会社・オーナー共用）。
 *
 * 設計方針:
 * - 全ての会社が全機能を使うわけではない。導入コスト（物理設置・運用体制）が
 *   必要な機能には「要件バッジ」を付け、判断材料を提示する。
 * - 迷わせない: まず3つのプリセットで大枠を決め、必要なら個別に微調整する。
 * - 変更は即時保存され、ゲスト端末には次の画面描画から反映される。
 */

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, CheckCircle2 } from 'lucide-react'
import { useStore } from '@/lib/useStore'
import { expOf, DEFAULT_EXPERIENCE_SETTINGS } from '@/lib/store'
import type { ExperienceSettings } from '@/lib/store'

type BoolKey = {
  [K in keyof ExperienceSettings]: ExperienceSettings[K] extends boolean ? K : never
}[keyof ExperienceSettings]

interface FeatureDef {
  key: BoolKey
  emoji: string
  name: string
  desc: string
  /** 導入に物理設置や運用体制が必要な場合の注記 */
  requires?: string
  /** 有効時に表示する数値パラメータ */
  param?: 'conciergeHours' | 'alarmLeadMinutes'
}

interface Group {
  title: string
  sub: string
  items: FeatureDef[]
}

const GROUPS: Group[] = [
  {
    title: '到着時・演出',
    sub: '第一印象と画面全体の質感',
    items: [
      { key: 'welcomeRitual',  emoji: '🕯️', name: '入室の儀式',
        desc: 'チェックイン初回、光のウェーブとともに迎える5秒のセレモニー' },
      { key: 'cinematicFrame', emoji: '🎞️', name: 'シネマティック演出',
        desc: 'フィルムグレインとビネットによる映画のような画面質感' },
      { key: 'arrivalCheck',   emoji: '🤍', name: 'サイレント・オンボーディング',
        desc: '到着時にゲストの状態（疲労・時差など）を伺い、照明を先回りでプリセット' },
    ],
  },
  {
    title: 'ご滞在中',
    sub: '心と身体に寄り添う光のケア',
    items: [
      { key: 'circadianTuner', emoji: '✦', name: '光の処方箋',
        desc: '時差ぼけ・集中・睡眠に合わせた光のプロトコル（1/fゆらぎキャンドル含む）' },
      { key: 'autoAmbient',    emoji: '🌇', name: 'オート・アンビエント',
        desc: '日没に同期して、気づかないほど静かにくつろぎの光へ移行' },
      { key: 'silentConcierge', emoji: '🕊️', name: '無言のコンシェルジュ',
        desc: '同じ照明が長時間続いたとき、5分間の呼吸ライトを静かに提案',
        param: 'conciergeHours' },
      { key: 'lightAlarm',     emoji: '🌅', name: '明日の光アラーム',
        desc: '翌朝の予定に合わせ、画面がサンライズとなって起こすウェイクアップ',
        param: 'alarmLeadMinutes' },
      { key: 'objectLink',     emoji: '🏺', name: '一期一会オブジェクト',
        desc: '客室の工芸品QRから、職人の物語と専用照明シーンを起動',
        requires: '工芸品＋QRタグの設置が必要' },
      { key: 'guestbook',      emoji: '✨', name: '星空のゲストブック',
        desc: 'ゲストの声が星となって夜空に灯るコミュニティ空間',
        requires: '投稿内容の定期的な確認を推奨' },
    ],
  },
  {
    title: 'チェックアウト後',
    sub: '記憶の持ち帰りとリレーション構築',
    items: [
      { key: 'memoryCard',  emoji: '💌', name: '光の記憶カード',
        desc: '滞在中の照明履歴から生成する、その人だけのチェックアウトカード' },
      { key: 'blueprint',   emoji: '📐', name: '光の設計図',
        desc: 'ゲスト固有の光のプロファイルをアートデータとして進呈' },
      { key: 'luminaWindow', emoji: '🪟', name: 'Luminaの窓',
        desc: '帰宅後もスマホの画面が施設の有機EL常夜灯になる継続体験' },
      { key: 'secretKey',   emoji: '🗝️', name: 'シークレットキー',
        desc: 'ECUANEST照明コンサルへのVIP専用キーを進呈',
        requires: 'VIP相談プログラムの運用が必要' },
      { key: 'repeaterCta', emoji: '🎁', name: 'リピーター特典',
        desc: '再予約特典と予約リンクの表示' },
    ],
  },
]

const ALL_BOOL_KEYS: BoolKey[] = GROUPS.flatMap(g => g.items.map(i => i.key))

type PresetId = 'full' | 'standard' | 'minimal'

const PRESETS: { id: PresetId; name: string; desc: string; build: () => ExperienceSettings }[] = [
  {
    id: 'full', name: 'フル体験', desc: '全ての光の体験を提供',
    build: () => ({ ...DEFAULT_EXPERIENCE_SETTINGS }),
  },
  {
    id: 'standard', name: 'スタンダード', desc: '追加の設置・運用が不要な構成',
    build: () => ({
      ...DEFAULT_EXPERIENCE_SETTINGS,
      objectLink: false,   // 物理工芸品の設置が必要
      secretKey: false,    // VIPプログラムの運用が必要
    }),
  },
  {
    id: 'minimal', name: 'ミニマル', desc: '照明操作とご案内のみ',
    build: () => ({
      ...DEFAULT_EXPERIENCE_SETTINGS,
      ...Object.fromEntries(ALL_BOOL_KEYS.map(k => [k, false])),
    } as ExperienceSettings),
  },
]

function matchesPreset(exp: ExperienceSettings, preset: ExperienceSettings): boolean {
  return ALL_BOOL_KEYS.every(k => exp[k] === preset[k])
}

// ─── Sub controls ─────────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full border-2 transition-colors ${
        checked ? 'bg-amber-600 border-amber-500' : 'bg-zinc-700 border-zinc-600'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}

function Segmented({ options, value, unit, onChange }: {
  options: number[]
  value: number
  unit: string
  onChange: (v: number) => void
}) {
  return (
    <div className="flex gap-1.5">
      {options.map(opt => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${
            value === opt
              ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
              : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'
          }`}
        >
          {opt}{unit}
        </button>
      ))}
    </div>
  )
}

// ─── Panel ────────────────────────────────────────────────────────────────────

export default function ExperienceSettingsPanel() {
  const [store, update] = useStore()
  const exp = expOf(store)
  const [savedPulse, setSavedPulse] = useState(false)
  const pulseRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => { if (pulseRef.current) clearTimeout(pulseRef.current) }
  }, [])

  const save = (next: ExperienceSettings) => {
    update({ experienceSettings: next })
    setSavedPulse(true)
    if (pulseRef.current) clearTimeout(pulseRef.current)
    pulseRef.current = setTimeout(() => setSavedPulse(false), 1600)
  }

  const setFlag = (key: BoolKey, value: boolean) => save({ ...exp, [key]: value })
  const setParam = (key: 'conciergeHours' | 'alarmLeadMinutes', value: number) =>
    save({ ...exp, [key]: value })

  const enabledCount = ALL_BOOL_KEYS.filter(k => exp[k]).length
  const activePreset = PRESETS.find(p => matchesPreset(exp, p.build()))?.id ?? null

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-1">
        <h2 className="text-sm font-medium text-zinc-200 flex items-center gap-2">
          <Sparkles size={14} className="text-amber-400" />
          ゲスト体験機能
        </h2>
        <div className="flex items-center gap-2">
          <AnimatePresence>
            {savedPulse && (
              <motion.span
                initial={{ opacity: 0, x: 6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1 text-[11px] text-emerald-400"
              >
                <CheckCircle2 size={11} /> 反映済み
              </motion.span>
            )}
          </AnimatePresence>
          <span className="text-[11px] text-zinc-500 tabular-nums">{enabledCount}/{ALL_BOOL_KEYS.length} 有効</span>
        </div>
      </div>
      <p className="text-xs text-zinc-400 leading-relaxed mb-4">
        施設の運用方針に合わせて、ゲストアプリに表示する体験機能を構成できます。
        オフにした機能はゲスト画面から完全に消えます。変更は即時保存され、次の画面表示から反映されます。
      </p>

      {/* Presets */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        {PRESETS.map(({ id, name, desc, build }) => {
          const isActive = activePreset === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => save(build())}
              className={`rounded-xl p-3 text-left border transition-all ${
                isActive
                  ? 'border-amber-500/40 bg-amber-500/10'
                  : 'border-zinc-700 hover:border-zinc-600'
              }`}
            >
              <p className={`text-xs font-semibold ${isActive ? 'text-amber-300' : 'text-zinc-200'}`}>{name}</p>
              <p className="text-[11px] text-zinc-500 mt-0.5 leading-snug">{desc}</p>
            </button>
          )
        })}
      </div>

      {/* Feature groups */}
      <div className="space-y-5">
        {GROUPS.map(group => (
          <div key={group.title}>
            <div className="flex items-baseline gap-2 mb-2.5">
              <p className="text-xs font-semibold text-zinc-300">{group.title}</p>
              <p className="text-[11px] text-zinc-500">{group.sub}</p>
            </div>

            <div className="space-y-1.5">
              {group.items.map(item => {
                const enabled = exp[item.key]
                return (
                  <div key={item.key}
                       className={`rounded-xl border px-3.5 py-3 transition-colors ${
                         enabled ? 'border-zinc-700/80 bg-zinc-800/40' : 'border-zinc-800 bg-transparent'
                       }`}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <span className={`text-base leading-none mt-0.5 ${enabled ? '' : 'grayscale opacity-50'}`}>
                          {item.emoji}
                        </span>
                        <div className="min-w-0">
                          <p className={`text-sm font-medium ${enabled ? 'text-zinc-100' : 'text-zinc-500'}`}>
                            {item.name}
                          </p>
                          <p className="text-[11px] text-zinc-500 mt-0.5 leading-snug">{item.desc}</p>
                          {item.requires && (
                            <span className="inline-block mt-1.5 text-[10px] px-1.5 py-0.5 rounded-md"
                                  style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.18)', color: '#d4a94e' }}>
                              ⚠ {item.requires}
                            </span>
                          )}
                        </div>
                      </div>
                      <Toggle checked={enabled} onChange={v => setFlag(item.key, v)} />
                    </div>

                    {/* Fine-grained params */}
                    <AnimatePresence>
                      {enabled && item.param === 'conciergeHours' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-3 mt-2.5 border-t border-zinc-800">
                            <p className="text-[11px] text-zinc-400 mb-1.5">
                              提案までの検知時間 — 同じ照明がこの時間続いたら声をかけます
                            </p>
                            <Segmented options={[1, 2, 3, 4]} value={exp.conciergeHours} unit="時間"
                                       onChange={v => setParam('conciergeHours', v)} />
                          </div>
                        </motion.div>
                      )}
                      {enabled && item.param === 'alarmLeadMinutes' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-3 mt-2.5 border-t border-zinc-800">
                            <p className="text-[11px] text-zinc-400 mb-1.5">
                              サンライズ開始 — 起床時刻の何分前から明るくし始めるか
                            </p>
                            <Segmented options={[10, 20, 30]} value={exp.alarmLeadMinutes} unit="分前"
                                       onChange={v => setParam('alarmLeadMinutes', v)} />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
