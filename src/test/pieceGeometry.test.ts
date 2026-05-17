import { describe, expect, test } from 'vitest'
import { allCubiePositions } from '@/cube/state'
import { buildPieceGeometry } from '@/three/pieceGeometry'

describe('buildPieceGeometry', () => {
  test('barcha 26 cubie geometriyasi yaratiladi va bo\'sh emas', () => {
    const positions = allCubiePositions()
    expect(positions.length).toBe(26)
    let totalTriangles = 0
    let totalOuter = 0
    for (const p of positions) {
      const { geometry, faceCounts } = buildPieceGeometry(p)
      const posAttr = geometry.getAttribute('position')
      const tri = posAttr.count / 3
      expect(tri).toBeGreaterThan(0)
      totalTriangles += tri
      const outer =
        faceCounts['+X'] + faceCounts['-X'] +
        faceCounts['+Y'] + faceCounts['-Y'] +
        faceCounts['+Z'] + faceCounts['-Z']
      expect(outer).toBeGreaterThan(0) // har piece kamida bitta tashqi yuzga ega
      totalOuter += outer
    }
    expect(totalTriangles).toBeGreaterThan(150)
    expect(totalOuter).toBeGreaterThan(40)
  })

  test('har bir tashqi kub yuzida solved cube uchun ranglar yoyilgan', () => {
    const positions = allCubiePositions()
    const outerCounts: Record<string, number> = {
      '+X': 0, '-X': 0, '+Y': 0, '-Y': 0, '+Z': 0, '-Z': 0,
    }
    for (const p of positions) {
      const { faceCounts } = buildPieceGeometry(p)
      for (const k of Object.keys(outerCounts)) {
        outerCounts[k] += faceCounts[k as keyof typeof faceCounts]
      }
    }
    // Har yuz uchun trianglular soni 0 dan katta
    for (const v of Object.values(outerCounts)) {
      expect(v).toBeGreaterThan(0)
    }
  })
})
