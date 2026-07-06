'use client'

/**
 * 委託サービス範囲パネル（オーナー設定専用）。
 *
 * 管理会社が提供できるサービスは会社ごとにマチマチ — この画面が「委託契約」となり、
 * 業務ごとの担当（管理会社 / オーナー / 両方）を定義する。
 * 設定は両ポータルのバッジ・セクション表示・タブ構成に即時反映される。
 * オーナーは委託中でも常に全データを閲覧・操作できる（scope は責任の所在のみを決める）。
 */

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Handshake, CheckCircle2 } from 'lucide-react'
import { useStore } from '@/lib/useStore'
import { scopeOf, DEFAULT_SERVICE_SCOPE } from '@/lib/store'
import type { ServiceScope, DutyKey, DutyAssignee } from '@/lib/store'

interface DutyDef {
  key: DutyKey
  emoji: string
  name: string
  desc: string
  /** 'both' を選択肢に含めるか（対応責任が単一であるべき業務は含めない） */
  allowBoth: boolean
}

const DUTIES: DutyDef[] = [
  { key: 'guestRequests', emoji: '🛎️', name: 'ゲストリクエスト対応',
    desc: 'タオル・アメニティ等のリクエストへの一次対応', allowBoth: false },
  { key: 'guestChat', emoji: '💬', name: 'ゲストメッセージ対応',
    desc: 'ゲストからの直接メッセージへの返信', allowBoth: false },
  { key: 'cleaning', emoji: '🧹', name: '清掃',
    desc: 'チェックアウト後の清掃チェックリスト管理', allowBoth: false },
  { key: 'maintenance', emoji: '🔧', name: 'メンテナンス',
    desc: '設備の不具合対応・修繕スケジュール管理', allowBoth: false },
  { key: 'bookings', emoji: '📅', name: '予約管理',
    desc: '予約の登録・編集・招待リンクの発行', allowBoth: true },
  { key: 'experienceConfig', emoji: '✨', name: 'ゲスト体験機能の構成',
    desc: '体験機能のオン/オフ・パラメータ調整', allowBoth: true },
  { key: 'placesEditing', emoji: '📍', name: 'おすすめスポット編集',
    desc: '周辺マップに表示するスポットの管理', allowBoth: true },
]

type PresetId = 'full' | 'onsite' | 'ownerDirect'

const PRESETS: { id: PresetId; name: string; desc: string; build: () => ServiceScope }[] = [
  {
    id: 'full', name: 'フル委託', desc: '運営業務を管理会社へ全面委託',
    build: () => ({ ...DEFAULT_SERVICE_SCOPE }),
  },
  {
    id: 'onsite', name: '清掃・現場のみ', desc: '現場作業だけ委託、ゲスト対応はオーナー',
    build: () => ({
      guestRequests: 'owner', guestChat: 'owner',
      cleaning: 'manager', maintenance: 'manager',
      bookings: 'both', experienceConfig: 'owner', placesEditing: 'owner',
    }),
  },
  {
    id: 'ownerDirect', name: 'オーナー直営', desc: '全業務をオーナーが直接運営',
    build: () => ({
      guestRequests: 'owner', guestChat: 'owner',
      cleaning: 'owner', maintenance: 'owner',
      bookings: 'owner', experienceConfig: 'owner', placesEditing: 'owner',
    }),
  },
]

function matchesPreset(scope: ServiceScope, preset: ServiceScope): boolean {
  return DUTIES.every(d => scope[d.key] === preset[d.key])
}

const ASSIGNEE_LABEL: Record<DutyAssignee, string> = {
  manager: '管理会社',
  owner: 'オーナー',
  both: '両方',
}

export default function ServiceScopePanel() {
  const [store, update] = useStore()
  const scope = scopeOf(store)
  const [savedPulse, setSavedPulse] = useState(false)
  const pulseRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => { if (pulseRef.current) clearTimeout(pulseRef.current) }
  }, [])

  const save = (next: ServiceScope) => {
    update({ serviceScope: next })
    setSavedPulse(true)
    if (pulseRef.current) clearTimeout(pulseRef.current)
    pulseRef.current = setTimeout(() => setSavedPulse(false), 1600)
  }

  const setDuty = (key: DutyKey, value: DutyAssignee) => save({ ...scope, [key]: value })

  const delegatedCount = DUTIES.filter(d => scope[d.key] === 'manager' || scope[d.key] === 'both').length
  const activePreset = PRESETS.find(p => matchesPreset(scope, p.build()))?.id ?? null

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-1">
        <h2 className="text-sm font-medium text-zinc-200 flex items-center gap-2">
          <Handshake size={14} className="text-blue-400" />
          委託サービス範囲
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
          <span className="text-[11px] text-zinc-500 tabular-nums">{delegatedCount}/{DUTIES.length} 委託中</span>
        </div>
      </div>
      <p className="text-xs text-zinc-400 leading-relaxed mb-4">
        管理会社に委託する業務を業務単位で設定できます。両ポータルの表示・通知バッジが担当に合わせて自動で切り替わります。
        委託中でも、オーナーは常に全てのデータを閲覧・操作できます。
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
                  ? 'border-blue-500/40 bg-blue-500/10'
                  : 'border-zinc-700 hover:border-zinc-600'
              }`}
            >
              <p className={`text-xs font-semibold ${isActive ? 'text-blue-300' : 'text-zinc-200'}`}>{name}</p>
              <p className="text-[11px] text-zinc-500 mt-0.5 leading-snug">{desc}</p>
            </button>
          )
        })}
      </div>

      {/* Duty rows */}
      <div className="space-y-1.5">
        {DUTIES.map(duty => {
          const value = scope[duty.key]
          const options: DutyAssignee[] = duty.allowBoth
            ? ['manager', 'owner', 'both']
            : ['manager', 'owner']
          return (
            <div key={duty.key}
                 className="rounded-xl border border-zinc-700/80 bg-zinc-800/40 px-3.5 py-3">
              <div className="flex items-start gap-2.5 mb-2.5">
                <span className="text-base leading-none mt-0.5">{duty.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-zinc-100">{duty.name}</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5 leading-snug">{duty.desc}</p>
                </div>
              </div>
              <div className="flex gap-1.5">
                {options.map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setDuty(duty.key, opt)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      value === opt
                        ? opt === 'owner'
                          ? 'border-zinc-500 bg-zinc-700/60 text-zinc-100'
                          : 'border-blue-500/40 bg-blue-500/10 text-blue-300'
                        : 'border-zinc-700 text-zinc-500 hover:border-zinc-600'
                    }`}
                  >
                    {ASSIGNEE_LABEL[opt]}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
