'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PhaseProvider } from '@/lib/phase'
import { LanguageProvider } from '@/lib/useLanguage'
import Navigation from '@/components/Navigation'
import PhaseSelector from '@/components/PhaseSelector'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import DynamicBackground from '@/components/DynamicBackground'
import CinematicFrame from '@/components/CinematicFrame'
import WelcomeRitual from '@/components/WelcomeRitual'
import ArrivalCheck from '@/components/ArrivalCheck'
import SilentConcierge from '@/components/SilentConcierge'
import Link from 'next/link'
import { BookOpen, LogOut } from 'lucide-react'
import { getStore, clearGuestInfo } from '@/lib/store'

/** 旧 DEFAULT_GUEST_INFO (Yamada Taro / guest@example.com) のシードデータか判定 */
function isStaleSeedGuest(info: { email?: string; name?: string } | null | undefined): boolean {
  return info?.email === 'guest@example.com' && info?.name === 'Yamada Taro'
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    const info = getStore().guestInfo
    // 古いシードデータ (Yamada Taro) を検出してログアウト → 自動的にログイン画面へ
    if (isStaleSeedGuest(info)) {
      clearGuestInfo()
      router.replace('/login')
      return
    }
    if (!info) {
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
      className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:border-zinc-600/80"
      style={{
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
      title="ログアウト"
    >
      <LogOut size={15} className="text-zinc-400" />
    </button>
  )
}

function ArrivalCheckWrapper() {
  const store = getStore()
  const reservationId = store.guestInfo?.reservationId
  if (!reservationId) return null
  return <ArrivalCheck reservationId={reservationId} />
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <PhaseProvider>
      <LanguageProvider>
        <AuthGuard>
          <div className="dark min-h-screen">
            <DynamicBackground />
            <CinematicFrame />
            <WelcomeRitual />
            <ArrivalCheckWrapper />
            <SilentConcierge />
            <PhaseSelector />
            {/* Fixed top-right controls */}
            <div className="fixed top-3 right-4 z-50 flex items-center gap-2">
              <Link
                href="/manual"
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:border-zinc-600/80"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
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
