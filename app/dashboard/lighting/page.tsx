'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Power, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import {
  SCENES, DEFAULT_ZONES, Zone, LightingScene,
  colorTempToRgb, getColorTempLabel
} from '@/lib/lighting'
import { useLanguage } from '@/lib/useLanguage'

export default function LightingPage() {
  const { t } = useLanguage()
  const [activeScene, setActiveScene] = useState<LightingScene>(SCENES[4]) // 'evening/くつろぎ' default
  const [brightness, setBrightness] = useState(70)
  const [colorTemp, setColorTemp] = useState(2700)
  const [zones, setZones] = useState<Zone[]>(DEFAULT_ZONES)
  const [isAllOn, setIsAllOn] = useState(true)

  const applyScene = useCallback((scene: LightingScene) => {
    setActiveScene(scene)
    setBrightness(scene.brightness)
    setColorTemp(scene.colorTemp)
  }, [])

  const toggleAll = () => {
    const next = !isAllOn
    setIsAllOn(next)
    setZones((prev) => prev.map((z) => ({ ...z, isOn: next })))
  }

  const toggleZone = (id: string) => {
    setZones((prev) =>
      prev.map((z) => (z.id === id ? { ...z, isOn: !z.isOn } : z))
    )
  }

  const setZoneBrightness = (id: string, val: number) => {
    setZones((prev) =>
      prev.map((z) => (z.id === id ? { ...z, brightness: val } : z))
    )
  }

  const lightColor = colorTempToRgb(colorTemp)
  const tempLabel = getColorTempLabel(colorTemp)
  const tempPercent = ((colorTemp - 2700) / (6500 - 2700)) * 100

  return (
    <div className="min-h-screen bg-zinc-950 pb-28">
      <div className="max-w-[430px] mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 pt-6 pb-4">
          <Link href="/dashboard" className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-all">
            <ArrowLeft size={18} className="text-zinc-300" />
          </Link>
          <div>
            <h1 className="text-lg font-medium text-zinc-100">{t('lighting.title')}</h1>
            <p className="text-xs text-zinc-500">{t('lighting.subtitle')}</p>
          </div>
          <button
            onClick={toggleAll}
            className={`ml-auto w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              isAllOn
                ? 'bg-gold-500/10 border border-gold-500/30 text-gold-400'
                : 'bg-zinc-800 border border-zinc-700 text-zinc-500'
            }`}
          >
            <Power size={18} />
          </button>
        </div>

        {/* Ambient Light Visualization */}
        <div className="relative mx-4 mb-6 rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800">
          <div
            className="absolute inset-0 transition-all duration-700"
            style={{
              background: `radial-gradient(ellipse at 50% 20%, ${lightColor.replace('rgb', 'rgba').replace(')', `, ${(brightness / 100) * 0.25})`)} 0%, transparent 70%)`,
            }}
          />
          <div className="relative p-6 text-center">
            <motion.div
              animate={{
                scale: isAllOn ? [1, 1.05, 1] : 1,
                opacity: isAllOn ? 1 : 0.3,
              }}
              transition={{ duration: 3, repeat: isAllOn ? Infinity : 0, repeatType: 'reverse' }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-3"
              style={{
                background: `radial-gradient(circle, ${lightColor.replace('rgb', 'rgba').replace(')', `, ${(brightness / 100) * 0.6})`)} 0%, transparent 70%)`,
                boxShadow: isAllOn ? `0 0 40px ${lightColor.replace('rgb', 'rgba').replace(')', `, ${(brightness / 100) * 0.4})`)}` : 'none',
              }}
            >
              <span className="text-3xl">{activeScene.icon}</span>
            </motion.div>
            <p className="text-xl font-serif text-zinc-100">{activeScene.nameJa}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{activeScene.nameEn} · {brightness}%</p>
          </div>
        </div>

        {/* Scene Presets */}
        <div className="px-4 mb-6">
          <p className="text-xs text-zinc-500 uppercase tracking-widest mb-3">{t('lighting.scenePresets')}</p>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
            {SCENES.map((scene) => (
              <button
                key={scene.id}
                onClick={() => applyScene(scene)}
                className={`flex-shrink-0 flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-2xl border transition-all duration-200 ${
                  activeScene.id === scene.id
                    ? 'border-gold-500/40 bg-gold-500/10 text-gold-300'
                    : 'border-zinc-800 bg-zinc-900 text-zinc-500 hover:border-zinc-700'
                }`}
              >
                <span className="text-xl">{scene.icon}</span>
                <span className="text-[11px] whitespace-nowrap">{scene.nameJa}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Brightness Control */}
        <div className="px-4 mb-6">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-zinc-300">{t('lighting.brightness')}</p>
              <span className="text-2xl font-light text-gold-400 tabular-nums">{brightness}%</span>
            </div>
            <div className="relative">
              <input
                type="range"
                min={0}
                max={100}
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="range-gold w-full"
                style={{
                  background: `linear-gradient(to right, #f59e0b ${brightness}%, #27272a ${brightness}%)`,
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-zinc-600 mt-1.5">
              <span>{t('lighting.off')}</span>
              <span>{t('lighting.max')}</span>
            </div>
          </div>
        </div>

        {/* Color Temperature */}
        <div className="px-4 mb-6">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-zinc-300">{t('lighting.colorTemp')}</p>
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: lightColor, boxShadow: `0 0 6px ${lightColor}` }}
                />
                <span className="text-sm text-zinc-400 tabular-nums">{colorTemp}K</span>
                <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">{tempLabel}</span>
              </div>
            </div>
            <div className="relative mb-2">
              <div
                className="w-full h-2 rounded-full mb-2"
                style={{
                  background: 'linear-gradient(to right, #ff9500, #fff5e4, #e8f0ff)',
                }}
              />
              <input
                type="range"
                min={2700}
                max={6500}
                value={colorTemp}
                onChange={(e) => setColorTemp(Number(e.target.value))}
                className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer"
                style={{ top: 0 }}
              />
              <div
                className="absolute top-0 h-2 flex items-center pointer-events-none"
                style={{ left: `calc(${tempPercent}% - 8px)` }}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-lg border-2 border-zinc-300 -mt-1" />
              </div>
            </div>
            <div className="flex justify-between text-xs text-zinc-600">
              <span>{t('lighting.warm')}</span>
              <span>{t('lighting.cool')}</span>
            </div>
          </div>
        </div>

        {/* Zone Control */}
        <div className="px-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-zinc-500 uppercase tracking-widest">{t('lighting.zones')}</p>
            <button
              onClick={toggleAll}
              className="text-xs text-zinc-500 hover:text-gold-400 transition-colors"
            >
              {isAllOn ? t('lighting.allOff') : t('lighting.allOn')}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {zones.map((zone) => (
              <ZoneCard
                key={zone.id}
                zone={zone}
                brightnessLabel={t('lighting.zoneBrightness')}
                onToggle={() => toggleZone(zone.id)}
                onBrightnessChange={(val) => setZoneBrightness(zone.id, val)}
              />
            ))}
          </div>
        </div>

        {/* Product Link */}
        <div className="px-4">
          <Link href="/dashboard/products/brite-3">
            <div className="card p-4 flex items-center gap-3 hover:border-zinc-700 transition-all active:scale-98">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-lg">✦</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-200">ECUANEST Brite 3</p>
                <p className="text-xs text-zinc-500">{t('lighting.productLink')}</p>
              </div>
              <ChevronRight size={16} className="text-zinc-600" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

function ZoneCard({
  zone,
  brightnessLabel,
  onToggle,
  onBrightnessChange,
}: {
  zone: Zone
  brightnessLabel: string
  onToggle: () => void
  onBrightnessChange: (val: number) => void
}) {
  return (
    <div className={`card p-4 transition-all duration-300 ${zone.isOn ? 'border-zinc-700' : 'border-zinc-800 opacity-60'}`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-medium text-zinc-200">{zone.nameJa}</p>
          <p className="text-xs text-zinc-600">{zone.nameEn}</p>
        </div>
        <button
          onClick={onToggle}
          className={`w-9 h-5 rounded-full transition-all duration-300 relative flex-shrink-0 ${
            zone.isOn ? 'bg-gold-500' : 'bg-zinc-700'
          }`}
        >
          <span
            className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${
              zone.isOn ? 'left-4' : 'left-0.5'
            }`}
          />
        </button>
      </div>
      {zone.isOn && (
        <div>
          <div className="flex justify-between text-xs text-zinc-500 mb-1.5">
            <span>{brightnessLabel}</span>
            <span className="text-zinc-400">{zone.brightness}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={zone.brightness}
            onChange={(e) => onBrightnessChange(Number(e.target.value))}
            className="range-gold w-full"
            style={{
              background: `linear-gradient(to right, #f59e0b ${zone.brightness}%, #27272a ${zone.brightness}%)`,
            }}
          />
        </div>
      )}
    </div>
  )
}
