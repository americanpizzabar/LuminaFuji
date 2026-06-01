'use client'

/**
 * インタラクティブ平面図コントロール。
 * 金線描きの建築図面風 SVG。タップでゾーン選択、照明状態をリアルタイムで視覚化。
 */

import { motion } from 'framer-motion'
import { Zone } from '@/lib/lighting'
import { hapticTap } from '@/lib/haptics'

const ROOMS = [
  { id:'living',   d:'M12,12 L184,12 L184,154 L12,154 Z',   cx:98,  cy:83,  ja:'リビング',  en:'LIVING ROOM' },
  { id:'bedroom',  d:'M189,12 L290,12 L290,90 L189,90 Z',   cx:239, cy:51,  ja:'寝室',       en:'BEDROOM' },
  { id:'bathroom', d:'M189,95 L290,95 L290,154 L189,154 Z', cx:239, cy:124, ja:'バスルーム', en:'BATHROOM' },
  { id:'entrance', d:'M12,159 L94,159 L94,190 L12,190 Z',   cx:53,  cy:175, ja:'玄関',       en:'ENTRANCE' },
] as const

interface FloorPlanProps {
  zones:           Zone[]
  selectedZoneId:  string | null
  onSelect:        (id: string) => void
}

export default function FloorPlan({ zones, selectedZoneId, onSelect }: FloorPlanProps) {
  const get = (id: string) => zones.find(z => z.id === id)

  const handle = (id: string) => {
    hapticTap()
    onSelect(id)
  }

  return (
    <div className="rounded-3xl overflow-hidden"
         style={{ background:'rgba(255,255,255,0.016)', border:'1px solid rgba(255,157,92,0.1)' }}>

      {/* Label */}
      <div className="px-4 pt-4 pb-1 flex items-center justify-between">
        <p className="text-[11px] tracking-[0.22em] uppercase" style={{ color:'rgba(255,184,119,0.45)' }}>
          Floor Plan
        </p>
        <p className="text-[10px] text-zinc-700">タップでエリア選択</p>
      </div>

      {/* SVG plan */}
      <svg viewBox="0 0 302 202" className="w-full" style={{ display:'block' }}>

        {ROOMS.map(room => {
          const z    = get(room.id)
          const isOn = z?.isOn ?? false
          const bri  = (z?.brightness ?? 0) / 100
          const isSel = selectedZoneId === room.id

          const r = 255
          const g = Math.round(128 + 69 * bri)
          const b = Math.round(46  + 97 * bri)
          const fillA   = isOn ? 0.04 + bri * 0.18 : 0
          const strokeA = isSel ? 0.82 : isOn ? 0.14 + bri * 0.32 : 0.1

          return (
            <g key={room.id} onClick={() => handle(room.id)} style={{ cursor:'pointer' }}>
              {/* Room fill — CSS transition for smooth color morph */}
              <path d={room.d}
                style={{
                  fill:        `rgba(${r},${g},${b},${fillA})`,
                  stroke:      `rgba(255,184,119,${strokeA})`,
                  strokeWidth: isSel ? 1.1 : 0.65,
                  transition:  'fill 0.9s ease, stroke 0.7s ease, stroke-width 0.3s ease',
                }}
              />

              {/* Selection pulse ring */}
              {isSel && (
                <motion.path d={room.d} fill="none"
                  stroke="rgba(255,184,119,0.52)" strokeWidth="2.2"
                  animate={{ opacity:[0.35, 0.88, 0.35] }}
                  transition={{ duration:1.6, repeat:Infinity }}
                />
              )}

              {/* Breathing glow dot when zone is ON */}
              {isOn && (
                <motion.circle cx={room.cx} cy={room.cy - 13} r={2.2}
                  fill={`rgba(${r},${g},${b},0.95)`}
                  animate={{ opacity:[0.6, 1, 0.6], r:[1.8, 2.6, 1.8] }}
                  transition={{ duration:2.8, repeat:Infinity, ease:'easeInOut' }}
                />
              )}

              {/* Room label */}
              <text x={room.cx} y={room.cy + 2} textAnchor="middle" dominantBaseline="middle"
                fill={isOn
                  ? `rgba(255,${Math.round(175 + 40 * bri)},${Math.round(100 + 60 * bri)},0.88)`
                  : 'rgba(255,255,255,0.22)'}
                style={{ fontSize:'7.5px', fontFamily:'system-ui,sans-serif', letterSpacing:'0.08em',
                         transition:'fill 0.9s ease' }}>
                {room.ja}
              </text>
              <text x={room.cx} y={room.cy + 13} textAnchor="middle" dominantBaseline="middle"
                fill={isOn ? 'rgba(255,184,119,0.28)' : 'rgba(255,255,255,0.1)'}
                style={{ fontSize:'4.8px', fontFamily:'system-ui,sans-serif', letterSpacing:'0.15em',
                         transition:'fill 0.9s ease' }}>
                {room.en}
              </text>
            </g>
          )
        })}

        {/* Architectural wall dividers */}
        <line x1="187" y1="12"  x2="187" y2="154" stroke="rgba(255,184,119,0.12)" strokeWidth="0.7" />
        <line x1="189" y1="93"  x2="290" y2="93"  stroke="rgba(255,184,119,0.12)" strokeWidth="0.7" />
        <line x1="12"  y1="157" x2="94"  y2="157" stroke="rgba(255,184,119,0.12)" strokeWidth="0.7" />
        <line x1="94"  y1="157" x2="94"  y2="190" stroke="rgba(255,184,119,0.12)" strokeWidth="0.7" />

        {/* North indicator */}
        <text x="291" y="195" textAnchor="end" dominantBaseline="auto"
          fill="rgba(255,184,119,0.18)"
          style={{ fontSize:'5px', fontFamily:'system-ui,sans-serif', letterSpacing:'0.1em' }}>
          N↑
        </text>
      </svg>

      {/* Zone status dots */}
      <div className="px-4 pb-4 flex gap-2">
        {ROOMS.map(room => {
          const z    = get(room.id)
          const isOn = z?.isOn ?? false
          const isSel = selectedZoneId === room.id
          return (
            <button key={room.id} onClick={() => handle(room.id)}
              className="flex-1 py-1.5 rounded-xl text-center text-[10px] transition-all"
              style={{
                background: isSel ? 'rgba(255,157,92,0.1)'  : 'rgba(255,255,255,0.03)',
                border:     isSel ? '1px solid rgba(255,157,92,0.28)' : '1px solid rgba(255,255,255,0.06)',
                color: isOn ? '#ffb877' : '#3f3f46',
                transition: 'all 0.3s ease',
              }}>
              {isOn ? '●' : '○'}
            </button>
          )
        })}
      </div>
    </div>
  )
}
