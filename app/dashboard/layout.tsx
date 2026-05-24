'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PhaseProvider } from '@/lib/phase'
import { LanguageProvider } from '@/lib/useLanguage'
import Navigation from '@/components/Navigation'
import PhaseSelector from '@/components/PhaseSelector'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import Link from 'next/link'
import { BookOpen, LogOut } from 'lucide-react'
import { getStore, clearGuestInfo } from '@/lib/store'

function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    if (!getStore().guestInfo) {
      router.replace('/login')
    }
  }, [router])

  return <>{children}</>
}

function LogoutButton() {
  const router = useRouter()

  const handleLogout = () => {
    clearGuestInfo()
    router.replace('/login')
  }

  return (
    <button
      onClick={handleLogout}
      className="w-9 h-9 rounded-xl bg-zinc-800/80 backdrop-blur border border-zinc-700/50 flex items-center justify-center hover:bg-zinc-700 transition-all"
      title="ログアウト"
    >
      <LogOut size={15} className="text-zinc-400" />
    </button>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <PhaseProvider>
      <LanguageProvider>
        <AuthGuard>
          <div className="dark min-h-screen bg-zinc-950">
            <PhaseSelector />
            {/* Fixed top-right controls */}
            <div className="fixed top-3 right-4 z-50 flex items-center gap-2">
              <Link href="/manual"
                className="w-9 h-9 rounded-xl bg-zinc-800/80 backdrop-blur border border-zinc-700/50 flex items-center justify-center hover:bg-zinc-700 transition-all"
                title="マニュアル"
              >
                <BookOpen size={15} className="text-zinc-400" />
              </Link>
              <LanguageSwitcher />
              <LogoutButton />
            </div>
            <main>{children}</main>
            <Navigation />
          </div>
        </AuthGuard>
      </LanguageProvider>
    </PhaseProvider>
  )
}
