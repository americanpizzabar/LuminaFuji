/**
 * 日の出・日の入りの計算（Sunrise equation, NOAA 近似）。
 * GPS 権限を求める代わりに、施設の固定座標（山中湖）から算出する。
 * 単一施設では固定座標のほうが確実で、許可ダイアログも出ない。
 */

const DEG = Math.PI / 180

/** Lumina Fuji ＝ 山中湖（東経正） */
export const FACILITY = { lat: 35.4172, lng: 138.8736, label: '山中湖' }

export interface SunTimes {
  sunrise: Date | null
  sunset: Date | null
  /** 白夜・極夜などで計算不能な場合 */
  alwaysUp: boolean
  alwaysDown: boolean
}

export function getSunTimes(date: Date, lat: number = FACILITY.lat, lng: number = FACILITY.lng): SunTimes {
  const julian = date.valueOf() / 86400000 + 2440587.5
  const n = Math.round(julian - 2451545.0 + 0.0008)
  const Jstar = n - lng / 360 // 平均太陽時（東経正 → lw = -lng）
  const M = (357.5291 + 0.98560028 * Jstar) % 360
  const Mr = M * DEG
  const C = 1.9148 * Math.sin(Mr) + 0.02 * Math.sin(2 * Mr) + 0.0003 * Math.sin(3 * Mr)
  const lambda = ((M + C + 180 + 102.9372) % 360) * DEG
  const Jtransit = 2451545.0 + Jstar + 0.0053 * Math.sin(Mr) - 0.0069 * Math.sin(2 * lambda)
  const delta = Math.asin(Math.sin(lambda) * Math.sin(23.44 * DEG))
  const cosH =
    (Math.sin(-0.833 * DEG) - Math.sin(lat * DEG) * Math.sin(delta)) /
    (Math.cos(lat * DEG) * Math.cos(delta))

  if (cosH > 1) return { sunrise: null, sunset: null, alwaysUp: false, alwaysDown: true }
  if (cosH < -1) return { sunrise: null, sunset: null, alwaysUp: true, alwaysDown: false }

  const H = Math.acos(cosH) / DEG
  const Jrise = Jtransit - H / 360
  const Jset = Jtransit + H / 360
  return {
    sunrise: new Date((Jrise - 2440587.5) * 86400000),
    sunset: new Date((Jset - 2440587.5) * 86400000),
    alwaysUp: false,
    alwaysDown: false,
  }
}

/**
 * 黄昏の進行度 0..1。
 * 日没の 10 分前に始まり、約 1 時間かけて 1（＝完全な夜・リラックス）へ。
 * 気づかないほどゆっくりと移行させるための連続値。
 */
export function twilightProgress(now: Date, sunset: Date | null): number {
  if (!sunset) return 0
  const start = sunset.getTime() - 10 * 60000
  const end = sunset.getTime() + 50 * 60000
  const t = now.getTime()
  if (t <= start) return 0
  if (t >= end) return 1
  return (t - start) / (end - start)
}

/** JST など端末ロケールの HH:MM 表記。 */
export function formatClock(date: Date | null): string {
  if (!date) return '--:--'
  return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
}
