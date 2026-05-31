'use client'

/**
 * 背景：マットブラックの宇宙に、キラキラ光る星々と、ゆらめくオーロラ（北極光）。
 * 旧富士山シルエットを廃し、ネオンバイオレット／シアン／ティールのオーロラカーテンに置換。
 */

// オーロラのカーテン（ゆらめく光の帯）
const RIBBONS = [
  { x: 4,  w: 130, c1: 'rgba(34,211,238,0.45)',  c2: 'rgba(139,92,246,0.30)', dur: 11, delay: 0 },
  { x: 18, w: 90,  c1: 'rgba(45,212,191,0.40)',  c2: 'rgba(34,211,238,0.25)', dur: 14, delay: 1.5 },
  { x: 33, w: 150, c1: 'rgba(139,92,246,0.42)',  c2: 'rgba(99,102,241,0.26)', dur: 9,  delay: 0.8 },
  { x: 50, w: 110, c1: 'rgba(34,211,238,0.40)',  c2: 'rgba(167,139,250,0.28)', dur: 13, delay: 2.2 },
  { x: 64, w: 140, c1: 'rgba(52,211,153,0.34)',  c2: 'rgba(34,211,238,0.24)', dur: 10, delay: 0.4 },
  { x: 78, w: 95,  c1: 'rgba(167,139,250,0.40)', c2: 'rgba(139,92,246,0.24)', dur: 15, delay: 1.1 },
  { x: 90, w: 120, c1: 'rgba(34,211,238,0.38)',  c2: 'rgba(124,58,237,0.24)', dur: 12, delay: 2.6 },
]

// キラキラした大きめのスパークル（4方向の光芒）
const SPARKLES = [
  { x: '16%', y: '22%', s: 14, d: 0 },
  { x: '74%', y: '16%', s: 18, d: 1.2 },
  { x: '86%', y: '40%', s: 12, d: 2.4 },
  { x: '28%', y: '46%', s: 11, d: 0.6 },
  { x: '60%', y: '30%', s: 13, d: 1.8 },
  { x: '46%', y: '12%', s: 10, d: 3 },
]

export default function DynamicBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden>
      {/* Deep matte-black base */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(165deg, #07060e 0%, #050509 45%, #06060c 72%, #050508 100%)',
        }}
      />

      {/* Star field */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(1px 1px at 12% 18%, rgba(255,255,255,0.65) 0%, transparent 100%),
            radial-gradient(1px 1px at 28% 7%, rgba(199,210,254,0.55) 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 44% 25%, rgba(255,255,255,0.70) 0%, transparent 100%),
            radial-gradient(1px 1px at 58% 12%, rgba(165,243,252,0.50) 0%, transparent 100%),
            radial-gradient(1px 1px at 72% 32%, rgba(255,255,255,0.55) 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 85% 9%, rgba(196,181,253,0.60) 0%, transparent 100%),
            radial-gradient(1px 1px at 93% 40%, rgba(255,255,255,0.40) 0%, transparent 100%),
            radial-gradient(1px 1px at 7% 52%, rgba(165,243,252,0.45) 0%, transparent 100%),
            radial-gradient(1px 1px at 21% 44%, rgba(255,255,255,0.35) 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 36% 58%, rgba(196,181,253,0.55) 0%, transparent 100%),
            radial-gradient(1px 1px at 64% 48%, rgba(255,255,255,0.40) 0%, transparent 100%),
            radial-gradient(1px 1px at 79% 55%, rgba(165,243,252,0.50) 0%, transparent 100%),
            radial-gradient(1px 1px at 17% 70%, rgba(255,255,255,0.30) 0%, transparent 100%),
            radial-gradient(1px 1px at 50% 65%, rgba(196,181,253,0.35) 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 88% 72%, rgba(255,255,255,0.45) 0%, transparent 100%)
          `,
          animation: 'starTwinkle 8s ease-in-out infinite alternate',
        }}
      />

      {/* Aurora mesh 1 — neon violet */}
      <div
        className="absolute animate-orb-drift"
        style={{
          top: '-18%',
          left: '-12%',
          width: '70%',
          height: '70%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, rgba(124,58,237,0.06) 45%, transparent 70%)',
          filter: 'blur(90px)',
          willChange: 'transform',
        }}
      />

      {/* Aurora mesh 2 — neon cyan */}
      <div
        className="absolute"
        style={{
          top: '8%',
          right: '-16%',
          width: '60%',
          height: '60%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(34,211,238,0.15) 0%, rgba(6,182,212,0.05) 45%, transparent 70%)',
          filter: 'blur(100px)',
          animation: 'orbDrift 26s ease-in-out infinite reverse',
          animationDelay: '3s',
          willChange: 'transform',
        }}
      />

      {/* ── Aurora borealis curtains (キラキラ光るオーロラ) ──────────── */}
      <div className="absolute bottom-0 left-0 right-0" style={{ height: '62%' }}>
        {RIBBONS.map((r, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              bottom: '-6%',
              left: `${r.x}%`,
              width: `${r.w}px`,
              height: '100%',
              background: `linear-gradient(to top, transparent 0%, ${r.c1} 38%, ${r.c2} 64%, transparent 100%)`,
              filter: 'blur(26px)',
              transformOrigin: 'bottom center',
              animation: `auroraSway ${r.dur}s ease-in-out ${r.delay}s infinite alternate`,
              mixBlendMode: 'screen',
              willChange: 'transform, opacity',
            }}
          />
        ))}
        {/* Horizon bloom under the curtains */}
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{
            height: '24%',
            background: 'linear-gradient(to top, rgba(34,211,238,0.12) 0%, rgba(139,92,246,0.06) 50%, transparent 100%)',
            filter: 'blur(16px)',
          }}
        />
      </div>

      {/* Sparkles — キラキラ */}
      {SPARKLES.map((sp, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: sp.x,
            top: sp.y,
            width: `${sp.s}px`,
            height: `${sp.s}px`,
            animation: `sparkleTwinkle ${3 + (i % 3)}s ease-in-out ${sp.d}s infinite`,
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                i % 2 === 0
                  ? 'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(34,211,238,0.4) 40%, transparent 70%)'
                  : 'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(196,181,253,0.4) 40%, transparent 70%)',
              borderRadius: '50%',
            }}
          />
          {/* 4-point star flare */}
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1.5px', transform: 'translateX(-50%)', background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.9), transparent)' }} />
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1.5px', transform: 'translateY(-50%)', background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.9), transparent)' }} />
        </div>
      ))}

      {/* Horizon glow line — aurora tint */}
      <div
        className="absolute left-0 right-0"
        style={{
          bottom: '30%',
          height: '1px',
          background:
            'linear-gradient(to right, transparent 0%, rgba(139,92,246,0.18) 30%, rgba(34,211,238,0.22) 50%, rgba(139,92,246,0.18) 70%, transparent 100%)',
        }}
      />

      {/* Top vignette */}
      <div
        className="absolute top-0 left-0 right-0"
        style={{
          height: '32%',
          background: 'linear-gradient(to bottom, rgba(5,5,8,0.75) 0%, transparent 100%)',
        }}
      />

      {/* Fine grain texture for a matte, premium finish */}
      <div
        className="absolute inset-0 opacity-[0.025] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <style>{`
        @keyframes starTwinkle {
          0%   { opacity: 0.55; }
          50%  { opacity: 0.90; }
          100% { opacity: 0.70; }
        }
        @keyframes auroraSway {
          0%   { transform: translate3d(-12px, 0, 0) scaleY(0.86); opacity: 0.28; }
          50%  { transform: translate3d(12px, 0, 0)  scaleY(1.14); opacity: 0.62; }
          100% { transform: translate3d(-5px, 0, 0)  scaleY(0.94); opacity: 0.36; }
        }
        @keyframes sparkleTwinkle {
          0%, 100% { opacity: 0; transform: scale3d(0.5, 0.5, 1) rotate(0deg); }
          50%       { opacity: 1; transform: scale3d(1.05, 1.05, 1) rotate(45deg); }
        }
      `}</style>
    </div>
  )
}
