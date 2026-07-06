'use client'

/**
 * 「五感の記憶」を持ち帰るデジタル・チェックアウト。
 * チェックアウトの瞬間に、滞在中の"光の記憶"をショートムービー風のカードとして生成する。
 * 実際に記録された照明データ（最も灯したシーン・お気に入りエリア・操作回数）から構成し、
 * すぐ下に「この光環境を自宅に再現する」導線（ECUANEST コンサルティング）を置く。
 */

import { useMemo , useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { X, Sparkles, ArrowRight, Clock, Layers, MapPin } from 'lucide-react'
import { useStore } from '@/lib/useStore'
import { getLightingAnalytics, getZoneAnalytics, recordEngagement } from '@/lib/store'
import { SCENES, DEFAULT_ZONES } from '@/lib/lighting'
import SceneVisual from '@/components/SceneVisual'
import { hapticSuccess } from '@/lib/haptics'

export default function MemoryCard({ open, onClose }: { open: boolean; onClose: () => void }) {
  // 体験エンゲージメント: カードが開かれた回数を匿名集計する
  useEffect(() => { if (open) recordEngagement('memory_opened') }, [open])

  const [store] = useStore()

  const data = useMemo(() => {
    const analytics = getLightingAnalytics(store)
    const zones = getZoneAnalytics(store)
    const topSceneObj = analytics.topScene ? SCENES.find(s => s.nameEn === analytics.topScene!.name) : null
    const topZone = zones.topZoneId ? DEFAULT_ZONES.find(z => z.id === zones.topZoneId) : null
    const distinct = Object.keys(analytics.sceneCounts).length
    const nights = store.guestInfo?.checkIn && store.guestInfo?.checkOut
      ? Math.max(1, Math.round((new Date(store.guestInfo.checkOut).getTime() - new Date(store.guestInfo.checkIn).getTime()) / 86400000))
      : null
    return { analytics, topSceneObj, topZone, distinct, nights }
  }, [store])

  const { analytics, topSceneObj, topZone, distinct, nights } = data
  const ease = [0.22, 1, 0.36, 1] as const
  const firstName = store.guestInfo?.name?.split(' ')[0] ?? ''

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.14, delayChildren: 0.5 } },
  }
  const item = {
    hidden: { opacity: 0, y: 16, filter: 'blur(6px)' },
    show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease } },
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="memory-card"
          className="fixed inset-0 z-[130] overflow-y-auto flex items-start justify-center py-10 px-5"
          style={{ background: 'rgba(7,5,4,0.92)', backdropFilter: 'blur(8px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease }}
        >
          {/* 立ち上がる暖色の光（ショートムービーの導入） */}
          <motion.div
            className="fixed inset-0 pointer-events-none"
            style={{
              transformOrigin: 'bottom',
              background: 'linear-gradient(to top, rgba(255,157,92,0.22) 0%, rgba(255,184,119,0.08) 40%, transparent 75%)',
            }}
            initial={{ scaleY: 0, opacity: 0.4 }}
            animate={{ scaleY: 1, opacity: 1 }}
            transition={{ duration: 1.8, ease }}
          />

          <motion.div
            className="relative w-full max-w-[400px] rounded-[28px] overflow-hidden"
            style={{
              background: 'linear-gradient(165deg, rgba(26,23,20,0.96) 0%, rgba(13,10,8,0.96) 100%)',
              border: '1px solid rgba(255,157,92,0.22)',
              boxShadow: '0 30px 80px -20px rgba(0,0,0,0.8), 0 0 60px -20px rgba(255,157,92,0.3), inset 0 1px 0 rgba(255,209,163,0.15)',
            }}
            initial={{ opacity: 0, y: 26, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, ease }}
          >
            {/* グロー */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-64 h-40 pointer-events-none"
                 style={{ background: 'radial-gradient(ellipse, rgba(255,157,92,0.25) 0%, transparent 70%)', filter: 'blur(24px)' }} />

            {/* 閉じる */}
            <button onClick={onClose}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <X size={15} className="text-zinc-400" />
            </button>

            <motion.div variants={container} initial="hidden" animate="show" className="relative p-7">
              {/* ヘッダー */}
              <motion.div variants={item} className="text-center mb-6">
                <div className="flex items-center justify-center gap-1.5 mb-3">
                  <Sparkles size={13} className="text-ember-400" />
                  <span className="text-[11px] tracking-[0.3em] uppercase text-ember-300/80">Memory of Light</span>
                  <Sparkles size={13} className="text-ember-400" />
                </div>
                <h2 className="font-serif text-3xl text-emissive leading-tight">光の記憶</h2>
                <p className="text-xs text-zinc-400 mt-2">
                  {firstName && <>{firstName} 様が Lumina Fuji で過ごした光</>}
                  {nights && <span className="text-zinc-500"> · {nights}泊</span>}
                </p>
              </motion.div>

              {analytics.totalEvents > 0 ? (
                <>
                  {/* 主役の光 */}
                  {topSceneObj && (
                    <motion.div variants={item} className="rounded-3xl p-5 mb-3 relative overflow-hidden"
                      style={{ background: 'linear-gradient(135deg, rgba(255,157,92,0.12) 0%, rgba(13,10,8,0.4) 100%)', border: '1px solid rgba(255,157,92,0.18)' }}>
                      <p className="text-[11px] text-ember-300/80 tracking-wide mb-3">最も長く灯した光</p>
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 flex-shrink-0">
                          <SceneVisual id={topSceneObj.id} detailed />
                        </div>
                        <div>
                          <p className="font-serif text-2xl text-zinc-50">{topSceneObj.nameJa}</p>
                          <p className="text-xs text-zinc-400 mt-0.5">{topSceneObj.nameEn} · {analytics.topScene!.count}回</p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* スタッツ行 */}
                  <motion.div variants={item} className="grid grid-cols-2 gap-3 mb-3">
                    <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <Clock size={14} className="text-ember-400 mb-2" />
                      <p className="text-2xl font-light tabular-nums text-zinc-100">{analytics.totalEvents}</p>
                      <p className="text-[11px] text-zinc-400">光を灯した回数</p>
                    </div>
                    <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <Layers size={14} className="text-ember-400 mb-2" />
                      <p className="text-2xl font-light tabular-nums text-zinc-100">{distinct}</p>
                      <p className="text-[11px] text-zinc-400">出会った光の種類</p>
                    </div>
                  </motion.div>

                  {/* お気に入りエリア */}
                  {topZone && (
                    <motion.div variants={item} className="rounded-2xl p-4 mb-5 flex items-center gap-3"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                           style={{ background: 'rgba(255,157,92,0.12)', border: '1px solid rgba(255,157,92,0.2)' }}>
                        <MapPin size={15} className="text-ember-400" />
                      </div>
                      <div>
                        <p className="text-[11px] text-zinc-400">お気に入りの照明エリア</p>
                        <p className="text-sm font-medium text-zinc-100">{topZone.nameJa}<span className="text-zinc-500 text-xs"> · {topZone.nameEn}</span></p>
                      </div>
                    </motion.div>
                  )}
                </>
              ) : (
                <motion.p variants={item} className="text-center text-sm text-zinc-400 leading-relaxed mb-6">
                  またのご滞在で、あなただけの光の物語を紡いでください。
                </motion.p>
              )}

              {/* 圧倒的導線：自宅に再現する */}
              <motion.div variants={item}>
                <p className="text-center text-xs text-zinc-400 leading-relaxed mb-3">
                  この光の環境を、ご自宅にも。<br />
                  パネル・ドライバー・配置データまで、専門家が再現します。
                </p>
                <Link href="/dashboard/consult" onClick={() => { hapticSuccess(); onClose() }}>
                  <button className="btn-ember w-full flex items-center justify-center gap-2 lf-glow"
                          style={{ ['--lf-glow-color' as any]: 'rgba(255,157,92,0.6)' }}>
                    この光をご自宅に再現する <ArrowRight size={16} />
                  </button>
                </Link>
                <p className="text-center text-[10px] text-zinc-500 mt-2.5">ECUANEST 照明コンサルティング</p>
              </motion.div>

              <motion.button variants={item} onClick={onClose}
                className="w-full mt-4 py-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
                閉じる
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
