'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Users, CheckSquare, BarChart2, LogOut, Wrench, Settings } from 'lucide-react'
import { PhaseProvider } from '@/lib/phase'
import { useStore } from '@/lib/useStore'
import { getActionableCounts } from '@/lib/store'

const navItems = [
  { href: '/manager/dashboard', label: '今日', icon: LayoutDashboard },
  { href: '/manager/guests', label: 'ゲスト', icon: Users },
  { href: '/manager/tasks', label: 'タスク', icon: CheckSquare },
  { href: '/manager/reports', label: 'レポート', icon: BarChart2 },
  { href: '/manager/settings', label: '設定', icon: Settings },
]

function ManagerLayoutInner({ children, pathname }: { children: React.ReactNode; pathname: string }) {
  const router = useRouter()
  const [store] = useStore()
  // 委託範囲（ServiceScope）で担当している業務の件数だけをバッジに出す
  const counts = getActionableCounts(store, 'manager')

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
            {counts.total > 0 && (
              <span className="w-5 h-5 bg-amber-500 rounded-full text-[11px] text-zinc-950 flex items-center justify-center font-medium ml-1">
                {counts.total}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Link href="/manual" className="text-xs text-zinc-300 hover:text-zinc-300 px-3 py-1.5 rounded-lg hover:bg-zinc-800 transition-all">
              マニュアル
            </Link>
            <Link href="/owner" className="text-xs text-zinc-300 hover:text-zinc-300 px-3 py-1.5 rounded-lg hover:bg-zinc-800 transition-all">
              オーナー →
            </Link>
            <button onClick={logout} className="flex items-center gap-1.5 text-xs text-zinc-300 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-zinc-800">
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
            const badge = href === '/manager/guests' ? (counts.requests + counts.messages) || undefined : undefined
            return (
              <Link key={href} href={href}
                className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all relative ${isActive ? 'text-teal-400' : 'text-zinc-300 hover:text-zinc-300'}`}>
                <div className="relative">
                  <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
                  {badge ? (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-amber-500 rounded-full text-[11px] text-zinc-950 flex items-center justify-center font-bold">
                      {badge}
                    </span>
                  ) : null}
                </div>
                <span className="text-[11px]">{label}</span>
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
