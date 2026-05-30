'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mail, Phone, Video, Building2, Star, Clock,
  X, FileText, CheckCircle2, TrendingUp,
} from 'lucide-react'
import { useStore } from '@/lib/useStore'
import { getStore, updateConsultRequest } from '@/lib/store'
import type { ConsultRequest, ConsultStatus } from '@/lib/store'

type FilterStatus = 'all' | ConsultStatus

const statusConfig: Record<ConsultStatus, { label: string; color: string; dot: string }> = {
  new:       { label: '新着',   color: 'text-red-400 border-red-500/30 bg-red-500/10',       dot: 'bg-red-400' },
  contacted: { label: '連絡済', color: 'text-amber-400 border-amber-500/30 bg-amber-500/10', dot: 'bg-amber-400' },
  quoted:    { label: '見積済', color: 'text-blue-400 border-blue-500/30 bg-blue-500/10',     dot: 'bg-blue-400' },
  won:       { label: '受注',   color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10', dot: 'bg-emerald-400' },
  lost:      { label: '失注',   color: 'text-zinc-400 border-zinc-600 bg-zinc-800',           dot: 'bg-zinc-500' },
}

const contactMethodConfig: Record<ConsultRequest['contactMethod'], { label: string; icon: typeof Mail }> = {
  email:  { label: 'メール', icon: Mail },
  phone:  { label: '電話',   icon: Phone },
  online: { label: 'オンライン', icon: Video },
}

const filterTabs: { key: FilterStatus; label: string }[] = [
  { key: 'all',       label: 'すべて' },
  { key: 'new',       label: '新着' },
  { key: 'contacted', label: '連絡済' },
  { key: 'quoted',    label: '見積済' },
  { key: 'won',       label: '受注' },
  { key: 'lost',      label: '失注' },
]

const productLabels: Record<string, string> = {
  'brite-3':      'Brite 3',
  'luna-series':  'Luna Series',
  'aria-strip':   'Aria Strip',
  'nexus-module': 'Nexus Module',
}

const STATUS_FLOW: ConsultStatus[] = ['new', 'contacted', 'quoted', 'won', 'lost']

export default function ConsultsPage() {
  const [store, update] = useStore()
  const [filter, setFilter] = useState<FilterStatus>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [notesInput, setNotesInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [savedId, setSavedId] = useState<string | null>(null)

  const requests = store.consultRequests
  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter)
  const selected = requests.find(r => r.id === selectedId) ?? null

  const totalCount = requests.length
  const newCount = requests.filter(r => r.status === 'new').length
  const wonCount = requests.filter(r => r.status === 'won').length
  const conversionRate = totalCount > 0 ? Math.round((wonCount / totalCount) * 100) : 0

  const openDetail = (req: ConsultRequest) => {
    setSelectedId(req.id)
    setNotesInput(req.ownerNotes ?? '')
  }

  const closeDetail = () => {
    setSelectedId(null)
    setNotesInput('')
  }

  const changeStatus = (id: string, status: ConsultStatus) => {
    updateConsultRequest(id, { status })
    update({ consultRequests: getStore().consultRequests })
    if (selectedId === id) {
      // keep modal open with updated state
    }
  }

  const saveNotes = (id: string) => {
    setSaving(true)
    updateConsultRequest(id, { ownerNotes: notesInput })
    update({ consultRequests: getStore().consultRequests })
    setSavedId(id)
    setTimeout(() => { setSaving(false); setSavedId(null) }, 1800)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-5"
    >
      {/* Header */}
      <div>
        <h1 className="text-xl font-medium text-zinc-100">リード管理 CRM</h1>
        <p className="text-sm text-zinc-300 mt-0.5">照明コンサル相談・商談管理</p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <p className="text-[11px] text-zinc-300 mb-1 uppercase tracking-wider">合計リード</p>
          <p className="text-2xl font-light text-zinc-100">{totalCount}</p>
        </div>
        <div className="bg-zinc-900 border border-red-500/20 rounded-2xl p-4">
          <p className="text-[11px] text-red-400 mb-1 uppercase tracking-wider">未対応</p>
          <p className="text-2xl font-light text-red-400">{newCount}</p>
        </div>
        <div className="bg-zinc-900 border border-emerald-500/20 rounded-2xl p-4">
          <div className="flex items-center gap-1 mb-1">
            <TrendingUp size={10} className="text-emerald-400" />
            <p className="text-[11px] text-emerald-400 uppercase tracking-wider">受注率</p>
          </div>
          <p className="text-2xl font-light text-emerald-400">{conversionRate}%</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {filterTabs.map(({ key, label }) => {
          const count = key === 'all' ? requests.length : requests.filter(r => r.status === key).length
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                filter === key
                  ? 'border-blue-500/40 bg-blue-500/10 text-blue-300'
                  : 'border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:text-zinc-300'
              }`}
            >
              {key !== 'all' && (
                <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[key as ConsultStatus].dot}`} />
              )}
              {label}
              {count > 0 && (
                <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                  filter === key ? 'bg-blue-500/20 text-blue-300' : 'bg-zinc-800 text-zinc-300'
                }`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={closeDetail}
          >
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              className="bg-zinc-900 border border-zinc-700 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto"
            >
              {/* Modal header */}
              <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 px-5 py-4 flex items-start justify-between">
                <div className="flex-1 min-w-0 pr-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-medium text-zinc-100">{selected.name}</h2>
                    {selected.source === 'lumina_fuji_stay' && (
                      <span className="flex items-center gap-1 text-[11px] text-amber-400 border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 rounded-full">
                        <Star size={8} className="fill-amber-400" /> 宿泊経験者
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-300 mt-0.5">{selected.profession}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] px-2 py-0.5 rounded-full border ${statusConfig[selected.status].color}`}>
                    {statusConfig[selected.status].label}
                  </span>
                  <button
                    onClick={closeDetail}
                    className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-all"
                  >
                    <X size={13} className="text-zinc-400" />
                  </button>
                </div>
              </div>

              <div className="p-5 space-y-5">
                {/* Contact info */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-zinc-300 mb-1">メール</p>
                    <p className="text-zinc-300 break-all">{selected.email}</p>
                  </div>
                  {selected.phone && (
                    <div>
                      <p className="text-zinc-300 mb-1">電話</p>
                      <p className="text-zinc-300">{selected.phone}</p>
                    </div>
                  )}
                  {selected.company && (
                    <div>
                      <p className="text-zinc-300 mb-1">会社・事務所</p>
                      <p className="text-zinc-300">{selected.company}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-zinc-300 mb-1">希望連絡方法</p>
                    <div className="flex items-center gap-1 text-zinc-300">
                      {(() => {
                        const cfg = contactMethodConfig[selected.contactMethod]
                        const Icon = cfg.icon
                        return <><Icon size={11} /> {cfg.label}</>
                      })()}
                    </div>
                  </div>
                  <div>
                    <p className="text-zinc-300 mb-1">提出日時</p>
                    <p className="text-zinc-300">{selected.submittedAt}</p>
                  </div>
                </div>

                {/* Project details */}
                <div className="bg-zinc-800/50 rounded-xl p-4 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-zinc-300 mb-1">プロジェクト種別</p>
                    <p className="text-zinc-200 font-medium">{selected.projectType}</p>
                  </div>
                  <div>
                    <p className="text-zinc-300 mb-1">規模</p>
                    <p className="text-zinc-200">{selected.scale}</p>
                  </div>
                  <div>
                    <p className="text-zinc-300 mb-1">予算感</p>
                    <p className="text-zinc-200">{selected.budget}</p>
                  </div>
                  {selected.timeline && (
                    <div>
                      <p className="text-zinc-300 mb-1">希望時期</p>
                      <p className="text-zinc-200">{selected.timeline}</p>
                    </div>
                  )}
                </div>

                {/* Interested products */}
                {selected.interestedProducts.length > 0 && (
                  <div>
                    <p className="text-xs text-zinc-300 mb-2">興味のある製品</p>
                    <div className="flex flex-wrap gap-2">
                      {selected.interestedProducts.map(pid => (
                        <span key={pid} className="text-xs px-2.5 py-1 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-300">
                          {productLabels[pid] ?? pid}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Message */}
                <div>
                  <p className="text-xs text-zinc-300 mb-2 flex items-center gap-1">
                    <FileText size={11} /> ご要望・メッセージ
                  </p>
                  <div className="bg-zinc-800/50 rounded-xl p-3">
                    <p className="text-xs text-zinc-300 leading-relaxed">{selected.message}</p>
                  </div>
                </div>

                {/* Owner notes */}
                <div>
                  <p className="text-xs text-zinc-300 mb-2">オーナーメモ</p>
                  <textarea
                    value={notesInput}
                    onChange={e => setNotesInput(e.target.value)}
                    placeholder="対応履歴・メモを記入..."
                    rows={3}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-blue-500/40 transition-all resize-none"
                  />
                  <button
                    onClick={() => saveNotes(selected.id)}
                    disabled={saving}
                    className="mt-2 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all disabled:opacity-50"
                  >
                    {savedId === selected.id ? (
                      <><CheckCircle2 size={11} /> 保存しました</>
                    ) : (
                      'メモを保存'
                    )}
                  </button>
                </div>

                {/* Status change */}
                <div>
                  <p className="text-xs text-zinc-300 mb-2">ステータス変更</p>
                  <div className="flex flex-wrap gap-2">
                    {STATUS_FLOW.map(s => (
                      <button
                        key={s}
                        onClick={() => changeStatus(selected.id, s)}
                        disabled={selected.status === s}
                        className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                          selected.status === s
                            ? `${statusConfig[s].color} cursor-default`
                            : 'border-zinc-700 text-zinc-300 hover:border-zinc-600 hover:text-zinc-300'
                        }`}
                      >
                        {statusConfig[s].label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card list */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-zinc-400 text-sm">
          <Building2 size={32} className="mx-auto mb-3 opacity-30" />
          <p>該当するリードはありません</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((req, i) => {
            const cfg = statusConfig[req.status]
            const ContactIcon = contactMethodConfig[req.contactMethod].icon
            return (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => openDetail(req)}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 cursor-pointer hover:border-zinc-700 transition-all active:scale-[0.99]"
              >
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div className="flex items-start gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center flex-shrink-0">
                      <Building2 size={15} className="text-zinc-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-zinc-100">{req.name}</p>
                        {req.source === 'lumina_fuji_stay' && (
                          <Star size={11} className="text-amber-400 fill-amber-400 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-zinc-300">{req.profession}</p>
                      {req.company && (
                        <p className="text-xs text-zinc-400">{req.company}</p>
                      )}
                    </div>
                  </div>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full border flex-shrink-0 ${cfg.color}`}>
                    {cfg.label}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-zinc-300 flex-wrap">
                  <span>{req.projectType}</span>
                  <span className="text-zinc-400">·</span>
                  <span>{req.scale}</span>
                  <span className="text-zinc-400">·</span>
                  <span>{req.budget}</span>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                    <Clock size={9} />
                    {req.submittedAt}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ContactIcon size={11} className="text-zinc-400" />
                    {req.interestedProducts.length > 0 && (
                      <div className="flex gap-1">
                        {req.interestedProducts.slice(0, 2).map(pid => (
                          <span key={pid} className="text-[11px] px-1.5 py-0.5 rounded border border-amber-500/20 bg-amber-500/5 text-amber-400">
                            {productLabels[pid] ?? pid}
                          </span>
                        ))}
                        {req.interestedProducts.length > 2 && (
                          <span className="text-[11px] text-zinc-400">+{req.interestedProducts.length - 2}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {req.ownerNotes && (
                  <div className="mt-2.5 p-2 bg-zinc-800/50 rounded-lg">
                    <p className="text-[11px] text-zinc-300 leading-relaxed line-clamp-1">
                      メモ: {req.ownerNotes}
                    </p>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
