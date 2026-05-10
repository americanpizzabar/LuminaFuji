'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ChevronDown, Wifi, Car, Coffee, Clock, Phone, Info } from 'lucide-react'
import Link from 'next/link'

interface GuideSection {
  id: string
  icon: React.ReactNode
  title: string
  items: { label: string; value: string }[]
}

const guideSections: GuideSection[] = [
  {
    id: 'basics',
    icon: <Clock size={16} />,
    title: 'チェックイン / アウト',
    items: [
      { label: 'チェックイン', value: '16:00〜22:00' },
      { label: 'チェックアウト', value: '〜11:00' },
      { label: '延長', value: '事前にご相談ください' },
      { label: 'セルフチェックイン', value: 'スマートロック対応' },
    ],
  },
  {
    id: 'wifi',
    icon: <Wifi size={16} />,
    title: 'Wi-Fi / インターネット',
    items: [
      { label: 'ネットワーク名', value: 'LuminaFuji_5G' },
      { label: 'パスワード', value: 'fuji2024view' },
      { label: '速度', value: '最大 1Gbps (光回線)' },
      { label: 'デバイス数', value: '無制限' },
    ],
  },
  {
    id: 'amenities',
    icon: <Coffee size={16} />,
    title: 'アメニティ / 設備',
    items: [
      { label: 'キッチン', value: 'IH コンロ 2口、電子レンジ、炊飯器' },
      { label: 'バスルーム', value: 'シャワー、バスタブ、ドライヤー' },
      { label: '寝具', value: 'シモンズ製ベッド、羽毛布団' },
      { label: 'ランドリー', value: 'ドラム式洗濯乾燥機' },
      { label: 'エアコン', value: '全室完備 (床暖房あり)' },
      { label: '駐車場', value: '2台分（無料）' },
      { label: 'BBQ', value: '庭でのバーベキュー可（要事前連絡）' },
      { label: 'ペット', value: '不可' },
    ],
  },
  {
    id: 'lighting',
    icon: <span className="text-sm">✦</span>,
    title: 'ECUANEST 照明の使い方',
    items: [
      { label: '操作方法', value: 'このアプリの「照明」タブから操作' },
      { label: '対応エリア', value: 'リビング・寝室・バスルーム・エントランス' },
      { label: 'プリセット', value: '夜明け・朝・昼・夕暮れ・くつろぎ・読書・就寝' },
      { label: '色温度', value: '2,700K〜6,500K 無段階調整' },
      { label: 'ご注意', value: '照明機器には直接触れないでください' },
    ],
  },
  {
    id: 'rules',
    icon: <Info size={16} />,
    title: '利用上のルール',
    items: [
      { label: '禁煙', value: '屋内全面禁煙（屋外喫煙可）' },
      { label: '騒音', value: '22:00〜8:00 は静粛に' },
      { label: 'ゴミ', value: '分別の上、所定の場所へ' },
      { label: '火気', value: '指定場所以外での火気使用禁止' },
      { label: '追加ゲスト', value: '届出以外のゲスト宿泊不可' },
    ],
  },
  {
    id: 'contact',
    icon: <Phone size={16} />,
    title: '緊急連絡先',
    items: [
      { label: 'ホスト', value: '+81-555-XX-XXXX' },
      { label: '警察', value: '110' },
      { label: '消防・救急', value: '119' },
      { label: '最寄り病院', value: '山中湖村立病院（車5分）' },
    ],
  },
]

function AccordionItem({ section }: { section: GuideSection }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="card overflow-hidden mb-3">
      <button
        className="w-full flex items-center gap-3 px-5 py-4 text-left"
        onClick={() => setOpen(!open)}
      >
        <div className="w-8 h-8 rounded-xl bg-zinc-800 flex items-center justify-center text-gold-400 flex-shrink-0">
          {section.icon}
        </div>
        <span className="flex-1 text-sm font-medium text-zinc-200">{section.title}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={16} className="text-zinc-500" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 border-t border-zinc-800">
              <div className="divide-y divide-zinc-800/50">
                {section.items.map(({ label, value }) => (
                  <div key={label} className="flex gap-3 py-3">
                    <span className="text-xs text-zinc-500 flex-shrink-0 w-24 leading-relaxed">{label}</span>
                    <span className="text-xs text-zinc-300 leading-relaxed">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function GuidePage() {
  return (
    <div className="page-container">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard" className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-all">
          <ArrowLeft size={18} className="text-zinc-300" />
        </Link>
        <div>
          <h1 className="text-lg font-medium text-zinc-100">施設ガイド</h1>
          <p className="text-xs text-zinc-500">Facility Guide</p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="card p-4 mb-6 flex items-center gap-3 border-gold-500/20 bg-gradient-to-r from-amber-950/20 to-zinc-900">
          <span className="text-2xl">🏔️</span>
          <div>
            <p className="text-sm font-medium text-zinc-200">Lumina Fuji Residence</p>
            <p className="text-xs text-zinc-500">山梨県南都留郡山中湖村 · 山中湖畔</p>
          </div>
        </div>

        <div>
          {guideSections.map((section) => (
            <AccordionItem key={section.id} section={section} />
          ))}
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-zinc-600">
            ご不明な点はコンシェルジュチャットへ
          </p>
          <Link href="/dashboard/chat" className="text-xs text-gold-400 hover:text-gold-300 mt-1 inline-block">
            チャットで相談する →
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
