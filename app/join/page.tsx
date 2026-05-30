'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, ArrowRight, AlertCircle, Sparkles, Calendar, ChevronLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { setCompanionGuestInfo } from '@/lib/store'
import type { GuestInfo } from '@/lib/store'
import { decodeCompanion, type CompanionPayload } from '@/lib/companion'
import { LANGS, LANG_ORDER, detectLang, saveLang, type LangKey } from '@/lib/i18n-login'

type Dict = Record<string, {
  welcome: string; subtitle: string; staying: string; nameLabel: string; namePlaceholder: string;
  join: string; defaultName: string; expired: string; expiredSub: string; invalid: string; invalidSub: string;
  pastePrompt: string; pastePlaceholder: string; continue: string; nights: string; back: string; note: string;
}>

const DICT: Dict = {
  ja: { welcome: 'ようこそ', subtitle: '同伴者として参加', staying: 'のご滞在に参加します', nameLabel: 'お名前（任意）', namePlaceholder: 'ニックネームでもOK', join: 'アプリを使い始める', defaultName: '同伴ゲスト', expired: 'ご滞在期間が終了しました', expiredSub: 'この招待リンクは有効期限が切れています。代表者の方にご確認ください。', invalid: '招待リンクが無効です', invalidSub: '正しい招待リンクから再度お試しいただくか、リンクを貼り付けてください。', pastePrompt: '招待リンクを貼り付け', pastePlaceholder: 'https://.../join?c=...', continue: '続ける', nights: '泊', back: '戻る', note: 'メール登録は不要です' },
  en: { welcome: 'Welcome', subtitle: 'Join as a companion', staying: ' stay', nameLabel: 'Your name (optional)', namePlaceholder: 'A nickname works too', join: 'Start using the app', defaultName: 'Companion', expired: 'This stay has ended', expiredSub: 'This invite link has expired. Please check with the main guest.', invalid: 'Invalid invite link', invalidSub: 'Please try again from a valid invite link, or paste the link below.', pastePrompt: 'Paste invite link', pastePlaceholder: 'https://.../join?c=...', continue: 'Continue', nights: ' nights', back: 'Back', note: 'No email registration required' },
  zh: { welcome: '欢迎', subtitle: '作为同行者加入', staying: ' 的入住', nameLabel: '您的名字（可选）', namePlaceholder: '昵称也可以', join: '开始使用应用', defaultName: '同行者', expired: '入住已结束', expiredSub: '此邀请链接已过期，请与主要客人确认。', invalid: '邀请链接无效', invalidSub: '请通过有效的邀请链接重试，或在下方粘贴链接。', pastePrompt: '粘贴邀请链接', pastePlaceholder: 'https://.../join?c=...', continue: '继续', nights: ' 晚', back: '返回', note: '无需邮箱注册' },
  ko: { welcome: '환영합니다', subtitle: '동행자로 참가', staying: ' 숙박에 참가', nameLabel: '이름 (선택)', namePlaceholder: '닉네임도 가능', join: '앱 사용 시작', defaultName: '동행 게스트', expired: '숙박 기간이 종료되었습니다', expiredSub: '이 초대 링크는 만료되었습니다. 대표자에게 확인해 주세요.', invalid: '초대 링크가 유효하지 않습니다', invalidSub: '올바른 초대 링크로 다시 시도하거나 링크를 붙여넣어 주세요.', pastePrompt: '초대 링크 붙여넣기', pastePlaceholder: 'https://.../join?c=...', continue: '계속', nights: '박', back: '뒤로', note: '이메일 등록이 필요 없습니다' },
  fr: { welcome: 'Bienvenue', subtitle: 'Rejoindre en accompagnant', staying: '', nameLabel: 'Votre nom (facultatif)', namePlaceholder: 'Un surnom convient aussi', join: 'Commencer', defaultName: 'Accompagnant', expired: 'Ce séjour est terminé', expiredSub: 'Ce lien d’invitation a expiré. Veuillez vérifier avec le client principal.', invalid: 'Lien d’invitation invalide', invalidSub: 'Réessayez avec un lien valide ou collez le lien ci-dessous.', pastePrompt: 'Coller le lien', pastePlaceholder: 'https://.../join?c=...', continue: 'Continuer', nights: ' nuits', back: 'Retour', note: 'Aucune inscription par e-mail requise' },
}

function extractCode(raw: string): string | null {
  const trimmed = raw.trim()
  if (!trimmed) return null
  // フルURLが貼られた場合は c= パラメータを抽出
  const m = trimmed.match(/[?&]c=([^&\s]+)/)
  if (m) return decodeURIComponent(m[1])
  return trimmed
}

export default function JoinPage() {
  const router = useRouter()
  const [lang, setLang] = useState<LangKey>('ja')
  const [payload, setPayload] = useState<CompanionPayload | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'expired' | 'invalid'>('loading')
  const [name, setName] = useState('')
  const [pasteValue, setPasteValue] = useState('')

  const t = DICT[lang] ?? DICT.en

  const tryLoad = (rawCode: string | null) => {
    if (!rawCode) { setStatus('invalid'); return }
    const decoded = decodeCompanion(rawCode)
    if (!decoded) { setStatus('invalid'); return }
    // 有効期限チェック: チェックアウト日の終わり（翌0時）を過ぎていたら無効
    const coEnd = new Date(decoded.co); coEnd.setHours(23, 59, 59, 999)
    if (Date.now() > coEnd.getTime()) { setPayload(decoded); setStatus('expired'); return }
    setPayload(decoded)
    setStatus('ready')
  }

  useEffect(() => {
    setLang(detectLang())
    const params = new URLSearchParams(window.location.search)
    tryLoad(params.get('c'))
  }, [])

  const handleJoin = () => {
    if (!payload) return
    const guestInfo: GuestInfo = {
      name: name.trim() || t.defaultName,
      email: '',
      nationality: payload.nat ?? '',
      flag: payload.flag ?? '🙂',
      checkIn: payload.ci,
      checkOut: payload.co,
      reservationId: payload.rid,
      platform: 'direct',
      adults: 1,
      children: 0,
      isCompanion: true,
      arrivedAt: payload.ar,
    }
    setCompanionGuestInfo(guestInfo)
    router.push('/dashboard')
  }

  const nights = payload
    ? Math.max(1, Math.round((new Date(payload.co).getTime() - new Date(payload.ci).getTime()) / 86400000))
    : 0

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-violet-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-600/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="w-full max-w-sm relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-violet-700/10 border border-violet-500/25 mb-4"
               style={{ boxShadow: '0 0 30px rgba(139,92,246,0.2)' }}>
            <span className="text-2xl">✦</span>
          </div>
          <h1 className="font-serif text-2xl font-light text-zinc-100 tracking-wide">Lumina Fuji</h1>
          <p className="text-zinc-400 text-sm mt-1 tracking-wider">RESIDENCE YAMANAKAKO</p>
        </div>

        {/* Language switcher */}
        <div className="flex items-center justify-center gap-1 flex-wrap mb-6">
          {LANG_ORDER.map(l => (
            <button
              key={l}
              onClick={() => { setLang(l); saveLang(l) }}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] transition-all ${
                lang === l ? 'bg-zinc-700 text-zinc-100 font-medium' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              <span>{LANGS[l].flag}</span><span>{LANGS[l].label}</span>
            </button>
          ))}
        </div>

        {status === 'ready' && payload && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-violet-500/15 border border-violet-500/25">
                <Users size={17} className="text-violet-300" />
              </div>
              <div>
                <p className="text-[11px] text-violet-300/80 uppercase tracking-wider">{t.subtitle}</p>
                <p className="text-sm font-medium text-zinc-100">{t.welcome}</p>
              </div>
            </div>

            {/* Stay info */}
            <div className="rounded-2xl p-4 mb-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              {payload.rep && <p className="text-sm text-zinc-200 mb-2">{payload.flag} <strong>{payload.rep}</strong>{lang === 'ja' ? '様' : ''}{t.staying}</p>}
              <div className="flex items-center gap-2 text-[13px] text-zinc-300">
                <Calendar size={13} className="text-zinc-400" />
                <span>{payload.ci} → {payload.co}</span>
                <span className="text-zinc-300">·</span>
                <span>{nights}{t.nights}</span>
              </div>
            </div>

            <label className="text-xs text-zinc-300 mb-1.5 block">{t.nameLabel}</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={t.namePlaceholder}
              className="w-full bg-zinc-800/80 border border-zinc-700 rounded-xl px-4 py-3.5 text-zinc-100 placeholder:text-zinc-500 text-sm focus:outline-none focus:border-violet-500/50 transition-all mb-4"
            />

            <button
              onClick={handleJoin}
              className="w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold transition-all active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', color: '#fff', boxShadow: '0 4px 20px rgba(139,92,246,0.35)' }}
            >
              <Sparkles size={16} /> {t.join}
            </button>
            <p className="text-[11px] text-zinc-400 text-center mt-3">{t.note}</p>
          </motion.div>
        )}

        {status === 'expired' && (
          <div className="card p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/25 mb-3">
              <AlertCircle size={22} className="text-amber-400" />
            </div>
            <p className="text-base font-medium text-zinc-100 mb-1">{t.expired}</p>
            <p className="text-sm text-zinc-400 leading-relaxed">{t.expiredSub}</p>
          </div>
        )}

        {status === 'invalid' && (
          <div className="card p-6">
            <div className="text-center mb-5">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 border border-red-500/25 mb-3">
                <AlertCircle size={22} className="text-red-400" />
              </div>
              <p className="text-base font-medium text-zinc-100 mb-1">{t.invalid}</p>
              <p className="text-sm text-zinc-400 leading-relaxed">{t.invalidSub}</p>
            </div>
            <label className="text-xs text-zinc-300 mb-1.5 block">{t.pastePrompt}</label>
            <input
              type="text"
              value={pasteValue}
              onChange={e => setPasteValue(e.target.value)}
              placeholder={t.pastePlaceholder}
              className="w-full bg-zinc-800/80 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-100 placeholder:text-zinc-500 text-sm focus:outline-none focus:border-violet-500/50 transition-all mb-3"
            />
            <button
              onClick={() => { setStatus('loading'); tryLoad(extractCode(pasteValue)) }}
              disabled={!pasteValue.trim()}
              className="w-full flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', color: '#fff' }}
            >
              {t.continue} <ArrowRight size={15} />
            </button>
          </div>
        )}

        <button
          onClick={() => router.push('/login')}
          className="mx-auto mt-6 flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <ChevronLeft size={13} /> {t.back}
        </button>
      </motion.div>
    </div>
  )
}
