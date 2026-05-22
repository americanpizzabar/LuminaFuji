'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe } from 'lucide-react'
import { useLanguage } from '@/lib/useLanguage'
import { LANGUAGES } from '@/lib/i18n'

export default function LanguageSwitcher() {
  const { lang, setLang, t } = useLanguage()
  const [open, setOpen] = useState(false)
  const current = LANGUAGES.find(l => l.code === lang)!

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-800/80 border border-zinc-700/50 hover:border-zinc-600 transition-all text-zinc-400 hover:text-zinc-200"
        aria-label={t('lang.select')}
      >
        <span className="text-sm leading-none">{current.flag}</span>
        <span className="text-[11px] font-medium">{current.nativeLabel}</span>
        <Globe size={11} className="opacity-60" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-1.5 z-50 bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden min-w-[140px]"
            >
              <div className="p-1">
                {LANGUAGES.map(l => (
                  <button
                    key={l.code}
                    onClick={() => { setLang(l.code); setOpen(false) }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all ${
                      l.code === lang
                        ? 'bg-zinc-700 text-zinc-100'
                        : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                    }`}
                  >
                    <span className="text-base leading-none">{l.flag}</span>
                    <span className="text-xs font-medium">{l.nativeLabel}</span>
                    {l.code === lang && <span className="ml-auto text-[9px] text-teal-400">✓</span>}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
