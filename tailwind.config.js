/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          300: '#fde68a',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        // ── OLED warm accent (2700–3000K アンバー / キャンドルゴールド) ──
        // 有機ELが放つ最も美しい暖色。文字やボタンが部屋の灯りの一部のように発光する。
        ember: {
          200: '#ffe3c2',
          300: '#ffd1a3',
          400: '#ffb877', // ≈ 3000K warm white
          500: '#ff9d5c', // ≈ 2700K
          600: '#f5853f', // candle
        },
        // ── 漆黒（輪島塗のような奥行きのある温かいマットブラック） ──
        lacquer: {
          950: '#0a0807',
          900: '#0d0a08',
          800: '#12100d',
          700: '#1a1714',
        },
        // ── Neon violet (primary futuristic accent) ──────────────
        violet: {
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
        },
        // ── Neon cyan (secondary futuristic accent) ──────────────
        cyan: {
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['var(--font-noto-serif)', 'ui-serif', 'Georgia', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'breathe': 'breathe 3s ease-in-out infinite',
        'float': 'floatGently 6s ease-in-out infinite',
        'ambient': 'ambientPulse 4s ease-in-out infinite',
        'shimmer-gold': 'shimmerGold 3s linear infinite',
        'orb-drift': 'orbDrift 20s ease-in-out infinite',
        'aurora-shift': 'auroraShift 8s linear infinite',
        'aurora-drift': 'auroraDrift 22s ease-in-out infinite',
        'ember-pulse': 'emberPulse 4s ease-in-out infinite',
        'curtain-reveal': 'curtainReveal 0.62s cubic-bezier(0.22,1,0.36,1) both',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 8px rgba(139, 92, 246, 0.3)' },
          '50%': { boxShadow: '0 0 24px rgba(139, 92, 246, 0.6)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.8' },
          '50%': { transform: 'scale(1.1)', opacity: '1' },
        },
        floatGently: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        ambientPulse: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.7' },
        },
        shimmerGold: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        orbDrift: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(3%, 2%) scale(1.05)' },
          '66%': { transform: 'translate(-2%, -3%) scale(0.97)' },
        },
        auroraShift: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        auroraDrift: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)', opacity: '0.55' },
          '50%': { transform: 'translate(-3%, 2%) scale(1.08)', opacity: '0.8' },
        },
        // OLED の暖色がゆっくり明滅する（部屋の灯りのような呼吸）
        emberPulse: {
          '0%, 100%': { opacity: '0.55', filter: 'brightness(0.92)' },
          '50%': { opacity: '1', filter: 'brightness(1.12)' },
        },
        // シアタールームのカーテンが静かに開くような画面遷移
        curtainReveal: {
          '0%': { opacity: '0', transform: 'translate3d(0, 10px, 0) scale(0.99)' },
          '100%': { opacity: '1', transform: 'none' },
        },
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #d97706 0%, #fbbf24 50%, #d97706 100%)',
        'dark-gradient': 'linear-gradient(180deg, #030306 0%, #050509 100%)',
        'aurora': 'linear-gradient(120deg, #8b5cf6 0%, #6366f1 35%, #22d3ee 100%)',
        'aurora-violet': 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 50%, #7c3aed 100%)',
        'aurora-cyan': 'linear-gradient(135deg, #67e8f9 0%, #22d3ee 50%, #06b6d4 100%)',
      },
      boxShadow: {
        'gold': '0 0 20px rgba(251, 191, 36, 0.2)',
        'gold-lg': '0 0 40px rgba(251, 191, 36, 0.3)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        'island': '0 12px 48px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
        'hero': '0 4px 24px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
        // ── Soft 3D depth (Apple-keynote layered shadows) ────────
        'soft': '0 1px 2px rgba(0,0,0,0.4), 0 6px 16px -4px rgba(0,0,0,0.4)',
        'soft-lg': '0 2px 4px rgba(0,0,0,0.4), 0 16px 40px -12px rgba(0,0,0,0.55)',
        'card-3d': '0 1px 0 rgba(255,255,255,0.07) inset, 0 10px 30px -10px rgba(0,0,0,0.75), 0 4px 12px rgba(0,0,0,0.35)',
        // ── Neon glows ───────────────────────────────────────────
        'neon-violet': '0 0 20px rgba(139,92,246,0.45), 0 0 50px rgba(139,92,246,0.18)',
        'neon-cyan': '0 0 20px rgba(34,211,238,0.45), 0 0 50px rgba(34,211,238,0.18)',
        'neon-aurora': '0 0 24px rgba(139,92,246,0.35), 0 0 48px rgba(34,211,238,0.22)',
      },
      backdropBlur: {
        xs: '4px',
        '2xl': '40px',
        '3xl': '64px',
      },
      scale: {
        '98': '0.98',
      },
    },
  },
  plugins: [],
}
