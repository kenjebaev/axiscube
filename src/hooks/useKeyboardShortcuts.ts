import { useEffect } from 'react'
import { useCubeStore } from '@/store/cube'
import { parseMove, randomScramble } from '@/cube'
import type { Face, Modifier } from '@/cube/types'

const FACE_KEYS: Record<string, Face> = {
  r: 'R',
  l: 'L',
  u: 'U',
  d: 'D',
  f: 'F',
  b: 'B',
}

export function useKeyboardShortcuts() {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Input maydonlarida ishlamasin
      const target = e.target as HTMLElement | null
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
      ) {
        return
      }

      const store = useCubeStore.getState()
      const busy = store.queue.length > 0 || !!store.current

      // Cmd/Ctrl + Z = undo, Cmd/Ctrl + Shift + Z = redo
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        if (e.shiftKey) store.redo()
        else store.undo()
        return
      }

      if (e.metaKey || e.ctrlKey || e.altKey) return

      // Space = scramble
      if (e.key === ' ' && !busy) {
        e.preventDefault()
        store.enqueueMany(randomScramble(20))
        return
      }

      // R/L/U/D/F/B (Shift uchun prime, raqam 2 uchun double-quarter)
      const face = FACE_KEYS[e.key.toLowerCase()]
      if (!face || busy) return
      e.preventDefault()
      const modifier: Modifier = e.shiftKey ? "'" : ''
      store.enqueue(parseMove(face + modifier))
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])
}
