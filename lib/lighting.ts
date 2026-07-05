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

/**
 * サイレント・オンボーディング: 到着時コンディション → 適用プリセット。
 * ArrivalCheck（記録）と照明ページ（初期シーン適用）の両方が参照する唯一の定義。
 */
export const ARRIVAL_PRESETS: Record<'rest' | 'refresh' | 'explore', { sceneId: string; sceneName: string; brightness: number }> = {
  rest:    { sceneId: 'sleep',   sceneName: 'Sleep',   brightness: 5 },
  refresh: { sceneId: 'morning', sceneName: 'Morning', brightness: 80 },
  explore: { sceneId: 'evening', sceneName: 'Relax',   brightness: 70 },
}

/** 各シーンの詩的な名前と情景テキスト（ライティング・オーケストレーション用）。 */
export const SCENE_POETRY: Record<string, { poeticName: string; verse: string; bgmHint: string }> = {
  dawn: {
    poeticName: '夜明けの詩',
    verse: '闇が静かに溶け、最初の光が地平を染める。世界はまだ息をひそめている。',
    bgmHint: 'ピアノ・ソロ / 琴の独奏',
  },
  morning: {
    poeticName: '清朝の光',
    verse: '透き通る朝の空気に、清冽な光が踊る。富士の稜線が鮮やかに浮かび上がる。',
    bgmHint: 'ジャズ・モーニング / アコースティック',
  },
  day: {
    poeticName: '高原の白昼',
    verse: '山の頂が輝き、影は短く意志は明確。光は遠慮なく、しかし穏やかに満ちる。',
    bgmHint: 'ボサノバ / チェンバーポップ',
  },
  dusk: {
    poeticName: '黄金の刻',
    verse: '太陽が西へ傾く。光は金色に熟し、温もりが空気を染める。時間が緩む。',
    bgmHint: 'ジャズ・バラード / シネマスコア',
  },
  evening: {
    poeticName: '宵の静寂',
    verse: '世界は柔らかくなり、言葉が少なくなる。光は主張をやめ、ただそこにある。',
    bgmHint: 'アンビエント / ローファイ',
  },
  reading: {
    poeticName: '書斎の灯台',
    verse: '思考を照らす、静かで揺るぎない光。集中と安らぎが、ひとつの場所に宿る。',
    bgmHint: 'クラシック / インストゥルメンタル',
  },
  sleep: {
    poeticName: '星明かりの揺り籠',
    verse: '瞼が重くなる。光はそっと囁き、意識を夢の縁へと、ゆっくりと誘う。',
    bgmHint: 'ホワイトノイズ / 雨の音',
  },
}
