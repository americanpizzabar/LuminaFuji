'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useStore } from '@/lib/useStore'
import { usePhase } from '@/lib/phase'
import {
  CalendarCheck, TrendingUp, Users, Building2,
  ChevronRight, Bell, MessageSquare, Lightbulb, Send
} from 'lucide-react'
import {
  getRevenueStats, getLightingAnalytics, getUnreadCounts,
  updateServiceRequest, getStore, sendMessage as storeSendMessage
} from '@/lib/store'
import { useState } from 'react'

const phaseConfig = {
  booked: { label: '予約済', color: 'text-blue-400 border-blue-500/30 bg-blue-500/10', desc: 'チェックイン前' },
  staying: { label: '滞在中', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10', desc: '照明・コンシェルジュ有効' },
  post: { label: '滞在後', color: 'text-gold-400 border-gold-500/30 bg-gold-500/10', desc: 'ECUANEST提案モード' },
}

export default function OwnerDashboardPage() {
  const [store, update] = useStore()
  const { phase, setPhase } = usePhase()
  const revenue = getRevenueStats(store)
  const lighting = getLightingAnalytics(store)
  const counts = getUnreadCounts(store)
  const [msgInput, setMsgInput] = useState('')
  const [sending, setSending] = useState(false)

  const currentBooking = store.bookingHistory.find(b => b.status === 'staying')
  const nextBooking = store.bookingHistory.find(b => b.status === 'confirmed')
  const pendingReqs = store.serviceRequests.filter(r => r.status === 'pending')

  const sendOwnerMessage = async () => {
    if (!msgInput.trim()) return
    setSending(true)
    storeSendMessage('owner', msgInput.trim())
    update({ messages: getStore().messages })
    setMsgInput('')
    setSending(false)
  }

  const resolveRequest = (id: string) => {
    updateServiceRequest(id, { status: 'done', resolvedAt: new Date().toISOString() })
    update({ serviceRequests: getStore().serviceRequests })
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium text-zinc-100">オーナーダッシュボード</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Lumina Fuji Residence Yamanakako</p>
        </div>
        {counts.total > 0 && (
          <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/30 text-red-400 text-xs px-3 py-1.5 rounded-xl">
            <Bell size={13} />
            {counts.total}件の要対応
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: '今月売上', value: `¥${(revenue.totalRevenue / 10000).toFixed(0)}万`, sub: `${revenue.bookingCount}組`, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
          { label: '平均単価/泊', value: `¥${revenue.avgPerNight.toLocaleString()}`, sub: `${revenue.totalNights}泊`, icon: CalendarCheck, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
          { label: 'コンサルリード', value: `${store.consultRequests.filter(c => c.status === 'new').length}`, sub: `新着/${store.consultRequests.length}件`, icon: Building2, color: 'text-gold-400', bg: 'bg-gold-500/10 border-gold-500/20' },
          { label: 'ゲストリクエスト', value: `${pendingReqs.length}`, sub: '未対応', icon: Bell, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
        ].map(({ label, value, sub, icon: Icon, color, bg }) => (
          <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className={`w-9 h-9 rounded-xl border flex items-center justify-center mb-3 ${bg}`}>
              <Icon size={16} className={color} />
            </div>
            <p className="text-xl font-light text-zinc-100">{value}</p>
            <p className="text-xs text-zinc-600 mt-0.5">{label}</p>
            <p className="text-xs text-zinc-500">{sub}</p>
          </div>
        ))}
      </div>

      {/* Current guest + phase control */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <h2 className="text-sm font-medium text-zinc-200 mb-4">現在のゲスト</h2>
          {currentBooking ? (
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{currentBooking.flag}</span>
                <div>
                  <p className="font-medium text-zinc-100">{currentBooking.guestName}</p>
                  <p className="text-xs text-zinc-500">{currentBooking.nationality} · {currentBooking.platform}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                <div><p className="text-zinc-500">チェックイン</p><p className="text-zinc-200">{currentBooking.checkIn}</p></div>
                <div><p className="text-zinc-500">チェックアウト</p><p className="text-zinc-200">{currentBooking.checkOut}</p></div>
                <div><p className="text-zinc-500">大人/子供</p><p className="text-zinc-200">{currentBooking.adults}名/{currentBooking.children}名</p></div>
                <div><p className="text-zinc-500">売上</p><p className="text-zinc-200">¥{currentBooking.revenue.toLocaleString()}</p></div>
              </div>
              {/* Message to guest */}
              <div className="border-t border-zinc-800 pt-3">
                <p className="text-xs text-zinc-500 mb-2">ゲストへメッセージ</p>
                <div className="flex gap-2">
                  <input value={msgInput} onChange={e => setMsgInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendOwnerMessage()}
                    placeholder="例：明日の天気は晴れの予報です☀️"
                    className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/40 transition-all" />
                  <button onClick={sendOwnerMessage} disabled={!msgInput.trim() || sending}
                    className="w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-500 flex items-center justify-center transition-all disabled:opacity-50">
                    <Send size={14} className="text-white" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-zinc-600 text-sm">現在ゲストはいません</p>
              {nextBooking && <p className="text-xs text-zinc-500 mt-1">次: {nextBooking.guestName} ({nextBooking.checkIn})</p>}
            </div>
          )}
        </div>

        {/* Phase control */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <h2 className="text-sm font-medium text-zinc-200 mb-1 flex items-center gap-2">
            <Lightbulb size={14} className="text-gold-400" /> ゲスト体験フェーズ
          </h2>
          <p className="text-xs text-zinc-500 mb-4">ゲスト画面の表示内容が即座に切り替わります</p>
          <div className="space-y-2 mb-4">
            {(['booked', 'staying', 'post'] as const).map(p => (
              <button key={p} onClick={() => setPhase(p)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${phase === p ? phaseConfig[p].color : 'border-zinc-700 text-zinc-500 hover:border-zinc-600'}`}>
                <div className={`w-2 h-2 rounded-full ${phase === p ? 'bg-current' : 'bg-zinc-700'}`} />
                <div>
                  <p className="text-sm font-medium">{phaseConfig[p].label}</p>
                  <p className="text-xs opacity-70">{phaseConfig[p].desc}</p>
                </div>
                {phase === p && <span className="ml-auto text-xs">現在</span>}
              </button>
            ))}
          </div>
          {lighting.topScene && (
            <div className="border-t border-zinc-800 pt-3">
              <p className="text-xs text-zinc-500">最多使用シーン</p>
              <p className="text-sm text-zinc-200 mt-0.5">
                {lighting.topScene.name} <span className="text-zinc-500">({lighting.topScene.count}回)</span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Pending service requests */}
      {pendingReqs.length > 0 && (
        <div className="bg-zinc-900 border border-red-500/20 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-zinc-200 flex items-center gap-2">
              <Bell size={14} className="text-red-400" /> 未対応リクエスト
            </h2>
            <span className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 px-2 py-0.5 rounded-full">
              {pendingReqs.length}件
            </span>
          </div>
          <div className="space-y-2">
            {pendingReqs.map(req => (
              <div key={req.id} className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-xl">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-200 font-medium">{req.label}</p>
                  {req.description !== req.label && <p className="text-xs text-zinc-500 mt-0.5 truncate">{req.description}</p>}
                  <p className="text-[10px] text-zinc-600 mt-0.5">
                    {req.priority === 'urgent' && <span className="text-red-400 mr-1">急ぎ ·</span>}
                    {new Date(req.createdAt).toLocaleString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <button onClick={() => resolveRequest(req.id)}
                  className="flex-shrink-0 text-xs px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl hover:bg-emerald-500/20 transition-all">
                  対応済
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next bookings */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-zinc-200">今後の予約</h2>
          <Link href="/owner/guests" className="text-xs text-zinc-500 hover:text-blue-400 transition-colors flex items-center gap-1">
            全て見る <ChevronRight size={12} />
          </Link>
        </div>
        <div className="space-y-2">
          {store.bookingHistory.filter(b => b.status !== 'completed').slice(0, 4).map(b => (
            <div key={b.id} className="flex items-center gap-3 py-2 border-b border-zinc-800 last:border-0">
              <span className="text-xl flex-shrink-0">{b.flag}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-zinc-200">{b.guestName}</p>
                <p className="text-xs text-zinc-500">{b.checkIn} → {b.checkOut} · {b.nights}泊</p>
              </div>
              <div className="text-right">
                <span className={`text-xs px-2 py-0.5 rounded-full border ${b.status === 'staying' ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' : 'text-blue-400 border-blue-500/30 bg-blue-500/10'}`}>
                  {b.status === 'staying' ? '滞在中' : '予約済'}
                </span>
                <p className="text-xs text-zinc-500 mt-0.5">¥{b.revenue.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-3 gap-3">
        <Link href="/owner/consults" className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 hover:border-zinc-700 transition-all text-center">
          <Building2 size={20} className="text-gold-400 mx-auto mb-2" />
          <p className="text-xs text-zinc-300">コンサルリード</p>
          <p className="text-xs text-zinc-600 mt-0.5">{store.consultRequests.filter(c => c.status === 'new').length}件新着</p>
        </Link>
        <Link href="/owner/guestbook" className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 hover:border-zinc-700 transition-all text-center">
          <MessageSquare size={20} className="text-purple-400 mx-auto mb-2" />
          <p className="text-xs text-zinc-300">寄せ書き</p>
          <p className="text-xs text-zinc-600 mt-0.5">{store.guestbookPosts.length}件</p>
        </Link>
        <Link href="/owner/analytics" className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 hover:border-zinc-700 transition-all text-center">
          <TrendingUp size={20} className="text-blue-400 mx-auto mb-2" />
          <p className="text-xs text-zinc-300">詳細分析</p>
          <p className="text-xs text-zinc-600 mt-0.5">照明・売上</p>
        </Link>
      </div>
    </motion.div>
  )
}
