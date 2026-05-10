'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, Trash2, Eye } from 'lucide-react'

interface Post {
  id: string
  author: string
  country: string
  flag: string
  message: string
  emoji: string
  date: string
  likes: number
  visible: boolean
}

const initialPosts: Post[] = [
  { id: '1', author: 'Sakura M.', country: '東京, 日本', flag: '🇯🇵', message: '照明が本当に素晴らしかった。くつろぎモードで映画を見ながら過ごす夜が最高でした。また絶対来ます！', emoji: '✨', date: '2026-05-08', likes: 12, visible: true },
  { id: '2', author: 'Thomas K.', country: 'Munich, Germany', flag: '🇩🇪', message: 'The ECUANEST lighting is incredible. Never experienced organic EL panels before. The "Dawn" scene in the morning was magical with Mount Fuji in the background.', emoji: '🌅', date: '2026-05-05', likes: 18, visible: true },
  { id: '3', author: '李 偉', country: '上海, 中国', flag: '🇨🇳', message: '灯光设计太美了！有机EL照明让整个空间充满了温暖的光芒。', emoji: '🏔️', date: '2026-05-02', likes: 9, visible: true },
  { id: '4', author: 'Emma L.', country: 'London, UK', flag: '🇬🇧', message: 'What a hidden gem! The lighting transformed throughout the day automatically.', emoji: '💡', date: '2026-04-28', likes: 24, visible: true },
  { id: '5', author: '田中 拓也', country: '大阪, 日本', flag: '🇯🇵', message: '建築家として訪問しました。この照明の均一な面発光と演色性には感動しました。', emoji: '🏗️', date: '2026-04-22', likes: 31, visible: true },
]

export default function OwnerGuestbookPage() {
  const [posts, setPosts] = useState<Post[]>(initialPosts)

  const toggleVisibility = (id: string) => {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, visible: !p.visible } : p)))
  }

  const deletePost = (id: string) => {
    if (confirm('この投稿を削除しますか？')) {
      setPosts((prev) => prev.filter((p) => p.id !== id))
    }
  }

  const visible = posts.filter((p) => p.visible).length
  const hidden = posts.filter((p) => !p.visible).length

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <div className="mb-5">
        <h1 className="text-xl font-medium text-zinc-100">寄せ書き管理</h1>
        <p className="text-sm text-zinc-500 mt-0.5">
          公開中 {visible}件 · 非表示 {hidden}件
        </p>
      </div>

      <div className="space-y-3">
        {posts.map((post, i) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`bg-zinc-900 border rounded-2xl p-4 transition-all ${
              post.visible ? 'border-zinc-800' : 'border-zinc-800 opacity-50'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-xl flex-shrink-0">
                {post.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-zinc-200">{post.author}</span>
                  <span className="text-xs text-zinc-600">{post.flag} {post.country}</span>
                  <span className="text-xs text-zinc-700 ml-auto">{post.date}</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">{post.message}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="flex items-center gap-1 text-xs text-zinc-600">
                    <Heart size={10} /> {post.likes}
                  </span>
                  <div className="flex gap-2 ml-auto">
                    <button
                      onClick={() => toggleVisibility(post.id)}
                      className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg border transition-all ${
                        post.visible
                          ? 'border-zinc-700 text-zinc-500 hover:border-zinc-600'
                          : 'border-blue-500/30 bg-blue-500/10 text-blue-400'
                      }`}
                    >
                      <Eye size={11} />
                      {post.visible ? '非表示' : '表示する'}
                    </button>
                    <button
                      onClick={() => deletePost(post.id)}
                      className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg border border-zinc-700 text-zinc-600 hover:border-red-500/30 hover:text-red-400 transition-all"
                    >
                      <Trash2 size={11} />
                      削除
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
