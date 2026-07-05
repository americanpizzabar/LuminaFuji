'use client'

/**
 * サンライズ・シミュレーションの共有ビジュアル。
 * 光アラームページ（プレビュー）と LightAlarmWatcher（本番の起床発火）の両方が使う。
 */

import { ReactNode } from 'react'
import { motion } from 'framer-motion'

export type SunrisePlan = 'sport' | 'leisure' | 'work'

/** 起床時刻の何分前からランプを開始するか */
export const SUNRISE_LEAD_MINUTES = 20

export const SUNRISE_TARGET: Record<SunrisePlan, number> = { sport: 95, leisure: 65, work: 85 }

export const SUNRISE_COLOR: Record<SunrisePlan, string> = {
  sport: 'hsl(195,80%,70%)',
  leisure: 'hsl(28,100%,65%)',
  work: 'hsl(50,90%,75%)',
}

interface Props {
  /** ランプの進行度 0–1 */
  progress: number
  /** 表示上の明るさ % */
  brightness: number
  plan: SunrisePlan
  /** 中央下のステータステキスト */
  statusText: string
  onClose: () => void
  closeLabel: string
  zIndex?: number
  /** ステータスの下に差し込む追加コンテンツ（起床後の挨拶など） */
  extra?: ReactNode
}

export default function SunriseGlow({
  progress, brightness, plan, statusText, onClose, closeLabel, zIndex = 180, extra,
}: Props) {
  return (
    <motion.div
      key="sunrise-glow"
      className="fixed inset-0 flex flex-col items-center justify-center"
      style={{
        zIndex,
        background: `hsl(${plan === 'sport' ? '200' : '20'},80%,${2 + Math.round(progress * 8)}%)`,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Horizon glow */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{
          height: `${20 + progress * 50}%`,
          background: `linear-gradient(to top, ${SUNRISE_COLOR[plan]} 0%, transparent 100%)`,
          opacity: 0.15 + progress * 0.5,
        }}
      />

      {/* Sun orb */}
      <div
        className="relative rounded-full pointer-events-none"
        style={{
          width: 120,
          height: 120,
          background: `radial-gradient(circle, ${SUNRISE_COLOR[plan]} 0%, transparent 70%)`,
          boxShadow: `0 0 ${40 + progress * 80}px ${SUNRISE_COLOR[plan]}`,
          opacity: 0.2 + progress * 0.8,
          transform: `translateY(${(1 - progress) * 80}px)`,
        }}
      />

      <div className="absolute text-center px-8" style={{ top: '62%' }}>
        <p className="font-serif text-xl mb-1" style={{ color: `rgba(255,220,160,${0.3 + progress * 0.7})` }}>
          {Math.round(brightness)}%
        </p>
        <p className="text-xs" style={{ color: `rgba(255,200,130,${0.2 + progress * 0.5})` }}>
          {statusText}
        </p>
        {extra}
      </div>

      <button
        onClick={onClose}
        className="absolute top-10 right-6 text-xs"
        style={{ color: 'rgba(255,200,130,0.4)' }}
      >
        {closeLabel}
      </button>
    </motion.div>
  )
}
