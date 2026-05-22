'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePhase } from '@/lib/phase'
import { useStore } from '@/lib/useStore'
import AnnouncementBanner from '@/components/AnnouncementBanner'
import {
  Lightbulb, BookOpen, Map, MessageCircle, ShoppingBag,
  Camera, Star, CalendarCheck, Clock, ExternalLink,
  Sparkles, Building2, Bell, ChevronRight, Wifi,
  Phone, AlertTriangle, Sun, Moon, Sunset
} from 'lucide-react'
import { getFeaturedProducts } from '@/lib/products'
import { getLightingAnalytics } from '@/lib/store'

function getTimeGreeting() {
  const h = new Date().getHours()
  if (h < 5) return { ja: 'おやすみなさい', en: 'Good night', icon: Moon }
  if (h < 10) return { ja: 'おはようございます', en: 'Good morning', icon: Sun }
  if (h < 17) return { ja: 'こんにちは', en: 'Good afternoon', icon: Sun }
  if (h < 20) return { ja: 'こんばんは', en: 'Good evening', icon: Sunset }
  return { ja: 'おやすみなさい', en: 'Good night', icon: Moon }
}

export default function DashboardPage() {
  const { phase, guestInfo } = usePhase()
  const greeting = getTimeGreeting()

  if (phase === 'booked') return <BookedHome guestInfo={guestInfo} greeting={greeting} />
  if (phase === 'staying') return <StayingHome guestInfo={guestInfo} greeting={greeting} />
  return <PostHome guestInfo={guestInfo} greeting={greeting} />
}

// ─── Booked ──────────────────────────────────────────────────────────────────
function BookedHome({ guestInfo, greeting }: any) {
  const [store] = useStore()
  const settings = store.facilitySettings

  const daysUntil = () => {
    if (!guestInfo?.checkIn) return 0
    return Math.max(0, Math.ceil((new Date(guestInfo.checkIn).getTime() - Date.now()) / 86400000))
  }

  return (
    <div className="page-container">
      <AnnouncementBanner />
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="mb-6 pt-2">
          <p className="section-title">予約済 · Reserved</p>
          <h1 className="font-serif text-2xl text-zinc-100 leading-snug">
            {greeting.ja}、<br />{guestInfo?.name?.split(' ')[0]}さん
          </h1>
          <p className="text-zinc-500 text-sm mt-1">{greeting.en}, {guestInfo?.name}</p>
        </div>

        {/* Countdown */}
        <div className="card p-5 mb-4 border-gold-500/20 bg-gradient-to-br from-amber-950/30 to-zinc-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500 mb-1">チェックインまで</p>
              <p className="text-4xl font-light text-gold-400 tabular-nums">{daysUntil()}<span className="text-xl ml-1">日</span></p>
              <p className="text-xs text-zinc-400 mt-1">{guestInfo?.checkIn} {settings.checkInTime}〜</p>
            </div>
            <div className="text-5xl">🏔️</div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-zinc-800">
            <div>
              <p className="text-xs text-zinc-500">チェックイン</p>
              <p className="text-sm text-zinc-200 font-medium">{guestInfo?.checkIn}</p>
              <p className="text-xs text-zinc-500">{settings.checkInTime}〜</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">チェックアウト</p>
              <p className="text-sm text-zinc-200 font-medium">{guestInfo?.checkOut}</p>
              <p className="text-xs text-zinc-500">〜{settings.checkOutTime}</p>
            </div>
          </div>
        </div>

        {/* Quick info cards */}
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
              <p className="text-xs text-zinc-500 mb-0.5">ホスト連絡先</p>
              <p className="text-xs text-zinc-200 font-medium">{settings.ownerPhone}</p>
            </div>
          </div>
        </div>

        {/* Host message */}
        {settings.hostWelcomeMessage && (
          <div className="card p-4 mb-4 border-zinc-700/50">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm">💬</span>
              <span className="text-xs text-zinc-500">ホストからのメッセージ</span>
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed">{settings.hostWelcomeMessage}</p>
          </div>
        )}

        {/* Quick links */}
        <p className="section-title">準備する</p>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { href: '/dashboard/map', label: 'アクセス地図', sub: 'Local Map', icon: Map, emoji: '🗺️' },
            { href: '/dashboard/guide', label: '施設ガイド', sub: 'Facility Guide', icon: BookOpen, emoji: '📋' },
            { href: '/dashboard/products', label: '照明を予習する', sub: 'ECUANEST Preview', icon: Lightbulb, emoji: '✦' },
            { href: '/dashboard/chat', label: 'ホストに質問', sub: 'Ask Host', icon: MessageCircle, emoji: '💬' },
          ].map(({ href, label, sub, emoji }) => (
            <Link key={href} href={href} className="card p-4 flex flex-col gap-1.5 hover:border-zinc-700 transition-all active:scale-98">
              <span className="text-2xl">{emoji}</span>
              <p className="text-sm font-medium text-zinc-200">{label}</p>
              <p className="text-xs text-zinc-600">{sub}</p>
            </Link>
          ))}
        </div>

        {/* ECUANEST teaser */}
        <div className="card p-5 overflow-hidden relative border-gold-500/10">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-900/15 to-transparent pointer-events-none" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-gold-500 font-medium tracking-wider uppercase">ECUANEST ショールーム</span>
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed mb-3">
              このレジデンスは世界初の有機EL照明リビングショールーム。滞在中、最先端の光を自由にお楽しみください。
            </p>
            <Link href="/dashboard/products" className="btn-gold inline-flex items-center gap-2 text-sm py-2.5 px-5">
              製品を見る <Sparkles size={13} />
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Staying ─────────────────────────────────────────────────────────────────
function StayingHome({ guestInfo, greeting }: any) {
  const [store] = useStore()
  const analytics = getLightingAnalytics(store)
  const settings = store.facilitySettings
  const pendingReqs = store.serviceRequests.filter(r => r.status === 'pending').length
  const unreadMsgs = store.messages.filter(m => m.from === 'owner' && !m.readByGuest).length

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
            <p className="section-title">滞在中 · Staying</p>
            <h1 className="font-serif text-2xl text-zinc-100 leading-snug">
              {greeting.ja}
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

        {/* Lighting hero */}
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
                <h2 className="text-xl font-medium text-zinc-100">照明コントロール</h2>
                <p className="text-xs text-zinc-500 mt-0.5">タップして今すぐ操作 →</p>
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
                {analytics.topScene ? `${analytics.topScene.name}モード` : 'くつろぎ · 70%'}
              </span>
            </div>
          </motion.div>
        </Link>

        {/* Status row */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="card p-3 flex flex-col items-center gap-1">
            <Clock size={15} className="text-zinc-400" />
            <p className="text-xs text-zinc-500">滞在</p>
            <p className="text-sm font-medium text-zinc-200">{daysLeft > 0 ? `あと${daysLeft}日` : '本日'}</p>
          </div>
          <div className="card p-3 flex flex-col items-center gap-1">
            <Wifi size={15} className="text-gold-400" />
            <p className="text-xs text-zinc-500">Wi-Fi</p>
            <p className="text-[11px] text-zinc-400 text-center leading-tight truncate w-full text-center">{settings.wifiName}</p>
          </div>
          <Link href="/dashboard/requests" className="card p-3 flex flex-col items-center gap-1 hover:border-zinc-700 transition-all relative">
            <Bell size={15} className="text-zinc-400" />
            <p className="text-xs text-zinc-500">リクエスト</p>
            <p className="text-sm font-medium text-zinc-200">{pendingReqs > 0 ? `${pendingReqs}件中` : '送る'}</p>
            {pendingReqs > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-400 rounded-full" />}
          </Link>
        </div>

        {/* Quick actions */}
        <p className="section-title mb-3">クイックアクション</p>
        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            { href: '/dashboard/requests', label: 'サービスリクエスト', sub: 'タオル・アメニティなど', emoji: '🛎️' },
            { href: '/dashboard/chat', label: 'コンシェルジュ', sub: 'AI · 多言語対応', emoji: '💬' },
            { href: '/dashboard/map', label: '周辺スポット', sub: 'グルメ・体験', emoji: '🗺️' },
            { href: '/dashboard/guestbook', label: '寄せ書きを書く', sub: '思い出を残す', emoji: '📸' },
          ].map(({ href, label, sub, emoji }) => (
            <Link key={href} href={href} className="card p-4 flex flex-col gap-1.5 hover:border-zinc-700 transition-all active:scale-98">
              <span className="text-2xl">{emoji}</span>
              <p className="text-sm font-medium text-zinc-200">{label}</p>
              <p className="text-xs text-zinc-600">{sub}</p>
            </Link>
          ))}
        </div>

        {/* Host message */}
        {unreadMsgs > 0 && (
          <Link href="/dashboard/chat">
            <div className="card p-4 mb-4 border-blue-500/20 bg-blue-950/20">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                <span className="text-xs text-blue-400">ホストからメッセージ</span>
              </div>
              <p className="text-sm text-zinc-300 line-clamp-2">
                {store.messages.filter(m => m.from === 'owner').slice(-1)[0]?.content}
              </p>
              <p className="text-xs text-zinc-500 mt-1">タップして確認 →</p>
            </div>
          </Link>
        )}

        {/* ECUANEST showcase */}
        <div className="card p-5 overflow-hidden relative border-gold-500/10">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-900/15 to-transparent pointer-events-none" />
          <div className="relative">
            <p className="section-title">照明ショールーム</p>
            <p className="text-zinc-300 text-sm leading-relaxed mb-3">
              この部屋の照明は全て ECUANEST の有機EL製品。気になった照明を製品ページでチェックしてください。
            </p>
            <div className="flex gap-2">
              <Link href="/dashboard/products" className="flex-1 btn-gold text-sm py-2.5 text-center">製品を見る</Link>
              <Link href="/dashboard/consult" className="flex-1 btn-outline text-sm py-2.5 text-center">相談する</Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Post ─────────────────────────────────────────────────────────────────────
function PostHome({ guestInfo, greeting }: any) {
  const [store] = useStore()
  const analytics = getLightingAnalytics(store)
  const featured = getFeaturedProducts()

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="mb-7 pt-2">
          <p className="section-title">滞在後 · Post Stay</p>
          <h1 className="font-serif text-2xl text-zinc-100 leading-snug">
            ありがとうございました
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Thank you, {guestInfo?.name?.split(' ')[0]}</p>
        </div>

        {/* Personalized lighting recommendation */}
        {analytics.topScene && (
          <div className="card p-5 mb-4 border-gold-500/20 bg-gradient-to-br from-amber-950/40 to-zinc-900">
            <div className="flex items-center gap-2 mb-3">
              <Star size={13} className="text-gold-400 fill-gold-400" />
              <span className="text-xs text-gold-400 font-medium tracking-wide">パーソナライズされたご提案</span>
            </div>
            <h2 className="text-lg font-serif text-zinc-100 mb-2">お気に入りの光を<br />ご自宅にも</h2>
            <p className="text-zinc-400 text-sm leading-relaxed mb-4">
              滞在中、<strong className="text-gold-400">「{analytics.topScene.name}」シーン</strong>を最もよくご利用いただきました（{analytics.topScene.count}回）。この光は ECUANEST Brite 3 で再現できます。
            </p>
            <Link href="/dashboard/products/brite-3" className="btn-gold inline-flex items-center gap-2 text-sm py-2.5 px-5">
              Brite 3 を見る <Sparkles size={13} />
            </Link>
          </div>
        )}

        {/* Guestbook CTA */}
        <Link href="/dashboard/guestbook">
          <div className="card p-5 mb-4 flex items-center gap-4 hover:border-zinc-700 transition-all active:scale-98">
            <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center text-3xl flex-shrink-0">📸</div>
            <div className="flex-1">
              <p className="text-sm font-medium text-zinc-100">寄せ書きを残す</p>
              <p className="text-xs text-zinc-500 mt-0.5">光の記憶を未来のゲストへ伝えよう</p>
            </div>
            <ChevronRight size={16} className="text-zinc-600" />
          </div>
        </Link>

        {/* Products */}
        <p className="section-title">ECUANEST 製品</p>
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

        {/* CTA grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Link href="/dashboard/consult" className="card p-4 text-center hover:border-zinc-700 transition-all active:scale-98">
            <Building2 size={22} className="text-gold-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-zinc-200">照明コンサル</p>
            <p className="text-xs text-zinc-500 mt-0.5">無料・オンライン可</p>
          </Link>
          <Link href="/dashboard/products" className="card p-4 text-center hover:border-zinc-700 transition-all active:scale-98">
            <ShoppingBag size={22} className="text-gold-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-zinc-200">全製品一覧</p>
            <p className="text-xs text-zinc-500 mt-0.5">4シリーズ展開</p>
          </Link>
        </div>

        {/* Rebook */}
        <div className="card p-5 border-gold-500/20 bg-gradient-to-r from-amber-950/30 to-zinc-900">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🎁</span>
            <span className="text-sm font-medium text-gold-400">リピーター特典</span>
          </div>
          <p className="text-zinc-300 text-sm mb-3">次回のご予約で <strong className="text-gold-400">20% OFF</strong></p>
          <a href="https://www.airbnb.com" target="_blank" rel="noopener noreferrer"
            className="btn-gold inline-flex items-center gap-2 text-sm py-2.5 px-5">
            再予約する <ExternalLink size={12} />
          </a>
        </div>
      </motion.div>
    </div>
  )
}
