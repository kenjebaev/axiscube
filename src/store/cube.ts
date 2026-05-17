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

interface UndoEntry {
  state: CubeState
  history: Move[]
}

interface CubeStore {
  state: CubeState
  queue: Move[]
  current: AnimationInfo | null
  speed: Speed
  history: Move[] // solved holatdan boshlab qo'llanilgan barcha yurishlar
  undoStack: UndoEntry[]
  redoStack: UndoEntry[]
  enqueue: (...moves: Move[]) => void
  enqueueMany: (moves: Move[]) => void
  setSpeed: (speed: Speed) => void
  reset: () => void
  commitCurrent: () => void
  solveFromHistory: () => void
  undo: () => void
  redo: () => void
  loadState: (state: CubeState) => void
  _tryStart: () => void
}

const MAX_UNDO = 500

function pushBounded(stack: UndoEntry[], entry: UndoEntry): UndoEntry[] {
  const next = [...stack, entry]
  if (next.length > MAX_UNDO) next.shift()
  return next
}

export const useCubeStore = create<CubeStore>((set, get) => ({
  state: solved(),
  queue: [],
  current: null,
  speed: 'normal',
  history: [],
  undoStack: [],
  redoStack: [],
  enqueue: (...moves) => {
    set((s) => ({ queue: [...s.queue, ...moves] }))
    get()._tryStart()
  },
  enqueueMany: (moves) => {
    set((s) => ({ queue: [...s.queue, ...moves] }))
    get()._tryStart()
  },
  setSpeed: (speed) => set({ speed }),
  reset: () =>
    set({ state: solved(), queue: [], current: null, history: [], undoStack: [], redoStack: [] }),
  _tryStart: () => {
    const { queue, current, speed, state, history, undoStack } = get()
    if (current || queue.length === 0) return
    const [next, ...rest] = queue
    const duration = SPEED_MS[speed]
    if (duration === 0) {
      const newState = applyMove(state, next)
      const newHistory = isSolved(newState) ? [] : [...history, next]
      set({
        state: newState,
        queue: rest,
        history: newHistory,
        undoStack: pushBounded(undoStack, { state, history }),
        redoStack: [],
      })
      get()._tryStart()
    } else {
      set({
        queue: rest,
        current: { move: next, startedAt: performance.now(), duration },
      })
    }
  },
  commitCurrent: () => {
    const { current, state, history, undoStack } = get()
    if (!current) return
    const newState = applyMove(state, current.move)
    const newHistory = isSolved(newState) ? [] : [...history, current.move]
    set({
      state: newState,
      current: null,
      history: newHistory,
      undoStack: pushBounded(undoStack, { state, history }),
      redoStack: [],
    })
    get()._tryStart()
  },
  solveFromHistory: () => {
    const { history, current, queue } = get()
    if (current || queue.length > 0) return
    if (history.length === 0) return
    get().enqueueMany(inverseMoves(history))
  },
  undo: () => {
    const { undoStack, state, history, current, queue } = get()
    if (current || queue.length > 0 || undoStack.length === 0) return
    const prev = undoStack[undoStack.length - 1]
    const newUndo = undoStack.slice(0, -1)
    set({
      state: prev.state,
      history: prev.history,
      undoStack: newUndo,
      redoStack: pushBounded(get().redoStack, { state, history }),
    })
  },
  redo: () => {
    const { redoStack, state, history, current, queue } = get()
    if (current || queue.length > 0 || redoStack.length === 0) return
    const next = redoStack[redoStack.length - 1]
    const newRedo = redoStack.slice(0, -1)
    set({
      state: next.state,
      history: next.history,
      undoStack: pushBounded(get().undoStack, { state, history }),
      redoStack: newRedo,
    })
  },
  loadState: (state) =>
    set({
      state,
      queue: [],
      current: null,
      history: [],
      undoStack: [],
      redoStack: [],
    }),
}))
