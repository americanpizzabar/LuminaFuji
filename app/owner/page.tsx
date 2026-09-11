'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Shield, Eye, EyeOff } from 'lucide-react'

const OWNER_PIN = process.env.NEXT_PUBLIC_OWNER_PIN ?? '1234'

export default function OwnerLoginPage() {
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)
  const [show, setShow] = useState(false)
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // 設定ページで変更されたPIN（localStorage）を優先し、無ければ環境変数/デフォルト
    const effectivePin = localStorage.getItem('NEXT_PUBLIC_OWNER_PIN') ?? OWNER_PIN
    if (pin === effectivePin) {
      localStorage.setItem('lf_owner_auth', 'true')
      router.push('/owner/dashboard')
    } else {
      setError(true)
      setPin('')
      setTimeout(() => setError(false), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 mb-5">
            <Shield size={28} className="text-blue-400" />
          </div>
          <h1 className="font-serif text-2xl text-zinc-100">管理者ログイン</h1>
          <p className="text-zinc-300 text-sm mt-1">Owner / Manager Access</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-zinc-300 mb-1.5 block">PINコード</label>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="••••"
                  maxLength={8}
                  className={`w-full bg-zinc-800 border rounded-xl px-4 py-3 text-zinc-100 text-center text-xl tracking-widest placeholder:text-zinc-500 focus:outline-none transition-all pr-12 ${
                    error
                      ? 'border-red-500/60 animate-pulse'
                      : 'border-zinc-700 focus:border-blue-500/50'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-400"
                >
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {error && (
                <p className="text-xs text-red-400 mt-1.5 text-center">
                  PINコードが正しくありません
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={pin.length < 4}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl px-6 py-3 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ログイン
            </button>
          </form>
        </div>

        <div className="mt-4 bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 text-center">
          <p className="text-xs text-zinc-400">
            デモ用PINコード: <span className="text-zinc-400 font-mono">1234</span>
          </p>
          <p className="text-xs text-zinc-400 mt-0.5">
            本番では <code className="text-zinc-400">NEXT_PUBLIC_OWNER_PIN</code> 環境変数で変更
          </p>
        </div>

        <div className="mt-6 text-center">
          <a href="/dashboard" className="text-xs text-zinc-400 hover:text-zinc-400 transition-colors">
            ← ゲスト画面に戻る
          </a>
        </div>
      </motion.div>
    </div>
  )
}
