'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin, Plus, Pencil, Trash2, ChevronUp, ChevronDown, Eye, EyeOff,
  Star, Globe, Navigation, X, Check, RotateCcw, GripVertical,
} from 'lucide-react'
import Link from 'next/link'
import { useStore } from '@/lib/useStore'
import {
  addPlace, updatePlace, deletePlace, movePlace, resetPlaces,
} from '@/lib/store'
import type { RecommendedPlace, PlaceCategory } from '@/lib/store'

const CATEGORIES: { value: PlaceCategory; label: string; emoji: string }[] = [
  { value: 'food',     label: 'グルメ', emoji: '🍽️' },
  { value: 'nature',   label: '自然',   emoji: '🌿' },
  { value: 'activity', label: '体験',   emoji: '⛷️' },
  { value: 'onsen',    label: '温泉',   emoji: '♨️' },
  { value: 'shop',     label: '買い物', emoji: '🛍️' },
]

const EMOJI_CHOICES = ['🏞️', '🍲', '🍦', '🎢', '🚴', '⛵', '🛍️', '☕', '♨️', '🌄', '⛲', '🌷', '🍷', '🏔️', '🎨', '🚣', '🦢', '📸', '🥾', '🗾']

type DraftPlace = Omit<RecommendedPlace, 'id' | 'visible'> & { id?: string; visible?: boolean }

const EMPTY_DRAFT: DraftPlace = {
  name: '', sub: '', category: 'food', emoji: '📍',
  distance: '', duration: '', rating: 4, description: '', tags: [], url: '', mapUrl: '',
}

function Field({
  label, value, onChange, placeholder, accent,
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; accent: string
}) {
  return (
    <div>
      <label className="text-xs text-zinc-300 mb-1 block">{label}</label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none transition-all"
        style={{ caretColor: accent }}
      />
    </div>
  )
}

export default function PlacesEditor({
  accentColor, backHref, portalLabel,
}: {
  accentColor: string; backHref: string; portalLabel: string
}) {
  const [store] = useStore()
  const [editing, setEditing] = useState<string | null>(null) // place id or 'new'
  const [draft, setDraft] = useState<DraftPlace>(EMPTY_DRAFT)
  const [tagsInput, setTagsInput] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const places = store.places

  const openNew = () => {
    setDraft(EMPTY_DRAFT)
    setTagsInput('')
    setEditing('new')
  }

  const openEdit = (p: RecommendedPlace) => {
    setDraft({ ...p })
    setTagsInput(p.tags.join('、'))
    setEditing(p.id)
  }

  const closeForm = () => { setEditing(null); setDraft(EMPTY_DRAFT); setTagsInput('') }

  const save = () => {
    const tags = tagsInput.split(/[、,]/).map(s => s.trim()).filter(Boolean)
    const data = { ...draft, tags }
    if (editing === 'new') {
      addPlace({
        name: data.name, sub: data.sub, category: data.category, emoji: data.emoji,
        distance: data.distance, duration: data.duration, rating: data.rating,
        description: data.description, tags, url: data.url || undefined, mapUrl: data.mapUrl || undefined,
      })
    } else if (editing) {
      updatePlace(editing, {
        name: data.name, sub: data.sub, category: data.category, emoji: data.emoji,
        distance: data.distance, duration: data.duration, rating: data.rating,
        description: data.description, tags, url: data.url || undefined, mapUrl: data.mapUrl || undefined,
      })
    }
    closeForm()
  }

  const canSave = draft.name.trim().length > 0

  return (
    <div className="max-w-2xl mx-auto pb-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-xs text-zinc-400">
        <Link href={backHref} className="hover:text-zinc-200 transition-colors">{portalLabel}</Link>
        <span className="text-zinc-400">/</span>
        <span className="text-zinc-300">おすすめスポット編集</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
               style={{ background: `${accentColor}18`, border: `1px solid ${accentColor}30` }}>
            <MapPin size={20} style={{ color: accentColor }} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-zinc-100">おすすめスポット編集</h1>
            <p className="text-xs text-zinc-400 mt-0.5">ゲストの周辺マップに表示される情報を編集できます（{places.length}件）</p>
          </div>
        </div>
      </div>

      {/* Add + Reset */}
      <div className="flex gap-2 mb-5">
        <button
          onClick={openNew}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all active:scale-[0.98]"
          style={{ background: accentColor, color: '#09090b' }}
        >
          <Plus size={16} /> 新しいスポットを追加
        </button>
        <button
          onClick={() => { if (confirm('初期スポット一覧にリセットします。よろしいですか？')) resetPlaces() }}
          className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm text-zinc-300 bg-zinc-800/60 border border-zinc-700 hover:bg-zinc-800 transition-all"
          title="初期状態にリセット"
        >
          <RotateCcw size={15} />
        </button>
      </div>

      {/* Place list */}
      <div className="space-y-2.5">
        {places.map((p, idx) => (
          <div
            key={p.id}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3.5"
            style={{ opacity: p.visible ? 1 : 0.55 }}
          >
            <div className="flex items-start gap-3">
              {/* Reorder */}
              <div className="flex flex-col items-center gap-0.5 pt-0.5">
                <button onClick={() => movePlace(p.id, 'up')} disabled={idx === 0}
                        className="text-zinc-300 hover:text-zinc-200 disabled:opacity-20 transition-colors">
                  <ChevronUp size={16} />
                </button>
                <GripVertical size={12} className="text-zinc-400" />
                <button onClick={() => movePlace(p.id, 'down')} disabled={idx === places.length - 1}
                        className="text-zinc-300 hover:text-zinc-200 disabled:opacity-20 transition-colors">
                  <ChevronDown size={16} />
                </button>
              </div>

              <div className="w-11 h-11 rounded-xl bg-zinc-800 flex items-center justify-center text-xl flex-shrink-0">
                {p.emoji}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-zinc-100 truncate">{p.name}</p>
                  <span className="text-[11px] px-1.5 py-0.5 rounded-md flex-shrink-0"
                        style={{ background: `${accentColor}15`, color: accentColor }}>
                    {CATEGORIES.find(c => c.value === p.category)?.label ?? p.category}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 truncate">{p.sub}</p>
                <div className="flex items-center gap-2.5 mt-1">
                  <span className="flex items-center gap-0.5">
                    {Array.from({ length: p.rating }).map((_, i) => (
                      <Star key={i} size={9} className="text-gold-400 fill-gold-400" />
                    ))}
                  </span>
                  <span className="text-[11px] text-zinc-400">{p.distance}</span>
                  {p.url && <Globe size={11} className="text-emerald-400" />}
                  {p.mapUrl && <Navigation size={11} className="text-blue-400" />}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => updatePlace(p.id, { visible: !p.visible })}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-all"
                  title={p.visible ? '非表示にする' : '表示する'}
                >
                  {p.visible ? <Eye size={15} /> : <EyeOff size={15} />}
                </button>
                <button
                  onClick={() => openEdit(p)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-all"
                  title="編集"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => setConfirmDelete(p.id)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  title="削除"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Delete confirm */}
            <AnimatePresence>
              {confirmDelete === p.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 pt-3 border-t border-zinc-800 flex items-center justify-between gap-2">
                    <p className="text-xs text-zinc-300">「{p.name}」を削除しますか？</p>
                    <div className="flex gap-2">
                      <button onClick={() => setConfirmDelete(null)}
                              className="text-xs px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-all">
                        キャンセル
                      </button>
                      <button onClick={() => { deletePlace(p.id); setConfirmDelete(null) }}
                              className="text-xs px-3 py-1.5 rounded-lg bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25 transition-all">
                        削除
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Edit/Add modal */}
      <AnimatePresence>
        {editing && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50" style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
              onClick={closeForm}
            />
            <motion.div
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="fixed inset-x-0 bottom-0 z-50 max-w-2xl mx-auto max-h-[92vh] overflow-y-auto bg-zinc-900 border-t border-zinc-700 rounded-t-3xl p-5"
            >
              <div className="flex items-center justify-between mb-5 sticky top-0">
                <h2 className="text-lg font-semibold text-zinc-100">
                  {editing === 'new' ? 'スポットを追加' : 'スポットを編集'}
                </h2>
                <button onClick={closeForm} className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-300 hover:bg-zinc-700 transition-all">
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Emoji + category */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-zinc-300 mb-1 block">アイコン</label>
                    <div className="flex items-center gap-2">
                      <div className="w-11 h-11 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-2xl flex-shrink-0">
                        {draft.emoji}
                      </div>
                      <input
                        type="text"
                        value={draft.emoji}
                        onChange={e => setDraft({ ...draft, emoji: e.target.value.slice(0, 4) })}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-100 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-300 mb-1 block">カテゴリ</label>
                    <select
                      value={draft.category}
                      onChange={e => setDraft({ ...draft, category: e.target.value as PlaceCategory })}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-100 focus:outline-none"
                    >
                      {CATEGORIES.map(c => (
                        <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Emoji quick picks */}
                <div className="flex flex-wrap gap-1.5">
                  {EMOJI_CHOICES.map(e => (
                    <button key={e} onClick={() => setDraft({ ...draft, emoji: e })}
                            className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-base transition-all">
                      {e}
                    </button>
                  ))}
                </div>

                <Field label="名称" value={draft.name} onChange={v => setDraft({ ...draft, name: v })} placeholder="山中湖" accent={accentColor} />
                <Field label="サブ名称（英語など）" value={draft.sub} onChange={v => setDraft({ ...draft, sub: v })} placeholder="Lake Yamanakako" accent={accentColor} />

                <div className="grid grid-cols-2 gap-3">
                  <Field label="距離" value={draft.distance} onChange={v => setDraft({ ...draft, distance: v })} placeholder="0.5km" accent={accentColor} />
                  <Field label="所要時間" value={draft.duration} onChange={v => setDraft({ ...draft, duration: v })} placeholder="徒歩 7分" accent={accentColor} />
                </div>

                {/* Rating */}
                <div>
                  <label className="text-xs text-zinc-300 mb-1.5 block">評価</label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button key={n} onClick={() => setDraft({ ...draft, rating: n })}>
                        <Star size={24} className={n <= draft.rating ? 'text-gold-400 fill-gold-400' : 'text-zinc-400'} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-zinc-300 mb-1 block">説明</label>
                  <textarea
                    rows={3}
                    value={draft.description}
                    onChange={e => setDraft({ ...draft, description: e.target.value })}
                    placeholder="スポットの魅力を簡潔に..."
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none resize-none"
                  />
                </div>

                <Field label="タグ（、または , 区切り）" value={tagsInput} onChange={setTagsInput} placeholder="絶景、サイクリング、SUP" accent={accentColor} />

                <div>
                  <label className="text-xs text-zinc-300 mb-1 flex items-center gap-1.5"><Globe size={11} className="text-emerald-400" /> 公式サイト URL（任意）</label>
                  <input
                    type="url"
                    value={draft.url ?? ''}
                    onChange={e => setDraft({ ...draft, url: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-300 mb-1 flex items-center gap-1.5"><Navigation size={11} className="text-blue-400" /> Google Maps URL（任意）</label>
                  <input
                    type="url"
                    value={draft.mapUrl ?? ''}
                    onChange={e => setDraft({ ...draft, mapUrl: e.target.value })}
                    placeholder="https://maps.google.com/?q=..."
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button onClick={closeForm}
                          className="flex-1 rounded-xl py-3 text-sm text-zinc-300 bg-zinc-800 hover:bg-zinc-700 transition-all">
                    キャンセル
                  </button>
                  <button onClick={save} disabled={!canSave}
                          className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-40"
                          style={{ background: accentColor, color: '#09090b' }}>
                    <Check size={15} /> 保存
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
