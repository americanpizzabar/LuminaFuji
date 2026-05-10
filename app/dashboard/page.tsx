'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePhase } from '@/lib/phase'
import {
  Lightbulb, BookOpen, Map, MessageCircle, ShoppingBag,
  Image, Star, CalendarCheck, Clock, ExternalLink,
  Sparkles, Building2
} from 'lucide-react'
import { getFeaturedProducts } from '@/lib/products'

export default function DashboardPage() {
  const { phase, guestInfo } = usePhase()

  if (phase === 'booked') return <BookedHome guestInfo={guestInfo} />
  if (phase === 'staying') return <StayingHome guestInfo={guestInfo} />
  return <PostHome guestInfo={guestInfo} />
}

function BookedHome({ guestInfo }: { guestInfo: any }) {
  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        {/* Header */}
        <div className="mb-8 pt-2">
          <p className="section-title">Lumina Fuji Residence</p>
          <h1 className="font-serif text-2xl text-zinc-100 leading-snug">
            ご予約ありがとうございます
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Welcome, {guestInfo?.name}
          </p>
        </div>

        {/* Reservation Card */}
        <div className="card p-5 mb-4 border-gold-500/20 bg-gradient-to-br from-amber-950/30 to-zinc-900">
          <div className="flex items-center gap-2 mb-4">
            <CalendarCheck size={16} className="text-gold-400" />
            <span className="text-sm font-medium text-gold-400">予約詳細</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-zinc-500 mb-1">チェックイン</p>
              <p className="text-zinc-200 font-medium">{guestInfo?.checkIn}</p>
              <p className="text-xs text-zinc-500">16:00〜</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-1">チェックアウト</p>
              <p className="text-zinc-200 font-medium">{guestInfo?.checkOut}</p>
              <p className="text-xs text-zinc-500">〜11:00</p>
            </div>
          </div>
          <div className="border-t border-zinc-800 mt-4 pt-3">
            <p className="text-xs text-zinc-500">予約ID: {guestInfo?.reservationId}</p>
          </div>
        </div>

        {/* Access Info */}
        <div className="card p-5 mb-4">
          <h3 className="text-sm font-medium text-zinc-300 mb-3 flex items-center gap-2">
            <Map size={14} className="text-gold-400" />
            アクセス情報
          </h3>
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between items-start">
              <span className="text-zinc-500">住所</span>
              <span className="text-zinc-300 text-right text-xs">山梨県南都留郡山中湖村</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">新宿から</span>
              <span className="text-zinc-300">高速バス 約2時間</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">河口湖駅から</span>
              <span className="text-zinc-300">タクシー 約20分</span>
            </div>
          </div>
          <Link
            href="/dashboard/map"
            className="mt-3 flex items-center gap-2 text-xs text-gold-400 hover:text-gold-300"
          >
            詳細マップを見る <ExternalLink size={11} />
          </Link>
        </div>

        {/* ECUANEST Preview */}
        <div className="card p-5 mb-4 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-900/20 to-transparent pointer-events-none" />
          <div className="relative">
            <p className="section-title">ECUANEST ショールーム</p>
            <p className="text-zinc-300 text-sm leading-relaxed mb-4">
              このレジデンスは、有機EL照明のリビングショールームです。
              滞在中に最先端の光を体験してください。
            </p>
            <Link href="/dashboard/products" className="btn-outline text-sm py-2 px-4 inline-flex items-center gap-2">
              製品を見る <Sparkles size={13} className="text-gold-500" />
            </Link>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { href: '/dashboard/guide', label: '施設ガイド', icon: BookOpen },
            { href: '/dashboard/map', label: '周辺マップ', icon: Map },
            { href: '/dashboard/chat', label: 'コンシェルジュ', icon: MessageCircle },
            { href: '/dashboard/products', label: '照明製品', icon: Lightbulb },
          ].map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="card p-4 flex items-center gap-3 hover:border-zinc-700 transition-all active:scale-98"
            >
              <div className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center">
                <Icon size={16} className="text-gold-400" />
              </div>
              <span className="text-sm text-zinc-300">{label}</span>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

function StayingHome({ guestInfo }: { guestInfo: any }) {
  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        {/* Header */}
        <div className="mb-6 pt-2">
          <p className="section-title">滞在中 · Staying</p>
          <h1 className="font-serif text-2xl text-zinc-100 leading-snug">
            おかえりなさい
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Welcome back, {guestInfo?.name?.split(' ')[0]}
          </p>
        </div>

        {/* Lighting Control Hero */}
        <Link href="/dashboard/lighting">
          <motion.div
            className="card p-5 mb-4 cursor-pointer overflow-hidden relative group"
            style={{
              background: 'linear-gradient(135deg, rgba(251,191,36,0.08) 0%, rgba(24,24,27,1) 60%)'
            }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <div className="absolute top-3 right-3 w-20 h-20 bg-amber-400/5 rounded-full blur-2xl group-hover:bg-amber-400/10 transition-all" />
            <div className="relative">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-gold-400 rounded-full animate-pulse" />
                    <span className="text-xs text-gold-400 font-medium">ECUANEST Brite 3</span>
                  </div>
                  <h2 className="text-xl font-medium text-zinc-100">照明コントロール</h2>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center">
                  <Lightbulb size={22} className="text-gold-400" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 rounded-full bg-zinc-800 overflow-hidden">
                  <div className="h-full w-[70%] bg-gradient-to-r from-amber-700 to-gold-400 rounded-full" />
                </div>
                <span className="text-sm text-zinc-400">くつろぎ · 70%</span>
              </div>
              <p className="text-xs text-zinc-500 mt-2">タップして照明を操作 →</p>
            </div>
          </motion.div>
        </Link>

        {/* Checkout Timer */}
        <div className="card p-4 mb-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center flex-shrink-0">
            <Clock size={18} className="text-zinc-400" />
          </div>
          <div>
            <p className="text-xs text-zinc-500">チェックアウト</p>
            <p className="text-zinc-200 font-medium">{guestInfo?.checkOut} 11:00</p>
          </div>
        </div>

        {/* Quick Actions */}
        <p className="section-title mb-3">クイックアクション</p>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { href: '/dashboard/guide', label: '施設ガイド', sublabel: 'Facility Guide', icon: BookOpen, emoji: '📋' },
            { href: '/dashboard/chat', label: 'コンシェルジュ', sublabel: 'Concierge Chat', icon: MessageCircle, emoji: '💬' },
            { href: '/dashboard/map', label: '周辺マップ', sublabel: 'Local Area', icon: Map, emoji: '🗺️' },
            { href: '/dashboard/guestbook', label: '寄せ書き', sublabel: 'Guestbook', icon: Image, emoji: '📸' },
          ].map(({ href, label, sublabel, emoji }) => (
            <Link
              key={href}
              href={href}
              className="card p-4 flex flex-col gap-2 hover:border-zinc-700 transition-all active:scale-98"
            >
              <span className="text-2xl">{emoji}</span>
              <div>
                <p className="text-sm font-medium text-zinc-200">{label}</p>
                <p className="text-xs text-zinc-600">{sublabel}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* ECUANEST Spotlight */}
        <div className="card p-5 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-900/15 to-transparent pointer-events-none" />
          <div className="relative">
            <p className="section-title">ショールーム</p>
            <p className="text-zinc-300 text-sm leading-relaxed mb-3">
              この部屋の照明は全て ECUANEST の有機EL製品です。
              気になった製品は後でまとめてご案内します。
            </p>
            <div className="flex gap-2">
              <Link href="/dashboard/products" className="flex-1 btn-gold text-sm py-2.5 text-center">
                製品を見る
              </Link>
              <Link href="/dashboard/consult" className="flex-1 btn-outline text-sm py-2.5 text-center">
                相談する
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function PostHome({ guestInfo }: { guestInfo: any }) {
  const featured = getFeaturedProducts()

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        {/* Header */}
        <div className="mb-8 pt-2">
          <p className="section-title">滞在後 · Post Stay</p>
          <h1 className="font-serif text-2xl text-zinc-100 leading-snug">
            ご宿泊ありがとうございました
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Thank you, {guestInfo?.name?.split(' ')[0]}
          </p>
        </div>

        {/* Personalized Lighting Recommendation */}
        <div className="card p-5 mb-4 overflow-hidden relative border-gold-500/20">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-950/40 to-zinc-900 pointer-events-none" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <Star size={14} className="text-gold-400 fill-gold-400" />
              <span className="text-xs text-gold-400 font-medium tracking-wide">あなたへのご提案</span>
            </div>
            <h2 className="text-lg font-serif text-zinc-100 mb-2">
              お気に入りの光を<br />ご自宅にも
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed mb-4">
              滞在中、<strong className="text-gold-400">「くつろぎ」シーン</strong>を最もよくご利用いただきました。
              この温かみのある光は Brite 3 で再現できます。
            </p>
            <Link href="/dashboard/products/brite-3" className="btn-gold inline-flex items-center gap-2 text-sm py-2.5 px-5">
              Brite 3 を見る <Sparkles size={13} />
            </Link>
          </div>
        </div>

        {/* Gallery */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="section-title mb-0">光の記憶</p>
            <Link href="/dashboard/guestbook" className="text-xs text-zinc-500 hover:text-gold-400">
              すべて見る →
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { emoji: '🌅', label: '夜明け' },
              { emoji: '🏔️', label: '富士山' },
              { emoji: '💡', label: '照明' },
              { emoji: '🌙', label: '夜景' },
              { emoji: '🫧', label: '温泉' },
              { emoji: '🍵', label: '朝食' },
            ].map(({ emoji, label }, i) => (
              <div
                key={i}
                className="aspect-square rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col items-center justify-center gap-1"
              >
                <span className="text-3xl">{emoji}</span>
                <span className="text-xs text-zinc-600">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Products */}
        <div className="mb-6">
          <p className="section-title">ECUANEST 製品</p>
          <div className="space-y-3">
            {featured.map((product) => (
              <Link key={product.id} href={`/dashboard/products/${product.id}`}>
                <div className="card p-4 flex items-center gap-4 hover:border-zinc-700 transition-all active:scale-98">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `radial-gradient(circle at center, ${product.accentColor}20, ${product.accentColor}05)`, border: `1px solid ${product.accentColor}30` }}
                  >
                    <Lightbulb size={22} style={{ color: product.accentColor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-zinc-100 font-medium">{product.name}</p>
                    <p className="text-xs text-zinc-500 truncate">{product.tagline}</p>
                    <p className="text-xs text-gold-400 mt-0.5">{product.price}</p>
                  </div>
                  <ExternalLink size={14} className="text-zinc-600 flex-shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* CTA Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Link href="/dashboard/consult" className="card p-4 text-center hover:border-zinc-700 transition-all active:scale-98">
            <Building2 size={22} className="text-gold-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-zinc-200">照明コンサル</p>
            <p className="text-xs text-zinc-500 mt-0.5">無料相談受付中</p>
          </Link>
          <Link href="/dashboard/products" className="card p-4 text-center hover:border-zinc-700 transition-all active:scale-98">
            <ShoppingBag size={22} className="text-gold-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-zinc-200">製品一覧</p>
            <p className="text-xs text-zinc-500 mt-0.5">全ラインナップ</p>
          </Link>
        </div>

        {/* Rebook Banner */}
        <div className="card p-5 border-gold-500/20 bg-gradient-to-r from-amber-950/30 to-zinc-900">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🎁</span>
            <span className="text-sm font-medium text-gold-400">リピーター特典</span>
          </div>
          <p className="text-zinc-300 text-sm mb-3">
            次回のご予約で <strong className="text-gold-400">20% OFF</strong>
          </p>
          <a
            href="https://www.airbnb.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold inline-flex items-center gap-2 text-sm py-2.5 px-5"
          >
            再予約する <ExternalLink size={12} />
          </a>
        </div>
      </motion.div>
    </div>
  )
}
