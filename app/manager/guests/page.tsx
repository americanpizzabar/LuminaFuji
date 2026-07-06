'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/lib/useStore'
import {
  addBookingRecord, updateBookingRecord, deleteBookingRecord, getStore,
  markGuestArrived, unmarkGuestArrived,
  BookingRecord,
} from '@/lib/store'
import { scopeOf, isDutyOf, getActionableCounts } from '@/lib/store'
import StaffMessageThread from '@/components/StaffMessageThread'
import ScopeNotice, { ScopeChip } from '@/components/ScopeNotice'
import {
  Users, Plus, Calendar, ChevronLeft, ChevronRight, X, Edit2,
  Trash2, Check, Clock, DollarSign, Globe, ChevronDown, ChevronUp, Link2, Mail, AlertTriangle, MapPin,
  MessageSquare,
} from 'lucide-react'
import PhaseBadge from '@/components/PhaseBadge'

// ─── Constants ────────────────────────────────────────────────────────────────

const FLAG_OPTIONS = ['🇯🇵', '🇺🇸', '🇨🇳', '🇰🇷', '🇩🇪', '🇫🇷', '🇬🇧', '🇦🇺', '🇨🇦']

const PLATFORMS = ['Airbnb', 'Booking.com', 'direct', 'other']

const STATUS_CONFIG: Record<BookingRecord['status'], { label: string; text: string; border: string; bg: string }> = {
  confirmed: { label: '予約済', text: 'text-blue-400', border: 'border-blue-500/30', bg: 'bg-blue-500/10' },
  staying:   { label: '滞在中', text: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10' },
  completed: { label: '完了',   text: 'text-zinc-400', border: 'border-zinc-700', bg: 'bg-zinc-800/50' },
  cancelled: { label: 'キャンセル', text: 'text-red-400', border: 'border-red-500/30', bg: 'bg-red-500/10' },
}

const FILTER_TABS: { key: string; label: string }[] = [
  { key: 'all', label: '全て' },
  { key: 'staying', label: '滞在中' },
  { key: 'confirmed', label: '予定' },
  { key: 'completed', label: '完了' },
  { key: 'cancelled', label: 'キャンセル' },
]

const INPUT_CLASS =
  'w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-teal-500/40 transition-all'
const LABEL_CLASS = 'text-xs text-zinc-300 mb-1 block'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcNights(checkIn: string, checkOut: string): number {
  const a = new Date(checkIn)
  const b = new Date(checkOut)
  if (isNaN(a.getTime()) || isNaN(b.getTime())) return 0
  return Math.max(0, Math.round((b.getTime() - a.getTime()) / 86400000))
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}
function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

// ─── Empty form factory ───────────────────────────────────────────────────────

function emptyForm() {
  return {
    guestName: '',
    email: '',
    phone: '',
    nationality: '',
    flag: '🇯🇵',
    checkIn: '',
    checkOut: '',
    adults: 2,
    children: 0,
    platform: 'Airbnb',
    revenue: 0,
    notes: '',
    specialRequests: '',
    status: 'confirmed' as BookingRecord['status'],
  }
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────

function EditModal({
  booking,
  onClose,
  onSave,
  onDelete,
}: {
  booking: BookingRecord
  onClose: () => void
  onSave: (updates: Partial<BookingRecord>) => void
  onDelete: () => void
}) {
  const [form, setForm] = useState({
    guestName: booking.guestName,
    email: booking.email,
    phone: (booking as BookingRecord & { phone?: string }).phone ?? '',
    nationality: booking.nationality,
    flag: booking.flag,
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    adults: booking.adults,
    children: booking.children,
    platform: booking.platform,
    revenue: booking.revenue,
    notes: booking.notes ?? '',
    specialRequests: (booking as BookingRecord & { specialRequests?: string }).specialRequests ?? '',
    status: booking.status,
  })
  const [confirmDelete, setConfirmDelete] = useState(false)

  const nights = calcNights(form.checkIn, form.checkOut)

  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) =>
    setForm(f => ({ ...f, [k]: v }))

  const handleSave = () => {
    onSave({ ...form, nights })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-zinc-950/80 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', damping: 24, stiffness: 300 }}
        className="w-full sm:max-w-lg bg-zinc-900 border border-zinc-800 rounded-t-3xl sm:rounded-3xl p-5 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-medium text-zinc-100 flex items-center gap-2">
            <Edit2 size={14} className="text-teal-400" /> 予約を編集
          </h3>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-all">
            <X size={13} className="text-zinc-400" />
          </button>
        </div>

        <div className="space-y-3">
          {/* Name + Flag */}
          <div className="grid grid-cols-[auto_1fr] gap-2">
            <div>
              <label className={LABEL_CLASS}>国旗</label>
              <select value={form.flag} onChange={e => set('flag', e.target.value)}
                className="bg-zinc-800 border border-zinc-700 rounded-xl px-2 py-2 text-lg focus:outline-none h-[38px]">
                {FLAG_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS}>ゲスト名</label>
              <input value={form.guestName} onChange={e => set('guestName', e.target.value)} className={INPUT_CLASS} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={LABEL_CLASS}>メール</label>
              <input value={form.email} onChange={e => set('email', e.target.value)} className={INPUT_CLASS} />
            </div>
            <div>
              <label className={LABEL_CLASS}>電話</label>
              <input value={form.phone} onChange={e => set('phone', e.target.value)} className={INPUT_CLASS} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={LABEL_CLASS}>チェックイン</label>
              <input type="date" value={form.checkIn} onChange={e => set('checkIn', e.target.value)} className={INPUT_CLASS} />
            </div>
            <div>
              <label className={LABEL_CLASS}>チェックアウト</label>
              <input type="date" value={form.checkOut} onChange={e => set('checkOut', e.target.value)} className={INPUT_CLASS} />
            </div>
          </div>

          {nights > 0 && (
            <p className="text-xs text-teal-400">{nights}泊</p>
          )}

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className={LABEL_CLASS}>大人</label>
              <input type="number" min={1} max={10} value={form.adults} onChange={e => set('adults', Number(e.target.value))} className={INPUT_CLASS} />
            </div>
            <div>
              <label className={LABEL_CLASS}>子供</label>
              <input type="number" min={0} max={10} value={form.children} onChange={e => set('children', Number(e.target.value))} className={INPUT_CLASS} />
            </div>
            <div>
              <label className={LABEL_CLASS}>プラットフォーム</label>
              <select value={form.platform} onChange={e => set('platform', e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-2 py-2 text-xs text-zinc-300 focus:outline-none h-[38px]">
                {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={LABEL_CLASS}>売上 (円)</label>
              <input type="number" value={form.revenue} onChange={e => set('revenue', Number(e.target.value))} className={INPUT_CLASS} />
            </div>
            <div>
              <label className={LABEL_CLASS}>ステータス</label>
              <select value={form.status} onChange={e => set('status', e.target.value as BookingRecord['status'])}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-2 py-2 text-xs text-zinc-300 focus:outline-none h-[38px]">
                <option value="confirmed">予約済</option>
                <option value="staying">滞在中</option>
                <option value="completed">完了</option>
                <option value="cancelled">キャンセル</option>
              </select>
            </div>
          </div>

          <div>
            <label className={LABEL_CLASS}>メモ</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} className={INPUT_CLASS + ' resize-none'} />
          </div>

          <div>
            <label className={LABEL_CLASS}>特別リクエスト</label>
            <textarea value={form.specialRequests} onChange={e => set('specialRequests', e.target.value)} rows={2} className={INPUT_CLASS + ' resize-none'} />
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          {confirmDelete ? (
            <>
              <button onClick={onDelete} className="flex-1 bg-red-600 hover:bg-red-500 text-white rounded-xl py-2.5 text-sm font-medium transition-all">
                削除する
              </button>
              <button onClick={() => setConfirmDelete(false)} className="px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl py-2.5 text-sm transition-all">
                キャンセル
              </button>
            </>
          ) : (
            <>
              <button onClick={handleSave} className="flex-1 bg-teal-600 hover:bg-teal-500 text-white rounded-xl py-2.5 text-sm font-medium transition-all flex items-center justify-center gap-1.5">
                <Check size={14} /> 保存する
              </button>
              <button onClick={() => setConfirmDelete(true)} className="w-10 flex items-center justify-center bg-zinc-800 hover:bg-red-500/20 border border-zinc-700 hover:border-red-500/30 rounded-xl transition-all">
                <Trash2 size={14} className="text-zinc-300 hover:text-red-400" />
              </button>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Guest List Tab ───────────────────────────────────────────────────────────

function generateInviteLink(booking: BookingRecord): string {
  const encoded = btoa(encodeURIComponent(JSON.stringify(booking)))
  return `${window.location.origin}/login?invite=${encoded}`
}

async function sendInviteMail(booking: BookingRecord): Promise<{ ok: boolean; error?: string }> {
  if (!booking.email) return { ok: false, error: 'No email' }
  try {
    const res = await fetch('/api/auth/send-invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: booking.email,
        guestName: booking.guestName,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        inviteLink: generateInviteLink(booking),
      }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      return { ok: false, error: data.error ?? `HTTP ${res.status}` }
    }
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'network error' }
  }
}

function GuestListTab({
  bookings,
  facilitySettings,
  onEdit,
}: {
  bookings: BookingRecord[]
  facilitySettings: { checkInTime: string; checkOutTime: string }
  onEdit?: (b: BookingRecord) => void
}) {
  const [, update] = useStore()
  const [filter, setFilter] = useState<string>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [emailingId, setEmailingId] = useState<string | null>(null)
  const [emailSentId, setEmailSentId] = useState<string | null>(null)
  const [tabToast, setTabToast] = useState<{ kind: 'success' | 'error'; text: string } | null>(null)

  const showTabToast = (kind: 'success' | 'error', text: string) => {
    setTabToast({ kind, text })
    setTimeout(() => setTabToast(null), 3000)
  }

  const copyInviteLink = (booking: BookingRecord) => {
    const link = generateInviteLink(booking)
    navigator.clipboard.writeText(link).then(() => {
      setCopiedId(booking.id)
      setTimeout(() => setCopiedId(null), 2000)
    })
  }

  const handleResendInvite = async (booking: BookingRecord) => {
    setEmailingId(booking.id)
    const result = await sendInviteMail(booking)
    setEmailingId(null)
    if (result.ok) {
      setEmailSentId(booking.id)
      setTimeout(() => setEmailSentId(null), 2500)
      showTabToast('success', `${booking.email} に招待メールを送信しました`)
    } else {
      showTabToast('error', `送信失敗: ${result.error ?? ''}`)
    }
  }

  const handleMarkArrived = (bookingId: string) => {
    markGuestArrived(bookingId)
    update({ bookingHistory: getStore().bookingHistory })
  }

  const handleCancelArrival = (bookingId: string) => {
    unmarkGuestArrived(bookingId)
    update({ bookingHistory: getStore().bookingHistory })
  }

  const filtered = useMemo(() => {
    if (filter === 'all') return bookings
    return bookings.filter(b => b.status === filter)
  }, [bookings, filter])

  const counts: Record<string, number> = useMemo(() => {
    const c: Record<string, number> = { all: bookings.length }
    bookings.forEach(b => { c[b.status] = (c[b.status] ?? 0) + 1 })
    return c
  }, [bookings])

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
        {FILTER_TABS.map(ft => (
          <button key={ft.key} onClick={() => setFilter(ft.key)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${filter === ft.key
              ? 'bg-teal-500/20 border border-teal-500/30 text-teal-300'
              : 'bg-zinc-800/50 border border-zinc-800 text-zinc-300 hover:text-zinc-300'}`}>
            {ft.label}
            {counts[ft.key] ? <span className="ml-1 opacity-60">{counts[ft.key]}</span> : null}
          </button>
        ))}
      </div>

      {/* Booking cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-zinc-400 text-sm">該当する予約はありません</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(b => {
            const cfg = STATUS_CONFIG[b.status]
            const isExpanded = expandedId === b.id
            return (
              <motion.div key={b.id} layout
                className={`bg-zinc-900 border rounded-2xl overflow-hidden transition-all ${cfg.border}`}>
                <button
                  onClick={() => setExpandedId(isExpanded ? null : b.id)}
                  className="w-full text-left p-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">{b.flag}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-zinc-100">{b.guestName}</p>
                        <span className={`text-[11px] px-1.5 py-0.5 rounded-full border ${cfg.text} ${cfg.border} ${cfg.bg}`}>
                          {cfg.label}
                        </span>
                        {b.status === 'staying' && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        )}
                        <PhaseBadge checkIn={b.checkIn} checkOut={b.checkOut} settings={facilitySettings} arrivedAt={b.arrivedAt} />
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-xs text-zinc-300">
                        <span className="flex items-center gap-1"><Clock size={10} /> {b.checkIn} 〜 {b.checkOut}</span>
                        <span>{b.platform}</span>
                        <span>{b.nights}泊 · {b.adults}名{b.children > 0 ? `+${b.children}` : ''}</span>
                        <span className="text-zinc-400">¥{b.revenue.toLocaleString()}</span>
                      </div>
                      {b.notes && !isExpanded && (
                        <p className="text-xs text-zinc-400 mt-1 truncate">{b.notes}</p>
                      )}
                    </div>
                    <div className="flex-shrink-0 text-zinc-400">
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </div>
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-zinc-800 px-4 pb-4 pt-3"
                    >
                      <div className="grid grid-cols-2 gap-2 text-xs text-zinc-400 mb-3">
                        <div><span className="text-zinc-400">メール</span><br />{b.email || '—'}</div>
                        <div><span className="text-zinc-400">国籍</span><br />{b.nationality || '—'}</div>
                        <div><span className="text-zinc-400">予約ID</span><br />{b.id}</div>
                        <div><span className="text-zinc-400">料金/泊</span><br />¥{b.nights > 0 ? Math.round(b.revenue / b.nights).toLocaleString() : '—'}</div>
                      </div>
                      {b.notes && (
                        <div className="mb-2">
                          <p className="text-[11px] text-zinc-400 mb-0.5">メモ</p>
                          <p className="text-xs text-zinc-400 bg-zinc-800/50 rounded-lg px-3 py-2">{b.notes}</p>
                        </div>
                      )}
                      {(b as BookingRecord & { specialRequests?: string }).specialRequests && (
                        <div className="mb-3">
                          <p className="text-[11px] text-zinc-400 mb-0.5">特別リクエスト</p>
                          <p className="text-xs text-zinc-400 bg-zinc-800/50 rounded-lg px-3 py-2">{(b as BookingRecord & { specialRequests?: string }).specialRequests}</p>
                        </div>
                      )}
                      <div className="flex gap-2 flex-wrap">
                        <button disabled={!onEdit} onClick={() => onEdit?.(b)}
                          className="flex items-center gap-1.5 text-xs text-teal-400 hover:text-teal-300 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20 rounded-xl px-3 py-1.5 transition-all">
                          <Edit2 size={11} /> 編集する
                        </button>
                        {/* 到着マーク / 取消 */}
                        {b.status !== 'completed' && b.status !== 'cancelled' && (
                          !b.arrivedAt ? (
                            <button onClick={() => handleMarkArrived(b.id)}
                              className="flex items-center gap-1.5 text-xs rounded-xl px-3 py-1.5 border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all">
                              <MapPin size={11} /> 到着済みにする
                            </button>
                          ) : (
                            <button onClick={() => handleCancelArrival(b.id)}
                              className="flex items-center gap-1.5 text-xs rounded-xl px-3 py-1.5 border border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:bg-zinc-700/50 transition-all">
                              <X size={11} /> 到着取消
                            </button>
                          )
                        )}
                        {b.email && (
                          <>
                            <button onClick={() => handleResendInvite(b)}
                              disabled={emailingId === b.id}
                              className={`flex items-center gap-1.5 text-xs rounded-xl px-3 py-1.5 border transition-all ${
                                emailSentId === b.id
                                  ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                                  : 'border-gold-500/30 bg-gold-500/10 text-gold-400 hover:bg-gold-500/20 disabled:opacity-50'
                              }`}>
                              {emailSentId === b.id
                                ? <><Check size={11} /> 送信済み</>
                                : emailingId === b.id
                                  ? <><Mail size={11} className="animate-pulse" /> 送信中…</>
                                  : <><Mail size={11} /> 招待メールを送信</>
                              }
                            </button>
                            <button onClick={() => copyInviteLink(b)}
                              className={`flex items-center gap-1.5 text-xs rounded-xl px-3 py-1.5 border transition-all ${
                                copiedId === b.id
                                  ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                                  : 'border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:bg-zinc-700/50'
                              }`}>
                              {copiedId === b.id
                                ? <><Check size={11} /> コピー済み</>
                                : <><Link2 size={11} /> リンクをコピー</>
                              }
                            </button>
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Toast */}
      <AnimatePresence>
        {tabToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] px-4 py-2.5 rounded-2xl text-xs font-medium shadow-xl flex items-center gap-2 max-w-[90%] ${
              tabToast.kind === 'success'
                ? 'bg-emerald-500 text-zinc-950'
                : 'bg-red-500 text-white'
            }`}
          >
            {tabToast.kind === 'success' ? <Check size={14} /> : <AlertTriangle size={14} />}
            <span>{tabToast.text}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── New Booking Form Tab ─────────────────────────────────────────────────────

function NewBookingTab({
  onSuccess,
}: {
  onSuccess: () => void
}) {
  const [, update] = useStore()
  const [form, setForm] = useState(emptyForm())
  const [toast, setToast] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const nights = calcNights(form.checkIn, form.checkOut)

  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) =>
    setForm(f => ({ ...f, [k]: v }))

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.guestName.trim()) e.guestName = '必須項目です'
    if (!form.checkIn) e.checkIn = '必須項目です'
    if (!form.checkOut) e.checkOut = '必須項目です'
    if (form.checkIn && form.checkOut && form.checkIn >= form.checkOut) e.checkOut = 'チェックアウトはチェックインより後にしてください'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    const created = addBookingRecord({
      guestName: form.guestName,
      email: form.email,
      nationality: form.nationality,
      flag: form.flag,
      checkIn: form.checkIn,
      checkOut: form.checkOut,
      adults: form.adults,
      children: form.children,
      nights,
      platform: form.platform,
      revenue: form.revenue,
      status: form.status,
      notes: form.notes || undefined,
    })
    update({ bookingHistory: getStore().bookingHistory })
    setToast(true)
    setForm(emptyForm())

    // 新規予約 & メールあり → 自動で招待メールを送信
    if (created?.email) {
      sendInviteMail(created).catch(() => {/* fail silently; can resend manually */})
    }

    setTimeout(() => {
      setToast(false)
      onSuccess()
    }, 1500)
  }

  return (
    <div className="space-y-5">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
        <h2 className="text-sm font-medium text-zinc-200 flex items-center gap-2">
          <Plus size={14} className="text-teal-400" /> 新規予約登録
        </h2>

        {/* Flag + Name */}
        <div className="grid grid-cols-[auto_1fr] gap-2">
          <div>
            <label className={LABEL_CLASS}>国旗</label>
            <select value={form.flag} onChange={e => set('flag', e.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded-xl px-2 py-2 text-lg focus:outline-none h-[38px]">
              {FLAG_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS}>ゲスト名 <span className="text-red-400">*</span></label>
            <input value={form.guestName} onChange={e => set('guestName', e.target.value)}
              placeholder="例: Yamada Taro" className={INPUT_CLASS + (errors.guestName ? ' border-red-500/40' : '')} />
            {errors.guestName && <p className="text-[11px] text-red-400 mt-0.5">{errors.guestName}</p>}
          </div>
        </div>

        {/* Email + Phone */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={LABEL_CLASS}>メール</label>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
              placeholder="guest@example.com" className={INPUT_CLASS} />
          </div>
          <div>
            <label className={LABEL_CLASS}>電話番号</label>
            <input value={form.phone} onChange={e => set('phone', e.target.value)}
              placeholder="090-XXXX-XXXX" className={INPUT_CLASS} />
          </div>
        </div>

        {/* Nationality */}
        <div>
          <label className={LABEL_CLASS}>国籍</label>
          <input value={form.nationality} onChange={e => set('nationality', e.target.value)}
            placeholder="日本" className={INPUT_CLASS} />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={LABEL_CLASS}>チェックイン <span className="text-red-400">*</span></label>
            <input type="date" value={form.checkIn} onChange={e => set('checkIn', e.target.value)}
              className={INPUT_CLASS + (errors.checkIn ? ' border-red-500/40' : '')} />
            {errors.checkIn && <p className="text-[11px] text-red-400 mt-0.5">{errors.checkIn}</p>}
          </div>
          <div>
            <label className={LABEL_CLASS}>チェックアウト <span className="text-red-400">*</span></label>
            <input type="date" value={form.checkOut} onChange={e => set('checkOut', e.target.value)}
              className={INPUT_CLASS + (errors.checkOut ? ' border-red-500/40' : '')} />
            {errors.checkOut && <p className="text-[11px] text-red-400 mt-0.5">{errors.checkOut}</p>}
          </div>
        </div>

        {nights > 0 && (
          <div className="text-xs text-teal-400 flex items-center gap-1.5">
            <Clock size={11} /> {nights}泊
          </div>
        )}

        {/* Adults + Children + Platform */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className={LABEL_CLASS}>大人</label>
            <input type="number" min={1} max={10} value={form.adults} onChange={e => set('adults', Number(e.target.value))} className={INPUT_CLASS} />
          </div>
          <div>
            <label className={LABEL_CLASS}>子供</label>
            <input type="number" min={0} max={10} value={form.children} onChange={e => set('children', Number(e.target.value))} className={INPUT_CLASS} />
          </div>
          <div>
            <label className={LABEL_CLASS}>プラットフォーム</label>
            <select value={form.platform} onChange={e => set('platform', e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-2 py-2 text-xs text-zinc-300 focus:outline-none h-[38px]">
              {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        {/* Revenue */}
        <div>
          <label className={LABEL_CLASS}>売上 (円)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-300 text-sm">¥</span>
            <input type="number" value={form.revenue} onChange={e => set('revenue', Number(e.target.value))}
              className={INPUT_CLASS + ' pl-7'} />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className={LABEL_CLASS}>メモ</label>
          <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2}
            placeholder="内部メモ（ゲストには見えません）" className={INPUT_CLASS + ' resize-none'} />
        </div>

        {/* Special Requests */}
        <div>
          <label className={LABEL_CLASS}>特別リクエスト</label>
          <textarea value={form.specialRequests} onChange={e => set('specialRequests', e.target.value)} rows={2}
            placeholder="ゲストからの特別リクエスト" className={INPUT_CLASS + ' resize-none'} />
        </div>

        <button onClick={handleSubmit}
          className="w-full bg-teal-600 hover:bg-teal-500 text-white rounded-2xl py-3 text-sm font-medium transition-all flex items-center justify-center gap-2">
          <Plus size={15} /> 予約を登録する
        </button>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-teal-500 text-zinc-950 px-5 py-2.5 rounded-2xl text-sm font-medium shadow-xl flex items-center gap-2 z-50"
          >
            <Check size={15} /> 予約を登録しました
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Calendar Tab ─────────────────────────────────────────────────────────────

function CalendarTab({
  bookings,
  onEdit,
}: {
  bookings: BookingRecord[]
  onEdit?: (b: BookingRecord) => void
}) {
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

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
  const dayMap = useMemo(() => {
    const map: Record<number, BookingRecord[]> = {}
    bookings.forEach(b => {
      if (b.status === 'cancelled') return
      const start = new Date(b.checkIn)
      const end = new Date(b.checkOut)
      for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
        if (d.getFullYear() === viewYear && d.getMonth() === viewMonth) {
          const day = d.getDate()
          if (!map[day]) map[day] = []
          map[day].push(b)
        }
      }
    })
    return map
  }, [bookings, viewYear, viewMonth])

  const monthBookings = useMemo(() =>
    bookings.filter(b =>
      (b.checkIn.startsWith(monthStr) || b.checkOut.startsWith(monthStr)) && b.status !== 'cancelled'
    ),
    [bookings, monthStr]
  )

  const totalRevenue = monthBookings.reduce((sum, b) => sum + b.revenue, 0)

  const STATUS_DOT: Record<BookingRecord['status'], string> = {
    confirmed: 'bg-blue-400',
    staying: 'bg-emerald-400',
    completed: 'bg-zinc-500',
    cancelled: 'bg-red-400',
  }

  return (
    <div className="space-y-5">
      {/* Calendar */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        {/* Nav */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-all">
            <ChevronLeft size={15} className="text-zinc-400" />
          </button>
          <div className="text-center">
            <h2 className="text-sm font-medium text-zinc-200">{viewYear}年 {viewMonth + 1}月</h2>
            <p className="text-[11px] text-zinc-300 mt-0.5">{monthBookings.length}件 · ¥{totalRevenue.toLocaleString()}</p>
          </div>
          <button onClick={nextMonth} className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-all">
            <ChevronRight size={15} className="text-zinc-400" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {['日', '月', '火', '水', '木', '金', '土'].map((d, i) => (
            <div key={d} className={`text-center text-[11px] py-1 ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-zinc-300'}`}>{d}</div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 gap-px">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`e-${i}`} className="aspect-square" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const isToday = viewYear === today.getFullYear() && viewMonth === today.getMonth() && day === today.getDate()
            const dayBookings = dayMap[day] ?? []
            const isOccupied = dayBookings.length > 0
            const isSelected = selectedDay === day
            const firstBooking = dayBookings[0]

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(isSelected ? null : day)}
                className={`aspect-square flex flex-col items-center justify-start pt-1 rounded-lg relative transition-all
                  ${isOccupied ? 'bg-teal-500/10 border border-teal-500/20 hover:bg-teal-500/20' : 'hover:bg-zinc-800'}
                  ${isSelected ? 'ring-1 ring-teal-400' : ''}`}
              >
                <span className={`text-[11px] font-medium leading-none ${isToday ? 'w-5 h-5 rounded-full bg-teal-500 text-zinc-950 flex items-center justify-center' : isOccupied ? 'text-teal-300' : 'text-zinc-400'}`}>
                  {day}
                </span>
                {firstBooking && (
                  <div className="flex items-center gap-px mt-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[firstBooking.status]}`} />
                    {dayBookings.length > 1 && <span className="text-[8px] text-zinc-300">+{dayBookings.length - 1}</span>}
                  </div>
                )}
                {firstBooking && (
                  <span className="text-[11px] leading-none mt-0.5 truncate w-full text-center px-0.5">{firstBooking.flag}</span>
                )}
              </button>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-zinc-800">
          {[
            { dot: 'bg-blue-400', label: '予約済' },
            { dot: 'bg-emerald-400', label: '滞在中' },
            { dot: 'bg-zinc-500', label: '完了' },
            { dot: 'bg-teal-500', label: '今日' },
          ].map(({ dot, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-full ${dot}`} />
              <span className="text-[11px] text-zinc-300">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Selected day bookings */}
      {selectedDay && dayMap[selectedDay] && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900 border border-teal-500/20 rounded-2xl p-4 space-y-2"
        >
          <p className="text-xs text-zinc-300 mb-3">{viewMonth + 1}月{selectedDay}日の予約</p>
          {dayMap[selectedDay].map(b => {
            const cfg = STATUS_CONFIG[b.status]
            return (
              <button key={b.id} onClick={() => onEdit?.(b)}
                className={`w-full text-left flex items-center gap-3 p-3 rounded-xl border ${cfg.border} hover:bg-zinc-800/50 transition-all`}>
                <span className="text-xl">{b.flag}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-200">{b.guestName}</p>
                  <p className="text-xs text-zinc-300">{b.checkIn} 〜 {b.checkOut} · ¥{b.revenue.toLocaleString()}</p>
                </div>
                <span className={`text-[11px] px-1.5 py-0.5 rounded-full border ${cfg.text} ${cfg.border}`}>{cfg.label}</span>
              </button>
            )
          })}
        </motion.div>
      )}

      {/* Month bookings list */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <h2 className="text-sm font-medium text-zinc-200 flex items-center gap-2 mb-4">
          <Calendar size={14} className="text-teal-400" /> {viewMonth + 1}月の予約
          {monthBookings.length > 0 && (
            <span className="text-xs text-teal-400 bg-teal-500/10 border border-teal-500/20 px-1.5 py-0.5 rounded-full">{monthBookings.length}件</span>
          )}
        </h2>
        {monthBookings.length === 0 ? (
          <p className="text-zinc-400 text-sm text-center py-6">この月の予約はありません</p>
        ) : (
          <div className="space-y-2">
            {monthBookings.map(b => {
              const cfg = STATUS_CONFIG[b.status]
              return (
                <button key={b.id} onClick={() => onEdit?.(b)}
                  className={`w-full text-left flex items-start gap-3 p-3 rounded-xl border ${cfg.border} bg-zinc-800/30 hover:bg-zinc-800/60 transition-all`}>
                  <span className="text-2xl flex-shrink-0">{b.flag}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-zinc-200">{b.guestName}</p>
                      <span className={`text-[11px] px-1.5 py-0.5 rounded-full border ${cfg.text} ${cfg.border}`}>{cfg.label}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-zinc-300">
                      <span className="flex items-center gap-1"><Clock size={10} /> {b.checkIn} 〜 {b.checkOut}</span>
                      <span className="flex items-center gap-1"><Users size={10} /> {b.adults + b.children}名</span>
                      <span>{b.platform} · {b.nights}泊 · ¥{b.revenue.toLocaleString()}</span>
                    </div>
                  </div>
                  <Edit2 size={12} className="text-zinc-400 flex-shrink-0 mt-1" />
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const ALL_MAIN_TABS = ['ゲスト一覧', '新規登録', 'カレンダー', 'メッセージ'] as const
type MainTab = typeof ALL_MAIN_TABS[number]

export default function ManagerGuestsPage() {
  const [store, update] = useStore()
  // 委託範囲に応じてタブ構成を組み立てる（予約管理・ゲストチャットは委託対象業務）
  const scope = scopeOf(store)
  const handlesBookings = isDutyOf(scope, 'bookings', 'manager')
  const handlesChat = isDutyOf(scope, 'guestChat', 'manager')
  const MAIN_TABS: MainTab[] = [
    'ゲスト一覧',
    ...(handlesBookings ? ['新規登録' as MainTab] : []),
    'カレンダー',
    ...(handlesChat ? ['メッセージ' as MainTab] : []),
  ]
  const unreadGuestMsgs = getActionableCounts(store, 'manager').messages
  const [activeTab, setActiveTab] = useState<MainTab>('ゲスト一覧')
  // scope 変更で現在のタブが消えた場合はゲスト一覧へフォールバック（派生値・effect不使用）
  const effectiveTab: MainTab = MAIN_TABS.includes(activeTab) ? activeTab : 'ゲスト一覧'
  const [editingBooking, setEditingBooking] = useState<BookingRecord | null>(null)

  const bookings = store.bookingHistory

  const handleEdit = (b: BookingRecord) => setEditingBooking(b)

  const handleSave = (updates: Partial<BookingRecord>) => {
    if (!editingBooking) return
    updateBookingRecord(editingBooking.id, updates)
    update({ bookingHistory: getStore().bookingHistory })
    setEditingBooking(null)
  }

  const handleDelete = () => {
    if (!editingBooking) return
    deleteBookingRecord(editingBooking.id)
    update({ bookingHistory: getStore().bookingHistory })
    setEditingBooking(null)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium text-zinc-100 flex items-center gap-2">
            <Users size={18} className="text-teal-400" /> ゲスト管理
          </h1>
          <p className="text-sm text-zinc-300 mt-0.5">
            全{bookings.length}件 · 滞在中{bookings.filter(b => b.status === 'staying').length}組
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-300 bg-zinc-800 border border-zinc-700 px-2.5 py-1 rounded-xl flex items-center gap-1.5">
            <DollarSign size={11} className="text-teal-400" />
            ¥{bookings.filter(b => b.status !== 'cancelled').reduce((s, b) => s + b.revenue, 0).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl p-1 gap-1">
        {MAIN_TABS.map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${effectiveTab === t
              ? 'bg-teal-500/20 text-teal-300 border border-teal-500/20'
              : 'text-zinc-300 hover:text-zinc-300'}`}>
            {t === 'ゲスト一覧' && <Globe size={11} className="inline mr-1" />}
            {t === '新規登録' && <Plus size={11} className="inline mr-1" />}
            {t === 'カレンダー' && <Calendar size={11} className="inline mr-1" />}
            {t === 'メッセージ' && <MessageSquare size={11} className="inline mr-1" />}
            {t}
            {t === 'メッセージ' && unreadGuestMsgs > 0 && (
              <span className="ml-1.5 text-amber-400">{unreadGuestMsgs}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={effectiveTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
        >
          {effectiveTab === 'ゲスト一覧' && (
            <>
              {!handlesBookings && (
                <div className="mb-3 flex justify-end"><ScopeChip party="owner" /></div>
              )}
              <GuestListTab bookings={bookings} facilitySettings={store.facilitySettings} onEdit={handlesBookings ? handleEdit : undefined} />
            </>
          )}
          {effectiveTab === '新規登録' && handlesBookings && (
            <NewBookingTab onSuccess={() => setActiveTab('ゲスト一覧')} />
          )}
          {effectiveTab === 'カレンダー' && (
            <CalendarTab bookings={bookings} onEdit={handlesBookings ? handleEdit : undefined} />
          )}
          {effectiveTab === 'メッセージ' && handlesChat && (
            <StaffMessageThread portal="manager" />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Edit modal */}
      <AnimatePresence>
        {editingBooking && (
          <EditModal
            booking={editingBooking}
            onClose={() => setEditingBooking(null)}
            onSave={handleSave}
            onDelete={handleDelete}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
