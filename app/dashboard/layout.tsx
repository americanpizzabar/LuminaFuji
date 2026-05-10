import { PhaseProvider } from '@/lib/phase'
import Navigation from '@/components/Navigation'
import PhaseSelector from '@/components/PhaseSelector'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <PhaseProvider>
      <div className="dark min-h-screen bg-zinc-950">
        <PhaseSelector />
        <main>{children}</main>
        <Navigation />
      </div>
    </PhaseProvider>
  )
}
