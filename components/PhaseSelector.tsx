'use client'

import { useState } from 'react'
import { usePhase, GuestPhase } from '@/lib/phase'
import { Settings } from 'lucide-react'

const phases: { key: GuestPhase; label: string; emoji: string }[] = [
  { key: 'booked', label: '予約済', emoji: '📅' },
  { key: 'staying', label: '滞在中', emoji: '🏠' },
  { key: 'post', label: '滞在後', emoji: '✨' },
]

export default function PhaseSelector() {
  const { phase, setPhase } = usePhase()
  const [open, setOpen] = useState(false)

  if (process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') return null

  const current = phases.find((p) => p.key === phase)

  return (
    <div className="fixed top-4 right-4 z-[100]">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 bg-zinc-800/90 backdrop-blur border border-zinc-700 rounded-full px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-all shadow-xl"
      >
        <Settings size={12} className="text-gold-500" />
        <span className="text-gold-400">DEMO</span>
        <span className="text-zinc-300">{current?.emoji} {current?.label}</span>
      </button>

      {open && (
        <div className="absolute top-10 right-0 bg-zinc-900 border border-zinc-700 rounded-2xl p-2 shadow-2xl min-w-[140px]">
          {phases.map(({ key, label, emoji }) => (
            <button
              key={key}
              onClick={() => { setPhase(key); setOpen(false) }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all ${
                phase === key
                  ? 'bg-gold-500/10 text-gold-400 border border-gold-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              <span>{emoji}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
