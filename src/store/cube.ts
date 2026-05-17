import { create } from 'zustand'
import {
  applyMove,
  inverseMoves,
  isSolved,
  solved,
  type CubeState,
  type Move,
} from '@/cube'

export type Speed = 'slow' | 'normal' | 'fast' | 'instant'

export const SPEED_MS: Record<Speed, number> = {
  slow: 600,
  normal: 280,
  fast: 140,
  instant: 0,
}

export interface AnimationInfo {
  move: Move
  startedAt: number
  duration: number
}

interface CubeStore {
  state: CubeState
  queue: Move[]
  current: AnimationInfo | null
  speed: Speed
  history: Move[] // solved holatdan boshlab qo'llanilgan barcha yurishlar
  enqueue: (...moves: Move[]) => void
  enqueueMany: (moves: Move[]) => void
  setSpeed: (speed: Speed) => void
  reset: () => void
  commitCurrent: () => void
  solveFromHistory: () => void
  _tryStart: () => void
}

export const useCubeStore = create<CubeStore>((set, get) => ({
  state: solved(),
  queue: [],
  current: null,
  speed: 'normal',
  history: [],
  enqueue: (...moves) => {
    set((s) => ({ queue: [...s.queue, ...moves] }))
    get()._tryStart()
  },
  enqueueMany: (moves) => {
    set((s) => ({ queue: [...s.queue, ...moves] }))
    get()._tryStart()
  },
  setSpeed: (speed) => set({ speed }),
  reset: () => set({ state: solved(), queue: [], current: null, history: [] }),
  _tryStart: () => {
    const { queue, current, speed, state, history } = get()
    if (current || queue.length === 0) return
    const [next, ...rest] = queue
    const duration = SPEED_MS[speed]
    if (duration === 0) {
      const newState = applyMove(state, next)
      const newHistory = isSolved(newState) ? [] : [...history, next]
      set({ state: newState, queue: rest, history: newHistory })
      get()._tryStart()
    } else {
      set({
        queue: rest,
        current: { move: next, startedAt: performance.now(), duration },
      })
    }
  },
  commitCurrent: () => {
    const { current, state, history } = get()
    if (!current) return
    const newState = applyMove(state, current.move)
    const newHistory = isSolved(newState) ? [] : [...history, current.move]
    set({ state: newState, current: null, history: newHistory })
    get()._tryStart()
  },
  solveFromHistory: () => {
    const { history, current, queue } = get()
    if (current || queue.length > 0) return
    if (history.length === 0) return
    get().enqueueMany(inverseMoves(history))
  },
}))
