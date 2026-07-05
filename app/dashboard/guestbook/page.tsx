'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Heart, X, PenLine, Send } from 'lucide-react'
import Link from 'next/link'
import { useStore } from '@/lib/useStore'
import { expOf } from '@/lib/store'
import FeatureUnavailable from '@/components/FeatureUnavailable'
import { addGuestbookPost, likeGuestbookPost, getStore } from '@/lib/store'
import { usePhase } from '@/lib/phase'
import { useLanguage } from '@/lib/useLanguage'
import { hapticTap, hapticSuccess } from '@/lib/haptics'

const EMOJI_OPTIONS = ['✨', '🌅', '🏔️', '💡', '🌙', '🌸', '⭐', '🎉', '🫶', '🗻']

function hashPost(id: string) {
  let h = 0x811c9dc5
  for (let i = 0; i < id.length; i++) {
    h = ((Math.imul(h, 0x01000193) ^ id.charCodeAt(i)) >>> 0)
  }
  const h2 = (Math.imul(h ^ (h >>> 16), 0x45d9f3b)) >>> 0
  const h3 = (Math.imul(h2 ^ (h2 >>> 17), 0xa86d3)) >>> 0
  return {
    x:        (h3 & 0xffff) / 0xffff * 74 + 13,
    y:        (h3 >>> 16)   / 0xffff * 62 + 19,
    size:     3.5 + (h2 & 0x7f) / 127 * 8.5,
    animDur:  5   + (h  & 0x0f) / 15  * 6,
    animDelay: -((h >> 4 & 0x7f) / 127) * 9,
    warm:     0.55 + (h >> 12 & 0x3f) / 63 * 0.45,
  }
}

function GuestbookInner() {
  const [store, update] = useStore()
  const { guestInfo }   = usePhase()
  const { t }           = useLanguage()

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showForm,   setShowForm]   = useState(false)
  const [message,    setMessage]    = useState('')
  const [emoji,      setEmoji]      = useState('✨')
  const [submitting, setSubmitting] = useState(false)
  const [liked,      setLiked]      = useState<Set<string>>(new Set())
  const [newBornId,  setNewBornId]  = useState<string | null>(null)

  const visiblePosts = store.guestbookPosts.filter((p: any) => p.visible)
  const selectedPost = visiblePosts.find((p: any) => p.id === selectedId) ?? null

  const handleLike = useCallback((id: string) => {
    if (liked.has(id)) return
    hapticTap()
    setLiked(prev => { const s = new Set(prev); s.add(id); return s })
    likeGuestbookPost(id)
    update({ guestbookPosts: getStore().guestbookPosts })
  }, [liked, update])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 500))
    addGuestbookPost({
      author:  guestInfo?.name        ?? 'Guest',
      country: guestInfo?.nationality ?? 'Japan',
      flag:    guestInfo?.flag        ?? '🌏',
      message: message.trim(),
      emoji,
      date: new Date().toISOString().split('T')[0],
    })
    const newPosts = getStore().guestbookPosts
    const newest   = newPosts[newPosts.length - 1]
    update({ guestbookPosts: newPosts })
    if (newest?.id) { setNewBornId(newest.id); setTimeout(() => setNewBornId(null), 2500) }
    hapticSuccess()
    setMessage(''); setEmoji('✨'); setShowForm(false); setSubmitting(false)
  }

  return (
    <div className="fixed inset-0 overflow-hidden select-none"
         style={{ background: 'radial-gradient(ellipse at 50% 40%, #0e0807 0%, #050304 100%)' }}>

      {/* Nebula ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute" style={{ width:'60%', height:'50%', top:'20%', left:'20%', background:'radial-gradient(ellipse, rgba(255,157,92,0.032) 0%, transparent 70%)', filter:'blur(50px)' }} />
        <div className="absolute" style={{ width:'40%', height:'40%', top:'45%', left:'55%', background:'radial-gradient(ellipse, rgba(139,92,246,0.022) 0%, transparent 70%)', filter:'blur(60px)' }} />
      </div>

      {/* Decorative background stars */}
      {Array.from({ length: 70 }, (_, i) => {
        const x  = ((i * 1618034 + 2718281) % 9973) / 9973 * 100
        const y  = ((i * 2718281 + 1618034) % 9967) / 9967 * 100
        const s  = 0.4 + (i % 4) * 0.35
        const op = 0.05 + (i % 7) * 0.015
        return <div key={i} className="absolute rounded-full bg-white pointer-events-none"
                    style={{ left:`${x}%`, top:`${y}%`, width:s, height:s, opacity:op }} />
      })}

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4"
           style={{ paddingTop:'max(env(safe-area-inset-top,0px),24px)', paddingBottom:16,
                    background:'linear-gradient(to bottom, rgba(5,3,4,0.97) 55%, transparent)' }}>
        <div className="flex items-center gap-3">
          <Link href="/dashboard"
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)' }}>
            <ArrowLeft size={18} className="text-zinc-300" />
          </Link>
          <div>
            <h1 className="text-base font-light text-zinc-100 tracking-wide">星々の声</h1>
            <p className="text-xs text-zinc-600">{visiblePosts.length} memories in the light</p>
          </div>
        </div>
        <button onClick={() => { hapticTap(); setShowForm(true) }}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all"
          style={{ background:'rgba(255,157,92,0.1)', border:'1px solid rgba(255,157,92,0.22)', color:'#ffb877' }}>
          <PenLine size={13} />
          想いを記す
        </button>
      </div>

      {/* Star-field */}
      <div className="absolute inset-0">
        {visiblePosts.map((post: any) => {
          const pos       = hashPost(post.id)
          const isSel     = selectedId === post.id
          const isBorn    = newBornId  === post.id
          const extraLike = liked.has(post.id) ? 1 : 0
          const glow      = 0.38 + Math.min(post.likes + extraLike, 12) * 0.05
          const size      = pos.size + (post.likes + extraLike) * 0.35
          const rr = 255, gg = Math.round(164 + 56 * pos.warm), bb = Math.round(60 + 83 * pos.warm)

          return (
            <motion.button
              key={post.id}
              className="absolute"
              style={{
                left: `${pos.x}%`, top: `${pos.y}%`,
                width:      size + 36, height:     size + 36,
                marginLeft:-(size + 36) / 2, marginTop:-(size + 36) / 2,
              }}
              onClick={() => { hapticTap(); setSelectedId(isSel ? null : post.id) }}
              initial={isBorn ? { scale:0, opacity:0 } : false}
              animate={isBorn ? { scale:[0, 2.2, 1.1, 1], opacity:[0, 1, 1, 1] } : {}}
              transition={isBorn ? { duration:1.0, ease:[0.34,1.56,0.64,1] } : undefined}
            >
              {/* Outer halo */}
              <motion.div className="absolute inset-0 rounded-full pointer-events-none"
                style={{ background:`radial-gradient(circle, rgba(${rr},${gg},${bb},${glow * 0.4}) 0%, transparent 65%)` }}
                animate={{ scale:[1, 1.2, 1], opacity:[0.5, 1, 0.5] }}
                transition={{ duration:pos.animDur, delay:pos.animDelay, repeat:Infinity, ease:'easeInOut' }}
              />
              {/* Core ember */}
              <motion.div className="absolute rounded-full pointer-events-none"
                style={{
                  width:size, height:size,
                  top:'50%', left:'50%', marginTop:-size/2, marginLeft:-size/2,
                  background:`radial-gradient(circle, rgba(255,225,170,${pos.warm}) 0%, rgba(${rr},${gg},${bb},${pos.warm*0.95}) 45%, rgba(180,80,20,0.5) 100%)`,
                  boxShadow: isSel
                    ? `0 0 ${size*3}px rgba(${rr},${gg},${bb},0.85), 0 0 ${size}px rgba(255,225,170,1)`
                    : `0 0 ${size*1.6}px rgba(${rr},${gg},${bb},${glow}), 0 0 ${size*0.4}px rgba(255,225,170,${glow*0.9})`,
                  transition:'box-shadow 0.4s ease',
                }}
                animate={{ y:[0, pos.animDur>7?-5:-3, 0], scale:isSel?[1,1.1,1]:[1,0.95,1] }}
                transition={{ duration:pos.animDur, delay:pos.animDelay, repeat:Infinity, ease:'easeInOut' }}
              />
              {/* Emoji floating above when selected */}
              {isSel && (
                <motion.div className="absolute -top-8 left-1/2 -translate-x-1/2 text-lg pointer-events-none"
                  initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }}
                  style={{ filter:'drop-shadow(0 0 8px rgba(255,184,119,0.9))' }}>
                  {post.emoji}
                </motion.div>
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Floating hint */}
      {visiblePosts.length > 0 && !selectedPost && !showForm && (
        <motion.p className="absolute bottom-28 left-0 right-0 text-center text-[11px] text-zinc-700 pointer-events-none z-10"
          animate={{ opacity:[0.45, 0.85, 0.45] }} transition={{ duration:4.5, repeat:Infinity }}>
          光の粒に触れると、想いが紡がれます
        </motion.p>
      )}

      {/* Empty state */}
      {visiblePosts.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="text-4xl mb-3 opacity-25">✦</div>
            <p className="text-sm text-zinc-600">まだ星がありません</p>
            <p className="text-xs text-zinc-700 mt-1">最初の光を灯してください</p>
          </div>
        </div>
      )}

      {/* Selected message panel */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div key={selectedPost.id}
            className="absolute bottom-0 left-0 right-0 z-20 px-4 pb-10"
            initial={{ y:'100%', opacity:0 }} animate={{ y:0, opacity:1 }} exit={{ y:'100%', opacity:0 }}
            transition={{ type:'spring', damping:30, stiffness:300 }}>
            <div className="rounded-3xl p-6 relative overflow-hidden"
                 style={{ background:'linear-gradient(165deg, rgba(22,14,10,0.98) 0%, rgba(8,6,4,0.98) 100%)',
                          border:'1px solid rgba(255,157,92,0.2)', backdropFilter:'blur(28px)',
                          boxShadow:'0 -24px 60px rgba(0,0,0,0.7), 0 0 50px -15px rgba(255,157,92,0.15)' }}>
              {/* Top star glow */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-36 h-20 pointer-events-none"
                   style={{ background:'radial-gradient(ellipse, rgba(255,184,119,0.22) 0%, transparent 70%)', filter:'blur(10px)' }} />
              <div className="relative">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
                         style={{ background:'rgba(255,157,92,0.1)', border:'1px solid rgba(255,157,92,0.18)' }}>
                      {selectedPost.emoji}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-100">{selectedPost.author}</p>
                      <p className="text-xs text-zinc-600">{selectedPost.flag} {selectedPost.country} · {selectedPost.date}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedId(null)}
                          className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)' }}>
                    <X size={13} className="text-zinc-500" />
                  </button>
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed mb-4 italic font-light">
                  "{selectedPost.message}"
                </p>
                <button onClick={() => handleLike(selectedPost.id)}
                        className="flex items-center gap-2 text-xs transition-all"
                        style={{ color:liked.has(selectedPost.id) ? '#f87171' : '#52525b' }}>
                  <Heart size={13}
                         className={liked.has(selectedPost.id) ? 'fill-red-400' : ''}
                         style={{ transition:'transform 0.2s', transform:liked.has(selectedPost.id)?'scale(1.2)':'scale(1)' }} />
                  {selectedPost.likes + (liked.has(selectedPost.id) ? 1 : 0)} 共鳴
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Write form */}
      <AnimatePresence>
        {showForm && (
          <motion.div className="absolute inset-0 z-30 flex items-end"
            style={{ background:'rgba(3,2,3,0.88)', backdropFilter:'blur(14px)' }}
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            onClick={e => { if (e.target === e.currentTarget) setShowForm(false) }}>
            <motion.div className="w-full rounded-t-3xl p-6 pb-12"
              style={{ background:'linear-gradient(180deg, rgba(16,11,8,0.99) 0%, rgba(8,6,4,0.99) 100%)',
                       border:'1px solid rgba(255,157,92,0.14)', borderBottom:'none' }}
              initial={{ y:'100%' }} animate={{ y:0 }} exit={{ y:'100%' }}
              transition={{ type:'spring', damping:30, stiffness:300 }}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-light text-zinc-100 tracking-wide">想いを星に刻む</h2>
                <button onClick={() => setShowForm(false)}
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.08)' }}>
                  <X size={15} className="text-zinc-400" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex gap-2 flex-wrap">
                  {EMOJI_OPTIONS.map(e => (
                    <button key={e} type="button" onClick={() => setEmoji(e)}
                      className="text-xl w-10 h-10 rounded-xl transition-all"
                      style={{ background: emoji===e ? 'rgba(255,157,92,0.14)' : 'rgba(255,255,255,0.04)',
                               border:     emoji===e ? '1px solid rgba(255,157,92,0.35)' : '1px solid rgba(255,255,255,0.07)' }}>
                      {e}
                    </button>
                  ))}
                </div>
                <textarea value={message} onChange={e => setMessage(e.target.value)}
                  placeholder="Lumina Fuji での光との時間を…"
                  required rows={3}
                  className="w-full rounded-2xl px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none resize-none transition-all"
                  style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}
                />
                <div className="flex items-center gap-2 text-xs text-zinc-600 rounded-xl px-3 py-2"
                     style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
                  <span>{guestInfo?.flag ?? '🌏'}</span>
                  <span>{guestInfo?.name ?? 'Guest'} · {guestInfo?.nationality ?? 'Japan'}</span>
                </div>
                <button type="submit" disabled={!message.trim() || submitting}
                  className="w-full py-3.5 rounded-2xl text-sm font-medium flex items-center justify-center gap-2 transition-all"
                  style={{ background: message.trim() && !submitting
                    ? 'linear-gradient(135deg, rgba(255,157,92,0.88), rgba(255,184,119,0.92))'
                    : 'rgba(255,255,255,0.05)',
                    color: message.trim() && !submitting ? '#140905' : '#52525b' }}>
                  {submitting
                    ? <div className="w-4 h-4 border-2 border-zinc-800/30 border-t-zinc-800 rounded-full animate-spin" />
                    : <><Send size={14} /> 星に刻む</>}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/** 管理会社の構成でゲストブックが無効の場合は案内画面を表示する */
export default function GuestbookPage() {
  const [store] = useStore()
  if (!expOf(store).guestbook) return <FeatureUnavailable />
  return <GuestbookInner />
}
