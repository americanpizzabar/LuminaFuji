'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard, MessageSquare, BookOpen, BarChart2,
  Settings, LogOut, Shield, Users, Bell
} from 'lucide-react'
import { PhaseProvider } from '@/lib/phase'
import { useStore } from '@/lib/useStore'
import { getUnreadCounts } from '@/lib/store'

const OWNER_PIN = process.env.NEXT_PUBLIC_OWNER_PIN ?? '1234'

const navItems = [
  { href: '/owner/dashboard', label: '概要', icon: LayoutDashboard },
  { href: '/owner/guests', label: 'ゲスト', icon: Users },
  { href: '/owner/consults', label: 'リード', icon: MessageSquare },
  { href: '/owner/analytics', label: '分析', icon: BarChart2 },
  { href: '/owner/settings', label: '設定', icon: Settings },
]

function OwnerLayoutInner({ children, pathname }: { children: React.ReactNode, pathname: string }) {
  const [store] = useStore()
  const counts = getUnreadCounts(store)
  const router = useRouter()

  const logout = () => {
    localStorage.removeItem('lf_owner_auth')
    router.push('/owner')
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="border-b border-zinc-800 bg-zinc-900/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
              <Shield size={14} className="text-blue-400" />
            </div>
            <span className="text-sm font-medium text-zinc-200">Lumina Fuji</span>
            <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">OWNER</span>
            {counts.total > 0 && (
              <span className="w-5 h-5 bg-red-500 rounded-full text-[11px] text-white flex items-center justify-center font-medium ml-1">
                {counts.total > 9 ? '9+' : counts.total}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Link href="/manual"
              className="text-xs text-zinc-300 hover:text-zinc-300 px-3 py-1.5 rounded-lg hover:bg-zinc-800 transition-all">
              マニュアル
            </Link>
            <Link href="/dashboard" target="_blank"
              className="text-xs text-zinc-300 hover:text-zinc-300 px-3 py-1.5 rounded-lg hover:bg-zinc-800 transition-all">
              ゲスト画面 →
            </Link>
            <Link href="/manager" target="_blank"
              className="text-xs text-zinc-300 hover:text-teal-400 px-3 py-1.5 rounded-lg hover:bg-zinc-800 transition-all">
              管理会社 →
            </Link>
            <button onClick={logout}
              className="flex items-center gap-1.5 text-xs text-zinc-300 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-zinc-800">
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
            const badge =
              href === '/owner/consults' ? counts.newConsults :
              href === '/owner/guests' ? counts.pendingRequests :
              undefined
            return (
              <Link key={href} href={href}
                className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all relative ${isActive ? 'text-blue-400' : 'text-zinc-300 hover:text-zinc-300'}`}>
                <div className="relative">
                  <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
                  {badge ? (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full text-[11px] text-white flex items-center justify-center">
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

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (pathname === '/owner') { setChecked(true); return }
    if (localStorage.getItem('lf_owner_auth') !== 'true') {
      router.replace('/owner')
    } else {
      setChecked(true)
    }
  }, [pathname, router])

  if (!checked) return null
  if (pathname === '/owner') return <PhaseProvider>{children}</PhaseProvider>

  return (
    <PhaseProvider>
      <OwnerLayoutInner pathname={pathname}>{children}</OwnerLayoutInner>
    </PhaseProvider>
  )
}
