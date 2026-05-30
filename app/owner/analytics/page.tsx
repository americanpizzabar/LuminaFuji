'use client'

import { motion } from 'framer-motion'
import {
  BarChart2, TrendingUp, Lightbulb, Users,
  DollarSign, Globe, Calendar, Star,
} from 'lucide-react'
import { useStore } from '@/lib/useStore'
import { getRevenueStats, getLightingAnalytics } from '@/lib/store'

const productLabels: Record<string, string> = {
  'brite-3':      'Brite 3',
  'luna-series':  'Luna Series',
  'aria-strip':   'Aria Strip',
  'nexus-module': 'Nexus Module',
}

const MOCK_MONTHLY_REVENUE: { month: string; revenue: number }[] = [
  { month: '1月', revenue: 0 },
  { month: '2月', revenue: 0 },
  { month: '3月', revenue: 96000 },
  { month: '4月', revenue: 144000 },
  { month: '5月', revenue: 219000 },
]

function BarChartRow({
  label,
  value,
  max,
  color,
  suffix = '',
}: {
  label: string
  value: number
  max: number
  color: string
  suffix?: string
}) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-zinc-300 w-20 flex-shrink-0 text-right truncate">{label}</span>
      <div className="flex-1 h-5 bg-zinc-800 rounded-lg overflow-hidden relative">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className={`h-full rounded-lg ${color}`}
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-zinc-300 font-medium">
          {value > 0 ? `${value}${suffix}` : '–'}
        </span>
      </div>
    </div>
  )
}

function MonthlyBarChart({ data }: { data: typeof MOCK_MONTHLY_REVENUE }) {
  const maxRevenue = Math.max(...data.map(d => d.revenue), 1)
  return (
    <div className="flex items-end gap-2 h-28 pt-2">
      {data.map(({ month, revenue }) => {
        const pct = (revenue / maxRevenue) * 100
        return (
          <div key={month} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex items-end justify-center" style={{ height: '80px' }}>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(pct, revenue > 0 ? 8 : 0)}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                style={{ height: `${pct}%`, minHeight: revenue > 0 ? '8px' : '0' }}
                className={`w-full rounded-t-lg ${revenue > 0 ? 'bg-blue-500/60' : 'bg-zinc-800'}`}
              />
            </div>
            <span className="text-[11px] text-zinc-400">{month}</span>
            {revenue > 0 && (
              <span className="text-[11px] text-zinc-300">¥{(revenue / 1000).toFixed(0)}k</span>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function AnalyticsPage() {
  const [store] = useStore()

  const revenueStats = getRevenueStats(store)
  const lightingAnalytics = getLightingAnalytics(store)

  // Platform breakdown
  const platformCounts: Record<string, number> = {}
  store.bookingHistory.forEach(b => {
    const key = b.platform
    platformCounts[key] = (platformCounts[key] || 0) + 1
  })
  const totalBookings = store.bookingHistory.length
  const maxPlatform = Math.max(...Object.values(platformCounts), 1)

  // ECUANEST product interest
  const productCounts: Record<string, number> = {}
  store.consultRequests.forEach(cr => {
    cr.interestedProducts.forEach(pid => {
      productCounts[pid] = (productCounts[pid] || 0) + 1
    })
  })
  const maxProduct = Math.max(...Object.values(productCounts), 1)

  // Nationality breakdown
  const nationalityCounts: Record<string, { count: number; flag: string }> = {}
  store.bookingHistory.forEach(b => {
    if (!nationalityCounts[b.nationality]) {
      nationalityCounts[b.nationality] = { count: 0, flag: b.flag }
    }
    nationalityCounts[b.nationality].count++
  })
  const nationalities = Object.entries(nationalityCounts)
    .sort(([, a], [, b]) => b.count - a.count)
  const maxNationality = Math.max(...nationalities.map(([, v]) => v.count), 1)

  // Scene chart
  const sceneEntries = Object.entries(lightingAnalytics.sceneCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
  const maxScene = sceneEntries.length > 0 ? sceneEntries[0][1] : 1

  // Monthly data (combine mock with booking history)
  const monthlyData = MOCK_MONTHLY_REVENUE.map(row => {
    const month = row.month
    const fromHistory = store.bookingHistory
      .filter(b => {
        const d = new Date(b.checkIn)
        const monthNames = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']
        return monthNames[d.getMonth()] === month
      })
      .reduce((sum, b) => sum + b.revenue, 0)
    return { month, revenue: fromHistory > 0 ? fromHistory : row.revenue }
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-5"
    >
      {/* Header */}
      <div>
        <h1 className="text-xl font-medium text-zinc-100">分析ダッシュボード</h1>
        <p className="text-sm text-zinc-300 mt-0.5">売上・照明・予約・リード分析</p>
      </div>

      {/* Revenue KPI cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <div className="flex items-center gap-1.5 mb-2">
            <DollarSign size={13} className="text-blue-400" />
            <p className="text-[11px] text-zinc-300 uppercase tracking-wider">総売上</p>
          </div>
          <p className="text-2xl font-light text-zinc-100">
            ¥{(revenueStats.totalRevenue / 10000).toFixed(1)}<span className="text-sm text-zinc-300 ml-1">万</span>
          </p>
          <p className="text-[11px] text-zinc-400 mt-1">{revenueStats.bookingCount}件の予約</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingUp size={13} className="text-emerald-400" />
            <p className="text-[11px] text-zinc-300 uppercase tracking-wider">平均単価/泊</p>
          </div>
          <p className="text-2xl font-light text-zinc-100">
            ¥{revenueStats.avgPerNight.toLocaleString()}
          </p>
          <p className="text-[11px] text-zinc-400 mt-1">累計{revenueStats.totalNights}泊</p>
        </div>
      </div>

      {/* Monthly revenue chart */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart2 size={14} className="text-blue-400" />
          <h2 className="text-sm font-medium text-zinc-200">月別売上</h2>
          <span className="text-xs text-zinc-400 ml-auto">2026年</span>
        </div>
        <MonthlyBarChart data={monthlyData} />
      </div>

      {/* Lighting analytics */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb size={14} className="text-amber-400" />
          <h2 className="text-sm font-medium text-zinc-200">照明使用分析</h2>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-zinc-800/50 rounded-xl p-3">
            <p className="text-[11px] text-zinc-300 mb-1">トップシーン</p>
            <p className="text-sm font-medium text-amber-400">
              {lightingAnalytics.topScene ? lightingAnalytics.topScene.name : '—'}
            </p>
            {lightingAnalytics.topScene && (
              <p className="text-[11px] text-zinc-400 mt-0.5">{lightingAnalytics.topScene.count}回使用</p>
            )}
          </div>
          <div className="bg-zinc-800/50 rounded-xl p-3">
            <p className="text-[11px] text-zinc-300 mb-1">総イベント数</p>
            <p className="text-sm font-medium text-zinc-200">{lightingAnalytics.totalEvents}</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">照明操作ログ</p>
          </div>
        </div>

        {sceneEntries.length > 0 ? (
          <div className="space-y-2">
            <p className="text-[11px] text-zinc-300 uppercase tracking-wider mb-2">シーン頻度</p>
            {sceneEntries.map(([name, count]) => (
              <BarChartRow
                key={name}
                label={name}
                value={count}
                max={maxScene}
                color="bg-amber-500/60"
                suffix="回"
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-zinc-400 text-xs">
            照明履歴データがありません
          </div>
        )}
      </div>

      {/* Booking platform breakdown */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Calendar size={14} className="text-purple-400" />
          <h2 className="text-sm font-medium text-zinc-200">予約プラットフォーム</h2>
          <span className="text-xs text-zinc-400 ml-auto">全{totalBookings}件</span>
        </div>

        {totalBookings === 0 ? (
          <p className="text-center text-zinc-400 text-xs py-4">予約データがありません</p>
        ) : (
          <div className="space-y-2">
            {Object.entries(platformCounts)
              .sort(([, a], [, b]) => b - a)
              .map(([platform, count]) => {
                const pct = totalBookings > 0 ? Math.round((count / totalBookings) * 100) : 0
                const colorMap: Record<string, string> = {
                  Airbnb: 'bg-rose-500/60',
                  'Booking.com': 'bg-blue-500/60',
                  direct: 'bg-emerald-500/60',
                }
                const color = colorMap[platform] ?? 'bg-zinc-500/60'
                const labelMap: Record<string, string> = {
                  Airbnb: 'Airbnb',
                  'Booking.com': 'Booking.com',
                  direct: 'ダイレクト',
                }
                return (
                  <BarChartRow
                    key={platform}
                    label={labelMap[platform] ?? platform}
                    value={count}
                    max={maxPlatform}
                    color={color}
                    suffix={`件 (${pct}%)`}
                  />
                )
              })}
          </div>
        )}
      </div>

      {/* ECUANEST product interest */}
      <div className="bg-zinc-900 border border-amber-500/10 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Star size={14} className="text-amber-400" />
          <h2 className="text-sm font-medium text-zinc-200">ECUANEST 製品への関心</h2>
        </div>

        {Object.keys(productCounts).length === 0 ? (
          <p className="text-center text-zinc-400 text-xs py-4">コンサルリクエストがありません</p>
        ) : (
          <div className="space-y-2">
            {Object.entries(productCounts)
              .sort(([, a], [, b]) => b - a)
              .map(([pid, count]) => (
                <BarChartRow
                  key={pid}
                  label={productLabels[pid] ?? pid}
                  value={count}
                  max={maxProduct}
                  color="bg-amber-500/60"
                  suffix="件"
                />
              ))}
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center justify-between text-xs">
          <span className="text-zinc-300">総リクエスト数</span>
          <span className="text-zinc-300 font-medium">{store.consultRequests.length}件</span>
        </div>
      </div>

      {/* Guest nationality breakdown */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Globe size={14} className="text-teal-400" />
          <h2 className="text-sm font-medium text-zinc-200">ゲスト国籍</h2>
        </div>

        {nationalities.length === 0 ? (
          <p className="text-center text-zinc-400 text-xs py-4">予約データがありません</p>
        ) : (
          <div className="space-y-2">
            {nationalities.map(([nationality, { count, flag }]) => (
              <div key={nationality} className="flex items-center gap-3">
                <span className="text-base w-6 flex-shrink-0">{flag}</span>
                <span className="text-xs text-zinc-300 w-16 flex-shrink-0 truncate">{nationality}</span>
                <div className="flex-1 h-5 bg-zinc-800 rounded-lg overflow-hidden relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(count / maxNationality) * 100}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="h-full bg-teal-500/50 rounded-lg"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-zinc-300 font-medium">
                    {count}件
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lead funnel */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Users size={14} className="text-violet-400" />
          <h2 className="text-sm font-medium text-zinc-200">リードファネル</h2>
        </div>

        {(() => {
          const statuses: Array<{ key: string; label: string; color: string }> = [
            { key: 'new',       label: '新着',   color: 'bg-red-500/60' },
            { key: 'contacted', label: '連絡済', color: 'bg-amber-500/60' },
            { key: 'quoted',    label: '見積済', color: 'bg-blue-500/60' },
            { key: 'won',       label: '受注',   color: 'bg-emerald-500/60' },
            { key: 'lost',      label: '失注',   color: 'bg-zinc-600/60' },
          ]
          const counts = statuses.map(s => ({
            ...s,
            count: store.consultRequests.filter(r => r.status === s.key).length,
          }))
          const maxCount = Math.max(...counts.map(c => c.count), 1)

          return (
            <div className="space-y-2">
              {counts.map(({ key, label, color, count }) => (
                <BarChartRow
                  key={key}
                  label={label}
                  value={count}
                  max={maxCount}
                  color={color}
                  suffix="件"
                />
              ))}
            </div>
          )
        })()}
      </div>
    </motion.div>
  )
}
