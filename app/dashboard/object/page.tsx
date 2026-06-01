'use client'

/**
 * 一期一会 · オブジェクト・リンク。
 * 客室の伝統工芸品（輪島塗の器など）に埋め込まれたQRコードから遷移してくる特別ページ。
 * スキャンした瞬間、照明が「茶の湯モード」へ移行し、職人のストーリーが展開される。
 */

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, ChevronDown, ExternalLink } from 'lucide-react'
import { hapticCeremony, hapticSuccess } from '@/lib/haptics'

// Object definitions — indexed by `id` query param
const OBJECTS: Record<string, {
  nameJa:       string
  nameEn:       string
  artisan:      string
  region:       string
  craft:        string
  description:  string
  story:        string
  lighting: {
    brightness: number
    sceneName:  string
    ambience:   string
  }
}> = {
  wajima: {
    nameJa:     '輪島塗の器',
    nameEn:     'Wajima Lacquerware',
    artisan:    '山岸 一雄',
    region:     '石川県輪島市',
    craft:      '輪島塗',
    description: '400年の伝統を受け継ぐ輪島塗。本堅地技法による幾重もの漆の積み重ねが、温かみのある深みを生み出します。',
    story:       '一つの器が完成するまでに、120以上の工程を経ます。下地から上塗りまで、すべての工程を職人が手がけ、その一つひとつに数日から数週間を要します。そのため、輪島塗の器は使えば使うほど味が増し、次の世代へと受け継がれていきます。',
    lighting: {
      brightness: 12,
      sceneName:  '茶の湯',
      ambience:   '漆器の奥深い黒と赤が最も美しく輝く光量へ、照明を調整しました',
    },
  },
  kyoto: {
    nameJa:     '京焼の茶碗',
    nameEn:     'Kyoto-yaki Tea Bowl',
    artisan:    '清水 五条',
    region:     '京都市東山区',
    craft:      '京焼・清水焼',
    description: '千利休の時代から続く京焼。一点一点が職人の手によって成形され、釉薬の表情は二つと同じものがありません。',
    story:       '茶碗は「見る」ものではなく「感じる」ものです。手の中に収まる温かさ、釉薬のざらりとした感触、そしてお茶の香りとともに広がる空間。このすべてが茶の湯の体験を構成しています。',
    lighting: {
      brightness: 10,
      sceneName:  '侘び',
      ambience:   '京焼の繊細な釉薬の陰影を引き立てる、穏やかな茶室の光に',
    },
  },
}

function ObjectPageInner() {
  const searchParams = useSearchParams()
  const id           = searchParams.get('id') ?? 'wajima'
  const object       = OBJECTS[id] ?? OBJECTS.wajima

  const [phase,       setPhase]       = useState<'entering' | 'story' | 'expanded'>('entering')
  const [storyShown,  setStoryShown]  = useState(false)
  const ease = [0.22, 1, 0.36, 1] as const

  useEffect(() => {
    // Entry ceremony
    hapticCeremony()
    const t1 = setTimeout(() => setPhase('story'), 2200)
    return () => clearTimeout(t1)
  }, [])

  const brightness = object.lighting.brightness

  return (
    <div className="fixed inset-0 overflow-y-auto" style={{ background: '#030201' }}>

      {/* Ambient warm pool — simulates lacquerware glow at floor level */}
      <motion.div className="fixed inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse 80% 60% at 50% 85%, rgba(255,140,60,${brightness / 100 * 0.22}) 0%, transparent 60%)` }}
        initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:2.5 }} />

      {/* Fine particle shimmer (lacquer surface reflection) */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex:1 }}>
        {Array.from({ length: 18 }, (_, i) => {
          const x = ((i * 1618033) % 10000) / 100
          const y = 30 + ((i * 2718281) % 7000) / 100
          const s = 1 + (i % 3) * 0.7
          const dur = 4 + (i % 5)
          const delay = -(i % 7)
          return (
            <motion.div key={i} className="absolute rounded-full"
              style={{ left:`${x}%`, top:`${y}%`, width:s, height:s, background:`rgba(255,200,120,${0.08 + (i%4)*0.04})` }}
              animate={{ opacity:[0.2, 0.8, 0.2], y:[0, -4, 0] }}
              transition={{ duration:dur, delay, repeat:Infinity, ease:'easeInOut' }}
            />
          )
        })}
      </div>

      {/* ── Entering phase ── */}
      <AnimatePresence>
        {phase === 'entering' && (
          <motion.div key="entering"
            className="fixed inset-0 flex items-center justify-center z-20"
            style={{ background:'rgba(3,2,1,0.98)' }}
            exit={{ opacity:0 }} transition={{ duration:1.2 }}>
            <div className="text-center">
              <motion.div className="w-16 h-16 mx-auto mb-6 rounded-full"
                style={{ background:'rgba(255,157,92,0.08)', border:'1px solid rgba(255,157,92,0.2)' }}
                animate={{ scale:[0.9, 1.05, 0.95, 1], opacity:[0.6, 1, 0.8, 1] }}
                transition={{ duration:2, ease }}>
                <div className="w-full h-full flex items-center justify-center">
                  <svg viewBox="0 0 40 40" fill="none" className="w-6 h-6">
                    <path d="M20,4 Q28,12 28,20 Q28,30 20,36 Q12,30 12,20 Q12,12 20,4 Z"
                      fill="rgba(255,157,92,0.2)" stroke="rgba(255,157,92,0.6)" strokeWidth="0.8" />
                  </svg>
                </div>
              </motion.div>
              <motion.p className="text-xs tracking-[0.35em] uppercase"
                style={{ color:'rgba(255,157,92,0.5)' }}
                animate={{ opacity:[0.4, 1, 0.4] }} transition={{ duration:1.5, repeat:Infinity }}>
                {object.lighting.sceneName} — 光の調整中
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Story phase ── */}
      <AnimatePresence>
        {(phase === 'story' || phase === 'expanded') && (
          <motion.div key="content"
            className="relative z-10 min-h-screen pb-32"
            initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:0.8 }}>

            <div className="max-w-[430px] mx-auto px-4">

              {/* Back + lighting note */}
              <div className="flex items-center justify-between pt-6 pb-4">
                <Link href="/dashboard/lighting"
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)' }}>
                  <ArrowLeft size={17} className="text-zinc-300" />
                </Link>
                <motion.div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px]"
                  style={{ background:'rgba(255,157,92,0.08)', border:'1px solid rgba(255,157,92,0.15)', color:'rgba(255,157,92,0.7)' }}
                  initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.5 }}>
                  <motion.span className="w-1.5 h-1.5 rounded-full bg-ember-400"
                    animate={{ opacity:[0.5,1,0.5] }} transition={{ duration:1.5, repeat:Infinity }} />
                  {object.lighting.sceneName} · {brightness}%
                </motion.div>
              </div>

              {/* Object identity */}
              <motion.div className="mb-8"
                initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
                transition={{ delay:0.2, duration:0.7, ease }}>
                <p className="text-[10px] tracking-[0.35em] uppercase mb-3"
                   style={{ color:'rgba(255,157,92,0.45)' }}>
                  一期一会 · Object Story
                </p>
                <h1 className="font-serif text-3xl text-zinc-50 leading-tight mb-1">
                  {object.nameJa}
                </h1>
                <p className="text-xs text-zinc-600 tracking-wide">{object.nameEn}</p>
              </motion.div>

              {/* Artisan card */}
              <motion.div className="mb-5 rounded-3xl p-5 relative overflow-hidden"
                style={{ background:'linear-gradient(145deg, rgba(255,157,92,0.07) 0%, rgba(8,6,4,0.5) 100%)', border:'1px solid rgba(255,157,92,0.16)' }}
                initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }}
                transition={{ delay:0.35, duration:0.6, ease }}>
                <div className="absolute -top-4 right-4 w-20 h-20 pointer-events-none"
                     style={{ background:'radial-gradient(circle, rgba(255,157,92,0.15) 0%, transparent 70%)', filter:'blur(12px)' }} />
                <div className="relative">
                  <p className="text-[10px] tracking-[0.22em] uppercase mb-3"
                     style={{ color:'rgba(255,157,92,0.45)' }}>職人</p>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                         style={{ background:'rgba(255,157,92,0.1)', border:'1px solid rgba(255,157,92,0.2)' }}>
                      ✦
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-100">{object.artisan}</p>
                      <p className="text-xs text-zinc-600">{object.region} · {object.craft}</p>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {object.description}
                  </p>
                </div>
              </motion.div>

              {/* Lighting ambience note */}
              <motion.div className="mb-5 rounded-2xl px-4 py-3 flex items-start gap-3"
                style={{ background:'rgba(255,157,92,0.05)', border:'1px solid rgba(255,157,92,0.1)' }}
                initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.5 }}>
                <motion.div className="w-2 h-2 rounded-full bg-ember-400 flex-shrink-0 mt-1"
                  animate={{ opacity:[0.4, 1, 0.4] }} transition={{ duration:2, repeat:Infinity }} />
                <p className="text-xs text-zinc-400 leading-relaxed">{object.lighting.ambience}</p>
              </motion.div>

              {/* Artisan story — expandable */}
              <motion.div className="mb-6"
                initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
                transition={{ delay:0.6, duration:0.6, ease }}>
                <button
                  onClick={() => { hapticSuccess(); setStoryShown(v => !v); setPhase('expanded') }}
                  className="w-full rounded-3xl p-5 text-left"
                  style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] tracking-[0.2em] uppercase mb-1" style={{ color:'rgba(255,255,255,0.25)' }}>
                        職人の物語
                      </p>
                      <p className="text-sm font-light text-zinc-300">
                        この器が生まれた背景
                      </p>
                    </div>
                    <motion.div animate={{ rotate: storyShown ? 180 : 0 }} transition={{ duration:0.3 }}>
                      <ChevronDown size={18} className="text-zinc-500" />
                    </motion.div>
                  </div>

                  <AnimatePresence>
                    {storyShown && (
                      <motion.div
                        initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }}
                        exit={{ height:0, opacity:0 }} transition={{ duration:0.4 }}>
                        <p className="text-xs text-zinc-400 leading-relaxed pt-4 border-t border-white/5 mt-4">
                          {object.story}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </motion.div>

              {/* ECUANEST bridge */}
              <motion.div className="rounded-3xl p-5"
                style={{ background:'linear-gradient(165deg, rgba(18,13,9,0.97) 0%, rgba(8,6,4,0.97) 100%)', border:'1px solid rgba(255,157,92,0.22)' }}
                initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
                transition={{ delay:0.8, duration:0.6, ease }}>
                <p className="text-xs text-zinc-500 leading-relaxed mb-4 text-center">
                  この器と光の調和を、ご自宅でも。<br />
                  ECUANESTが照明空間ごとデザインします。
                </p>
                <Link href="/dashboard/consult">
                  <button className="btn-ember w-full flex items-center justify-center gap-2 lf-glow"
                          style={{ ['--lf-glow-color' as any]:'rgba(255,157,92,0.6)' }}>
                    照明コンサルティング <ExternalLink size={14} />
                  </button>
                </Link>
                <p className="text-center text-[10px] text-zinc-700 mt-2">ECUANEST · 一期一会プログラム</p>
              </motion.div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function ObjectPage() {
  return (
    <Suspense>
      <ObjectPageInner />
    </Suspense>
  )
}
