'use client'

/**
 * 今日のゲスト・ブリーフィング（思いやり情報）。
 * ゲストがアプリに残したシグナル（到着時のコンディション・明朝の起床予定・
 * お気に入りエリア・よく使うシーン）を、担当スタッフのダッシュボードに
 * 「おもてなしのヒント」として一枚のカードで届ける。
 *
 * 例: 起床予定 6:30 → 「〜7:00 までは清掃・大きな物音を控える」
 */

import { HeartHandshake } from 'lucide-react'
import { useStore } from '@/lib/useStore'
import { getZoneAnalytics, getLightingAnalytics } from '@/lib/store'
import type { ArrivalMode } from '@/lib/store'

const ZONE_LABELS: Record<string, string> = {
  living: 'リビング', bedroom: '寝室', bathroom: 'バスルーム', entrance: 'エントランス',
}

const ARRIVAL_INFO: Record<ArrivalMode, { label: string; emoji: string; hint: string }> = {
  rest: {
    label: 'ヘトヘト（旅の疲れ）', emoji: '😮‍💨',
    hint: '静かなご案内を。詳しい説明は求められるまで控えめに',
  },
  refresh: {
    label: '時差ぼけ', emoji: '😴',
    hint: '朝型のサポートを。午前の連絡・提案が響きやすい',
  },
  explore: {
    label: '元気いっぱい', emoji: '✨',
    hint: 'アクティビティや周辺スポットの提案が喜ばれやすい',
  },
}

const PLAN_LABELS: Record<string, string> = {
  sport: 'スポーツ・ハイキング', leisure: 'ゆっくりした朝', work: '仕事・リモートワーク',
}

/** "HH:MM" に分を加算して "HH:MM" を返す */
function addMinutes(time: string, mins: number): string {
  const [h, m] = time.split(':').map(Number)
  const total = ((h * 60 + m + mins) % (24 * 60) + 24 * 60) % (24 * 60)
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

export default function GuestBriefingCard({ accent = 'teal' }: { accent?: 'blue' | 'teal' }) {
  const [store] = useStore()
  const staying = store.bookingHistory.find(b => b.status === 'staying')
  if (!staying) return null

  const accentText = accent === 'blue' ? 'text-blue-400' : 'text-teal-400'
  const arrival = store.arrivalMode ? ARRIVAL_INFO[store.arrivalMode] : null
  const alarm = store.lightAlarm?.enabled ? store.lightAlarm : null
  const { topZoneId, topZoneCount } = getZoneAnalytics(store)
  const { topScene, totalEvents } = getLightingAnalytics(store)

  const engagementTotal = Object.values(store.featureEngagement ?? {}).reduce((s, v) => s + v, 0)
  const engagementLevel = engagementTotal >= 5 ? '高' : engagementTotal >= 1 ? '中' : '低'
  const engagementColor = engagementTotal >= 5 ? '#34d399' : engagementTotal >= 1 ? '#fbbf24' : '#71717a'

  const rows: { emoji: string; label: string; value: string; hint?: string }[] = []

  rows.push(arrival
    ? { emoji: arrival.emoji, label: '到着コンディション', value: arrival.label, hint: arrival.hint }
    : { emoji: '🤍', label: '到着コンディション', value: '未回答', hint: 'チェックイン時の様子から汲み取りを' })

  if (alarm) {
    rows.push({
      emoji: '🌅', label: '明朝の起床予定',
      value: `${alarm.time} · ${PLAN_LABELS[alarm.plan] ?? alarm.plan}`,
      hint: `〜${addMinutes(alarm.time, 30)} までは清掃・大きな物音を控える`,
    })
  }

  if (topZoneId && topZoneCount > 0) {
    rows.push({
      emoji: '🛋️', label: 'お気に入りエリア',
      value: `${ZONE_LABELS[topZoneId] ?? topZoneId}（操作 ${topZoneCount}回）`,
    })
  }

  if (topScene) {
    rows.push({
      emoji: '💡', label: 'よく使うシーン',
      value: `${topScene.name}（${topScene.count}回 / 全${totalEvents}回）`,
    })
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-zinc-200 flex items-center gap-2">
          <HeartHandshake size={14} className={accentText} />
          今日のゲスト — {staying.flag} {staying.guestName}
        </h2>
        <span className="flex items-center gap-1.5 text-[11px] text-zinc-400">
          体験エンゲージメント
          <span className="flex items-center gap-1 font-medium" style={{ color: engagementColor }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: engagementColor }} />
            {engagementLevel}
          </span>
        </span>
      </div>

      <div className="space-y-2">
        {rows.map(row => (
          <div key={row.label} className="flex items-start gap-3 rounded-xl px-3 py-2.5"
               style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <span className="text-base leading-none mt-0.5">{row.emoji}</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2 flex-wrap">
                <p className="text-[11px] text-zinc-500">{row.label}</p>
                <p className="text-xs text-zinc-200 font-medium">{row.value}</p>
              </div>
              {row.hint && (
                <p className="text-[11px] mt-1 leading-snug" style={{ color: '#d4a94e' }}>
                  💡 {row.hint}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
