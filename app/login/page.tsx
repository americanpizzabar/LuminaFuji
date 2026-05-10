'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, MessageSquare, ArrowRight, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [method, setMethod] = useState<'email' | 'sms'>('email')
  const [value, setValue] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!value) return
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1200))
    setSent(true)
    setLoading(false)
  }

  const handleDemoEntry = (phase: 'booked' | 'staying' | 'post') => {
    const guest = {
      name: 'デモゲスト',
      email: 'demo@luminafuji.com',
      checkIn: '2026-05-10',
      checkOut: '2026-05-12',
      reservationId: 'LF-DEMO-001',
    }
    localStorage.setItem('lf_guest', JSON.stringify(guest))
    localStorage.setItem('lf_logged_in', 'true')
    localStorage.setItem('lf_phase', phase)
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

        {!sent ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="card p-6 mb-4">
              <p className="text-zinc-400 text-sm text-center mb-5 leading-relaxed">
                ご予約時のメールアドレスまたは<br />
                電話番号を入力してください
              </p>

              {/* Method Toggle */}
              <div className="flex gap-2 mb-5">
                <button
                  onClick={() => setMethod('email')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    method === 'email'
                      ? 'bg-gold-500/10 border border-gold-500/30 text-gold-400'
                      : 'border border-zinc-700 text-zinc-500'
                  }`}
                >
                  <Mail size={15} />
                  メール
                </button>
                <button
                  onClick={() => setMethod('sms')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    method === 'sms'
                      ? 'bg-gold-500/10 border border-gold-500/30 text-gold-400'
                      : 'border border-zinc-700 text-zinc-500'
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
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={method === 'email' ? 'your@email.com' : '+81 90-XXXX-XXXX'}
                  className="w-full bg-zinc-800/80 border border-zinc-700 rounded-xl px-4 py-3.5 text-zinc-100 placeholder:text-zinc-600 text-sm focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20 transition-all mb-4"
                />
                <button
                  type="submit"
                  disabled={!value || loading}
                  className="w-full btn-gold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin" />
                  ) : (
                    <>
                      マジックリンクを送信
                      <ArrowRight size={16} />
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
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card p-8 text-center"
          >
            <div className="text-4xl mb-4">📬</div>
            <h2 className="text-lg font-medium text-zinc-100 mb-2">
              送信しました
            </h2>
            <p className="text-zinc-500 text-sm leading-relaxed mb-5">
              {method === 'email' ? `${value}` : `${value}`}
              <br />
              にログインリンクをお送りしました。<br />
              リンクをタップしてアクセスしてください。
            </p>
            <p className="text-zinc-600 text-xs">
              メールが届かない場合は迷惑メールフォルダをご確認ください
            </p>
          </motion.div>
        )}

        <p className="text-center text-zinc-700 text-xs mt-6">
          Powered by ECUANEST × Lumina Fuji
        </p>
      </motion.div>
    </div>
  )
}
