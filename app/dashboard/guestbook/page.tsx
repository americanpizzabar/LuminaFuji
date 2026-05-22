'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Camera, Send, Heart, X } from 'lucide-react'
import Link from 'next/link'
import { useStore } from '@/lib/useStore'
import { addGuestbookPost, likeGuestbookPost, getStore } from '@/lib/store'
import { usePhase } from '@/lib/phase'
import { useLanguage } from '@/lib/useLanguage'

const EMOJI_OPTIONS = ['✨', '🌅', '🏔️', '💡', '🌙', '🌸', '⭐', '🎉', '🫶', '🗻']

export default function GuestbookPage() {
  const [store, update] = useStore()
  const { guestInfo } = usePhase()
  const { t } = useLanguage()
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState('')
  const [emoji, setEmoji] = useState('✨')
  const [submitting, setSubmitting] = useState(false)
  const [liked, setLiked] = useState<Set<string>>(new Set())

  const visiblePosts = store.guestbookPosts.filter(p => p.visible)

  const handleLike = (id: string) => {
    if (liked.has(id)) return
    setLiked(prev => { const s = new Set(prev); s.add(id); return s })
    likeGuestbookPost(id)
    update({ guestbookPosts: getStore().guestbookPosts })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 600))

    addGuestbookPost({
      author: guestInfo?.name ?? 'Guest',
      country: guestInfo?.nationality ?? 'Japan',
      flag: guestInfo?.flag ?? '🌏',
      message: message.trim(),
      emoji,
      date: new Date().toISOString().split('T')[0],
    })
    update({ guestbookPosts: getStore().guestbookPosts })

    setMessage('')
    setEmoji('✨')
    setShowForm(false)
    setSubmitting(false)
  }

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-all">
            <ArrowLeft size={18} className="text-zinc-300" />
          </Link>
          <div>
            <h1 className="text-lg font-medium text-zinc-100">{t('guestbook.title')}</h1>
            <p className="text-xs text-zinc-500">{t('guestbook.subtitle')} · {visiblePosts.length} messages</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-gold text-xs py-2 px-4 flex items-center gap-1.5"
        >
          <Camera size={13} /> {t('guestbook.writeBtn')}
        </button>
      </div>

      {/* Form modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/80 backdrop-blur-sm p-4"
            onClick={e => { if (e.target === e.currentTarget) setShowForm(false) }}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              className="w-full max-w-sm bg-zinc-900 border border-zinc-700 rounded-3xl p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-medium text-zinc-100">{t('guestbook.formTitle')}</h2>
                <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-xl bg-zinc-800 flex items-center justify-center">
                  <X size={16} className="text-zinc-400" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs text-zinc-500 mb-1.5 block">{t('guestbook.chooseEmoji')}</label>
                  <div className="flex gap-2 flex-wrap">
                    {EMOJI_OPTIONS.map(e => (
                      <button key={e} type="button" onClick={() => setEmoji(e)}
                        className={`text-xl w-10 h-10 rounded-xl border transition-all ${emoji === e ? 'border-gold-500/40 bg-gold-500/10' : 'border-zinc-700 hover:border-zinc-600'}`}
                      >{e}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-zinc-500 mb-1.5 block">{t('guestbook.messageLabel')} *</label>
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder={t('guestbook.messagePlaceholder')}
                    required rows={3}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-gold-500/40 transition-all resize-none"
                  />
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-500 bg-zinc-800 rounded-xl px-3 py-2">
                  <span>{guestInfo?.flag ?? '🌏'}</span>
                  <span>{guestInfo?.name ?? 'Guest'} · {guestInfo?.nationality ?? 'Japan'}</span>
                </div>
                <button
                  type="submit"
                  disabled={!message.trim() || submitting}
                  className="w-full btn-gold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting
                    ? <div className="w-4 h-4 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin" />
                    : <><Send size={14} /> {t('guestbook.submitBtn')}</>
                  }
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Posts */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
        {visiblePosts.map((post, i) => (
          <motion.div key={post.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card p-5">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-2xl bg-zinc-800 flex items-center justify-center text-2xl flex-shrink-0">{post.emoji}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-zinc-100">{post.author}</p>
                    <p className="text-xs text-zinc-500">{post.flag} {post.country}</p>
                  </div>
                  <span className="text-xs text-zinc-600 flex-shrink-0">{post.date}</span>
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed mt-2">{post.message}</p>
                <button
                  onClick={() => handleLike(post.id)}
                  className={`mt-3 flex items-center gap-1.5 text-xs transition-all ${liked.has(post.id) ? 'text-red-400' : 'text-zinc-600 hover:text-zinc-400'}`}
                >
                  <Heart size={12} className={liked.has(post.id) ? 'fill-red-400' : ''} />
                  {post.likes + (liked.has(post.id) ? 1 : 0)}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
