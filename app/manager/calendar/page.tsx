'use client'

import { motion } from 'framer-motion'
import { useStore } from '@/lib/useStore'
import { Calendar, ChevronLeft, ChevronRight, Users, Clock } from 'lucide-react'
import { useState } from 'react'

const STATUS_CONFIG = {
  confirmed: { label: '予約済', color: 'bg-blue-500/80', text: 'text-blue-400', border: 'border-blue-500/30' },
  staying: { label: '滞在中', color: 'bg-emerald-500/80', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  completed: { label: '完了', color: 'bg-zinc-600/80', text: 'text-zinc-500', border: 'border-zinc-700' },
  cancelled: { label: 'キャンセル', color: 'bg-red-500/80', text: 'text-red-400', border: 'border-red-500/30' },
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}
function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

export default function ManagerCalendarPage() {
  const [store] = useStore()
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDay = getFirstDayOfWeek(viewYear, viewMonth)

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  const monthStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`

  // Build day occupation map
  const dayMap: Record<number, typeof store.bookingHistory[0][]> = {}
  store.bookingHistory.forEach(b => {
    if (b.status === 'cancelled') return
    const start = new Date(b.checkIn)
    const end = new Date(b.checkOut)
    for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
      const dYear = d.getFullYear()
      const dMonth = d.getMonth()
      if (dYear === viewYear && dMonth === viewMonth) {
        const day = d.getDate()
        if (!dayMap[day]) dayMap[day] = []
        dayMap[day].push(b)
      }
    }
  })

  const monthBookings = store.bookingHistory.filter(b => {
    return (b.checkIn.startsWith(monthStr) || b.checkOut.startsWith(monthStr)) && b.status !== 'cancelled'
  })

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div>
        <h1 className="text-xl font-medium text-zinc-100">予約カレンダー</h1>
        <p className="text-sm text-zinc-500 mt-0.5">月別の予約・稼働状況</p>
      </div>

      {/* Calendar header */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-all">
            <ChevronLeft size={15} className="text-zinc-400" />
          </button>
          <h2 className="text-sm font-medium text-zinc-200">
            {viewYear}年 {viewMonth + 1}月
          </h2>
          <button onClick={nextMonth} className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-all">
            <ChevronRight size={15} className="text-zinc-400" />
          </button>
        </div>

        {/* Day of week headers */}
        <div className="grid grid-cols-7 mb-1">
          {['日', '月', '火', '水', '木', '金', '土'].map((d, i) => (
            <div key={d} className={`text-center text-[10px] py-1 ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-zinc-500'}`}>{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-px">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const isToday = viewYear === today.getFullYear() && viewMonth === today.getMonth() && day === today.getDate()
            const bookings = dayMap[day] || []
            const isOccupied = bookings.length > 0
            const booking = bookings[0]
            return (
              <div key={day} className={`aspect-square flex flex-col items-center justify-start pt-1 rounded-lg relative ${isOccupied ? 'bg-teal-500/10 border border-teal-500/20' : ''}`}>
                <span className={`text-[11px] font-medium leading-none ${isToday ? 'w-5 h-5 rounded-full bg-teal-500 text-zinc-950 flex items-center justify-center' : isOccupied ? 'text-teal-300' : 'text-zinc-400'}`}>
                  {day}
                </span>
                {booking && (
                  <span className="text-[9px] leading-none mt-0.5 truncate w-full text-center px-0.5">{booking.flag}</span>
                )}
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-zinc-800">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-teal-500/20 border border-teal-500/30" />
            <span className="text-[10px] text-zinc-500">予約あり</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-teal-500" />
            <span className="text-[10px] text-zinc-500">今日</span>
          </div>
        </div>
      </div>

      {/* This month's bookings */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <h2 className="text-sm font-medium text-zinc-200 flex items-center gap-2 mb-4">
          <Calendar size={14} className="text-teal-400" /> {viewMonth + 1}月の予約
          {monthBookings.length > 0 && (
            <span className="text-xs text-teal-400 bg-teal-500/10 border border-teal-500/20 px-1.5 py-0.5 rounded-full">{monthBookings.length}件</span>
          )}
        </h2>
        {monthBookings.length === 0 ? (
          <p className="text-zinc-600 text-sm text-center py-6">この月の予約はありません</p>
        ) : (
          <div className="space-y-3">
            {monthBookings.map(b => {
              const cfg = STATUS_CONFIG[b.status]
              return (
                <div key={b.id} className={`flex items-start gap-3 p-3 rounded-xl border ${cfg.border} bg-zinc-800/30`}>
                  <span className="text-2xl flex-shrink-0">{b.flag}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-zinc-200">{b.guestName}</p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${cfg.text} ${cfg.border}`}>{cfg.label}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-zinc-500">
                      <span className="flex items-center gap-1"><Clock size={10} /> {b.checkIn} 〜 {b.checkOut}</span>
                      <span className="flex items-center gap-1"><Users size={10} /> {b.adults + b.children}名</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs">
                      <span className="text-zinc-500">{b.platform}</span>
                      <span className="text-zinc-400">{b.nights}泊 · ¥{b.revenue.toLocaleString()}</span>
                    </div>
                    {b.notes && <p className="text-xs text-zinc-600 mt-1">{b.notes}</p>}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Monthly summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: '予約件数', value: `${monthBookings.filter(b => b.status !== 'cancelled').length}件` },
          { label: '稼働泊数', value: `${monthBookings.reduce((sum, b) => sum + b.nights, 0)}泊` },
          { label: '売上', value: `¥${(monthBookings.reduce((sum, b) => sum + b.revenue, 0) / 10000).toFixed(1)}万` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center">
            <p className="text-lg font-light text-zinc-100">{value}</p>
            <p className="text-xs text-zinc-600 mt-0.5">{label}</p>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
