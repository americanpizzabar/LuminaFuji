'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Info, Star, Bell, Gift } from 'lucide-react'
import { getStore, dismissAnnouncement, Announcement } from '@/lib/store'

const icons = {
  welcome: Star,
  info: Info,
  reminder: Bell,
  promo: Gift,
}

const colors = {
  welcome: 'border-gold-500/30 bg-gradient-to-r from-amber-950/60 to-zinc-900',
  info: 'border-blue-500/30 bg-gradient-to-r from-blue-950/60 to-zinc-900',
  reminder: 'border-purple-500/30 bg-gradient-to-r from-purple-950/60 to-zinc-900',
  promo: 'border-emerald-500/30 bg-gradient-to-r from-emerald-950/60 to-zinc-900',
}

const iconColors = {
  welcome: 'text-gold-400',
  info: 'text-blue-400',
  reminder: 'text-purple-400',
  promo: 'text-emerald-400',
}

export default function AnnouncementBanner() {
  const [ann, setAnn] = useState<Announcement | null>(null)
  const [lang, setLang] = useState<'ja' | 'en'>('ja')

  useEffect(() => {
    const store = getStore()
    const active = store.announcements.find(a => a.active)
    setAnn(active || null)

    const dismissed = sessionStorage.getItem('ann_dismissed')
    if (dismissed && active && dismissed === active.id) setAnn(null)
  }, [])

  const dismiss = () => {
    if (!ann) return
    sessionStorage.setItem('ann_dismissed', ann.id)
    dismissAnnouncement(ann.id)
    setAnn(null)
  }

  if (!ann) return null

  const Icon = icons[ann.type]
  const text = lang === 'ja' ? ann.content : (ann.contentEn || ann.content)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`mx-4 mb-3 rounded-2xl border p-3 flex items-start gap-3 ${colors[ann.type]}`}
      >
        <Icon size={15} className={`flex-shrink-0 mt-0.5 ${iconColors[ann.type]}`} />
        <p className="flex-1 text-xs text-zinc-300 leading-relaxed">{text}</p>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => setLang(l => l === 'ja' ? 'en' : 'ja')}
            className="text-[11px] text-zinc-400 hover:text-zinc-400 px-1.5 py-0.5 rounded-md border border-zinc-700 hover:border-zinc-600 transition-all"
          >
            {lang === 'ja' ? 'EN' : 'JA'}
          </button>
          <button onClick={dismiss} className="text-zinc-400 hover:text-zinc-400 transition-colors">
            <X size={14} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
