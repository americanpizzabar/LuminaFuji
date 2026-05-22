'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { getStore, setPhase as storeSetPhase, setGuestInfo as storeSetGuestInfo, GuestInfo, GuestPhase } from './store'

export type { GuestPhase }
export type { GuestInfo }

interface PhaseContextValue {
  phase: GuestPhase
  setPhase: (phase: GuestPhase) => void
  guestInfo: GuestInfo | null
  setGuestInfo: (info: GuestInfo) => void
  isLoggedIn: boolean
  logout: () => void
}

const PhaseContext = createContext<PhaseContextValue | null>(null)

export function PhaseProvider({ children }: { children: React.ReactNode }) {
  const [phase, setPhaseState] = useState<GuestPhase>('staying')
  const [guestInfo, setGuestInfoState] = useState<GuestInfo | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const store = getStore()
    setPhaseState(store.phase)
    setGuestInfoState(store.guestInfo)
    setIsLoggedIn(!!store.guestInfo)

    // Listen for store changes from other tabs or owner dashboard
    const handler = (e: StorageEvent) => {
      if (e.key === 'lf_store_v3' && e.newValue) {
        try {
          const updated = JSON.parse(e.newValue)
          if (updated.phase) setPhaseState(updated.phase)
          if (updated.guestInfo !== undefined) setGuestInfoState(updated.guestInfo)
        } catch {}
      }
    }
    window.addEventListener('storage', handler)
    setMounted(true)
    return () => window.removeEventListener('storage', handler)
  }, [])

  const setPhase = (p: GuestPhase) => {
    setPhaseState(p)
    storeSetPhase(p)
  }

  const setGuestInfo = (info: GuestInfo) => {
    setGuestInfoState(info)
    setIsLoggedIn(true)
    storeSetGuestInfo(info)
  }

  const logout = () => {
    setIsLoggedIn(false)
    setGuestInfoState(null)
  }

  if (!mounted) return null

  return (
    <PhaseContext.Provider value={{ phase, setPhase, guestInfo, setGuestInfo, isLoggedIn, logout }}>
      {children}
    </PhaseContext.Provider>
  )
}

export function usePhase() {
  const ctx = useContext(PhaseContext)
  if (!ctx) throw new Error('usePhase must be used within PhaseProvider')
  return ctx
}
