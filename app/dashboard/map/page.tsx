'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, MapPin, Clock, Star, Car, Bus, Navigation, ChevronDown, ChevronUp, Globe } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/lib/useLanguage'
import { useStore } from '@/lib/useStore'
import type { PlaceCategory } from '@/lib/store'

type Category = 'all' | PlaceCategory
type MainTab = 'access' | 'spots'

const CATEGORY_KEYS: { key: Category; emoji: string }[] = [
  { key: 'all',      emoji: '🗺️' },
  { key: 'food',     emoji: '🍽️' },
  { key: 'nature',   emoji: '🌿' },
  { key: 'activity', emoji: '⛷️' },
  { key: 'onsen',    emoji: '♨️' },
  { key: 'shop',     emoji: '🛍️' },
]

// カテゴリ表示名（多言語・自己完結）
const CAT_LABELS: Record<string, Record<Category, string>> = {
  ja: { all: 'すべて', food: 'グルメ', nature: '自然', activity: '体験', onsen: '温泉', shop: '買い物' },
  en: { all: 'All', food: 'Food', nature: 'Nature', activity: 'Activity', onsen: 'Onsen', shop: 'Shopping' },
  zh: { all: '全部', food: '美食', nature: '自然', activity: '体验', onsen: '温泉', shop: '购物' },
  ko: { all: '전체', food: '맛집', nature: '자연', activity: '체험', onsen: '온천', shop: '쇼핑' },
  fr: { all: 'Tout', food: 'Cuisine', nature: 'Nature', activity: 'Activité', onsen: 'Onsen', shop: 'Shopping' },
}

// Google Maps URL for the property
const MAPS_URL = 'https://maps.google.com/?q=Lumina+Fuji+Residence+Yamanakako+山梨県南都留郡山中湖村平野470-1'

interface CarRoute { from: string; via: string; time: string }
interface BusRoute { from: string; fromSub: string; line: string; time: string; fare: string }

export default function MapPage() {
  const { t, lang } = useLanguage()
  const [store] = useStore()
  const [mainTab, setMainTab] = useState<MainTab>('access')
  const [activeCategory, setActiveCategory] = useState<Category>('all')
  const [expandedBus, setExpandedBus] = useState<number | null>(null)
  const catLabel = (key: Category) => (CAT_LABELS[lang] ?? CAT_LABELS.ja)[key]
  const webLabel = ({ ja: '公式サイト', en: 'Website', zh: '官网', ko: '공식 사이트', fr: 'Site web' } as Record<string, string>)[lang] ?? '公式サイト'

  // ルートデータを t() で多言語化
  const CAR_ROUTES: CarRoute[] = [
    { from: t('map.access.carFrom0'), via: t('map.access.carVia0'), time: t('map.access.carTime0') },
    { from: t('map.access.carFrom1'), via: t('map.access.carVia1'), time: t('map.access.carTime1') },
    { from: t('map.access.carFrom2'), via: t('map.access.carVia2'), time: t('map.access.carTime2') },
  ]

  const BUS_ROUTES: BusRoute[] = [
    { from: t('map.access.busFrom0'), fromSub: t('map.access.busSub0'), line: t('map.access.busLine0'), time: t('map.access.busTime0'), fare: t('map.access.busFare0') },
    { from: t('map.access.busFrom1'), fromSub: t('map.access.busSub1'), line: t('map.access.busLine1'), time: t('map.access.busTime1'), fare: t('map.access.busFare1') },
    { from: t('map.access.busFrom2'), fromSub: t('map.access.busSub2'), line: t('map.access.busLine2'), time: t('map.access.busTime2'), fare: t('map.access.busFare2') },
    { from: t('map.access.busFrom3'), fromSub: t('map.access.busSub3'), line: t('map.access.busLine3'), time: t('map.access.busTime3'), fare: t('map.access.busFare3') },
  ]

  const visiblePlaces = store.places.filter((p) => p.visible)
  const filtered = activeCategory === 'all'
    ? visiblePlaces
    : visiblePlaces.filter((p) => p.category === activeCategory)

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <Link href="/dashboard" className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-all">
          <ArrowLeft size={18} className="text-zinc-300" />
        </Link>
        <div>
          <h1 className="text-lg font-medium text-zinc-100">{t('map.title')}</h1>
          <p className="text-xs text-zinc-300">{t('map.subtitle')}</p>
        </div>
      </div>

      {/* Map embed placeholder */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-2xl overflow-hidden mb-5 relative"
        style={{ height: '180px' }}
      >
        <div className="absolute inset-0 bg-zinc-900 border border-zinc-800 flex items-center justify-center">
          <div className="text-center">
            <div className="text-5xl mb-2">🗾</div>
            <p className="text-sm text-zinc-400">{t('map.area')}</p>
            <p className="text-xs text-zinc-400 mt-0.5">{t('map.areaSub')}</p>
          </div>
          <div className="absolute top-3 right-3">
            <a
              href={MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-zinc-300 flex items-center gap-1.5 hover:border-gold-500/30 transition-all"
            >
              <Navigation size={11} className="text-gold-400" />
              {t('map.googleMaps')}
            </a>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/60 to-transparent pointer-events-none" />
      </motion.div>

      {/* Main tabs: アクセス / 周辺スポット */}
      <div className="flex gap-2 mb-5">
        {(['access', 'spots'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setMainTab(tab)}
            className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${
              mainTab === tab
                ? 'border-gold-500/40 bg-gold-500/10 text-gold-300'
                : 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700 hover:text-zinc-300'
            }`}
          >
            {tab === 'access' ? t('map.access.tabAccess') : t('map.access.tabSpots')}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ── アクセスタブ ── */}
        {mainTab === 'access' && (
          <motion.div
            key="access"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            {/* 住所カード */}
            <div className="card p-4 border-gold-500/15 bg-gradient-to-br from-amber-950/20 to-zinc-900">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gold-500/10 border border-gold-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin size={14} className="text-gold-400" />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-300 mb-0.5">Lumina Fuji Residence Yamanakako</p>
                    <p className="text-sm text-zinc-200 leading-relaxed">{t('map.access.address')}</p>
                    <p className="text-xs text-emerald-400 mt-1.5 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                      {t('map.access.walkNote')}
                    </p>
                    <p className="text-xs text-zinc-300 mt-1">{t('map.access.parking')}</p>
                  </div>
                </div>
                <a
                  href={MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 flex items-center gap-1 text-[11px] text-gold-400 hover:text-gold-300 border border-gold-500/25 bg-gold-500/5 px-2.5 py-1.5 rounded-lg transition-all whitespace-nowrap"
                >
                  <Navigation size={10} />
                  Maps
                </a>
              </div>
            </div>

            {/* お車で */}
            <div>
              <p className="section-title mb-3">{t('map.access.byCar')}</p>
              <div className="card overflow-hidden divide-y divide-zinc-800">
                {CAR_ROUTES.map((r, i) => (
                  <div key={i} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Car size={13} className="text-zinc-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <p className="text-sm font-medium text-zinc-100">{r.from}</p>
                          <span className="flex items-center gap-1 text-xs text-amber-400 flex-shrink-0">
                            <Clock size={10} />
                            {r.time}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-300 mt-1 leading-relaxed">{r.via}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-zinc-400 mt-2 px-1 leading-relaxed">{t('map.access.carNote')}</p>
            </div>

            {/* バスで */}
            <div>
              <p className="section-title mb-3">{t('map.access.byBus')}</p>

              {/* 共通ゴール: 平野バス停 */}
              <div className="flex items-center gap-2 mb-3 px-1">
                <div className="flex-1 h-px bg-zinc-800" />
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 border border-emerald-500/25 bg-emerald-500/5 px-3 py-1 rounded-full">
                  <MapPin size={9} />
                  {t('map.access.busStop')} → 徒歩10分
                </div>
                <div className="flex-1 h-px bg-zinc-800" />
              </div>

              <div className="space-y-2">
                {BUS_ROUTES.map((r, i) => {
                  const isOpen = expandedBus === i
                  return (
                    <div key={i} className="card overflow-hidden">
                      <button
                        onClick={() => setExpandedBus(isOpen ? null : i)}
                        className="w-full p-4 text-left hover:bg-zinc-800/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                            <Bus size={14} className="text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <p className="text-sm font-medium text-zinc-100">{r.from}</p>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span className="flex items-center gap-1 text-xs text-amber-400">
                                  <Clock size={9} />
                                  {r.time}
                                </span>
                                {isOpen ? <ChevronUp size={13} className="text-zinc-300" /> : <ChevronDown size={13} className="text-zinc-300" />}
                              </div>
                            </div>
                            <p className="text-[11px] text-zinc-300 mt-0.5">{r.line}</p>
                          </div>
                        </div>
                      </button>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="border-t border-zinc-800 px-4 py-3 bg-zinc-800/20 space-y-2">
                              {r.fromSub && (
                                <div className="flex items-start gap-2">
                                  <span className="text-[11px] text-zinc-300 w-20 flex-shrink-0 pt-0.5">{t('map.access.boardingPoint')}</span>
                                  <p className="text-xs text-zinc-300">{r.fromSub}</p>
                                </div>
                              )}
                              <div className="flex items-start gap-2">
                                <span className="text-[11px] text-zinc-300 w-20 flex-shrink-0 pt-0.5">{t('map.access.duration')}</span>
                                <p className="text-xs text-amber-300 font-medium">{r.time}</p>
                              </div>
                              <div className="flex items-start gap-2">
                                <span className="text-[11px] text-zinc-300 w-20 flex-shrink-0 pt-0.5">{t('map.access.fare')}</span>
                                <p className="text-xs text-zinc-300">{r.fare}</p>
                              </div>
                              <div className="pt-1">
                                <a
                                  href="https://bus.fujikyu.co.jp/"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 transition-colors"
                                >
                                  {t('map.access.timetable')}
                                </a>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* チャットリンク */}
            <div className="text-center pt-2">
              <p className="text-xs text-zinc-400">{t('map.chatLink')}</p>
              <Link href="/dashboard/chat" className="text-xs text-gold-400 hover:text-gold-300 mt-1 inline-block">
                {t('map.chatLinkSub')}
              </Link>
            </div>
          </motion.div>
        )}

        {/* ── 周辺スポットタブ ── */}
        {mainTab === 'spots' && (
          <motion.div
            key="spots"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25 }}
          >
            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-1 px-1">
              {CATEGORY_KEYS.map(({ key, emoji }) => (
                <button
                  key={key}
                  onClick={() => setActiveCategory(key)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                    activeCategory === key
                      ? 'border-gold-500/40 bg-gold-500/10 text-gold-300'
                      : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <span>{emoji}</span>
                  {catLabel(key)}
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
                          <p className="text-xs text-zinc-400">{place.sub}</p>
                        </div>
                        <div className="flex items-center gap-0.5 flex-shrink-0">
                          {Array.from({ length: place.rating }).map((_, i) => (
                            <Star key={i} size={10} className="text-gold-400 fill-gold-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed mt-1.5">{place.description}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="flex items-center gap-1 text-xs text-zinc-400">
                          <MapPin size={10} />
                          {place.distance}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-zinc-400">
                          <Clock size={10} />
                          {place.duration}
                        </span>
                      </div>
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        {place.tags.map((tag) => (
                          <span key={tag} className="text-[11px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                      {(place.url || place.mapUrl) && (
                        <div className="flex gap-2 mt-3">
                          {place.url && (
                            <a
                              href={place.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-[12px] text-gold-300 hover:text-gold-200 border border-gold-500/25 bg-gold-500/5 px-3 py-1.5 rounded-lg transition-all"
                            >
                              <Globe size={12} />
                              {webLabel}
                            </a>
                          )}
                          {place.mapUrl && (
                            <a
                              href={place.mapUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-[12px] text-zinc-200 hover:text-white border border-zinc-700 bg-zinc-800/60 px-3 py-1.5 rounded-lg transition-all"
                            >
                              <Navigation size={12} />
                              {t('map.googleMaps')}
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>

            <div className="mt-4 text-center">
              <p className="text-xs text-zinc-400">{t('map.chatLink')}</p>
              <Link href="/dashboard/chat" className="text-xs text-gold-400 hover:text-gold-300 mt-1 inline-block">
                {t('map.chatLinkSub')}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
