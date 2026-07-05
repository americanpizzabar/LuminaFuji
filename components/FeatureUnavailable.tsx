'use client'

/**
 * 無効化された体験機能ページへ直接アクセスされた場合の案内画面。
 * 管理会社の構成でオフの機能は入口カードごと消えるが、
 * ブックマーク等からの直接遷移にも静かに応対する。
 */

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { useLanguage } from '@/lib/useLanguage'

export default function FeatureUnavailable() {
  const { t } = useLanguage()
  return (
    <div className="page-container pb-28 flex flex-col items-center justify-center min-h-[70vh] text-center">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center text-xl"
             style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          🌫️
        </div>
        <p className="font-serif text-lg text-zinc-300 mb-1">{t('feature.off')}</p>
        <p className="text-xs text-zinc-500 mb-8">{t('feature.offSub')}</p>
        <Link href="/dashboard"
              className="inline-flex items-center gap-2 py-2.5 px-6 rounded-2xl text-xs transition-colors"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#a1a1aa' }}>
          <ArrowLeft size={13} />
          {t('feature.back')}
        </Link>
      </motion.div>
    </div>
  )
}
