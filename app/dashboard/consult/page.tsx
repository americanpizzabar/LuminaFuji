'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, CheckCircle2, ChevronRight } from 'lucide-react'
import Link from 'next/link'

type Step = 1 | 2 | 3 | 4

interface FormData {
  profession: string
  projectType: string
  scale: string
  budget: string
  timeline: string
  name: string
  email: string
  phone: string
  contactMethod: string
  message: string
}

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

export default function ConsultPage() {
  const [step, setStep] = useState<Step>(1)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    profession: '',
    projectType: '',
    scale: '',
    budget: '',
    timeline: '',
    name: '',
    email: '',
    phone: '',
    contactMethod: 'email',
    message: '',
  })

  const update = (key: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1500))
    setSubmitted(true)
    setLoading(false)
  }

  const stepLabel = ['ご職業', 'プロジェクト', 'ご連絡先', '確認']

  if (submitted) {
    return (
      <div className="page-container flex flex-col items-center justify-center min-h-[80vh]">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring' }}
          className="text-center"
        >
          <div className="w-20 h-20 rounded-3xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 size={36} className="text-gold-400" />
          </div>
          <h2 className="text-xl font-serif text-zinc-100 mb-3">
            お問い合わせを<br />受け付けました
          </h2>
          <p className="text-zinc-400 text-sm leading-relaxed mb-6">
            担当者より2営業日以内に<br />
            {formData.contactMethod === 'email' ? formData.email : formData.phone}
            <br />へご連絡いたします。
          </p>
          <Link href="/dashboard" className="btn-outline text-sm">
            ホームに戻る
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard" className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-all">
          <ArrowLeft size={18} className="text-zinc-300" />
        </Link>
        <div>
          <h1 className="text-lg font-medium text-zinc-100">照明コンサルティング</h1>
          <p className="text-xs text-zinc-500">無料相談 · ECUANEST</p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div
              className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium transition-all ${
                s < step
                  ? 'bg-gold-500 text-zinc-950'
                  : s === step
                  ? 'bg-gold-500/20 border border-gold-500/50 text-gold-400'
                  : 'bg-zinc-800 text-zinc-600'
              }`}
            >
              {s < step ? <CheckCircle2 size={14} /> : s}
            </div>
            {s < 4 && (
              <div className={`h-0.5 flex-1 rounded-full transition-all ${s < step ? 'bg-gold-500' : 'bg-zinc-800'}`} />
            )}
          </div>
        ))}
      </div>
      <p className="text-xs text-zinc-500 mb-6">ステップ {step} / 4：{stepLabel[step - 1]}</p>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <p className="text-zinc-300 text-sm mb-4">ご職業を教えてください</p>
            <div className="space-y-2 mb-6">
              {professions.map(({ value, label, emoji }) => (
                <button
                  key={value}
                  onClick={() => update('profession', value)}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                    formData.profession === value
                      ? 'border-gold-500/40 bg-gold-500/8'
                      : 'border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <span className="text-xl">{emoji}</span>
                  <span className={`text-sm ${formData.profession === value ? 'text-gold-300' : 'text-zinc-300'}`}>
                    {label}
                  </span>
                  {formData.profession === value && (
                    <CheckCircle2 size={14} className="text-gold-400 ml-auto" />
                  )}
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={!formData.profession}
              className="w-full btn-gold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              次へ <ChevronRight size={16} />
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="space-y-5 mb-6">
              <div>
                <p className="text-sm text-zinc-300 mb-3">プロジェクトの種類</p>
                <div className="grid grid-cols-2 gap-2">
                  {projectTypes.map(({ value, label, emoji }) => (
                    <button
                      key={value}
                      onClick={() => update('projectType', value)}
                      className={`flex items-center gap-2 p-3 rounded-xl border text-left text-sm transition-all ${
                        formData.projectType === value
                          ? 'border-gold-500/40 bg-gold-500/8 text-gold-300'
                          : 'border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <span>{emoji}</span>
                      <span className="text-xs">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-zinc-300 mb-3">規模（床面積）</p>
                <div className="grid grid-cols-2 gap-2">
                  {scales.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => update('scale', value)}
                      className={`p-3 rounded-xl border text-xs transition-all ${
                        formData.scale === value
                          ? 'border-gold-500/40 bg-gold-500/8 text-gold-300'
                          : 'border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-zinc-300 mb-3">予算感</p>
                <div className="space-y-2">
                  {budgets.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => update('budget', value)}
                      className={`w-full p-3 rounded-xl border text-xs text-left transition-all ${
                        formData.budget === value
                          ? 'border-gold-500/40 bg-gold-500/8 text-gold-300'
                          : 'border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="btn-outline px-5">戻る</button>
              <button
                onClick={() => setStep(3)}
                disabled={!formData.projectType}
                className="flex-1 btn-gold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                次へ <ChevronRight size={16} />
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs text-zinc-500 mb-1.5 block">お名前 *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => update('name', e.target.value)}
                  placeholder="山田 太郎"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-gold-500/40 transition-all"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 mb-1.5 block">メールアドレス *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => update('email', e.target.value)}
                  placeholder="taro@example.com"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-gold-500/40 transition-all"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 mb-1.5 block">電話番号</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  placeholder="090-XXXX-XXXX"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-gold-500/40 transition-all"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 mb-1.5 block">ご連絡方法</label>
                <div className="flex gap-2">
                  {[
                    { value: 'email', label: 'メール' },
                    { value: 'phone', label: '電話' },
                    { value: 'online', label: 'オンライン面談' },
                  ].map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => update('contactMethod', value)}
                      className={`flex-1 py-2.5 rounded-xl border text-xs transition-all ${
                        formData.contactMethod === value
                          ? 'border-gold-500/40 bg-gold-500/8 text-gold-300'
                          : 'border-zinc-700 text-zinc-500'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-zinc-500 mb-1.5 block">ご要望・ご質問</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => update('message', e.target.value)}
                  placeholder="プロジェクトの詳細やご要望をご記入ください..."
                  rows={3}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-gold-500/40 transition-all resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="btn-outline px-5">戻る</button>
              <button
                onClick={() => setStep(4)}
                disabled={!formData.name || !formData.email}
                className="flex-1 btn-gold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                確認へ <ChevronRight size={16} />
              </button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="card p-5 mb-5 space-y-3">
              <p className="text-sm font-medium text-zinc-200 mb-1">送信内容の確認</p>
              {[
                { label: 'お名前', value: formData.name },
                { label: 'メール', value: formData.email },
                { label: '職業', value: professions.find((p) => p.value === formData.profession)?.label },
                { label: 'プロジェクト', value: projectTypes.find((p) => p.value === formData.projectType)?.label },
                { label: '規模', value: scales.find((s) => s.value === formData.scale)?.label },
                { label: '予算', value: budgets.find((b) => b.value === formData.budget)?.label },
                { label: '連絡方法', value: { email: 'メール', phone: '電話', online: 'オンライン面談' }[formData.contactMethod] },
              ].map(({ label, value }) => value ? (
                <div key={label} className="flex justify-between items-start gap-2">
                  <span className="text-xs text-zinc-500">{label}</span>
                  <span className="text-xs text-zinc-300 text-right">{value}</span>
                </div>
              ) : null)}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(3)} className="btn-outline px-5">戻る</button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 btn-gold flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin" />
                ) : (
                  '送信する'
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
