'use client'

/**
 * ご滞在後にのみ出現する「デジタル秘密鍵」。
 * 予約IDからハッシュで生成したクリスタル署名を持ち、タップで
 * ECUANEST VIPコンサルティングへのアクセスを解放する。
 */

import { recordEngagement } from '@/lib/store'
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Lock, Unlock } from 'lucide-react'
import Link from 'next/link'
import { hapticSuccess, hapticCeremony } from '@/lib/haptics'

function deriveKey(id: string): string {
  const chars = 'AEHKLMNRSTUW0123456789'
  let h = 0x811c9dc5
  for (let i = 0; i < id.length; i++) {
    h = ((Math.imul(h, 0x01000193) ^ id.charCodeAt(i)) >>> 0)
  }
  let out = ''
  for (let i = 0; i < 16; i++) {
    h = (Math.imul(h ^ (h >>> 16), 0x45d9f3b)) >>> 0
    out += chars[h % chars.length]
    if (i === 3 || i === 7 || i === 11) out += '·'
  }
  return out
}

type State = 'dormant' | 'revealed' | 'unlocked'

export default function SecretKey({
  reservationId,
  guestName,
}: {
  reservationId: string
  guestName: string
}) {
  const [state, setState] = useState<State>('dormant')
  const keySignature = useMemo(() => deriveKey(reservationId), [reservationId])
  const firstName = guestName?.split(' ')[0] ?? 'ゲスト'

  return (
    <AnimatePresence mode="wait">

      {/* ── Dormant: pulsing crystal, "touch to open" ── */}
      {state === 'dormant' && (
        <motion.button key="dormant"
          className="w-full rounded-3xl p-6 text-center"
          style={{ background:'linear-gradient(165deg, rgba(14,10,7,0.98) 0%, rgba(8,6,4,0.98) 100%)', border:'1px solid rgba(255,157,92,0.13)' }}
          onClick={() => { hapticCeremony(); recordEngagement('secretkey_revealed'); setState('revealed') }}
          whileTap={{ scale:0.97 }}
          initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, scale:0.95 }}>

          <div className="relative mx-auto mb-4" style={{ width:72, height:72 }}>
            {/* Slowly rotating crystal */}
            <motion.div className="absolute inset-0" animate={{ rotate:360 }}
              transition={{ duration:18, repeat:Infinity, ease:'linear' }}>
              <svg viewBox="0 0 72 72" fill="none">
                <polygon points="36,3 64,25 36,69 8,25"
                  fill="rgba(255,184,119,0.05)" stroke="rgba(255,184,119,0.22)" strokeWidth="0.7" />
                <polygon points="36,3 64,25 36,36" fill="rgba(255,220,160,0.08)" />
                <polygon points="8,25 36,36 36,69"  fill="rgba(255,157,92,0.05)" />
                <polygon points="64,25 36,36 36,69" fill="rgba(200,100,40,0.05)" />
                <line x1="36" y1="3" x2="36" y2="69" stroke="rgba(255,184,119,0.08)" strokeWidth="0.4" />
                <line x1="8"  y1="25" x2="64" y2="25" stroke="rgba(255,184,119,0.08)" strokeWidth="0.4" />
              </svg>
            </motion.div>
            <motion.div className="absolute inset-0 rounded-full pointer-events-none"
              style={{ background:'radial-gradient(circle, rgba(255,184,119,0.26) 0%, transparent 70%)' }}
              animate={{ opacity:[0.35, 0.9, 0.35], scale:[0.85, 1.12, 0.85] }}
              transition={{ duration:3.2, repeat:Infinity, ease:'easeInOut' }} />
            <Lock size={13} className="absolute inset-0 m-auto text-ember-300/40" />
          </div>

          <p className="text-[11px] tracking-[0.32em] text-ember-400/45 uppercase mb-1.5">Digital Secret Key</p>
          <p className="text-sm text-zinc-700 font-light">触れると開く</p>
        </motion.button>
      )}

      {/* ── Revealed: show key signature, unlock button ── */}
      {state === 'revealed' && (
        <motion.div key="revealed" className="rounded-3xl p-5"
          style={{ background:'linear-gradient(165deg, rgba(18,13,9,0.98) 0%, rgba(10,7,5,0.98) 100%)', border:'1px solid rgba(255,157,92,0.26)' }}
          initial={{ opacity:0, scale:0.94 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0 }}
          transition={{ duration:0.55, ease:[0.22,1,0.36,1] }}>

          <div className="text-center mb-5">
            <div className="relative mx-auto mb-3" style={{ width:60, height:60 }}>
              <svg viewBox="0 0 60 60" fill="none" className="absolute inset-0 w-full h-full">
                <polygon points="30,2 56,21 30,58 4,21"
                  fill="rgba(255,184,119,0.07)" stroke="rgba(255,184,119,0.38)" strokeWidth="0.75" />
                <polygon points="30,2 56,21 30,30"  fill="rgba(255,220,160,0.11)" />
                <polygon points="4,21 30,30 30,58"  fill="rgba(255,157,92,0.08)" />
                <polygon points="56,21 30,30 30,58" fill="rgba(200,100,40,0.08)" />
              </svg>
              <motion.div className="absolute inset-0 rounded-full pointer-events-none"
                style={{ background:'radial-gradient(circle, rgba(255,184,119,0.32) 0%, transparent 70%)' }}
                animate={{ opacity:[0.4, 0.85, 0.4] }} transition={{ duration:2.6, repeat:Infinity }} />
              <Lock size={12} className="absolute inset-0 m-auto text-ember-400/65" />
            </div>
            <p className="text-[10px] tracking-[0.36em] text-ember-400/55 uppercase mb-2">Digital Secret Key</p>
            <p className="font-mono text-xs text-zinc-500 tracking-widest">{keySignature}</p>
          </div>

          <p className="text-center text-xs text-zinc-500 leading-relaxed mb-4">
            {firstName} 様のご滞在により、<br />
            ECUANEST の核心へのアクセスが解かれます。
          </p>

          <button onClick={() => { hapticSuccess(); setState('unlocked') }}
            className="w-full py-3 rounded-2xl text-sm flex items-center justify-center gap-2 transition-all lf-glow"
            style={{ background:'rgba(255,157,92,0.1)', border:'1px solid rgba(255,157,92,0.3)', color:'#ffb877',
                     ['--lf-glow-color' as any]:'rgba(255,157,92,0.5)' }}>
            <Unlock size={14} />
            鍵を解放する
          </button>
        </motion.div>
      )}

      {/* ── Unlocked: full VIP access ── */}
      {state === 'unlocked' && (
        <motion.div key="unlocked" className="rounded-3xl p-5"
          style={{ background:'linear-gradient(165deg, rgba(20,14,8,0.99) 0%, rgba(10,7,4,0.99) 100%)',
                   border:'1px solid rgba(255,157,92,0.48)',
                   boxShadow:'0 0 44px -10px rgba(255,157,92,0.3), inset 0 1px 0 rgba(255,209,163,0.1)' }}
          initial={{ opacity:0, scale:0.94 }} animate={{ opacity:1, scale:1 }}
          transition={{ duration:0.6, ease:[0.22,1,0.36,1] }}>

          <div className="text-center mb-4">
            <motion.div className="relative mx-auto mb-3" style={{ width:60, height:60 }}
              animate={{ rotate:[0,12,-8,0] }} transition={{ duration:0.75, delay:0.12 }}>
              <svg viewBox="0 0 60 60" fill="none" className="absolute inset-0 w-full h-full">
                <polygon points="30,2 56,21 30,58 4,21"
                  fill="rgba(255,184,119,0.12)" stroke="rgba(255,184,119,0.72)" strokeWidth="0.85" />
                <polygon points="30,2 56,21 30,30"  fill="rgba(255,220,160,0.2)" />
                <polygon points="4,21 30,30 30,58"  fill="rgba(255,157,92,0.13)" />
                <polygon points="56,21 30,30 30,58" fill="rgba(200,100,40,0.13)" />
              </svg>
              <motion.div className="absolute inset-0 rounded-full pointer-events-none"
                style={{ background:'radial-gradient(circle, rgba(255,184,119,0.5) 0%, transparent 70%)' }}
                animate={{ opacity:[0.5, 1, 0.5], scale:[0.88, 1.28, 0.88] }}
                transition={{ duration:2.2, repeat:Infinity }} />
              <Unlock size={12} className="absolute inset-0 m-auto text-ember-300" />
            </motion.div>
            <p className="text-[10px] tracking-[0.36em] text-ember-400/65 uppercase mb-1.5">ECUANEST · VIP Access</p>
            <p className="font-mono text-xs text-ember-300/45 tracking-widest">{keySignature}</p>
          </div>

          <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}>
            <p className="text-center text-xs text-zinc-400 leading-relaxed mb-4">
              VIP 照明コンサルティングへのアクセスが開かれました。<br />
              建築家と同じ光の言語で、<br />
              あなたの空間を設計します。
            </p>
            <Link href="/dashboard/consult">
              <button className="btn-ember w-full flex items-center justify-center gap-2 lf-glow"
                      style={{ ['--lf-glow-color' as any]:'rgba(255,157,92,0.65)' }}>
                VIP コンサルティング <ArrowRight size={15} />
              </button>
            </Link>
            <p className="text-center text-[10px] text-zinc-600 mt-2">ECUANEST · Exclusive Guest Access</p>
          </motion.div>
        </motion.div>
      )}

    </AnimatePresence>
  )
}
