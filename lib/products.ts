export interface Product {
  id: string
  name: string
  tagline: string
  description: string
  price: string
  specs: Record<string, string>
  features: string[]
  category: 'panel' | 'wall' | 'strip' | 'modular'
  featured: boolean
  roomUsed: string[]
  accentColor: string
  gradient: string
}

export const products: Product[] = [
  {
    id: 'brite-3',
    name: 'Brite 3',
    tagline: '次世代有機ELパネル照明',
    description:
      'スペクトル制御技術による人体に最適化された光環境を実現。建築空間に融和する超薄型デザインで、均一で美しい面発光を提供します。このレジデンスのリビングで使用中のフラッグシップモデル。',
    price: '¥ 890,000〜',
    specs: {
      サイズ: '1200 × 600 mm',
      厚さ: '8 mm',
      輝度: '3,000 cd/m²',
      色温度: '2,700K – 6,500K (連続調光)',
      演色性: 'Ra 99',
      寿命: '100,000 時間',
      調光方式: 'DALI-2 / 0-10V',
      消費電力: '80 W',
      重量: '3.2 kg',
      保証: '5年',
    },
    features: ['スペクトル調光', 'フリッカーフリー', 'UV ゼロ', '無赤外線', '調光比 0.1%'],
    category: 'panel',
    featured: true,
    roomUsed: ['リビング', 'ダイニング', 'オフィス'],
    accentColor: '#fbbf24',
    gradient: 'from-amber-900/40 to-zinc-900',
  },
  {
    id: 'luna-series',
    name: 'Luna Series',
    tagline: '壁面装飾型有機EL',
    description:
      '壁に溶け込む超薄型デザイン。アート作品のような存在感と、心地よい均一な光が空間に柔らかな表情をもたらします。このレジデンスの寝室に設置されています。',
    price: '¥ 450,000〜',
    specs: {
      サイズ: '600 × 600 mm（カスタム対応）',
      厚さ: '5 mm',
      輝度: '2,000 cd/m²',
      色温度: '2,700K / 3,000K / 4,000K',
      演色性: 'Ra 97',
      寿命: '80,000 時間',
      調光方式: 'DALI-2',
      消費電力: '40 W',
      重量: '1.8 kg',
      保証: '3年',
    },
    features: ['壁面設置', 'カスタムサイズ', '均一発光', '意匠性'],
    category: 'wall',
    featured: true,
    roomUsed: ['寝室', '玄関', '廊下'],
    accentColor: '#818cf8',
    gradient: 'from-indigo-900/40 to-zinc-900',
  },
  {
    id: 'aria-strip',
    name: 'Aria Strip',
    tagline: 'フレキシブル有機ELライン',
    description:
      '曲面や変形空間に対応するフレキシブルOLELストリップ。建築の自由度を最大限に引き出し、間接照明として空間を立体的に演出します。',
    price: '¥ 180,000〜/m',
    specs: {
      幅: '50 mm',
      最大長: '5 m / 本',
      厚さ: '3 mm',
      輝度: '1,500 cd/m²',
      色温度: '2,700K – 5,000K',
      演色性: 'Ra 95',
      寿命: '60,000 時間',
      調光方式: 'PWM / DALI-2',
      消費電力: '25 W/m',
      防水: 'IP44',
    },
    features: ['フレキシブル', '間接照明', '曲面対応', '防水 IP44'],
    category: 'strip',
    featured: false,
    roomUsed: ['バスルーム', 'キッチン', '階段'],
    accentColor: '#34d399',
    gradient: 'from-emerald-900/40 to-zinc-900',
  },
  {
    id: 'nexus-module',
    name: 'Nexus Module',
    tagline: 'モジュラー有機ELシステム',
    description:
      '自由に組み合わせて拡張できるモジュール型OLELシステム。大型商業空間・ホテル・美術館の照明設計に最適なスケーラブルソリューション。',
    price: '¥ 240,000〜/ユニット',
    specs: {
      ユニットサイズ: '300 × 300 mm',
      厚さ: '10 mm',
      輝度: '4,000 cd/m²',
      色温度: '2,700K – 6,500K',
      演色性: 'Ra 98',
      寿命: '120,000 時間',
      調光方式: 'DALI-2 / KNX',
      消費電力: '60 W/ユニット',
      重量: '2.5 kg/ユニット',
      保証: '5年',
    },
    features: ['モジュラー設計', 'スケーラブル', 'KNX対応', '商業グレード'],
    category: 'modular',
    featured: false,
    roomUsed: ['ホール', 'ロビー', '商業空間', '美術館'],
    accentColor: '#f472b6',
    gradient: 'from-pink-900/40 to-zinc-900',
  },
]

export function getProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id)
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured)
}
