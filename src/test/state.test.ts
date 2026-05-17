import { describe, expect, test } from 'vitest'
import { allCubiePositions, isSolved, pieceTypeFromPos, solved } from '@/cube/state'

describe('state', () => {
  test('solved() 26 ta cubie qaytaradi', () => {
    const s = solved()
    expect(s.cubies.length).toBe(26)
  })

  test('isSolved(solved()) === true', () => {
    expect(isSolved(solved())).toBe(true)
  })

  test('cubie turlari: 8 corner, 12 edge, 6 center', () => {
    const positions = allCubiePositions()
    expect(positions.length).toBe(26)
    const types = positions.map(pieceTypeFromPos)
    expect(types.filter((t) => t === 'corner').length).toBe(8)
    expect(types.filter((t) => t === 'edge').length).toBe(12)
    expect(types.filter((t) => t === 'center').length).toBe(6)
  })

  test('barcha cubie pozitsiyalari unikal', () => {
    const positions = allCubiePositions()
    const keys = new Set(positions.map((p) => p.join(',')))
    expect(keys.size).toBe(26)
  })
})
