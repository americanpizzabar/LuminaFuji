'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePhase } from '@/lib/phase'
import { useStore } from '@/lib/useStore'
import { useLanguage } from '@/lib/useLanguage'
import AnnouncementBanner from '@/components/AnnouncementBanner'
import {
  Lightbulb, BookOpen, Map, MessageCircle, ShoppingBag,
  Camera, Star, ExternalLink,
  Sparkles, Building2, Bell, ChevronRight, Wifi,
  Phone, Sun, Moon, Sunset, MapPin, X
} from 'lucide-react'
import { getFeaturedProducts } from '@/lib/products'
import { getLightingAnalytics, markGuestArrived, unmarkGuestArrived } from '@/lib/store'

type GreetingKey = 'morning' | 'afternoon' | 'evening' | 'night'

function getGreetingKey(): { key: GreetingKey; Icon: typeof Sun } {
  const h = new Date().getHours()
  if (h < 5)  return { key: 'night',     Icon: Moon }
  if (h < 10) return { key: 'morning',   Icon: Sun }
  if (h < 17) return { key: 'afternoon', Icon: Sun }
  if (h < 20) return { key: 'evening',   Icon: Sunset }
  return { key: 'night', Icon: Moon }
}

export default function DashboardPage() {
  const { phase, guestInfo } = usePhase()
  if (phase === 'booked')  return <BookedHome guestInfo={guestInfo} />
  if (phase === 'staying') return <StayingHome guestInfo={guestInfo} />
  return <PostHome guestInfo={guestInfo} />
}

// ─── Booked ──────────────────────────────────────────────────────────────────
function BookedHome({ guestInfo }: { guestInfo: any }) {
  const [store, update] = useStore()
  const { t } = useLanguage()
  const settings = store.facilitySettings
  const { key: greetKey } = getGreetingKey()

  const daysUntil = () => {
    if (!guestInfo?.checkIn) return 0
    return Math.max(0, Math.ceil((new Date(guestInfo.checkIn).getTime() - Date.now()) / 86400000))
  }

  // チェックイン時刻を過ぎているか判定
  const checkInDt = (() => {
    if (!guestInfo?.checkIn) return null
    const [h, m] = settings.checkInTime.split(':').map(Number)
    const d = new Date(guestInfo.checkIn)
    d.setHours(h, m, 0, 0)
    return d
  })()
  const canMarkArrival = checkInDt !== null && Date.now() >= checkInDt.getTime()
  const arrivedAt: string | undefined = store.guestInfo?.arrivedAt

  const handleMarkArrived = () => {
    if (!store.guestInfo?.reservationId) return
    const now = new Date().toISOString()
    markGuestArrived(store.guestInfo.reservationId, now)
    update({ guestInfo: { ...store.guestInfo, arrivedAt: now } })
  }

  const handleCancelArrival = () => {
    if (!store.guestInfo?.reservationId) return
    unmarkGuestArrived(store.guestInfo.reservationId)
    const { arrivedAt: _a, ...rest } = store.guestInfo
    update({ guestInfo: rest as typeof store.guestInfo })
  }

  return (
    <div className="page-container">
      <AnnouncementBanner />
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="mb-6 pt-2">
          <p className="section-title">{t('home.booked.status')}</p>
          <h1 className="font-serif text-2xl text-zinc-100 leading-snug">
            {t(`home.greetings.${greetKey}`)}、<br />{guestInfo?.name?.split(' ')[0]}
          </h1>
        </div>

        <div className="card p-5 mb-4 border-gold-500/20 bg-gradient-to-br from-amber-950/30 to-zinc-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500 mb-1">{t('home.booked.countdown')}</p>
              <p className="text-4xl font-light text-gold-400 tabular-nums">{daysUntil()}<span className="text-xl ml-1">{t('home.booked.countdownUnit')}</span></p>
              <p className="text-xs text-zinc-400 mt-1">{guestInfo?.checkIn} {settings.checkInTime}〜</p>
            </div>
            <div className="text-5xl">🏔️</div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-zinc-800">
            <div>
              <p className="text-xs text-zinc-500">{t('home.booked.checkin')}</p>
              <p className="text-sm text-zinc-200 font-medium">{guestInfo?.checkIn}</p>
              <p className="text-xs text-zinc-500">{settings.checkInTime}〜</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">{t('home.booked.checkout')}</p>
              <p className="text-sm text-zinc-200 font-medium">{guestInfo?.checkOut}</p>
              <p className="text-xs text-zinc-500">〜{settings.checkOutTime}</p>
            </div>
          </div>

          {/* 到着ボタン: チェックイン時刻を過ぎたら表示 */}
          {canMarkArrival && !arrivedAt && (
            <div className="mt-4 pt-4 border-t border-zinc-800">
              <p className="text-xs text-zinc-500 mb-3">{t('home.booked.arrivalNote')}</p>
              <button
                onClick={handleMarkArrived}
                className="w-full py-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-zinc-950 font-medium text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <MapPin size={16} />
                {t('home.booked.markArrived')}
              </button>
            </div>
          )}
          {arrivedAt && (
            <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-400 rounded-full" />
                <span className="text-xs text-emerald-400">{t('home.booked.arrivedStatus')}</span>
              </div>
              <button
                onClick={handleCancelArrival}
                className="flex items-center gap-1 text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
              >
                <X size={11} />
                {t('home.booked.cancelArrival')}
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="card p-4 flex items-start gap-2">
            <Wifi size={15} className="text-gold-400 flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-xs text-zinc-500 mb-0.5">Wi-Fi</p>
              <p className="text-xs text-zinc-200 font-medium truncate">{settings.wifiName}</p>
              <p className="text-xs text-zinc-500 truncate">{settings.wifiPassword}</p>
            </div>
          </div>
          <div className="card p-4 flex items-start gap-2">
            <Phone size={15} className="text-gold-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-zinc-500 mb-0.5">{t('home.booked.hostContact')}</p>
              <p className="text-xs text-zinc-200 font-medium">{settings.ownerPhone}</p>
            </div>
          </div>
        </div>

        {settings.hostWelcomeMessage && (
          <div className="card p-4 mb-4 border-zinc-700/50">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm">💬</span>
              <span className="text-xs text-zinc-500">{t('home.booked.hostMessage')}</span>
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed">{settings.hostWelcomeMessage}</p>
          </div>
        )}

        <p className="section-title">{t('home.booked.prepare')}</p>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { href: '/dashboard/map',      label: t('home.booked.accessMap'),       sub: 'Local Map',        emoji: '🗺️' },
            { href: '/dashboard/guide',    label: t('home.booked.facilityGuide'),   sub: 'Facility Guide',   emoji: '📋' },
            { href: '/dashboard/products', label: t('home.booked.lightingPreview'), sub: 'ECUANEST Preview', emoji: '✦'  },
            { href: '/dashboard/chat',     label: t('home.booked.askHost'),          sub: 'Ask Host',         emoji: '💬' },
          ].map(({ href, label, sub, emoji }) => (
            <Link key={href} href={href} className="card p-4 flex flex-col gap-1.5 hover:border-zinc-700 transition-all active:scale-98">
              <span className="text-2xl">{emoji}</span>
              <p className="text-sm font-medium text-zinc-200">{label}</p>
              <p className="text-xs text-zinc-600">{sub}</p>
            </Link>
          ))}
        </div>

        <div className="card p-5 overflow-hidden relative border-gold-500/10">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-900/15 to-transparent pointer-events-none" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-gold-500 font-medium tracking-wider uppercase">{t('home.booked.showroomTitle')}</span>
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed mb-3">{t('home.booked.showroomDesc')}</p>
            <Link href="/dashboard/products" className="btn-gold inline-flex items-center gap-2 text-sm py-2.5 px-5">
              {t('home.booked.viewProducts')} <Sparkles size={13} />
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Staying ─────────────────────────────────────────────────────────────────
function StayingHome({ guestInfo }: { guestInfo: any }) {
  const [store] = useStore()
  const { t } = useLanguage()
  const analytics = getLightingAnalytics(store)
  const settings = store.facilitySettings
  const pendingReqs = store.serviceRequests.filter(r => r.status === 'pending').length
  const unreadMsgs = store.messages.filter(m => m.from === 'owner' && !m.readByGuest).length
  const { key: greetKey } = getGreetingKey()

  const checkoutDate = guestInfo?.checkOut
  const daysLeft = checkoutDate
    ? Math.max(0, Math.ceil((new Date(checkoutDate).getTime() - Date.now()) / 86400000))
    : 1

  return (
    <div className="page-container">
      <AnnouncementBanner />
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="mb-5 pt-2 flex items-start justify-between">
          <div>
            <p className="section-title">{t('home.staying.status')}</p>
            <h1 className="font-serif text-2xl text-zinc-100 leading-snug">
              {t(`home.greetings.${greetKey}`)}
            </h1>
            <p className="text-zinc-500 text-sm mt-0.5">{guestInfo?.name?.split(' ')[0]} · {guestInfo?.reservationId}</p>
          </div>
          {(unreadMsgs > 0 || pendingReqs > 0) && (
            <Link href="/dashboard/chat">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center relative">
                <Bell size={16} className="text-red-400" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center">
                  {unreadMsgs + pendingReqs}
                </span>
              </div>
            </Link>
          )}
        </div>

        <Link href="/dashboard/lighting">
          <motion.div
            className="card p-5 mb-3 cursor-pointer overflow-hidden relative group"
            style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.08) 0%, rgba(24,24,27,1) 65%)' }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/5 rounded-full blur-2xl group-hover:bg-amber-400/10 transition-all" />
            <div className="relative flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 bg-gold-400 rounded-full animate-pulse" />
                  <span className="text-xs text-gold-400 font-medium">ECUANEST Brite 3 · LIVE</span>
                </div>
                <h2 className="text-xl font-medium text-zinc-100">{t('home.staying.lightingControl')}</h2>
                <p className="text-xs text-zinc-500 mt-0.5">{t('home.staying.tapToOperate')}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center">
                <Lightbulb size={22} className="text-gold-400" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                <div className="h-full w-[70%] bg-gradient-to-r from-amber-700 to-gold-400 rounded-full" />
              </div>
              <span className="text-xs text-zinc-400">
                {analytics.topScene ? `${analytics.topScene.name}` : 'くつろぎ · 70%'}
              </span>
            </div>
          </motion.div>
        </Link>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="card p-3 flex flex-col items-center gap-1">
            <Wifi size={15} className="text-gold-400" />
            <p className="text-xs text-zinc-500">Wi-Fi</p>
            <p className="text-[11px] text-zinc-400 text-center leading-tight truncate w-full text-center">{settings.wifiName}</p>
          </div>
          <div className="card p-3 flex flex-col items-center gap-1">
            <Bell size={15} className="text-zinc-400" />
            <p className="text-xs text-zinc-500">Stay</p>
            <p className="text-sm font-medium text-zinc-200">
              {daysLeft > 0 ? t('home.staying.stayRemaining', { n: String(daysLeft) }) : t('home.staying.stayToday')}
            </p>
          </div>
          <Link href="/dashboard/requests" className="card p-3 flex flex-col items-center gap-1 hover:border-zinc-700 transition-all relative">
            <Bell size={15} className="text-zinc-400" />
            <p className="text-xs text-zinc-500">{t('home.staying.request')}</p>
            <p className="text-sm font-medium text-zinc-200">{pendingReqs > 0 ? `${pendingReqs}` : t('home.staying.sendRequest')}</p>
            {pendingReqs > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-400 rounded-full" />}
          </Link>
        </div>

        <p className="section-title mb-3">{t('home.staying.quickActions')}</p>
        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            { href: '/dashboard/requests', label: t('home.staying.serviceRequest'), sub: t('home.staying.serviceRequestSub'), emoji: '🛎️' },
            { href: '/dashboard/chat',     label: t('home.staying.concierge'),       sub: t('home.staying.conciergeSub'),       emoji: '💬' },
            { href: '/dashboard/map',      label: t('home.staying.nearbySpots'),     sub: t('home.staying.nearbySpotsSub'),     emoji: '🗺️' },
            { href: '/dashboard/guestbook',label: t('home.staying.writeGuestbook'),  sub: t('home.staying.writeGuestbookSub'), emoji: '📸' },
          ].map(({ href, label, sub, emoji }) => (
            <Link key={href} href={href} className="card p-4 flex flex-col gap-1.5 hover:border-zinc-700 transition-all active:scale-98">
              <span className="text-2xl">{emoji}</span>
              <p className="text-sm font-medium text-zinc-200">{label}</p>
              <p className="text-xs text-zinc-600">{sub}</p>
            </Link>
          ))}
        </div>

        {unreadMsgs > 0 && (
          <Link href="/dashboard/chat">
            <div className="card p-4 mb-4 border-blue-500/20 bg-blue-950/20">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                <span className="text-xs text-blue-400">{t('home.staying.hostMessage')}</span>
              </div>
              <p className="text-sm text-zinc-300 line-clamp-2">
                {store.messages.filter(m => m.from === 'owner').slice(-1)[0]?.content}
              </p>
              <p className="text-xs text-zinc-500 mt-1">{t('home.staying.tapToCheck')}</p>
            </div>
          </Link>
        )}

        <div className="card p-5 overflow-hidden relative border-gold-500/10">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-900/15 to-transparent pointer-events-none" />
          <div className="relative">
            <p className="section-title">{t('home.staying.showcaseTitle')}</p>
            <p className="text-zinc-300 text-sm leading-relaxed mb-3">{t('home.staying.showcaseDesc')}</p>
            <div className="flex gap-2">
              <Link href="/dashboard/products" className="flex-1 btn-gold text-sm py-2.5 text-center">{t('home.staying.viewProducts')}</Link>
              <Link href="/dashboard/consult"  className="flex-1 btn-outline text-sm py-2.5 text-center">{t('home.staying.consult')}</Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Post ─────────────────────────────────────────────────────────────────────
function PostHome({ guestInfo }: { guestInfo: any }) {
  const [store] = useStore()
  const { t } = useLanguage()
  const analytics = getLightingAnalytics(store)
  const featured = getFeaturedProducts()

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="mb-7 pt-2">
          <p className="section-title">{t('home.post.status')}</p>
          <h1 className="font-serif text-2xl text-zinc-100 leading-snug">{t('home.post.thanks')}</h1>
          <p className="text-zinc-500 text-sm mt-1">Thank you, {guestInfo?.name?.split(' ')[0]}</p>
        </div>

        {analytics.topScene && (
          <div className="card p-5 mb-4 border-gold-500/20 bg-gradient-to-br from-amber-950/40 to-zinc-900">
            <div className="flex items-center gap-2 mb-3">
              <Star size={13} className="text-gold-400 fill-gold-400" />
              <span className="text-xs text-gold-400 font-medium tracking-wide">{t('home.post.personalizedLabel')}</span>
            </div>
            <h2 className="text-lg font-serif text-zinc-100 mb-2" style={{ whiteSpace: 'pre-line' }}>
              {t('home.post.personalizedHeading')}
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed mb-4"
              dangerouslySetInnerHTML={{ __html: t('home.post.personalizedDesc', {
                scene: `<strong class="text-gold-400">${analytics.topScene.name}</strong>`,
                count: String(analytics.topScene.count),
              }) }}
            />
            <Link href="/dashboard/products/brite-3" className="btn-gold inline-flex items-center gap-2 text-sm py-2.5 px-5">
              {t('home.post.viewBrite3')} <Sparkles size={13} />
            </Link>
          </div>
        )}

        <Link href="/dashboard/guestbook">
          <div className="card p-5 mb-4 flex items-center gap-4 hover:border-zinc-700 transition-all active:scale-98">
            <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center text-3xl flex-shrink-0">📸</div>
            <div className="flex-1">
              <p className="text-sm font-medium text-zinc-100">{t('home.post.guestbookCTA')}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{t('home.post.guestbookSub')}</p>
            </div>
            <ChevronRight size={16} className="text-zinc-600" />
          </div>
        </Link>

        <p className="section-title">{t('home.post.productsSection')}</p>
        <div className="space-y-2 mb-5">
          {featured.map(p => (
            <Link key={p.id} href={`/dashboard/products/${p.id}`}>
              <div className="card p-4 flex items-center gap-3 hover:border-zinc-700 transition-all active:scale-98 mb-2">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `radial-gradient(circle, ${p.accentColor}20, ${p.accentColor}05)`, border: `1px solid ${p.accentColor}30` }}>
                  <Lightbulb size={20} style={{ color: p.accentColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-100">{p.name}</p>
                  <p className="text-xs text-zinc-500 truncate">{p.tagline}</p>
                  <p className="text-xs text-gold-400 mt-0.5">{p.price}</p>
                </div>
                <ExternalLink size={13} className="text-zinc-600 flex-shrink-0" />
              </div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <Link href="/dashboard/consult" className="card p-4 text-center hover:border-zinc-700 transition-all active:scale-98">
            <Building2 size={22} className="text-gold-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-zinc-200">{t('home.post.lightingConsult')}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{t('home.post.lightingConsultSub')}</p>
          </Link>
          <Link href="/dashboard/products" className="card p-4 text-center hover:border-zinc-700 transition-all active:scale-98">
            <ShoppingBag size={22} className="text-gold-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-zinc-200">{t('home.post.allProducts')}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{t('home.post.allProductsSub')}</p>
          </Link>
        </div>

        <div className="card p-5 border-gold-500/20 bg-gradient-to-r from-amber-950/30 to-zinc-900">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🎁</span>
            <span className="text-sm font-medium text-gold-400">{t('home.post.repeaterBenefit')}</span>
          </div>
          <p className="text-zinc-300 text-sm mb-3" dangerouslySetInnerHTML={{ __html: t('home.post.repeaterDesc') }} />
          <a href="https://www.airbnb.com" target="_blank" rel="noopener noreferrer"
            className="btn-gold inline-flex items-center gap-2 text-sm py-2.5 px-5">
            {t('home.post.rebook')} <ExternalLink size={12} />
          </a>
        </div>
      </motion.div>
    </div>
  )
}
