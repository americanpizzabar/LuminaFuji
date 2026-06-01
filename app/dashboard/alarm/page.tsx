'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, AlarmClock, Check } from 'lucide-react'
import { getStore, updateStore } from '@/lib/store'
import type { LightAlarm } from '@/lib/store'
import { hapticTap, hapticSuccess } from '@/lib/haptics'

type Plan = 'sport' | 'leisure' | 'work'

const PLANS: { id: Plan; emoji: string; label: string; sub: string; description: string }[] = [
  {
    id: 'sport',
    emoji: '🏃',
    label: 'スポーツ・ハイキング',
    sub: 'Active Morning',
    description: '活動的な朝に向けて、爽やかな白昼の光でお目覚めをサポート',
  },
  {
    id: 'leisure',
    emoji: '🌅',
    label: 'ゆっくりした朝',
    sub: 'Slow Morning',
    description: '温かみのある夜明けの光がゆっくり満ちていく、ぜいたくな目覚め',
  },
  {
    id: 'work',
    emoji: '💻',
    label: '仕事・リモートワーク',
    sub: 'Focus Morning',
    description: '集中力を高める清潔な光が、頭をシャープにしてくれます',
  },
]

// Sunrise simulation: 20-minute ramp from near-dark to target brightness
const SUNRISE_MINUTES = 20
const SUNRISE_TARGET: Record<Plan, number> = { sport: 95, leisure: 65, work: 85 }
const SUNRISE_COLOR: Record<Plan, string> = {
  sport: 'hsl(195,80%,70%)',
  leisure: 'hsl(28,100%,65%)',
  work: 'hsl(50,90%,75%)',
}

type Phase = 'setup' | 'saved' | 'sunrise'

export default function AlarmPage() {
  const [phase, setPhase] = useState<Phase>('setup')
  const [plan, setPlan] = useState<Plan>('leisure')
  const [time, setTime] = useState('07:00')
  const [existing, setExisting] = useState<LightAlarm | null>(null)

  // Sunrise simulation state
  const [sunProgress, setSunProgress] = useState(0) // 0–1
  const [sunBrightness, setSunBrightness] = useState(2)
  const sunRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const store = getStore()
    if (store.lightAlarm) {
      setExisting(store.lightAlarm)
      setPlan(store.lightAlarm.plan)
      setTime(store.lightAlarm.time)
    }
  }, [])

  const handleSave = () => {
    hapticSuccess()
    const alarm: LightAlarm = { time, plan, enabled: true }
    updateStore({ lightAlarm: alarm })
    setExisting(alarm)
    setPhase('saved')

    // Schedule notification if supported
    if (typeof window !== 'undefined' && 'Notification' in window) {
      Notification.requestPermission().then(perm => {
        if (perm === 'granted') {
          const [h, m] = time.split(':').map(Number)
          const now = new Date()
          const wake = new Date(now)
          wake.setHours(h, m - SUNRISE_MINUTES, 0, 0)
          if (wake <= now) wake.setDate(wake.getDate() + 1)
          const delay = wake.getTime() - Date.now()
          if (delay > 0 && delay < 24 * 60 * 60 * 1000) {
            setTimeout(() => {
              new Notification('Lumina Fuji — 光のアラーム', {
                body: `${time}の起床に向けて、サンライズが始まります。`,
                icon: '/icon.png',
              })
            }, delay)
          }
        }
      })
    }
  }

  const handlePreview = () => {
    hapticTap()
    setPhase('sunrise')
    setSunProgress(0)
    setSunBrightness(2)
    const steps = SUNRISE_MINUTES * 60
    let tick = 0
    const target = SUNRISE_TARGET[plan]
    const id = setInterval(() => {
      tick += 1
      const progress = tick / steps
      const brightness = Math.round(2 + (target - 2) * progress)
      setSunProgress(Math.min(progress, 1))
      setSunBrightness(brightness)
      if (tick >= steps) {
        clearInterval(id)
        setSunProgress(1)
        setSunBrightness(target)
      }
    }, 100) // accelerated: 1 real second = 10 simulated minutes
    sunRef.current = id
  }

  const handleStopPreview = () => {
    if (sunRef.current) clearInterval(sunRef.current)
    setPhase('saved')
    setSunProgress(0)
  }

  const handleDisable = () => {
    hapticTap()
    updateStore({ lightAlarm: null })
    setExisting(null)
    setPhase('setup')
  }

  const selectedPlan = PLANS.find(p => p.id === plan)!

  return (
    <div className="page-container pb-28">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pt-2">
        <Link href="/dashboard" className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <ArrowLeft size={16} className="text-zinc-400" />
        </Link>
        <div>
          <p className="text-[10px] text-zinc-500 tracking-[0.2em] uppercase">明日の光アラーム</p>
          <h1 className="font-serif text-xl text-zinc-100">Light Alarm</h1>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ─── Setup / Edit ─── */}
        {(phase === 'setup') && (
          <motion.div key="setup" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

            {/* Existing alarm banner */}
            {existing && (
              <motion.div
                className="mb-4 rounded-2xl p-4 flex items-center gap-3"
                style={{ background: 'rgba(255,157,92,0.08)', border: '1px solid rgba(255,157,92,0.2)' }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              >
                <AlarmClock size={16} className="text-ember-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-ember-400 font-medium">設定済みアラーム</p>
                  <p className="text-sm text-zinc-200">{existing.time} · {PLANS.find(p => p.id === existing.plan)?.label}</p>
                </div>
                <button onClick={handleDisable} className="text-xs text-zinc-500 hover:text-zinc-300">解除</button>
              </motion.div>
            )}

            {/* Wake time */}
            <div className="mb-5">
              <p className="text-xs text-zinc-500 tracking-[0.15em] uppercase mb-3">起床時刻</p>
              <div className="rounded-2xl p-5 flex items-center justify-center"
                   style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <input
                  type="time"
                  value={time}
                  onChange={e => setTime(e.target.value)}
                  className="font-serif text-5xl text-zinc-50 bg-transparent border-none outline-none text-center tabular-nums"
                  style={{ colorScheme: 'dark' }}
                />
              </div>
              <p className="text-xs text-zinc-500 mt-2 text-center">
                サンライズ照明は {time} の {SUNRISE_MINUTES} 分前から始まります
              </p>
            </div>

            {/* Plan picker */}
            <p className="text-xs text-zinc-500 tracking-[0.15em] uppercase mb-3">明日の予定</p>
            <div className="space-y-2.5 mb-6">
              {PLANS.map((p) => {
                const isSelected = plan === p.id
                return (
                  <motion.button
                    key={p.id}
                    onClick={() => { hapticTap(); setPlan(p.id) }}
                    className="w-full rounded-2xl p-4 flex items-center gap-4 text-left"
                    style={{
                      background: isSelected ? 'rgba(255,157,92,0.09)' : 'rgba(255,255,255,0.025)',
                      border: isSelected ? '1px solid rgba(255,157,92,0.3)' : '1px solid rgba(255,255,255,0.05)',
                    }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <span className="text-2xl">{p.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-zinc-100">{p.label}</p>
                      <p className="text-xs text-zinc-400 mt-0.5 leading-snug">{p.description}</p>
                    </div>
                    {isSelected && (
                      <motion.div
                        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(255,157,92,0.2)' }}
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                      >
                        <Check size={11} className="text-ember-400" />
                      </motion.div>
                    )}
                  </motion.button>
                )
              })}
            </div>

            <motion.button
              onClick={handleSave}
              className="w-full py-3.5 rounded-2xl font-semibold text-sm btn-ember mb-3"
              whileTap={{ scale: 0.97 }}
            >
              光アラームをセット
            </motion.button>
          </motion.div>
        )}

        {/* ─── Saved confirmation ─── */}
        {phase === 'saved' && (
          <motion.div key="saved" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

            {/* Confirmation card */}
            <div className="rounded-3xl p-6 mb-5 flex flex-col items-center text-center"
                 style={{ background: 'linear-gradient(135deg, rgba(255,157,92,0.1) 0%, rgba(10,8,6,0.5) 100%)', border: '1px solid rgba(255,157,92,0.2)' }}>
              <motion.div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 text-2xl"
                style={{ background: 'rgba(255,157,92,0.1)', border: '1px solid rgba(255,157,92,0.2)' }}
                animate={{ boxShadow: ['0 0 0 rgba(255,157,92,0)', '0 0 24px rgba(255,157,92,0.3)', '0 0 0 rgba(255,157,92,0)'] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                {selectedPlan.emoji}
              </motion.div>
              <p className="font-serif text-xl text-zinc-50 mb-1">{time} に光が届きます</p>
              <p className="text-xs text-zinc-400">{selectedPlan.label}</p>
              <p className="text-xs text-zinc-500 mt-1">
                {selectedPlan.description}
              </p>
            </div>

            {/* Preview button */}
            <motion.button
              onClick={handlePreview}
              className="w-full py-3.5 rounded-2xl text-sm font-semibold mb-3 flex items-center justify-center gap-2"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#a1a1aa' }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="text-base">🌅</span>
              サンライズをプレビュー
            </motion.button>

            <button
              onClick={() => setPhase('setup')}
              className="w-full py-3 text-xs text-zinc-500"
            >
              設定を変更する
            </button>
          </motion.div>
        )}

        {/* ─── Sunrise simulation ─── */}
        {phase === 'sunrise' && (
          <motion.div
            key="sunrise"
            className="fixed inset-0 z-[180] flex flex-col items-center justify-center"
            style={{ background: `hsl(${plan === 'sport' ? '200' : '20'},80%,${2 + Math.round(sunProgress * 8)}%)` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Horizon glow */}
            <motion.div
              className="absolute bottom-0 left-0 right-0"
              style={{
                height: `${20 + sunProgress * 50}%`,
                background: `linear-gradient(to top, ${SUNRISE_COLOR[plan]} 0%, transparent 100%)`,
                opacity: 0.15 + sunProgress * 0.5,
              }}
            />

            {/* Sun orb */}
            <motion.div
              className="relative rounded-full"
              style={{
                width: 120,
                height: 120,
                background: `radial-gradient(circle, ${SUNRISE_COLOR[plan]} 0%, transparent 70%)`,
                boxShadow: `0 0 ${40 + sunProgress * 80}px ${SUNRISE_COLOR[plan]}`,
                opacity: 0.2 + sunProgress * 0.8,
                transform: `translateY(${(1 - sunProgress) * 80}px)`,
              }}
            />

            <div className="absolute text-center" style={{ top: '65%' }}>
              <p className="font-serif text-xl mb-1" style={{ color: `rgba(255,220,160,${0.3 + sunProgress * 0.7})` }}>
                {Math.round(sunBrightness)}%
              </p>
              <p className="text-xs" style={{ color: `rgba(255,200,130,${0.2 + sunProgress * 0.5})` }}>
                {sunProgress < 1 ? 'サンライズシミュレーション' : '起床の時刻です'}
              </p>
            </div>

            <button
              onClick={handleStopPreview}
              className="absolute top-10 right-6 text-xs"
              style={{ color: 'rgba(255,200,130,0.4)' }}
            >
              閉じる
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
