'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Share2, Copy, Check, X, Link2, QrCode } from 'lucide-react'
import { useStore } from '@/lib/useStore'
import { useLanguage } from '@/lib/useLanguage'
import { buildCompanionUrl, type CompanionPayload } from '@/lib/companion'

type Dict = Record<string, { title: string; sub: string; cta: string; modalTitle: string; modalDesc: string; copy: string; copied: string; share: string; note: string; codeLabel: string }>

const DICT: Dict = {
  ja: { title: '同伴者を招待', sub: 'ご一緒の方もアプリを使えます', cta: '招待リンクを共有', modalTitle: '同伴者を招待', modalDesc: 'ご滞在中、ご一緒の方もこのリンクから照明操作やコンシェルジュをご利用いただけます。メール登録は不要です。', copy: 'リンクをコピー', copied: 'コピーしました', share: '共有する', note: '※ このリンクはご滞在期間中のみ有効です', codeLabel: '滞在コード' },
  en: { title: 'Invite Companions', sub: 'Let your group use the app too', cta: 'Share invite link', modalTitle: 'Invite Companions', modalDesc: 'During your stay, your companions can control the lighting and use the concierge from this link. No email registration needed.', copy: 'Copy link', copied: 'Copied', share: 'Share', note: '* This link is valid only during your stay', codeLabel: 'Stay code' },
  zh: { title: '邀请同行者', sub: '让同行的人也能使用应用', cta: '分享邀请链接', modalTitle: '邀请同行者', modalDesc: '入住期间，同行者可通过此链接控制灯光并使用礼宾服务，无需邮箱注册。', copy: '复制链接', copied: '已复制', share: '分享', note: '* 此链接仅在入住期间有效', codeLabel: '入住码' },
  ko: { title: '동행자 초대', sub: '함께 오신 분도 앱을 사용할 수 있어요', cta: '초대 링크 공유', modalTitle: '동행자 초대', modalDesc: '숙박 중 동행자도 이 링크로 조명 제어와 컨시어지를 이용할 수 있습니다. 이메일 등록이 필요 없습니다.', copy: '링크 복사', copied: '복사됨', share: '공유', note: '* 이 링크는 숙박 기간에만 유효합니다', codeLabel: '숙박 코드' },
  fr: { title: 'Inviter des accompagnants', sub: 'Votre groupe peut aussi utiliser l’app', cta: 'Partager le lien', modalTitle: 'Inviter des accompagnants', modalDesc: 'Pendant votre séjour, vos accompagnants peuvent contrôler l’éclairage et utiliser la conciergerie via ce lien. Aucune inscription requise.', copy: 'Copier le lien', copied: 'Copié', share: 'Partager', note: '* Ce lien n’est valable que pendant votre séjour', codeLabel: 'Code de séjour' },
}

export default function CompanionInvite() {
  const [store] = useStore()
  const { lang } = useLanguage()
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const tr = DICT[lang] ?? DICT.ja
  const guest = store.guestInfo
  // 同伴者自身には表示しない（代表者のみ招待できる）
  if (!guest || guest.isCompanion) return null

  const payload: CompanionPayload = {
    rid: guest.reservationId,
    ci: guest.checkIn,
    co: guest.checkOut,
    hn: 'Lumina Fuji',
    rep: guest.name,
    ar: guest.arrivedAt,
    flag: guest.flag,
    nat: guest.nationality,
  }
  const url = typeof window !== 'undefined' ? buildCompanionUrl(window.location.origin, payload) : ''
  const stayCode = guest.reservationId.replace(/[^A-Za-z0-9]/g, '').slice(-6).toUpperCase()

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    } catch { /* ignore */ }
  }

  const share = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try { await navigator.share({ title: 'Lumina Fuji', text: tr.modalDesc, url }) } catch { /* cancelled */ }
    } else {
      copyLink()
    }
  }

  return (
    <>
      <motion.button
        onClick={() => setOpen(true)}
        className="w-full relative overflow-hidden rounded-3xl p-4 flex items-center gap-3 text-left"
        style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.06) 50%, rgba(10,10,18,0.7) 100%)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(139,92,246,0.22)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
        }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="absolute -top-6 -right-4 w-28 h-28 pointer-events-none"
             style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)', filter: 'blur(14px)' }} />
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
             style={{ background: 'rgba(139,92,246,0.16)', border: '1px solid rgba(139,92,246,0.3)' }}>
          <Users size={22} className="text-violet-300" />
        </div>
        <div className="flex-1 min-w-0 relative">
          <p className="text-[15px] font-semibold text-zinc-50">{tr.title}</p>
          <p className="text-[13px] text-zinc-300 mt-0.5">{tr.sub}</p>
        </div>
        <Share2 size={18} className="text-violet-300 flex-shrink-0" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60]"
              style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.96 }}
              transition={{ type: 'spring', damping: 26, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-[61] max-w-[430px] mx-auto p-5 pb-8"
              style={{
                background: 'rgba(12,12,20,0.96)',
                backdropFilter: 'blur(40px) saturate(180%)',
                WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                borderTop: '1px solid rgba(139,92,246,0.25)',
                borderRadius: '28px 28px 0 0',
                boxShadow: '0 -12px 48px rgba(0,0,0,0.6)',
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                       style={{ background: 'rgba(139,92,246,0.16)', border: '1px solid rgba(139,92,246,0.3)' }}>
                    <Users size={18} className="text-violet-300" />
                  </div>
                  <h2 className="text-lg font-serif text-zinc-50">{tr.modalTitle}</h2>
                </div>
                <button onClick={() => setOpen(false)}
                        className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <X size={16} className="text-zinc-300" />
                </button>
              </div>

              <p className="text-[13px] text-zinc-300 leading-relaxed mb-5">{tr.modalDesc}</p>

              {/* Stay code display */}
              <div className="rounded-2xl p-4 mb-4 text-center"
                   style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)' }}>
                <p className="text-[11px] text-violet-300/80 uppercase tracking-[0.2em] mb-1.5">{tr.codeLabel}</p>
                <p className="text-3xl font-light tracking-[0.3em] text-violet-200 tabular-nums">{stayCode}</p>
              </div>

              {/* Link preview */}
              <div className="rounded-2xl p-3 mb-4 flex items-center gap-2.5"
                   style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <Link2 size={15} className="text-zinc-400 flex-shrink-0" />
                <p className="text-[12px] text-zinc-300 truncate flex-1">{url}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={copyLink}
                  className="flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-medium transition-all"
                  style={{
                    background: copied ? 'rgba(34,197,94,0.14)' : 'rgba(255,255,255,0.05)',
                    color: copied ? '#4ade80' : '#e4e4e7',
                    border: `1px solid ${copied ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.1)'}`,
                  }}
                >
                  {copied ? <><Check size={15} /> {tr.copied}</> : <><Copy size={15} /> {tr.copy}</>}
                </button>
                <button
                  onClick={share}
                  className="flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold transition-all active:scale-[0.98]"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', color: '#fff', boxShadow: '0 4px 16px rgba(139,92,246,0.35)' }}
                >
                  <Share2 size={15} /> {tr.share}
                </button>
              </div>

              <p className="text-[11px] text-zinc-400 text-center mt-4 flex items-center justify-center gap-1.5">
                <QrCode size={12} /> {tr.note}
              </p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
