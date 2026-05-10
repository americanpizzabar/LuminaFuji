'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, CalendarCheck, TrendingUp, Lightbulb, ChevronRight, Star } from 'lucide-react'
import Link from 'next/link'
import { usePhase, GuestPhase } from '@/lib/phase'

const mockBookings = [
  { id: 'LF-0510', name: 'Yamada Taro', checkIn: '2026-05-10', checkOut: '2026-05-12', status: 'staying', country: '🇯🇵' },
  { id: 'LF-0515', name: 'Thomas K.', checkIn: '2026-05-15', checkOut: '2026-05-18', status: 'upcoming', country: '🇩🇪' },
  { id: 'LF-0520', name: '李 偉', checkIn: '2026-05-20', checkOut: '2026-05-22', status: 'upcoming', country: '🇨🇳' },
  { id: 'LF-0501', name: 'Emma L.', checkIn: '2026-05-01', checkOut: '2026-05-03', status: 'completed', country: '🇬🇧' },
  { id: 'LF-0425', name: '田中 拓也', checkIn: '2026-04-25', checkOut: '2026-04-27', status: 'completed', country: '🇯🇵' },
]

const stats = [
  { label: '今月の宿泊数', value: '8', unit: '泊', icon: CalendarCheck, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  { label: '稼働率', value: '73', unit: '%', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  { label: '累計ゲスト', value: '42', unit: '組', icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  { label: '相談問い合わせ', value: '5', unit: '件', icon: Star, color: 'text-gold-400', bg: 'bg-gold-500/10 border-gold-500/20' },
]

const phaseLabels: Record<GuestPhase, { label: string; color: string; desc: string }> = {
  booked: { label: '予約済', color: 'text-blue-400 border-blue-500/30 bg-blue-500/10', desc: 'チェックイン前モード' },
  staying: { label: '滞在中', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10', desc: '照明操作・コンシェルジュ有効' },
  post: { label: '滞在後', color: 'text-gold-400 border-gold-500/30 bg-gold-500/10', desc: 'ECUANEST製品提案モード' },
}

export default function OwnerDashboardPage() {
  const { phase, setPhase } = usePhase()
  const [phaseMsg, setPhaseMsg] = useState('')

  const changePhase = (p: GuestPhase) => {
    setPhase(p)
    setPhaseMsg(`ゲスト画面を「${phaseLabels[p].label}」に変更しました`)
    setTimeout(() => setPhaseMsg(''), 3000)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <div className="mb-6">
        <h1 className="text-xl font-medium text-zinc-100">ダッシュボード</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Lumina Fuji Residence Yamanakako</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {stats.map(({ label, value, unit, icon: Icon, color, bg }) => (
          <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className={`w-9 h-9 rounded-xl border flex items-center justify-center mb-3 ${bg}`}>
              <Icon size={16} className={color} />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-light text-zinc-100">{value}</span>
              <span className="text-xs text-zinc-500">{unit}</span>
            </div>
            <p className="text-xs text-zinc-600 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Guest Phase Control */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-4">
        <div className="flex items-center gap-2 mb-1">
          <Lightbulb size={15} className="text-gold-400" />
          <h2 className="text-sm font-medium text-zinc-200">ゲスト体験フェーズの切り替え</h2>
        </div>
        <p className="text-xs text-zinc-500 mb-4">
          現在：<span className={`px-2 py-0.5 rounded-full border text-xs ${phaseLabels[phase].color}`}>{phaseLabels[phase].label}</span>
          　{phaseLabels[phase].desc}
        </p>
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(phaseLabels) as GuestPhase[]).map((p) => (
            <button
              key={p}
              onClick={() => changePhase(p)}
              className={`py-2.5 rounded-xl border text-xs font-medium transition-all ${
                phase === p
                  ? phaseLabels[p].color
                  : 'border-zinc-700 text-zinc-500 hover:border-zinc-600'
              }`}
            >
              {phaseLabels[p].label}
            </button>
          ))}
        </div>
        {phaseMsg && (
          <p className="text-xs text-emerald-400 mt-2 text-center">{phaseMsg}</p>
        )}
      </div>

      {/* Current Guest */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-4">
        <h2 className="text-sm font-medium text-zinc-200 mb-4">予約一覧</h2>
        <div className="space-y-3">
          {mockBookings.map((booking) => (
            <div key={booking.id} className="flex items-center gap-3 py-2 border-b border-zinc-800 last:border-0">
              <span className="text-xl flex-shrink-0">{booking.country}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-zinc-200 truncate">{booking.name}</p>
                <p className="text-xs text-zinc-500">{booking.checkIn} → {booking.checkOut}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full border flex-shrink-0 ${
                booking.status === 'staying'
                  ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                  : booking.status === 'upcoming'
                  ? 'text-blue-400 border-blue-500/30 bg-blue-500/10'
                  : 'text-zinc-500 border-zinc-700 bg-zinc-800'
              }`}>
                {booking.status === 'staying' ? '滞在中' : booking.status === 'upcoming' ? '予約済' : '完了'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/owner/consults" className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 hover:border-zinc-700 transition-all flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-200">相談リクエスト</p>
            <p className="text-xs text-zinc-500 mt-0.5">未対応 3件</p>
          </div>
          <ChevronRight size={16} className="text-zinc-600" />
        </Link>
        <Link href="/owner/guestbook" className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 hover:border-zinc-700 transition-all flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-200">寄せ書き</p>
            <p className="text-xs text-zinc-500 mt-0.5">最新 5件</p>
          </div>
          <ChevronRight size={16} className="text-zinc-600" />
        </Link>
      </div>
    </motion.div>
  )
}
