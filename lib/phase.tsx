'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { getStore, setPhase as storeSetPhase, setGuestInfo as storeSetGuestInfo, GuestInfo, GuestPhase } from './store'

export type { GuestPhase }
export type { GuestInfo }

// ─── 自動フェーズ計算 ─────────────────────────────────────────────────────────
// チェックイン日 checkInTime（デフォルト16:00）より前  → 'booked'
// チェックイン後 〜 チェックアウト日 checkOutTime（デフォルト11:00）まで → 'staying'
// チェックアウト以降 → 'post'
function calcPhase(
  guestInfo: GuestInfo,
  checkInTime: string = '16:00',
  checkOutTime: string = '11:00'
): GuestPhase {
  const now = new Date()

  const [ciH, ciM] = checkInTime.split(':').map(Number)
  const checkInDt = new Date(guestInfo.checkIn)
  checkInDt.setHours(ciH, ciM, 0, 0)

  const [coH, coM] = checkOutTime.split(':').map(Number)
  const checkOutDt = new Date(guestInfo.checkOut)
  checkOutDt.setHours(coH, coM, 0, 0)

  if (now < checkInDt) return 'booked'
  if (now < checkOutDt) return 'staying'
  return 'post'
}

interface PhaseContextValue {
  phase: GuestPhase
  /** デモモード用手動オーバーライド。通常ゲストには影響しない */
  setPhase: (phase: GuestPhase) => void
  guestInfo: GuestInfo | null
  setGuestInfo: (info: GuestInfo) => void
  isLoggedIn: boolean
  logout: () => void
}

const PhaseContext = createContext<PhaseContextValue | null>(null)

export function PhaseProvider({ children }: { children: React.ReactNode }) {
  const [autoPhase, setAutoPhase] = useState<GuestPhase>('booked')
  const [demoOverride, setDemoOverride] = useState<GuestPhase | null>(null)
  const [guestInfo, setGuestInfoState] = useState<GuestInfo | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [mounted, setMounted] = useState(false)

  // 自動フェーズを計算・更新
  const recalc = () => {
    const store = getStore()
    if (store.guestInfo) {
      const { checkInTime, checkOutTime } = store.facilitySettings
      setAutoPhase(calcPhase(store.guestInfo, checkInTime, checkOutTime))
    }
  }

  useEffect(() => {
    const store = getStore()
    setGuestInfoState(store.guestInfo)
    setIsLoggedIn(!!store.guestInfo)

    // 初回計算
    recalc()

    // 1分ごとに再計算（チェックイン・チェックアウト時刻で自動切り替え）
    const interval = setInterval(recalc, 60_000)

    // 他タブからの guestInfo 変更を反映
    const handler = (e: StorageEvent) => {
      if (e.key === 'lf_store_v3' && e.newValue) {
        try {
          const updated = JSON.parse(e.newValue)
          if (updated.guestInfo !== undefined) {
            setGuestInfoState(updated.guestInfo)
            setIsLoggedIn(!!updated.guestInfo)
          }
        } catch {}
      }
      recalc()
    }
    window.addEventListener('storage', handler)
    setMounted(true)

    return () => {
      clearInterval(interval)
      window.removeEventListener('storage', handler)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // デモモードのみ手動オーバーライドを許可
  const setPhase = (p: GuestPhase) => {
    setDemoOverride(p)
    storeSetPhase(p)
  }

  const setGuestInfo = (info: GuestInfo) => {
    setGuestInfoState(info)
    setIsLoggedIn(true)
    storeSetGuestInfo(info)
    // guestInfo が変わったら手動オーバーライドをリセット
    setDemoOverride(null)
    recalc()
  }

  const logout = () => {
    setIsLoggedIn(false)
    setGuestInfoState(null)
    setDemoOverride(null)
  }

  // 実際のフェーズ: デモ手動 > 自動計算
  const phase = demoOverride ?? autoPhase

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
