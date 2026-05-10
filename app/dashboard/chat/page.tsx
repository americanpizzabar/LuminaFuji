'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Send, Sparkles, RefreshCw } from 'lucide-react'
import Link from 'next/link'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const QUICK_REPLIES = [
  'WiFiのパスワードは？',
  'チェックアウトの時間は？',
  'おすすめのレストランは？',
  '照明の操作方法を教えて',
  'What time is checkout?',
  '附近有什么好吃的？',
]

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'こんにちは！Lumina Fuji Residence のコンシェルジュです。\n\n施設のご案内、周辺情報、照明の操作など、何でもお気軽にお聞きください。日本語・英語・中国語・韓国語に対応しています。',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [hasApiKey, setHasApiKey] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const allMessages = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }))

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: allMessages }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 503) setHasApiKey(false)
        throw new Error(data.error || 'API error')
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: hasApiKey
          ? '申し訳ございません。一時的なエラーが発生しました。もう一度お試しください。'
          : '⚠️ AI チャット機能を使用するには、環境変数 GOOGLE_AI_API_KEY を設定してください。\n\nGoogle AI Studio でAPIキーを取得できます。',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const clearChat = () => {
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: 'こんにちは！Lumina Fuji Residence のコンシェルジュです。何でもお気軽にお聞きください。',
      timestamp: new Date(),
    }])
  }

  return (
    <div className="flex flex-col max-w-[430px] mx-auto min-h-screen bg-zinc-950">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-6 pb-4 border-b border-zinc-800 flex-shrink-0">
        <Link href="/dashboard" className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-all">
          <ArrowLeft size={18} className="text-zinc-300" />
        </Link>
        <div className="flex items-center gap-2 flex-1">
          <div className="w-9 h-9 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center">
            <Sparkles size={16} className="text-gold-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-100">コンシェルジュ</p>
            <p className="flex items-center gap-1 text-xs text-emerald-400">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block" />
              オンライン
            </p>
          </div>
        </div>
        <button
          onClick={clearChat}
          className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-all"
        >
          <RefreshCw size={15} className="text-zinc-400" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-6 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-xs">✦</span>
                </div>
              )}
              <div
                className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  message.role === 'user'
                    ? 'bg-gold-500/15 border border-gold-500/20 text-zinc-100 rounded-tr-sm'
                    : 'bg-zinc-800/80 text-zinc-300 rounded-tl-sm'
                }`}
              >
                {message.content}
                <p className="text-[10px] text-zinc-600 mt-1.5">
                  {message.timestamp.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start gap-2"
          >
            <div className="w-8 h-8 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-xs">✦</span>
            </div>
            <div className="bg-zinc-800/80 rounded-2xl rounded-tl-sm px-4 py-3.5">
              <div className="flex gap-1.5 items-center">
                {[0, 0.2, 0.4].map((delay, i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 bg-gold-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${delay}s` }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies */}
      <div className="px-4 pb-2 flex gap-2 overflow-x-auto flex-shrink-0">
        {QUICK_REPLIES.map((reply) => (
          <button
            key={reply}
            onClick={() => sendMessage(reply)}
            disabled={loading}
            className="flex-shrink-0 text-xs border border-zinc-700 hover:border-gold-500/30 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-300 rounded-full px-3 py-1.5 transition-all disabled:opacity-50"
          >
            {reply}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="px-4 py-3 pb-safe border-t border-zinc-800 bg-zinc-950 flex-shrink-0 mb-20">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="メッセージを入力..."
            disabled={loading}
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-gold-500/40 transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="w-11 h-11 rounded-xl bg-gold-500 hover:bg-gold-400 flex items-center justify-center transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            <Send size={16} className="text-zinc-950" />
          </button>
        </form>
      </div>
    </div>
  )
}
