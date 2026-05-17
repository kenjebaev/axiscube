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

export interface TutorialState {
  active: boolean
  stageIndex: number // 0..N-1
  totalStages: number
  stages: Move[][] // har bosqich uchun yurishlar
  stageDone: boolean // joriy bosqich animatsiyasi tugadi, foydalanuvchi "Davom etish"ni kutmoqda
}

interface CubeStore {
  state: CubeState
  queue: Move[]
  current: AnimationInfo | null
  speed: Speed
  history: Move[] // solved holatdan boshlab qo'llanilgan barcha yurishlar
  undoStack: UndoEntry[]
  redoStack: UndoEntry[]
  tutorial: TutorialState | null
  enqueue: (...moves: Move[]) => void
  enqueueMany: (moves: Move[]) => void
  setSpeed: (speed: Speed) => void
  reset: () => void
  commitCurrent: () => void
  solveFromHistory: () => void
  undo: () => void
  redo: () => void
  loadState: (state: CubeState) => void
  startTutorial: (totalStages: number) => void
  advanceTutorialStage: () => void
  cancelTutorial: () => void
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
  tutorial: null,
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
    set({
      state: solved(),
      queue: [],
      current: null,
      history: [],
      undoStack: [],
      redoStack: [],
      tutorial: null,
    }),
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
      tutorial: null,
    }),
  startTutorial: (totalStages) => {
    const { history } = get()
    if (history.length === 0) return
    const inverse = inverseMoves(history)
    // Yurishlarni totalStages ta taxminan teng bo'lakka ajratamiz
    const stages: Move[][] = []
    const baseSize = Math.floor(inverse.length / totalStages)
    const remainder = inverse.length % totalStages
    let offset = 0
    for (let i = 0; i < totalStages; i++) {
      const size = baseSize + (i < remainder ? 1 : 0)
      stages.push(inverse.slice(offset, offset + size))
      offset += size
    }
    // Bo'sh bosqichlarni o'tkazib yuborish
    const filtered = stages.filter((s) => s.length > 0)
    if (filtered.length === 0) return
    set({
      tutorial: {
        active: true,
        stageIndex: 0,
        totalStages: filtered.length,
        stages: filtered,
        stageDone: false,
      },
    })
    // Birinchi bosqichni navbatga qo'yamiz
    get().enqueueMany(filtered[0])
  },
  advanceTutorialStage: () => {
    const { tutorial, current, queue } = get()
    if (!tutorial || current || queue.length > 0) return
    const next = tutorial.stageIndex + 1
    if (next >= tutorial.totalStages) {
      // Darslik tugadi
      set({ tutorial: null })
      return
    }
    set({
      tutorial: { ...tutorial, stageIndex: next, stageDone: false },
    })
    get().enqueueMany(tutorial.stages[next])
  },
  cancelTutorial: () => set({ tutorial: null }),
}))

// Tutorial stageDone'ni avtomatik belgilash: queue va current bo'shasagina.
// Bu Zustand subscribe'ni komponentda ishlatamiz. Hozir UI'da ishlatiladi.
