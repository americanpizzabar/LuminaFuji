export interface LightingScene {
  id: string
  nameJa: string
  nameEn: string
  brightness: number
  icon: string
  description: string
}

export interface Zone {
  id: string
  nameJa: string
  nameEn: string
  isOn: boolean
  brightness: number
}

/**
 * OLEDWorks Brite 3 は色温度固定（電球色 3000K）の有機ELパネル。
 * CRI > 90 / R9 > 50。調色機能は持たないため、本アプリでは明るさ（調光）のみを制御する。
 */
export const FIXED_CCT = 3000
export const FIXED_CCT_LABEL = '電球色 3000K'

/**
 * シーン = 明るさ（ムード）プリセット。色温度は固定のため brightness のみが変化する。
 * OLED は調光するほど自然に暖色化する（dim-to-warm）ため、暗いシーンほど温かみが増す。
 */
export const SCENES: LightingScene[] = [
  {
    id: 'dawn',
    nameJa: '夜明け',
    nameEn: 'Dawn',
    brightness: 15,
    icon: '🌅',
    description: '柔らかな夜明けの光',
  },
  {
    id: 'morning',
    nameJa: '朝',
    nameEn: 'Morning',
    brightness: 70,
    icon: '☀️',
    description: '清々しい朝の光',
  },
  {
    id: 'day',
    nameJa: '昼',
    nameEn: 'Daytime',
    brightness: 100,
    icon: '🌤',
    description: '明るく活発な昼の光',
  },
  {
    id: 'dusk',
    nameJa: '夕暮れ',
    nameEn: 'Dusk',
    brightness: 40,
    icon: '🌇',
    description: '暖かな夕暮れの光',
  },
  {
    id: 'evening',
    nameJa: 'くつろぎ',
    nameEn: 'Relax',
    brightness: 25,
    icon: '🛋️',
    description: 'リラックスのための暖かな光',
  },
  {
    id: 'reading',
    nameJa: '読書',
    nameEn: 'Reading',
    brightness: 60,
    icon: '📖',
    description: '目に優しい読書の光',
  },
  {
    id: 'sleep',
    nameJa: '就寝',
    nameEn: 'Sleep',
    brightness: 5,
    icon: '🌙',
    description: '眠りを誘う最小限の光',
  },
]

export const DEFAULT_ZONES: Zone[] = [
  { id: 'living', nameJa: 'リビング', nameEn: 'Living Room', isOn: true, brightness: 70 },
  { id: 'bedroom', nameJa: '寝室', nameEn: 'Bedroom', isOn: true, brightness: 30 },
  { id: 'bathroom', nameJa: 'バスルーム', nameEn: 'Bathroom', isOn: false, brightness: 50 },
  { id: 'entrance', nameJa: 'エントランス', nameEn: 'Entrance', isOn: true, brightness: 60 },
]

/**
 * 明るさに応じた発光色を返す（OLED の dim-to-warm 特性を再現）。
 * 色温度は固定だが、調光すると物理的に暖色へシフトする現象を視覚化する。
 *   brightness 100% → 電球色 3000K に近い warm white ≈ rgb(255,197,143)
 *   brightness   0% → 深い飴色のキャンドル光 ≈ rgb(255,128,46)
 */
export function brightnessToWarmRgb(brightness: number): string {
  const t = Math.max(0, Math.min(1, brightness / 100))
  const r = 255
  const g = Math.round(128 + 69 * t)
  const b = Math.round(46 + 97 * t)
  return `rgb(${r}, ${g}, ${b})`
}

/** 固定色温度（3000K）の代表色。プレビュー等の静的表示用。 */
export function fixedCctRgb(): string {
  return brightnessToWarmRgb(100)
}
