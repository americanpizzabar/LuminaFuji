'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { updateStore, recordLightingEvent, recordEngagement } from '@/lib/store'
import type { ArrivalMode } from '@/lib/store'
import { ARRIVAL_PRESETS } from '@/lib/lighting'
import { useLanguage } from '@/lib/useLanguage'
import { hapticTap, hapticSuccess } from '@/lib/haptics'

const MODES: { id: ArrivalMode; emoji: string }[] = [
  { id: 'rest',    emoji: '😮‍💨' },
  { id: 'refresh', emoji: '😴' },
  { id: 'explore', emoji: '✨' },
]

interface Props {
  reservationId: string
}

export default function ArrivalCheck({ reservationId }: Props) {
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)
  const [chosen, setChosen] = useState<ArrivalMode | null>(null)
  const [confirmed, setConfirmed] = useState(false)

  // 初回のみ表示。ウェルカム・リチュアル（入室の儀式）の実行中は、
  // その演出が終わるのを待ってから静かに現れる（同時表示による衝突を防ぐ）。
  useEffect(() => {
    const key = `lf_arrival_check_${reservationId}`
    let tid: ReturnType<typeof setTimeout> | null = null
    let listening = false

    const onRitualDone = () => {
      window.removeEventListener('lf:welcome-done', onRitualDone)
      listening = false
      tid = setTimeout(() => setOpen(true), 1200)
    }

    try {
      if (!localStorage.getItem(key)) {
        tid = setTimeout(() => {
          if (document.documentElement.dataset.lfRitual === '1') {
            listening = true
            window.addEventListener('lf:welcome-done', onRitualDone)
          } else {
            setOpen(true)
          }
        }, 1800)
      }
    } catch { /* ignore */ }

    return () => {
      if (tid) clearTimeout(tid)
      if (listening) window.removeEventListener('lf:welcome-done', onRitualDone)
    }
  }, [reservationId])

  const markAnswered = (value: string) => {
    try { localStorage.setItem(`lf_arrival_check_${reservationId}`, value) } catch { /* ignore */ }
  }

  const handleSelect = (mode: ArrivalMode) => {
    hapticTap()
    setChosen(mode)
  }

  const handleConfirm = () => {
    if (!chosen) return
    hapticSuccess()
    updateStore({ arrivalMode: chosen })
    recordEngagement('arrival_answered', `arrival_mode_${chosen}`)
    // プリセット適用をシーン変更として記録（履歴＋コンシェルジュの2時間タイマー起点）
    const preset = ARRIVAL_PRESETS[chosen]
    recordLightingEvent({ sceneId: preset.sceneId, sceneName: preset.sceneName })
    markAnswered(chosen)
    setConfirmed(true)
    setTimeout(() => setOpen(false), 2800)
  }

  // 答えたくないゲストに静けさを返す。二度と尋ねない。
  const handleSkip = () => {
    hapticTap()
    recordEngagement('arrival_skipped')
    markAnswered('skipped')
    setOpen(false)
  }

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-end justify-center"
          style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(10px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-md rounded-t-3xl overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, #0d0a08 0%, #080504 100%)',
              border: '1px solid rgba(255,157,92,0.18)',
              borderBottom: 'none',
              boxShadow: '0 -8px 48px rgba(0,0,0,0.7)',
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 280 }}
          >
            <AnimatePresence mode="wait">
              {!confirmed ? (
                <motion.div
                  key="picker"
                  className="p-6 pb-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Handle */}
                  <div className="w-10 h-1 rounded-full mx-auto mb-6"
                       style={{ background: 'rgba(255,255,255,0.12)' }} />

                  <p className="text-[11px] text-ember-400/70 tracking-[0.22em] uppercase mb-1">
                    {t('arrival.label')}
                  </p>
                  <h2 className="font-serif text-2xl text-zinc-50 mb-1">
                    {t('arrival.question')}
                  </h2>
                  <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
                    {t('arrival.hint')}
                  </p>

                  <div className="space-y-3 mb-6">
                    {MODES.map(({ id, emoji }) => {
                      const isChosen = chosen === id
                      return (
                        <motion.button
                          key={id}
                          onClick={() => handleSelect(id)}
                          className="w-full rounded-2xl p-4 flex items-center gap-4 text-left transition-all"
                          style={{
                            background: isChosen
                              ? 'rgba(255,157,92,0.12)'
                              : 'rgba(255,255,255,0.03)',
                            border: isChosen
                              ? '1px solid rgba(255,157,92,0.35)'
                              : '1px solid rgba(255,255,255,0.06)',
                          }}
                          whileTap={{ scale: 0.97 }}
                        >
                          <span className="text-3xl">{emoji}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-zinc-100">{t(`arrival.${id}`)}</p>
                            <p className="text-xs text-zinc-400 mt-0.5">{t(`arrival.${id}Sub`)}</p>
                          </div>
                          {isChosen && (
                            <motion.div
                              className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{ background: 'rgba(255,157,92,0.25)', border: '1px solid rgba(255,157,92,0.5)' }}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                            >
                              <div className="w-2 h-2 rounded-full" style={{ background: '#ff9d5c' }} />
                            </motion.div>
                          )}
                        </motion.button>
                      )
                    })}
                  </div>

                  <AnimatePresence>
                    {chosen && (
                      <motion.button
                        onClick={handleConfirm}
                        className="w-full py-3.5 rounded-2xl text-sm font-semibold btn-ember"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        {t('arrival.apply')}
                      </motion.button>
                    )}
                  </AnimatePresence>

                  {/* 静かに閉じる選択肢 — 答えることを強制しない */}
                  <button
                    onClick={handleSkip}
                    className="w-full py-3 mt-1 text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
                  >
                    {t('arrival.skip')}
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="confirmed"
                  className="p-8 pb-12 flex flex-col items-center text-center"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <motion.div
                    className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
                    style={{ background: 'rgba(255,157,92,0.12)', border: '1px solid rgba(255,157,92,0.28)' }}
                    animate={{ boxShadow: ['0 0 0px rgba(255,157,92,0)', '0 0 32px rgba(255,157,92,0.4)', '0 0 0px rgba(255,157,92,0)'] }}
                    transition={{ duration: 1.6, repeat: Infinity }}
                  >
                    <span className="text-2xl">{MODES.find(m => m.id === chosen)?.emoji}</span>
                  </motion.div>

                  <p className="font-serif text-xl text-zinc-50 mb-3 whitespace-pre-line">
                    {chosen && t(`arrival.reply${capitalize(chosen)}`)}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {t('arrival.setNote')}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
