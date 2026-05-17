import { describe, expect, test } from 'vitest'
import { decodeState, encodeState } from '@/cube/encoding'
import { applyMoves } from '@/cube/moves'
import { randomScramble, seededRng } from '@/cube/scramble'
import { solved } from '@/cube/state'

function statesEqual(a: ReturnType<typeof solved>, b: ReturnType<typeof solved>): boolean {
  if (a.cubies.length !== b.cubies.length) return false
  for (let i = 0; i < a.cubies.length; i++) {
    const ca = a.cubies[i]
    const cb = b.cubies[i]
    if (ca.id !== cb.id) return false
    if (ca.pos[0] !== cb.pos[0] || ca.pos[1] !== cb.pos[1] || ca.pos[2] !== cb.pos[2]) return false
    for (let j = 0; j < 3; j++) {
      if (ca.orientation[j][0] !== cb.orientation[j][0]) return false
      if (ca.orientation[j][1] !== cb.orientation[j][1]) return false
    }
  }
  return true
}

describe('encoding', () => {
  test('solved state encode → decode round-trip', () => {
    const s = solved()
    const enc = encodeState(s)
    const dec = decodeState(enc)
    expect(statesEqual(s, dec)).toBe(true)
  })

  test('1000 ta random scrambled state round-trip', () => {
    let fails = 0
    for (let seed = 1; seed <= 1000; seed++) {
      const rng = seededRng(seed)
      const scramble = randomScramble(20, rng)
      const s = applyMoves(solved(), scramble)
      const dec = decodeState(encodeState(s))
      if (!statesEqual(s, dec)) fails++
    }
    expect(fails).toBe(0)
  })

  test('versiya prefix v1.', () => {
    expect(encodeState(solved()).startsWith('v1.')).toBe(true)
  })

  test('yaroqsiz encoding xato beradi', () => {
    expect(() => decodeState('garbage')).toThrow()
    expect(() => decodeState('v2.abc')).toThrow()
  })
})
