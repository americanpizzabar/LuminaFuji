'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useStore } from '@/lib/useStore'
import {
  updateCleaningTask, resetCleaningChecklist, addMaintenanceItem,
  updateMaintenanceItem, getStore, respondToServiceRequest,
  completeServiceRequest, timeElapsed,
} from '@/lib/store'
import {
  CheckSquare, Calendar, Wrench, AlertTriangle, ChevronRight,
  Plus, RefreshCw, Bell, Users, Clock, Check,
} from 'lucide-react'
import { useState } from 'react'
import PhaseBadge from '@/components/PhaseBadge'

// ─── Constants ────────────────────────────────────────────────────────────────

const AREA_LABELS: Record<string, string> = {
  living: 'リビング', bedroom: '寝室', bathroom: 'バスルーム',
  kitchen: 'キッチン', entrance: '玄関', outdoor: '庭・デッキ',
}
const AREA_EMOJIS: Record<string, string> = {
  living: '🛋️', bedroom: '🛏️', bathroom: '🚿', kitchen: '🍳', entrance: '🚪', outdoor: '🌿',
}

const SERVICE_EMOJIS: Record<string, string> = {
  towels: '🛁', amenities: '🧴', temperature: '🌡️', maintenance: '🔧', taxi: '🚕', other: '📋',
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ManagerDashboardPage() {
  const [store, update] = useStore()
  const [showAddMaint, setShowAddMaint] = useState(false)
  const [maintDesc, setMaintDesc] = useState('')
  const [maintArea, setMaintArea] = useState('living')
  const [maintPriority, setMaintPriority] = useState<'low' | 'medium' | 'urgent'>('medium')

  const today = new Date().toLocaleDateString('ja-JP', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
  })

  const checklist = store.cleaningChecklist
  const doneCount = checklist.filter(t => t.done).length
  const totalCount = checklist.length
  const progress = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0

  const openMaint = store.maintenanceItems.filter(m => m.status !== 'done')
  const currentBooking = store.bookingHistory.find(b => b.status === 'staying')
  const nextBooking = store.bookingHistory.find(b => b.status === 'confirmed')

  // Service requests (pending or inProgress)
  const activeRequests = store.serviceRequests.filter(
    r => r.status === 'pending' || r.status === 'inProgress'
  )
  const pendingCount = activeRequests.filter(r => r.status === 'pending').length

  // Handlers
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

  const handleRespond = (id: string) => {
    respondToServiceRequest(id)
    update({ serviceRequests: getStore().serviceRequests })
  }

  const handleComplete = (id: string) => {
    completeServiceRequest(id)
    update({ serviceRequests: getStore().serviceRequests })
  }

  const groupedChecklist = checklist.reduce<Record<string, typeof checklist>>((acc, task) => {
    if (!acc[task.area]) acc[task.area] = []
    acc[task.area].push(task)
    return acc
  }, {})

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-medium text-zinc-100 flex items-center gap-2">
            今日のタスク
            {pendingCount > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 bg-amber-500 rounded-full text-[10px] text-zinc-950 font-bold">
                {pendingCount}
              </span>
            )}
          </h1>
          <p className="text-sm text-zinc-500 mt-0.5">{today}</p>
        </div>
      </div>

      {/* ─── Service Request Notifications (most prominent) ─────────────────── */}
      <div className={`bg-zinc-900 border rounded-2xl p-5 ${activeRequests.length > 0 ? 'border-amber-500/30' : 'border-zinc-800'}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-zinc-200 flex items-center gap-2">
            <Bell size={14} className={activeRequests.length > 0 ? 'text-amber-400' : 'text-zinc-500'} />
            ゲストリクエスト
            {activeRequests.length > 0 && (
              <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-full font-medium">
                {activeRequests.length}件
              </span>
            )}
          </h2>
        </div>

        {activeRequests.length === 0 ? (
          <div className="flex items-center gap-2 text-emerald-400 text-sm py-2">
            <Check size={15} />
            <span>リクエストなし — 現在のリクエストはありません</span>
          </div>
        ) : (
          <div className="space-y-3">
            {activeRequests.map(req => {
              const isPending = req.status === 'pending'
              const isInProgress = req.status === 'inProgress'
              return (
                <motion.div
                  key={req.id}
                  layout
                  className={`rounded-xl border p-4 ${isPending
                    ? 'border-amber-500/30 bg-amber-500/5'
                    : 'border-blue-500/20 bg-blue-500/5'}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">{SERVICE_EMOJIS[req.type] ?? '📋'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="text-sm font-medium text-zinc-100">{req.label}</p>
                        {req.priority === 'urgent' && (
                          <span className="flex items-center gap-0.5 text-[10px] text-red-400 bg-red-500/10 border border-red-500/30 px-1.5 py-0.5 rounded-full">
                            <AlertTriangle size={9} /> 急ぎ
                          </span>
                        )}
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${isPending
                          ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
                          : 'text-blue-400 border-blue-500/30 bg-blue-500/10'}`}>
                          {isPending ? '対応待ち' : '対応中'}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mb-1">{req.description || '詳細なし'}</p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] text-zinc-600">
                        <span className="flex items-center gap-0.5">
                          <Users size={9} /> {req.guestName || 'ゲスト'}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <Clock size={9} /> {timeElapsed(req.createdAt)}
                        </span>
                        {isInProgress && req.respondedAt && (
                          <span className="text-blue-500">対応開始: {timeElapsed(req.respondedAt)}</span>
                        )}
                      </div>

                      {/* In-progress indicator */}
                      {isInProgress && (
                        <div className="mt-2 w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-400 rounded-full animate-pulse" style={{ width: '60%' }} />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 mt-3">
                    {isPending && (
                      <button
                        onClick={() => handleRespond(req.id)}
                        className="flex-1 text-xs py-1.5 rounded-lg border border-blue-500/30 text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 transition-all font-medium"
                      >
                        対応中にする
                      </button>
                    )}
                    <button
                      onClick={() => handleComplete(req.id)}
                      className="flex-1 text-xs py-1.5 rounded-lg border border-emerald-500/30 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 transition-all font-medium flex items-center justify-center gap-1"
                    >
                      <Check size={11} /> 完了
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* ─── Current / Next Guest ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className={`bg-zinc-900 border rounded-2xl p-4 ${currentBooking ? 'border-emerald-500/30' : 'border-zinc-800'}`}>
          <p className="text-xs text-zinc-500 mb-2 flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${currentBooking ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'}`} />
            現在のゲスト
          </p>
          {currentBooking ? (
            <div>
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="text-sm font-medium text-zinc-100">{currentBooking.flag} {currentBooking.guestName}</p>
                <PhaseBadge checkIn={currentBooking.checkIn} checkOut={currentBooking.checkOut} settings={store.facilitySettings} />
              </div>
              <p className="text-xs text-zinc-500">チェックアウト: {currentBooking.checkOut} {store.facilitySettings.checkOutTime}</p>
              <p className="text-xs text-zinc-600 mt-0.5">{currentBooking.platform} · {currentBooking.adults}名</p>
            </div>
          ) : (
            <p className="text-sm text-zinc-500">現在空室</p>
          )}
        </div>
        <div className={`bg-zinc-900 border rounded-2xl p-4 ${nextBooking ? 'border-blue-500/20' : 'border-zinc-800'}`}>
          <p className="text-xs text-zinc-500 mb-2">次のゲスト</p>
          {nextBooking ? (
            <div>
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="text-sm font-medium text-zinc-100">{nextBooking.flag} {nextBooking.guestName}</p>
                <PhaseBadge checkIn={nextBooking.checkIn} checkOut={nextBooking.checkOut} settings={store.facilitySettings} />
              </div>
              <p className="text-xs text-zinc-500">チェックイン: {nextBooking.checkIn} {store.facilitySettings.checkInTime}</p>
              <p className="text-xs text-zinc-600 mt-0.5">{nextBooking.platform} · {nextBooking.adults}名</p>
            </div>
          ) : (
            <p className="text-sm text-zinc-500">予約なし</p>
          )}
        </div>
      </div>

      {/* ─── Cleaning Checklist ──────────────────────────────────────────────── */}
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
            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${progress === 100
              ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
              : progress > 50
                ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
                : 'text-zinc-400 border-zinc-600 bg-zinc-800'}`}>
              {progress}%
            </span>
          </div>
        </div>

        <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-4">
          <div className="h-full bg-teal-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>

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

      {/* ─── Maintenance ─────────────────────────────────────────────────────── */}
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
            <input value={maintDesc} onChange={e => setMaintDesc(e.target.value)}
              placeholder="不具合・修理内容を入力..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-teal-500/40 transition-all" />
            <div className="flex gap-2">
              <select value={maintArea} onChange={e => setMaintArea(e.target.value)}
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none">
                {Object.entries(AREA_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <select value={maintPriority} onChange={e => setMaintPriority(e.target.value as 'low' | 'medium' | 'urgent')}
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

      {/* ─── Quick Links ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/manager/guests"
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 hover:border-zinc-700 transition-all flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-200 flex items-center gap-2">
              <Users size={14} className="text-teal-400" /> ゲスト
            </p>
            <p className="text-xs text-zinc-500 mt-0.5">{store.bookingHistory.length}件の予約</p>
          </div>
          <ChevronRight size={14} className="text-zinc-600" />
        </Link>
        <Link href="/manager/tasks"
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 hover:border-zinc-700 transition-all flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-200 flex items-center gap-2">
              <CheckSquare size={14} className="text-teal-400" /> タスク
            </p>
            <p className="text-xs text-zinc-500 mt-0.5">メンテ・清掃管理</p>
          </div>
          <ChevronRight size={14} className="text-zinc-600" />
        </Link>
        <Link href="/manager/requests"
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 hover:border-zinc-700 transition-all flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-200 flex items-center gap-2">
              <Bell size={14} className="text-amber-400" /> リクエスト履歴
            </p>
            <p className="text-xs text-zinc-500 mt-0.5">{store.serviceRequests.length}件</p>
          </div>
          <ChevronRight size={14} className="text-zinc-600" />
        </Link>
        <Link href="/manager/calendar"
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 hover:border-zinc-700 transition-all flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-200 flex items-center gap-2">
              <Calendar size={14} className="text-teal-400" /> カレンダー
            </p>
            <p className="text-xs text-zinc-500 mt-0.5">月別予約状況</p>
          </div>
          <ChevronRight size={14} className="text-zinc-600" />
        </Link>
      </div>
    </motion.div>
  )
}
