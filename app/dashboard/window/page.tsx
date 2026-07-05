'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useLanguage } from '@/lib/useLanguage'
import { useWakeLock } from '@/lib/useWakeLock'
import { hapticTap } from '@/lib/haptics'

const FACILITY_TZ = 'Asia/Tokyo'

// 呼吸リズム: 4秒でゆっくり明るく、6秒でゆっくり暗く（計10秒周期）
const BREATH_CYCLE_S = 10
const BREATH_PEAK_AT = 0.4 // 4s / 10s
// 操作UIの自動非表示までの時間
const CONTROLS_HIDE_MS = 3500

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

export default function LuminaWindowPage() {
  const { t } = useLanguage()
  const [ready, setReady] = useState(false)
  const [time, setTime] = useState('')
  const [date, setDate] = useState('')
  // ランプとしての誤消灯を防ぐ: タップは操作UIの表示/非表示、消灯は明示ボタンのみ
  const [controlsVisible, setControlsVisible] = useState(false)
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 灯している間だけ画面を維持（アンマウント時も自動で解放される）
  useWakeLock(ready)

  useEffect(() => {
    setTime(getYamanakakoTime())
    setDate(getYamanakakoDate())
    const id = setInterval(() => {
      setTime(getYamanakakoTime())
      setDate(getYamanakakoDate())
    }, 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    return () => { if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current) }
  }, [])

  const showControls = () => {
    setControlsVisible(true)
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current)
    controlsTimerRef.current = setTimeout(() => setControlsVisible(false), CONTROLS_HIDE_MS)
  }

  const handleEnter = () => {
    hapticTap()
    setReady(true)
    showControls() // 点灯直後は操作方法を一瞬見せてからフェードアウト
  }

  const handleExit = () => {
    hapticTap()
    setReady(false)
    setControlsVisible(false)
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
                <p className="text-[10px] text-zinc-500 tracking-[0.2em] uppercase">{t('luminaWindow.label')}</p>
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
                {t('luminaWindow.memory')}
              </h2>
              <p className="text-sm text-zinc-400 text-center leading-relaxed mb-2">
                {t('luminaWindow.desc1')}
              </p>
              <p className="text-sm text-zinc-400 text-center leading-relaxed">
                {t('luminaWindow.desc2')}
              </p>
            </motion.div>

            <motion.div
              className="mb-4 rounded-2xl p-4"
              style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-xs text-zinc-500 mb-2">{t('luminaWindow.now')}</p>
              <p className="font-serif text-3xl text-zinc-200 tabular-nums">{time || '--:--:--'}</p>
              <p className="text-xs text-zinc-500 mt-1">{date || ' '}</p>
              <p className="text-[11px] text-zinc-600 mt-2">{t('luminaWindow.place')}</p>
            </motion.div>

            <motion.button
              onClick={handleEnter}
              className="w-full py-4 rounded-2xl font-semibold text-sm btn-ember"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileTap={{ scale: 0.97 }}
            >
              {t('luminaWindow.ignite')}
            </motion.button>

            <p className="text-[11px] text-zinc-600 text-center mt-3">
              {t('luminaWindow.keepAwake')}
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
            onClick={showControls}
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
            <div className="relative text-center pointer-events-none">
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
                {t('luminaWindow.memory')}
              </p>
            </div>

            {/* Controls — タップで表示、3.5秒で自動非表示。消灯は明示ボタンのみ */}
            <AnimatePresence>
              {controlsVisible && (
                <motion.div
                  className="absolute bottom-10 left-0 right-0 flex justify-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.35 }}
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); handleExit() }}
                    className="py-2.5 px-7 rounded-2xl text-xs font-semibold"
                    style={{
                      background: 'rgba(10,4,2,0.35)',
                      border: '1px solid rgba(60,25,8,0.45)',
                      color: 'hsl(20,70%,22%)',
                      backdropFilter: 'blur(8px)',
                    }}
                  >
                    {t('luminaWindow.close')}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 初回だけの操作ヒント（コントロール非表示時に極薄で滞留） */}
            {!controlsVisible && (
              <p className="absolute bottom-10 text-[11px] pointer-events-none"
                 style={{ color: 'hsl(18,45%,22%)', opacity: 0.5 }}>
                {t('luminaWindow.controlsHint')}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
