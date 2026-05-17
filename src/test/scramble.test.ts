import { describe, expect, test } from 'vitest'
import { applyMoves, inverseMoves } from '@/cube/moves'
import { randomScramble, seededRng } from '@/cube/scramble'
import { isSolved, solved } from '@/cube/state'

describe('randomScramble', () => {
  test('berilgan uzunlikda harakatlar', () => {
    const rng = seededRng(42)
    const moves = randomScramble(20, rng)
    expect(moves.length).toBe(20)
  })

  test('ketma-ket bir xil yuzli harakatlar yo\'q', () => {
    const rng = seededRng(123)
    const moves = randomScramble(50, rng)
    for (let i = 1; i < moves.length; i++) {
      expect(moves[i].face).not.toBe(moves[i - 1].face)
    }
  })

  test('scramble + inverse(scramble) → solved (1000 ta seeded sinov)', () => {
    let fails = 0
    for (let seed = 1; seed <= 1000; seed++) {
      const rng = seededRng(seed)
      const scramble = randomScramble(25, rng)
      const inv = inverseMoves(scramble)
      const s = applyMoves(applyMoves(solved(), scramble), inv)
      if (!isSolved(s)) fails++
    }
    expect(fails).toBe(0)
  })
})
