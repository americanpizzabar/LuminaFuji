'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useStore } from '@/lib/useStore'
import { usePhase } from '@/lib/phase'
import {
  CalendarCheck, TrendingUp, Users, Building2,
  ChevronRight, Bell, MessageSquare, Lightbulb, Send, X
} from 'lucide-react'
import {
  getRevenueStats, getLightingAnalytics, getUnreadCounts,
  updateServiceRequest, getStore, sendMessage as storeSendMessage
} from '@/lib/store'
import { useState, useEffect } from 'react'
import PhaseBadge from '@/components/PhaseBadge'

type DrawerKey = 'revenue' | 'avgPrice' | 'leads' | 'pending' | null

const phaseConfig = {
  booked: { label: '予約済', color: 'text-blue-400 border-blue-500/30 bg-blue-500/10', desc: 'チェックイン前' },
  staying: { label: '滞在中', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10', desc: '照明・コンシェルジュ有効' },
  post: { label: '滞在後', color: 'text-gold-400 border-gold-500/30 bg-gold-500/10', desc: 'ECUANEST提案モード' },
}

export default function OwnerDashboardPage() {
  const [store, update] = useStore()
  const { phase } = usePhase()
  const revenue = getRevenueStats(store)
  const lighting = getLightingAnalytics(store)
  const counts = getUnreadCounts(store)
  const [msgInput, setMsgInput] = useState('')
  const [sending, setSending] = useState(false)
  const [activeDrawer, setActiveDrawer] = useState<DrawerKey>(null)

  const currentBooking = store.bookingHistory.find(b => b.status === 'staying')
  const nextBooking = store.bookingHistory.find(b => b.status === 'confirmed')
  const pendingReqs = store.serviceRequests.filter(r => r.status === 'pending')

  // ESC key closes drawer
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveDrawer(null)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

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

  const revenueBookings = store.bookingHistory.filter(b => b.status === 'completed' || b.status === 'staying')
  const allPricesPerNight = revenueBookings.map(b => Math.round(b.revenue / b.nights))
  const minPrice = allPricesPerNight.length > 0 ? Math.min(...allPricesPerNight) : 0
  const maxPrice = allPricesPerNight.length > 0 ? Math.max(...allPricesPerNight) : 0
  const newLeads = store.consultRequests.filter(c => c.status === 'new')

  const stats: { key: DrawerKey; label: string; value: string; sub: string; icon: typeof TrendingUp; color: string; bg: string }[] = [
    { key: 'revenue',  label: '今月売上',       value: `¥${(revenue.totalRevenue / 10000).toFixed(0)}万`, sub: `${revenue.bookingCount}組`,           icon: TrendingUp,    color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { key: 'avgPrice', label: '平均単価/泊',     value: `¥${revenue.avgPerNight.toLocaleString()}`,        sub: `${revenue.totalNights}泊`,             icon: CalendarCheck,  color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20' },
    { key: 'leads',    label: 'コンサルリード',  value: `${newLeads.length}`,                              sub: `新着/${store.consultRequests.length}件`, icon: Building2,     color: 'text-gold-400',    bg: 'bg-gold-500/10 border-gold-500/20' },
    { key: 'pending',  label: 'ゲストリクエスト',value: `${pendingReqs.length}`,                           sub: '未対応',                               icon: Bell,          color: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/20' },
  ]

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

      {/* Stats — clickable cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map(({ key, label, value, sub, icon: Icon, color, bg }) => (
          <button
            key={label}
            onClick={() => setActiveDrawer(key)}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-left hover:border-zinc-700 hover:bg-zinc-800/50 active:scale-[0.98] transition-all"
          >
            <div className={`w-9 h-9 rounded-xl border flex items-center justify-center mb-3 ${bg}`}>
              <Icon size={16} className={color} />
            </div>
            <p className="text-xl font-light text-zinc-100">{value}</p>
            <p className="text-xs text-zinc-600 mt-0.5">{label}</p>
            <p className="text-xs text-zinc-500">{sub}</p>
            <p className={`text-[10px] mt-1.5 ${color} opacity-70`}>詳細を見る →</p>
          </button>
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

        {/* Phase display — per-booking, auto-calculated from dates */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <h2 className="text-sm font-medium text-zinc-200 mb-1 flex items-center gap-2">
            <Lightbulb size={14} className="text-gold-400" /> ゲスト体験フェーズ
          </h2>
          <p className="text-xs text-zinc-500 mb-4">
            CI {store.facilitySettings.checkInTime} / CO {store.facilitySettings.checkOutTime} から自動計算
          </p>
          <div className="space-y-2">
            {store.bookingHistory
              .filter(b => b.status !== 'cancelled' && b.status !== 'completed')
              .slice(0, 5)
              .map(b => (
                <div key={b.id} className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl bg-zinc-800/50 border border-zinc-800">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base flex-shrink-0">{b.flag}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-zinc-200 truncate">{b.guestName}</p>
                      <p className="text-[10px] text-zinc-500">{b.checkIn} → {b.checkOut}</p>
                    </div>
                  </div>
                  <PhaseBadge checkIn={b.checkIn} checkOut={b.checkOut} settings={store.facilitySettings} />
                </div>
              ))}
            {store.bookingHistory.filter(b => b.status !== 'cancelled' && b.status !== 'completed').length === 0 && (
              <p className="text-xs text-zinc-600 text-center py-4">アクティブな予約はありません</p>
            )}
          </div>
          {lighting.topScene && (
            <div className="border-t border-zinc-800 pt-3 mt-3">
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

      {/* ── Slide-up detail drawers ── */}
      <AnimatePresence>
        {activeDrawer && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveDrawer(null)}
              className="fixed inset-0 z-40 bg-zinc-950/70 backdrop-blur-sm"
            />

            {/* Drawer panel */}
            <motion.div
              key="drawer"
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-900 border-t border-zinc-700 rounded-t-3xl max-h-[75vh] overflow-y-auto"
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-zinc-700" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800 sticky top-0 bg-zinc-900">
                <h3 className="text-sm font-medium text-zinc-100">
                  {activeDrawer === 'revenue'  && '月間収益 詳細'}
                  {activeDrawer === 'avgPrice' && '平均単価 詳細'}
                  {activeDrawer === 'leads'    && '新規リード 詳細'}
                  {activeDrawer === 'pending'  && '対応待ちリクエスト'}
                </h3>
                <button
                  onClick={() => setActiveDrawer(null)}
                  className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-all"
                >
                  <X size={13} className="text-zinc-400" />
                </button>
              </div>

              <div className="p-5 space-y-4">

                {/* ── Revenue drawer ── */}
                {activeDrawer === 'revenue' && (
                  <>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-zinc-800/60 rounded-xl p-3 text-center">
                        <p className="text-[10px] text-zinc-500 mb-1">総収益</p>
                        <p className="text-base font-light text-emerald-400">¥{(revenue.totalRevenue / 10000).toFixed(1)}万</p>
                      </div>
                      <div className="bg-zinc-800/60 rounded-xl p-3 text-center">
                        <p className="text-[10px] text-zinc-500 mb-1">予約数</p>
                        <p className="text-base font-light text-zinc-200">{revenue.bookingCount}組</p>
                      </div>
                      <div className="bg-zinc-800/60 rounded-xl p-3 text-center">
                        <p className="text-[10px] text-zinc-500 mb-1">泊数</p>
                        <p className="text-base font-light text-zinc-200">{revenue.totalNights}泊</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 mb-3">直近の予約</p>
                      <div className="space-y-2">
                        {revenueBookings.map(b => (
                          <div key={b.id} className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-xl">
                            <span className="text-xl flex-shrink-0">{b.flag}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-zinc-200">{b.guestName}</p>
                              <p className="text-[10px] text-zinc-500">{b.checkIn} · {b.nights}泊 · {b.platform}</p>
                            </div>
                            <p className="text-xs text-emerald-400 font-medium">¥{b.revenue.toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* ── Avg price drawer ── */}
                {activeDrawer === 'avgPrice' && (
                  <>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-zinc-800/60 rounded-xl p-3 text-center">
                        <p className="text-[10px] text-zinc-500 mb-1">平均</p>
                        <p className="text-base font-light text-blue-400">¥{revenue.avgPerNight.toLocaleString()}</p>
                      </div>
                      <div className="bg-zinc-800/60 rounded-xl p-3 text-center">
                        <p className="text-[10px] text-zinc-500 mb-1">最低</p>
                        <p className="text-base font-light text-zinc-200">¥{minPrice.toLocaleString()}</p>
                      </div>
                      <div className="bg-zinc-800/60 rounded-xl p-3 text-center">
                        <p className="text-[10px] text-zinc-500 mb-1">最高</p>
                        <p className="text-base font-light text-zinc-200">¥{maxPrice.toLocaleString()}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 mb-3">予約別 1泊単価</p>
                      <div className="space-y-2">
                        {revenueBookings.map(b => {
                          const perNight = Math.round(b.revenue / b.nights)
                          return (
                            <div key={b.id} className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-xl">
                              <span className="text-xl flex-shrink-0">{b.flag}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-zinc-200">{b.guestName}</p>
                                <p className="text-[10px] text-zinc-500">{b.checkIn} · {b.nights}泊 · {b.platform}</p>
                              </div>
                              <p className="text-xs text-blue-400 font-medium">¥{perNight.toLocaleString()}<span className="text-zinc-600">/泊</span></p>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </>
                )}

                {/* ── New leads drawer ── */}
                {activeDrawer === 'leads' && (
                  <>
                    {newLeads.length === 0 ? (
                      <p className="text-center text-zinc-600 text-sm py-6">新規リードはありません</p>
                    ) : (
                      <div className="space-y-3">
                        {newLeads.map(lead => (
                          <div key={lead.id} className="p-3 bg-zinc-800/50 rounded-xl space-y-1.5">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="text-sm font-medium text-zinc-100">{lead.name}</p>
                                {lead.company && <p className="text-xs text-zinc-500">{lead.company}</p>}
                              </div>
                              <span className="text-[10px] px-2 py-0.5 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 flex-shrink-0">新着</span>
                            </div>
                            <p className="text-xs text-zinc-400">{lead.projectType} · {lead.scale}</p>
                            <p className="text-[10px] text-zinc-600">{lead.submittedAt}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* ── Pending requests drawer ── */}
                {activeDrawer === 'pending' && (
                  <>
                    {pendingReqs.length === 0 ? (
                      <p className="text-center text-zinc-600 text-sm py-6">未対応リクエストはありません</p>
                    ) : (
                      <div className="space-y-3">
                        {pendingReqs.map(req => (
                          <div key={req.id} className="p-3 bg-zinc-800/50 rounded-xl">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <p className="text-sm font-medium text-zinc-100">{req.label}</p>
                              {req.priority === 'urgent' && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 flex-shrink-0">急ぎ</span>
                              )}
                            </div>
                            {req.description && req.description !== req.label && (
                              <p className="text-xs text-zinc-500 mb-1">{req.description}</p>
                            )}
                            <p className="text-[10px] text-zinc-600">
                              {new Date(req.createdAt).toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
