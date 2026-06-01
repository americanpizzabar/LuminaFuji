'use client'

/**
 * 光の処方箋 — Circadian Tuning。
 * ゲストのコンディションを3択で受け取り、OLEDの光で体内時計・集中力・睡眠を科学的に調整する。
 * 「深い眠り」選択時は 1/f ゆらぎをOLEDで再現し、脳のスイッチを切るキャンドルライト・プロトコルを適用。
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check } from 'lucide-react'
import { hapticTap, hapticSuccess, hapticCeremony } from '@/lib/haptics'

export type CircadianCondition = 'jetlag' | 'creative' | 'sleep'

const CONDITIONS = [
  {
    id:         'jetlag'   as CircadianCondition,
    ja:         '時差ぼけ解消',
    en:         'Jet Lag Relief',
    verse:      '光で体内時計をリセット。\nOLEDの自然なスペクトルが、脳に静かな朝を告げる。',
    cPrimary:   '#ffd580',
    cBg:        'rgba(255,200,100,0.09)',
    cBorder:    'rgba(255,200,100,0.22)',
    prescription: '段階的に明度を上げ、体内の目覚めを光でエスコートします',
    brightness: 70,
    duration:   '30分',
    isFlicker:  false,
  },
  {
    id:         'creative' as CircadianCondition,
    ja:         '集中・創造',
    en:         'Creative Focus',
    verse:      '余分な刺激をすべて削ぎ落とした光。\n思考が研ぎ澄まされ、深い創造性が解放される。',
    cPrimary:   '#b49dff',
    cBg:        'rgba(140,100,255,0.09)',
    cBorder:    'rgba(140,100,255,0.22)',
    prescription: '読書光プロトコル（60%）。ブルーライトを一切出さずに集中力を高めます',
    brightness: 60,
    duration:   '作業中',
    isFlicker:  false,
  },
  {
    id:         'sleep'    as CircadianCondition,
    ja:         '深い眠り',
    en:         'Deep Sleep',
    verse:      'ろうそくの1/fゆらぎをOLEDで再現。\n脳のスイッチが静かに降ろされ、意識が深みへ沈む。',
    cPrimary:   '#7ca8e8',
    cBg:        'rgba(60,100,200,0.09)',
    cBorder:    'rgba(80,120,200,0.22)',
    prescription: '1/fゆらぎ超低照度（5%）キャンドルライト・プロトコルを適用します',
    brightness: 5,
    duration:   '就寝まで',
    isFlicker:  true,
  },
] as const

interface Props {
  open:     boolean
  onClose:  () => void
  /** brightness: 0-100, isFlicker: trueなら1/fゆらぎON */
  onApply:  (brightness: number, isFlicker: boolean) => void
}

export default function CircadianTuner({ open, onClose, onApply }: Props) {
  const [applying,   setApplying]  = useState<CircadianCondition | null>(null)
  const [applied,    setApplied]   = useState<CircadianCondition | null>(null)
  const ease = [0.22, 1, 0.36, 1] as const

  const handleSelect = async (c: typeof CONDITIONS[number]) => {
    hapticTap()
    setApplying(c.id)
    await new Promise(r => setTimeout(r, 1350))
    onApply(c.brightness, c.isFlicker)
    hapticSuccess()
    setApplying(null)
    setApplied(c.id)
  }

  const handleClose = () => {
    if (applying) return
    setApplying(null)
    setApplied(null)
    onClose()
  }

  const appliedCondition = CONDITIONS.find(c => c.id === applied)

  return (
    <AnimatePresence>
      {open && (
        <motion.div key="circadian"
          className="fixed inset-0 z-[150] overflow-y-auto flex items-start justify-center py-12 px-5"
          style={{ background:'rgba(4,2,1,0.96)', backdropFilter:'blur(14px)' }}
          initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
          transition={{ duration:0.45 }}>

          {/* Warm ceiling bloom */}
          <motion.div className="fixed top-0 inset-x-0 h-1/3 pointer-events-none"
            style={{ background:'linear-gradient(to bottom, rgba(255,210,130,0.055) 0%, transparent 100%)' }}
            initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:2.5 }}
          />

          <motion.div className="relative w-full max-w-[390px]"
            initial={{ opacity:0, y:22, scale:0.97 }} animate={{ opacity:1, y:0, scale:1 }}
            exit={{ opacity:0, y:12 }}
            transition={{ duration:0.55, ease }}>

            {/* Close */}
            {!applying && (
              <button onClick={handleClose}
                className="absolute -top-1 right-0 z-10 w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)' }}>
                <X size={15} className="text-zinc-400" />
              </button>
            )}

            {/* Header */}
            <div className="text-center mb-8">
              <p className="text-[11px] tracking-[0.34em] uppercase mb-2" style={{ color:'rgba(255,200,110,0.55)' }}>
                Circadian Tuning
              </p>
              <h2 className="font-serif text-[2.1rem] text-emissive leading-tight">光の処方箋</h2>
              <p className="text-xs text-zinc-600 mt-2 tracking-wide">今のコンディションをお選びください</p>
            </div>

            <AnimatePresence mode="wait">
              {/* ── Condition picker ── */}
              {!applied && (
                <motion.div key="picker" className="space-y-3"
                  exit={{ opacity:0, scale:0.97 }} transition={{ duration:0.25 }}>
                  {CONDITIONS.map((c, i) => {
                    const isApplying = applying === c.id
                    const isDisabled = !!applying && !isApplying
                    return (
                      <motion.button key={c.id}
                        className="w-full rounded-3xl p-6 text-left relative overflow-hidden"
                        style={{
                          background: `linear-gradient(145deg, ${c.cBg} 0%, rgba(0,0,0,0.45) 100%)`,
                          border: `1px solid ${c.cBorder}`,
                          opacity: isDisabled ? 0.25 : 1,
                          transition: 'opacity 0.35s ease',
                        }}
                        onClick={() => !applying && !applied && handleSelect(c)}
                        whileTap={!applying ? { scale:0.98 } : {}}
                        initial={{ opacity:0, y:18 }}
                        animate={{ opacity: isDisabled ? 0.25 : 1, y:0 }}
                        transition={{ delay:0.1 + i*0.09, duration:0.45, ease }}>

                        {/* Condition icon */}
                        <CircadianIcon id={c.id} color={c.cPrimary} />

                        <p className="font-serif text-xl mt-4 leading-tight" style={{ color:c.cPrimary }}>
                          {c.ja}
                        </p>
                        <p className="text-[11px] tracking-[0.18em] mt-0.5" style={{ color:`${c.cPrimary}88` }}>
                          {c.en.toUpperCase()}
                        </p>
                        <p className="text-xs text-zinc-500 mt-3 leading-relaxed"
                           style={{ whiteSpace:'pre-line' }}>
                          {c.verse}
                        </p>

                        {/* Applying overlay */}
                        {isApplying && (
                          <motion.div
                            className="absolute inset-0 flex items-center justify-center rounded-3xl"
                            style={{ background:'rgba(0,0,0,0.7)', backdropFilter:'blur(6px)' }}
                            initial={{ opacity:0 }} animate={{ opacity:1 }}>
                            <div className="text-center">
                              <motion.div className="w-8 h-8 border-2 rounded-full mx-auto mb-3"
                                style={{ borderColor:`${c.cPrimary}30`, borderTopColor:c.cPrimary }}
                                animate={{ rotate:360 }}
                                transition={{ duration:0.9, repeat:Infinity, ease:'linear' }} />
                              <p className="text-xs tracking-wide" style={{ color:c.cPrimary }}>処方箋を適用中…</p>
                            </div>
                          </motion.div>
                        )}
                      </motion.button>
                    )
                  })}
                </motion.div>
              )}

              {/* ── Applied confirmation ── */}
              {applied && appliedCondition && (
                <motion.div key="confirmed"
                  className="rounded-3xl p-7 text-center"
                  style={{
                    background: `linear-gradient(145deg, ${appliedCondition.cBg.replace('0.09','0.18')} 0%, rgba(0,0,0,0.55) 100%)`,
                    border: `1px solid ${appliedCondition.cBorder.replace('0.22','0.5')}`,
                    boxShadow: `0 0 60px -20px ${appliedCondition.cBg}`,
                  }}
                  initial={{ opacity:0, scale:0.93, y:18 }} animate={{ opacity:1, scale:1, y:0 }}
                  transition={{ duration:0.55, ease }}>

                  <motion.div
                    className="mb-5"
                    initial={{ scale:0, rotate:-120 }} animate={{ scale:1, rotate:0 }}
                    transition={{ delay:0.2, duration:0.6, ease:[0.34,1.56,0.64,1] }}>
                    <div className="w-14 h-14 mx-auto rounded-full flex items-center justify-center"
                         style={{ background:appliedCondition.cBg.replace('0.09','0.2'), border:`1px solid ${appliedCondition.cBorder.replace('0.22','0.5')}` }}>
                      <Check size={22} style={{ color:appliedCondition.cPrimary }} />
                    </div>
                  </motion.div>

                  <p className="font-serif text-2xl mb-1" style={{ color:appliedCondition.cPrimary }}>
                    {appliedCondition.ja}
                  </p>
                  <p className="text-[11px] tracking-[0.2em] mb-5" style={{ color:`${appliedCondition.cPrimary}66` }}>
                    {appliedCondition.en.toUpperCase()} PROTOCOL ACTIVE
                  </p>

                  <p className="text-xs text-zinc-400 leading-relaxed mb-2">
                    {appliedCondition.prescription}
                  </p>
                  <p className="text-[11px] text-zinc-700">継続時間 · {appliedCondition.duration}</p>

                  <div className="mt-6 space-y-2">
                    <button onClick={handleClose}
                      className="w-full py-3.5 rounded-2xl text-sm font-medium tracking-wide transition-all"
                      style={{
                        background: appliedCondition.cBg.replace('0.09','0.22'),
                        border: `1px solid ${appliedCondition.cBorder.replace('0.22','0.5')}`,
                        color: appliedCondition.cPrimary,
                      }}>
                      処方箋を受け取る
                    </button>
                    <button
                      onClick={() => { setApplied(null); setApplying(null) }}
                      className="w-full py-2 text-xs text-zinc-700 hover:text-zinc-400 transition-colors">
                      別の処方箋に変更
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function CircadianIcon({ id, color }: { id: CircadianCondition; color: string }) {
  const a = (opacity: number) => `${color}${Math.round(opacity * 255).toString(16).padStart(2,'0')}`

  if (id === 'jetlag') return (
    <svg width="48" height="32" viewBox="0 0 48 32" fill="none">
      {/* Horizon line */}
      <line x1="0" y1="22" x2="48" y2="22" stroke={a(0.25)} strokeWidth="0.8" />
      {/* Sun rising */}
      <path d="M24,22 A8,8 0 0,1 24,6" fill="none" stroke={a(0.7)} strokeWidth="1.2" />
      <circle cx="24" cy="14" r="3" fill={a(0.2)} stroke={a(0.8)} strokeWidth="0.8" />
      {/* Rays — only above horizon */}
      {[-60,-30,0,30,60].map((deg, i) => {
        const r = (deg - 90) * Math.PI / 180
        const x1 = 24 + Math.cos(r) * 9
        const y1 = 14 + Math.sin(r) * 9
        const x2 = 24 + Math.cos(r) * 13
        const y2 = 14 + Math.sin(r) * 13
        if (y1 > 22 || y2 > 22) return null
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={a(0.55)} strokeWidth="1" strokeLinecap="round" />
      })}
      {/* Travel arc */}
      <path d="M4,26 Q24,8 44,26" fill="none" stroke={a(0.22)} strokeWidth="0.6" strokeDasharray="2.5,3" />
    </svg>
  )

  if (id === 'creative') return (
    <svg width="48" height="40" viewBox="0 0 48 40" fill="none">
      {/* Central spark */}
      <circle cx="24" cy="20" r="3.5" fill={a(0.18)} stroke={a(0.75)} strokeWidth="0.9" />
      {/* 6 rays at different lengths */}
      {[0,60,120,180,240,300].map((deg, i) => {
        const r = deg * Math.PI / 180
        const len = i % 2 === 0 ? 11 : 7
        const x1 = 24 + Math.cos(r) * 5.5
        const y1 = 20 + Math.sin(r) * 5.5
        const x2 = 24 + Math.cos(r) * (5.5 + len)
        const y2 = 20 + Math.sin(r) * (5.5 + len)
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={a(0.6)} strokeWidth="1" strokeLinecap="round" />
      })}
      {/* Orbit ring */}
      <circle cx="24" cy="20" r="17" fill="none" stroke={a(0.15)} strokeWidth="0.6" strokeDasharray="3,4" />
      {/* Satellite dot */}
      <circle cx="38.5" cy="15" r="2" fill={a(0.4)} />
    </svg>
  )

  // sleep
  return (
    <svg width="48" height="40" viewBox="0 0 48 40" fill="none">
      {/* Crescent */}
      <path d="M28,5 A13,13 0 1,1 28,35 A9,9 0 1,0 28,5 Z" fill={a(0.12)} stroke={a(0.6)} strokeWidth="0.9" />
      {/* Drift particles */}
      {[[38,10,1.8],[41,20,1.2],[38,30,1.5],[44,16,1],[43,26,0.9]].map(([x,y,r],i) => (
        <circle key={i} cx={x} cy={y} r={r} fill={a(0.4)} />
      ))}
      {/* Soft halo */}
      <circle cx="20" cy="20" r="14" fill="none" stroke={a(0.07)} strokeWidth="4" />
    </svg>
  )
}
