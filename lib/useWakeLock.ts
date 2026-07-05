'use client'

/**
 * Screen Wake Lock を安全に扱う共通フック。
 * - active の間だけロックを保持し、非表示→再表示でブラウザが自動解放した場合は取り直す
 * - アンマウント・active=false で確実に解放する（解放漏れは電池消耗に直結する）
 * - 非対応環境（iOS の旧 Safari 等）では静かに何もしない
 */

import { useEffect, useRef } from 'react'

type WakeLockSentinelLike = {
  released: boolean
  release: () => Promise<void>
}

export function useWakeLock(active: boolean): void {
  const sentinelRef = useRef<WakeLockSentinelLike | null>(null)

  useEffect(() => {
    if (!active) return
    let disposed = false

    const acquire = async () => {
      try {
        if ('wakeLock' in navigator) {
          const s: WakeLockSentinelLike = await (navigator as any).wakeLock.request('screen')
          if (disposed) {
            s.release().catch(() => {})
          } else {
            sentinelRef.current = s
          }
        }
      } catch {
        /* 拒否・非対応時は画面が自然に暗くなるのを許容 */
      }
    }

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') acquire()
    }

    acquire()
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      disposed = true
      document.removeEventListener('visibilitychange', onVisibilityChange)
      sentinelRef.current?.release().catch(() => {})
      sentinelRef.current = null
    }
  }, [active])
}
