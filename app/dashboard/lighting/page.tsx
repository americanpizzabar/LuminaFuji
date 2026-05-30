'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Power, Zap, Wifi, WifiOff, Check, Info } from 'lucide-react'
import Link from 'next/link'
import {
  SCENES, DEFAULT_ZONES, Zone, LightingScene,
  brightnessToWarmRgb, FIXED_CCT_LABEL,
} from '@/lib/lighting'
import { useLanguage } from '@/lib/useLanguage'
import { usePhase } from '@/lib/phase'
import { recordLightingEvent } from '@/lib/store'

type ZigbeeStatus = 'connecting' | 'connected' | 'offline' | 'simulated'

function pct254(v: number) {
  return Math.round((v / 100) * 254)
}

function useZigbeeControl(isStaying: boolean) {
  const [status, setStatus] = useState<ZigbeeStatus>('simulated')
  const [lastSent, setLastSent] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 滞在中フェーズに入ると自動接続（ゲストの操作は不要）
  useEffect(() => {
    if (!isStaying) return
    setStatus('connecting')
    fetch('/api/lighting/zigbee', { method: 'GET' })
      .then(r => r.json())
      .then(data => setStatus(data.connected ? 'connected' : 'simulated'))
      .catch(() => setStatus('simulated'))
  }, [isStaying])

  const sendCommand = useCallback(
    (zone: string, command: { state: 'ON' | 'OFF'; brightness: number }) => {
      if (!isStaying) return
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(async () => {
        try {
          const res = await fetch('/api/lighting/zigbee', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ zone, command }),
          })
          const data = await res.json()
          if (data.success) {
            setStatus(data.zigbee ? 'connected' : 'simulated')
            setLastSent(zone)
            setTimeout(() => setLastSent(null), 2000)
          }
        } catch {
          setStatus('offline')
        }
      }, 300)
    },
    [isStaying]
  )

  return { status, sendCommand, lastSent }
}

export default function LightingPage() {
  const { t } = useLanguage()
  const { phase } = usePhase()
  const isStaying = phase === 'staying'

  const [activeScene, setActiveScene] = useState<LightingScene>(SCENES[4])
  const [brightness, setBrightness] = useState(25)
  const [zones, setZones] = useState<Zone[]>(DEFAULT_ZONES)
  const [isAllOn, setIsAllOn] = useState(true)

  const { status: zigbeeStatus, sendCommand, lastSent } = useZigbeeControl(isStaying)

  const applyScene = useCallback((scene: LightingScene) => {
    setActiveScene(scene)
    setBrightness(scene.brightness)
    setIsAllOn(scene.brightness > 0)
    if (isStaying) {
      recordLightingEvent({ sceneId: scene.id, sceneName: scene.nameEn })
      sendCommand('all', { state: scene.brightness > 0 ? 'ON' : 'OFF', brightness: pct254(scene.brightness) })
    }
  }, [isStaying, sendCommand])

  const toggleAll = () => {
    const next = !isAllOn
    setIsAllOn(next)
    setZones(prev => prev.map(z => ({ ...z, isOn: next })))
    if (isStaying) {
      sendCommand('all', { state: next ? 'ON' : 'OFF', brightness: pct254(brightness) })
    }
  }

  const toggleZone = (id: string) => {
    const zone = zones.find(z => z.id === id)
    setZones(prev => prev.map(z => z.id === id ? { ...z, isOn: !z.isOn } : z))
    if (isStaying && zone) {
      sendCommand(id, { state: zone.isOn ? 'OFF' : 'ON', brightness: pct254(zone.brightness) })
    }
  }

  const setZoneBrightness = (id: string, val: number) => {
    setZones(prev => prev.map(z => z.id === id ? { ...z, brightness: val } : z))
    if (isStaying) {
      sendCommand(id, { state: val > 0 ? 'ON' : 'OFF', brightness: pct254(val) })
    }
  }

  const handleBrightnessChange = (val: number) => {
    setBrightness(val)
    setIsAllOn(val > 0)
    if (isStaying) {
      sendCommand('all', { state: val > 0 ? 'ON' : 'OFF', brightness: pct254(val) })
    }
  }

  // 明るさ連動の発光色（OLED dim-to-warm）
  const lightColor = brightnessToWarmRgb(brightness)
  const rgbMatch = lightColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
  const [lr, lg, lb] = rgbMatch ? [rgbMatch[1], rgbMatch[2], rgbMatch[3]] : ['255', '150', '80']
  const ambientIntensity = isAllOn ? (brightness / 100) : 0

  return (
    <div className="min-h-screen pb-32 relative overflow-hidden">
      {/* ── 明るさ連動アンビエント背景 ─────────────────────── */}
      <motion.div
        className="fixed inset-0 -z-10 scene-bg-transition pointer-events-none"
        animate={{
          background: isAllOn
            ? [
                `radial-gradient(ellipse 90% 70% at 50% 105%, rgba(${lr},${lg},${lb},${ambientIntensity * 0.24}) 0%, transparent 60%)`,
                `radial-gradient(ellipse 70% 50% at 30% 80%, rgba(${lr},${lg},${lb},${ambientIntensity * 0.08}) 0%, transparent 50%)`,
                `radial-gradient(ellipse 60% 40% at 70% 90%, rgba(${lr},${lg},${lb},${ambientIntensity * 0.1}) 0%, transparent 50%)`,
                `linear-gradient(to bottom, #030306 0%, rgba(4,4,8,0.97) 100%)`,
              ].join(', ')
            : 'linear-gradient(to bottom, #030306, #04040a)',
        }}
        transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
      />

      <AnimatePresence>
        {isAllOn && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="fixed top-0 left-1/2 -translate-x-1/2 pointer-events-none -z-10"
            style={{
              width: '80%', height: '40%',
              background: `radial-gradient(ellipse, rgba(${lr},${lg},${lb},${ambientIntensity * 0.07}) 0%, transparent 70%)`,
              filter: 'blur(20px)',
            }}
          />
        )}
      </AnimatePresence>

      <div className="max-w-[430px] mx-auto">

        {/* ── ヘッダー ─────────────────────────────────────── */}
        <div className="flex items-center gap-3 px-4 pt-6 pb-4">
          <Link
            href="/dashboard"
            className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <ArrowLeft size={18} className="text-zinc-300" />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-serif text-zinc-100">{t('lighting.title')}</h1>
            <p className="text-xs text-zinc-500">OLEDWorks Brite 3 · {FIXED_CCT_LABEL}</p>
          </div>

          {/* Zigbee 接続ステータス */}
          {isStaying && (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-medium"
              style={{
                background:
                  zigbeeStatus === 'connected' ? 'rgba(34,197,94,0.1)'
                  : zigbeeStatus === 'connecting' ? 'rgba(251,191,36,0.1)'
                  : 'rgba(255,255,255,0.04)',
                border: `1px solid ${
                  zigbeeStatus === 'connected' ? 'rgba(34,197,94,0.2)'
                  : zigbeeStatus === 'connecting' ? 'rgba(251,191,36,0.2)'
                  : 'rgba(255,255,255,0.06)'
                }`,
              }}
            >
              {zigbeeStatus === 'connected' ? (
                <><Wifi size={11} className="text-emerald-400" /><span className="text-emerald-400">Zigbee</span></>
              ) : zigbeeStatus === 'connecting' ? (
                <><motion.div className="w-2 h-2 bg-gold-400 rounded-full"
                              animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1, repeat: Infinity }} />
                  <span className="text-gold-400">接続中</span></>
              ) : zigbeeStatus === 'simulated' ? (
                <><Zap size={11} className="text-zinc-500" /><span className="text-zinc-500">シミュレーション</span></>
              ) : (
                <><WifiOff size={11} className="text-red-400" /><span className="text-red-400">オフライン</span></>
              )}
            </div>
          )}

          <motion.button
            onClick={toggleAll}
            className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all"
            style={
              isAllOn
                ? { background: `rgba(${lr},${lg},${lb},0.12)`, border: `1px solid rgba(${lr},${lg},${lb},0.25)` }
                : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }
            }
            whileTap={{ scale: 0.88 }}
          >
            <Power size={18} style={{ color: isAllOn ? lightColor : '#71717a' }} />
          </motion.button>
        </div>

        {/* 滞在中以外は操作ロック */}
        {!isStaying && (
          <div className="mx-4 mb-4 rounded-2xl p-3 text-center"
               style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.12)' }}>
            <p className="text-xs text-gold-400/80">照明の実際の操作はご滞在中のみ可能です</p>
          </div>
        )}

        {/* ── シーン・ビジュアライゼーション ─────────────── */}
        <div className="relative mx-4 mb-5">
          <div
            className="rounded-3xl overflow-hidden relative"
            style={{
              background: 'rgba(255,255,255,0.02)',
              backdropFilter: 'blur(20px)',
              border: `1px solid rgba(${lr},${lg},${lb},${isAllOn ? 0.15 : 0.05})`,
              boxShadow: isAllOn
                ? `0 0 40px rgba(${lr},${lg},${lb},${ambientIntensity * 0.15}), 0 4px 24px rgba(0,0,0,0.4)`
                : '0 4px 24px rgba(0,0,0,0.4)',
              transition: 'all 1.2s cubic-bezier(0.4,0,0.2,1)',
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none transition-all duration-[1200ms]"
              style={{
                background: isAllOn
                  ? `radial-gradient(ellipse at 50% 30%, rgba(${lr},${lg},${lb},${ambientIntensity * 0.18}) 0%, transparent 70%)`
                  : 'none',
              }}
            />

            <div className="relative p-8 text-center">
              {/* 呼吸するアイコン */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeScene.id}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={
                    isAllOn
                      ? {
                          scale: [1, 1.12, 1],
                          opacity: [0.85, 1, 0.85],
                          filter: [
                            `drop-shadow(0 0 8px rgba(${lr},${lg},${lb},0.4))`,
                            `drop-shadow(0 0 24px rgba(${lr},${lg},${lb},0.7))`,
                            `drop-shadow(0 0 8px rgba(${lr},${lg},${lb},0.4))`,
                          ],
                        }
                      : { scale: 1, opacity: 0.25, filter: 'none' }
                  }
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={
                    isAllOn
                      ? { duration: 3, repeat: Infinity, ease: 'easeInOut', repeatType: 'reverse' }
                      : { duration: 0.3 }
                  }
                  className="text-7xl mb-4 inline-block"
                >
                  {activeScene.icon}
                </motion.div>
              </AnimatePresence>

              <motion.p
                key={activeScene.nameJa}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-serif text-zinc-50"
              >
                {activeScene.nameJa}
              </motion.p>
              <p className="text-xs text-zinc-500 mt-1">
                {activeScene.nameEn} · {brightness}% · {FIXED_CCT_LABEL}
              </p>

              <AnimatePresence>
                {lastSent && (
                  <motion.div
                    initial={{ opacity: 0, y: 4, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-xl"
                    style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.2)' }}
                  >
                    <Check size={11} className="text-emerald-400" />
                    <span className="text-[11px] text-emerald-400 font-medium">送信済み</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ── シーンプリセット ───────────────────────────── */}
        <div className="px-4 mb-6">
          <p className="text-xs text-zinc-500 uppercase tracking-[0.2em] mb-3">{t('lighting.scenePresets')}</p>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {SCENES.map((scene) => {
              const sceneRgb = brightnessToWarmRgb(scene.brightness)
              const sm = sceneRgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
              const [sr, sg, sb] = sm ? [sm[1], sm[2], sm[3]] : ['255', '180', '120']
              const isActive = activeScene.id === scene.id

              return (
                <motion.button
                  key={scene.id}
                  onClick={() => applyScene(scene)}
                  className="flex-shrink-0 flex flex-col items-center gap-2 px-4 py-3 rounded-2xl transition-all duration-300 relative overflow-hidden"
                  style={{
                    background: isActive
                      ? `radial-gradient(ellipse at 50% 0%, rgba(${sr},${sg},${sb},0.22) 0%, rgba(0,0,0,0.5) 80%)`
                      : 'rgba(255,255,255,0.03)',
                    backdropFilter: 'blur(12px)',
                    border: isActive
                      ? `1.5px solid rgba(${sr},${sg},${sb},0.45)`
                      : '1px solid rgba(255,255,255,0.06)',
                    boxShadow: isActive ? `0 4px 20px rgba(${sr},${sg},${sb},0.18)` : 'none',
                    minWidth: '72px',
                  }}
                  whileTap={{ scale: 0.9 }}
                >
                  <motion.span
                    className="text-2xl"
                    animate={
                      isActive && isAllOn
                        ? {
                            scale: [1, 1.18, 1],
                            filter: [
                              `drop-shadow(0 0 4px rgba(${sr},${sg},${sb},0.4))`,
                              `drop-shadow(0 0 12px rgba(${sr},${sg},${sb},0.8))`,
                              `drop-shadow(0 0 4px rgba(${sr},${sg},${sb},0.4))`,
                            ],
                          }
                        : {}
                    }
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    {scene.icon}
                  </motion.span>
                  <span className="text-[11px] whitespace-nowrap font-medium"
                        style={{ color: isActive ? `rgb(${sr},${sg},${sb})` : '#71717a' }}>
                    {scene.nameJa}
                  </span>
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* ── 明るさ ─────────────────────────────────────── */}
        <div className="px-4 mb-5">
          <div className="p-5 rounded-3xl"
               style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-zinc-300">{t('lighting.brightness')}</p>
              <span className="text-2xl font-light tabular-nums" style={{ color: lightColor }}>{brightness}%</span>
            </div>
            <input
              type="range" min={0} max={100} value={brightness}
              onChange={e => handleBrightnessChange(Number(e.target.value))}
              className="range-gold w-full"
              style={{ background: `linear-gradient(to right, ${lightColor} ${brightness}%, rgba(255,255,255,0.08) ${brightness}%)` }}
            />
            <div className="flex justify-between text-xs text-zinc-600 mt-2">
              <span>{t('lighting.off')}</span>
              <span>{t('lighting.max')}</span>
            </div>
          </div>
        </div>

        {/* ── 固定色温度インフォ（dim-to-warm 説明） ───────── */}
        <div className="px-4 mb-6">
          <div className="p-4 rounded-2xl flex items-start gap-3"
               style={{ background: `rgba(${lr},${lg},${lb},0.05)`, border: `1px solid rgba(${lr},${lg},${lb},0.12)` }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                 style={{ background: `rgba(${lr},${lg},${lb},0.12)`, border: `1px solid rgba(${lr},${lg},${lb},0.2)` }}>
              <Info size={16} style={{ color: lightColor }} />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-200">{t('lighting.cctTitle')}</p>
              <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{t('lighting.cctNote')}</p>
            </div>
          </div>
        </div>

        {/* ── エリア別コントロール ───────────────────────── */}
        <div className="px-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-zinc-500 uppercase tracking-[0.2em]">{t('lighting.zones')}</p>
            <button onClick={toggleAll} className="text-xs transition-colors"
                    style={{ color: isAllOn ? `rgb(${lr},${lg},${lb})` : '#52525b' }}>
              {isAllOn ? t('lighting.allOff') : t('lighting.allOn')}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {zones.map(zone => (
              <ZoneCard
                key={zone.id} zone={zone}
                brightnessLabel={t('lighting.zoneBrightness')}
                lr={lr} lg={lg} lb={lb}
                onToggle={() => toggleZone(zone.id)}
                onBrightnessChange={val => setZoneBrightness(zone.id, val)}
              />
            ))}
          </div>
        </div>

        {/* ── 製品リンク ─────────────────────────────────── */}
        <div className="px-4">
          <Link href="/dashboard/products/brite-3">
            <motion.div
              className="rounded-2xl p-4 flex items-center gap-3"
              style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)' }}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                   style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.15)' }}>
                <span className="text-lg">✦</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-zinc-200">OLEDWorks Brite 3</p>
                <p className="text-xs text-zinc-500">{t('lighting.productLink')}</p>
              </div>
              <ArrowLeft size={16} className="text-zinc-600 rotate-180" />
            </motion.div>
          </Link>
        </div>

      </div>
    </div>
  )
}

function ZoneCard({
  zone, brightnessLabel, lr, lg, lb, onToggle, onBrightnessChange,
}: {
  zone: Zone
  brightnessLabel: string
  lr: string; lg: string; lb: string
  onToggle: () => void
  onBrightnessChange: (val: number) => void
}) {
  // ゾーンごとの明るさに応じた発光色
  const zoneColor = brightnessToWarmRgb(zone.brightness)
  return (
    <motion.div
      className="rounded-2xl p-4 transition-all duration-300"
      style={{
        background: zone.isOn ? `rgba(${lr},${lg},${lb},0.04)` : 'rgba(255,255,255,0.02)',
        backdropFilter: 'blur(16px)',
        border: zone.isOn ? `1px solid rgba(${lr},${lg},${lb},0.18)` : '1px solid rgba(255,255,255,0.05)',
        opacity: zone.isOn ? 1 : 0.55,
      }}
      animate={{
        boxShadow: zone.isOn
          ? [`0 0 12px rgba(${lr},${lg},${lb},0.06)`, `0 0 20px rgba(${lr},${lg},${lb},0.1)`, `0 0 12px rgba(${lr},${lg},${lb},0.06)`]
          : '0 0 0px transparent',
      }}
      transition={{ duration: 3, repeat: zone.isOn ? Infinity : 0, ease: 'easeInOut' }}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-semibold text-zinc-200">{zone.nameJa}</p>
          <p className="text-xs text-zinc-600">{zone.nameEn}</p>
        </div>
        <motion.button
          onClick={onToggle}
          className="w-10 h-5 rounded-full relative flex-shrink-0 transition-all duration-300"
          style={{
            background: zone.isOn ? zoneColor : 'rgba(255,255,255,0.1)',
            boxShadow: zone.isOn ? `0 0 8px rgba(${lr},${lg},${lb},0.4)` : 'none',
          }}
          whileTap={{ scale: 0.92 }}
        >
          <motion.span
            className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow"
            animate={{ left: zone.isOn ? '22px' : '2px' }}
            transition={{ type: 'spring', damping: 20, stiffness: 400 }}
          />
        </motion.button>
      </div>
      <AnimatePresence>
        {zone.isOn && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <div className="flex justify-between text-xs text-zinc-500 mb-1.5">
              <span>{brightnessLabel}</span>
              <span style={{ color: zoneColor }}>{zone.brightness}%</span>
            </div>
            <input
              type="range" min={0} max={100} value={zone.brightness}
              onChange={e => onBrightnessChange(Number(e.target.value))}
              className="range-gold w-full"
              style={{ background: `linear-gradient(to right, ${zoneColor} ${zone.brightness}%, rgba(255,255,255,0.08) ${zone.brightness}%)` }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
