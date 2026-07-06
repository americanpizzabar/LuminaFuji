'use client'

/**
 * ゲストとのメッセージスレッド（オーナー / 管理会社 共用）。
 * - 送信元は portal に応じて 'owner' | 'manager'（ゲストには区別なく「スタッフ」表示）
 * - 表示中にゲスト発の未読を既読化する（未読ガード付き — 無限ループ防止）
 * - オーナー側では guestChat が委託中のとき「管理会社委託中」チップを表示
 *   （オーナーは常にオーバーライドで送信可能）
 */

import { useState, useEffect, useRef } from 'react'
import { MessageSquare, Send } from 'lucide-react'
import { useStore } from '@/lib/useStore'
import {
  sendMessage as storeSendMessage, markMessagesRead, getStore, scopeOf,
} from '@/lib/store'
import { ScopeChip } from '@/components/ScopeNotice'

const ACCENT = {
  owner: {
    icon: 'text-blue-400',
    bubble: 'bg-blue-600 text-white',
    meta: 'text-blue-200',
    metaDim: 'text-blue-400/50',
    button: 'bg-blue-600 hover:bg-blue-500',
    focus: 'focus:border-blue-500/40',
  },
  manager: {
    icon: 'text-teal-400',
    bubble: 'bg-teal-600 text-white',
    meta: 'text-teal-100',
    metaDim: 'text-teal-300/50',
    button: 'bg-teal-600 hover:bg-teal-500',
    focus: 'focus:border-teal-500/40',
  },
} as const

const SENDER_LABEL: Record<string, string> = {
  owner: 'オーナー',
  manager: '管理会社',
  guest: 'ゲスト',
}

export default function StaffMessageThread({ portal }: { portal: 'owner' | 'manager' }) {
  const [store, update] = useStore()
  const [input, setInput] = useState('')
  const endRef = useRef<HTMLDivElement>(null)
  const a = ACCENT[portal]
  const scope = scopeOf(store)
  const delegatedElsewhere = portal === 'owner' && scope.guestChat === 'manager'

  const unreadCount = store.messages.filter(m => m.from === 'guest' && !m.readByOwner).length

  // 表示中はゲスト発の未読をスタッフ既読にする
  useEffect(() => {
    if (store.messages.some(m => m.from === 'guest' && !m.readByOwner)) {
      markMessagesRead('owner')
      update({ messages: getStore().messages })
    }
  }, [store.messages, update])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [store.messages.length])

  const send = () => {
    const text = input.trim()
    if (!text) return
    storeSendMessage(portal, text)
    update({ messages: getStore().messages })
    setInput('')
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
      <div className="px-4 py-3 border-b border-zinc-800 flex items-center gap-2">
        <MessageSquare size={14} className={a.icon} />
        <span className="text-sm font-medium text-zinc-200">ゲストとのメッセージ</span>
        {delegatedElsewhere && <ScopeChip party="manager" />}
        {unreadCount > 0 && (
          <span className="ml-auto text-[11px] px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400">
            未読 {unreadCount}件
          </span>
        )}
      </div>

      <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
        {store.messages.length === 0 ? (
          <p className="text-center text-zinc-400 text-sm py-8">メッセージはありません</p>
        ) : (
          store.messages.map((msg) => {
            const isStaff = msg.from !== 'guest'
            return (
              <div key={msg.id} className={`flex ${isStaff ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${isStaff ? a.bubble : 'bg-zinc-800 text-zinc-200'}`}>
                  <p className="text-xs leading-relaxed">{msg.content}</p>
                  <div className={`flex items-center gap-1.5 mt-1 ${isStaff ? 'justify-end' : 'justify-start'}`}>
                    <span className={`text-[11px] ${isStaff ? a.meta : 'text-zinc-300'}`}>
                      {SENDER_LABEL[msg.from] ?? 'スタッフ'} · {msg.createdAt}
                    </span>
                    {isStaff && (
                      <span className={`text-[11px] ${msg.readByGuest ? a.meta : a.metaDim}`}>
                        {msg.readByGuest ? '既読' : '未読'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={endRef} />
      </div>

      <div className="p-4 border-t border-zinc-800">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder="ゲストへメッセージを送信..."
            className={`flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none ${a.focus} transition-all`}
          />
          <button
            onClick={send}
            disabled={!input.trim()}
            className={`w-9 h-9 rounded-xl ${a.button} flex items-center justify-center transition-all disabled:opacity-40 flex-shrink-0`}
          >
            <Send size={14} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}
