'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, MapPin, Clock, Star } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/lib/useLanguage'

type Category = 'all' | 'food' | 'nature' | 'activity' | 'shop'

interface PlaceStatic {
  spotKey: string
  category: Exclude<Category, 'all'>
  distanceKm: string
  rating: number
  emoji: string
}

const PLACES: PlaceStatic[] = [
  { spotKey: 'lake',      category: 'nature',   distanceKm: '0.5km', rating: 5, emoji: '🏞️' },
  { spotKey: 'hoto',      category: 'food',     distanceKm: '2km',   rating: 5, emoji: '🍲' },
  { spotKey: 'farm',      category: 'food',     distanceKm: '3km',   rating: 4, emoji: '🍦' },
  { spotKey: 'fujiq',     category: 'activity', distanceKm: '20km',  rating: 4, emoji: '🎢' },
  { spotKey: 'bike',      category: 'activity', distanceKm: '1km',   rating: 4, emoji: '🚴' },
  { spotKey: 'kawaguchi', category: 'nature',   distanceKm: '15km',  rating: 5, emoji: '⛵' },
  { spotKey: 'outlet',    category: 'shop',     distanceKm: '30km',  rating: 4, emoji: '🛍️' },
  { spotKey: 'cafe',      category: 'food',     distanceKm: '2.5km', rating: 4, emoji: '☕' },
]

const CATEGORY_KEYS: { key: Category; emoji: string }[] = [
  { key: 'all',      emoji: '🗺️' },
  { key: 'food',     emoji: '🍽️' },
  { key: 'nature',   emoji: '🌿' },
  { key: 'activity', emoji: '⛷️' },
  { key: 'shop',     emoji: '🛍️' },
]

export default function MapPage() {
  const { t } = useLanguage()
  const [activeCategory, setActiveCategory] = useState<Category>('all')

  const filtered = activeCategory === 'all'
    ? PLACES
    : PLACES.filter((p) => p.category === activeCategory)

  return (
    <div className="page-container">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard" className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-all">
          <ArrowLeft size={18} className="text-zinc-300" />
        </Link>
        <div>
          <h1 className="text-lg font-medium text-zinc-100">{t('map.title')}</h1>
          <p className="text-xs text-zinc-500">{t('map.subtitle')}</p>
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
            <p className="text-sm text-zinc-400">{t('map.area')}</p>
            <p className="text-xs text-zinc-600 mt-1">{t('map.areaSub')}</p>
          </div>
          <div className="absolute top-3 right-3">
            <a
              href="https://maps.google.com/?q=Yamanakako,Yamanashi,Japan"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-zinc-300 flex items-center gap-1.5 hover:border-gold-500/30 transition-all"
            >
              <MapPin size={11} className="text-gold-400" />
              {t('map.googleMaps')}
            </a>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/60 to-transparent pointer-events-none" />
      </motion.div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 -mx-1 px-1">
        {CATEGORY_KEYS.map(({ key, emoji }) => (
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
            {t(`map.categories.${key === 'activity' ? 'experience' : key}`)}
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
        {filtered.map((place) => {
          const name = t(`map.spots.${place.spotKey}.name`)
          const sub  = t(`map.spots.${place.spotKey}.sub`)
          const dist = t(`map.spots.${place.spotKey}.dist`)
          const desc = t(`map.spots.${place.spotKey}.desc`)
          const tags = t(`map.spots.${place.spotKey}.tags`).split(/[、,]/).map(s => s.trim()).filter(Boolean)

          return (
            <div key={place.spotKey} className="card p-4 hover:border-zinc-700 transition-all">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-2xl flex-shrink-0">
                  {place.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-zinc-100">{name}</p>
                      <p className="text-xs text-zinc-600">{sub}</p>
                    </div>
                    <div className="flex items-center gap-0.5 flex-shrink-0">
                      {Array.from({ length: place.rating }).map((_, i) => (
                        <Star key={i} size={10} className="text-gold-400 fill-gold-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-zinc-500 leading-relaxed mt-1.5">{desc}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-1 text-xs text-zinc-500">
                      <MapPin size={10} />
                      {place.distanceKm}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-zinc-500">
                      <Clock size={10} />
                      {dist}
                    </span>
                  </div>
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {tags.map((tag) => (
                      <span key={tag} className="text-[10px] bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </motion.div>

      <div className="mt-4 text-center">
        <p className="text-xs text-zinc-600">{t('map.chatLink')}</p>
        <Link href="/dashboard/chat" className="text-xs text-gold-400 hover:text-gold-300 mt-1 inline-block">
          {t('map.chatLinkSub')}
        </Link>
      </div>
    </div>
  )
}
