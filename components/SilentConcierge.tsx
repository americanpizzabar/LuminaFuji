'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getStore, touchLightingActivity, expOf } from '@/lib/store'
import { usePhase } from '@/lib/phase'
import { useStore } from '@/lib/useStore'
import { useLanguage } from '@/lib/useLanguage'
import { hapticTick, hapticSuccess } from '@/lib/haptics'

const CHECK_INTERVAL = 60 * 1000
const BREATHING_MINUTES = 5
// 完了の余韻を見せてから静かに閉じるまでの時間
const AFTERGLOW_MS = 3600

type BreathPhase = 'inhale' | 'hold' | 'exhale' | 'rest'

// 4-7-8 rhythm durations in seconds
const PHASE_DURATION: Record<BreathPhase, number> = {
  inhale: 4,
  hold: 7,
  exhale: 8,
  rest: 1,
}

const NEXT_PHASE: Record<BreathPhase, BreathPhase> = {
  inhale: 'hold',
  hold: 'exhale',
  exhale: 'rest',
  rest: 'inhale',
}

export default function SilentConcierge() {
  const { phase } = usePhase()
  const { t } = useLanguage()
  const [appStore] = useStore()
  const conciergeEnabled = expOf(appStore).silentConcierge
  const conciergeHours = expOf(appStore).conciergeHours
  const [showToast, setShowToast] = useState(false)
  const [showBreathing, setShowBreathing] = useState(false)
  const [breathPhase, setBreathPhase] = useState<BreathPhase>('inhale')
  const [timeLeft, setTimeLeft] = useState(BREATHING_MINUTES * 60)
  const [sessionDone, setSessionDone] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const afterglowRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const shownRef = useRef(false)

  // 滞在中のみ、同一シーンが設定時間以上続いていないか1分ごとに確認する
  // （しきい値は管理会社が1〜4時間で構成できる。チェック時に都度読むため変更が即反映される）
  useEffect(() => {
    if (phase !== 'staying' || !conciergeEnabled) return
    const check = () => {
      if (shownRef.current) return
      const store = getStore()
      const exp = expOf(store)
      if (!exp.silentConcierge || !store.lastSceneChangeAt) return
      const threshold = exp.conciergeHours * 60 * 60 * 1000
      const elapsed = Date.now() - new Date(store.lastSceneChangeAt).getTime()
      if (elapsed >= threshold) {
        setShowToast(true)
        shownRef.current = true
      }
    }
    const id = setInterval(check, CHECK_INTERVAL)
    return () => clearInterval(id)
  }, [phase, conciergeEnabled])

  // Countdown timer while breathing session is active
  useEffect(() => {
    if (!showBreathing || sessionDone) return
    const totalSec = BREATHING_MINUTES * 60
    setTimeLeft(totalSec)
    let remaining = totalSec

    timerRef.current = setInterval(() => {
      remaining -= 1
      setTimeLeft(remaining)
      if (remaining <= 0) {
        completeSession()
      }
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showBreathing, sessionDone])

  // 4-7-8 breath cycle state machine — 位相の切り替わりを微細な振動でも伝える（目を閉じたまま整えられる）
  useEffect(() => {
    if (!showBreathing || sessionDone) return
    let current: BreathPhase = 'inhale'
    setBreathPhase('inhale')

    let tid: ReturnType<typeof setTimeout>
    const schedule = () => {
      tid = setTimeout(() => {
        current = NEXT_PHASE[current]
        setBreathPhase(current)
        if (current !== 'rest') hapticTick()
        schedule()
      }, PHASE_DURATION[current] * 1000)
    }
    schedule()
    return () => clearTimeout(tid)
  }, [showBreathing, sessionDone])

  // アンマウント時の後始末
  useEffect(() => {
    return () => { if (afterglowRef.current) clearTimeout(afterglowRef.current) }
  }, [])

  const startBreathing = () => {
    hapticTick()
    setShowToast(false)
    setSessionDone(false)
    setShowBreathing(true)
  }

  /** 5分完走 — 余韻を見せてから静かに閉じる */
  const completeSession = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    hapticSuccess()
    setSessionDone(true)
    touchLightingActivity()
    shownRef.current = false
    afterglowRef.current = setTimeout(() => {
      setShowBreathing(false)
      setSessionDone(false)
    }, AFTERGLOW_MS)
  }

  /** 手動終了 — 2時間タイマーをリセットして再提案を先送りする */
  const closeBreathing = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (afterglowRef.current) clearTimeout(afterglowRef.current)
    setShowBreathing(false)
    setSessionDone(false)
    touchLightingActivity()
    shownRef.current = false
  }

  const dismissToast = () => {
    setShowToast(false)
    // 「今は不要」の意思表示 — 2時間後に改めて様子をうかがう
    touchLightingActivity()
    shownRef.current = false
  }

  const isLit = sessionDone || breathPhase === 'inhale' || breathPhase === 'hold'

  return (
    <>
      {/* Gentle toast notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            className="fixed bottom-24 left-4 right-4 z-[150] max-w-sm mx-auto"
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
          >
            <div
              className="rounded-2xl p-4"
              style={{
                background: 'linear-gradient(135deg, #0d0a08 0%, #080504 100%)',
                border: '1px solid rgba(255,157,92,0.2)',
                boxShadow: '0 8px 40px rgba(0,0,0,0.6), 0 0 24px rgba(255,157,92,0.08)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <div className="flex items-start gap-3 mb-3">
                <motion.div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-base"
                  style={{ background: 'rgba(255,157,92,0.1)', border: '1px solid rgba(255,157,92,0.2)' }}
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  🕯
                </motion.div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-200 leading-snug">
                    {t('concierge.title')}
                  </p>
                  <p className="text-xs text-zinc-500 mt-0.5">{t('concierge.sub', { hours: conciergeHours })}</p>
                </div>
                <button
                  onClick={dismissToast}
                  className="text-zinc-600 hover:text-zinc-400 flex-shrink-0 text-lg leading-none mt-0.5"
                >
                  ×
                </button>
              </div>

              <button
                onClick={startBreathing}
                className="w-full py-2.5 rounded-xl text-xs font-semibold transition-all"
                style={{
                  background: 'rgba(255,157,92,0.1)',
                  border: '1px solid rgba(255,157,92,0.25)',
                  color: '#ff9d5c',
                }}
              >
                {t('concierge.start')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full-screen breathing light */}
      <AnimatePresence>
        {showBreathing && (
          <motion.div
            className="fixed inset-0 z-[190] flex flex-col items-center justify-center"
            style={{ background: '#030201' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 1.2 } }}
          >
            {/* Warm ambient wash — brightness breathes via opacity (smoothly animatable) */}
            <motion.div
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(ellipse 60% 50% at 50% 50%, hsl(28,100%,42%) 0%, transparent 70%)',
              }}
              animate={{ opacity: isLit ? 0.85 : 0.18 }}
              transition={{ duration: sessionDone ? 2 : PHASE_DURATION[breathPhase], ease: 'easeInOut' }}
            />

            {/* Breathing orb — scale and glow animate together over the full phase duration */}
            <motion.div
              className="relative rounded-full"
              style={{
                width: 180,
                height: 180,
                background: 'radial-gradient(circle, hsl(28,100%,62%) 0%, hsl(24,100%,22%) 60%, transparent 100%)',
                boxShadow: '0 0 110px rgba(255,157,92,0.65)',
              }}
              animate={{
                scale: sessionDone ? 1.15 : isLit ? 1.3 : 1,
                opacity: isLit ? 1 : 0.35,
              }}
              transition={{
                duration: sessionDone ? 2 : PHASE_DURATION[breathPhase],
                ease: breathPhase === 'hold' && !sessionDone ? 'linear' : 'easeInOut',
              }}
            />

            {/* Instructions */}
            <div className="absolute flex flex-col items-center gap-2" style={{ top: '62%' }}>
              <AnimatePresence mode="wait">
                <motion.p
                  key={sessionDone ? 'done' : breathPhase}
                  className="font-serif text-2xl"
                  style={{ color: 'rgba(255,220,180,0.85)' }}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  {sessionDone
                    ? t('concierge.done')
                    : breathPhase === 'rest' ? '' : t(`concierge.${breathPhase}`)}
                </motion.p>
              </AnimatePresence>
              <p className="text-xs" style={{ color: 'rgba(255,180,120,0.35)' }}>
                {sessionDone
                  ? t('concierge.doneSub')
                  : t('concierge.remaining', { time: `${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, '0')}` })}
              </p>
            </div>

            {/* Close */}
            {!sessionDone && (
              <button
                onClick={closeBreathing}
                className="absolute top-8 right-6 text-xs"
                style={{ color: 'rgba(255,180,120,0.3)' }}
              >
                {t('concierge.close')}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
