'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, ArrowRight, Sparkles, AlertCircle, CheckCircle2, RotateCcw, ChevronLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
  getStore, updateStore, setGuestInfo as storeSetGuestInfo, setPhase as storeSetPhase,
  clearGuestInfo, resetStoreForGuest,
} from '@/lib/store'
import type { GuestInfo, BookingRecord } from '@/lib/store'
import { LANGS, LANG_ORDER, detectLang, saveLang, type LangKey } from '@/lib/i18n-login'

type Step = 'input' | 'otp'

function decodeInvite(raw: string): BookingRecord | null {
  try { return JSON.parse(decodeURIComponent(atob(raw))) as BookingRecord }
  catch { return null }
}

export default function LoginPage() {
  const [step, setStep] = useState<Step>('input')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [token, setToken] = useState('')
  const [maskedEmail, setMaskedEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(0)
  const [inviteEmail, setInviteEmail] = useState<string | null>(null)
  const [inviteBookingId, setInviteBookingId] = useState<string | null>(null)
  const [lang, setLang] = useState<LangKey>('ja')
  const otpRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const t = LANGS[lang]

  // ── 初期化 ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    setLang(detectLang())

    // 招待リンク処理
    const params = new URLSearchParams(window.location.search)
    const inviteParam = params.get('invite')
    if (inviteParam) {
      const booking = decodeInvite(inviteParam)
      if (booking?.id && booking?.email) {
        const store = getStore()
        if (!store.bookingHistory.some(b => b.id === booking.id)) {
          updateStore({ bookingHistory: [...store.bookingHistory, booking] })
        }
        setEmail(booking.email)
        setInviteEmail(booking.email.toLowerCase())
        setInviteBookingId(booking.id)
      }
    }

    // ログイン済みチェック (デモセッション・旧シードデータは自動クリア)
    const store = getStore()
    const info = store.guestInfo
    const isStaleSeed = info?.email === 'guest@example.com' && info?.name === 'Yamada Taro'
    if (info) {
      if (info.isDemo || isStaleSeed) { clearGuestInfo() }
      else { router.replace('/dashboard') }
    }
  }, [router])

  useEffect(() => {
    if (cooldown <= 0) return
    const id = setTimeout(() => setCooldown(c => c - 1), 1000)
    return () => clearTimeout(id)
  }, [cooldown])

  useEffect(() => {
    if (step === 'otp') setTimeout(() => otpRef.current?.focus(), 100)
  }, [step])

  const switchLang = (l: LangKey) => {
    setLang(l)
    saveLang(l)
    setError(null)
  }

  const sendOtp = async (emailValue: string): Promise<boolean> => {
    setLoading(true); setError(null)
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: emailValue }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? t.errorGeneric); return false }
      setToken(data.token); setMaskedEmail(data.maskedValue)
      return true
    } finally { setLoading(false) }
  }

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = email.trim().toLowerCase()
    if (!trimmed) return
    if (inviteEmail && inviteEmail !== trimmed) {
      setError(t.errorInviteMismatch); return
    }
    const ok = await sendOtp(trimmed)
    if (ok) { setOtp(''); setStep('otp'); setCooldown(60) }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedOtp = otp.trim()
    if (trimmedOtp.length !== 6) return
    setLoading(true); setError(null)
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, otp: trimmedOtp }),
      })
      const data = await res.json()
      if (!res.ok) {
        setOtp('')
        setError(res.status === 410 ? t.errorExpired : t.errorInvalidCode)
        return
      }
      const verifiedEmail: string = data.value
      const store = getStore()
      // 招待リンク経由の場合は予約ID優先で特定 (同一メールで複数予約があっても正しく識別)
      // 招待なしの場合はメールアドレスで検索
      const booking = inviteBookingId
        ? store.bookingHistory.find(b => b.id === inviteBookingId)
        : store.bookingHistory.find(b => b.email?.toLowerCase() === verifiedEmail.toLowerCase())
      if (!booking) {
        setError(t.errorNotFound); setStep('input'); return
      }
      const platformMap: Record<string, GuestInfo['platform']> = {
        airbnb: 'airbnb', 'booking.com': 'booking.com', direct: 'direct', other: 'other',
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
      // シードデータ・前セッションのデータをクリアして、このデバイスをこのゲスト専用状態にする
      resetStoreForGuest(guestInfo, booking)
      router.push('/dashboard')
    } finally { setLoading(false) }
  }

  const handleResend = async () => {
    if (cooldown > 0) return
    const ok = await sendOtp(email.trim().toLowerCase())
    if (ok) { setOtp(''); setError(null); setCooldown(60) }
  }

  const handleDemoEntry = (phase: 'booked' | 'staying' | 'post') => {
    const today = new Date()
    const fmt = (d: Date) => d.toISOString().split('T')[0]
    const ci = new Date(today); ci.setDate(today.getDate() - 1)
    const co = new Date(today); co.setDate(today.getDate() + 2)
    storeSetGuestInfo({
      name: 'Demo Guest', email: 'demo@luminafuji.com',
      nationality: 'Japan', flag: '🇯🇵',
      checkIn: fmt(ci), checkOut: fmt(co),
      reservationId: 'LF-DEMO-001', platform: 'direct',
      adults: 2, children: 0, isDemo: true,
    })
    storeSetPhase(phase)
    router.push('/dashboard')
  }

  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden"
         style={{ background: 'radial-gradient(140% 100% at 50% -10%, #0b0a16 0%, #070710 45%, #050507 100%)' }}>
      {/* Aurora background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[12%] left-[50%] -translate-x-1/2 w-[28rem] h-[28rem] rounded-full blur-3xl animate-orb-drift"
             style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[6%] right-[-10%] w-80 h-80 rounded-full blur-3xl"
             style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.14) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-8%] left-[-8%] w-72 h-72 rounded-full blur-3xl"
             style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.05) 0%, transparent 70%)' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            className="relative inline-flex items-center justify-center w-[68px] h-[68px] rounded-[20px] mb-5"
            style={{
              background: 'linear-gradient(145deg, rgba(139,92,246,0.22), rgba(34,211,238,0.12))',
              border: '1px solid rgba(139,92,246,0.3)',
              boxShadow: '0 0 26px rgba(139,92,246,0.35), 0 0 60px rgba(34,211,238,0.14), inset 0 1px 0 rgba(255,255,255,0.18)',
            }}
            animate={{
              boxShadow: [
                '0 0 26px rgba(139,92,246,0.35), 0 0 60px rgba(34,211,238,0.14), inset 0 1px 0 rgba(255,255,255,0.18)',
                '0 0 38px rgba(139,92,246,0.5), 0 0 80px rgba(34,211,238,0.22), inset 0 1px 0 rgba(255,255,255,0.22)',
                '0 0 26px rgba(139,92,246,0.35), 0 0 60px rgba(34,211,238,0.14), inset 0 1px 0 rgba(255,255,255,0.18)',
              ],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span className="text-2xl text-aurora-gradient">✦</span>
          </motion.div>
          <h1 className="font-serif text-2xl font-light text-zinc-50 tracking-wide">Lumina Fuji</h1>
          <p className="text-zinc-400 text-sm mt-1 tracking-[0.2em]">RESIDENCE YAMANAKAKO</p>
        </div>

        {/* Language switcher */}
        <div className="flex items-center justify-center gap-1 flex-wrap mb-6">
          {LANG_ORDER.map(l => (
            <button
              key={l}
              onClick={() => switchLang(l)}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] transition-all ${
                lang === l
                  ? 'text-violet-200 font-medium'
                  : 'text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800/60'
              }`}
              style={lang === l ? { background: 'rgba(139,92,246,0.18)', border: '1px solid rgba(139,92,246,0.28)' } : undefined}
            >
              <span>{LANGS[l].flag}</span>
              <span>{LANGS[l].label}</span>
            </button>
          ))}
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
                    {t.enterEmail}
                  </p>

                  <form onSubmit={handleSendCode}>
                    <input
                      type="email"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setError(null) }}
                      placeholder={t.emailPlaceholder}
                      autoComplete="email"
                      className={`w-full bg-zinc-800/80 border rounded-xl px-4 py-3.5 text-zinc-50 placeholder:text-zinc-500 text-sm focus:outline-none transition-all mb-3 ${
                        error
                          ? 'border-red-500/50'
                          : 'border-zinc-700 focus:border-violet-500/60'
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
                          <span className="whitespace-pre-line">{error}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <button
                      type="submit"
                      disabled={!email.trim() || loading}
                      className="w-full btn-aurora flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading
                        ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        : <><ArrowRight size={16} />{t.sendCode}</>
                      }
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
                    onClick={() => { setStep('input'); setOtp(''); setError(null) }}
                    className="flex items-center gap-1 text-zinc-300 hover:text-zinc-300 text-xs mb-4 transition-colors"
                  >
                    <ChevronLeft size={14} />{t.back}
                  </button>

                  <div className="text-center mb-5">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-full mb-3"
                         style={{ background: 'rgba(139,92,246,0.14)', border: '1px solid rgba(139,92,246,0.25)' }}>
                      <Mail size={18} className="text-violet-300" />
                    </div>
                    <p className="text-zinc-300 text-sm font-medium">{t.codeSent}</p>
                    <p className="text-zinc-300 text-xs mt-1">{maskedEmail}</p>
                    <p className="text-zinc-400 text-xs mt-1">{t.codeHint}</p>
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
                        setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
                        setError(null)
                      }}
                      placeholder={t.codePlaceholder}
                      className={`w-full bg-zinc-800/80 border rounded-xl px-4 py-3.5 text-zinc-50 placeholder:text-zinc-500 text-sm text-center tracking-[0.3em] focus:outline-none transition-all mb-3 ${
                        error
                          ? 'border-red-500/50'
                          : 'border-zinc-700 focus:border-violet-500/60'
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
                          <span className="whitespace-pre-line">{error}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <button
                      type="submit"
                      disabled={otp.length !== 6 || loading}
                      className="w-full btn-aurora flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading
                        ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        : <><CheckCircle2 size={16} />{t.verify}</>
                      }
                    </button>
                  </form>

                  <div className="mt-4 text-center">
                    <button
                      onClick={handleResend}
                      disabled={cooldown > 0 || loading}
                      className="inline-flex items-center gap-1.5 text-xs text-zinc-300 hover:text-zinc-300 disabled:text-zinc-400 disabled:cursor-not-allowed transition-colors"
                    >
                      <RotateCcw size={12} />
                      {cooldown > 0 ? t.resendIn(cooldown) : t.resend}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* デモモードパネル */}
          {isDemoMode && (
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={14} className="text-violet-300" />
                <span className="text-xs text-violet-300 font-medium tracking-wider uppercase">
                  {t.demoMode}
                </span>
              </div>
              <p className="text-zinc-300 text-xs mb-3">{t.demoSub}</p>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { key: 'booked',  label: t.demoBooked,  emoji: '📅' },
                  { key: 'staying', label: t.demoStaying, emoji: '🏠' },
                  { key: 'post',    label: t.demoPost,    emoji: '✨' },
                ] as const).map(({ key, label, emoji }) => (
                  <button
                    key={key}
                    onClick={() => handleDemoEntry(key)}
                    className="flex flex-col items-center gap-1 py-2.5 border border-zinc-700 hover:border-zinc-600 rounded-xl text-xs text-zinc-400 hover:text-zinc-300 transition-all active:scale-95"
                  >
                    <span className="text-lg">{emoji}</span>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        <p className="text-center text-zinc-400 text-xs mt-6">{t.poweredBy}</p>
      </motion.div>
    </div>
  )
}
