'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Send, Sparkles, RefreshCw, UserRound } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/lib/useLanguage'
import { translations } from '@/lib/i18n'
import { useStore } from '@/lib/useStore'
import { sendMessage as sendStaffMessage, markMessagesRead, getStore } from '@/lib/store'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

type ChatTab = 'ai' | 'staff'

export default function ChatPage() {
  const { t, lang } = useLanguage()
  const [store, update] = useStore()
  const suggestions: string[] = translations[lang]?.chat?.suggestions ?? translations.ja.chat.suggestions

  const buildWelcome = (): Message => ({
    id: 'welcome', role: 'assistant', content: t('chat.welcome'), timestamp: new Date(),
  })

  const [tab, setTab] = useState<ChatTab>('ai')
  const [messages, setMessages] = useState<Message[]>([buildWelcome()])
  const [input, setInput] = useState('')
  const [staffInput, setStaffInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const staffThread = store.messages
  const unreadStaff = staffThread.filter(m => m.from !== 'guest' && !m.readByGuest).length

  // 未読のスタッフメッセージがあれば、スタッフタブを初期表示する
  useEffect(() => {
    if (getStore().messages.some(m => m.from !== 'guest' && !m.readByGuest)) {
      setTab('staff')
    }
  }, [])

  // スタッフタブ表示中は未読を既読化する（未読ガード付き — 無限ループ防止）
  useEffect(() => {
    if (tab !== 'staff') return
    if (store.messages.some(m => m.from !== 'guest' && !m.readByGuest)) {
      markMessagesRead('guest')
      update({ messages: getStore().messages })
    }
  }, [tab, store.messages, update])

  // Rebuild welcome message when language changes
  useEffect(() => {
    setMessages(prev => {
      if (prev.length === 1 && prev[0].id === 'welcome') return [buildWelcome()]
      return prev
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, tab, staffThread.length])

  const sendAiMessage = async (text: string) => {
    if (!text.trim() || loading) return

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text.trim(), timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    let isConfigError = false
    let isQuotaError = false
    let errorDetail: string | null = null
    try {
      // ゲスト固有の context (滞在日程・施設の入退館時刻) を API に渡す
      const guestContext = store.guestInfo ? {
        name: store.guestInfo.name,
        checkIn: store.guestInfo.checkIn,
        checkOut: store.guestInfo.checkOut,
        adults: store.guestInfo.adults,
        children: store.guestInfo.children,
        nationality: store.guestInfo.nationality,
      } : null
      const facilityContext = {
        checkInTime: store.facilitySettings.checkInTime,
        checkOutTime: store.facilitySettings.checkOutTime,
        wifiName: store.facilitySettings.wifiName,
        wifiPassword: store.facilitySettings.wifiPassword,
      }
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
          guest: guestContext,
          facility: facilityContext,
          lang,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 503) isConfigError = true
        if (res.status === 429 || data.error === 'QUOTA_EXCEEDED') isQuotaError = true
        errorDetail = data.detail || data.error || `HTTP ${res.status}`
        throw new Error(data.error || 'API error')
      }
      setMessages(prev => [...prev, { id: (Date.now()+1).toString(), role: 'assistant', content: data.content, timestamp: new Date() }])
    } catch (err) {
      if (!errorDetail) {
        errorDetail = err instanceof Error ? err.message : 'Unknown error'
      }
      let baseMsg: string
      if (isConfigError) {
        baseMsg = `⚠️ ${t('chat.apiError')}`
      } else if (isQuotaError) {
        baseMsg = `⚠️ ${t('chat.quotaError')}`
      } else {
        baseMsg = t('chat.genericError')
      }
      setMessages(prev => [...prev, {
        id: (Date.now()+1).toString(), role: 'assistant',
        content: baseMsg,
        timestamp: new Date(),
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleStaffSend = (e: React.FormEvent) => {
    e.preventDefault()
    const text = staffInput.trim()
    if (!text) return
    sendStaffMessage('guest', text)
    update({ messages: getStore().messages })
    setStaffInput('')
  }

  return (
    <div className="flex flex-col max-w-[430px] mx-auto min-h-screen bg-zinc-950">
      <div className="flex items-center gap-3 px-4 pt-6 pb-3 border-b border-zinc-800 flex-shrink-0">
        <Link href="/dashboard" className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-all">
          <ArrowLeft size={18} className="text-zinc-300" />
        </Link>
        <div className="flex items-center gap-2 flex-1">
          <div className="w-9 h-9 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center">
            {tab === 'ai'
              ? <Sparkles size={16} className="text-gold-400" />
              : <UserRound size={16} className="text-gold-400" />}
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-100">
              {tab === 'ai' ? t('chat.title') : t('chat.staffTitle')}
            </p>
            <p className="flex items-center gap-1 text-xs text-emerald-400">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block" />
              {t('chat.online')}
            </p>
          </div>
        </div>
        {tab === 'ai' && (
          <button onClick={() => setMessages([buildWelcome()])} className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-all">
            <RefreshCw size={15} className="text-zinc-400" />
          </button>
        )}
      </div>

      {/* Tab switcher — AIコンシェルジュ / スタッフ */}
      <div className="px-4 pt-3 pb-1 flex-shrink-0">
        <div className="flex rounded-xl p-1 gap-1" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
          {(['ai', 'staff'] as ChatTab[]).map(id => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`relative flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                tab === id ? 'bg-gold-500/15 text-gold-300 border border-gold-500/25' : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
              }`}
            >
              {id === 'ai' ? t('chat.tabAI') : t('chat.tabStaff')}
              {id === 'staff' && unreadStaff > 0 && tab !== 'staff' && (
                <span className="absolute top-1 right-2 w-2 h-2 bg-gold-400 rounded-full animate-pulse" />
              )}
            </button>
          ))}
        </div>
      </div>

      {tab === 'ai' ? (
        <>
          <div className="flex-1 overflow-y-auto px-4 py-4 pb-6 space-y-4">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}>
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-xs">✦</span>
                    </div>
                  )}
                  <div className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user' ? 'bg-gold-500/15 border border-gold-500/20 text-zinc-100 rounded-tr-sm' : 'bg-zinc-800/80 text-zinc-300 rounded-tl-sm'
                  }`}>
                    {msg.content}
                    <p className="text-[11px] text-zinc-400 mt-1.5">{msg.timestamp.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start gap-2">
                <div className="w-8 h-8 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs">✦</span>
                </div>
                <div className="bg-zinc-800/80 rounded-2xl rounded-tl-sm px-4 py-3.5">
                  <div className="flex gap-1.5 items-center">
                    {[0, 0.2, 0.4].map((delay, i) => (
                      <div key={i} className="w-1.5 h-1.5 bg-gold-400 rounded-full animate-bounce" style={{ animationDelay: `${delay}s` }} />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="px-4 pb-2 flex gap-2 overflow-x-auto flex-shrink-0 scrollbar-hide">
            {suggestions.map((s) => (
              <button key={s} onClick={() => sendAiMessage(s)} disabled={loading}
                className="flex-shrink-0 text-xs border border-zinc-700 hover:border-gold-500/30 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-300 rounded-full px-3 py-1.5 transition-all disabled:opacity-50">
                {s}
              </button>
            ))}
          </div>

          <div className="px-4 py-3 pb-safe border-t border-zinc-800 bg-zinc-950 flex-shrink-0 mb-20">
            <form onSubmit={(e) => { e.preventDefault(); sendAiMessage(input) }} className="flex gap-2">
              <input
                type="text" value={input} onChange={e => setInput(e.target.value)}
                placeholder={t('chat.placeholder')} disabled={loading}
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-gold-500/40 transition-all disabled:opacity-50"
              />
              <button type="submit" disabled={!input.trim() || loading}
                className="w-11 h-11 rounded-xl bg-gold-500 hover:bg-gold-400 flex items-center justify-center transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0">
                <Send size={16} className="text-zinc-950" />
              </button>
            </form>
          </div>
        </>
      ) : (
        <>
          {/* スタッフ直通スレッド — sendMessage('guest') で store.messages に永続化される */}
          <div className="flex-1 overflow-y-auto px-4 py-4 pb-6 space-y-4">
            <p className="text-[11px] text-zinc-500 text-center leading-relaxed px-6">
              {t('chat.staffIntro')}
            </p>
            {staffThread.length === 0 && (
              <p className="text-xs text-zinc-600 text-center pt-10">{t('chat.staffEmpty')}</p>
            )}
            <AnimatePresence initial={false}>
              {staffThread.map((msg) => {
                const isGuest = msg.from === 'guest'
                return (
                  <motion.div key={msg.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
                    className={`flex ${isGuest ? 'justify-end' : 'justify-start'} gap-2`}>
                    {!isGuest && (
                      <div className="w-8 h-8 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                        <UserRound size={13} className="text-gold-400" />
                      </div>
                    )}
                    <div className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                      isGuest ? 'bg-gold-500/15 border border-gold-500/20 text-zinc-100 rounded-tr-sm' : 'bg-zinc-800/80 text-zinc-300 rounded-tl-sm'
                    }`}>
                      {!isGuest && (
                        <p className="text-[11px] text-gold-400/80 mb-1">{t('chat.staffLabel')}</p>
                      )}
                      {msg.content}
                      <p className="text-[11px] text-zinc-400 mt-1.5">{msg.createdAt}</p>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          <div className="px-4 py-3 pb-safe border-t border-zinc-800 bg-zinc-950 flex-shrink-0 mb-20">
            <form onSubmit={handleStaffSend} className="flex gap-2">
              <input
                type="text" value={staffInput} onChange={e => setStaffInput(e.target.value)}
                placeholder={t('chat.staffPlaceholder')}
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-gold-500/40 transition-all"
              />
              <button type="submit" disabled={!staffInput.trim()}
                className="w-11 h-11 rounded-xl bg-gold-500 hover:bg-gold-400 flex items-center justify-center transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0">
                <Send size={16} className="text-zinc-950" />
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  )
}
