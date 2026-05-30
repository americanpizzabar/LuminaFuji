'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, CheckCircle2, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { usePhase } from '@/lib/phase'
import { addConsultRequest, getStore } from '@/lib/store'
import { useStore } from '@/lib/useStore'
import { useLanguage } from '@/lib/useLanguage'

type Step = 1 | 2 | 3 | 4

const PROFESSION_KEYS = [
  { value: 'architect',        emoji: '🏗️' },
  { value: 'interiorDesigner', emoji: '🛋️' },
  { value: 'developer',        emoji: '🏢' },
  { value: 'homeowner',        emoji: '🏠' },
  { value: 'other',            emoji: '💼' },
]
const PROJECT_TYPE_KEYS = [
  { value: 'residential', emoji: '🏡' },
  { value: 'commercial',  emoji: '🏬' },
  { value: 'hotel',       emoji: '🏨' },
  { value: 'office',      emoji: '💼' },
  { value: 'gallery',     emoji: '🖼️' },
]
const SCALE_KEYS = ['s', 'm', 'l', 'xl'] as const
const BUDGET_KEYS = ['s', 'm', 'l', 'xl', 'unknown'] as const
const CONTACT_METHOD_KEYS = ['email', 'phone', 'online'] as const
const PRODUCT_OPTIONS = [
  { id: 'brite-3',       label: 'Brite 3（パネル型）' },
  { id: 'luna-series',   label: 'Luna Series（壁面型）' },
  { id: 'aria-strip',    label: 'Aria Strip（ライン型）' },
  { id: 'nexus-module',  label: 'Nexus Module（モジュール型）' },
]

export default function ConsultPage() {
  const { guestInfo } = usePhase()
  const [, updateStore] = useStore()
  const { t } = useLanguage()
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
      company: form.company || undefined,
      profession: t(`consult.professions.${form.profession}`),
      projectType: t(`consult.projectTypes.${form.projectType}`),
      scale: t(`consult.scales.${form.scale}`),
      budget: t(`consult.budgets.${form.budget}`),
      contactMethod: form.contactMethod as 'email' | 'phone' | 'online',
      message: form.message, interestedProducts: form.interestedProducts,
    })
    updateStore({ consultRequests: getStore().consultRequests })
    setLoading(false)
    setSubmitted(true)
  }

  const stepTitles = [
    t('consult.professionTitle'),
    t('consult.projectTitle'),
    t('consult.contactTitle'),
    t('consult.confirmTitle'),
  ]

  if (submitted) {
    return (
      <div className="page-container flex flex-col items-center justify-center min-h-[80vh]">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring' }} className="text-center">
          <div className="w-20 h-20 rounded-3xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 size={36} className="text-gold-400" />
          </div>
          <h2 className="text-xl font-serif text-zinc-100 mb-3">{t('consult.sent')}</h2>
          <p className="text-zinc-400 text-sm leading-relaxed mb-6">{t('consult.sentDesc')}</p>
          <Link href="/dashboard" className="btn-outline text-sm">{t('consult.goHome')}</Link>
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
          <h1 className="text-lg font-medium text-zinc-100">{t('consult.title')}</h1>
          <p className="text-xs text-zinc-300">{t('consult.subtitle')}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-2">
        {[1, 2, 3, 4].map(s => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium transition-all ${s < step ? 'bg-gold-500 text-zinc-950' : s === step ? 'bg-gold-500/20 border border-gold-500/50 text-gold-400' : 'bg-zinc-800 text-zinc-400'}`}>
              {s < step ? <CheckCircle2 size={14} /> : s}
            </div>
            {s < 4 && <div className={`h-0.5 flex-1 rounded-full transition-all ${s < step ? 'bg-gold-500' : 'bg-zinc-800'}`} />}
          </div>
        ))}
      </div>
      <p className="text-xs text-zinc-300 mb-5">{t('consult.step', { step: String(step) })}：{stepTitles[step - 1]}</p>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <p className="text-sm text-zinc-300 mb-4">{t('consult.professionTitle')}</p>
            <div className="space-y-2 mb-5">
              {PROFESSION_KEYS.map(({ value, emoji }) => (
                <button key={value} onClick={() => set('profession', value)}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${form.profession === value ? 'border-gold-500/40 bg-gold-500/8 text-gold-300' : 'border-zinc-800 hover:border-zinc-700 text-zinc-400'}`}>
                  <span className="text-xl">{emoji}</span>
                  <span className="text-sm">{t(`consult.professions.${value}`)}</span>
                  {form.profession === value && <CheckCircle2 size={14} className="text-gold-400 ml-auto" />}
                </button>
              ))}
            </div>
            <button onClick={() => setStep(2)} disabled={!form.profession} className="w-full btn-gold flex items-center justify-center gap-2 disabled:opacity-50">
              {t('consult.next')} <ChevronRight size={16} />
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
            <div>
              <p className="text-sm text-zinc-300 mb-3">{t('consult.projectType')}</p>
              <div className="grid grid-cols-2 gap-2">
                {PROJECT_TYPE_KEYS.map(({ value, emoji }) => (
                  <button key={value} onClick={() => set('projectType', value)}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-sm transition-all ${form.projectType === value ? 'border-gold-500/40 bg-gold-500/8 text-gold-300' : 'border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}>
                    <span>{emoji}</span><span className="text-xs">{t(`consult.projectTypes.${value}`)}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-zinc-300 mb-3">{t('consult.scale')}</p>
              <div className="grid grid-cols-2 gap-2">
                {SCALE_KEYS.map((key) => (
                  <button key={key} onClick={() => set('scale', key)}
                    className={`p-3 rounded-xl border text-xs transition-all ${form.scale === key ? 'border-gold-500/40 bg-gold-500/8 text-gold-300' : 'border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}>
                    {t(`consult.scales.${key}`)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-zinc-300 mb-3">{t('consult.budget')}</p>
              <div className="space-y-2">
                {BUDGET_KEYS.map((key) => (
                  <button key={key} onClick={() => set('budget', key)}
                    className={`w-full p-3 rounded-xl border text-xs text-left transition-all ${form.budget === key ? 'border-gold-500/40 bg-gold-500/8 text-gold-300' : 'border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}>
                    {t(`consult.budgets.${key}`)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-zinc-300 mb-3">{t('consult.products')}</p>
              <div className="grid grid-cols-2 gap-2">
                {PRODUCT_OPTIONS.map(({ id, label }) => (
                  <button key={id} onClick={() => toggleProduct(id)}
                    className={`p-3 rounded-xl border text-xs text-left transition-all ${form.interestedProducts.includes(id) ? 'border-gold-500/40 bg-gold-500/8 text-gold-300' : 'border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}>
                    {form.interestedProducts.includes(id) && '✓ '}{label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="btn-outline px-5">{t('consult.prev')}</button>
              <button onClick={() => setStep(3)} disabled={!form.projectType} className="flex-1 btn-gold flex items-center justify-center gap-2 disabled:opacity-50">
                {t('consult.next')} <ChevronRight size={16} />
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            {[
              { key: 'name',    label: `${t('consult.nameLabel')} *`,    type: 'text',  placeholder: t('consult.namePlaceholder') },
              { key: 'company', label: t('consult.companyLabel'),          type: 'text',  placeholder: t('consult.companyPlaceholder') },
              { key: 'email',   label: `${t('consult.emailLabel')} *`,   type: 'email', placeholder: t('consult.emailPlaceholder') },
              { key: 'phone',   label: t('consult.phoneLabel'),            type: 'tel',   placeholder: t('consult.phonePlaceholder') },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label className="text-xs text-zinc-300 mb-1.5 block">{label}</label>
                <input type={type} value={(form as any)[key]} onChange={e => set(key, e.target.value)} placeholder={placeholder}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-gold-500/40 transition-all" />
              </div>
            ))}
            <div>
              <label className="text-xs text-zinc-300 mb-1.5 block">{t('consult.preferredContact')}</label>
              <div className="flex gap-2">
                {CONTACT_METHOD_KEYS.map((key) => (
                  <button key={key} onClick={() => set('contactMethod', key)}
                    className={`flex-1 py-2.5 rounded-xl border text-xs transition-all ${form.contactMethod === key ? 'border-gold-500/40 bg-gold-500/8 text-gold-300' : 'border-zinc-700 text-zinc-300'}`}>
                    {t(`consult.contactMethods.${key}`)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-zinc-300 mb-1.5 block">{t('consult.requestLabel')}</label>
              <textarea value={form.message} onChange={e => set('message', e.target.value)}
                placeholder={t('consult.requestPlaceholder')} rows={3}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-gold-500/40 transition-all resize-none" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="btn-outline px-5">{t('consult.prev')}</button>
              <button onClick={() => setStep(4)} disabled={!form.name || !form.email} className="flex-1 btn-gold flex items-center justify-center gap-2 disabled:opacity-50">
                {t('consult.confirmNext')} <ChevronRight size={16} />
              </button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="card p-5 mb-5 space-y-3">
              <p className="text-sm font-medium text-zinc-200 mb-3">{t('consult.confirmTitle')}</p>
              {[
                { label: t('consult.nameLabel'),                    value: form.name },
                form.company ? { label: t('consult.companyLabel'), value: form.company } : null,
                { label: t('consult.emailLabel'),                   value: form.email },
                { label: t('consult.confirmFields.profession'),     value: t(`consult.professions.${form.profession}`) },
                { label: t('consult.confirmFields.project'),        value: t(`consult.projectTypes.${form.projectType}`) },
                form.scale ? { label: t('consult.confirmFields.scale'), value: t(`consult.scales.${form.scale}`) } : null,
                form.budget ? { label: t('consult.confirmFields.budget'), value: t(`consult.budgets.${form.budget}`) } : null,
                { label: t('consult.confirmFields.contact'),        value: t(`consult.contactMethods.${form.contactMethod}`) },
                form.interestedProducts.length > 0
                  ? { label: t('consult.confirmFields.products'), value: form.interestedProducts.join(', ') }
                  : null,
              ].filter(Boolean).map((item: any) => (
                <div key={item.label} className="flex justify-between items-start gap-2">
                  <span className="text-xs text-zinc-300 flex-shrink-0">{item.label}</span>
                  <span className="text-xs text-zinc-300 text-right">{item.value}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(3)} className="btn-outline px-5">{t('consult.prev')}</button>
              <button onClick={handleSubmit} disabled={loading} className="flex-1 btn-gold flex items-center justify-center gap-2">
                {loading ? <div className="w-4 h-4 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin" /> : t('consult.confirmBtn')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
