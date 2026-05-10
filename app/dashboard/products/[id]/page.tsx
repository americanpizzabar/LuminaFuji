'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Lightbulb, ExternalLink, MessageCircle, CheckCircle2, Building2 } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { getProduct } from '@/lib/products'

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const product = getProduct(id)

  if (!product) {
    return (
      <div className="page-container flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-zinc-500">製品が見つかりませんでした</p>
          <Link href="/dashboard/products" className="text-gold-400 text-sm mt-2 inline-block">
            一覧に戻る
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 pb-28">
      <div className="max-w-[430px] mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 pt-6 pb-4">
          <Link href="/dashboard/products" className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-all">
            <ArrowLeft size={18} className="text-zinc-300" />
          </Link>
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-widest">ECUANEST</p>
          </div>
        </div>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mx-4 rounded-2xl overflow-hidden mb-5"
          style={{
            background: `linear-gradient(135deg, ${product.accentColor}15 0%, #09090b 70%)`,
            border: `1px solid ${product.accentColor}20`,
          }}
        >
          <div className="p-8 flex flex-col items-center">
            <motion.div
              animate={{
                boxShadow: [
                  `0 0 20px ${product.accentColor}20`,
                  `0 0 40px ${product.accentColor}30`,
                  `0 0 20px ${product.accentColor}20`,
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-24 h-24 rounded-3xl flex items-center justify-center mb-5"
              style={{
                background: `radial-gradient(circle, ${product.accentColor}25 0%, ${product.accentColor}08 100%)`,
                border: `1px solid ${product.accentColor}30`,
              }}
            >
              <Lightbulb size={40} style={{ color: product.accentColor }} />
            </motion.div>
            <h1 className="text-2xl font-serif text-zinc-100 mb-1">{product.name}</h1>
            <p className="text-sm text-zinc-400">{product.tagline}</p>
            {product.featured && (
              <div className="mt-3 flex items-center gap-1.5 bg-gold-500/10 border border-gold-500/20 rounded-full px-3 py-1">
                <CheckCircle2 size={11} className="text-gold-400" />
                <span className="text-xs text-gold-400">この施設で使用中</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Description */}
        <div className="px-4 mb-5">
          <div className="card p-5">
            <p className="text-zinc-400 text-sm leading-relaxed">{product.description}</p>
            <div className="flex flex-wrap gap-2 mt-4">
              {product.features.map((f) => (
                <span
                  key={f}
                  className="flex items-center gap-1 text-xs bg-zinc-800 text-zinc-400 px-3 py-1.5 rounded-full border border-zinc-700"
                >
                  <CheckCircle2 size={10} style={{ color: product.accentColor }} />
                  {f}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Specs */}
        <div className="px-4 mb-5">
          <p className="text-xs text-zinc-500 uppercase tracking-widest mb-3">仕様</p>
          <div className="card overflow-hidden">
            <div className="divide-y divide-zinc-800/60">
              {Object.entries(product.specs).map(([key, value], i) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center justify-between px-5 py-3.5"
                >
                  <span className="text-xs text-zinc-500">{key}</span>
                  <span className="text-xs text-zinc-200 text-right max-w-[55%]">{value}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Room Usage */}
        <div className="px-4 mb-5">
          <p className="text-xs text-zinc-500 uppercase tracking-widest mb-3">おすすめ用途</p>
          <div className="flex flex-wrap gap-2">
            {product.roomUsed.map((room) => (
              <span
                key={room}
                className="text-sm bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-zinc-300"
              >
                {room}
              </span>
            ))}
          </div>
        </div>

        {/* Price */}
        <div className="px-4 mb-5">
          <div className="card p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500 mb-1">参考価格</p>
              <p className="text-xl font-medium text-gold-400">{product.price}</p>
              <p className="text-xs text-zinc-600 mt-0.5">設置工事費別途 · 要見積もり</p>
            </div>
            <a
              href="https://ecuanest.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-gold-400 transition-colors"
            >
              公式サイト <ExternalLink size={12} />
            </a>
          </div>
        </div>

        {/* CTAs */}
        <div className="px-4 space-y-3">
          <Link href="/dashboard/consult" className="btn-gold w-full flex items-center justify-center gap-2">
            <MessageCircle size={16} />
            照明コンサルを予約する
          </Link>
          <a
            href="https://ecuanest.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline w-full flex items-center justify-center gap-2"
          >
            <ExternalLink size={16} />
            ECUANEST 公式サイトで購入
          </a>
          <Link href="/dashboard/consult" className="w-full flex items-center justify-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors py-2">
            <Building2 size={15} />
            建築・設計関係者の方はこちら
          </Link>
        </div>
      </div>
    </div>
  )
}
