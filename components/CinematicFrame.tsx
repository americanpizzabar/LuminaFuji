'use client'

/**
 * シネマティック・フレーム。
 * SVG feTurbulence + SMIL でリアルなフィルムグレイン（毎フレーム seed 変化）、
 * 広角ビネット、ゆっくり動くウォームレンズブルームを重ねる。
 * DynamicBackground の上に乗り、映画のような画質感を与える。
 */

import { useStore } from '@/lib/useStore'
import { expOf } from '@/lib/store'

export default function CinematicFrame() {
  const [store] = useStore()
  if (!expOf(store).cinematicFrame) return null
  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: -8 }} aria-hidden>

      {/* Film grain — SVG feTurbulence with animated seed for true per-frame noise */}
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        style={{ opacity: 0.03 }}
      >
        <defs>
          <filter id="lf-grain" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.72"
              numOctaves="4"
              stitchTiles="stitch"
            >
              {/* Cycle seed 8 times over 0.32s → ~25fps grain flicker */}
              <animate
                attributeName="seed"
                values="0;1;2;3;4;5;6;7;0"
                dur="0.32s"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>
        <rect width="100%" height="100%" filter="url(#lf-grain)" />
      </svg>

      {/* Lens vignette — natural barrel-distortion falloff */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 108% 108% at 50% 50%, transparent 46%, rgba(0,0,0,0.52) 100%)',
        }}
      />

      {/* Warm lens bloom — ultra-slow drift mimics handheld sunlight */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 52% 42% at 56% 26%, rgba(255,198,110,0.014) 0%, transparent 70%)',
          animation: 'lfLensDrift 16s ease-in-out infinite',
        }}
      />

      {/* Chromatic aberration fringe — extremely subtle, corners only */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 100% 100% at 0% 0%,   rgba(255,60,20,0.012) 0%, transparent 30%), ' +
            'radial-gradient(ellipse 100% 100% at 100% 100%, rgba(20,80,255,0.009) 0%, transparent 25%)',
        }}
      />
    </div>
  )
}
