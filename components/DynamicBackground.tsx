'use client'

import { useEffect, useState } from 'react'

/**
 * 時間帯で表情が変わる背景。
 *   朝   (5–10時)  : 昇る陽・光の筋・舞い上がる光の粒
 *   昼間 (10–17時) : 澄んだ空・回るゴッドレイ・流れる雲
 *   夕暮 (17–20時) : 沈む夕陽・温かな地平線・漂う残り火
 *   夜   (20–5時)  : オーロラ（ランダムに揺らめく光のカーテン）+ 星
 * いずれも文字可読性のためベースは暗いまま、アクセント色だけを変える。
 */

type TimeOfDay = 'morning' | 'day' | 'dusk' | 'night'

function getTimeOfDay(h: number): TimeOfDay {
  if (h >= 5 && h < 10) return 'morning'
  if (h >= 10 && h < 17) return 'day'
  if (h >= 17 && h < 20) return 'dusk'
  return 'night'
}

// ── 夜：オーロラのカーテン（4種の閉ループ軌道でランダム感を出す） ──────────
const AURORA_RIBBONS = [
  { x: 4,  w: 130, c1: 'rgba(34,211,238,0.45)',  c2: 'rgba(139,92,246,0.30)',  v: 'A', dur: 17,   delay: -2.0 },
  { x: 18, w: 90,  c1: 'rgba(45,212,191,0.40)',  c2: 'rgba(34,211,238,0.25)',  v: 'B', dur: 21,   delay: -7.5 },
  { x: 33, w: 150, c1: 'rgba(139,92,246,0.42)',  c2: 'rgba(99,102,241,0.26)',  v: 'C', dur: 15.5, delay: -3.0 },
  { x: 50, w: 110, c1: 'rgba(34,211,238,0.40)',  c2: 'rgba(167,139,250,0.28)', v: 'D', dur: 23,   delay: -11.0 },
  { x: 64, w: 140, c1: 'rgba(52,211,153,0.34)',  c2: 'rgba(34,211,238,0.24)',  v: 'B', dur: 19,   delay: -1.0 },
  { x: 78, w: 95,  c1: 'rgba(167,139,250,0.40)', c2: 'rgba(139,92,246,0.24)',  v: 'A', dur: 25,   delay: -9.0 },
  { x: 90, w: 120, c1: 'rgba(34,211,238,0.38)',  c2: 'rgba(124,58,237,0.24)',  v: 'C', dur: 18.5, delay: -5.5 },
]

const NIGHT_SPARKLES = [
  { x: '16%', y: '22%', s: 14, d: 0,   color: 'rgba(34,211,238,0.4)' },
  { x: '74%', y: '16%', s: 18, d: 1.2, color: 'rgba(196,181,253,0.4)' },
  { x: '86%', y: '40%', s: 12, d: 2.4, color: 'rgba(34,211,238,0.4)' },
  { x: '28%', y: '46%', s: 11, d: 0.6, color: 'rgba(196,181,253,0.4)' },
  { x: '60%', y: '30%', s: 13, d: 1.8, color: 'rgba(34,211,238,0.4)' },
  { x: '46%', y: '12%', s: 10, d: 3.0, color: 'rgba(196,181,253,0.4)' },
]

const NIGHT_STARS = `
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
`

// ── 朝：光の筋と舞い上がる粒 ──────────────────────────────────────────────
const MORNING_RAYS = [-42, -24, -8, 8, 24, 42]
const MORNING_MOTES = [
  { x: '18%', y: '6%',  s: 5, dur: 13, delay: 0,   v: 'a' },
  { x: '30%', y: '3%',  s: 4, dur: 16, delay: 2,   v: 'b' },
  { x: '44%', y: '10%', s: 6, dur: 14, delay: 1,   v: 'a' },
  { x: '56%', y: '4%',  s: 4, dur: 18, delay: 3,   v: 'b' },
  { x: '67%', y: '9%',  s: 5, dur: 15, delay: 0.5, v: 'a' },
  { x: '79%', y: '5%',  s: 4, dur: 17, delay: 2.5, v: 'b' },
  { x: '24%', y: '14%', s: 3, dur: 19, delay: 1.5, v: 'a' },
  { x: '72%', y: '13%', s: 5, dur: 12, delay: 3.5, v: 'b' },
]

// ── 昼間：ゴッドレイと流れる雲 ────────────────────────────────────────────
const DAY_RAYS = [-30, -16, -4, 8, 20, 34]
const DAY_CLOUDS = [
  { y: '14%', w: '42%', h: '12%', dur: 58, delay: 0 },
  { y: '30%', w: '34%', h: '9%',  dur: 84, delay: -28 },
  { y: '7%',  w: '52%', h: '14%', dur: 98, delay: -54 },
]
const DAY_SPARKLES = [
  { x: '68%', y: '14%', s: 11, d: 0,   color: 'rgba(165,243,252,0.5)' },
  { x: '81%', y: '8%',  s: 8,  d: 1.2, color: 'rgba(255,255,255,0.5)' },
  { x: '74%', y: '24%', s: 7,  d: 2.4, color: 'rgba(56,189,248,0.5)' },
]

// ── 夕暮れ：沈む夕陽と残り火 ──────────────────────────────────────────────
const DUSK_EMBERS = [
  { x: '20%', y: '4%',  s: 5, dur: 14, delay: 0   },
  { x: '34%', y: '8%',  s: 4, dur: 17, delay: 2.5 },
  { x: '48%', y: '3%',  s: 6, dur: 13, delay: 1   },
  { x: '60%', y: '9%',  s: 4, dur: 19, delay: 3.5 },
  { x: '72%', y: '5%',  s: 5, dur: 15, delay: 0.8 },
  { x: '82%', y: '10%', s: 4, dur: 16, delay: 2   },
  { x: '28%', y: '12%', s: 3, dur: 20, delay: 1.5 },
  { x: '66%', y: '14%', s: 5, dur: 12, delay: 3   },
]
const DUSK_STARS = `
  radial-gradient(1px 1px at 22% 12%, rgba(255,255,255,0.45) 0%, transparent 100%),
  radial-gradient(1px 1px at 48% 8%, rgba(196,181,253,0.40) 0%, transparent 100%),
  radial-gradient(1.5px 1.5px at 70% 14%, rgba(255,255,255,0.40) 0%, transparent 100%),
  radial-gradient(1px 1px at 86% 9%, rgba(165,243,252,0.35) 0%, transparent 100%),
  radial-gradient(1px 1px at 34% 20%, rgba(255,255,255,0.28) 0%, transparent 100%),
  radial-gradient(1px 1px at 60% 22%, rgba(196,181,253,0.30) 0%, transparent 100%)
`

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"

// ── 共通スパークル ────────────────────────────────────────────────────────
function Sparkle({ x, y, size, dur, delay, color }: { x: string; y: string; size: number; dur: number; delay: number; color: string }) {
  return (
    <div
      className="absolute"
      style={{ left: x, top: y, width: `${size}px`, height: `${size}px`, animation: `sparkleTwinkle ${dur}s ease-in-out ${delay}s infinite` }}
    >
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle, rgba(255,255,255,0.95) 0%, ${color} 40%, transparent 70%)`, borderRadius: '50%' }} />
      <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1.5px', transform: 'translateX(-50%)', background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.9), transparent)' }} />
      <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1.5px', transform: 'translateY(-50%)', background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.9), transparent)' }} />
    </div>
  )
}

// ── 夜シーン ──────────────────────────────────────────────────────────────
function NightScene() {
  return (
    <>
      <div className="absolute inset-0" style={{ background: 'linear-gradient(165deg, #07060e 0%, #050509 45%, #06060c 72%, #050508 100%)' }} />

      {/* 星 */}
      <div className="absolute inset-0" style={{ backgroundImage: NIGHT_STARS, animation: 'starTwinkle 8s ease-in-out infinite alternate' }} />

      {/* ネオンのメッシュ光球 */}
      <div className="absolute animate-orb-drift" style={{ top: '-18%', left: '-12%', width: '70%', height: '70%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, rgba(124,58,237,0.06) 45%, transparent 70%)', filter: 'blur(90px)', willChange: 'transform' }} />
      <div className="absolute" style={{ top: '8%', right: '-16%', width: '60%', height: '60%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,211,238,0.15) 0%, rgba(6,182,212,0.05) 45%, transparent 70%)', filter: 'blur(100px)', animation: 'orbDrift 26s ease-in-out infinite reverse', animationDelay: '3s', willChange: 'transform' }} />

      {/* オーロラのカーテン */}
      <div className="absolute bottom-0 left-0 right-0" style={{ height: '62%' }}>
        {AURORA_RIBBONS.map((r, i) => (
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
              animation: `aurora${r.v} ${r.dur}s ease-in-out ${r.delay}s infinite`,
              mixBlendMode: 'screen',
              willChange: 'transform, opacity',
            }}
          />
        ))}
        <div className="absolute bottom-0 left-0 right-0" style={{ height: '24%', background: 'linear-gradient(to top, rgba(34,211,238,0.12) 0%, rgba(139,92,246,0.06) 50%, transparent 100%)', filter: 'blur(16px)' }} />
      </div>

      {NIGHT_SPARKLES.map((sp, i) => (
        <Sparkle key={i} x={sp.x} y={sp.y} size={sp.s} dur={3 + (i % 3)} delay={sp.d} color={sp.color} />
      ))}

      <div className="absolute left-0 right-0" style={{ bottom: '30%', height: '1px', background: 'linear-gradient(to right, transparent 0%, rgba(139,92,246,0.18) 30%, rgba(34,211,238,0.22) 50%, rgba(139,92,246,0.18) 70%, transparent 100%)' }} />
    </>
  )
}

// ── 朝シーン ──────────────────────────────────────────────────────────────
function MorningScene() {
  return (
    <>
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #0a0812 0%, #0d0910 48%, #1d1014 100%)' }} />
      <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(120% 80% at 82% -10%, rgba(139,92,246,0.06) 0%, transparent 55%)' }} />

      {/* 昇る陽のグロー */}
      <div className="absolute left-1/2" style={{ bottom: '-20%', width: '130%', height: '72%', transform: 'translateX(-50%)', background: 'radial-gradient(ellipse at 50% 100%, rgba(251,191,36,0.30) 0%, rgba(251,113,133,0.16) 36%, transparent 70%)', filter: 'blur(22px)', willChange: 'transform, opacity', animation: 'sunRise 9s ease-in-out infinite' }} />

      {/* 光の筋（ゆるやかに揺れる） */}
      <div className="absolute left-1/2 bottom-0" style={{ width: 0, height: 0, willChange: 'transform', animation: 'raySway 13s ease-in-out infinite' }}>
        {MORNING_RAYS.map((deg, i) => (
          <div key={i} style={{ position: 'absolute', bottom: 0, left: '-7px', width: '14px', height: '92vh', transformOrigin: 'bottom center', transform: `rotate(${deg}deg)`, background: 'linear-gradient(to top, rgba(251,191,36,0.16) 0%, rgba(251,191,36,0.04) 42%, transparent 76%)', filter: 'blur(8px)', animation: `rayGlow ${5 + i}s ease-in-out ${i * 0.4}s infinite` }} />
        ))}
      </div>

      {/* 舞い上がる光の粒 */}
      {MORNING_MOTES.map((m, i) => (
        <div key={i} className="absolute rounded-full" style={{ left: m.x, bottom: m.y, width: `${m.s}px`, height: `${m.s}px`, background: 'radial-gradient(circle, rgba(255,236,200,0.9) 0%, rgba(251,191,36,0.3) 50%, transparent 70%)', willChange: 'transform, opacity', animation: `floatUp${m.v === 'b' ? '2' : ''} ${m.dur}s ease-in-out ${m.delay}s infinite` }} />
      ))}

      <div className="absolute bottom-0 left-0 right-0" style={{ height: '22%', background: 'linear-gradient(to top, rgba(251,146,60,0.14) 0%, rgba(251,113,133,0.05) 60%, transparent 100%)', filter: 'blur(8px)' }} />
    </>
  )
}

// ── 昼間シーン ────────────────────────────────────────────────────────────
function DayScene() {
  return (
    <>
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #091017 0%, #0a0e15 55%, #070a10 100%)' }} />
      <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(120% 90% at 50% -20%, rgba(56,189,248,0.12) 0%, rgba(34,211,238,0.05) 40%, transparent 70%)' }} />

      {/* 太陽のブルーム */}
      <div className="absolute" style={{ top: '-12%', left: '56%', width: '52%', height: '58%', background: 'radial-gradient(circle, rgba(255,255,255,0.22) 0%, rgba(34,211,238,0.12) 40%, transparent 70%)', filter: 'blur(14px)', willChange: 'transform, opacity', animation: 'sunPulse 7s ease-in-out infinite' }} />

      {/* ゴッドレイ（ゆっくり回転） */}
      <div className="absolute" style={{ top: '2%', left: '70%', width: 0, height: 0, willChange: 'transform', animation: 'rayRotate 72s linear infinite' }}>
        {DAY_RAYS.map((deg, i) => (
          <div key={i} style={{ position: 'absolute', top: 0, left: '-9px', width: '18px', height: '125vh', transformOrigin: 'top center', transform: `rotate(${deg}deg)`, background: 'linear-gradient(to bottom, rgba(165,243,252,0.12) 0%, rgba(34,211,238,0.03) 45%, transparent 75%)', filter: 'blur(7px)' }} />
        ))}
      </div>

      {/* 流れる雲 */}
      {DAY_CLOUDS.map((c, i) => (
        <div key={i} className="absolute rounded-full" style={{ top: c.y, left: 0, width: c.w, height: c.h, background: 'radial-gradient(ellipse, rgba(226,232,240,0.10) 0%, rgba(203,213,225,0.05) 50%, transparent 75%)', filter: 'blur(18px)', willChange: 'transform', animation: `cloudDrift ${c.dur}s linear ${c.delay}s infinite` }} />
      ))}

      {DAY_SPARKLES.map((sp, i) => (
        <Sparkle key={i} x={sp.x} y={sp.y} size={sp.s} dur={3 + (i % 3)} delay={sp.d} color={sp.color} />
      ))}
    </>
  )
}

// ── 夕暮れシーン ──────────────────────────────────────────────────────────
function DuskScene() {
  return (
    <>
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #0b0a14 0%, #140b15 45%, #2a1016 100%)' }} />
      <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(120% 80% at 50% -10%, rgba(99,102,241,0.10) 0%, transparent 55%)' }} />

      {/* 早い星 */}
      <div className="absolute inset-0" style={{ backgroundImage: DUSK_STARS, animation: 'starTwinkle 9s ease-in-out infinite alternate' }} />

      {/* 沈む夕陽 */}
      <div className="absolute left-1/2" style={{ bottom: '-8%', width: '64%', height: '46%', transform: 'translateX(-50%)', background: 'radial-gradient(ellipse at 50% 100%, rgba(251,146,60,0.42) 0%, rgba(244,63,94,0.20) 40%, transparent 72%)', filter: 'blur(10px)', willChange: 'transform, opacity', animation: 'sunSink 11s ease-in-out infinite alternate' }} />

      {/* 温かな地平線（ゆらめき） */}
      <div className="absolute bottom-0 left-0 right-0" style={{ height: '30%', background: 'linear-gradient(to top, rgba(244,63,94,0.20) 0%, rgba(251,146,60,0.12) 40%, rgba(167,139,250,0.05) 70%, transparent 100%)', filter: 'blur(8px)', willChange: 'opacity', animation: 'bandShimmer 8s ease-in-out infinite' }} />

      {/* 漂う残り火 */}
      {DUSK_EMBERS.map((m, i) => (
        <div key={i} className="absolute rounded-full" style={{ left: m.x, bottom: m.y, width: `${m.s}px`, height: `${m.s}px`, background: 'radial-gradient(circle, rgba(255,200,150,0.9) 0%, rgba(251,146,60,0.4) 50%, transparent 70%)', willChange: 'transform, opacity', animation: `emberFloat ${m.dur}s ease-in-out ${m.delay}s infinite` }} />
      ))}
    </>
  )
}

export default function DynamicBackground() {
  const [tod, setTod] = useState<TimeOfDay>('night')

  useEffect(() => {
    const update = () => setTod(getTimeOfDay(new Date().getHours()))
    update()
    const id = setInterval(update, 60_000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden>
      <div key={tod} className="absolute inset-0" style={{ animation: 'bgFadeIn 1.4s ease both' }}>
        {tod === 'morning' && <MorningScene />}
        {tod === 'day' && <DayScene />}
        {tod === 'dusk' && <DuskScene />}
        {tod === 'night' && <NightScene />}
      </div>

      {/* 全シーン共通：上部ビネット（可読性）＋微粒子テクスチャ */}
      <div className="absolute top-0 left-0 right-0" style={{ height: '32%', background: 'linear-gradient(to bottom, rgba(5,5,8,0.7) 0%, transparent 100%)' }} />
      <div className="absolute inset-0 opacity-[0.025] mix-blend-overlay" style={{ backgroundImage: GRAIN }} />

      <style>{`
        @keyframes bgFadeIn { from { opacity: 0; } to { opacity: 1; } }

        @keyframes starTwinkle {
          0%   { opacity: 0.55; }
          50%  { opacity: 0.90; }
          100% { opacity: 0.70; }
        }
        @keyframes sparkleTwinkle {
          0%, 100% { opacity: 0; transform: scale3d(0.5, 0.5, 1) rotate(0deg); }
          50%       { opacity: 1; transform: scale3d(1.05, 1.05, 1) rotate(45deg); }
        }

        /* 夜：オーロラ — 始点=終点の閉ループで、各帯が別軌道・別周期に揺れて単調さを消す */
        @keyframes auroraA {
          0%   { transform: translate3d(-12px, 0, 0) scaleY(0.88); opacity: 0.30; }
          22%  { transform: translate3d(5px, -3px, 0) scaleY(1.10); opacity: 0.55; }
          48%  { transform: translate3d(13px, 0, 0) scaleY(0.94); opacity: 0.40; }
          74%  { transform: translate3d(0px, -2px, 0) scaleY(1.14); opacity: 0.62; }
          100% { transform: translate3d(-12px, 0, 0) scaleY(0.88); opacity: 0.30; }
        }
        @keyframes auroraB {
          0%   { transform: translate3d(10px, 0, 0) scaleY(1.06); opacity: 0.50; }
          30%  { transform: translate3d(-6px, -2px, 0) scaleY(0.92); opacity: 0.32; }
          55%  { transform: translate3d(-14px, 0, 0) scaleY(1.12); opacity: 0.58; }
          80%  { transform: translate3d(-2px, -3px, 0) scaleY(0.96); opacity: 0.38; }
          100% { transform: translate3d(10px, 0, 0) scaleY(1.06); opacity: 0.50; }
        }
        @keyframes auroraC {
          0%   { transform: translate3d(-6px, 0, 0) scaleY(1.00); opacity: 0.42; }
          20%  { transform: translate3d(12px, -1px, 0) scaleY(1.16); opacity: 0.60; }
          46%  { transform: translate3d(4px, 0, 0) scaleY(0.90); opacity: 0.34; }
          72%  { transform: translate3d(-12px, -2px, 0) scaleY(1.08); opacity: 0.56; }
          100% { transform: translate3d(-6px, 0, 0) scaleY(1.00); opacity: 0.42; }
        }
        @keyframes auroraD {
          0%   { transform: translate3d(8px, 0, 0) scaleY(0.94); opacity: 0.36; }
          26%  { transform: translate3d(-10px, -3px, 0) scaleY(1.12); opacity: 0.58; }
          52%  { transform: translate3d(-3px, 0, 0) scaleY(0.98); opacity: 0.40; }
          78%  { transform: translate3d(11px, -1px, 0) scaleY(1.06); opacity: 0.54; }
          100% { transform: translate3d(8px, 0, 0) scaleY(0.94); opacity: 0.36; }
        }
        @keyframes orbDrift {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          33%       { transform: translate3d(2%, 2%, 0) scale(1.04); }
          66%       { transform: translate3d(-2%, -3%, 0) scale(0.96); }
        }
        .animate-orb-drift { animation: orbDrift 22s ease-in-out infinite; }

        /* 朝 */
        @keyframes sunRise {
          0%, 100% { transform: translateX(-50%) translate3d(0, 6px, 0) scale(1);    opacity: 0.85; }
          50%      { transform: translateX(-50%) translate3d(0, -4px, 0) scale(1.05); opacity: 1; }
        }
        @keyframes raySway {
          0%, 100% { transform: rotate(-3.5deg); }
          50%      { transform: rotate(3.5deg); }
        }
        @keyframes rayGlow { 0%, 100% { opacity: 0.45; } 50% { opacity: 1; } }
        @keyframes floatUp {
          0%   { transform: translate3d(0, 0, 0);          opacity: 0; }
          15%  { opacity: 0.9; }
          85%  { opacity: 0.45; }
          100% { transform: translate3d(12px, -220px, 0);  opacity: 0; }
        }
        @keyframes floatUp2 {
          0%   { transform: translate3d(0, 0, 0);           opacity: 0; }
          18%  { opacity: 0.85; }
          82%  { opacity: 0.4; }
          100% { transform: translate3d(-14px, -200px, 0);  opacity: 0; }
        }

        /* 昼間 */
        @keyframes sunPulse {
          0%, 100% { transform: scale(1);    opacity: 0.85; }
          50%      { transform: scale(1.08); opacity: 1; }
        }
        @keyframes rayRotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes cloudDrift {
          0%   { transform: translate3d(-45vw, 0, 0); }
          100% { transform: translate3d(125vw, 0, 0); }
        }

        /* 夕暮れ */
        @keyframes sunSink {
          0%   { transform: translateX(-50%) translate3d(0, 0, 0) scale(1.02);     opacity: 1; }
          100% { transform: translateX(-50%) translate3d(0, 14px, 0) scale(0.98);  opacity: 0.78; }
        }
        @keyframes bandShimmer { 0%, 100% { opacity: 0.7; } 50% { opacity: 1; } }
        @keyframes emberFloat {
          0%   { transform: translate3d(0, 0, 0);           opacity: 0; }
          20%  { opacity: 0.9; }
          100% { transform: translate3d(-18px, -210px, 0);  opacity: 0; }
        }

        @media (prefers-reduced-motion: reduce) {
          [class*="animate-"], div[style*="animation"] { animation: none !important; }
        }
      `}</style>
    </div>
  )
}
