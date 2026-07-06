'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, AlarmClock, Check, BatteryCharging } from 'lucide-react'
import { getStore, updateStore, expOf, recordEngagement } from '@/lib/store'
import type { LightAlarm } from '@/lib/store'
import { useStore } from '@/lib/useStore'
import { useLanguage } from '@/lib/useLanguage'
import { useWakeLock } from '@/lib/useWakeLock'
import { hapticTap, hapticSuccess } from '@/lib/haptics'
import FeatureUnavailable from '@/components/FeatureUnavailable'
import SunriseGlow, { SunrisePlan, SUNRISE_TARGET } from '@/components/SunriseGlow'

const PLAN_EMOJI: Record<SunrisePlan, string> = { sport: '🏃', leisure: '🌅', work: '💻' }
const PLAN_IDS: SunrisePlan[] = ['sport', 'leisure', 'work']

// プレビューは20分のランプを24秒に圧縮して再生する
const PREVIEW_DURATION_MS = 24_000

type Phase = 'setup' | 'saved' | 'preview' | 'standby'

function AlarmPageInner() {
  const { t } = useLanguage()
  const [appStore] = useStore()
  // サンライズ開始タイミングは管理会社が10/20/30分から構成する
  const leadMin = expOf(appStore).alarmLeadMinutes
  const [phase, setPhase] = useState<Phase>('setup')
  const [plan, setPlan] = useState<SunrisePlan>('leisure')
  const [time, setTime] = useState('07:00')
  const [existing, setExisting] = useState<LightAlarm | null>(null)

  // プレビューランプ
  const [previewProgress, setPreviewProgress] = useState(0)
  const previewRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // スタンバイ（枕元）モードの時計
  const [clock, setClock] = useState('')

  // 通知の予約タイマー — 再セット時に前の予約を破棄して多重通知を防ぐ
  const notifRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // スタンバイ中は画面を眠らせない（本番のサンライズは常駐ウォッチャーが引き継ぐ）
  useWakeLock(phase === 'standby')

  useEffect(() => {
    const store = getStore()
    if (store.lightAlarm) {
      setExisting(store.lightAlarm)
      setPlan(store.lightAlarm.plan)
      setTime(store.lightAlarm.time)
      setPhase('saved')
    }
  }, [])

  // アンマウント時に各タイマーを確実に停止
  useEffect(() => {
    return () => {
      if (previewRef.current) clearInterval(previewRef.current)
      if (notifRef.current) clearTimeout(notifRef.current)
    }
  }, [])

  // スタンバイモードの時計（1秒ごと）
  useEffect(() => {
    if (phase !== 'standby') return
    const update = () => setClock(new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }))
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [phase])

  const handleSave = () => {
    hapticSuccess()
    const alarm: LightAlarm = { time, plan, enabled: true }
    updateStore({ lightAlarm: alarm })
    recordEngagement('alarm_set')
    setExisting(alarm)
    setPhase('saved')

    // 対応環境ではサンライズ開始時刻に通知を予約する（アプリを開いている間のみ有効）
    if (typeof window !== 'undefined' && 'Notification' in window) {
      Notification.requestPermission().then(perm => {
        if (perm !== 'granted') return
        const [h, m] = time.split(':').map(Number)
        const now = new Date()
        const wake = new Date(now)
        wake.setHours(h, m, 0, 0)
        if (wake <= now) wake.setDate(wake.getDate() + 1)
        const delay = wake.getTime() - leadMin * 60_000 - Date.now()
        if (delay > 0 && delay < 24 * 60 * 60 * 1000) {
          if (notifRef.current) clearTimeout(notifRef.current)
          notifRef.current = setTimeout(() => {
            try {
              new Notification('Lumina Fuji — Light Alarm', {
                body: t('alarm.savedTitle', { time }),
                icon: '/icon.png',
              })
            } catch { /* 通知が失効していても静かに続行 */ }
          }, delay)
        }
      }).catch(() => { /* 通知非対応環境では静かに続行 */ })
    }
  }

  const handlePreview = () => {
    hapticTap()
    setPhase('preview')
    setPreviewProgress(0)
    if (previewRef.current) clearInterval(previewRef.current)
    const t0 = Date.now()
    previewRef.current = setInterval(() => {
      const k = Math.min(1, (Date.now() - t0) / PREVIEW_DURATION_MS)
      setPreviewProgress(k)
      if (k >= 1 && previewRef.current) {
        clearInterval(previewRef.current)
        previewRef.current = null
      }
    }, 100)
  }

  const stopPreview = () => {
    if (previewRef.current) { clearInterval(previewRef.current); previewRef.current = null }
    setPreviewProgress(0)
    setPhase('saved')
  }

  const handleDisable = () => {
    hapticTap()
    updateStore({ lightAlarm: null })
    setExisting(null)
    setPhase('setup')
  }

  const previewBrightness = Math.round(2 + (SUNRISE_TARGET[plan] - 2) * previewProgress)

  return (
    <div className="page-container pb-28">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pt-2">
        <Link href="/dashboard" className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <ArrowLeft size={16} className="text-zinc-400" />
        </Link>
        <div>
          <p className="text-[10px] text-zinc-500 tracking-[0.2em] uppercase">{t('alarm.label')}</p>
          <h1 className="font-serif text-xl text-zinc-100">Light Alarm</h1>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ─── Setup / Edit ─── */}
        {phase === 'setup' && (
          <motion.div key="setup" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

            {existing && (
              <motion.div
                className="mb-4 rounded-2xl p-4 flex items-center gap-3"
                style={{ background: 'rgba(255,157,92,0.08)', border: '1px solid rgba(255,157,92,0.2)' }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              >
                <AlarmClock size={16} className="text-ember-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-ember-400 font-medium">{t('alarm.existing')}</p>
                  <p className="text-sm text-zinc-200">{existing.time} · {t(`alarm.${existing.plan}`)}</p>
                </div>
                <button onClick={handleDisable} className="text-xs text-zinc-500 hover:text-zinc-300">{t('alarm.disable')}</button>
              </motion.div>
            )}

            {/* Wake time */}
            <div className="mb-5">
              <p className="text-xs text-zinc-500 tracking-[0.15em] uppercase mb-3">{t('alarm.wakeTime')}</p>
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
                {t('alarm.sunriseNote', { time, min: leadMin })}
              </p>
            </div>

            {/* Plan picker */}
            <p className="text-xs text-zinc-500 tracking-[0.15em] uppercase mb-3">{t('alarm.plans')}</p>
            <div className="space-y-2.5 mb-6">
              {PLAN_IDS.map((id) => {
                const isSelected = plan === id
                return (
                  <motion.button
                    key={id}
                    onClick={() => { hapticTap(); setPlan(id) }}
                    className="w-full rounded-2xl p-4 flex items-center gap-4 text-left"
                    style={{
                      background: isSelected ? 'rgba(255,157,92,0.09)' : 'rgba(255,255,255,0.025)',
                      border: isSelected ? '1px solid rgba(255,157,92,0.3)' : '1px solid rgba(255,255,255,0.05)',
                    }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <span className="text-2xl">{PLAN_EMOJI[id]}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-zinc-100">{t(`alarm.${id}`)}</p>
                      <p className="text-xs text-zinc-400 mt-0.5 leading-snug">{t(`alarm.${id}Desc`)}</p>
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
              {t('alarm.set')}
            </motion.button>
          </motion.div>
        )}

        {/* ─── Saved ─── */}
        {phase === 'saved' && (
          <motion.div key="saved" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

            <div className="rounded-3xl p-6 mb-5 flex flex-col items-center text-center"
                 style={{ background: 'linear-gradient(135deg, rgba(255,157,92,0.1) 0%, rgba(10,8,6,0.5) 100%)', border: '1px solid rgba(255,157,92,0.2)' }}>
              <motion.div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 text-2xl"
                style={{ background: 'rgba(255,157,92,0.1)', border: '1px solid rgba(255,157,92,0.2)' }}
                animate={{ boxShadow: ['0 0 0 rgba(255,157,92,0)', '0 0 24px rgba(255,157,92,0.3)', '0 0 0 rgba(255,157,92,0)'] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                {PLAN_EMOJI[plan]}
              </motion.div>
              <p className="font-serif text-xl text-zinc-50 mb-1">{t('alarm.savedTitle', { time })}</p>
              <p className="text-xs text-zinc-400">{t(`alarm.${plan}`)}</p>
              <p className="text-xs text-zinc-500 mt-1">{t(`alarm.${plan}Desc`)}</p>
              <p className="text-[11px] text-zinc-600 mt-3">
                {t('alarm.standbyNote', { min: leadMin })}
              </p>
            </div>

            {/* 枕元スタンバイ — 画面を保ったまま朝を待つ */}
            <motion.button
              onClick={() => { hapticTap(); setPhase('standby') }}
              className="w-full py-3.5 rounded-2xl text-sm font-semibold mb-3 flex items-center justify-center gap-2 btn-ember"
              whileTap={{ scale: 0.97 }}
            >
              <span className="text-base">🌙</span>
              {t('alarm.standby')}
            </motion.button>

            <motion.button
              onClick={handlePreview}
              className="w-full py-3.5 rounded-2xl text-sm font-semibold mb-3 flex items-center justify-center gap-2"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#a1a1aa' }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="text-base">🌅</span>
              {t('alarm.preview')}
            </motion.button>

            <button
              onClick={() => setPhase('setup')}
              className="w-full py-3 text-xs text-zinc-500"
            >
              {t('alarm.change')}
            </button>
          </motion.div>
        )}

        {/* ─── Preview sunrise ─── */}
        {phase === 'preview' && (
          <SunriseGlow
            key="preview"
            progress={previewProgress}
            brightness={previewBrightness}
            plan={plan}
            statusText={previewProgress < 1 ? t('alarm.simulating') : t('alarm.wakeNow')}
            onClose={stopPreview}
            closeLabel={t('alarm.close')}
            zIndex={180}
          />
        )}

        {/* ─── Bedside standby ─── */}
        {phase === 'standby' && (
          <motion.div
            key="standby"
            className="fixed inset-0 z-[170] flex flex-col items-center justify-center select-none"
            style={{ background: '#020101' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            onClick={() => setPhase('saved')}
          >
            {/* 減光された時計 — 眠りを妨げない最小限の存在感 */}
            <motion.p
              className="font-serif tabular-nums"
              style={{ fontSize: '3.4rem', lineHeight: 1, color: 'rgba(255,157,92,0.30)' }}
              animate={{ opacity: [0.75, 1, 0.75] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            >
              {clock}
            </motion.p>
            <p className="mt-4 text-xs" style={{ color: 'rgba(255,157,92,0.18)' }}>
              {existing?.time} · {existing && t(`alarm.${existing.plan}`)}
            </p>
            <div className="mt-8 flex items-center gap-1.5" style={{ color: 'rgba(255,157,92,0.14)' }}>
              <BatteryCharging size={12} />
              <span className="text-[11px]">{t('alarm.chargeHint')}</span>
            </div>
            <p className="absolute bottom-10 text-[11px]" style={{ color: 'rgba(255,157,92,0.12)' }}>
              {t('alarm.standbyExit')}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/** 管理会社の構成で光アラームが無効の場合は案内画面を表示する */
export default function AlarmPage() {
  const [store] = useStore()
  if (!expOf(store).lightAlarm) return <FeatureUnavailable />
  return <AlarmPageInner />
}
