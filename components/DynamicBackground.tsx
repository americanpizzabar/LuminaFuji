'use client'

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
        }}
      />

      {/* Aurora mesh 3 — indigo bridge */}
      <div
        className="absolute"
        style={{
          top: '38%',
          left: '30%',
          width: '50%',
          height: '50%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 68%)',
          filter: 'blur(110px)',
          animation: 'orbDrift 30s ease-in-out infinite',
          animationDelay: '5s',
        }}
      />

      {/* Warm gold accent — keeps the Lumina Fuji signature alive */}
      <div
        className="absolute"
        style={{
          bottom: '22%',
          left: '18%',
          width: '42%',
          height: '36%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(251,191,36,0.05) 0%, transparent 70%)',
          filter: 'blur(70px)',
          animation: 'orbDrift 18s ease-in-out infinite',
          animationDelay: '6s',
        }}
      />

      {/* Fuji Mountain SVG silhouette */}
      <div className="absolute bottom-0 left-0 right-0" style={{ height: '38%' }}>
        <svg
          viewBox="0 0 430 170"
          preserveAspectRatio="none"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="fujiGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(199,210,254,0.10)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.012)" />
            </linearGradient>
            <linearGradient id="lakeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(34,211,238,0.06)" />
              <stop offset="100%" stopColor="rgba(99,102,241,0.015)" />
            </linearGradient>
          </defs>

          {/* Far ridge — very subtle */}
          <path
            d="M0,170 L0,130 L80,90 L130,110 L180,60 L215,20 L250,60 L310,100 L370,80 L430,100 L430,170 Z"
            fill="url(#fujiGrad)"
            opacity="0.55"
          />

          {/* Main Fuji cone */}
          <path
            d="M90,170 L165,80 L197,30 L215,8 L233,30 L265,80 L340,170 Z"
            fill="url(#fujiGrad)"
          />

          {/* Snow cap highlight */}
          <path
            d="M205,28 L215,8 L225,28 L215,23 Z"
            fill="rgba(255,255,255,0.20)"
          />

          {/* Left ridge */}
          <path
            d="M0,170 L0,148 L60,170 Z"
            fill="rgba(196,181,253,0.025)"
          />

          {/* Right ridge */}
          <path
            d="M430,170 L430,140 L370,170 Z"
            fill="rgba(165,243,252,0.025)"
          />

          {/* Lake — Yamanakako reflection */}
          <path
            d="M40,165 Q215,145 390,162 L390,170 L40,170 Z"
            fill="url(#lakeGrad)"
          />
        </svg>
      </div>

      {/* Horizon glow — aurora tint */}
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
          0% { opacity: 0.6; }
          50% { opacity: 0.92; }
          100% { opacity: 0.72; }
        }
      `}</style>
    </div>
  )
}
