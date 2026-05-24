'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { getStore, setPhase as storeSetPhase, setGuestInfo as storeSetGuestInfo, GuestInfo, GuestPhase } from './store'

export type { GuestPhase }
export type { GuestInfo }

// ─── 自動フェーズ計算（共通ユーティリティ） ────────────────────────────────────
// arrivedAt が設定済み かつ checkOut 前 → 'staying'
// checkOut 後 → 'post'
// それ以外 (arrivedAt 未設定) → 'booked' (チェックイン時刻前 or 未着)
export function calcPhase(
  checkIn: string,
  checkOut: string,
  checkInTime: string = '16:00',
  checkOutTime: string = '11:00',
  arrivedAt?: string
): GuestPhase {
  const now = new Date()

  const [ciH, ciM] = checkInTime.split(':').map(Number)
  const checkInDt = new Date(checkIn)
  checkInDt.setHours(ciH, ciM, 0, 0)

  const [coH, coM] = checkOutTime.split(':').map(Number)
  const checkOutDt = new Date(checkOut)
  checkOutDt.setHours(coH, coM, 0, 0)

  // チェックアウト後は常にpost
  if (now >= checkOutDt) return 'post'
  // 到着マーク済み (オーナー早期承認 or ゲスト自己申告) → staying
  if (arrivedAt) return 'staying'
  // チェックイン時刻前 or 時刻は過ぎたが未到着 → booked
  return 'booked'
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
      setAutoPhase(calcPhase(store.guestInfo.checkIn, store.guestInfo.checkOut, checkInTime, checkOutTime, store.guestInfo.arrivedAt))
    }
  }

  useEffect(() => {
    const store = getStore()
    setGuestInfoState(store.guestInfo)
    setIsLoggedIn(!!store.guestInfo)
    recalc()

    // 1分ごとに再計算（チェックイン・チェックアウト時刻で自動切り替え）
    const interval = setInterval(recalc, 60_000)

    // 他タブからの変更（オーナー/管理会社が日程変更した場合も含む）を反映
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
