import { ALL_MOVES } from './moves'
import type { Face, Modifier, Move } from './types'

// Pseudo-random generator interfeysi (test'larda seed berib bo'lishi uchun).
export interface Rng {
  next(): number // [0, 1)
}

export function defaultRng(): Rng {
  return { next: () => Math.random() }
}

// Mulberry32 — engil, seedable, test'lar uchun.
export function seededRng(seed: number): Rng {
  let a = seed >>> 0
  return {
    next() {
      a = (a + 0x6d2b79f5) >>> 0
      let t = a
      t = Math.imul(t ^ (t >>> 15), t | 1)
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    },
  }
}

// Bir xil o'qda ketma-ket harakatlarni oldini olamiz (WCA-ga yaqin).
const OPPOSITES: Record<Face, Face> = {
  R: 'L', L: 'R',
  U: 'D', D: 'U',
  F: 'B', B: 'F',
}

const MODIFIERS: ReadonlyArray<Modifier> = ['', "'", '2']
const FACES: ReadonlyArray<Face> = ['U', 'D', 'L', 'R', 'F', 'B']

export function randomScramble(length = 20, rng: Rng = defaultRng()): Move[] {
  const out: Move[] = []
  let prevFace: Face | null = null
  let prevPrevFace: Face | null = null
  while (out.length < length) {
    const face = FACES[Math.floor(rng.next() * FACES.length)]
    if (face === prevFace) continue
    // Bir xil o'qdagi 3 harakat ketma-ket bo'lmasin (R L R kabi).
    if (prevPrevFace !== null && OPPOSITES[face] === prevFace && face === prevPrevFace) continue
    const mod = MODIFIERS[Math.floor(rng.next() * MODIFIERS.length)]
    out.push({ face, modifier: mod })
    prevPrevFace = prevFace
    prevFace = face
  }
  return out
}

export { ALL_MOVES }
