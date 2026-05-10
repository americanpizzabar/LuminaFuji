'use client'

export interface LightingScene {
  id: string
  nameJa: string
  nameEn: string
  brightness: number
  colorTemp: number
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

export const SCENES: LightingScene[] = [
  {
    id: 'dawn',
    nameJa: '夜明け',
    nameEn: 'Dawn',
    brightness: 15,
    colorTemp: 2700,
    icon: '🌅',
    description: '柔らかな夜明けの光',
  },
  {
    id: 'morning',
    nameJa: '朝',
    nameEn: 'Morning',
    brightness: 70,
    colorTemp: 4000,
    icon: '☀️',
    description: '清々しい朝の光',
  },
  {
    id: 'day',
    nameJa: '昼',
    nameEn: 'Daytime',
    brightness: 100,
    colorTemp: 5000,
    icon: '🌤',
    description: '明るく活発な昼の光',
  },
  {
    id: 'dusk',
    nameJa: '夕暮れ',
    nameEn: 'Dusk',
    brightness: 40,
    colorTemp: 2900,
    icon: '🌇',
    description: '暖かな夕暮れの光',
  },
  {
    id: 'evening',
    nameJa: 'くつろぎ',
    nameEn: 'Relax',
    brightness: 25,
    colorTemp: 2700,
    icon: '🕯️',
    description: 'リラックスのための暖かな光',
  },
  {
    id: 'reading',
    nameJa: '読書',
    nameEn: 'Reading',
    brightness: 60,
    colorTemp: 4500,
    icon: '📖',
    description: '目に優しい読書用の光',
  },
  {
    id: 'sleep',
    nameJa: '就寝',
    nameEn: 'Sleep',
    brightness: 5,
    colorTemp: 2700,
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

export function colorTempToRgb(kelvin: number): string {
  const t = (kelvin - 2700) / (6500 - 2700)
  const r = Math.round(255)
  const g = Math.round(200 + 55 * t)
  const b = Math.round(100 + 155 * t)
  return `rgb(${r}, ${g}, ${b})`
}

export function getColorTempLabel(kelvin: number): string {
  if (kelvin <= 2900) return '電球色'
  if (kelvin <= 3500) return '温白色'
  if (kelvin <= 4500) return '白色'
  if (kelvin <= 5500) return '昼白色'
  return '昼光色'
}
