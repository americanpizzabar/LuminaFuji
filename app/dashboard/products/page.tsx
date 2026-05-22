'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Lightbulb, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { products, Product } from '@/lib/products'
import { useLanguage } from '@/lib/useLanguage'

type Filter = 'all' | 'panel' | 'wall' | 'strip' | 'modular'
const FILTER_KEYS: Filter[] = ['all', 'panel', 'wall', 'strip', 'modular']

function ProductCard({ product, index, inUseLabel }: { product: Product; index: number; inUseLabel: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.3 }}
    >
      <Link href={`/dashboard/products/${product.id}`}>
        <div className="card overflow-hidden hover:border-zinc-700 transition-all active:scale-98 group">
          <div
            className="h-36 flex items-center justify-center relative overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${product.accentColor}12 0%, #09090b 100%)` }}
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ background: `radial-gradient(ellipse at center, ${product.accentColor}10 0%, transparent 70%)` }}
            />
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110"
              style={{
                background: `radial-gradient(circle, ${product.accentColor}20 0%, ${product.accentColor}05 100%)`,
                border: `1px solid ${product.accentColor}30`,
                boxShadow: `0 0 30px ${product.accentColor}15`,
              }}
            >
              <Lightbulb size={32} style={{ color: product.accentColor }} />
            </div>
            {product.featured && (
              <div className="absolute top-3 right-3">
                <span className="text-[10px] bg-gold-500/20 border border-gold-500/30 text-gold-400 px-2 py-0.5 rounded-full">
                  {inUseLabel}
                </span>
              </div>
            )}
          </div>
          <div className="p-4">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="text-base font-medium text-zinc-100">{product.name}</h3>
              <ExternalLink size={13} className="text-zinc-600 flex-shrink-0 mt-0.5" />
            </div>
            <p className="text-xs text-zinc-500 mb-2">{product.tagline}</p>
            <p className="text-xs text-zinc-600 leading-relaxed line-clamp-2 mb-3">{product.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gold-400">{product.price}</span>
              <div className="flex gap-1">
                {product.features.slice(0, 2).map((f) => (
                  <span key={f} className="text-[10px] bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded-full">{f}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default function ProductsPage() {
  const { t } = useLanguage()
  const [filter, setFilter] = useState<Filter>('all')
  const filtered = filter === 'all' ? products : products.filter((p) => p.category === filter)

  return (
    <div className="page-container">
      <div className="flex items-center gap-3 mb-2">
        <Link href="/dashboard" className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-all">
          <ArrowLeft size={18} className="text-zinc-300" />
        </Link>
        <div>
          <h1 className="text-lg font-medium text-zinc-100">{t('products.title')}</h1>
          <p className="text-xs text-zinc-500">{t('products.subtitle')}</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="card p-4 mb-5 flex items-center gap-3 border-gold-500/10 overflow-hidden relative"
        style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.06) 0%, #18181b 100%)' }}
      >
        <div className="w-12 h-12 rounded-2xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center flex-shrink-0">
          <span className="text-xl font-serif text-gold-400">E</span>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-zinc-200">ECUANEST</p>
          <p className="text-xs text-zinc-500 leading-relaxed">{t('products.brandSub')}</p>
        </div>
        <a href="https://ecuanest.com" target="_blank" rel="noopener noreferrer"
          className="flex-shrink-0 flex items-center gap-1 text-xs text-gold-400 hover:text-gold-300">
          {t('products.officialSite')} <ExternalLink size={11} />
        </a>
      </motion.div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 -mx-1 px-1">
        {FILTER_KEYS.map((key) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
              filter === key
                ? 'border-gold-500/40 bg-gold-500/10 text-gold-300'
                : 'border-zinc-800 bg-zinc-900 text-zinc-500 hover:border-zinc-700'
            }`}
          >
            {t(`products.categories.${key}`)}
          </button>
        ))}
      </div>

      <motion.div key={filter} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 gap-4">
        {filtered.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i} inUseLabel={t('products.inUse')} />
        ))}
      </motion.div>

      <div className="mt-6 card p-5 text-center border-gold-500/10 bg-gradient-to-br from-amber-950/20 to-zinc-900">
        <p className="text-sm text-zinc-300 mb-1">{t('products.ctaTitle')}</p>
        <p className="text-xs text-zinc-500 mb-4">{t('products.ctaSub')}</p>
        <div className="flex gap-3">
          <Link href="/dashboard/consult" className="flex-1 btn-gold text-sm py-2.5 text-center">
            {t('products.ctaBtn')}
          </Link>
          <a href="https://ecuanest.com" target="_blank" rel="noopener noreferrer"
            className="flex-1 btn-outline text-sm py-2.5 text-center flex items-center justify-center gap-1.5">
            {t('products.officialSite')} <ExternalLink size={11} />
          </a>
        </div>
      </div>
    </div>
  )
}
