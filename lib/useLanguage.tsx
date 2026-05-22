'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { translations, LangCode, TranslationDict } from './i18n'

interface LanguageContextType {
  lang: LangCode
  setLang: (lang: LangCode) => void
  t: (key: string, vars?: Record<string, string | number>) => string
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'ja',
  setLang: () => {},
  t: (key) => key,
})

function resolve(obj: unknown, keys: string[]): string | undefined {
  let cur: unknown = obj
  for (const k of keys) {
    if (cur == null || typeof cur !== 'object') return undefined
    cur = (cur as Record<string, unknown>)[k]
  }
  return typeof cur === 'string' ? cur : undefined
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangCode>('ja')

  useEffect(() => {
    try {
      const saved = localStorage.getItem('lf_lang') as LangCode | null
      if (saved && saved in translations) setLangState(saved)
    } catch {}
  }, [])

  const setLang = (l: LangCode) => {
    setLangState(l)
    try { localStorage.setItem('lf_lang', l) } catch {}
  }

  const t = (key: string, vars?: Record<string, string | number>): string => {
    const keys = key.split('.')
    let value = resolve(translations[lang] as unknown, keys)
    if (value === undefined) value = resolve(translations['en'] as unknown, keys)
    if (value === undefined) value = resolve(translations['ja'] as unknown, keys)
    if (value === undefined) return key
    if (vars) {
      return Object.entries(vars).reduce((s, [k, v]) => s.replace(`{${k}}`, String(v)), value)
    }
    return value
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)
