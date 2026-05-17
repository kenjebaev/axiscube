import { useEffect } from 'react'
import { useCubeStore } from '@/store/cube'
import { decodeState, encodeState } from '@/cube'

const HASH_PREFIX = '#s='

// URL hash bilan kub holatini sinxronlash:
// - mount paytida: hash dan o'qib, agar yaroqli bo'lsa loadState
// - state o'zgarsa: debounce bilan hash'ni yangilash (replaceState)
export function useUrlSync() {
  const state = useCubeStore((s) => s.state)

  // Mount: URL'dan o'qish
  useEffect(() => {
    const hash = window.location.hash
    if (!hash.startsWith(HASH_PREFIX)) return
    const encoded = hash.slice(HASH_PREFIX.length)
    if (!encoded) return
    try {
      const loaded = decodeState(encoded)
      useCubeStore.getState().loadState(loaded)
    } catch (e) {
      console.warn('URL holatini yuklab bo\'lmadi:', e)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // State o'zgarsa: URL'ni yangilash (debounce)
  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        const encoded = encodeState(state)
        const newHash = `${HASH_PREFIX}${encoded}`
        if (window.location.hash !== newHash) {
          window.history.replaceState(null, '', newHash)
        }
      } catch {
        // ignore
      }
    }, 250)
    return () => window.clearTimeout(id)
  }, [state])
}
