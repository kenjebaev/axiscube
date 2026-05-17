import { describe, expect, test } from 'vitest'
import { toFacelets } from '@/cube/facelets'
import { applyMoves, parseMoves } from '@/cube/moves'
import { solved } from '@/cube/state'

describe('toFacelets', () => {
  test('solved cube 54 belgi qaytaradi, har rang 9 marta', () => {
    const f = toFacelets(solved())
    expect(f.length).toBe(54)
    for (const ch of ['U', 'R', 'F', 'D', 'L', 'B']) {
      expect((f.match(new RegExp(ch, 'g')) ?? []).length).toBe(9)
    }
  })

  test('solved facelet stringi har yuz uchun bitta rang', () => {
    const f = toFacelets(solved())
    // URFDLB tartibida 9-9 ta
    expect(f.slice(0, 9)).toBe('UUUUUUUUU')
    expect(f.slice(9, 18)).toBe('RRRRRRRRR')
    expect(f.slice(18, 27)).toBe('FFFFFFFFF')
    expect(f.slice(27, 36)).toBe('DDDDDDDDD')
    expect(f.slice(36, 45)).toBe('LLLLLLLLL')
    expect(f.slice(45, 54)).toBe('BBBBBBBBB')
  })

  test('R yurishidan keyin facelet o\'zgaradi', () => {
    const s = applyMoves(solved(), parseMoves('R'))
    const f = toFacelets(s)
    expect(f).not.toBe(toFacelets(solved()))
    // Har rangdan baribir 9 ta bo'lishi kerak (rang saqlanadi).
    for (const ch of ['U', 'R', 'F', 'D', 'L', 'B']) {
      expect((f.match(new RegExp(ch, 'g')) ?? []).length).toBe(9)
    }
  })

  test('R yurishidan keyin U yuzining o\'ng ustuni F rangiga aylanadi', () => {
    const s = applyMoves(solved(), parseMoves('R'))
    const f = toFacelets(s)
    // U yuzi indekslari: 0-8. Right column (col=+1) = indekslar 2, 5, 8.
    expect(f[2]).toBe('F')
    expect(f[5]).toBe('F')
    expect(f[8]).toBe('F')
  })
})
