'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { updateStore, recordLightingEvent } from '@/lib/store'
import type { ArrivalMode } from '@/lib/store'
import { hapticTap, hapticSuccess } from '@/lib/haptics'

/** 到着コンディション → 適用シーン（lighting ページの初期化マップと対応） */
const ARRIVAL_SCENE: Record<ArrivalMode, { sceneId: string; sceneName: string }> = {
  rest:    { sceneId: 'sleep',   sceneName: 'Sleep' },
  refresh: { sceneId: 'morning', sceneName: 'Morning' },
  explore: { sceneId: 'evening', sceneName: 'Relax' },
}

interface Condition {
  id: ArrivalMode
  emoji: string
  label: string
  sub: string
  preset: { brightness: number; scene: string }
  reply: string
}

const CONDITIONS: Condition[] = [
  {
    id: 'rest',
    emoji: '😮‍💨',
    label: 'ヘトヘト',
    sub: '疲れ果てた · 旅の疲れ',
    preset: { brightness: 5, scene: 'sleep' },
    reply: 'お疲れ様でした。\n照明を眠りモードに設定しました。\n詳しいご案内は、ゆっくり休んでから。',
  },
  {
    id: 'refresh',
    emoji: '😴',
    label: '時差ぼけ',
    sub: '眠いが頭は覚醒中',
    preset: { brightness: 80, scene: 'morning' },
    reply: '体内時計のリセットをサポートします。\n明るく清々しい朝の光でお迎えします。',
  },
  {
    id: 'explore',
    emoji: '✨',
    label: '元気いっぱい',
    sub: 'さあ、山中湖へ',
    preset: { brightness: 70, scene: 'evening' },
    reply: 'ようこそ、Lumina Fuji へ。\n光と富士山の旅を楽しんでください。',
  },
]

interface Props {
  reservationId: string
}

export default function ArrivalCheck({ reservationId }: Props) {
  const [open, setOpen] = useState(false)
  const [chosen, setChosen] = useState<Condition | null>(null)
  const [confirmed, setConfirmed] = useState(false)

  useEffect(() => {
    const key = `lf_arrival_check_${reservationId}`
    let tid: ReturnType<typeof setTimeout> | null = null
    try {
      if (!localStorage.getItem(key)) {
        tid = setTimeout(() => setOpen(true), 1800)
      }
    } catch { /* ignore */ }
    return () => { if (tid) clearTimeout(tid) }
  }, [reservationId])

  const handleSelect = (cond: Condition) => {
    hapticTap()
    setChosen(cond)
  }

  const handleConfirm = () => {
    if (!chosen) return
    hapticSuccess()
    updateStore({ arrivalMode: chosen.id })
    // プリセット適用をシーン変更として記録（履歴＋コンシェルジュの2時間タイマー起点）
    recordLightingEvent(ARRIVAL_SCENE[chosen.id])
    const key = `lf_arrival_check_${reservationId}`
    try { localStorage.setItem(key, chosen.id) } catch { /* ignore */ }
    setConfirmed(true)
    setTimeout(() => setOpen(false), 2800)
  }

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
                  className="p-6 pb-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Handle */}
                  <div className="w-10 h-1 rounded-full mx-auto mb-6"
                       style={{ background: 'rgba(255,255,255,0.12)' }} />

                  <p className="text-[11px] text-ember-400/70 tracking-[0.22em] uppercase mb-1">
                    サイレント・オンボーディング
                  </p>
                  <h2 className="font-serif text-2xl text-zinc-50 mb-1">
                    今、どんな状態ですか？
                  </h2>
                  <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
                    お伝えいただければ、光が静かにお部屋を整えます。
                  </p>

                  <div className="space-y-3 mb-6">
                    {CONDITIONS.map((cond) => {
                      const isChosen = chosen?.id === cond.id
                      return (
                        <motion.button
                          key={cond.id}
                          onClick={() => handleSelect(cond)}
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
                          <span className="text-3xl">{cond.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-zinc-100">{cond.label}</p>
                            <p className="text-xs text-zinc-400 mt-0.5">{cond.sub}</p>
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
                        光を整える
                      </motion.button>
                    )}
                  </AnimatePresence>
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
                    <span className="text-2xl">{chosen?.emoji}</span>
                  </motion.div>

                  <p className="font-serif text-xl text-zinc-50 mb-3 whitespace-pre-line">
                    {chosen?.reply}
                  </p>
                  <p className="text-xs text-zinc-500">
                    照明を{chosen?.preset.scene === 'sleep' ? '眠りモード' : chosen?.preset.scene === 'morning' ? '朝の光' : 'くつろぎモード'}に設定しました
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
