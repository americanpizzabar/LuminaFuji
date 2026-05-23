'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, ArrowRight, Sparkles, AlertCircle, CheckCircle2, RotateCcw, ChevronLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
  getStore, setGuestInfo as storeSetGuestInfo, setPhase as storeSetPhase
} from '@/lib/store'
import type { GuestInfo } from '@/lib/store'

type Step = 'input' | 'otp'

export default function LoginPage() {
  const [step, setStep] = useState<Step>('input')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [token, setToken] = useState('')
  const [maskedEmail, setMaskedEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(0)
  const otpRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (getStore().guestInfo) {
      router.replace('/dashboard')
    }
  }, [router])

  // Cooldown countdown
  useEffect(() => {
    if (cooldown <= 0) return
    const id = setTimeout(() => setCooldown(c => c - 1), 1000)
    return () => clearTimeout(id)
  }, [cooldown])

  // Focus OTP input when step changes
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => otpRef.current?.focus(), 100)
    }
  }, [step])

  const sendOtp = async (emailValue: string): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: emailValue }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'エラーが発生しました')
        return false
      }
      setToken(data.token)
      setMaskedEmail(data.maskedValue)
      return true
    } finally {
      setLoading(false)
    }
  }

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = email.trim().toLowerCase()
    if (!trimmed) return

    // Client-side booking check before calling API
    const store = getStore()
    const booking = store.bookingHistory.find(
      b => b.email?.toLowerCase() === trimmed
    )
    if (!booking) {
      setError('ご予約情報が見つかりませんでした。ご予約時のメールアドレスをご確認ください。')
      return
    }

    const ok = await sendOtp(trimmed)
    if (ok) {
      setOtp('')
      setStep('otp')
      setCooldown(60)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedOtp = otp.trim()
    if (trimmedOtp.length !== 6) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, otp: trimmedOtp }),
      })
      const data = await res.json()
      if (!res.ok) {
        setOtp('')
        if (res.status === 410) {
          setError('コードの有効期限が切れています。再送してください。')
        } else {
          setError('コードが正しくありません。もう一度入力してください。')
        }
        return
      }
      // Build guestInfo from booking
      const verifiedEmail: string = data.value
      const store = getStore()
      const booking = store.bookingHistory.find(
        b => b.email?.toLowerCase() === verifiedEmail.toLowerCase()
      )
      if (!booking) {
        setError('予約情報の取得に失敗しました。')
        return
      }
      const platformMap: Record<string, GuestInfo['platform']> = {
        airbnb: 'airbnb',
        'booking.com': 'booking.com',
        direct: 'direct',
        other: 'other',
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
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (cooldown > 0) return
    const ok = await sendOtp(email.trim().toLowerCase())
    if (ok) {
      setOtp('')
      setError(null)
      setCooldown(60)
    }
  }

  const handleBack = () => {
    setStep('input')
    setOtp('')
    setError(null)
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
          <AnimatePresence mode="wait">
            {step === 'input' ? (
              <motion.div
                key="input"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
              >
                <div className="card p-6 mb-4">
                  <p className="text-zinc-400 text-sm text-center mb-5 leading-relaxed">
                    ご予約時のメールアドレスを入力してください
                  </p>

                  <form onSubmit={handleSendCode}>
                    <input
                      type="email"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setError(null) }}
                      placeholder="your@email.com"
                      autoComplete="email"
                      className={`w-full bg-zinc-800/80 border rounded-xl px-4 py-3.5 text-zinc-100 placeholder:text-zinc-600 text-sm focus:outline-none focus:ring-1 transition-all mb-3 ${
                        error
                          ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20'
                          : 'border-zinc-700 focus:border-gold-500/50 focus:ring-gold-500/20'
                      }`}
                    />

                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="flex items-start gap-2 text-red-400 text-xs mb-3 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5"
                        >
                          <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />
                          <span>{error}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <button
                      type="submit"
                      disabled={!email.trim() || loading}
                      className="w-full btn-gold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin" />
                      ) : (
                        <>
                          <ArrowRight size={16} />
                          認証コードを送信
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <div className="card p-6 mb-4">
                  <button
                    onClick={handleBack}
                    className="flex items-center gap-1 text-zinc-500 hover:text-zinc-300 text-xs mb-4 transition-colors"
                  >
                    <ChevronLeft size={14} />
                    戻る
                  </button>

                  <div className="text-center mb-5">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gold-500/10 border border-gold-500/20 mb-3">
                      <Mail size={18} className="text-gold-400" />
                    </div>
                    <p className="text-zinc-300 text-sm font-medium">コードを送信しました</p>
                    <p className="text-zinc-500 text-xs mt-1">{maskedEmail}</p>
                  </div>

                  <form onSubmit={handleVerify}>
                    <input
                      ref={otpRef}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={otp}
                      onChange={e => {
                        const v = e.target.value.replace(/\D/g, '').slice(0, 6)
                        setOtp(v)
                        setError(null)
                      }}
                      placeholder="6桁のコード"
                      className={`w-full bg-zinc-800/80 border rounded-xl px-4 py-3.5 text-zinc-100 placeholder:text-zinc-600 text-sm text-center tracking-[0.3em] focus:outline-none focus:ring-1 transition-all mb-3 ${
                        error
                          ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20'
                          : 'border-zinc-700 focus:border-gold-500/50 focus:ring-gold-500/20'
                      }`}
                    />

                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="flex items-start gap-2 text-red-400 text-xs mb-3 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5"
                        >
                          <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />
                          <span>{error}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <button
                      type="submit"
                      disabled={otp.length !== 6 || loading}
                      className="w-full btn-gold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 size={16} />
                          認証してログイン
                        </>
                      )}
                    </button>
                  </form>

                  <div className="mt-4 text-center">
                    <button
                      onClick={handleResend}
                      disabled={cooldown > 0 || loading}
                      className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 disabled:text-zinc-700 disabled:cursor-not-allowed transition-colors"
                    >
                      <RotateCcw size={12} />
                      {cooldown > 0 ? `再送まで ${cooldown}秒` : 'コードを再送する'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

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
