'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, CheckCircle2, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { usePhase } from '@/lib/phase'
import { addConsultRequest, getStore } from '@/lib/store'
import { useStore } from '@/lib/useStore'

type Step = 1 | 2 | 3 | 4

const professions = [
  { value: 'architect', label: '建築家・設計士', emoji: '🏗️' },
  { value: 'interior', label: 'インテリアデザイナー', emoji: '🛋️' },
  { value: 'developer', label: 'デベロッパー・施主', emoji: '🏢' },
  { value: 'general', label: '個人（住宅）', emoji: '🏠' },
  { value: 'other', label: 'その他', emoji: '💼' },
]
const projectTypes = [
  { value: 'residential', label: '住宅', emoji: '🏡' },
  { value: 'commercial', label: '商業施設', emoji: '🏬' },
  { value: 'hospitality', label: 'ホテル・旅館', emoji: '🏨' },
  { value: 'office', label: 'オフィス', emoji: '💼' },
  { value: 'museum', label: '美術館・ギャラリー', emoji: '🖼️' },
]
const scales = [
  { value: 'small', label: '〜100m²' },
  { value: 'medium', label: '100〜500m²' },
  { value: 'large', label: '500〜2000m²' },
  { value: 'xlarge', label: '2000m² 以上' },
]
const budgets = [
  { value: 'under1m', label: '〜100万円' },
  { value: '1to5m', label: '100〜500万円' },
  { value: '5to10m', label: '500〜1000万円' },
  { value: 'over10m', label: '1000万円以上' },
  { value: 'tbd', label: '未定 / 相談したい' },
]
const productOptions = [
  { id: 'brite-3', label: 'Brite 3（パネル型）' },
  { id: 'luna-series', label: 'Luna Series（壁面型）' },
  { id: 'aria-strip', label: 'Aria Strip（ライン型）' },
  { id: 'nexus-module', label: 'Nexus Module（モジュール型）' },
]

export default function ConsultPage() {
  const { guestInfo } = usePhase()
  const [, updateStore] = useStore()
  const [step, setStep] = useState<Step>(1)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    profession: '', projectType: '', scale: '', budget: '',
    name: guestInfo?.name ?? '', email: guestInfo?.email ?? '', phone: '',
    company: '', contactMethod: 'email', message: '',
    interestedProducts: [] as string[],
  })

  const set = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }))
  const toggleProduct = (id: string) => setForm(prev => ({
    ...prev,
    interestedProducts: prev.interestedProducts.includes(id)
      ? prev.interestedProducts.filter(p => p !== id)
      : [...prev.interestedProducts, id],
  }))

  const handleSubmit = async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    addConsultRequest({
      name: form.name, email: form.email, phone: form.phone || undefined,
      company: form.company || undefined, profession: professions.find(p => p.value === form.profession)?.label ?? form.profession,
      projectType: projectTypes.find(p => p.value === form.projectType)?.label ?? form.projectType,
      scale: scales.find(s => s.value === form.scale)?.label ?? form.scale,
      budget: budgets.find(b => b.value === form.budget)?.label ?? form.budget,
      contactMethod: form.contactMethod as 'email' | 'phone' | 'online',
      message: form.message, interestedProducts: form.interestedProducts,
    })
    updateStore({ consultRequests: getStore().consultRequests })
    setLoading(false)
    setSubmitted(true)
  }

  const stepLabels = ['ご職業', 'プロジェクト詳細', 'ご連絡先', '確認・送信']

  if (submitted) {
    return (
      <div className="page-container flex flex-col items-center justify-center min-h-[80vh]">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring' }} className="text-center">
          <div className="w-20 h-20 rounded-3xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 size={36} className="text-gold-400" />
          </div>
          <h2 className="text-xl font-serif text-zinc-100 mb-3">相談リクエストを送信しました</h2>
          <p className="text-zinc-400 text-sm leading-relaxed mb-6">担当者より2営業日以内にご連絡いたします。</p>
          <Link href="/dashboard" className="btn-outline text-sm">ホームに戻る</Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="flex items-center gap-3 mb-5">
        <Link href="/dashboard" className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-all">
          <ArrowLeft size={18} className="text-zinc-300" />
        </Link>
        <div>
          <h1 className="text-lg font-medium text-zinc-100">照明コンサルティング</h1>
          <p className="text-xs text-zinc-500">無料相談 · ECUANEST</p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-2">
        {[1, 2, 3, 4].map(s => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium transition-all ${s < step ? 'bg-gold-500 text-zinc-950' : s === step ? 'bg-gold-500/20 border border-gold-500/50 text-gold-400' : 'bg-zinc-800 text-zinc-600'}`}>
              {s < step ? <CheckCircle2 size={14} /> : s}
            </div>
            {s < 4 && <div className={`h-0.5 flex-1 rounded-full transition-all ${s < step ? 'bg-gold-500' : 'bg-zinc-800'}`} />}
          </div>
        ))}
      </div>
      <p className="text-xs text-zinc-500 mb-5">ステップ {step} / 4：{stepLabels[step - 1]}</p>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <p className="text-sm text-zinc-300 mb-4">ご職業を教えてください</p>
            <div className="space-y-2 mb-5">
              {professions.map(({ value, label, emoji }) => (
                <button key={value} onClick={() => set('profession', value)}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${form.profession === value ? 'border-gold-500/40 bg-gold-500/8 text-gold-300' : 'border-zinc-800 hover:border-zinc-700 text-zinc-400'}`}>
                  <span className="text-xl">{emoji}</span>
                  <span className="text-sm">{label}</span>
                  {form.profession === value && <CheckCircle2 size={14} className="text-gold-400 ml-auto" />}
                </button>
              ))}
            </div>
            <button onClick={() => setStep(2)} disabled={!form.profession} className="w-full btn-gold flex items-center justify-center gap-2 disabled:opacity-50">
              次へ <ChevronRight size={16} />
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
            <div>
              <p className="text-sm text-zinc-300 mb-3">プロジェクトの種類</p>
              <div className="grid grid-cols-2 gap-2">
                {projectTypes.map(({ value, label, emoji }) => (
                  <button key={value} onClick={() => set('projectType', value)}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-sm transition-all ${form.projectType === value ? 'border-gold-500/40 bg-gold-500/8 text-gold-300' : 'border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}>
                    <span>{emoji}</span><span className="text-xs">{label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-zinc-300 mb-3">規模（床面積）</p>
              <div className="grid grid-cols-2 gap-2">
                {scales.map(({ value, label }) => (
                  <button key={value} onClick={() => set('scale', value)}
                    className={`p-3 rounded-xl border text-xs transition-all ${form.scale === value ? 'border-gold-500/40 bg-gold-500/8 text-gold-300' : 'border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-zinc-300 mb-3">予算感</p>
              <div className="space-y-2">
                {budgets.map(({ value, label }) => (
                  <button key={value} onClick={() => set('budget', value)}
                    className={`w-full p-3 rounded-xl border text-xs text-left transition-all ${form.budget === value ? 'border-gold-500/40 bg-gold-500/8 text-gold-300' : 'border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-zinc-300 mb-3">気になった製品（複数選択可）</p>
              <div className="grid grid-cols-2 gap-2">
                {productOptions.map(({ id, label }) => (
                  <button key={id} onClick={() => toggleProduct(id)}
                    className={`p-3 rounded-xl border text-xs text-left transition-all ${form.interestedProducts.includes(id) ? 'border-gold-500/40 bg-gold-500/8 text-gold-300' : 'border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}>
                    {form.interestedProducts.includes(id) && '✓ '}{label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="btn-outline px-5">戻る</button>
              <button onClick={() => setStep(3)} disabled={!form.projectType} className="flex-1 btn-gold flex items-center justify-center gap-2 disabled:opacity-50">
                次へ <ChevronRight size={16} />
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            {[
              { key: 'name', label: 'お名前 *', type: 'text', placeholder: '山田 太郎' },
              { key: 'company', label: '会社名・事務所名', type: 'text', placeholder: '株式会社○○' },
              { key: 'email', label: 'メールアドレス *', type: 'email', placeholder: 'taro@example.com' },
              { key: 'phone', label: '電話番号', type: 'tel', placeholder: '090-XXXX-XXXX' },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label className="text-xs text-zinc-500 mb-1.5 block">{label}</label>
                <input type={type} value={(form as any)[key]} onChange={e => set(key, e.target.value)} placeholder={placeholder}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-gold-500/40 transition-all" />
              </div>
            ))}
            <div>
              <label className="text-xs text-zinc-500 mb-1.5 block">ご希望の連絡方法</label>
              <div className="flex gap-2">
                {[{ value: 'email', label: 'メール' }, { value: 'phone', label: '電話' }, { value: 'online', label: 'オンライン面談' }].map(({ value, label }) => (
                  <button key={value} onClick={() => set('contactMethod', value)}
                    className={`flex-1 py-2.5 rounded-xl border text-xs transition-all ${form.contactMethod === value ? 'border-gold-500/40 bg-gold-500/8 text-gold-300' : 'border-zinc-700 text-zinc-500'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1.5 block">ご要望・ご質問</label>
              <textarea value={form.message} onChange={e => set('message', e.target.value)}
                placeholder="プロジェクトの詳細やご質問をお書きください..." rows={3}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-gold-500/40 transition-all resize-none" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="btn-outline px-5">戻る</button>
              <button onClick={() => setStep(4)} disabled={!form.name || !form.email} className="flex-1 btn-gold flex items-center justify-center gap-2 disabled:opacity-50">
                確認へ <ChevronRight size={16} />
              </button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="card p-5 mb-5 space-y-3">
              <p className="text-sm font-medium text-zinc-200 mb-3">送信内容の確認</p>
              {[
                { label: 'お名前', value: form.name },
                form.company && { label: '会社名', value: form.company },
                { label: 'メール', value: form.email },
                { label: '職業', value: professions.find(p => p.value === form.profession)?.label },
                { label: 'プロジェクト', value: projectTypes.find(p => p.value === form.projectType)?.label },
                { label: '規模', value: scales.find(s => s.value === form.scale)?.label },
                { label: '予算', value: budgets.find(b => b.value === form.budget)?.label },
                { label: '連絡方法', value: { email: 'メール', phone: '電話', online: 'オンライン面談' }[form.contactMethod] },
                form.interestedProducts.length > 0 && { label: '気になる製品', value: form.interestedProducts.join(', ') },
              ].filter(Boolean).map((item: any) => (
                <div key={item.label} className="flex justify-between items-start gap-2">
                  <span className="text-xs text-zinc-500 flex-shrink-0">{item.label}</span>
                  <span className="text-xs text-zinc-300 text-right">{item.value}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(3)} className="btn-outline px-5">戻る</button>
              <button onClick={handleSubmit} disabled={loading} className="flex-1 btn-gold flex items-center justify-center gap-2">
                {loading ? <div className="w-4 h-4 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin" /> : '送信する'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
