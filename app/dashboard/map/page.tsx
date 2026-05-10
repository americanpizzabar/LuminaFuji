'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, MapPin, Clock, Star } from 'lucide-react'
import Link from 'next/link'

type Category = 'all' | 'food' | 'nature' | 'activity' | 'shop'

interface Place {
  id: string
  name: string
  nameEn: string
  category: Category
  distance: string
  time: string
  rating: number
  description: string
  emoji: string
  tags: string[]
}

const places: Place[] = [
  {
    id: '1', name: '山中湖', nameEn: 'Lake Yamanakako',
    category: 'nature', distance: '0.5km', time: '徒歩 7分',
    rating: 5, description: '富士山の絶景が楽しめる湖。サイクリングロードが整備されています。',
    emoji: '🏞️', tags: ['絶景', 'サイクリング', 'SUP'],
  },
  {
    id: '2', name: 'ほうとう不動 東恋路店', nameEn: 'Hoto Fudo',
    category: 'food', distance: '2km', time: '車 5分',
    rating: 5, description: '山梨名物ほうとうの名店。太い麺と味噌仕立ての汁が絶品。',
    emoji: '🍲', tags: ['山梨名物', 'ほうとう', '夕食'],
  },
  {
    id: '3', name: '忠ちゃん牧場', nameEn: 'Chuuchan Farm',
    category: 'food', distance: '3km', time: '車 7分',
    rating: 4, description: '富士山バックのソフトクリームが人気。搾りたて牛乳も販売。',
    emoji: '🍦', tags: ['ソフトクリーム', '牧場', 'フォト映え'],
  },
  {
    id: '4', name: '富士急ハイランド', nameEn: 'Fuji-Q Highland',
    category: 'activity', distance: '20km', time: '車 25分',
    rating: 4, description: '世界記録のジェットコースターを誇るテーマパーク。',
    emoji: '🎢', tags: ['テーマパーク', 'アトラクション', '家族'],
  },
  {
    id: '5', name: '山中湖 自転車レンタル', nameEn: 'Bicycle Rental',
    category: 'activity', distance: '1km', time: '徒歩 15分',
    rating: 4, description: '湖畔を一周できるレンタサイクル。電動アシスト付きも有。',
    emoji: '🚴', tags: ['サイクリング', 'レンタル', '湖畔'],
  },
  {
    id: '6', name: '河口湖', nameEn: 'Lake Kawaguchiko',
    category: 'nature', distance: '15km', time: '車 25分',
    rating: 5, description: '富士五湖の中で最もにぎわう観光地。富士山の逆さ富士が有名。',
    emoji: '⛵', tags: ['逆さ富士', '観光', 'カフェ'],
  },
  {
    id: '7', name: 'アウトレットモール 御殿場', nameEn: 'Gotemba Premium Outlets',
    category: 'shop', distance: '30km', time: '車 40分',
    rating: 4, description: '富士山を望む大型アウトレット。国内最大級の品揃え。',
    emoji: '🛍️', tags: ['アウトレット', 'ショッピング', 'ブランド'],
  },
  {
    id: '8', name: '平野 海の家', nameEn: 'Hirano Beach Café',
    category: 'food', distance: '2.5km', time: '車 6分',
    rating: 4, description: '湖畔のカジュアルカフェ。富士山を見ながらコーヒーを。',
    emoji: '☕', tags: ['カフェ', '湖畔', '絶景'],
  },
]

const categories: { key: Category; label: string; emoji: string }[] = [
  { key: 'all', label: 'すべて', emoji: '🗺️' },
  { key: 'food', label: 'グルメ', emoji: '🍽️' },
  { key: 'nature', label: '自然', emoji: '🌿' },
  { key: 'activity', label: '体験', emoji: '⛷️' },
  { key: 'shop', label: 'ショップ', emoji: '🛍️' },
]

export default function MapPage() {
  const [activeCategory, setActiveCategory] = useState<Category>('all')
  const filtered = activeCategory === 'all' ? places : places.filter((p) => p.category === activeCategory)

  return (
    <div className="page-container">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard" className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-all">
          <ArrowLeft size={18} className="text-zinc-300" />
        </Link>
        <div>
          <h1 className="text-lg font-medium text-zinc-100">周辺マップ</h1>
          <p className="text-xs text-zinc-500">Local Area Guide · Yamanakako</p>
        </div>
      </div>

      {/* Map Placeholder */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-2xl overflow-hidden mb-5 relative"
        style={{ height: '200px' }}
      >
        <div className="absolute inset-0 bg-zinc-900 border border-zinc-800 flex items-center justify-center">
          <div className="text-center">
            <div className="text-5xl mb-3">🗾</div>
            <p className="text-sm text-zinc-400">山中湖 · Yamanakako</p>
            <p className="text-xs text-zinc-600 mt-1">山梨県南都留郡</p>
          </div>
          <div className="absolute top-3 right-3">
            <a
              href="https://maps.google.com/?q=Yamanakako,Yamanashi,Japan"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-zinc-300 flex items-center gap-1.5 hover:border-gold-500/30 transition-all"
            >
              <MapPin size={11} className="text-gold-400" />
              Google Maps
            </a>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/60 to-transparent pointer-events-none" />
      </motion.div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 -mx-1 px-1">
        {categories.map(({ key, label, emoji }) => (
          <button
            key={key}
            onClick={() => setActiveCategory(key)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
              activeCategory === key
                ? 'border-gold-500/40 bg-gold-500/10 text-gold-300'
                : 'border-zinc-800 bg-zinc-900 text-zinc-500 hover:border-zinc-700'
            }`}
          >
            <span>{emoji}</span>
            {label}
          </button>
        ))}
      </div>

      {/* Place List */}
      <motion.div
        key={activeCategory}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-3"
      >
        {filtered.map((place) => (
          <div key={place.id} className="card p-4 hover:border-zinc-700 transition-all">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-2xl flex-shrink-0">
                {place.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-zinc-100">{place.name}</p>
                    <p className="text-xs text-zinc-600">{place.nameEn}</p>
                  </div>
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    {Array.from({ length: place.rating }).map((_, i) => (
                      <Star key={i} size={10} className="text-gold-400 fill-gold-400" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed mt-1.5">{place.description}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="flex items-center gap-1 text-xs text-zinc-500">
                    <MapPin size={10} />
                    {place.distance}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-zinc-500">
                    <Clock size={10} />
                    {place.time}
                  </span>
                </div>
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  {place.tags.map((tag) => (
                    <span key={tag} className="text-[10px] bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      <div className="mt-4 text-center">
        <p className="text-xs text-zinc-600">
          詳しいアクセスはコンシェルジュへ
        </p>
        <Link href="/dashboard/chat" className="text-xs text-gold-400 hover:text-gold-300 mt-1 inline-block">
          チャットで聞く →
        </Link>
      </div>
    </div>
  )
}
