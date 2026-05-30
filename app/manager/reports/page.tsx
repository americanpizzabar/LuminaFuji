'use client'

import { motion } from 'framer-motion'
import { useStore } from '@/lib/useStore'
import { getRevenueStats } from '@/lib/store'
import { BarChart2, TrendingUp, CheckSquare, Wrench, Calendar } from 'lucide-react'

export default function ManagerReportsPage() {
  const [store] = useStore()
  const revenue = getRevenueStats(store)

  const checklist = store.cleaningChecklist
  const totalTasks = checklist.length
  const completedTasks = checklist.filter(t => t.done).length

  const allMaint = store.maintenanceItems
  const openMaint = allMaint.filter(m => m.status === 'open').length
  const doneMaint = allMaint.filter(m => m.status === 'done').length
  const urgentMaint = allMaint.filter(m => m.status !== 'done' && m.priority === 'urgent').length

  // Occupancy by month
  const monthStats: Record<string, { bookings: number; nights: number; revenue: number }> = {}
  store.bookingHistory.forEach(b => {
    if (b.status === 'cancelled') return
    const month = b.checkIn.slice(0, 7)
    if (!monthStats[month]) monthStats[month] = { bookings: 0, nights: 0, revenue: 0 }
    monthStats[month].bookings++
    monthStats[month].nights += b.nights
    monthStats[month].revenue += b.revenue
  })
  const months = Object.entries(monthStats).sort(([a], [b]) => a.localeCompare(b))
  const maxNights = Math.max(...months.map(([, v]) => v.nights), 1)

  // Platform stats
  const platformStats: Record<string, number> = {}
  store.bookingHistory.forEach(b => {
    if (b.status !== 'cancelled') {
      platformStats[b.platform] = (platformStats[b.platform] || 0) + 1
    }
  })

  // Cleaning completion rate by area
  const areaStats: Record<string, { total: number; done: number }> = {}
  checklist.forEach(t => {
    if (!areaStats[t.area]) areaStats[t.area] = { total: 0, done: 0 }
    areaStats[t.area].total++
    if (t.done) areaStats[t.area].done++
  })

  const AREA_LABELS: Record<string, string> = {
    living: 'リビング', bedroom: '寝室', bathroom: 'バスルーム',
    kitchen: 'キッチン', entrance: '玄関', outdoor: '庭・デッキ',
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div>
        <h1 className="text-xl font-medium text-zinc-100">レポート</h1>
        <p className="text-sm text-zinc-300 mt-0.5">稼働率・清掃・メンテナンス集計</p>
      </div>

      {/* KPI overview */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: '総売上', value: `¥${(revenue.totalRevenue / 10000).toFixed(1)}万`, sub: `${revenue.bookingCount}組`, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
          { label: '平均単価/泊', value: `¥${revenue.avgPerNight.toLocaleString()}`, sub: `${revenue.totalNights}泊`, icon: Calendar, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
          { label: '清掃完了率', value: `${totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%`, sub: `${completedTasks}/${totalTasks}項目`, icon: CheckSquare, color: 'text-teal-400', bg: 'bg-teal-500/10 border-teal-500/20' },
          { label: 'メンテ未対応', value: `${openMaint}件`, sub: urgentMaint > 0 ? `急ぎ${urgentMaint}件` : `完了${doneMaint}件`, icon: Wrench, color: urgentMaint > 0 ? 'text-red-400' : 'text-amber-400', bg: urgentMaint > 0 ? 'bg-red-500/10 border-red-500/20' : 'bg-amber-500/10 border-amber-500/20' },
        ].map(({ label, value, sub, icon: Icon, color, bg }) => (
          <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className={`w-8 h-8 rounded-xl border flex items-center justify-center mb-2 ${bg}`}>
              <Icon size={15} className={color} />
            </div>
            <p className="text-lg font-light text-zinc-100">{value}</p>
            <p className="text-xs text-zinc-400">{label}</p>
            <p className="text-xs text-zinc-300">{sub}</p>
          </div>
        ))}
      </div>

      {/* Monthly occupancy chart */}
      {months.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <h2 className="text-sm font-medium text-zinc-200 flex items-center gap-2 mb-4">
            <BarChart2 size={14} className="text-teal-400" /> 月別稼働泊数
          </h2>
          <div className="flex items-end gap-2 h-24">
            {months.map(([month, stats]) => (
              <div key={month} className="flex-1 flex flex-col items-center gap-1">
                <p className="text-[11px] text-zinc-300">{stats.nights}泊</p>
                <div className="w-full bg-teal-500/10 border border-teal-500/20 rounded-t" style={{ height: `${Math.max(4, Math.round((stats.nights / maxNights) * 64))}px` }}>
                  <div className="w-full h-full bg-teal-500/40 rounded-t" />
                </div>
                <p className="text-[11px] text-zinc-400">{month.slice(5)}月</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Platform breakdown */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <h2 className="text-sm font-medium text-zinc-200 mb-4">予約経路</h2>
        <div className="space-y-3">
          {Object.entries(platformStats).map(([platform, count]) => {
            const total = Object.values(platformStats).reduce((s, v) => s + v, 0)
            const pct = Math.round((count / total) * 100)
            return (
              <div key={platform}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-zinc-300">{platform}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-300">{count}件</span>
                    <span className="text-xs text-zinc-400 font-medium">{pct}%</span>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-500/60 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Cleaning by area */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <h2 className="text-sm font-medium text-zinc-200 flex items-center gap-2 mb-4">
          <CheckSquare size={14} className="text-teal-400" /> エリア別清掃状況
        </h2>
        <div className="space-y-3">
          {Object.entries(areaStats).map(([areaKey, stats]) => {
            const pct = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0
            return (
              <div key={areaKey} className="flex items-center gap-3">
                <span className="text-sm w-4">{['🛋️', '🛏️', '🚿', '🍳', '🚪', '🌿'][Object.keys(AREA_LABELS).indexOf(areaKey)] ?? '📦'}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-zinc-400">{AREA_LABELS[areaKey] ?? areaKey}</span>
                    <span className={`text-xs ${pct === 100 ? 'text-emerald-400' : 'text-zinc-300'}`}>{stats.done}/{stats.total}</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${pct === 100 ? 'bg-emerald-500' : 'bg-teal-500/50'}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Maintenance summary */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <h2 className="text-sm font-medium text-zinc-200 flex items-center gap-2 mb-4">
          <Wrench size={14} className="text-amber-400" /> メンテナンスサマリー
        </h2>
        {allMaint.length === 0 ? (
          <p className="text-zinc-400 text-sm text-center py-4">案件なし</p>
        ) : (
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { label: '未着手', value: openMaint, color: 'text-red-400' },
              { label: '予定済', value: allMaint.filter(m => m.status === 'scheduled').length, color: 'text-blue-400' },
              { label: '完了', value: doneMaint, color: 'text-emerald-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-zinc-800/50 rounded-xl p-3">
                <p className={`text-xl font-light ${color}`}>{value}</p>
                <p className="text-xs text-zinc-300 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
