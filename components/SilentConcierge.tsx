'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getStore, updateStore } from '@/lib/store'
import { hapticTick } from '@/lib/haptics'

const TWO_HOURS = 2 * 60 * 60 * 1000
const CHECK_INTERVAL = 60 * 1000
const BREATHING_MINUTES = 5

type BreathPhase = 'inhale' | 'hold' | 'exhale' | 'rest'

interface CycleState {
  phase: BreathPhase
  countdown: number
  cycle: number
}

// 4-7-8 rhythm durations in seconds
const PHASE_DURATION: Record<BreathPhase, number> = {
  inhale: 4,
  hold: 7,
  exhale: 8,
  rest: 1,
}

const PHASE_LABEL: Record<BreathPhase, string> = {
  inhale: '吸う',
  hold: '止める',
  exhale: '吐く',
  rest: '',
}

// Target brightness (0–100) for each breathing phase
const PHASE_BRIGHTNESS: Record<BreathPhase, number> = {
  inhale: 40,
  hold: 40,
  exhale: 5,
  rest: 5,
}

const NEXT_PHASE: Record<BreathPhase, BreathPhase> = {
  inhale: 'hold',
  hold: 'exhale',
  exhale: 'rest',
  rest: 'inhale',
}

export default function SilentConcierge() {
  const [showToast, setShowToast] = useState(false)
  const [showBreathing, setShowBreathing] = useState(false)
  const [breathState, setBreathState] = useState<CycleState>({ phase: 'inhale', countdown: 4, cycle: 0 })
  const [timeLeft, setTimeLeft] = useState(BREATHING_MINUTES * 60)
  const [dismissed, setDismissed] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const breathRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dimissedRef = useRef(false)

  // Poll every minute to check if same scene has been active for 2+ hours
  useEffect(() => {
    const check = () => {
      if (dimissedRef.current) return
      const store = getStore()
      if (!store.lastSceneChangeAt) return
      const elapsed = Date.now() - new Date(store.lastSceneChangeAt).getTime()
      if (elapsed >= TWO_HOURS) {
        setShowToast(true)
        dimissedRef.current = true
      }
    }
    const id = setInterval(check, CHECK_INTERVAL)
    return () => clearInterval(id)
  }, [])

  // Breathing timer when active
  useEffect(() => {
    if (!showBreathing) return
    const totalSec = BREATHING_MINUTES * 60
    setTimeLeft(totalSec)
    let remaining = totalSec

    const tick = () => {
      remaining -= 1
      setTimeLeft(remaining)
      if (remaining <= 0) {
        setShowBreathing(false)
        if (timerRef.current) clearInterval(timerRef.current)
      }
    }
    timerRef.current = setInterval(tick, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [showBreathing])

  // 4-7-8 breath cycle animation
  useEffect(() => {
    if (!showBreathing) return
    let phase: BreathPhase = 'inhale'
    let countdown = PHASE_DURATION.inhale

    const advance = () => {
      setBreathState(prev => {
        const next = NEXT_PHASE[prev.phase]
        return { phase: next, countdown: PHASE_DURATION[next], cycle: next === 'inhale' ? prev.cycle + 1 : prev.cycle }
      })
      phase = NEXT_PHASE[phase]
      countdown = PHASE_DURATION[phase]
      schedule()
    }

    let tid: ReturnType<typeof setTimeout>
    const schedule = () => { tid = setTimeout(advance, PHASE_DURATION[phase] * 1000) }
    schedule()
    return () => clearTimeout(tid)
  }, [showBreathing])

  const startBreathing = () => {
    hapticTick()
    setShowToast(false)
    setShowBreathing(true)
    setBreathState({ phase: 'inhale', countdown: 4, cycle: 0 })
  }

  const dismissToast = () => {
    setShowToast(false)
    setDismissed(true)
  }

  const stopBreathing = () => {
    setShowBreathing(false)
    if (timerRef.current) clearInterval(timerRef.current)
  }

  const currentBrightness = PHASE_BRIGHTNESS[breathState.phase]
  const glowOpacity = currentBrightness / 100

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
                    少し張り詰めすぎていませんか？
                  </p>
                  <p className="text-xs text-zinc-500 mt-0.5">同じ照明で2時間が経ちました</p>
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
                5分間のマインドフルネス・ライト
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
            exit={{ opacity: 0 }}
          >
            {/* Warm OLED breathing orb */}
            <motion.div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(ellipse 60% 50% at 50% 50%, hsl(28,100%,${10 + Math.round(glowOpacity * 55)}%) 0%, transparent 70%)`,
              }}
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: PHASE_DURATION[breathState.phase], ease: 'easeInOut', repeat: Infinity }}
            />

            {/* Circle orb */}
            <motion.div
              className="relative rounded-full"
              style={{
                width: 180,
                height: 180,
                background: `radial-gradient(circle, hsl(28,100%,${20 + Math.round(glowOpacity * 50)}%) 0%, hsl(24,100%,${5 + Math.round(glowOpacity * 20)}%) 60%, transparent 100%)`,
                boxShadow: `0 0 ${40 + Math.round(glowOpacity * 80)}px rgba(255,157,92,${glowOpacity * 0.7})`,
              }}
              animate={{
                scale: breathState.phase === 'inhale' ? [1, 1.3] : breathState.phase === 'exhale' ? [1.3, 1] : 1.3,
              }}
              transition={{
                duration: PHASE_DURATION[breathState.phase],
                ease: breathState.phase === 'hold' ? 'linear' : 'easeInOut',
              }}
            />

            {/* Instructions */}
            <div className="absolute flex flex-col items-center gap-2" style={{ top: '62%' }}>
              <AnimatePresence mode="wait">
                <motion.p
                  key={breathState.phase}
                  className="font-serif text-2xl"
                  style={{ color: `rgba(255,220,180,${0.4 + glowOpacity * 0.6})` }}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  {PHASE_LABEL[breathState.phase]}
                </motion.p>
              </AnimatePresence>
              <p className="text-xs" style={{ color: 'rgba(255,180,120,0.35)' }}>
                {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')} 残り
              </p>
            </div>

            {/* Close */}
            <button
              onClick={stopBreathing}
              className="absolute top-8 right-6 text-xs"
              style={{ color: 'rgba(255,180,120,0.3)' }}
            >
              閉じる
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
