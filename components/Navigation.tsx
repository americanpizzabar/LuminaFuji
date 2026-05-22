'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Lightbulb, Map, MessageCircle, MoreHorizontal, BookOpen, ShoppingBag, Bell, Camera, Phone } from 'lucide-react'
import { usePhase } from '@/lib/phase'
import { useStore } from '@/lib/useStore'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface NavItem {
  href: string
  label: string
  labelEn: string
  icon: React.ComponentType<{ size?: number | string; strokeWidth?: number | string; className?: string }>
  badge?: number
}

function useNavItems() {
  const { phase } = usePhase()
  const [store] = useStore()
  const pendingRequests = store.serviceRequests.filter(r => r.status === 'pending').length
  const unreadMessages = store.messages.filter(m => m.from === 'owner' && !m.readByGuest).length

  const staying: NavItem[] = [
    { href: '/dashboard', label: 'ホーム', labelEn: 'Home', icon: Home },
    { href: '/dashboard/lighting', label: '照明', labelEn: 'Lights', icon: Lightbulb },
    { href: '/dashboard/requests', label: 'リクエスト', labelEn: 'Request', icon: Bell, badge: pendingRequests || undefined },
    { href: '/dashboard/map', label: '周辺', labelEn: 'Explore', icon: Map },
    { href: '/dashboard/chat', label: 'チャット', labelEn: 'Chat', icon: MessageCircle, badge: unreadMessages || undefined },
  ]

  const booked: NavItem[] = [
    { href: '/dashboard', label: 'ホーム', labelEn: 'Home', icon: Home },
    { href: '/dashboard/guide', label: 'ガイド', labelEn: 'Guide', icon: BookOpen },
    { href: '/dashboard/map', label: 'マップ', labelEn: 'Map', icon: Map },
    { href: '/dashboard/products', label: '製品', labelEn: 'Products', icon: ShoppingBag },
    { href: '/dashboard/chat', label: 'チャット', labelEn: 'Chat', icon: MessageCircle },
  ]

  const post: NavItem[] = [
    { href: '/dashboard', label: 'ホーム', labelEn: 'Home', icon: Home },
    { href: '/dashboard/guestbook', label: '寄せ書き', labelEn: 'Book', icon: Camera },
    { href: '/dashboard/products', label: '製品', labelEn: 'Products', icon: ShoppingBag },
    { href: '/dashboard/consult', label: '相談', labelEn: 'Consult', icon: Phone },
    { href: '/dashboard/chat', label: 'チャット', labelEn: 'Chat', icon: MessageCircle },
  ]

  return phase === 'staying' ? staying : phase === 'booked' ? booked : post
}

export default function Navigation() {
  const pathname = usePathname()
  const navItems = useNavItems()
  const [showMore, setShowMore] = useState(false)
  const { phase } = usePhase()

  // Extra items accessible from "more" during staying phase
  const moreItems: NavItem[] = [
    { href: '/dashboard/guide', label: '施設ガイド', labelEn: 'Guide', icon: BookOpen },
    { href: '/dashboard/guestbook', label: '寄せ書き', labelEn: 'Guestbook', icon: Camera },
    { href: '/dashboard/products', label: 'ECUANEST製品', labelEn: 'Products', icon: ShoppingBag },
    { href: '/dashboard/consult', label: '照明相談', labelEn: 'Consult', icon: Phone },
  ]

  return (
    <>
      {/* More drawer */}
      <AnimatePresence>
        {showMore && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-zinc-950/60 backdrop-blur-sm"
              onClick={() => setShowMore(false)}
            />
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed bottom-20 left-4 right-4 max-w-[430px] mx-auto z-50 bg-zinc-900 border border-zinc-700 rounded-2xl p-3 grid grid-cols-2 gap-2"
            >
              {moreItems.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setShowMore(false)}
                  className="flex items-center gap-2.5 p-3 rounded-xl hover:bg-zinc-800 transition-all"
                >
                  <Icon size={18} className="text-gold-400 flex-shrink-0" />
                  <span className="text-sm text-zinc-300">{label}</span>
                </Link>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <nav className="fixed bottom-0 left-0 right-0 z-30 pb-safe">
        <div className="max-w-[430px] mx-auto">
          <div className="bg-zinc-900/95 backdrop-blur-xl border-t border-zinc-800 px-1 pt-2 pb-3">
            <div className="flex items-center justify-around">
              {navItems.map(({ href, label, icon: Icon, badge }) => {
                const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 min-w-[52px] ${
                      isActive ? 'text-gold-400' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <div className="relative">
                      <Icon
                        size={22}
                        strokeWidth={isActive ? 2 : 1.5}
                        className={isActive ? 'drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]' : ''}
                      />
                      {badge ? (
                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-medium">
                          {badge > 9 ? '9+' : badge}
                        </span>
                      ) : null}
                      {isActive && (
                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-gold-400 rounded-full" />
                      )}
                    </div>
                    <span className={`text-[9px] leading-none font-medium ${isActive ? 'text-gold-400' : 'text-zinc-600'}`}>
                      {label}
                    </span>
                  </Link>
                )
              })}

              {/* More button (staying phase only) */}
              {phase === 'staying' && (
                <button
                  onClick={() => setShowMore(!showMore)}
                  className={`relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all min-w-[52px] ${
                    showMore ? 'text-gold-400' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <MoreHorizontal size={22} strokeWidth={1.5} />
                  <span className="text-[9px] leading-none font-medium text-zinc-600">もっと</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}
