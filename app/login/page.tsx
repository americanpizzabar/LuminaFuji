'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, MessageSquare, ArrowRight, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
  getStore, setGuestInfo as storeSetGuestInfo, setPhase as storeSetPhase
} from '@/lib/store'
import type { GuestInfo } from '@/lib/store'

export default function LoginPage() {
  const [method, setMethod] = useState<'email' | 'sms'>('email')
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const router = useRouter()

  // Already logged in → go straight to dashboard
  useEffect(() => {
    if (getStore().guestInfo) {
      router.replace('/dashboard')
    }
  }, [router])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!value.trim()) return
    setLoading(true)
    setError(false)

    // Brief UX delay to feel responsive
    await new Promise(r => setTimeout(r, 700))

    const store = getStore()
    const booking = store.bookingHistory.find(b => {
      if (method === 'email') {
        return b.email?.toLowerCase() === value.trim().toLowerCase()
      } else {
        // phone lookup — normalize by stripping spaces/dashes
        const normalize = (s: string) => s.replace(/[\s\-()]/g, '')
        const phone = (b as typeof b & { phone?: string }).phone ?? ''
        return normalize(phone) === normalize(value.trim())
      }
    })

    if (booking) {
      const platformMap: Record<string, GuestInfo['platform']> = {
        'airbnb': 'airbnb',
        'booking.com': 'booking.com',
        'direct': 'direct',
        'other': 'other',
      }
      const guestInfo: GuestInfo = {
        name: booking.guestName,
        email: booking.email ?? '',
        phone: (booking as typeof booking & { phone?: string }).phone,
        nationality: booking.nationality ?? '',
        flag: booking.flag ?? '🇯🇵',
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        reservationId: booking.id,
        platform: platformMap[booking.platform?.toLowerCase()] ?? 'direct',
        adults: booking.adults,
        children: booking.children,
        specialRequests: (booking as typeof booking & { specialRequests?: string }).specialRequests,
      }
      storeSetGuestInfo(guestInfo)
      router.push('/dashboard')
    } else {
      setError(true)
      setLoading(false)
    }
  }

  const handleDemoEntry = (phase: 'booked' | 'staying' | 'post') => {
    const guestInfo: GuestInfo = {
      name: 'デモゲスト',
      email: 'demo@luminafuji.com',
      nationality: '日本',
      flag: '🇯🇵',
      checkIn: '2026-05-23',
      checkOut: '2026-05-25',
      reservationId: 'LF-DEMO-001',
      platform: 'direct',
      adults: 2,
      children: 0,
    }
    storeSetGuestInfo(guestInfo)
    storeSetPhase(phase)
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-600/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-700/10 border border-amber-500/20 mb-5 glow-gold">
            <span className="text-2xl">✦</span>
          </div>
          <h1 className="font-serif text-2xl font-light text-zinc-100 tracking-wide">
            Lumina Fuji
          </h1>
          <p className="text-zinc-500 text-sm mt-1 tracking-wider">
            RESIDENCE YAMANAKAKO
          </p>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <div className="card p-6 mb-4">
            <p className="text-zinc-400 text-sm text-center mb-5 leading-relaxed">
              ご予約時のメールアドレスまたは<br />
              電話番号を入力してください
            </p>

            {/* Method Toggle */}
            <div className="flex gap-2 mb-5">
              <button
                onClick={() => { setMethod('email'); setError(false) }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  method === 'email'
                    ? 'bg-gold-500/10 border border-gold-500/30 text-gold-400'
                    : 'border border-zinc-700 text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Mail size={15} />
                メール
              </button>
              <button
                onClick={() => { setMethod('sms'); setError(false) }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  method === 'sms'
                    ? 'bg-gold-500/10 border border-gold-500/30 text-gold-400'
                    : 'border border-zinc-700 text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <MessageSquare size={15} />
                SMS
              </button>
            </div>

            <form onSubmit={handleSend}>
              <input
                type={method === 'email' ? 'email' : 'tel'}
                value={value}
                onChange={e => { setValue(e.target.value); setError(false) }}
                placeholder={method === 'email' ? 'your@email.com' : '+81 90-XXXX-XXXX'}
                className={`w-full bg-zinc-800/80 border rounded-xl px-4 py-3.5 text-zinc-100 placeholder:text-zinc-600 text-sm focus:outline-none focus:ring-1 transition-all mb-3 ${
                  error
                    ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20'
                    : 'border-zinc-700 focus:border-gold-500/50 focus:ring-gold-500/20'
                }`}
              />

              {/* Error message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-start gap-2 text-red-400 text-xs mb-3 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5"
                  >
                    <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />
                    <span>
                      ご予約情報が見つかりませんでした。<br />
                      ご予約時の{method === 'email' ? 'メールアドレス' : '電話番号'}をご確認ください。
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={!value.trim() || loading}
                className="w-full btn-gold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    予約を確認してログイン
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Demo mode */}
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={14} className="text-gold-500" />
              <span className="text-xs text-gold-500 font-medium tracking-wider uppercase">
                デモモード
              </span>
            </div>
            <p className="text-zinc-500 text-xs mb-3">
              体験フェーズを選んでアプリを試す
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'booked', label: '予約済', emoji: '📅' },
                { key: 'staying', label: '滞在中', emoji: '🏠' },
                { key: 'post', label: '滞在後', emoji: '✨' },
              ].map(({ key, label, emoji }) => (
                <button
                  key={key}
                  onClick={() => handleDemoEntry(key as 'booked' | 'staying' | 'post')}
                  className="flex flex-col items-center gap-1 py-2.5 border border-zinc-700 hover:border-zinc-600 rounded-xl text-xs text-zinc-400 hover:text-zinc-300 transition-all active:scale-95"
                >
                  <span className="text-lg">{emoji}</span>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        <p className="text-center text-zinc-700 text-xs mt-6">
          Powered by ECUANEST × Lumina Fuji
        </p>
      </motion.div>
    </div>
  )
}
