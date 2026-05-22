import { PhaseProvider } from '@/lib/phase'
import { LanguageProvider } from '@/lib/useLanguage'
import Navigation from '@/components/Navigation'
import PhaseSelector from '@/components/PhaseSelector'
import LanguageSwitcher from '@/components/LanguageSwitcher'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <PhaseProvider>
      <LanguageProvider>
        <div className="dark min-h-screen bg-zinc-950">
          <PhaseSelector />
          {/* Language switcher — fixed top-right */}
          <div className="fixed top-3 right-4 z-50">
            <LanguageSwitcher />
          </div>
          <main>{children}</main>
          <Navigation />
        </div>
      </LanguageProvider>
    </PhaseProvider>
  )
}
