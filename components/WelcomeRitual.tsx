'use client'

/**
 * ウェルカム・シンクロニシティ（入室の儀式）。
 * ゲストが到着し滞在フェーズに入った瞬間、暗闇から有機ELの灯りが
 * 足元（床）から天井へとウェーブするように立ち上がり、それと同期して
 * 「Welcome to Lumina Fuji」が静かに浮かび上がる。一滞在につき一度だけ。
 */

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePhase } from '@/lib/phase'
import { hapticCeremony } from '@/lib/haptics'

const RISING_MOTES = [
  { x: '18%', s: 5, delay: 0.6, dur: 3.2 },
  { x: '32%', s: 4, delay: 1.1, dur: 3.8 },
  { x: '47%', s: 6, delay: 0.9, dur: 3.4 },
  { x: '61%', s: 4, delay: 1.4, dur: 4.0 },
  { x: '74%', s: 5, delay: 0.7, dur: 3.6 },
  { x: '85%', s: 4, delay: 1.2, dur: 3.9 },
]

export default function WelcomeRitual() {
  const { phase, guestInfo } = usePhase()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (phase !== 'staying' || !guestInfo) return
    const key = `lf_welcome_${guestInfo.reservationId ?? 'guest'}`
    try {
      if (localStorage.getItem(key)) return
      localStorage.setItem(key, new Date().toISOString())
    } catch {
      /* localStorage 不可環境では一度だけ表示 */
    }
    setVisible(true)
    hapticCeremony()
    const timer = setTimeout(() => setVisible(false), 5200)
    return () => clearTimeout(timer)
  }, [phase, guestInfo])

  // 儀式の実行中フラグと完了イベント。
  // サイレント・オンボーディング等の後続オーバーレイが、この演出に被らないよう待機するために使う。
  useEffect(() => {
    if (!visible) return
    document.documentElement.dataset.lfRitual = '1'
    return () => {
      delete document.documentElement.dataset.lfRitual
      window.dispatchEvent(new Event('lf:welcome-done'))
    }
  }, [visible])

  const firstName = guestInfo?.name?.split(' ')[0] ?? ''
  const ease = [0.22, 1, 0.36, 1] as const

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="welcome-ritual"
          className="fixed inset-0 z-[120] overflow-hidden flex items-center justify-center"
          style={{ background: '#070504' }}
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1, ease }}
          onClick={() => setVisible(false)}
        >
          {/* 足元から立ち上がる有機ELの光のウェーブ */}
          <motion.div
            className="absolute inset-0"
            style={{
              transformOrigin: 'bottom',
              background:
                'linear-gradient(to top, rgba(255,157,92,0.55) 0%, rgba(255,184,119,0.30) 32%, rgba(255,209,163,0.10) 58%, transparent 84%)',
              willChange: 'transform, opacity',
            }}
            initial={{ scaleY: 0, opacity: 0.25 }}
            animate={{ scaleY: 1.12, opacity: 1 }}
            transition={{ duration: 2.6, ease }}
          />

          {/* 天井に届いた光のブルーム */}
          <motion.div
            className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
            style={{
              width: '120%',
              height: '40%',
              background: 'radial-gradient(ellipse at 50% 0%, rgba(255,184,119,0.28) 0%, transparent 70%)',
              filter: 'blur(20px)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.0, duration: 1.4, ease }}
          />

          {/* 舞い上がる光の粒 */}
          {RISING_MOTES.map((m, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full pointer-events-none"
              style={{
                left: m.x,
                bottom: '8%',
                width: `${m.s}px`,
                height: `${m.s}px`,
                background: 'radial-gradient(circle, rgba(255,236,200,0.95) 0%, rgba(255,157,92,0.4) 50%, transparent 70%)',
                willChange: 'transform, opacity',
              }}
              initial={{ y: 0, opacity: 0 }}
              animate={{ y: -260, opacity: [0, 0.95, 0] }}
              transition={{ delay: 1.2 + m.delay, duration: m.dur, ease: 'easeOut', repeat: 1 }}
            />
          ))}

          {/* テキスト */}
          <div className="relative text-center px-8 select-none">
            <motion.p
              className="font-serif text-xl text-ember-200/80 tracking-[0.3em] uppercase"
              initial={{ opacity: 0, y: 14, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ delay: 1.5, duration: 1.2, ease }}
            >
              Welcome to
            </motion.p>
            <motion.h1
              className="font-serif text-5xl mt-2 text-emissive"
              initial={{ opacity: 0, y: 16, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ delay: 1.9, duration: 1.3, ease }}
            >
              Lumina&nbsp;Fuji
            </motion.h1>
            {firstName && (
              <motion.p
                className="mt-5 text-sm text-ember-200/70 font-light tracking-wide"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.7, duration: 1.1, ease }}
              >
                {firstName} 様、光の旅へようこそ
              </motion.p>
            )}
            <motion.p
              className="mt-10 text-[11px] text-zinc-500 tracking-wide"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3.8, duration: 1.0 }}
            >
              画面をタッチして始める
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
