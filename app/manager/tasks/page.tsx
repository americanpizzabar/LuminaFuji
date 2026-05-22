'use client'

import { motion } from 'framer-motion'
import { useStore } from '@/lib/useStore'
import {
  updateCleaningTask, resetCleaningChecklist, addMaintenanceItem,
  updateMaintenanceItem, getStore
} from '@/lib/store'
import { CheckSquare, Wrench, AlertTriangle, Plus, RefreshCw, Clock } from 'lucide-react'
import { useState } from 'react'

const AREA_LABELS: Record<string, string> = {
  living: 'リビング', bedroom: '寝室', bathroom: 'バスルーム',
  kitchen: 'キッチン', entrance: '玄関', outdoor: '庭・デッキ',
}
const AREA_EMOJIS: Record<string, string> = {
  living: '🛋️', bedroom: '🛏️', bathroom: '🚿', kitchen: '🍳', entrance: '🚪', outdoor: '🌿',
}
const PRIORITY_CONFIG = {
  low: { label: '低', color: 'text-zinc-400 border-zinc-700 bg-zinc-800/50' },
  medium: { label: '中', color: 'text-amber-400 border-amber-500/30 bg-amber-500/5' },
  urgent: { label: '急', color: 'text-red-400 border-red-500/30 bg-red-500/5' },
}
const STATUS_CONFIG = {
  open: { label: '未着手', color: 'text-zinc-400' },
  scheduled: { label: '予定', color: 'text-blue-400' },
  done: { label: '完了', color: 'text-emerald-400' },
}

export default function ManagerTasksPage() {
  const [store, update] = useStore()
  const [tab, setTab] = useState<'cleaning' | 'maintenance'>('cleaning')
  const [showAdd, setShowAdd] = useState(false)
  const [desc, setDesc] = useState('')
  const [area, setArea] = useState('living')
  const [priority, setPriority] = useState<'low' | 'medium' | 'urgent'>('medium')
  const [showDone, setShowDone] = useState(false)

  const checklist = store.cleaningChecklist
  const doneCount = checklist.filter(t => t.done).length
  const totalCount = checklist.length
  const progress = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0

  const allMaint = store.maintenanceItems
  const openMaint = allMaint.filter(m => m.status !== 'done')
  const doneMaint = allMaint.filter(m => m.status === 'done')

  const toggleTask = (id: string, done: boolean) => {
    updateCleaningTask(id, !done)
    update({ cleaningChecklist: getStore().cleaningChecklist })
  }

  const resetChecklist = () => {
    resetCleaningChecklist()
    update({ cleaningChecklist: getStore().cleaningChecklist })
  }

  const addMaint = () => {
    if (!desc.trim()) return
    addMaintenanceItem({ description: desc, area, priority, reportedBy: 'manager' })
    update({ maintenanceItems: getStore().maintenanceItems })
    setDesc('')
    setShowAdd(false)
  }

  const changeMaintStatus = (id: string, status: 'open' | 'scheduled' | 'done') => {
    updateMaintenanceItem(id, { status, ...(status === 'done' ? { doneAt: new Date().toISOString() } : {}) })
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
        <h1 className="text-xl font-medium text-zinc-100">タスク管理</h1>
        <p className="text-sm text-zinc-500 mt-0.5">清掃・メンテナンス全管理</p>
      </div>

      {/* Tab switcher */}
      <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl p-1 gap-1">
        {(['cleaning', 'maintenance'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${tab === t ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}>
            {t === 'cleaning' ? `🧹 清掃チェックリスト` : `🔧 メンテナンス`}
            {t === 'cleaning' && doneCount < totalCount && (
              <span className="ml-1.5 text-amber-400">{totalCount - doneCount}件</span>
            )}
            {t === 'maintenance' && openMaint.length > 0 && (
              <span className="ml-1.5 text-amber-400">{openMaint.length}件</span>
            )}
          </button>
        ))}
      </div>

      {tab === 'cleaning' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-zinc-200 font-medium">{doneCount} / {totalCount} 完了</p>
              <p className="text-xs text-zinc-500">清掃チェックリスト</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={resetChecklist} className="flex items-center gap-1 text-xs text-zinc-600 hover:text-zinc-400 transition-all">
                <RefreshCw size={11} /> リセット
              </button>
              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${progress === 100 ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' : progress > 50 ? 'text-amber-400 border-amber-500/30 bg-amber-500/10' : 'text-zinc-400 border-zinc-700 bg-zinc-800'}`}>
                {progress}%
              </span>
            </div>
          </div>
          <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden mb-5">
            <div className="h-full bg-teal-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>

          <div className="space-y-5">
            {Object.entries(groupedChecklist).map(([areaKey, tasks]) => (
              <div key={areaKey}>
                <p className="text-xs text-zinc-500 mb-2 flex items-center gap-1.5">
                  {AREA_EMOJIS[areaKey]} {AREA_LABELS[areaKey]}
                  <span className="text-zinc-700 ml-0.5">({tasks.filter(t => t.done).length}/{tasks.length})</span>
                </p>
                <div className="space-y-1">
                  {tasks.map(task => (
                    <button key={task.id} onClick={() => toggleTask(task.id, task.done)}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all ${task.done ? 'opacity-40' : 'hover:bg-zinc-800'}`}>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${task.done ? 'border-teal-500 bg-teal-500' : 'border-zinc-600'}`}>
                        {task.done && <span className="text-zinc-950 text-[10px] font-bold">✓</span>}
                      </div>
                      <span className={`text-sm ${task.done ? 'line-through text-zinc-600' : 'text-zinc-300'}`}>{task.label}</span>
                      {task.doneAt && (
                        <span className="ml-auto text-[10px] text-zinc-700 flex items-center gap-0.5">
                          <Clock size={9} />
                          {new Date(task.doneAt).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'maintenance' && (
        <div className="space-y-4">
          {/* Add form */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-zinc-200 flex items-center gap-2">
                <Wrench size={14} className="text-amber-400" /> メンテナンス案件
              </h2>
              <button onClick={() => setShowAdd(!showAdd)}
                className="flex items-center gap-1 text-xs text-zinc-500 hover:text-teal-400 transition-colors">
                <Plus size={13} /> 追加
              </button>
            </div>

            {showAdd && (
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 mb-4 space-y-3">
                <input value={desc} onChange={e => setDesc(e.target.value)}
                  placeholder="不具合・修理内容を入力..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-teal-500/40 transition-all" />
                <div className="flex gap-2">
                  <select value={area} onChange={e => setArea(e.target.value)}
                    className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none">
                    {Object.entries(AREA_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                  <select value={priority} onChange={e => setPriority(e.target.value as 'low' | 'medium' | 'urgent')}
                    className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none">
                    <option value="low">低</option>
                    <option value="medium">中</option>
                    <option value="urgent">急ぎ</option>
                  </select>
                </div>
                <button onClick={addMaint} disabled={!desc.trim()}
                  className="w-full bg-teal-600 hover:bg-teal-500 text-white rounded-xl py-2 text-sm font-medium transition-all disabled:opacity-50">
                  追加する
                </button>
              </div>
            )}

            {openMaint.length === 0 ? (
              <p className="text-zinc-600 text-sm text-center py-4">未対応の案件はありません ✓</p>
            ) : (
              <div className="space-y-2">
                {openMaint.map(item => {
                  const pcfg = PRIORITY_CONFIG[item.priority]
                  return (
                    <div key={item.id} className={`p-3 rounded-xl border ${pcfg.color} space-y-2`}>
                      <div className="flex items-start gap-2">
                        {item.priority === 'urgent' && <AlertTriangle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-zinc-200">{item.description}</p>
                          <p className="text-xs text-zinc-500 mt-0.5">
                            {AREA_LABELS[item.area] ?? item.area} · {item.reportedBy} ·
                            {new Date(item.reportedAt).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border ${pcfg.color}`}>{pcfg.label}優先</span>
                      </div>
                      <div className="flex gap-1.5">
                        {(['open', 'scheduled', 'done'] as const).map(s => (
                          <button key={s} onClick={() => changeMaintStatus(item.id, s)}
                            className={`flex-1 text-[10px] py-1 rounded-lg border transition-all ${item.status === s ? 'bg-zinc-700 border-zinc-500 text-zinc-200' : 'border-zinc-700 text-zinc-600 hover:text-zinc-400'}`}>
                            {STATUS_CONFIG[s].label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Done items */}
          {doneMaint.length > 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <button onClick={() => setShowDone(!showDone)}
                className="w-full flex items-center justify-between text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
                <span>完了済み ({doneMaint.length}件)</span>
                <span>{showDone ? '▲' : '▼'}</span>
              </button>
              {showDone && (
                <div className="mt-3 space-y-2">
                  {doneMaint.map(item => (
                    <div key={item.id} className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-800/30 opacity-60">
                      <span className="text-emerald-400 text-xs">✓</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-zinc-400 line-through truncate">{item.description}</p>
                        <p className="text-[10px] text-zinc-600">{AREA_LABELS[item.area] ?? item.area}</p>
                      </div>
                      {item.doneAt && (
                        <span className="text-[10px] text-zinc-700">
                          {new Date(item.doneAt).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}
