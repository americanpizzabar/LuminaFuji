'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useStore } from '@/lib/useStore'
import { updateCleaningTask, resetCleaningChecklist, addMaintenanceItem, updateMaintenanceItem, getStore } from '@/lib/store'
import { CheckSquare, Calendar, Wrench, AlertTriangle, ChevronRight, Plus, RefreshCw } from 'lucide-react'
import { useState } from 'react'

const AREA_LABELS: Record<string, string> = {
  living: 'リビング', bedroom: '寝室', bathroom: 'バスルーム',
  kitchen: 'キッチン', entrance: '玄関', outdoor: '庭・デッキ',
}
const AREA_EMOJIS: Record<string, string> = {
  living: '🛋️', bedroom: '🛏️', bathroom: '🚿', kitchen: '🍳', entrance: '🚪', outdoor: '🌿',
}

export default function ManagerDashboardPage() {
  const [store, update] = useStore()
  const [showAddMaint, setShowAddMaint] = useState(false)
  const [maintDesc, setMaintDesc] = useState('')
  const [maintArea, setMaintArea] = useState('living')
  const [maintPriority, setMaintPriority] = useState<'low' | 'medium' | 'urgent'>('medium')

  const today = new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })
  const checklist = store.cleaningChecklist
  const doneCount = checklist.filter(t => t.done).length
  const totalCount = checklist.length
  const progress = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0

  const openMaint = store.maintenanceItems.filter(m => m.status !== 'done')
  const currentBooking = store.bookingHistory.find(b => b.status === 'staying')
  const nextBooking = store.bookingHistory.find(b => b.status === 'confirmed')

  const toggleTask = (id: string, done: boolean) => {
    updateCleaningTask(id, !done)
    update({ cleaningChecklist: getStore().cleaningChecklist })
  }

  const resetChecklist = () => {
    resetCleaningChecklist()
    update({ cleaningChecklist: getStore().cleaningChecklist })
  }

  const addMaint = () => {
    if (!maintDesc.trim()) return
    addMaintenanceItem({ description: maintDesc, area: maintArea, priority: maintPriority, reportedBy: 'manager' })
    update({ maintenanceItems: getStore().maintenanceItems })
    setMaintDesc('')
    setShowAddMaint(false)
  }

  const resolveMaint = (id: string) => {
    updateMaintenanceItem(id, { status: 'done', doneAt: new Date().toISOString() })
    update({ maintenanceItems: getStore().maintenanceItems })
  }

  const groupedChecklist = checklist.reduce<Record<string, typeof checklist>>((acc, task) => {
    if (!acc[task.area]) acc[task.area] = []
    acc[task.area].push(task)
    return acc
  }, {})

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div>
        <h1 className="text-xl font-medium text-zinc-100">今日のタスク</h1>
        <p className="text-sm text-zinc-500 mt-0.5">{today}</p>
      </div>

      {/* Guest status */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className={`bg-zinc-900 border rounded-2xl p-4 ${currentBooking ? 'border-emerald-500/30' : 'border-zinc-800'}`}>
          <p className="text-xs text-zinc-500 mb-2 flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${currentBooking ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'}`} />
            現在のゲスト
          </p>
          {currentBooking ? (
            <div>
              <p className="text-sm font-medium text-zinc-100">{currentBooking.flag} {currentBooking.guestName}</p>
              <p className="text-xs text-zinc-500 mt-0.5">チェックアウト: {currentBooking.checkOut} 11:00</p>
            </div>
          ) : (
            <p className="text-sm text-zinc-500">現在空室</p>
          )}
        </div>
        <div className={`bg-zinc-900 border rounded-2xl p-4 ${nextBooking ? 'border-blue-500/20' : 'border-zinc-800'}`}>
          <p className="text-xs text-zinc-500 mb-2">次のゲスト</p>
          {nextBooking ? (
            <div>
              <p className="text-sm font-medium text-zinc-100">{nextBooking.flag} {nextBooking.guestName}</p>
              <p className="text-xs text-zinc-500 mt-0.5">チェックイン: {nextBooking.checkIn} {store.facilitySettings.checkInTime}</p>
            </div>
          ) : (
            <p className="text-sm text-zinc-500">予約なし</p>
          )}
        </div>
      </div>

      {/* Cleaning checklist */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-medium text-zinc-200 flex items-center gap-2">
              <CheckSquare size={15} className="text-teal-400" /> 清掃チェックリスト
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">{doneCount} / {totalCount} 完了</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={resetChecklist} className="text-xs text-zinc-600 hover:text-zinc-400 flex items-center gap-1 transition-all">
              <RefreshCw size={11} /> リセット
            </button>
            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${progress === 100 ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' : progress > 50 ? 'text-amber-400 border-amber-500/30 bg-amber-500/10' : 'text-zinc-400 border-zinc-600 bg-zinc-800'}`}>
              {progress}%
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-4">
          <div className="h-full bg-teal-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>

        {/* Tasks grouped by area */}
        <div className="space-y-4">
          {Object.entries(groupedChecklist).map(([area, tasks]) => (
            <div key={area}>
              <p className="text-xs text-zinc-500 mb-2 flex items-center gap-1.5">
                <span>{AREA_EMOJIS[area]}</span>
                {AREA_LABELS[area]}
                <span className="text-zinc-700">({tasks.filter(t => t.done).length}/{tasks.length})</span>
              </p>
              <div className="space-y-1">
                {tasks.map(task => (
                  <button key={task.id} onClick={() => toggleTask(task.id, task.done)}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all ${task.done ? 'opacity-50' : 'hover:bg-zinc-800'}`}>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${task.done ? 'border-teal-500 bg-teal-500' : 'border-zinc-600'}`}>
                      {task.done && <span className="text-zinc-950 text-xs">✓</span>}
                    </div>
                    <span className={`text-sm ${task.done ? 'line-through text-zinc-600' : 'text-zinc-300'}`}>{task.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Maintenance */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-zinc-200 flex items-center gap-2">
            <Wrench size={15} className="text-amber-400" /> メンテナンス
            {openMaint.length > 0 && (
              <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-full">{openMaint.length}件</span>
            )}
          </h2>
          <button onClick={() => setShowAddMaint(!showAddMaint)} className="flex items-center gap-1 text-xs text-zinc-500 hover:text-teal-400 transition-colors">
            <Plus size={13} /> 追加
          </button>
        </div>

        {showAddMaint && (
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 mb-4 space-y-3">
            <input value={maintDesc} onChange={e => setMaintDesc(e.target.value)} placeholder="不具合・修理内容を入力..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-teal-500/40 transition-all" />
            <div className="flex gap-2">
              <select value={maintArea} onChange={e => setMaintArea(e.target.value)}
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none">
                {Object.entries(AREA_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <select value={maintPriority} onChange={e => setMaintPriority(e.target.value as any)}
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none">
                <option value="low">低</option>
                <option value="medium">中</option>
                <option value="urgent">急ぎ</option>
              </select>
            </div>
            <button onClick={addMaint} disabled={!maintDesc.trim()}
              className="w-full bg-teal-600 hover:bg-teal-500 text-white rounded-xl py-2 text-sm font-medium transition-all disabled:opacity-50">
              追加する
            </button>
          </div>
        )}

        {openMaint.length === 0 ? (
          <p className="text-zinc-600 text-sm text-center py-4">未対応の案件はありません ✓</p>
        ) : (
          <div className="space-y-2">
            {openMaint.map(item => (
              <div key={item.id} className={`flex items-start gap-3 p-3 rounded-xl border ${item.priority === 'urgent' ? 'border-red-500/30 bg-red-500/5' : item.priority === 'medium' ? 'border-amber-500/20 bg-amber-500/5' : 'border-zinc-800'}`}>
                {item.priority === 'urgent' && <AlertTriangle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-200">{item.description}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{AREA_LABELS[item.area] ?? item.area} · {item.reportedBy}</p>
                </div>
                <button onClick={() => resolveMaint(item.id)}
                  className="flex-shrink-0 text-xs px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg hover:bg-emerald-500/20 transition-all">
                  完了
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/manager/calendar" className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 hover:border-zinc-700 transition-all flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-200 flex items-center gap-2"><Calendar size={14} className="text-teal-400" /> カレンダー</p>
            <p className="text-xs text-zinc-500 mt-0.5">{store.bookingHistory.filter(b => b.status === 'confirmed').length}件予約済</p>
          </div>
          <ChevronRight size={14} className="text-zinc-600" />
        </Link>
        <Link href="/manager/tasks" className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 hover:border-zinc-700 transition-all flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-200 flex items-center gap-2"><CheckSquare size={14} className="text-teal-400" /> 全タスク</p>
            <p className="text-xs text-zinc-500 mt-0.5">メンテ・清掃管理</p>
          </div>
          <ChevronRight size={14} className="text-zinc-600" />
        </Link>
      </div>
    </motion.div>
  )
}
