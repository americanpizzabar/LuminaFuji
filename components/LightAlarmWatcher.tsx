'use client'

/**
 * 明日の光アラームの常駐ウォッチャー（ダッシュボード全体で有効）。
 * アプリのどのページを開いていても、起床時刻の20分前になると
 * 画面全体が実時間のサンライズで満ちていき、起床時刻に朝の挨拶を表示する。
 * サンライズ中は Wake Lock で画面のスリープを防ぐ。
 */

import { useState, useEffect, useRef } from 'react'
import { AnimatePresence } from 'framer-motion'
import { getStore } from '@/lib/store'
import { usePhase } from '@/lib/phase'
import { useLanguage } from '@/lib/useLanguage'
import { useWakeLock } from '@/lib/useWakeLock'
import { hapticSuccess } from '@/lib/haptics'
import SunriseGlow, { SunrisePlan, SUNRISE_TARGET, SUNRISE_LEAD_MINUTES } from '@/components/SunriseGlow'

const CHECK_INTERVAL_MS = 30_000

interface ActiveSunrise {
  wakeAt: number
  startedAt: number
  plan: SunrisePlan
}

/** 今日の HH:MM を Date で返す */
function todayAt(time: string, now: Date): Date {
  const [h, m] = time.split(':').map(Number)
  const d = new Date(now)
  d.setHours(h, m, 0, 0)
  return d
}

export default function LightAlarmWatcher() {
  const { phase } = usePhase()
  const { t } = useLanguage()
  const [active, setActive] = useState<ActiveSunrise | null>(null)
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)
  // 手動停止した起床時刻 — 同じアラームを直後に再発火させない
  const skipWakeRef = useRef(0)

  // サンライズ中は画面を眠らせない
  useWakeLock(active !== null)

  // 滞在中のみ、30秒ごとにアラーム時刻を監視
  useEffect(() => {
    if (phase !== 'staying' || active) return
    const check = () => {
      const alarm = getStore().lightAlarm
      if (!alarm?.enabled) return
      const now = new Date()
      const wake = todayAt(alarm.time, now)
      const start = wake.getTime() - SUNRISE_LEAD_MINUTES * 60_000
      if (wake.getTime() <= skipWakeRef.current) return
      if (now.getTime() >= start && now.getTime() < wake.getTime()) {
        setDone(false)
        setProgress(0)
        setActive({ wakeAt: wake.getTime(), startedAt: now.getTime(), plan: alarm.plan })
      }
    }
    check()
    const id = setInterval(check, CHECK_INTERVAL_MS)
    return () => clearInterval(id)
  }, [phase, active])

  // 実時間ランプの進行（1秒ごと）
  useEffect(() => {
    if (!active || done) return
    const duration = Math.max(active.wakeAt - active.startedAt, 60_000)
    const tick = () => {
      const now = Date.now()
      const p = Math.min(1, (now - active.startedAt) / duration)
      setProgress(p)
      if (p >= 1 || now >= active.wakeAt) {
        setProgress(1)
        setDone(true)
        hapticSuccess()
      }
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [active, done])

  const close = () => {
    if (active) skipWakeRef.current = active.wakeAt
    setActive(null)
    setDone(false)
    setProgress(0)
  }

  const brightness = active
    ? Math.round(2 + (SUNRISE_TARGET[active.plan] - 2) * progress)
    : 2

  return (
    <AnimatePresence>
      {active && (
        <SunriseGlow
          progress={progress}
          brightness={brightness}
          plan={active.plan}
          statusText={done ? t('watcher.goodMorning') : t('watcher.rising')}
          onClose={close}
          closeLabel={t('alarm.close')}
          zIndex={185}
          extra={done ? (
            <div className="mt-4">
              <p className="text-sm mb-5" style={{ color: 'rgba(255,225,180,0.85)' }}>
                {t(`watcher.${active.plan}Msg`)}
              </p>
              <button
                onClick={close}
                className="py-2.5 px-7 rounded-2xl text-xs font-semibold"
                style={{
                  background: 'rgba(255,200,130,0.14)',
                  border: '1px solid rgba(255,200,130,0.3)',
                  color: 'rgba(255,225,180,0.95)',
                }}
              >
                {t('watcher.stop')}
              </button>
            </div>
          ) : undefined}
        />
      )}
    </AnimatePresence>
  )
}
