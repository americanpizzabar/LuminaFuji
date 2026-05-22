'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Calendar, CheckSquare, BarChart2, LogOut, Wrench, Bell } from 'lucide-react'
import { PhaseProvider } from '@/lib/phase'
import { useStore } from '@/lib/useStore'

const navItems = [
  { href: '/manager/dashboard', label: '今日', icon: LayoutDashboard },
  { href: '/manager/calendar', label: 'カレンダー', icon: Calendar },
  { href: '/manager/tasks', label: 'タスク', icon: CheckSquare },
  { href: '/manager/reports', label: 'レポート', icon: BarChart2 },
]

function ManagerLayoutInner({ children, pathname }: { children: React.ReactNode; pathname: string }) {
  const router = useRouter()
  const [store] = useStore()
  const openMaintenance = store.maintenanceItems.filter(m => m.status === 'open').length
  const pendingClean = store.cleaningChecklist.filter(t => !t.done).length

  const logout = () => {
    localStorage.removeItem('lf_manager_auth')
    router.push('/manager')
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="border-b border-zinc-800 bg-zinc-900/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center">
              <Wrench size={14} className="text-teal-400" />
            </div>
            <span className="text-sm font-medium text-zinc-200">Lumina Fuji</span>
            <span className="text-xs text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-full border border-teal-500/20">管理会社</span>
            {(openMaintenance + pendingClean) > 0 && (
              <span className="w-5 h-5 bg-amber-500 rounded-full text-[10px] text-zinc-950 flex items-center justify-center font-medium ml-1">
                {openMaintenance + pendingClean}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Link href="/owner" className="text-xs text-zinc-500 hover:text-zinc-300 px-3 py-1.5 rounded-lg hover:bg-zinc-800 transition-all">
              オーナー →
            </Link>
            <button onClick={logout} className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-zinc-800">
              <LogOut size={13} /> ログアウト
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6 pb-24">{children}</div>

      <nav className="fixed bottom-0 left-0 right-0 bg-zinc-900/95 backdrop-blur-xl border-t border-zinc-800 pb-safe z-30">
        <div className="max-w-5xl mx-auto px-4 pt-2 pb-3 flex items-center justify-around">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href
            return (
              <Link key={href} href={href}
                className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all ${isActive ? 'text-teal-400' : 'text-zinc-500 hover:text-zinc-300'}`}>
                <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
                <span className="text-[10px]">{label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (pathname === '/manager') { setChecked(true); return }
    if (localStorage.getItem('lf_manager_auth') !== 'true') {
      router.replace('/manager')
    } else {
      setChecked(true)
    }
  }, [pathname, router])

  if (!checked) return null
  if (pathname === '/manager') return <PhaseProvider>{children}</PhaseProvider>

  return (
    <PhaseProvider>
      <ManagerLayoutInner pathname={pathname}>{children}</ManagerLayoutInner>
    </PhaseProvider>
  )
}
