'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

export type GuestPhase = 'booked' | 'staying' | 'post'

interface GuestInfo {
  name: string
  email: string
  checkIn: string
  checkOut: string
  reservationId: string
}

interface PhaseContextValue {
  phase: GuestPhase
  setPhase: (phase: GuestPhase) => void
  guestInfo: GuestInfo | null
  setGuestInfo: (info: GuestInfo) => void
  isDemo: boolean
  isLoggedIn: boolean
  logout: () => void
}

const PhaseContext = createContext<PhaseContextValue | null>(null)

const DEMO_GUEST: GuestInfo = {
  name: 'Yamada Taro',
  email: 'guest@example.com',
  checkIn: '2026-05-10',
  checkOut: '2026-05-12',
  reservationId: 'LF-2026-0510',
}

export function PhaseProvider({ children }: { children: React.ReactNode }) {
  const [phase, setPhaseState] = useState<GuestPhase>('staying')
  const [guestInfo, setGuestInfoState] = useState<GuestInfo | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const storedPhase = localStorage.getItem('lf_phase') as GuestPhase | null
    const storedGuest = localStorage.getItem('lf_guest')
    const storedLogin = localStorage.getItem('lf_logged_in')

    if (storedPhase) setPhaseState(storedPhase)
    if (storedGuest) setGuestInfoState(JSON.parse(storedGuest))
    if (storedLogin === 'true') setIsLoggedIn(true)

    if (!storedLogin && !storedGuest) {
      setGuestInfoState(DEMO_GUEST)
      setIsLoggedIn(true)
      localStorage.setItem('lf_guest', JSON.stringify(DEMO_GUEST))
      localStorage.setItem('lf_logged_in', 'true')
      localStorage.setItem('lf_phase', 'staying')
    }
    setMounted(true)
  }, [])

  const setPhase = (p: GuestPhase) => {
    setPhaseState(p)
    localStorage.setItem('lf_phase', p)
  }

  const setGuestInfo = (info: GuestInfo) => {
    setGuestInfoState(info)
    localStorage.setItem('lf_guest', JSON.stringify(info))
    setIsLoggedIn(true)
    localStorage.setItem('lf_logged_in', 'true')
  }

  const logout = () => {
    localStorage.removeItem('lf_guest')
    localStorage.removeItem('lf_logged_in')
    localStorage.removeItem('lf_phase')
    setIsLoggedIn(false)
    setGuestInfoState(null)
  }

  if (!mounted) return null

  return (
    <PhaseContext.Provider value={{
      phase,
      setPhase,
      guestInfo,
      setGuestInfo,
      isDemo: process.env.NEXT_PUBLIC_DEMO_MODE === 'true',
      isLoggedIn,
      logout,
    }}>
      {children}
    </PhaseContext.Provider>
  )
}

export function usePhase() {
  const ctx = useContext(PhaseContext)
  if (!ctx) throw new Error('usePhase must be used within PhaseProvider')
  return ctx
}
