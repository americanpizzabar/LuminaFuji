'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, Video, Building2, CheckCircle2, Clock } from 'lucide-react'

interface ConsultRequest {
  id: string
  name: string
  email: string
  phone?: string
  profession: string
  projectType: string
  scale: string
  budget: string
  contactMethod: 'email' | 'phone' | 'online'
  message: string
  submittedAt: string
  status: 'new' | 'inProgress' | 'done'
}

const mockRequests: ConsultRequest[] = [
  {
    id: 'C-001',
    name: '田中 拓也',
    email: 'tanaka@architect.co.jp',
    phone: '090-1234-5678',
    profession: '建築家・設計士',
    projectType: '商業施設',
    scale: '500〜2000m²',
    budget: '500〜1000万円',
    contactMethod: 'online',
    message: '美術館の照明リニューアルプロジェクトを検討中です。均一な面発光と高演色性が必須条件です。',
    submittedAt: '2026-05-10 14:32',
    status: 'new',
  },
  {
    id: 'C-002',
    name: 'Emma L.',
    email: 'emma@design.co.uk',
    profession: 'インテリアデザイナー',
    projectType: 'ホテル・旅館',
    scale: '100〜500m²',
    budget: '100〜500万円',
    contactMethod: 'email',
    message: 'Boutique hotel renovation in Tokyo. Interested in Brite 3 and Luna Series for guest rooms.',
    submittedAt: '2026-05-08 09:15',
    status: 'inProgress',
  },
  {
    id: 'C-003',
    name: '山本 健一',
    email: 'yamamoto@realestate.jp',
    phone: '03-5555-XXXX',
    profession: 'デベロッパー・施主',
    projectType: '住宅',
    scale: '〜100m²',
    budget: '未定 / 相談したい',
    contactMethod: 'phone',
    message: '自宅のリノベーションに合わせて、有機EL照明を全室に導入したいと思っています。',
    submittedAt: '2026-05-06 17:45',
    status: 'done',
  },
  {
    id: 'C-004',
    name: 'Sara M.',
    email: 'sara@gallery.com',
    profession: 'インテリアデザイナー',
    projectType: '美術館・ギャラリー',
    scale: '100〜500m²',
    budget: '500〜1000万円',
    contactMethod: 'online',
    message: 'Gallery lighting for contemporary art. UV-free and flicker-free is essential.',
    submittedAt: '2026-05-05 11:20',
    status: 'new',
  },
  {
    id: 'C-005',
    name: '鈴木 美咲',
    email: 'suzuki@interior.jp',
    profession: 'インテリアデザイナー',
    projectType: 'オフィス',
    scale: '100〜500m²',
    budget: '100〜500万円',
    contactMethod: 'email',
    message: 'クリエイティブオフィスの照明設計。集中とリラックスを切り替えられる照明が必要です。',
    submittedAt: '2026-05-03 15:00',
    status: 'inProgress',
  },
]

const statusConfig = {
  new: { label: '新着', color: 'text-red-400 border-red-500/30 bg-red-500/10' },
  inProgress: { label: '対応中', color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
  done: { label: '完了', color: 'text-zinc-400 border-zinc-600 bg-zinc-800' },
}

const contactIcon = { email: Mail, phone: Phone, online: Video }

export default function ConsultsPage() {
  const [requests, setRequests] = useState(mockRequests)
  const [selected, setSelected] = useState<ConsultRequest | null>(null)
  const [filter, setFilter] = useState<'all' | 'new' | 'inProgress' | 'done'>('all')

  const filtered = filter === 'all' ? requests : requests.filter((r) => r.status === filter)

  const updateStatus = (id: string, status: ConsultRequest['status']) => {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)))
    if (selected?.id === id) setSelected((prev) => prev ? { ...prev, status } : prev)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <div className="mb-5">
        <h1 className="text-xl font-medium text-zinc-100">照明コンサル相談</h1>
        <p className="text-sm text-zinc-500 mt-0.5">{requests.filter((r) => r.status === 'new').length} 件の未対応リクエスト</p>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-4">
        {[
          { key: 'all', label: 'すべて' },
          { key: 'new', label: '新着' },
          { key: 'inProgress', label: '対応中' },
          { key: 'done', label: '完了' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key as typeof filter)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
              filter === key
                ? 'border-blue-500/40 bg-blue-500/10 text-blue-300'
                : 'border-zinc-800 text-zinc-500 hover:border-zinc-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="font-medium text-zinc-100">{selected.name}</h2>
                <p className="text-xs text-zinc-500">{selected.profession}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${statusConfig[selected.status].color}`}>
                {statusConfig[selected.status].label}
              </span>
            </div>
            <div className="space-y-3 text-sm mb-5">
              {[
                { label: 'メール', value: selected.email },
                selected.phone && { label: '電話', value: selected.phone },
                { label: 'プロジェクト', value: selected.projectType },
                { label: '規模', value: selected.scale },
                { label: '予算', value: selected.budget },
                { label: '希望連絡方法', value: { email: 'メール', phone: '電話', online: 'オンライン面談' }[selected.contactMethod] },
              ].filter(Boolean).map((item: any) => (
                <div key={item.label} className="flex gap-3">
                  <span className="text-zinc-500 w-24 flex-shrink-0 text-xs">{item.label}</span>
                  <span className="text-zinc-300 text-xs">{item.value}</span>
                </div>
              ))}
              {selected.message && (
                <div className="border-t border-zinc-800 pt-3">
                  <p className="text-xs text-zinc-500 mb-1">メッセージ</p>
                  <p className="text-xs text-zinc-300 leading-relaxed">{selected.message}</p>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              {selected.status !== 'inProgress' && (
                <button
                  onClick={() => updateStatus(selected.id, 'inProgress')}
                  className="flex-1 py-2 border border-amber-500/30 bg-amber-500/10 text-amber-400 rounded-xl text-xs font-medium"
                >
                  対応中にする
                </button>
              )}
              {selected.status !== 'done' && (
                <button
                  onClick={() => updateStatus(selected.id, 'done')}
                  className="flex-1 py-2 border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 rounded-xl text-xs font-medium"
                >
                  完了にする
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {filtered.map((req, i) => {
          const ContactIcon = contactIcon[req.contactMethod]
          return (
            <motion.div
              key={req.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelected(req)}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 cursor-pointer hover:border-zinc-700 transition-all"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center flex-shrink-0">
                    <Building2 size={15} className="text-zinc-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-100">{req.name}</p>
                    <p className="text-xs text-zinc-500">{req.profession}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full border flex-shrink-0 ${statusConfig[req.status].color}`}>
                  {statusConfig[req.status].label}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-zinc-500">
                <span>{req.projectType} · {req.scale}</span>
                <span className="flex items-center gap-1">
                  <ContactIcon size={11} />
                  {req.budget}
                </span>
              </div>
              <div className="flex items-center gap-1 mt-1.5 text-xs text-zinc-600">
                <Clock size={10} />
                {req.submittedAt}
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
