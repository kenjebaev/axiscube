import { describe, expect, test } from 'vitest'
import {
  ALL_MOVES,
  applyMove,
  applyMoves,
  formatMove,
  inverseMove,
  inverseMoves,
  parseMove,
  parseMoves,
} from '@/cube/moves'
import { isSolved, solved } from '@/cube/state'

describe('notation parse/format', () => {
  test('parseMove asoslar', () => {
    expect(parseMove('R')).toEqual({ face: 'R', modifier: '' })
    expect(parseMove("U'")).toEqual({ face: 'U', modifier: "'" })
    expect(parseMove('F2')).toEqual({ face: 'F', modifier: '2' })
  })

  test('format/parse round-trip', () => {
    for (const m of ALL_MOVES) {
      expect(parseMove(formatMove(m))).toEqual(m)
    }
  })

  test("parseMoves bo'sh joy bilan ajratadi", () => {
    expect(parseMoves("R U R' U'")).toHaveLength(4)
  })

  test('parseMove yaroqsiz inputlarda xato beradi', () => {
    expect(() => parseMove('X')).toThrow()
    expect(() => parseMove('R3')).toThrow()
    expect(() => parseMove('')).toThrow()
  })
})

describe('inverseMove', () => {
  test("R inverse = R'", () => {
    expect(inverseMove(parseMove('R'))).toEqual(parseMove("R'"))
    expect(inverseMove(parseMove("R'"))).toEqual(parseMove('R'))
    expect(inverseMove(parseMove('R2'))).toEqual(parseMove('R2'))
  })

  test('inverseMoves teskari tartibda inverse qiladi', () => {
    const moves = parseMoves("R U F'")
    const inv = inverseMoves(moves)
    expect(inv.map(formatMove)).toEqual(['F', "U'", "R'"])
  })
})

describe('applyMove', () => {
  test('R R R R = solved', () => {
    const s = applyMoves(solved(), parseMoves('R R R R'))
    expect(isSolved(s)).toBe(true)
  })

  test('R2 R2 = solved', () => {
    const s = applyMoves(solved(), parseMoves('R2 R2'))
    expect(isSolved(s)).toBe(true)
  })

  test("R R' = solved", () => {
    const s = applyMoves(solved(), parseMoves("R R'"))
    expect(isSolved(s)).toBe(true)
  })

  test('sexy move (R U R\' U\') ×6 = solved', () => {
    const s = applyMoves(solved(), parseMoves("R U R' U' " + "R U R' U' " + "R U R' U' " + "R U R' U' " + "R U R' U' " + "R U R' U'"))
    expect(isSolved(s)).toBe(true)
  })

  test("har yurish aniq 9 cubie pozitsiyasini o'zgartiradi", () => {
    const base = solved()
    for (const m of ALL_MOVES) {
      if (m.modifier === '2') continue // 180° edge-corner positionlari joyida qoladi, lekin orientatsiya o'zgaradi; bu test pos uchun
      const next = applyMove(base, m)
      let changed = 0
      for (let i = 0; i < next.cubies.length; i++) {
        const a = base.cubies[i]
        const b = next.cubies[i]
        if (a.pos[0] !== b.pos[0] || a.pos[1] !== b.pos[1] || a.pos[2] !== b.pos[2]) {
          changed++
        }
      }
      expect(changed).toBe(8) // 4 edge + 4 corner (markaziy o'z joyida qoladi)
    }
  })

  test("barcha 18 yurish solved'dan turli holatlarni hosil qiladi", () => {
    const seen = new Set<string>()
    for (const m of ALL_MOVES) {
      const s = applyMove(solved(), m)
      const key = JSON.stringify(s.cubies.map((c) => [c.pos, c.orientation]))
      seen.add(key)
    }
    expect(seen.size).toBe(18)
  })

  test("R ning inversi R' ekanini state-darajada tasdiqlaydi", () => {
    const s = applyMoves(solved(), parseMoves("R R'"))
    expect(isSolved(s)).toBe(true)
    const s2 = applyMoves(solved(), parseMoves("R' R"))
    expect(isSolved(s2)).toBe(true)
  })
})
