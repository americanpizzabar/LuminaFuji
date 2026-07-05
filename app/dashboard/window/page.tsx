'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

const FACILITY_TZ = 'Asia/Tokyo'

// 呼吸リズム: 4秒でゆっくり明るく、6秒でゆっくり暗く（計10秒周期）
const BREATH_CYCLE_S = 10
const BREATH_PEAK_AT = 0.4 // 4s / 10s

function getYamanakakoTime(): string {
  return new Date().toLocaleTimeString('ja-JP', {
    timeZone: FACILITY_TZ,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

function getYamanakakoDate(): string {
  return new Date().toLocaleDateString('ja-JP', {
    timeZone: FACILITY_TZ,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })
}

type WakeLockSentinel = {
  released: boolean
  release: () => Promise<void>
}

export default function LuminaWindowPage() {
  const [ready, setReady] = useState(false)
  // SSR/プリレンダー時は空文字 → クライアント初回レンダーも空文字 → effect で充填（ハイドレーション安全）
  const [time, setTime] = useState('')
  const [date, setDate] = useState('')
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)

  const acquireWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen')
      }
    } catch {
      // Wake Lock 非対応・拒否時は画面が自然に暗くなるのを許容する
    }
  }

  // 灯している間のみ: タブが再表示されたら Wake Lock を取り直す
  // （ブラウザはページ非表示時にロックを自動解放するため）
  useEffect(() => {
    if (!ready) return
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') acquireWakeLock()
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [ready])

  useEffect(() => {
    setTime(getYamanakakoTime())
    setDate(getYamanakakoDate())
    const id = setInterval(() => {
      setTime(getYamanakakoTime())
      setDate(getYamanakakoDate())
    }, 1000)
    return () => clearInterval(id)
  }, [])

  const handleEnter = async () => {
    await acquireWakeLock()
    setReady(true)
  }

  const handleExit = async () => {
    if (wakeLockRef.current) {
      await wakeLockRef.current.release().catch(() => {})
      wakeLockRef.current = null
    }
    setReady(false)
  }

  return (
    <>
      {/* Entry screen */}
      <AnimatePresence>
        {!ready && (
          <motion.div
            className="page-container pb-28"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-8 pt-2">
              <Link href="/dashboard" className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <ArrowLeft size={16} className="text-zinc-400" />
              </Link>
              <div>
                <p className="text-[10px] text-zinc-500 tracking-[0.2em] uppercase">Lumina の窓</p>
                <h1 className="font-serif text-xl text-zinc-100">Lumina Window</h1>
              </div>
            </div>

            {/* Description card */}
            <motion.div
              className="rounded-3xl p-6 mb-6"
              style={{
                background: 'linear-gradient(135deg, rgba(255,130,50,0.08) 0%, rgba(8,6,4,0.6) 100%)',
                border: '1px solid rgba(255,130,50,0.18)',
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {/* Preview glow */}
              <motion.div
                className="w-20 h-20 rounded-2xl mx-auto mb-5 flex items-center justify-center"
                style={{
                  background: 'radial-gradient(circle, hsl(28,100%,60%) 0%, hsl(24,80%,30%) 50%, transparent 100%)',
                  boxShadow: '0 0 32px rgba(255,130,50,0.4)',
                }}
                animate={{ boxShadow: ['0 0 24px rgba(255,130,50,0.3)', '0 0 48px rgba(255,130,50,0.55)', '0 0 24px rgba(255,130,50,0.3)'] }}
                transition={{ duration: 3, repeat: Infinity }}
              />

              <h2 className="font-serif text-2xl text-zinc-50 text-center mb-3">
                記憶の光
              </h2>
              <p className="text-sm text-zinc-400 text-center leading-relaxed mb-2">
                あの山中湖のほとりで見た、有機ELの暖かな光。
              </p>
              <p className="text-sm text-zinc-400 text-center leading-relaxed">
                スマートフォンの画面が、今日もあなたの手のひらで灯ります。
              </p>
            </motion.div>

            <motion.div
              className="mb-4 rounded-2xl p-4"
              style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-xs text-zinc-500 mb-2">現在の山中湖</p>
              <p className="font-serif text-3xl text-zinc-200 tabular-nums">{time || '--:--:--'}</p>
              <p className="text-xs text-zinc-500 mt-1">{date || ' '}</p>
              <p className="text-[11px] text-zinc-600 mt-2">標高 982m · 山梨県南都留郡山中湖村</p>
            </motion.div>

            <motion.button
              onClick={handleEnter}
              className="w-full py-4 rounded-2xl font-semibold text-sm btn-ember"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileTap={{ scale: 0.97 }}
            >
              光を灯す
            </motion.button>

            <p className="text-[11px] text-zinc-600 text-center mt-3">
              画面をスリープしないよう維持します
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full-screen warm glow */}
      <AnimatePresence>
        {ready && (
          <motion.div
            className="fixed inset-0 z-[195] flex flex-col items-center justify-center select-none"
            style={{
              // 常時最大輝度の暖色グラデーション。呼吸は上のヴェールの不透明度で表現する
              // （gradient 自体は CSS transition でアニメーションできないため）
              background: 'radial-gradient(ellipse 100% 120% at 50% 60%, hsl(28,100%,72%) 0%, hsl(22,90%,34%) 45%, hsl(18,80%,9%) 100%)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            onClick={handleExit}
          >
            {/* Breathing veil — 4秒で明るく、6秒で暗く。opacity は GPU 合成で滑らか */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{ background: '#0a0402' }}
              animate={{ opacity: [0.34, 0.04, 0.34] }}
              transition={{
                duration: BREATH_CYCLE_S,
                times: [0, BREATH_PEAK_AT, 1],
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            {/* Inner bloom */}
            <motion.div
              className="absolute rounded-full pointer-events-none"
              style={{
                width: '55vw',
                height: '55vw',
                background: 'radial-gradient(circle, hsl(38,100%,80%) 0%, transparent 70%)',
                filter: 'blur(30px)',
              }}
              animate={{ scale: [0.95, 1.12, 0.95], opacity: [0.55, 1, 0.55] }}
              transition={{
                duration: BREATH_CYCLE_S,
                times: [0, BREATH_PEAK_AT, 1],
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            {/* Time display */}
            <div className="relative text-center">
              <motion.p
                className="font-serif tabular-nums"
                style={{
                  fontSize: '4rem',
                  lineHeight: 1,
                  color: 'hsl(18,65%,14%)',
                  textShadow: '0 0 40px hsl(28,100%,62%)',
                }}
                animate={{ opacity: [0.6, 0.9, 0.6] }}
                transition={{ duration: BREATH_CYCLE_S, times: [0, BREATH_PEAK_AT, 1], repeat: Infinity, ease: 'easeInOut' }}
              >
                {time || '--:--:--'}
              </motion.p>
              <p className="mt-3 text-sm" style={{ color: 'hsl(18,55%,16%)' }}>
                山中湖 · Yamanaka-ko
              </p>
              <p className="mt-1 text-xs" style={{ color: 'hsl(18,45%,19%)' }}>
                記憶の光
              </p>
            </div>

            {/* Tap to exit hint — fades out after 3 s */}
            <motion.p
              className="absolute bottom-10 text-xs"
              style={{ color: 'hsl(18,45%,19%)' }}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 0 }}
              transition={{ delay: 3, duration: 1.5 }}
            >
              タップで戻る
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
