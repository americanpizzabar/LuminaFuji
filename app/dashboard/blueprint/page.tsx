'use client'

/**
 * 光の設計図（Light Blueprint）。
 * ゲストの滞在データから「世界に一つの光のプロファイル」を美しく可視化する。
 * 高級デザイン誌のような見た目で、ECUANESTのクロージングを演出する。
 */

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Download } from 'lucide-react'
import { useStore } from '@/lib/useStore'
import { usePhase } from '@/lib/phase'
import { getLightingAnalytics, getZoneAnalytics } from '@/lib/store'
import { SCENES, DEFAULT_ZONES, SCENE_POETRY, brightnessToWarmRgb } from '@/lib/lighting'
import SceneVisual from '@/components/SceneVisual'

// Generate a unique abstract "light fingerprint" pattern from reservation ID
function makeFingerprint(id: string): Array<{ x: number; y: number; r: number; opacity: number }> {
  let h = 0x811c9dc5
  const points = []
  for (let i = 0; i < 28; i++) {
    h = ((Math.imul(h, 0x01000193) ^ (id.charCodeAt(i % id.length) + i * 37)) >>> 0)
    const h2 = (Math.imul(h ^ (h >>> 16), 0x45d9f3b)) >>> 0
    points.push({
      x:       (h2 & 0xffff) / 0xffff * 300 + 10,
      y:       (h2 >>> 16)   / 0xffff * 80  + 10,
      r:       1.5 + (h & 0x1f) / 31 * 6,
      opacity: 0.15 + (h >> 5 & 0x3f) / 63 * 0.65,
    })
  }
  return points
}

function LightFingerprint({ reservationId, scenes }: { reservationId: string; scenes: { id: string; count: number }[] }) {
  const pts = useMemo(() => makeFingerprint(reservationId), [reservationId])
  const maxCount = Math.max(...scenes.map(s => s.count), 1)

  return (
    <div className="relative w-full overflow-hidden rounded-2xl"
         style={{ height: 100, background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,157,92,0.1)' }}>
      <svg viewBox="0 0 320 100" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
        {/* Fingerprint dots */}
        {pts.map((p, i) => (
          <motion.circle key={i} cx={p.x} cy={p.y} r={p.r}
            fill={`rgba(255,184,119,${p.opacity})`}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4 + i * 0.025, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
          />
        ))}
        {/* Connecting lines between adjacent dots (sparse) */}
        {pts.slice(0, 14).map((p, i) => {
          const next = pts[i + 1]
          const dist = Math.hypot(next.x - p.x, next.y - p.y)
          if (dist > 80) return null
          return (
            <motion.line key={`l${i}`} x1={p.x} y1={p.y} x2={next.x} y2={next.y}
              stroke="rgba(255,157,92,0.1)" strokeWidth="0.5"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 0.8 + i * 0.04 }}
            />
          )
        })}
        {/* Scene warm patches */}
        {scenes.slice(0, 3).map((s, i) => {
          const x = 30 + i * 120
          const scene = SCENES.find(sc => sc.nameEn === s.id || sc.id === s.id)
          if (!scene) return null
          const intensity = s.count / maxCount
          return (
            <motion.ellipse key={s.id} cx={x} cy={50} rx={35 * intensity} ry={25 * intensity}
              fill={`rgba(255,157,92,${0.06 * intensity})`}
              initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.15, duration: 0.8 }}
            />
          )
        })}
      </svg>
      <div className="absolute bottom-2 right-3">
        <p className="text-[9px] tracking-[0.2em] uppercase" style={{ color: 'rgba(255,157,92,0.3)' }}>
          Light Fingerprint
        </p>
      </div>
    </div>
  )
}

export default function BlueprintPage() {
  const [store]       = useStore()
  const { guestInfo } = usePhase()
  const analytics     = getLightingAnalytics(store)
  const zoneData      = getZoneAnalytics(store)

  const nights = guestInfo?.checkIn && guestInfo?.checkOut
    ? Math.max(1, Math.round((new Date(guestInfo.checkOut).getTime() - new Date(guestInfo.checkIn).getTime()) / 86400000))
    : null

  const topScene   = analytics.topScene ? SCENES.find(s => s.nameEn === analytics.topScene!.name) : null
  const topZone    = zoneData.topZoneId ? DEFAULT_ZONES.find(z => z.id === zoneData.topZoneId) : null
  const poetry     = topScene ? SCENE_POETRY[topScene.id] : null

  const sceneBars = useMemo(() =>
    Object.entries(analytics.sceneCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => {
        const scene = SCENES.find(s => s.nameEn === name)
        return { id: scene?.id ?? name, name, nameJa: scene?.nameJa ?? name, count }
      }),
    [analytics.sceneCounts]
  )
  const maxCount = Math.max(...sceneBars.map(b => b.count), 1)

  const ease = [0.22, 1, 0.36, 1] as const

  return (
    <div className="min-h-screen pb-32 relative"
         style={{ background: 'linear-gradient(to bottom, #06040300, #030201)' }}>

      {/* Warm ceiling glow */}
      <div className="fixed top-0 inset-x-0 h-48 pointer-events-none"
           style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(255,157,92,0.07) 0%, transparent 70%)' }} />

      <div className="max-w-[430px] mx-auto px-4">

        {/* Header */}
        <div className="flex items-center gap-3 pt-6 pb-8">
          <Link href="/dashboard"
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <ArrowLeft size={18} className="text-zinc-300" />
          </Link>
          <div>
            <p className="text-[11px] tracking-[0.3em] uppercase" style={{ color: 'rgba(255,157,92,0.55)' }}>
              Light Blueprint
            </p>
            <h1 className="font-serif text-xl text-emissive">光の設計図</h1>
          </div>
        </div>

        {/* ── Title block ── */}
        <motion.div className="mb-8 text-center"
          initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
          transition={{ duration:0.7, ease }}>
          <div className="inline-block rounded-full px-4 py-1 mb-4"
               style={{ background:'rgba(255,157,92,0.08)', border:'1px solid rgba(255,157,92,0.16)' }}>
            <p className="text-[10px] tracking-[0.35em] uppercase" style={{ color:'rgba(255,157,92,0.7)' }}>
              LUMINA FUJI RESIDENCE · Personalized
            </p>
          </div>
          <h2 className="font-serif text-3xl text-zinc-50 leading-tight mb-2">
            {guestInfo?.name?.split(' ')[0] ?? 'あなた'}様の<br />光のプロファイル
          </h2>
          {nights && guestInfo?.checkIn && guestInfo?.checkOut && (
            <p className="text-xs text-zinc-500">
              {guestInfo.checkIn} → {guestInfo.checkOut} · {nights}泊
            </p>
          )}
        </motion.div>

        {/* ── Light Fingerprint ── */}
        <motion.div className="mb-5"
          initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.3, duration:0.8 }}>
          <LightFingerprint
            reservationId={guestInfo?.reservationId ?? 'lf-guest'}
            scenes={sceneBars.map(b => ({ id: b.id, count: b.count }))}
          />
        </motion.div>

        {/* ── Dominant scene card ── */}
        {topScene && (
          <motion.div className="mb-4 rounded-3xl p-5 relative overflow-hidden"
            style={{ background:'linear-gradient(145deg, rgba(255,157,92,0.11) 0%, rgba(8,6,4,0.55) 100%)', border:'1px solid rgba(255,157,92,0.22)' }}
            initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4, duration:0.6, ease }}>
            {/* Ambient glow */}
            <div className="absolute -top-6 right-4 w-32 h-32 pointer-events-none"
                 style={{ background:'radial-gradient(circle, rgba(255,157,92,0.2) 0%, transparent 70%)', filter:'blur(16px)' }} />
            <div className="relative flex items-center gap-4">
              <div className="w-18 h-18 flex-shrink-0" style={{ width:72, height:72 }}>
                <SceneVisual id={topScene.id} detailed />
              </div>
              <div>
                <p className="text-[10px] tracking-[0.2em] uppercase mb-1" style={{ color:'rgba(255,157,92,0.55)' }}>
                  あなたの光の個性
                </p>
                <p className="font-serif text-2xl text-emissive">{poetry?.poeticName ?? topScene.nameJa}</p>
                <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed max-w-[220px]">
                  {poetry?.verse}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Scene distribution ── */}
        {sceneBars.length > 0 && (
          <motion.div className="mb-4 rounded-3xl p-5"
            style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)' }}
            initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.5, duration:0.6, ease }}>
            <p className="text-[11px] tracking-[0.2em] uppercase mb-4" style={{ color:'rgba(255,255,255,0.25)' }}>
              光のシーン構成
            </p>
            <div className="space-y-3">
              {sceneBars.map((b, i) => {
                const pct = Math.round((b.count / maxCount) * 100)
                const warmColor = brightnessToWarmRgb(SCENES.find(s => s.id === b.id)?.brightness ?? 50)
                return (
                  <div key={b.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 flex-shrink-0">
                          <SceneVisual id={b.id} />
                        </div>
                        <span className="text-xs text-zinc-400">{b.nameJa}</span>
                      </div>
                      <span className="text-xs tabular-nums" style={{ color: i === 0 ? warmColor : 'rgba(180,160,255,0.7)' }}>
                        {b.count}回
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.05)' }}>
                      <motion.div className="h-full rounded-full"
                        style={{ background: i === 0 ? `linear-gradient(90deg, ${warmColor}80, ${warmColor})` : 'linear-gradient(90deg, rgba(139,92,246,0.6), rgba(99,102,241,0.8))' }}
                        initial={{ width:0 }}
                        animate={{ width:`${pct}%` }}
                        transition={{ delay: 0.6 + i*0.1, duration:1.1, ease:[0.25,0.1,0.25,1] }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* ── Stats grid ── */}
        <motion.div className="grid grid-cols-3 gap-2 mb-5"
          initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.6, duration:0.6 }}>
          {[
            { label:'照明操作',     value: `${analytics.totalEvents}回` },
            { label:'光の種類',     value: `${Object.keys(analytics.sceneCounts).length}種` },
            { label:'お気に入り',   value: topZone?.nameJa ?? '—' },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-2xl p-3 text-center"
                 style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.05)' }}>
              <p className="text-[10px] text-zinc-600 mb-1">{label}</p>
              <p className="text-sm font-light text-zinc-200">{value}</p>
            </div>
          ))}
        </motion.div>

        {/* ── Blueprint tagline ── */}
        <motion.div className="text-center mb-6"
          initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.75 }}>
          <p className="text-xs text-zinc-600 leading-relaxed">
            この設計図は、あなただけのために生成されました。<br />
            世界に一つの「光のプロファイル」です。
          </p>
          <div className="mt-3 w-24 h-px mx-auto" style={{ background:'linear-gradient(90deg, transparent, rgba(255,157,92,0.3), transparent)' }} />
        </motion.div>

        {/* ── ECUANEST CTA ── */}
        <motion.div className="rounded-3xl p-6"
          style={{ background:'linear-gradient(165deg, rgba(20,14,8,0.97) 0%, rgba(8,6,4,0.97) 100%)', border:'1px solid rgba(255,157,92,0.25)', boxShadow:'0 0 40px -12px rgba(255,157,92,0.2)' }}
          initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.85, duration:0.65, ease }}>

          {/* Top glow */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-40 h-16 pointer-events-none"
               style={{ background:'radial-gradient(ellipse, rgba(255,184,119,0.2) 0%, transparent 70%)', filter:'blur(12px)' }} />

          <div className="text-center mb-5">
            <p className="text-[10px] tracking-[0.3em] uppercase mb-2" style={{ color:'rgba(255,157,92,0.55)' }}>
              ECUANEST
            </p>
            <h3 className="font-serif text-xl text-zinc-50 leading-tight">
              この設計図を、<br />ご自宅に再現する
            </h3>
            <p className="text-xs text-zinc-500 mt-3 leading-relaxed">
              あなただけの光のプロファイルを基に、<br />
              空間デザインの専門家が再現プランをご提案します。
            </p>
          </div>

          <Link href="/dashboard/consult">
            <button className="btn-ember w-full flex items-center justify-center gap-2 lf-glow"
                    style={{ ['--lf-glow-color' as any]:'rgba(255,157,92,0.65)' }}>
              専門家に相談する <ArrowRight size={15} />
            </button>
          </Link>
          <p className="text-center text-[10px] text-zinc-700 mt-2">
            ECUANEST Lighting Consultancy · 無料初回相談
          </p>
        </motion.div>

      </div>
    </div>
  )
}
