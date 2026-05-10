'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, MessageSquare, BookOpen, Settings, LogOut, Shield } from 'lucide-react'
import { PhaseProvider } from '@/lib/phase'

const navItems = [
  { href: '/owner/dashboard', label: '概要', icon: LayoutDashboard },
  { href: '/owner/consults', label: '相談', icon: MessageSquare },
  { href: '/owner/guestbook', label: '寄せ書き', icon: BookOpen },
  { href: '/owner/settings', label: '設定', icon: Settings },
]

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (pathname === '/owner') { setChecked(true); return }
    const auth = localStorage.getItem('lf_owner_auth')
    if (auth !== 'true') {
      router.replace('/owner')
    } else {
      setChecked(true)
    }
  }, [pathname, router])

  const logout = () => {
    localStorage.removeItem('lf_owner_auth')
    router.push('/owner')
  }

  if (!checked) return null

  if (pathname === '/owner') return <PhaseProvider>{children}</PhaseProvider>

  return (
    <PhaseProvider>
    <div className="min-h-screen bg-zinc-950">
      {/* Top bar */}
      <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
              <Shield size={14} className="text-blue-400" />
            </div>
            <span className="text-sm font-medium text-zinc-200">Lumina Fuji</span>
            <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
              管理者
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              target="_blank"
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-zinc-800"
            >
              ゲスト画面 →
            </Link>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-zinc-800"
            >
              <LogOut size={13} />
              ログアウト
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 pb-24">
        {children}
      </div>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-zinc-900/95 backdrop-blur-xl border-t border-zinc-800 pb-safe">
        <div className="max-w-4xl mx-auto px-4 pt-2 pb-3 flex items-center justify-around">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all ${
                  isActive ? 'text-blue-400' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
                <span className="text-[10px]">{label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
    </PhaseProvider>
  )
}
