'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Trash2, Eye, EyeOff, BookOpen, AlertTriangle, X } from 'lucide-react'
import { useStore } from '@/lib/useStore'
import { getStore, updateGuestbookPost, deleteGuestbookPost } from '@/lib/store'

export default function OwnerGuestbookPage() {
  const [store, update] = useStore()
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const posts = store.guestbookPosts
  const visibleCount = posts.filter(p => p.visible).length
  const hiddenCount = posts.filter(p => !p.visible).length
  const totalLikes = posts.reduce((sum, p) => sum + p.likes, 0)

  const toggleVisibility = (id: string, current: boolean) => {
    updateGuestbookPost(id, { visible: !current })
    update({ guestbookPosts: getStore().guestbookPosts })
  }

  const confirmDelete = (id: string) => {
    setConfirmDeleteId(id)
  }

  const handleDelete = (id: string) => {
    deleteGuestbookPost(id)
    update({ guestbookPosts: getStore().guestbookPosts })
    setConfirmDeleteId(null)
  }

  const cancelDelete = () => {
    setConfirmDeleteId(null)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-5"
    >
      {/* Header */}
      <div>
        <h1 className="text-xl font-medium text-zinc-100">寄せ書き管理</h1>
        <p className="text-sm text-zinc-500 mt-0.5">ゲストブック・モデレーション</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <BookOpen size={12} className="text-zinc-400" />
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">合計</p>
          </div>
          <p className="text-2xl font-light text-zinc-100">{posts.length}</p>
        </div>
        <div className="bg-zinc-900 border border-emerald-500/20 rounded-2xl p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <Eye size={12} className="text-emerald-400" />
            <p className="text-[10px] text-emerald-400 uppercase tracking-wider">公開中</p>
          </div>
          <p className="text-2xl font-light text-emerald-400">{visibleCount}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <Heart size={12} className="text-rose-400" />
            <p className="text-[10px] text-rose-400 uppercase tracking-wider">いいね</p>
          </div>
          <p className="text-2xl font-light text-rose-400">{totalLikes}</p>
        </div>
      </div>

      {hiddenCount > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/5 border border-amber-500/20 rounded-xl">
          <EyeOff size={13} className="text-amber-400" />
          <p className="text-xs text-amber-400">{hiddenCount}件の投稿が非表示になっています</p>
        </div>
      )}

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {confirmDeleteId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={cancelDelete}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-sm"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle size={18} className="text-red-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-100">投稿を削除しますか？</p>
                  <p className="text-xs text-zinc-500 mt-0.5">この操作は元に戻せません</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={cancelDelete}
                  className="flex-1 py-2.5 border border-zinc-700 text-zinc-400 rounded-xl text-sm hover:border-zinc-600 transition-all"
                >
                  キャンセル
                </button>
                <button
                  onClick={() => handleDelete(confirmDeleteId)}
                  className="flex-1 py-2.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm hover:bg-red-500/20 transition-all font-medium"
                >
                  削除する
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Post list */}
      {posts.length === 0 ? (
        <div className="text-center py-12 text-zinc-600 text-sm">
          <BookOpen size={32} className="mx-auto mb-3 opacity-30" />
          <p>寄せ書きの投稿はありません</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              layout
              className={`bg-zinc-900 border rounded-2xl p-4 transition-all ${
                post.visible
                  ? 'border-zinc-800'
                  : 'border-zinc-800/50 opacity-50'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Emoji avatar */}
                <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-xl flex-shrink-0">
                  {post.emoji}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Author row */}
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-sm font-medium text-zinc-200">{post.author}</span>
                    <span className="text-xs text-zinc-600">{post.flag} {post.country}</span>
                    {!post.visible && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full border border-zinc-700 bg-zinc-800 text-zinc-500">
                        非表示
                      </span>
                    )}
                    <span className="text-xs text-zinc-700 ml-auto">{post.date}</span>
                  </div>

                  {/* Message */}
                  <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">{post.message}</p>

                  {/* Actions */}
                  <div className="flex items-center gap-3 mt-3">
                    <span className="flex items-center gap-1 text-xs text-zinc-600">
                      <Heart size={11} className="text-rose-500/50" /> {post.likes}
                    </span>
                    <div className="flex gap-2 ml-auto">
                      <button
                        onClick={() => toggleVisibility(post.id, post.visible)}
                        className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-xl border transition-all ${
                          post.visible
                            ? 'border-zinc-700 text-zinc-500 hover:border-amber-500/30 hover:text-amber-400 hover:bg-amber-500/5'
                            : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                        }`}
                      >
                        {post.visible ? (
                          <><EyeOff size={11} /> 非表示</>
                        ) : (
                          <><Eye size={11} /> 表示する</>
                        )}
                      </button>
                      <button
                        onClick={() => confirmDelete(post.id)}
                        className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-xl border border-zinc-700 text-zinc-600 hover:border-red-500/30 hover:text-red-400 hover:bg-red-500/5 transition-all"
                      >
                        <Trash2 size={11} /> 削除
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
