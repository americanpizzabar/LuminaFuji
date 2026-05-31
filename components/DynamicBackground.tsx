'use client'

export default function DynamicBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden>
      {/* Deep space base */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(160deg, #04040e 0%, #03030a 40%, #05050c 70%, #040409 100%)',
        }}
      />

      {/* Star field */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(1px 1px at 12% 18%, rgba(255,255,255,0.65) 0%, transparent 100%),
            radial-gradient(1px 1px at 28% 7%, rgba(255,255,255,0.50) 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 44% 25%, rgba(255,255,255,0.70) 0%, transparent 100%),
            radial-gradient(1px 1px at 58% 12%, rgba(255,255,255,0.45) 0%, transparent 100%),
            radial-gradient(1px 1px at 72% 32%, rgba(255,255,255,0.55) 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 85% 9%, rgba(255,255,255,0.60) 0%, transparent 100%),
            radial-gradient(1px 1px at 93% 40%, rgba(255,255,255,0.40) 0%, transparent 100%),
            radial-gradient(1px 1px at 7% 52%, rgba(255,255,255,0.45) 0%, transparent 100%),
            radial-gradient(1px 1px at 21% 44%, rgba(255,255,255,0.35) 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 36% 58%, rgba(255,255,255,0.55) 0%, transparent 100%),
            radial-gradient(1px 1px at 64% 48%, rgba(255,255,255,0.40) 0%, transparent 100%),
            radial-gradient(1px 1px at 79% 55%, rgba(255,255,255,0.50) 0%, transparent 100%),
            radial-gradient(1px 1px at 17% 70%, rgba(255,255,255,0.30) 0%, transparent 100%),
            radial-gradient(1px 1px at 50% 65%, rgba(255,255,255,0.35) 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 88% 72%, rgba(255,255,255,0.45) 0%, transparent 100%)
          `,
          animation: 'starTwinkle 8s ease-in-out infinite alternate',
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
          background: 'radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 70%)',
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
          background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)',
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
          background: 'radial-gradient(circle, rgba(251,191,36,0.055) 0%, transparent 70%)',
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
              <stop offset="0%" stopColor="rgba(255,255,255,0.08)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.012)" />
            </linearGradient>
            <linearGradient id="lakeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(120,160,220,0.055)" />
              <stop offset="100%" stopColor="rgba(60,90,160,0.015)" />
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
            fill="rgba(255,255,255,0.18)"
          />

          {/* Left ridge */}
          <path
            d="M0,170 L0,148 L60,170 Z"
            fill="rgba(255,255,255,0.025)"
          />

          {/* Right ridge */}
          <path
            d="M430,170 L430,140 L370,170 Z"
            fill="rgba(255,255,255,0.025)"
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
            'linear-gradient(to right, transparent 0%, rgba(255,255,255,0.05) 30%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.05) 70%, transparent 100%)',
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

      <style>{`
        @keyframes starTwinkle {
          0% { opacity: 0.6; }
          50% { opacity: 0.9; }
          100% { opacity: 0.7; }
        }
      `}</style>
    </div>
  )
}
