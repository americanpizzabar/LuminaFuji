'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Lightbulb, BookOpen, Map, ShoppingBag, MessageCircle } from 'lucide-react'
import { usePhase } from '@/lib/phase'

const stayingNav = [
  { href: '/dashboard', label: 'ホーム', icon: Home },
  { href: '/dashboard/lighting', label: '照明', icon: Lightbulb },
  { href: '/dashboard/guide', label: 'ガイド', icon: BookOpen },
  { href: '/dashboard/map', label: 'マップ', icon: Map },
  { href: '/dashboard/chat', label: 'チャット', icon: MessageCircle },
]

const postNav = [
  { href: '/dashboard', label: 'ホーム', icon: Home },
  { href: '/dashboard/products', label: '製品', icon: ShoppingBag },
  { href: '/dashboard/guestbook', label: '寄せ書き', icon: BookOpen },
  { href: '/dashboard/consult', label: '相談', icon: MessageCircle },
  { href: '/dashboard/chat', label: 'チャット', icon: MessageCircle },
]

const bookedNav = [
  { href: '/dashboard', label: 'ホーム', icon: Home },
  { href: '/dashboard/guide', label: 'ガイド', icon: BookOpen },
  { href: '/dashboard/map', label: 'マップ', icon: Map },
  { href: '/dashboard/products', label: '製品', icon: ShoppingBag },
  { href: '/dashboard/chat', label: 'チャット', icon: MessageCircle },
]

export default function Navigation() {
  const pathname = usePathname()
  const { phase } = usePhase()

  const navItems = phase === 'staying' ? stayingNav : phase === 'post' ? postNav : bookedNav

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
      <div className="max-w-[430px] mx-auto">
        <div className="bg-zinc-900/95 backdrop-blur-xl border-t border-zinc-800 px-2 pt-2 pb-3">
          <div className="flex items-center justify-around">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'text-gold-400'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <div className={`relative ${isActive ? 'text-gold-400' : ''}`}>
                    <Icon
                      size={22}
                      strokeWidth={isActive ? 2 : 1.5}
                      className={isActive ? 'drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]' : ''}
                    />
                    {isActive && (
                      <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-gold-400 rounded-full" />
                    )}
                  </div>
                  <span className={`text-[10px] font-medium leading-none ${isActive ? 'text-gold-400' : 'text-zinc-600'}`}>
                    {label}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
