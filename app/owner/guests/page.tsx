'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, Wrench, MessageSquare, CheckCircle2, Clock,
  AlertTriangle, Send, ChevronDown, ChevronUp, Calendar,
  Bed, DollarSign, Filter, Plus, Edit2, X, Check, Trash2, Link2, Mail, MapPin,
} from 'lucide-react'
import { useStore } from '@/lib/useStore'
import {
  getStore, updateServiceRequest, updateMaintenanceItem,
  sendMessage as storeSendMessage,
  addBookingRecord, updateBookingRecord, deleteBookingRecord,
  markGuestArrived, unmarkGuestArrived,
} from '@/lib/store'
import type { BookingRecord, ServiceRequest, MaintenanceItem } from '@/lib/store'
import PhaseBadge from '@/components/PhaseBadge'

// ─── Constants ────────────────────────────────────────────────────────────────

type BookingFilter = 'all' | 'staying' | 'confirmed' | 'completed'
type ActiveSection = 'bookings' | 'requests' | 'messages' | 'maintenance'

const FLAG_OPTIONS = ['🇯🇵', '🇺🇸', '🇨🇳', '🇰🇷', '🇩🇪', '🇫🇷', '🇬🇧', '🇦🇺', '🇨🇦']
const PLATFORMS = ['Airbnb', 'Booking.com', 'direct', 'other']

const INPUT_CLASS =
  'w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/40 transition-all'
const LABEL_CLASS = 'text-xs text-zinc-500 mb-1 block'

const bookingStatusConfig: Record<BookingRecord['status'], { label: string; color: string }> = {
  staying:   { label: '滞在中',     color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
  confirmed: { label: '予約済',     color: 'text-blue-400 border-blue-500/30 bg-blue-500/10' },
  completed: { label: '完了',       color: 'text-zinc-400 border-zinc-600 bg-zinc-800' },
  cancelled: { label: 'キャンセル', color: 'text-red-400 border-red-500/30 bg-red-500/10' },
}

const serviceTypeEmoji: Record<ServiceRequest['type'], string> = {
  towels: '🛁', amenities: '🧴', temperature: '🌡️', maintenance: '🔧', taxi: '🚕', other: '💬',
}

const serviceStatusConfig: Record<ServiceRequest['status'], { label: string; color: string }> = {
  pending:    { label: '未対応',  color: 'text-red-400 border-red-500/30 bg-red-500/10' },
  inProgress: { label: '対応中', color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
  done:       { label: '完了',   color: 'text-zinc-400 border-zinc-600 bg-zinc-800' },
}

const maintenancePriorityConfig: Record<MaintenanceItem['priority'], { label: string; color: string }> = {
  low:    { label: '低',   color: 'text-zinc-400 border-zinc-700 bg-zinc-800' },
  medium: { label: '中',   color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
  urgent: { label: '緊急', color: 'text-red-400 border-red-500/30 bg-red-500/10' },
}

const maintenanceStatusConfig: Record<MaintenanceItem['status'], { label: string; color: string }> = {
  open:      { label: 'オープン', color: 'text-red-400 border-red-500/30 bg-red-500/10' },
  scheduled: { label: '予定済み', color: 'text-blue-400 border-blue-500/30 bg-blue-500/10' },
  done:      { label: '完了',     color: 'text-zinc-400 border-zinc-600 bg-zinc-800' },
}

const platformBadge: Record<string, { label: string; color: string }> = {
  Airbnb:        { label: 'Airbnb',      color: 'text-rose-400 border-rose-500/30 bg-rose-500/10' },
  'Booking.com': { label: 'Booking.com', color: 'text-blue-400 border-blue-500/30 bg-blue-500/10' },
  direct:        { label: 'ダイレクト',  color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
  other:         { label: 'その他',      color: 'text-zinc-400 border-zinc-700 bg-zinc-800' },
}

const bookingFilterTabs: { key: BookingFilter; label: string }[] = [
  { key: 'all',       label: 'すべて' },
  { key: 'staying',   label: '滞在中' },
  { key: 'confirmed', label: '予約済' },
  { key: 'completed', label: '完了' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcNights(checkIn: string, checkOut: string): number {
  const a = new Date(checkIn), b = new Date(checkOut)
  if (isNaN(a.getTime()) || isNaN(b.getTime())) return 0
  return Math.max(0, Math.round((b.getTime() - a.getTime()) / 86400000))
}

function emptyForm() {
  return {
    guestName: '', email: '', phone: '', nationality: '', flag: '🇯🇵',
    checkIn: '', checkOut: '', adults: 2, children: 0,
    platform: 'Airbnb', revenue: 0, notes: '', specialRequests: '',
    status: 'confirmed' as BookingRecord['status'],
  }
}

// ─── Edit/New Modal ────────────────────────────────────────────────────────────

function BookingModal({
  booking,
  onClose,
  onSave,
  onDelete,
}: {
  booking: BookingRecord | null  // null = new booking mode
  onClose: () => void
  onSave: (data: Partial<BookingRecord>) => void
  onDelete?: () => void
}) {
  const [form, setForm] = useState(
    booking
      ? {
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
        }
      : emptyForm()
  )
  const [confirmDelete, setConfirmDelete] = useState(false)
  const nights = calcNights(form.checkIn, form.checkOut)
  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) => setForm(f => ({ ...f, [k]: v }))

  const isNew = booking === null

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
            {isNew
              ? <><Plus size={14} className="text-gold-400" /> 新規予約登録</>
              : <><Edit2 size={14} className="text-blue-400" /> 予約を編集</>
            }
          </h3>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-all">
            <X size={13} className="text-zinc-400" />
          </button>
        </div>

        <div className="space-y-3">
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
              <label className={LABEL_CLASS}>ゲスト名</label>
              <input value={form.guestName} onChange={e => set('guestName', e.target.value)} placeholder="山田 太郎" className={INPUT_CLASS} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={LABEL_CLASS}>メール</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="guest@example.com" className={INPUT_CLASS} />
            </div>
            <div>
              <label className={LABEL_CLASS}>電話</label>
              <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+81 90-XXXX-XXXX" className={INPUT_CLASS} />
            </div>
          </div>

          <div>
            <label className={LABEL_CLASS}>国籍</label>
            <input value={form.nationality} onChange={e => set('nationality', e.target.value)} placeholder="日本" className={INPUT_CLASS} />
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
          {nights > 0 && <p className="text-xs text-blue-400">{nights}泊</p>}

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
              <button onClick={onDelete} className="flex-1 bg-red-600 hover:bg-red-500 text-white rounded-xl py-2.5 text-sm font-medium transition-all">削除する</button>
              <button onClick={() => setConfirmDelete(false)} className="px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl py-2.5 text-sm transition-all">キャンセル</button>
            </>
          ) : (
            <>
              <button
                onClick={() => onSave({ ...form, nights })}
                disabled={!form.guestName.trim() || !form.checkIn || !form.checkOut}
                className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl py-2.5 text-sm font-medium transition-all flex items-center justify-center gap-1.5"
              >
                <Check size={14} /> {isNew ? '予約を登録' : '保存する'}
              </button>
              {!isNew && (
                <button onClick={() => setConfirmDelete(true)} className="w-10 flex items-center justify-center bg-zinc-800 hover:bg-red-500/20 border border-zinc-700 hover:border-red-500/30 rounded-xl transition-all">
                  <Trash2 size={14} className="text-zinc-500" />
                </button>
              )}
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

/** 招待リンクを生成してクリップボードにコピー */
function generateInviteLink(booking: BookingRecord): string {
  const encoded = btoa(encodeURIComponent(JSON.stringify(booking)))
  return `${window.location.origin}/login?invite=${encoded}`
}

/** 招待メールを送信 */
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

export default function GuestsPage() {
  const [store, update] = useStore()
  const [bookingFilter, setBookingFilter] = useState<BookingFilter>('all')
  const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null)
  const [showModal, setShowModal] = useState<'edit' | 'new' | null>(null)
  const [modalBooking, setModalBooking] = useState<BookingRecord | null>(null)
  const [msgInput, setMsgInput] = useState('')
  const [sending, setSending] = useState(false)
  const [activeSection, setActiveSection] = useState<ActiveSection>('bookings')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [emailingId, setEmailingId] = useState<string | null>(null)
  const [emailSentId, setEmailSentId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ kind: 'success' | 'error'; text: string } | null>(null)

  const showToast = (kind: 'success' | 'error', text: string) => {
    setToast({ kind, text })
    setTimeout(() => setToast(null), 3000)
  }

  const filteredBookings =
    bookingFilter === 'all'
      ? store.bookingHistory
      : store.bookingHistory.filter(b => b.status === bookingFilter)

  const pendingRequestsCount = store.serviceRequests.filter(r => r.status !== 'done').length
  const unreadMsgCount = store.messages.filter(m => m.from === 'guest' && !m.readByOwner).length
  const openMaintenanceCount = store.maintenanceItems.filter(m => m.status !== 'done').length

  const openEdit = (b: BookingRecord) => { setModalBooking(b); setShowModal('edit') }
  const openNew  = ()                  => { setModalBooking(null); setShowModal('new') }
  const closeModal = () => { setShowModal(null); setModalBooking(null) }

  const handleSave = async (data: Partial<BookingRecord>) => {
    let createdBooking: BookingRecord | null = null
    if (showModal === 'new') {
      createdBooking = addBookingRecord({
        guestName: data.guestName ?? '',
        email: data.email ?? '',
        phone: data.phone,
        nationality: data.nationality ?? '',
        flag: data.flag ?? '🇯🇵',
        checkIn: data.checkIn ?? '',
        checkOut: data.checkOut ?? '',
        adults: data.adults ?? 2,
        children: data.children ?? 0,
        nights: data.nights ?? 0,
        platform: data.platform ?? 'direct',
        revenue: data.revenue ?? 0,
        status: data.status ?? 'confirmed',
        notes: data.notes,
        specialRequests: data.specialRequests,
        registeredByManager: false,
      })
    } else if (modalBooking) {
      updateBookingRecord(modalBooking.id, data)
    }
    update({ bookingHistory: getStore().bookingHistory })
    closeModal()

    // 新規予約 & メールあり → 自動で招待メールを送信
    if (createdBooking?.email) {
      const result = await sendInviteMail(createdBooking)
      if (result.ok) {
        showToast('success', `${createdBooking.email} に招待メールを送信しました`)
      } else {
        showToast('error', `招待メール送信失敗: ${result.error ?? ''} (リンクは手動でコピーできます)`)
      }
    }
  }

  const handleDelete = () => {
    if (modalBooking) {
      deleteBookingRecord(modalBooking.id)
      update({ bookingHistory: getStore().bookingHistory })
    }
    closeModal()
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
      showToast('success', `${booking.email} に招待メールを送信しました`)
    } else {
      showToast('error', `送信失敗: ${result.error ?? ''}`)
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

  const resolveServiceRequest = (id: string) => {
    updateServiceRequest(id, { status: 'done', resolvedAt: new Date().toISOString() })
    update({ serviceRequests: getStore().serviceRequests })
  }

  const inProgressServiceRequest = (id: string) => {
    updateServiceRequest(id, { status: 'inProgress' })
    update({ serviceRequests: getStore().serviceRequests })
  }

  const resolveMaintenanceItem = (id: string) => {
    updateMaintenanceItem(id, { status: 'done', doneAt: new Date().toISOString() })
    update({ maintenanceItems: getStore().maintenanceItems })
  }

  const scheduleMaintenanceItem = (id: string) => {
    updateMaintenanceItem(id, { status: 'scheduled' })
    update({ maintenanceItems: getStore().maintenanceItems })
  }

  const sendOwnerMessage = () => {
    if (!msgInput.trim()) return
    setSending(true)
    storeSendMessage('owner', msgInput.trim())
    update({ messages: getStore().messages })
    setMsgInput('')
    setSending(false)
  }

  const sectionTabs: { key: ActiveSection; label: string; count?: number }[] = [
    { key: 'bookings',    label: '予約',       count: store.bookingHistory.length },
    { key: 'requests',    label: 'リクエスト', count: pendingRequestsCount },
    { key: 'messages',    label: 'メッセージ', count: unreadMsgCount },
    { key: 'maintenance', label: 'メンテナンス', count: openMaintenanceCount },
  ]

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-5">

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] px-4 py-2.5 rounded-2xl text-xs font-medium shadow-xl flex items-center gap-2 max-w-[90%] ${
              toast.kind === 'success'
                ? 'bg-emerald-500 text-zinc-950'
                : 'bg-red-500 text-white'
            }`}
          >
            {toast.kind === 'success' ? <Check size={14} /> : <AlertTriangle size={14} />}
            <span>{toast.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit / New modal */}
      <AnimatePresence>
        {showModal && (
          <BookingModal
            booking={showModal === 'edit' ? modalBooking : null}
            onClose={closeModal}
            onSave={handleSave}
            onDelete={showModal === 'edit' ? handleDelete : undefined}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium text-zinc-100">ゲスト管理</h1>
          <p className="text-sm text-zinc-500 mt-0.5">予約・リクエスト・メッセージ・メンテナンス</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-xl transition-all"
        >
          <Plus size={14} /> 新規予約
        </button>
      </div>

      {/* Section tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {sectionTabs.map(({ key, label, count }) => (
          <button key={key} onClick={() => setActiveSection(key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${
              activeSection === key
                ? 'border-blue-500/40 bg-blue-500/10 text-blue-300'
                : 'border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
            }`}>
            {label}
            {typeof count === 'number' && count > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeSection === key ? 'bg-blue-500/20 text-blue-300' : 'bg-zinc-800 text-zinc-500'}`}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ── BOOKINGS ── */}
        {activeSection === 'bookings' && (
          <motion.div key="bookings" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="space-y-4">
            <div className="flex items-center gap-2">
              <Filter size={12} className="text-zinc-500" />
              <div className="flex gap-2 flex-wrap">
                {bookingFilterTabs.map(({ key, label }) => {
                  const count = key === 'all' ? store.bookingHistory.length : store.bookingHistory.filter(b => b.status === key).length
                  return (
                    <button key={key} onClick={() => setBookingFilter(key)}
                      className={`px-3 py-1 rounded-xl border text-xs transition-all ${bookingFilter === key ? 'border-blue-500/40 bg-blue-500/10 text-blue-300' : 'border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}>
                      {label} <span className="ml-1.5 opacity-60">{count}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {filteredBookings.length === 0 ? (
              <div className="text-center py-12 text-zinc-600 text-sm">
                <Users size={32} className="mx-auto mb-3 opacity-30" />
                該当する予約はありません
              </div>
            ) : (
              <div className="space-y-3">
                {filteredBookings.map((booking, i) => {
                  const statusCfg = bookingStatusConfig[booking.status]
                  const platCfg = platformBadge[booking.platform] ?? platformBadge.other
                  const isExpanded = expandedBookingId === booking.id
                  return (
                    <motion.div key={booking.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                      className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                      <button onClick={() => setExpandedBookingId(isExpanded ? null : booking.id)}
                        className="w-full p-4 text-left hover:bg-zinc-800/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl flex-shrink-0">{booking.flag}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium text-zinc-100">{booking.guestName}</span>
                              <span className="text-xs text-zinc-500">{booking.nationality}</span>
                              {/* ゲスト体験フェーズ（自動計算） */}
                              <PhaseBadge checkIn={booking.checkIn} checkOut={booking.checkOut} settings={store.facilitySettings} arrivedAt={booking.arrivedAt} />
                              <span className={`text-[10px] px-2 py-0.5 rounded-full border ml-auto ${statusCfg.color}`}>{statusCfg.label}</span>
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500 flex-wrap">
                              <span className="flex items-center gap-1"><Calendar size={10} />{booking.checkIn} → {booking.checkOut}</span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded border ${platCfg.color}`}>{platCfg.label}</span>
                            </div>
                          </div>
                          {isExpanded ? <ChevronUp size={14} className="text-zinc-500 flex-shrink-0" /> : <ChevronDown size={14} className="text-zinc-500 flex-shrink-0" />}
                        </div>
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                            <div className="border-t border-zinc-800 px-4 py-4">
                              <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs mb-4">
                                <div><p className="text-zinc-500">チェックイン</p><p className="text-zinc-200 mt-0.5 font-medium">{booking.checkIn}</p></div>
                                <div><p className="text-zinc-500">チェックアウト</p><p className="text-zinc-200 mt-0.5 font-medium">{booking.checkOut}</p></div>
                                <div><p className="text-zinc-500 flex items-center gap-1"><Users size={10} /> 大人 / 子供</p><p className="text-zinc-200 mt-0.5">{booking.adults}名 / {booking.children}名</p></div>
                                <div><p className="text-zinc-500 flex items-center gap-1"><Bed size={10} /> 宿泊数</p><p className="text-zinc-200 mt-0.5">{booking.nights}泊</p></div>
                                <div><p className="text-zinc-500 flex items-center gap-1"><DollarSign size={10} /> 売上</p><p className="text-zinc-200 mt-0.5 font-medium">¥{booking.revenue.toLocaleString()}</p></div>
                                <div><p className="text-zinc-500">予約ID</p><p className="text-zinc-400 mt-0.5 font-mono text-[10px]">{booking.id}</p></div>
                              </div>
                              {booking.notes && (
                                <div className="mb-3 p-3 bg-zinc-800/50 rounded-xl">
                                  <p className="text-xs text-zinc-500 mb-1">メモ</p>
                                  <p className="text-xs text-zinc-300">{booking.notes}</p>
                                </div>
                              )}
                              {/* ボタン行 */}
                              <div className="flex gap-2 flex-wrap">
                                <button onClick={() => openEdit(booking)}
                                  className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all">
                                  <Edit2 size={11} /> 予約を編集
                                </button>
                                {/* 到着マーク / 取消 (オーナーはチェックイン前でも可) */}
                                {booking.status !== 'completed' && booking.status !== 'cancelled' && (
                                  !booking.arrivedAt ? (
                                    <button onClick={() => handleMarkArrived(booking.id)}
                                      className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all">
                                      <MapPin size={11} /> 到着済みにする
                                    </button>
                                  ) : (
                                    <button onClick={() => handleCancelArrival(booking.id)}
                                      className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:bg-zinc-700/50 transition-all">
                                      <X size={11} /> 到着取消
                                    </button>
                                  )
                                )}
                                {booking.email && (
                                  <>
                                    <button onClick={() => handleResendInvite(booking)}
                                      disabled={emailingId === booking.id}
                                      className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border transition-all ${
                                        emailSentId === booking.id
                                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                                          : 'border-gold-500/30 bg-gold-500/10 text-gold-400 hover:bg-gold-500/20 disabled:opacity-50'
                                      }`}>
                                      {emailSentId === booking.id
                                        ? <><Check size={11} /> 送信済み</>
                                        : emailingId === booking.id
                                          ? <><Mail size={11} className="animate-pulse" /> 送信中…</>
                                          : <><Mail size={11} /> 招待メールを送信</>
                                      }
                                    </button>
                                    <button onClick={() => copyInviteLink(booking)}
                                      className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border transition-all ${
                                        copiedId === booking.id
                                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                                          : 'border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:bg-zinc-700/50'
                                      }`}>
                                      {copiedId === booking.id
                                        ? <><Check size={11} /> コピー済み</>
                                        : <><Link2 size={11} /> リンクをコピー</>
                                      }
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* ── SERVICE REQUESTS ── */}
        {activeSection === 'requests' && (
          <motion.div key="requests" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="space-y-3">
            {store.serviceRequests.length === 0 ? (
              <div className="text-center py-12 text-zinc-600 text-sm"><CheckCircle2 size={32} className="mx-auto mb-3 opacity-30" /><p>サービスリクエストはありません</p></div>
            ) : (
              store.serviceRequests.map((req, i) => {
                const sCfg = serviceStatusConfig[req.status]
                return (
                  <motion.div key={req.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className={`bg-zinc-900 border rounded-2xl p-4 transition-all ${req.status === 'done' ? 'border-zinc-800 opacity-60' : 'border-zinc-700'}`}>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-lg flex-shrink-0">{serviceTypeEmoji[req.type]}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-zinc-100">{req.label}</span>
                          {req.priority === 'urgent' && (
                            <span className="flex items-center gap-1 text-[10px] text-red-400 border border-red-500/30 bg-red-500/10 px-1.5 py-0.5 rounded-full"><AlertTriangle size={9} /> 急ぎ</span>
                          )}
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border ml-auto ${sCfg.color}`}>{sCfg.label}</span>
                        </div>
                        {req.description && req.description !== req.label && <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{req.description}</p>}
                        <div className="flex items-center gap-1 mt-1"><Clock size={9} className="text-zinc-600" /><span className="text-[10px] text-zinc-600">{new Date(req.createdAt).toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span></div>
                        {req.status !== 'done' && (
                          <div className="flex gap-2 mt-3">
                            {req.status === 'pending' && (
                              <button onClick={() => inProgressServiceRequest(req.id)} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-all">対応中にする</button>
                            )}
                            <button onClick={() => resolveServiceRequest(req.id)} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all"><CheckCircle2 size={11} /> 解決済み</button>
                          </div>
                        )}
                        {req.status === 'done' && req.resolvedAt && <p className="text-[10px] text-zinc-600 mt-2">解決: {new Date(req.resolvedAt).toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>}
                      </div>
                    </div>
                  </motion.div>
                )
              })
            )}
          </motion.div>
        )}

        {/* ── MESSAGES ── */}
        {activeSection === 'messages' && (
          <motion.div key="messages" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="space-y-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-zinc-800 flex items-center gap-2">
                <MessageSquare size={14} className="text-blue-400" />
                <span className="text-sm font-medium text-zinc-200">ゲストとのメッセージ</span>
                {unreadMsgCount > 0 && <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400">未読 {unreadMsgCount}件</span>}
              </div>
              <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                {store.messages.length === 0 ? (
                  <p className="text-center text-zinc-600 text-sm py-8">メッセージはありません</p>
                ) : (
                  store.messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.from === 'owner' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${msg.from === 'owner' ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-200'}`}>
                        <p className="text-xs leading-relaxed">{msg.content}</p>
                        <div className={`flex items-center gap-1.5 mt-1 ${msg.from === 'owner' ? 'justify-end' : 'justify-start'}`}>
                          <span className={`text-[10px] ${msg.from === 'owner' ? 'text-blue-200' : 'text-zinc-500'}`}>{msg.from === 'owner' ? 'オーナー' : 'ゲスト'} · {msg.createdAt}</span>
                          {msg.from === 'owner' && <span className={`text-[9px] ${msg.readByGuest ? 'text-blue-200' : 'text-blue-400/50'}`}>{msg.readByGuest ? '既読' : '未読'}</span>}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-4 border-t border-zinc-800">
                <div className="flex gap-2">
                  <input value={msgInput} onChange={e => setMsgInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendOwnerMessage()}
                    placeholder="ゲストへメッセージを送信..."
                    className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/40 transition-all" />
                  <button onClick={sendOwnerMessage} disabled={!msgInput.trim() || sending}
                    className="w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-500 flex items-center justify-center transition-all disabled:opacity-40 flex-shrink-0">
                    <Send size={14} className="text-white" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── MAINTENANCE ── */}
        {activeSection === 'maintenance' && (
          <motion.div key="maintenance" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="space-y-3">
            {store.maintenanceItems.length === 0 ? (
              <div className="text-center py-12 text-zinc-600 text-sm"><Wrench size={32} className="mx-auto mb-3 opacity-30" /><p>メンテナンス案件はありません</p></div>
            ) : (
              store.maintenanceItems.map((item, i) => {
                const priCfg = maintenancePriorityConfig[item.priority]
                const staCfg = maintenanceStatusConfig[item.status]
                return (
                  <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className={`bg-zinc-900 border rounded-2xl p-4 transition-all ${item.status === 'done' ? 'border-zinc-800 opacity-60' : 'border-zinc-700'}`}>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center flex-shrink-0"><Wrench size={15} className="text-zinc-400" /></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-zinc-100">{item.description}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${priCfg.color}`}>{priCfg.label}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ml-auto ${staCfg.color}`}>{staCfg.label}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-[10px] text-zinc-500">
                          <span>{item.area}</span>
                          <span>報告者: {item.reportedBy === 'guest' ? 'ゲスト' : item.reportedBy === 'owner' ? 'オーナー' : '管理会社'}</span>
                          <span>{new Date(item.reportedAt).toLocaleDateString('ja-JP')}</span>
                        </div>
                        {item.status !== 'done' && (
                          <div className="flex gap-2 mt-3">
                            {item.status === 'open' && (
                              <button onClick={() => scheduleMaintenanceItem(item.id)} className="text-xs px-3 py-1.5 rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all">予定に入れる</button>
                            )}
                            <button onClick={() => resolveMaintenanceItem(item.id)} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all"><CheckCircle2 size={11} /> 完了</button>
                          </div>
                        )}
                        {item.status === 'done' && item.doneAt && <p className="text-[10px] text-zinc-600 mt-2">完了: {new Date(item.doneAt).toLocaleDateString('ja-JP')}</p>}
                      </div>
                    </div>
                  </motion.div>
                )
              })
            )}
          </motion.div>
        )}

      </AnimatePresence>
    </motion.div>
  )
}
