'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Wrench, Eye, EyeOff } from 'lucide-react'

const MANAGER_PIN = process.env.NEXT_PUBLIC_MANAGER_PIN ?? '5678'

export default function ManagerLoginPage() {
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)
  const [show, setShow] = useState(false)
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (pin === MANAGER_PIN) {
      localStorage.setItem('lf_manager_auth', 'true')
      router.push('/manager/dashboard')
    } else {
      setError(true)
      setPin('')
      setTimeout(() => setError(false), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl" />
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-sm relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/20 mb-5">
            <Wrench size={28} className="text-teal-400" />
          </div>
          <h1 className="font-serif text-2xl text-zinc-100">管理会社ログイン</h1>
          <p className="text-zinc-500 text-sm mt-1">Property Manager Access</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-zinc-500 mb-1.5 block">管理者PINコード</label>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  value={pin}
                  onChange={e => setPin(e.target.value)}
                  placeholder="••••"
                  maxLength={8}
                  className={`w-full bg-zinc-800 border rounded-xl px-4 py-3 text-zinc-100 text-center text-xl tracking-widest placeholder:text-zinc-700 focus:outline-none transition-all pr-12 ${error ? 'border-red-500/60' : 'border-zinc-700 focus:border-teal-500/50'}`}
                />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400">
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {error && <p className="text-xs text-red-400 mt-1.5 text-center">PINコードが正しくありません</p>}
            </div>
            <button type="submit" disabled={pin.length < 4}
              className="w-full bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-xl px-6 py-3 transition-all active:scale-95 disabled:opacity-40">
              ログイン
            </button>
          </form>
        </div>

        <div className="mt-4 bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 text-center">
          <p className="text-xs text-zinc-600">デモ用PINコード: <span className="text-zinc-400 font-mono">5678</span></p>
          <p className="text-xs text-zinc-700 mt-0.5">本番では <code className="text-zinc-600">NEXT_PUBLIC_MANAGER_PIN</code> で変更</p>
        </div>

        <div className="mt-6 text-center space-y-2">
          <a href="/owner" className="block text-xs text-zinc-600 hover:text-zinc-400 transition-colors">オーナーログイン →</a>
          <a href="/dashboard" className="block text-xs text-zinc-600 hover:text-zinc-400 transition-colors">ゲスト画面 →</a>
        </div>
      </motion.div>
    </div>
  )
}
