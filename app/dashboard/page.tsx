'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { usePhase } from '@/lib/phase'
import { useStore } from '@/lib/useStore'
import { useLanguage } from '@/lib/useLanguage'
import AnnouncementBanner from '@/components/AnnouncementBanner'
import CompanionInvite from '@/components/CompanionInvite'
import MemoryCard from '@/components/MemoryCard'
import SecretKey from '@/components/SecretKey'
import {
  Lightbulb, BookOpen, MessageCircle,
  Star, ExternalLink,
  Bell, ChevronRight, Wifi,
  Phone, Sun, Moon, Sunset, MapPin, X, ArrowRight,
  Navigation2, BarChart3, Sparkles
} from 'lucide-react'
import { getLightingAnalytics, markGuestArrived, unmarkGuestArrived } from '@/lib/store'
import { SCENES } from '@/lib/lighting'
import SceneVisual from '@/components/SceneVisual'

type GreetingKey = 'morning' | 'afternoon' | 'evening' | 'night'

function getGreetingKey(): { key: GreetingKey; Icon: typeof Sun } {
  const h = new Date().getHours()
  if (h < 5)  return { key: 'night',     Icon: Moon }
  if (h < 10) return { key: 'morning',   Icon: Sun }
  if (h < 17) return { key: 'afternoon', Icon: Sun }
  if (h < 20) return { key: 'evening',   Icon: Sunset }
  return { key: 'night', Icon: Moon }
}

const staggerChildren = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } },
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

  const days = daysUntil()

  return (
    <div className="page-container">
      <AnnouncementBanner />
      <motion.div variants={staggerChildren} initial="hidden" animate="show">

        {/* Greeting */}
        <motion.div variants={fadeUp} className="mb-8 pt-2">
          <p className="section-title">{t('home.booked.status')}</p>
          <h1 className="font-serif text-3xl text-zinc-50 leading-tight">
            {t(`home.greetings.${greetKey}`)}、<br />
            <span className="text-gold-gradient">{guestInfo?.name?.split(' ')[0]}</span>
          </h1>
        </motion.div>

        {/* Hero Countdown Card */}
        <motion.div variants={fadeUp} className="relative mb-4 overflow-hidden rounded-3xl"
          style={{
            background: 'linear-gradient(135deg, rgba(251,191,36,0.08) 0%, rgba(251,160,36,0.04) 40%, rgba(10,10,20,0.6) 100%)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(251,191,36,0.15)',
            boxShadow: '0 4px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(251,191,36,0.12)',
          }}
        >
          {/* Ambient glow */}
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none"
               style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.12) 0%, transparent 70%)', filter: 'blur(20px)' }} />

          <div className="relative p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-xs text-gold-500/70 tracking-[0.2em] uppercase mb-1">{t('home.booked.countdown')}</p>
                <div className="flex items-end gap-2">
                  <motion.span
                    className="hero-number text-gold-gradient"
                    animate={{ scale: [1, 1.015, 1] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    {days}
                  </motion.span>
                  <span className="text-2xl text-zinc-400 mb-2 font-light">{t('home.booked.countdownUnit')}</span>
                </div>
                <p className="text-sm text-zinc-400 mt-1">{guestInfo?.checkIn} {settings.checkInTime}〜</p>
              </div>
              <motion.div
                className="text-6xl select-none"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              >
                🏔️
              </motion.div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              {[
                { label: t('home.booked.checkin'), date: guestInfo?.checkIn, time: `${settings.checkInTime}〜` },
                { label: t('home.booked.checkout'), date: guestInfo?.checkOut, time: `〜${settings.checkOutTime}` },
              ].map(({ label, date, time }) => (
                <div key={label} className="rounded-2xl p-3"
                     style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <p className="text-[11px] text-zinc-300 mb-1">{label}</p>
                  <p className="text-sm text-zinc-100 font-medium">{date}</p>
                  <p className="text-xs text-zinc-300">{time}</p>
                </div>
              ))}
            </div>

            {canMarkArrival && !arrivedAt && (
              <motion.button
                onClick={handleMarkArrived}
                className="w-full py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all"
                style={{
                  background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
                  color: '#09090b',
                  boxShadow: '0 4px 20px rgba(251,191,36,0.35)',
                }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.97 }}
              >
                <MapPin size={16} />
                {t('home.booked.markArrived')}
              </motion.button>
            )}
            {arrivedAt && (
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-xs text-emerald-400">{t('home.booked.arrivedStatus')}</span>
                </div>
                <button onClick={handleCancelArrival}
                        className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-400 transition-colors">
                  <X size={11} />
                  {t('home.booked.cancelArrival')}
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Access Grid */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3 mb-5">
          {/* Map — full height left */}
          <Link href="/dashboard/map" className="row-span-2">
            <motion.div
              className="h-full min-h-[160px] rounded-3xl p-4 flex flex-col justify-between cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, rgba(34,197,94,0.08) 0%, rgba(10,10,18,0.8) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(34,197,94,0.12)',
              }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.97 }}
            >
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                   style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.2)' }}>
                <Navigation2 size={18} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-100">{t('home.booked.accessMap')}</p>
                <p className="text-xs text-zinc-300 mt-0.5">Local Map</p>
              </div>
            </motion.div>
          </Link>

          {/* Guide */}
          <Link href="/dashboard/guide">
            <motion.div
              className="rounded-3xl p-4 cursor-pointer"
              style={{
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.97 }}
            >
              <BookOpen size={18} className="text-gold-400 mb-2" />
              <p className="text-sm font-semibold text-zinc-100">{t('home.booked.facilityGuide')}</p>
              <p className="text-xs text-zinc-300 mt-0.5">Facility Guide</p>
            </motion.div>
          </Link>

          {/* Chat */}
          <Link href="/dashboard/chat">
            <motion.div
              className="rounded-3xl p-4 cursor-pointer"
              style={{
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.97 }}
            >
              <MessageCircle size={18} className="text-blue-400 mb-2" />
              <p className="text-sm font-semibold text-zinc-100">{t('home.booked.askHost')}</p>
              <p className="text-xs text-zinc-300 mt-0.5">Ask Host</p>
            </motion.div>
          </Link>
        </motion.div>

        {/* Wi-Fi + Phone */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3 mb-5">
          <div className="rounded-2xl p-4 flex items-start gap-2.5"
               style={{ background: 'rgba(34,211,238,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(34,211,238,0.14)' }}>
            <Wifi size={15} className="text-cyan-300 flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-xs text-zinc-300 mb-0.5">Wi-Fi</p>
              <p className="text-xs text-zinc-200 font-medium truncate">{settings.wifiName}</p>
              <p className="text-xs text-zinc-300 truncate">{settings.wifiPassword}</p>
            </div>
          </div>
          <div className="rounded-2xl p-4 flex items-start gap-2.5"
               style={{ background: 'rgba(167,139,250,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(167,139,250,0.14)' }}>
            <Phone size={15} className="text-violet-300 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-zinc-300 mb-0.5">{t('home.booked.hostContact')}</p>
              <p className="text-xs text-zinc-200 font-medium">{settings.ownerPhone}</p>
            </div>
          </div>
        </motion.div>

        {/* Host message */}
        {settings.hostWelcomeMessage && (
          <motion.div variants={fadeUp} className="rounded-2xl p-4 mb-5"
               style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm">💬</span>
              <span className="text-xs text-zinc-300">{t('home.booked.hostMessage')}</span>
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed">{settings.hostWelcomeMessage}</p>
          </motion.div>
        )}

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

  const daysLeft = guestInfo?.checkOut
    ? Math.max(0, Math.ceil((new Date(guestInfo.checkOut).getTime() - Date.now()) / 86400000))
    : 1

  const [memoryOpen, setMemoryOpen] = useState(false)

  // Quick mood scenes (subset for dashboard)
  const moodScenes = SCENES.filter(s => ['evening', 'morning', 'reading', 'sleep'].includes(s.id))

  return (
    <div className="page-container">
      <AnnouncementBanner />
      <motion.div variants={staggerChildren} initial="hidden" animate="show">

        {/* Header */}
        <motion.div variants={fadeUp} className="mb-6 pt-2 flex items-start justify-between">
          <div>
            <p className="section-title">{t('home.staying.status')}</p>
            <h1 className="font-serif text-3xl text-zinc-50 leading-tight">
              {t(`home.greetings.${greetKey}`)}
            </h1>
            <p className="text-sm mt-1 font-light">
              <span className="text-aurora-gradient font-medium">{guestInfo?.name?.split(' ')[0]}</span>
              <span className="text-zinc-400"> · {guestInfo?.reservationId}</span>
            </p>
          </div>
          {(unreadMsgs > 0 || pendingReqs > 0) && (
            <Link href="/dashboard/chat">
              <motion.div
                className="w-11 h-11 rounded-2xl flex items-center justify-center relative"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}
                whileTap={{ scale: 0.92 }}
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Bell size={18} className="text-red-400" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[11px] text-white flex items-center justify-center font-bold">
                  {Math.min(unreadMsgs + pendingReqs, 9)}
                </span>
              </motion.div>
            </Link>
          )}
        </motion.div>

        {/* ご出発の日：光の記憶（デジタル・チェックアウト） */}
        {daysLeft === 0 && (
          <motion.div variants={fadeUp} className="mb-4">
            <button onClick={() => setMemoryOpen(true)}
              className="w-full rounded-3xl p-4 flex items-center gap-3 text-left transition-all lf-glow"
              style={{
                background: 'linear-gradient(135deg, rgba(255,157,92,0.12) 0%, rgba(13,10,8,0.5) 100%)',
                border: '1px solid rgba(255,157,92,0.22)',
                ['--lf-glow-color' as any]: 'rgba(255,157,92,0.55)',
              }}>
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 animate-ember-pulse"
                   style={{ background: 'rgba(255,157,92,0.14)', border: '1px solid rgba(255,157,92,0.25)' }}>
                <Sparkles size={18} className="text-ember-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-emissive">本日ご出発 — 光の記憶を受け取る</p>
                <p className="text-xs text-zinc-400 mt-0.5">滞在中に紡いだ光の物語をカードに</p>
              </div>
              <ArrowRight size={16} className="text-ember-400 flex-shrink-0" />
            </button>
          </motion.div>
        )}

        {/* Hero: Lighting Control */}
        <motion.div variants={fadeUp} className="mb-4">
          <Link href="/dashboard/lighting">
            <motion.div
              className="relative overflow-hidden rounded-3xl p-5 cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, rgba(251,191,36,0.1) 0%, rgba(251,120,36,0.05) 50%, rgba(10,10,18,0.7) 100%)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(251,191,36,0.18)',
                boxShadow: '0 4px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(251,191,36,0.1)',
                minHeight: '180px',
              }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Glow orb */}
              <div className="absolute -top-8 right-4 w-40 h-40 pointer-events-none"
                   style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.18) 0%, transparent 70%)', filter: 'blur(16px)' }} />

              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <motion.span
                        className="w-2 h-2 bg-gold-400 rounded-full"
                        animate={{ opacity: [1, 0.4, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                      <span className="text-xs text-gold-400 font-medium tracking-wide">OLEDWorks Brite 3 · LIVE</span>
                    </div>
                    <h2 className="text-2xl font-serif text-zinc-50">{t('home.staying.lightingControl')}</h2>
                    <p className="text-xs text-zinc-300 mt-0.5">{t('home.staying.tapToOperate')}</p>
                  </div>
                  <motion.div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.2)' }}
                    animate={{
                      boxShadow: [
                        '0 0 12px rgba(251,191,36,0.15)',
                        '0 0 28px rgba(251,191,36,0.3)',
                        '0 0 12px rgba(251,191,36,0.15)',
                      ],
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <Lightbulb size={24} className="text-gold-400" />
                  </motion.div>
                </div>

                {/* Current scene indicator */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden"
                       style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: 'linear-gradient(to right, #d97706, #fbbf24, #fde68a)' }}
                      initial={{ width: '70%' }}
                      animate={{ width: '70%' }}
                    />
                  </div>
                  <span className="text-xs text-zinc-400 whitespace-nowrap">
                    {analytics.topScene ? analytics.topScene.name : 'くつろぎ · 70%'}
                  </span>
                  <ArrowRight size={14} className="text-zinc-300" />
                </div>
              </div>
            </motion.div>
          </Link>
        </motion.div>

        {/* Mood Quick Picker */}
        <motion.div variants={fadeUp} className="mb-5">
          <p className="section-title mb-3">今の気分で照明を選ぶ</p>
          <div className="grid grid-cols-4 gap-2">
            {moodScenes.map((scene) => (
              <Link key={scene.id} href="/dashboard/lighting">
                <motion.div
                  className="rounded-2xl p-3 flex flex-col items-center gap-1.5 cursor-pointer"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                  whileHover={{ scale: 1.04, borderColor: 'rgba(251,191,36,0.3)' }}
                  whileTap={{ scale: 0.94 }}
                >
                  <div className="w-9 h-9">
                    <SceneVisual id={scene.id} />
                  </div>
                  <span className="text-[11px] text-zinc-400 text-center leading-tight">{scene.nameJa}</span>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Companion invite (representative only) */}
        <motion.div variants={fadeUp} className="mb-5">
          <CompanionInvite />
        </motion.div>

        {/* Status strip */}
        <motion.div variants={fadeUp} className="grid grid-cols-3 gap-2 mb-5">
          <div className="rounded-2xl p-3 flex flex-col items-center gap-1.5"
               style={{ background: 'rgba(34,211,238,0.05)', backdropFilter: 'blur(16px)', border: '1px solid rgba(34,211,238,0.14)' }}>
            <Wifi size={14} className="text-cyan-300" />
            <p className="text-[11px] text-zinc-300">Wi-Fi</p>
            <p className="text-xs text-zinc-300 text-center leading-tight truncate w-full text-center">{settings.wifiName}</p>
          </div>
          <div className="rounded-2xl p-3 flex flex-col items-center gap-1.5"
               style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <Moon size={14} className="text-zinc-400" />
            <p className="text-[11px] text-zinc-300">滞在</p>
            <p className="text-xs font-medium text-zinc-200">
              {daysLeft > 0 ? t('home.staying.stayRemaining', { n: String(daysLeft) }) : t('home.staying.stayToday')}
            </p>
          </div>
          <Link href="/dashboard/requests" className="relative rounded-2xl p-3 flex flex-col items-center gap-1.5"
                style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <Bell size={14} className={pendingReqs > 0 ? 'text-gold-400' : 'text-zinc-400'} />
            <p className="text-[11px] text-zinc-300">{t('home.staying.request')}</p>
            <p className="text-xs font-medium text-zinc-200">{pendingReqs > 0 ? `${pendingReqs}件` : t('home.staying.sendRequest')}</p>
            {pendingReqs > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-gold-400 rounded-full animate-pulse" />}
          </Link>
        </motion.div>

        {/* Quick actions */}
        <motion.div variants={fadeUp}>
          <p className="section-title mb-3">{t('home.staying.quickActions')}</p>
          <div className="grid grid-cols-2 gap-3 mb-5">
            {[
              { href: '/dashboard/requests', label: t('home.staying.serviceRequest'), sub: t('home.staying.serviceRequestSub'), emoji: '🛎️', color: 'rgba(251,191,36,0.08)', borderColor: 'rgba(251,191,36,0.12)' },
              { href: '/dashboard/chat',     label: t('home.staying.concierge'),       sub: t('home.staying.conciergeSub'),       emoji: '💬', color: 'rgba(99,102,241,0.08)', borderColor: 'rgba(99,102,241,0.12)' },
              { href: '/dashboard/map',      label: t('home.staying.nearbySpots'),     sub: t('home.staying.nearbySpotsSub'),     emoji: '🗺️', color: 'rgba(34,197,94,0.08)', borderColor: 'rgba(34,197,94,0.1)' },
              { href: '/dashboard/guestbook',label: t('home.staying.writeGuestbook'),  sub: t('home.staying.writeGuestbookSub'), emoji: '📸', color: 'rgba(236,72,153,0.06)', borderColor: 'rgba(236,72,153,0.1)' },
            ].map(({ href, label, sub, emoji, color, borderColor }) => (
              <Link key={href} href={href}>
                <motion.div
                  className="rounded-2xl p-4 flex flex-col gap-2 cursor-pointer"
                  style={{
                    background: color,
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: `1px solid ${borderColor}`,
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                >
                  <span className="text-2xl">{emoji}</span>
                  <div>
                    <p className="text-sm font-semibold text-zinc-100">{label}</p>
                    <p className="text-xs text-zinc-300 mt-0.5 leading-snug">{sub}</p>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Unread message alert */}
        <AnimatePresence>
          {unreadMsgs > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4"
            >
              <Link href="/dashboard/chat">
                <div className="rounded-2xl p-4"
                     style={{ background: 'rgba(59,130,246,0.07)', backdropFilter: 'blur(20px)', border: '1px solid rgba(59,130,246,0.15)' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <motion.span className="w-2 h-2 bg-blue-400 rounded-full"
                                 animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
                    <span className="text-xs text-blue-400 font-medium">{t('home.staying.hostMessage')}</span>
                  </div>
                  <p className="text-sm text-zinc-300 line-clamp-2">
                    {store.messages.filter(m => m.from === 'owner').slice(-1)[0]?.content}
                  </p>
                  <p className="text-xs text-zinc-300 mt-1 flex items-center gap-1">{t('home.staying.tapToCheck')} <ArrowRight size={11} /></p>
                </div>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>

      <MemoryCard open={memoryOpen} onClose={() => setMemoryOpen(false)} />
    </div>
  )
}

// ─── Post ─────────────────────────────────────────────────────────────────────
function PostHome({ guestInfo }: { guestInfo: any }) {
  const [store] = useStore()
  const { t } = useLanguage()
  const analytics = getLightingAnalytics(store)

  // チェックアウト時、光の記憶カードを一度だけ自動生成
  const [memoryOpen, setMemoryOpen] = useState(false)
  useEffect(() => {
    const key = `lf_memory_${guestInfo?.reservationId ?? 'guest'}`
    try {
      if (!localStorage.getItem(key)) { localStorage.setItem(key, '1'); setMemoryOpen(true) }
    } catch { /* localStorage 不可環境は自動表示しない */ }
  }, [guestInfo])

  const totalEvents = store.lightingHistory?.length ?? 0

  // Sophisticated scene-usage visualization data (top scenes)
  const sceneBars = Object.entries(analytics.sceneCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, count]) => {
      const scene = SCENES.find(s => s.nameEn === name)
      return { name, count, id: scene?.id ?? name, nameJa: scene?.nameJa ?? name }
    })
  const maxCount = Math.max(...sceneBars.map(b => b.count), 1)

  return (
    <div className="page-container">
      <motion.div variants={staggerChildren} initial="hidden" animate="show">

        {/* Hero thank you */}
        <motion.div variants={fadeUp} className="mb-5 pt-2">
          <p className="section-title">{t('home.post.status')}</p>
          <h1 className="font-serif text-3xl text-zinc-50 leading-tight">{t('home.post.thanks')}</h1>
          <p className="text-zinc-300 text-sm mt-1 font-light">Thank you, {guestInfo?.name?.split(' ')[0]}</p>
        </motion.div>

        {/* 光の設計図（Light Blueprint） */}
        <motion.div variants={fadeUp} className="mb-4">
          <Link href="/dashboard/blueprint">
            <motion.div
              className="rounded-3xl p-4 flex items-center gap-3"
              style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.07)' }}
              whileHover={{ scale:1.01, borderColor:'rgba(255,157,92,0.25)' }}
              whileTap={{ scale:0.97 }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                   style={{ background:'rgba(255,157,92,0.08)', border:'1px solid rgba(255,157,92,0.14)' }}>
                ✦
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-100">光の設計図を見る</p>
                <p className="text-xs text-zinc-500 mt-0.5">あなただけの光のプロファイル · Blueprint</p>
              </div>
              <ArrowRight size={15} className="text-zinc-600 flex-shrink-0" />
            </motion.div>
          </Link>
        </motion.div>

        {/* 光の記憶（チェックアウトのデジタルカード）を開く */}
        <motion.div variants={fadeUp} className="mb-5">
          <button onClick={() => setMemoryOpen(true)}
            className="w-full rounded-3xl p-5 flex items-center gap-4 text-left transition-all lf-glow"
            style={{
              background: 'linear-gradient(135deg, rgba(255,157,92,0.12) 0%, rgba(13,10,8,0.5) 100%)',
              border: '1px solid rgba(255,157,92,0.22)',
              boxShadow: '0 4px 28px rgba(255,157,92,0.12)',
              ['--lf-glow-color' as any]: 'rgba(255,157,92,0.55)',
            }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 animate-ember-pulse"
                 style={{ background: 'rgba(255,157,92,0.14)', border: '1px solid rgba(255,157,92,0.25)' }}>
              <Sparkles size={20} className="text-ember-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-serif text-lg text-emissive leading-tight">光の記憶をひらく</p>
              <p className="text-xs text-zinc-400 mt-0.5">Lumina Fuji で過ごした、あなただけの光の物語</p>
            </div>
            <ArrowRight size={18} className="text-ember-400 flex-shrink-0" />
          </button>
        </motion.div>

        {/* Personalized light journey card */}
        {analytics.topScene && (
          <motion.div variants={fadeUp} className="relative overflow-hidden rounded-3xl p-5 mb-4"
            style={{
              background: 'linear-gradient(135deg, rgba(251,191,36,0.1) 0%, rgba(251,120,36,0.06) 50%, rgba(10,10,18,0.8) 100%)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(251,191,36,0.18)',
              boxShadow: '0 4px 32px rgba(0,0,0,0.4)',
            }}
          >
            <div className="absolute top-0 right-0 w-40 h-40 pointer-events-none"
                 style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.12) 0%, transparent 70%)', filter: 'blur(20px)' }} />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <Star size={13} className="text-gold-400 fill-gold-400" />
                <span className="text-xs text-gold-400 font-medium tracking-wide">{t('home.post.personalizedLabel')}</span>
              </div>
              <h2 className="text-xl font-serif text-zinc-100 mb-2" style={{ whiteSpace: 'pre-line' }}>
                {t('home.post.personalizedHeading')}
              </h2>
              <p className="text-zinc-400 text-sm leading-relaxed mb-4"
                dangerouslySetInnerHTML={{
                  __html: t('home.post.personalizedDesc', {
                    scene: `<strong class="text-gold-400">${analytics.topScene.name}</strong>`,
                    count: String(analytics.topScene.count),
                  }),
                }}
              />
              {/* Stats row */}
              {totalEvents > 0 && (
                <div className="flex gap-3 mb-4">
                  {[
                    { label: '照明操作', value: `${totalEvents}回` },
                    { label: 'お気に入りシーン', value: analytics.topScene.name },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex-1 rounded-2xl p-3 text-center"
                         style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <p className="text-xs text-zinc-300">{label}</p>
                      <p className="text-sm font-medium text-zinc-200 mt-0.5">{value}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Scene distribution chart — sophisticated data viz */}
        {sceneBars.length > 0 && (
          <motion.div variants={fadeUp} className="relative overflow-hidden rounded-3xl p-5 mb-4 glass">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                     style={{ background: 'rgba(139,92,246,0.14)', border: '1px solid rgba(139,92,246,0.22)' }}>
                  <BarChart3 size={14} className="text-violet-300" />
                </div>
                <span className="text-sm font-medium text-zinc-100">光のシーン分布</span>
              </div>
              <span className="text-[11px] text-zinc-400 tabular-nums">{totalEvents} 回の操作</span>
            </div>

            <div className="space-y-3.5">
              {sceneBars.map((b, i) => {
                const pct = Math.round((b.count / maxCount) * 100)
                const isTop = i === 0
                return (
                  <div key={b.name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-5 h-5 flex-shrink-0">
                          <SceneVisual id={b.id} />
                        </div>
                        <span className="text-xs text-zinc-300 truncate">{b.nameJa}</span>
                      </div>
                      <span className="text-xs font-medium tabular-nums flex-shrink-0"
                            style={{ color: isTop ? '#fbbf24' : '#c4b5fd' }}>
                        {b.count}
                      </span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          background: isTop
                            ? 'linear-gradient(90deg, #d97706 0%, #fbbf24 60%, #fde68a 100%)'
                            : 'linear-gradient(90deg, #8b5cf6 0%, #6366f1 50%, #22d3ee 100%)',
                          boxShadow: isTop
                            ? '0 0 12px rgba(251,191,36,0.4)'
                            : '0 0 12px rgba(139,92,246,0.35)',
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 1, delay: 0.2 + i * 0.12, ease: [0.25, 0.1, 0.25, 1] }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Digital Secret Key — ECUANEST VIP アクセス */}
        <motion.div variants={fadeUp} className="mb-4">
          <div className="mb-2">
            <p className="text-xs text-zinc-600 uppercase tracking-[0.2em]">Your Legacy</p>
          </div>
          <SecretKey
            reservationId={guestInfo?.reservationId ?? 'lf-guest'}
            guestName={guestInfo?.name ?? 'ゲスト'}
          />
        </motion.div>

        {/* Guestbook CTA */}
        <motion.div variants={fadeUp} className="mb-4">
          <Link href="/dashboard/guestbook">
            <motion.div
              className="rounded-3xl p-4 flex items-center gap-4 cursor-pointer"
              style={{
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
              whileHover={{ scale: 1.01, borderColor: 'rgba(236,72,153,0.3)' }}
              whileTap={{ scale: 0.97 }}
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                   style={{ background: 'rgba(236,72,153,0.08)', border: '1px solid rgba(236,72,153,0.12)' }}>
                📸
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-zinc-100">{t('home.post.guestbookCTA')}</p>
                <p className="text-xs text-zinc-300 mt-0.5">{t('home.post.guestbookSub')}</p>
              </div>
              <ChevronRight size={16} className="text-zinc-400" />
            </motion.div>
          </Link>
        </motion.div>

        {/* Repeater offer */}
        <motion.div variants={fadeUp} className="relative overflow-hidden rounded-3xl p-5"
          style={{
            background: 'linear-gradient(135deg, rgba(251,191,36,0.07) 0%, rgba(251,120,36,0.03) 100%)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(251,191,36,0.12)',
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🎁</span>
            <span className="text-sm font-semibold text-gold-400">{t('home.post.repeaterBenefit')}</span>
          </div>
          <p className="text-zinc-300 text-sm mb-4" dangerouslySetInnerHTML={{ __html: t('home.post.repeaterDesc') }} />
          <a href="https://www.airbnb.com" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 py-2.5 px-5 rounded-2xl text-sm font-semibold transition-all"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)', color: '#09090b', boxShadow: '0 4px 16px rgba(251,191,36,0.25)' }}
          >
            {t('home.post.rebook')} <ExternalLink size={12} />
          </a>
        </motion.div>

      </motion.div>

      <MemoryCard open={memoryOpen} onClose={() => setMemoryOpen(false)} />
    </div>
  )
}
