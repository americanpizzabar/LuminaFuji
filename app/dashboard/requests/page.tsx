'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, CheckCircle2, Clock, AlertTriangle, Send } from 'lucide-react'
import Link from 'next/link'
import { useStore } from '@/lib/useStore'
import { addServiceRequest, updateServiceRequest, ServiceRequest } from '@/lib/store'

const REQUEST_TYPES = [
  { type: 'towels', label: 'タオル・リネン', labelEn: 'Towels & Linen', emoji: '🛁', desc: '交換・追加' },
  { type: 'amenities', label: 'アメニティ補充', labelEn: 'Amenities Refill', emoji: '🧴', desc: 'シャンプー・石鹸など' },
  { type: 'temperature', label: '温度調整', labelEn: 'Temperature', emoji: '🌡️', desc: '暖房・冷房の調整' },
  { type: 'maintenance', label: '修理・不具合', labelEn: 'Maintenance', emoji: '🔧', desc: '設備の不具合報告' },
  { type: 'taxi', label: 'タクシー手配', labelEn: 'Taxi / Transfer', emoji: '🚕', desc: '送迎・交通手配' },
  { type: 'other', label: 'その他', labelEn: 'Other', emoji: '✉️', desc: '自由に記入' },
] as const

const STATUS_CONFIG = {
  pending: { label: '受付中', color: 'text-amber-400 border-amber-500/30 bg-amber-500/10', icon: Clock },
  inProgress: { label: '対応中', color: 'text-blue-400 border-blue-500/30 bg-blue-500/10', icon: Clock },
  done: { label: '完了', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10', icon: CheckCircle2 },
}

export default function RequestsPage() {
  const [store, updateStore] = useStore()
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

    const type = REQUEST_TYPES.find(t => t.type === selectedType)!
    addServiceRequest({
      type: selectedType as ServiceRequest['type'],
      label: type.label,
      description: description || type.desc,
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
          <h1 className="text-lg font-medium text-zinc-100">サービスリクエスト</h1>
          <p className="text-xs text-zinc-500">Service Request · ホストに通知されます</p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        {/* Form */}
        <div className="card p-5 mb-5">
          <p className="text-sm font-medium text-zinc-300 mb-4">リクエストの種類を選択</p>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {REQUEST_TYPES.map(({ type, label, emoji, desc }) => (
              <button
                key={type}
                onClick={() => setSelectedType(selectedType === type ? null : type)}
                className={`flex items-start gap-2 p-3 rounded-xl border text-left transition-all ${
                  selectedType === type
                    ? 'border-gold-500/40 bg-gold-500/8 text-gold-300'
                    : 'border-zinc-800 hover:border-zinc-700 text-zinc-400'
                }`}
              >
                <span className="text-xl flex-shrink-0">{emoji}</span>
                <div>
                  <p className="text-xs font-medium leading-tight">{label}</p>
                  <p className="text-[10px] text-zinc-600 mt-0.5">{desc}</p>
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
                    <label className="text-xs text-zinc-500 mb-1.5 block">詳細（任意）</label>
                    <textarea
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="具体的なご要望があればお書きください..."
                      rows={2}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-gold-500/40 transition-all resize-none"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setUrgent(!urgent)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs transition-all ${
                        urgent
                          ? 'border-red-500/40 bg-red-500/10 text-red-400'
                          : 'border-zinc-700 text-zinc-500'
                      }`}
                    >
                      <AlertTriangle size={13} />
                      急ぎ / Urgent
                    </button>
                    <button
                      type="submit"
                      disabled={sending}
                      className="btn-gold flex items-center gap-2 text-sm py-2.5 px-5"
                    >
                      {sending ? (
                        <div className="w-4 h-4 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin" />
                      ) : (
                        <><Send size={14} /> 送信する</>
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
                <p className="text-xs text-emerald-300">リクエストを送信しました。ホストが対応いたします。</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Past requests */}
        {myRequests.length > 0 && (
          <div>
            <p className="section-title mb-3">リクエスト履歴</p>
            <div className="space-y-2">
              {myRequests.map((req, i) => {
                const cfg = STATUS_CONFIG[req.status]
                const StatusIcon = cfg.icon
                return (
                  <motion.div
                    key={req.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="card p-4 flex items-start gap-3"
                  >
                    <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-xl flex-shrink-0">
                      {REQUEST_TYPES.find(t => t.type === req.type)?.emoji ?? '✉️'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <p className="text-sm font-medium text-zinc-200">{req.label}</p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border flex-shrink-0 ${cfg.color}`}>
                          {cfg.label}
                        </span>
                      </div>
                      {req.description && req.description !== REQUEST_TYPES.find(t => t.type === req.type)?.desc && (
                        <p className="text-xs text-zinc-500 mt-0.5">{req.description}</p>
                      )}
                      {req.ownerNote && (
                        <p className="text-xs text-blue-400 mt-1 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                          {req.ownerNote}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-[10px] text-zinc-600">
                          {new Date(req.createdAt).toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                        {req.priority === 'urgent' && (
                          <span className="text-[10px] text-red-400 flex items-center gap-0.5">
                            <AlertTriangle size={9} /> 急ぎ
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
            <p className="text-zinc-600 text-sm">まだリクエストはありません</p>
            <p className="text-zinc-700 text-xs mt-1">上から必要なサービスをご選択ください</p>
          </div>
        )}
      </motion.div>
    </div>
  )
}
