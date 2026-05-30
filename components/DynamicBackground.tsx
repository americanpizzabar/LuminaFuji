'use client'

export default function DynamicBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden>
      {/* Deep space base */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(160deg, #04040c 0%, #030309 40%, #05050b 70%, #040408 100%)',
        }}
      />

      {/* Nebula orb 1 — indigo */}
      <div
        className="absolute animate-orb-drift"
        style={{
          top: '-15%',
          left: '-10%',
          width: '65%',
          height: '65%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />

      {/* Nebula orb 2 — violet */}
      <div
        className="absolute"
        style={{
          top: '15%',
          right: '-15%',
          width: '55%',
          height: '55%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.04) 0%, transparent 70%)',
          filter: 'blur(100px)',
          animationDelay: '3s',
          animation: 'orbDrift 24s ease-in-out infinite reverse',
        }}
      />

      {/* Nebula orb 3 — warm gold */}
      <div
        className="absolute"
        style={{
          bottom: '20%',
          left: '20%',
          width: '45%',
          height: '40%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(251,191,36,0.025) 0%, transparent 70%)',
          filter: 'blur(60px)',
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
              <stop offset="0%" stopColor="rgba(255,255,255,0.055)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.008)" />
            </linearGradient>
            <linearGradient id="lakeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(120,160,220,0.035)" />
              <stop offset="100%" stopColor="rgba(60,90,160,0.01)" />
            </linearGradient>
          </defs>

          {/* Far ridge — very subtle */}
          <path
            d="M0,170 L0,130 L80,90 L130,110 L180,60 L215,20 L250,60 L310,100 L370,80 L430,100 L430,170 Z"
            fill="url(#fujiGrad)"
            opacity="0.45"
          />

          {/* Main Fuji cone */}
          <path
            d="M90,170 L165,80 L197,30 L215,8 L233,30 L265,80 L340,170 Z"
            fill="url(#fujiGrad)"
          />

          {/* Snow cap highlight */}
          <path
            d="M205,28 L215,8 L225,28 L215,23 Z"
            fill="rgba(255,255,255,0.12)"
          />

          {/* Left ridge */}
          <path
            d="M0,170 L0,148 L60,170 Z"
            fill="rgba(255,255,255,0.018)"
          />

          {/* Right ridge */}
          <path
            d="M430,170 L430,140 L370,170 Z"
            fill="rgba(255,255,255,0.018)"
          />

          {/* Lake — Yamanakako reflection */}
          <path
            d="M40,165 Q215,145 390,162 L390,170 L40,170 Z"
            fill="url(#lakeGrad)"
          />
        </svg>
      </div>

      {/* Horizon glow */}
      <div
        className="absolute left-0 right-0"
        style={{
          bottom: '30%',
          height: '1px',
          background:
            'linear-gradient(to right, transparent 0%, rgba(255,255,255,0.03) 30%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.03) 70%, transparent 100%)',
        }}
      />

      {/* Top vignette */}
      <div
        className="absolute top-0 left-0 right-0"
        style={{
          height: '30%',
          background: 'linear-gradient(to bottom, rgba(3,3,8,0.7) 0%, transparent 100%)',
        }}
      />
    </div>
  )
}
