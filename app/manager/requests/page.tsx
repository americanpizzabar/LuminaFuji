'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/lib/useStore'
import {
  timeElapsed, durationLabel,
  respondToServiceRequest, completeServiceRequest, updateServiceRequest,
  getStore,
} from '@/lib/store'
import type { ServiceRequest, ServiceStatus } from '@/lib/store'
import { Bell, Clock, CheckCircle2, AlertTriangle, MessageSquare } from 'lucide-react'

// ─── Config maps ──────────────────────────────────────────────────────────────

const TYPE_EMOJI: Record<ServiceRequest['type'], string> = {
  towels: '🛁',
  amenities: '🧴',
  temperature: '🌡️',
  maintenance: '🔧',
  taxi: '🚕',
  other: '✉️',
}

const STATUS_CONFIG: Record<ServiceStatus, { label: string; color: string; dot: string }> = {
  pending:    { label: '未対応',  color: 'text-amber-400 border-amber-500/30 bg-amber-500/10',   dot: 'bg-amber-400' },
  inProgress: { label: '対応中',  color: 'text-blue-400 border-blue-500/30 bg-blue-500/10',      dot: 'bg-blue-400' },
  done:       { label: '完了',    color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10', dot: 'bg-emerald-400' },
}

type Tab = 'pending' | 'inProgress' | 'done' | 'all'

const TABS: { id: Tab; label: string }[] = [
  { id: 'pending',    label: '未対応' },
  { id: 'inProgress', label: '対応中' },
  { id: 'done',       label: '完了' },
  { id: 'all',        label: '全履歴' },
]

// ─── Helper ───────────────────────────────────────────────────────────────────

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('ja-JP', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

// ─── Request card ─────────────────────────────────────────────────────────────

function RequestCard({
  req,
  onRespond,
  onComplete,
  onSaveNote,
}: {
  req: ServiceRequest
  onRespond: (id: string) => void
  onComplete: (id: string) => void
  onSaveNote: (id: string, note: string) => void
}) {
  const [showNote, setShowNote] = useState(false)
  const [noteText, setNoteText] = useState(req.ownerNote ?? '')

  const statusCfg = STATUS_CONFIG[req.status]
  const emoji = TYPE_EMOJI[req.type]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3"
    >
      {/* Top row */}
      <div className="flex items-start gap-3">
        {/* Emoji */}
        <div className="flex-shrink-0 w-11 h-11 bg-zinc-800 rounded-xl flex items-center justify-center text-2xl">
          {emoji}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-zinc-100">{req.label}</span>
            {req.priority === 'urgent' && (
              <span className="flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-400">
                <AlertTriangle size={9} /> 急ぎ
              </span>
            )}
            <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${statusCfg.color}`}>
              {statusCfg.label}
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">{req.description}</p>
          <p className="text-sm font-medium text-teal-300 mt-1">{req.guestName ?? 'ゲスト'}</p>
        </div>
      </div>

      {/* Time info */}
      <div className="flex flex-wrap gap-3 text-[11px] text-zinc-300">
        <span className="flex items-center gap-1">
          <Clock size={10} />
          {formatDateTime(req.createdAt)}
        </span>
        <span className="flex items-center gap-1 text-zinc-400">
          <Bell size={10} />
          {timeElapsed(req.createdAt)}
        </span>
        {req.status === 'inProgress' && req.respondedAt && (
          <span className="flex items-center gap-1 text-blue-400">
            <CheckCircle2 size={10} />
            対応開始: {formatDateTime(req.respondedAt)} ・ 対応開始まで: {durationLabel(req.createdAt, req.respondedAt)}
          </span>
        )}
        {req.status === 'done' && req.completedAt && (
          <span className="flex items-center gap-1 text-emerald-400">
            <CheckCircle2 size={10} />
            完了: {formatDateTime(req.completedAt)} ・ 完了まで: {durationLabel(req.createdAt, req.completedAt)}
          </span>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        {req.status === 'pending' && (
          <button
            onClick={() => onRespond(req.id)}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all active:scale-95"
          >
            <Clock size={11} /> 対応開始
          </button>
        )}
        {req.status === 'inProgress' && (
          <button
            onClick={() => onComplete(req.id)}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition-all active:scale-95"
          >
            <CheckCircle2 size={11} /> 完了にする
          </button>
        )}
        <button
          onClick={() => setShowNote(v => !v)}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border font-medium transition-all ${
            showNote
              ? 'bg-teal-600/20 border-teal-500/40 text-teal-300'
              : 'border-zinc-700 text-zinc-300 hover:text-zinc-300 hover:border-zinc-600'
          }`}
        >
          <MessageSquare size={11} /> メモ
        </button>
      </div>

      {/* Inline note editor */}
      <AnimatePresence>
        {showNote && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <textarea
              rows={3}
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              placeholder="スタッフメモを入力..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-teal-500/40 transition-all resize-none mt-1"
            />
            <button
              onClick={() => {
                onSaveNote(req.id, noteText)
                setShowNote(false)
              }}
              className="mt-2 text-xs px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-medium transition-all"
            >
              保存
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ManagerRequestsPage() {
  const [store, update] = useStore()
  const [tab, setTab] = useState<Tab>('pending')

  const all = store.serviceRequests

  // Summary stats
  const total = all.length
  const pendingCount = all.filter(r => r.status === 'pending').length
  const completed = all.filter(r => r.status === 'done' && r.completedAt)
  const completionRate = total > 0 ? Math.round((completed.length / total) * 100) : 0
  const avgResponseMs = completed.length > 0
    ? completed.reduce((sum, r) => sum + (new Date(r.completedAt!).getTime() - new Date(r.createdAt).getTime()), 0) / completed.length
    : 0
  const avgResponseMin = Math.round(avgResponseMs / 60000)

  // Filtered list
  const filtered = tab === 'all'
    ? all
    : all.filter(r => r.status === tab)

  // Tab counts
  const counts: Record<Tab, number> = {
    pending:    all.filter(r => r.status === 'pending').length,
    inProgress: all.filter(r => r.status === 'inProgress').length,
    done:       all.filter(r => r.status === 'done').length,
    all:        all.length,
  }

  const handleRespond = (id: string) => {
    respondToServiceRequest(id)
    update({ serviceRequests: getStore().serviceRequests })
  }

  const handleComplete = (id: string) => {
    completeServiceRequest(id)
    update({ serviceRequests: getStore().serviceRequests })
  }

  const handleSaveNote = (id: string, ownerNote: string) => {
    updateServiceRequest(id, { ownerNote })
    update({ serviceRequests: getStore().serviceRequests })
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-medium text-zinc-100">リクエスト管理</h1>
        <p className="text-sm text-zinc-300 mt-0.5">ゲストからのサービスリクエスト・対応履歴</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          {
            label: '総リクエスト',
            value: String(total),
            sub: '件',
            icon: Bell,
            color: 'text-teal-400',
            bg: 'bg-teal-500/10 border-teal-500/20',
          },
          {
            label: '未対応',
            value: String(pendingCount),
            sub: '件',
            icon: AlertTriangle,
            color: pendingCount > 0 ? 'text-amber-400' : 'text-zinc-300',
            bg: pendingCount > 0 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-zinc-800/50 border-zinc-700',
          },
          {
            label: '平均対応時間',
            value: avgResponseMin > 0 ? String(avgResponseMin) : '—',
            sub: avgResponseMin > 0 ? '分' : '',
            icon: Clock,
            color: 'text-blue-400',
            bg: 'bg-blue-500/10 border-blue-500/20',
          },
          {
            label: '完了率',
            value: String(completionRate),
            sub: '%',
            icon: CheckCircle2,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10 border-emerald-500/20',
          },
        ].map(({ label, value, sub, icon: Icon, color, bg }) => (
          <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <div className={`w-8 h-8 rounded-xl border flex items-center justify-center mb-2 ${bg}`}>
              <Icon size={15} className={color} />
            </div>
            <p className="text-lg font-light text-zinc-100">
              {value}<span className="text-sm text-zinc-300 ml-0.5">{sub}</span>
            </p>
            <p className="text-xs text-zinc-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Tab switcher */}
      <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl p-1 gap-1">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
              tab === id ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-300 hover:text-zinc-300'
            }`}
          >
            {label}
            {counts[id] > 0 && (
              <span className={`ml-1 ${id === 'pending' ? 'text-amber-400' : id === 'inProgress' ? 'text-blue-400' : 'text-zinc-300'}`}>
                {counts[id]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Request list */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-zinc-400 text-sm">
          {tab === 'pending' ? '未対応のリクエストはありません ✓' : 'リクエストはありません'}
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-3">
            {filtered.map(req => (
              <RequestCard
                key={req.id}
                req={req}
                onRespond={handleRespond}
                onComplete={handleComplete}
                onSaveNote={handleSaveNote}
              />
            ))}
          </div>
        </AnimatePresence>
      )}
    </motion.div>
  )
}
