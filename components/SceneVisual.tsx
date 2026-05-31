'use client'

/**
 * SceneVisual — 各照明シーンを表す、絵文字に代わるカスタムアニメーション付きビジュアル。
 * すべて純粋な SVG + CSS keyframes（globals.css の scene-* アニメーション）で描画し、
 * 親要素の width/height に追従してスケールする。
 *
 * scenes: dawn / morning / day / dusk / evening(relax) / reading / sleep
 */

interface SceneVisualProps {
  id: string
  /** 大きいヒーロー表示か（装飾を増やす余地） */
  detailed?: boolean
  /** アニメーションを止める（オフ状態など） */
  paused?: boolean
  className?: string
}

const G = (id: string, stops: { o: string; c: string }[]) => (
  <radialGradient id={id} cx="50%" cy="50%" r="50%">
    {stops.map((s, i) => (
      <stop key={i} offset={s.o} stopColor={s.c} />
    ))}
  </radialGradient>
)

export default function SceneVisual({ id, detailed = false, paused = false, className = '' }: SceneVisualProps) {
  const anim = (cls: string) => (paused ? '' : cls)

  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      style={{ width: '100%', height: '100%', overflow: 'visible' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {renderScene(id, detailed, anim)}
    </svg>
  )
}

function renderScene(id: string, detailed: boolean, anim: (c: string) => string) {
  switch (id) {
    // ── 夜明け：地平線から昇る陽と放射 ─────────────────────────────
    case 'dawn':
      return (
        <g>
          <defs>
            {G('dawnSun', [
              { o: '0%', c: '#fff4e0' },
              { o: '40%', c: '#fbbf24' },
              { o: '75%', c: '#fb7185' },
              { o: '100%', c: 'rgba(244,114,182,0)' },
            ])}
            <linearGradient id="dawnSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(167,139,250,0.0)" />
              <stop offset="100%" stopColor="rgba(251,113,133,0.18)" />
            </linearGradient>
            <clipPath id="dawnClip"><rect x="0" y="0" width="100" height="62" /></clipPath>
          </defs>
          <rect x="6" y="20" width="88" height="42" rx="8" fill="url(#dawnSky)" />
          {/* rays */}
          <g clipPath="url(#dawnClip)">
            {[-55, -35, -18, 0, 18, 35, 55].map((deg, i) => (
              <rect
                key={i}
                x="49.2" y="14" width="1.6" height="34" rx="0.8"
                fill="rgba(251,191,36,0.5)"
                transform={`rotate(${deg} 50 62)`}
                className={anim('scene-fade-stagger')}
                style={{ animationDelay: `${i * 0.25}s` }}
              />
            ))}
          </g>
          {/* sun */}
          <circle cx="50" cy="62" r="15" fill="url(#dawnSun)" clipPath="url(#dawnClip)" className={anim('scene-rise')} />
          {/* horizon */}
          <line x1="14" y1="62" x2="86" y2="62" stroke="rgba(255,255,255,0.22)" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="22" y1="66" x2="78" y2="66" stroke="rgba(34,211,238,0.18)" strokeWidth="1" strokeLinecap="round" />
        </g>
      )

    // ── 朝：回転する光条を持つ太陽 ─────────────────────────────────
    case 'morning':
      return (
        <g>
          <defs>
            {G('mornSun', [
              { o: '0%', c: '#fffaf0' },
              { o: '45%', c: '#fde68a' },
              { o: '80%', c: '#fbbf24' },
              { o: '100%', c: 'rgba(245,158,11,0)' },
            ])}
          </defs>
          <circle cx="50" cy="50" r="30" fill="rgba(251,191,36,0.10)" className={anim('scene-breath')} />
          <g className={anim('scene-rotate')}>
            {Array.from({ length: 12 }).map((_, i) => (
              <rect
                key={i}
                x="49" y="6" width="2" height="11" rx="1"
                fill="rgba(253,230,138,0.85)"
                transform={`rotate(${i * 30} 50 50)`}
              />
            ))}
          </g>
          <circle cx="50" cy="50" r="16" fill="url(#mornSun)" className={anim('scene-glow-pulse')} />
        </g>
      )

    // ── 昼：眩い太陽 + 同心円パルス + 煌めき ───────────────────────
    case 'day':
      return (
        <g>
          <defs>
            {G('daySun', [
              { o: '0%', c: '#ffffff' },
              { o: '35%', c: '#fffbeb' },
              { o: '70%', c: '#fde68a' },
              { o: '100%', c: 'rgba(251,191,36,0)' },
            ])}
          </defs>
          {[34, 26].map((r, i) => (
            <circle
              key={i}
              cx="50" cy="50" r={r}
              fill="none" stroke="rgba(251,191,36,0.35)" strokeWidth="1"
              className={anim('scene-ripple')}
              style={{ animationDelay: `${i * 1.2}s` }}
            />
          ))}
          <g className={anim('scene-rotate-slow')}>
            {Array.from({ length: 16 }).map((_, i) => (
              <rect
                key={i}
                x="49.3" y="8" width="1.4" height="8" rx="0.7"
                fill="rgba(255,247,200,0.7)"
                transform={`rotate(${i * 22.5} 50 50)`}
              />
            ))}
          </g>
          <circle cx="50" cy="50" r="19" fill="url(#daySun)" className={anim('scene-glow-pulse')} />
          {/* sparkles */}
          {[[24, 26], [76, 30], [72, 74], [28, 72]].map(([x, y], i) => (
            <path
              key={i}
              d={`M${x} ${y - 4} L${x + 1} ${y} L${x + 4} ${y} L${x + 1} ${y + 1} L${x} ${y + 4} L${x - 1} ${y + 1} L${x - 4} ${y} L${x - 1} ${y} Z`}
              fill="rgba(255,255,255,0.9)"
              className={anim('scene-twinkle')}
              style={{ animationDelay: `${i * 0.6}s` }}
            />
          ))}
        </g>
      )

    // ── 夕暮れ：沈む陽とグラデーションの空 ─────────────────────────
    case 'dusk':
      return (
        <g>
          <defs>
            {G('duskSun', [
              { o: '0%', c: '#fff1e6' },
              { o: '45%', c: '#fb923c' },
              { o: '80%', c: '#f43f5e' },
              { o: '100%', c: 'rgba(217,70,239,0)' },
            ])}
            <linearGradient id="duskBand" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(217,70,239,0.10)" />
              <stop offset="55%" stopColor="rgba(251,146,60,0.16)" />
              <stop offset="100%" stopColor="rgba(244,63,94,0.20)" />
            </linearGradient>
            <clipPath id="duskClip"><rect x="0" y="0" width="100" height="66" /></clipPath>
          </defs>
          <rect x="6" y="22" width="88" height="44" rx="9" fill="url(#duskBand)" />
          <g clipPath="url(#duskClip)">
            <circle cx="50" cy="66" r="17" fill="url(#duskSun)" className={anim('scene-glow-pulse')} />
          </g>
          {/* shimmering sky lines */}
          {[30, 38, 46].map((y, i) => (
            <line
              key={i}
              x1="16" y1={y} x2="84" y2={y}
              stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeLinecap="round"
              className={anim('scene-shimmer')}
              style={{ animationDelay: `${i * 0.5}s` }}
            />
          ))}
          <line x1="14" y1="66" x2="86" y2="66" stroke="rgba(255,255,255,0.25)" strokeWidth="1.2" strokeLinecap="round" />
          {/* reflection */}
          <line x1="30" y1="71" x2="70" y2="71" stroke="rgba(251,146,60,0.3)" strokeWidth="1" strokeLinecap="round" className={anim('scene-shimmer')} />
        </g>
      )

    // ── くつろぎ：呼吸する暖かな光球と広がる波紋（ロウソク廃止） ──────
    case 'evening':
      return (
        <g>
          <defs>
            {G('relaxOrb', [
              { o: '0%', c: '#fff6e6' },
              { o: '40%', c: '#fdba74' },
              { o: '78%', c: '#f97316' },
              { o: '100%', c: 'rgba(234,88,12,0)' },
            ])}
          </defs>
          {[36, 28, 20].map((r, i) => (
            <circle
              key={i}
              cx="50" cy="50" r={r}
              fill="none" stroke="rgba(251,146,60,0.4)" strokeWidth="1.2"
              className={anim('scene-ripple')}
              style={{ animationDelay: `${i * 1.1}s` }}
            />
          ))}
          <circle cx="50" cy="50" r="22" fill="rgba(249,115,22,0.12)" className={anim('scene-breath')} />
          <circle cx="50" cy="50" r="13" fill="url(#relaxOrb)" className={anim('scene-breath-soft')} />
          <circle cx="50" cy="50" r="5" fill="rgba(255,250,235,0.95)" className={anim('scene-glow-pulse')} />
        </g>
      )

    // ── 読書：光に照らされた開いた本 ───────────────────────────────
    case 'reading':
      return (
        <g>
          <defs>
            <linearGradient id="pageL" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(253,230,138,0.35)" />
              <stop offset="100%" stopColor="rgba(255,250,235,0.95)" />
            </linearGradient>
            <linearGradient id="pageR" x1="1" y1="0" x2="0" y2="0">
              <stop offset="0%" stopColor="rgba(253,230,138,0.35)" />
              <stop offset="100%" stopColor="rgba(255,250,235,0.95)" />
            </linearGradient>
            {G('readGlow', [
              { o: '0%', c: 'rgba(253,224,71,0.5)' },
              { o: '100%', c: 'rgba(253,224,71,0)' },
            ])}
          </defs>
          {/* warm reading glow from above */}
          <circle cx="50" cy="34" r="22" fill="url(#readGlow)" className={anim('scene-glow-pulse')} />
          {/* open book */}
          <g className={anim('scene-breath-soft')}>
            <path d="M50 44 L24 50 L24 72 L50 67 Z" fill="url(#pageL)" stroke="rgba(255,255,255,0.4)" strokeWidth="0.6" />
            <path d="M50 44 L76 50 L76 72 L50 67 Z" fill="url(#pageR)" stroke="rgba(255,255,255,0.4)" strokeWidth="0.6" />
            <line x1="50" y1="44" x2="50" y2="67" stroke="rgba(180,120,40,0.5)" strokeWidth="0.8" />
            {/* text lines */}
            {[54, 58, 62].map((y, i) => (
              <g key={i}>
                <line x1="30" y1={y} x2="45" y2={y - 1} stroke="rgba(120,80,30,0.35)" strokeWidth="0.7" />
                <line x1="55" y1={y - 1} x2="70" y2={y} stroke="rgba(120,80,30,0.35)" strokeWidth="0.7" />
              </g>
            ))}
          </g>
        </g>
      )

    // ── 就寝：三日月と瞬く星 ───────────────────────────────────────
    case 'sleep':
      return (
        <g>
          <defs>
            {G('moonGlow', [
              { o: '0%', c: 'rgba(196,181,253,0.5)' },
              { o: '100%', c: 'rgba(99,102,241,0)' },
            ])}
            <linearGradient id="moonBody" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fef3c7" />
              <stop offset="100%" stopColor="#fcd34d" />
            </linearGradient>
            <mask id="crescent">
              <rect x="0" y="0" width="100" height="100" fill="black" />
              <circle cx="48" cy="50" r="20" fill="white" />
              <circle cx="58" cy="44" r="18" fill="black" />
            </mask>
          </defs>
          <circle cx="48" cy="50" r="26" fill="url(#moonGlow)" className={anim('scene-breath')} />
          <circle cx="48" cy="50" r="20" fill="url(#moonBody)" mask="url(#crescent)" className={anim('scene-breath-soft')} />
          {/* stars */}
          {[[74, 30, 1.8], [80, 52, 1.3], [68, 66, 1.5], [30, 28, 1.4], [24, 60, 1.6]].map(([x, y, r], i) => (
            <circle
              key={i}
              cx={x} cy={y} r={r}
              fill={i % 2 === 0 ? 'rgba(255,255,255,0.95)' : 'rgba(103,232,249,0.9)'}
              className={anim('scene-twinkle')}
              style={{ animationDelay: `${i * 0.5}s` }}
            />
          ))}
        </g>
      )

    // ── フォールバック：汎用の光球 ─────────────────────────────────
    default:
      return (
        <g>
          <defs>
            {G('genOrb', [
              { o: '0%', c: '#fff6e6' },
              { o: '60%', c: '#fbbf24' },
              { o: '100%', c: 'rgba(245,158,11,0)' },
            ])}
          </defs>
          <circle cx="50" cy="50" r="18" fill="url(#genOrb)" className={anim('scene-glow-pulse')} />
        </g>
      )
  }
}
