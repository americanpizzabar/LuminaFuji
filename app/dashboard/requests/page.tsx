'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, CheckCircle2, Clock, AlertTriangle, Send } from 'lucide-react'
import Link from 'next/link'
import { useStore } from '@/lib/useStore'
import { useLanguage } from '@/lib/useLanguage'
import { addServiceRequest, ServiceRequest } from '@/lib/store'

const REQUEST_EMOJIS = {
  towels: '🛁', amenities: '🧴', temperature: '🌡️',
  maintenance: '🔧', taxi: '🚕', other: '✉️',
}
const REQUEST_TYPES = ['towels', 'amenities', 'temperature', 'maintenance', 'taxi', 'other'] as const

export default function RequestsPage() {
  const [store, updateStore] = useStore()
  const { t } = useLanguage()
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [description, setDescription] = useState('')
  const [urgent, setUrgent] = useState(false)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const myRequests = store.serviceRequests

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedType) return
    setSending(true)
    await new Promise(r => setTimeout(r, 800))

    addServiceRequest({
      type: selectedType as ServiceRequest['type'],
      label: t(`requests.types.${selectedType}`),
      description: description || t(`requests.types.${selectedType}Sub`),
      priority: urgent ? 'urgent' : 'normal',
    })
    updateStore({ serviceRequests: [...store.serviceRequests] }) // trigger re-read

    setSending(false)
    setSent(true)
    setSelectedType(null)
    setDescription('')
    setUrgent(false)
    setTimeout(() => setSent(false), 3000)

    // Re-fetch from store
    const updated = (await import('@/lib/store')).getStore()
    updateStore({ serviceRequests: updated.serviceRequests })
  }

  return (
    <div className="page-container">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard" className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-all">
          <ArrowLeft size={18} className="text-zinc-300" />
        </Link>
        <div>
          <h1 className="text-lg font-medium text-zinc-100">{t('requests.title')}</h1>
          <p className="text-xs text-zinc-300">{t('requests.subtitle')}</p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        {/* Form */}
        <div className="card p-5 mb-5">
          <p className="text-sm font-medium text-zinc-300 mb-4">{t('requests.selectType')}</p>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {REQUEST_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(selectedType === type ? null : type)}
                className={`flex items-start gap-2 p-3 rounded-xl border text-left transition-all ${
                  selectedType === type
                    ? 'border-gold-500/40 bg-gold-500/8 text-gold-300'
                    : 'border-zinc-800 hover:border-zinc-700 text-zinc-400'
                }`}
              >
                <span className="text-xl flex-shrink-0">{REQUEST_EMOJIS[type]}</span>
                <div>
                  <p className="text-xs font-medium leading-tight">{t(`requests.types.${type}`)}</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">{t(`requests.types.${type}Sub`)}</p>
                </div>
              </button>
            ))}
          </div>

          <AnimatePresence>
            {selectedType && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleSubmit}
                className="overflow-hidden"
              >
                <div className="border-t border-zinc-800 pt-4 space-y-3">
                  <div>
                    <label className="text-xs text-zinc-300 mb-1.5 block">{t('requests.detail')}</label>
                    <textarea
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder={t('requests.detailPlaceholder')}
                      rows={2}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-gold-500/40 transition-all resize-none"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setUrgent(!urgent)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs transition-all ${
                        urgent
                          ? 'border-red-500/40 bg-red-500/10 text-red-400'
                          : 'border-zinc-700 text-zinc-300'
                      }`}
                    >
                      <AlertTriangle size={13} />
                      {t('requests.urgentLabel')}
                    </button>
                    <button
                      type="submit"
                      disabled={sending}
                      className="btn-gold flex items-center gap-2 text-sm py-2.5 px-5"
                    >
                      {sending ? (
                        <div className="w-4 h-4 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin" />
                      ) : (
                        <><Send size={14} /> {t('requests.send')}</>
                      )}
                    </button>
                  </div>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {sent && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 mt-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl"
              >
                <CheckCircle2 size={15} className="text-emerald-400" />
                <p className="text-xs text-emerald-300">{t('requests.sent')}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Past requests */}
        {myRequests.length > 0 && (
          <div>
            <p className="section-title mb-3">{t('requests.history')}</p>
            <div className="space-y-2">
              {myRequests.map((req, i) => {
                const statusColor = req.status === 'pending' ? 'text-amber-400 border-amber-500/30 bg-amber-500/10' : req.status === 'inProgress' ? 'text-blue-400 border-blue-500/30 bg-blue-500/10' : 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                const StatusIcon = req.status === 'done' ? CheckCircle2 : Clock
                return (
                  <motion.div
                    key={req.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="card p-4 flex items-start gap-3"
                  >
                    <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-xl flex-shrink-0">
                      {REQUEST_EMOJIS[req.type as keyof typeof REQUEST_EMOJIS] ?? '✉️'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <p className="text-sm font-medium text-zinc-200">{req.label}</p>
                        <span className={`text-[11px] px-2 py-0.5 rounded-full border flex-shrink-0 ${statusColor}`}>
                          {t(`requests.status.${req.status}`)}
                        </span>
                      </div>
                      {req.description && (
                        <p className="text-xs text-zinc-300 mt-0.5">{req.description}</p>
                      )}
                      {req.ownerNote && (
                        <p className="text-xs text-blue-400 mt-1 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                          {req.ownerNote}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-[11px] text-zinc-400">
                          {new Date(req.createdAt).toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                        {req.priority === 'urgent' && (
                          <span className="text-[11px] text-red-400 flex items-center gap-0.5">
                            <AlertTriangle size={9} /> {t('common.urgent')}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        )}

        {myRequests.length === 0 && !selectedType && (
          <div className="text-center py-8">
            <p className="text-zinc-400 text-sm">{t('requests.noRequests')}</p>
            <p className="text-zinc-400 text-xs mt-1">{t('requests.noRequestsHint')}</p>
          </div>
        )}
      </motion.div>
    </div>
  )
}
