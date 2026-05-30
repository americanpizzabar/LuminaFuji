'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Lightbulb, Map, MessageCircle, MoreHorizontal, BookOpen, Bell, Camera } from 'lucide-react'
import { usePhase } from '@/lib/phase'
import { useStore } from '@/lib/useStore'
import { useLanguage } from '@/lib/useLanguage'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ size?: number | string; strokeWidth?: number | string; className?: string }>
  badge?: number
}

function useNavItems() {
  const { phase } = usePhase()
  const [store] = useStore()
  const { t } = useLanguage()
  const pendingRequests = store.serviceRequests.filter(r => r.status === 'pending').length
  const unreadMessages = store.messages.filter(m => m.from === 'owner' && !m.readByGuest).length

  const staying: NavItem[] = [
    { href: '/dashboard', label: t('nav.home'), icon: Home },
    { href: '/dashboard/lighting', label: t('nav.lights'), icon: Lightbulb },
    { href: '/dashboard/requests', label: t('nav.request'), icon: Bell, badge: pendingRequests || undefined },
    { href: '/dashboard/map', label: t('nav.explore'), icon: Map },
    { href: '/dashboard/chat', label: t('nav.chat'), icon: MessageCircle, badge: unreadMessages || undefined },
  ]

  const booked: NavItem[] = [
    { href: '/dashboard', label: t('nav.home'), icon: Home },
    { href: '/dashboard/guide', label: t('nav.guide'), icon: BookOpen },
    { href: '/dashboard/map', label: t('nav.map'), icon: Map },
    { href: '/dashboard/chat', label: t('nav.chat'), icon: MessageCircle },
  ]

  const post: NavItem[] = [
    { href: '/dashboard', label: t('nav.home'), icon: Home },
    { href: '/dashboard/guestbook', label: t('nav.guestbook'), icon: Camera },
    { href: '/dashboard/chat', label: t('nav.chat'), icon: MessageCircle },
  ]

  return phase === 'staying' ? staying : phase === 'booked' ? booked : post
}

export default function Navigation() {
  const pathname = usePathname()
  const navItems = useNavItems()
  const [showMore, setShowMore] = useState(false)
  const { phase } = usePhase()
  const { t } = useLanguage()

  const moreItems: NavItem[] = [
    { href: '/dashboard/guide', label: t('nav.guide'), icon: BookOpen },
    { href: '/dashboard/guestbook', label: t('nav.guestbook'), icon: Camera },
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
              className="fixed inset-0 z-40"
              style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
              onClick={() => setShowMore(false)}
            />
            <motion.div
              initial={{ y: 16, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 16, opacity: 0, scale: 0.96 }}
              transition={{ type: 'spring', damping: 26, stiffness: 300 }}
              className="fixed bottom-28 left-4 right-4 max-w-[390px] mx-auto z-50 p-3 grid grid-cols-2 gap-2"
              style={{
                background: 'rgba(10, 10, 18, 0.92)',
                backdropFilter: 'blur(32px) saturate(180%)',
                WebkitBackdropFilter: 'blur(32px) saturate(180%)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '24px',
                boxShadow: '0 12px 48px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
              }}
            >
              {moreItems.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setShowMore(false)}
                  className="flex items-center gap-3 p-3 rounded-2xl transition-all"
                  style={{ background: 'rgba(255,255,255,0.03)' }}
                >
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.15)' }}
                  >
                    <Icon size={15} className="text-gold-400" />
                  </div>
                  <span className="text-sm text-zinc-300 font-medium">{label}</span>
                </Link>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Floating Island Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-30" style={{ paddingBottom: 'max(20px, env(safe-area-inset-bottom))' }}>
        <div className="max-w-[390px] mx-auto px-5 pb-2">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', damping: 25 }}
            className="flex items-center justify-around px-2 py-1.5"
            style={{
              background: 'rgba(8, 8, 16, 0.88)',
              backdropFilter: 'blur(40px) saturate(200%)',
              WebkitBackdropFilter: 'blur(40px) saturate(200%)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '28px',
              boxShadow:
                '0 12px 48px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.03), inset 0 1px 0 rgba(255,255,255,0.06)',
            }}
          >
            {navItems.map(({ href, label, icon: Icon, badge }) => {
              const isActive =
                pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
              return (
                <Link
                  key={href}
                  href={href}
                  className="relative flex flex-col items-center gap-0.5 py-1.5 px-3 min-w-[52px]"
                >
                  <motion.div
                    className="relative w-10 h-10 flex items-center justify-center rounded-2xl transition-colors duration-200"
                    style={
                      isActive
                        ? {
                            background: 'rgba(251,191,36,0.12)',
                            boxShadow: '0 0 16px rgba(251,191,36,0.15)',
                          }
                        : {}
                    }
                    whileTap={{ scale: 0.88 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 400 }}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="nav-active-bg"
                        className="absolute inset-0 rounded-2xl"
                        style={{ background: 'rgba(251,191,36,0.1)' }}
                        transition={{ type: 'spring', damping: 22, stiffness: 300 }}
                      />
                    )}
                    <Icon
                      size={20}
                      strokeWidth={isActive ? 2 : 1.5}
                      className={`relative z-10 transition-colors duration-200 ${isActive ? 'text-gold-400' : 'text-zinc-300'}`}
                    />
                    {badge ? (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[11px] text-white flex items-center justify-center font-medium z-20">
                        {badge > 9 ? '9+' : badge}
                      </span>
                    ) : null}
                  </motion.div>
                  <span
                    className={`text-[11px] leading-none font-medium transition-colors duration-200 ${
                      isActive ? 'text-gold-400' : 'text-zinc-400'
                    }`}
                  >
                    {label}
                  </span>
                </Link>
              )
            })}

            {/* More button — staying phase only */}
            {phase === 'staying' && (
              <button
                onClick={() => setShowMore(!showMore)}
                className="relative flex flex-col items-center gap-0.5 py-1.5 px-3 min-w-[52px]"
              >
                <motion.div
                  className="relative w-10 h-10 flex items-center justify-center rounded-2xl transition-colors duration-200"
                  style={
                    showMore
                      ? { background: 'rgba(251,191,36,0.12)', boxShadow: '0 0 16px rgba(251,191,36,0.15)' }
                      : {}
                  }
                  whileTap={{ scale: 0.88 }}
                >
                  <MoreHorizontal
                    size={20}
                    strokeWidth={1.5}
                    className={showMore ? 'text-gold-400' : 'text-zinc-300'}
                  />
                </motion.div>
                <span className={`text-[11px] leading-none font-medium ${showMore ? 'text-gold-400' : 'text-zinc-400'}`}>
                  {t('nav.more')}
                </span>
              </button>
            )}
          </motion.div>
        </div>
      </nav>
    </>
  )
}
