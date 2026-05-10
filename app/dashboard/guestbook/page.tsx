'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Camera, Send, Heart, X } from 'lucide-react'
import Link from 'next/link'

interface GuestPost {
  id: string
  author: string
  country: string
  flag: string
  message: string
  emoji: string
  date: string
  likes: number
  liked: boolean
}

const initialPosts: GuestPost[] = [
  {
    id: '1',
    author: 'Sakura M.',
    country: '東京, 日本',
    flag: '🇯🇵',
    message: '照明が本当に素晴らしかった。くつろぎモードで映画を見ながら過ごす夜が最高でした。また絶対来ます！',
    emoji: '✨',
    date: '2026-05-08',
    likes: 12,
    liked: false,
  },
  {
    id: '2',
    author: 'Thomas K.',
    country: 'Munich, Germany',
    flag: '🇩🇪',
    message: 'The ECUANEST lighting is incredible. Never experienced organic EL panels before. The "Dawn" scene in the morning was magical with Mount Fuji in the background.',
    emoji: '🌅',
    date: '2026-05-05',
    likes: 18,
    liked: false,
  },
  {
    id: '3',
    author: '李 偉',
    country: '上海, 中国',
    flag: '🇨🇳',
    message: '灯光设计太美了！有机EL照明让整个空间充满了温暖的光芒。窗外的富士山和室内的灯光相互呼应，令人难忘。',
    emoji: '🏔️',
    date: '2026-05-02',
    likes: 9,
    liked: false,
  },
  {
    id: '4',
    author: 'Emma L.',
    country: 'London, UK',
    flag: '🇬🇧',
    message: 'What a hidden gem! The lighting transformed throughout the day automatically. Felt like living inside a piece of art. The consultation with ECUANEST is already booked!',
    emoji: '💡',
    date: '2026-04-28',
    likes: 24,
    liked: false,
  },
  {
    id: '5',
    author: '田中 拓也',
    country: '大阪, 日本',
    flag: '🇯🇵',
    message: '建築家として訪問しました。この照明の均一な面発光と演色性には感動しました。自分のプロジェクトに導入を検討中です。',
    emoji: '🏗️',
    date: '2026-04-22',
    likes: 31,
    liked: false,
  },
]

const EMOJI_OPTIONS = ['✨', '🌅', '🏔️', '💡', '🌙', '🌸', '⭐', '🎉', '🫶', '🗻']

export default function GuestbookPage() {
  const [posts, setPosts] = useState<GuestPost[]>(initialPosts)
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState('')
  const [selectedEmoji, setSelectedEmoji] = useState('✨')
  const [authorName, setAuthorName] = useState('')
  const [country, setCountry] = useState('')
  const formRef = useRef<HTMLDivElement>(null)

  const handleLike = (id: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || !authorName.trim()) return

    const newPost: GuestPost = {
      id: Date.now().toString(),
      author: authorName,
      country: country || 'Japan',
      flag: '🌏',
      message,
      emoji: selectedEmoji,
      date: new Date().toISOString().split('T')[0],
      likes: 0,
      liked: false,
    }

    setPosts((prev) => [newPost, ...prev])
    setMessage('')
    setAuthorName('')
    setCountry('')
    setSelectedEmoji('✨')
    setShowForm(false)
  }

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-all">
            <ArrowLeft size={18} className="text-zinc-300" />
          </Link>
          <div>
            <h1 className="text-lg font-medium text-zinc-100">デジタル寄せ書き</h1>
            <p className="text-xs text-zinc-500">Guestbook · {posts.length} messages</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-gold text-xs py-2 px-4 flex items-center gap-1.5"
        >
          <Camera size={13} />
          投稿する
        </button>
      </div>

      {/* Post Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/80 backdrop-blur-sm p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false) }}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              className="w-full max-w-sm bg-zinc-900 border border-zinc-700 rounded-3xl p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-medium text-zinc-100">メッセージを残す</h2>
                <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-xl bg-zinc-800 flex items-center justify-center">
                  <X size={16} className="text-zinc-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs text-zinc-500 mb-1.5 block">絵文字を選ぶ</label>
                  <div className="flex gap-2 flex-wrap">
                    {EMOJI_OPTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setSelectedEmoji(emoji)}
                        className={`text-xl w-10 h-10 rounded-xl border transition-all ${
                          selectedEmoji === emoji
                            ? 'border-gold-500/40 bg-gold-500/10'
                            : 'border-zinc-700 hover:border-zinc-600'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-zinc-500 mb-1.5 block">お名前</label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="Taro Yamada"
                    required
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-gold-500/40 transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-500 mb-1.5 block">出身地</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Tokyo, Japan"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-gold-500/40 transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-500 mb-1.5 block">メッセージ</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="滞在の思い出や感想をお書きください..."
                    required
                    rows={3}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-gold-500/40 transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!message.trim() || !authorName.trim()}
                  className="w-full btn-gold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send size={15} />
                  投稿する
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Posts */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="space-y-4"
      >
        {posts.map((post, i) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            className="card p-5"
          >
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-2xl bg-zinc-800 flex items-center justify-center text-2xl flex-shrink-0">
                {post.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-zinc-100">{post.author}</p>
                    <p className="text-xs text-zinc-500 flex items-center gap-1">
                      <span>{post.flag}</span>
                      {post.country}
                    </p>
                  </div>
                  <span className="text-xs text-zinc-600 flex-shrink-0">{post.date}</span>
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed mt-2">{post.message}</p>
                <button
                  onClick={() => handleLike(post.id)}
                  className={`mt-3 flex items-center gap-1.5 text-xs transition-all ${
                    post.liked ? 'text-red-400' : 'text-zinc-600 hover:text-zinc-400'
                  }`}
                >
                  <Heart size={12} className={post.liked ? 'fill-red-400' : ''} />
                  {post.likes}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
