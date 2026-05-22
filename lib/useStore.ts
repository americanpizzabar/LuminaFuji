'use client'

import { useEffect, useState, useCallback } from 'react'
import { AppStore, getStore, saveStore } from './store'

const STORE_KEY = 'lf_store_v3'

/**
 * React hook for the central store.
 * Subscribes to localStorage changes so multiple tabs stay in sync.
 */
export function useStore(): [AppStore, (partial: Partial<AppStore>) => void] {
  const [store, setStore] = useState<AppStore>(getStore)

  useEffect(() => {
    // Listen for changes from other tabs or same-tab dispatches
    const handler = (e: StorageEvent) => {
      if (e.key === STORE_KEY && e.newValue) {
        try { setStore(JSON.parse(e.newValue)) } catch {}
      }
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  const update = useCallback((partial: Partial<AppStore>) => {
    setStore(prev => {
      const next = { ...prev, ...partial }
      saveStore(next)
      return next
    })
  }, [])

  return [store, update]
}
