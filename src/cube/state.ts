import type {
  AxisMap,
  Coord,
  Cubie,
  CubeState,
  GridPos,
  Orientation,
  PieceType,
} from './types'

export const IDENTITY: Orientation = [
  [0, 1],
  [1, 1],
  [2, 1],
] as const

export function pieceTypeFromPos(p: GridPos): PieceType {
  const nonZero = (p[0] !== 0 ? 1 : 0) + (p[1] !== 0 ? 1 : 0) + (p[2] !== 0 ? 1 : 0)
  if (nonZero === 3) return 'corner'
  if (nonZero === 2) return 'edge'
  if (nonZero === 1) return 'center'
  throw new Error(`Yaroqsiz cubie pozitsiyasi: (${p[0]},${p[1]},${p[2]})`)
}

// Barcha 26 ta harakatlanuvchi pozitsiyani sanab chiqadi (markaziy 0,0,0 yo'q).
export function allCubiePositions(): GridPos[] {
  const out: GridPos[] = []
  for (let x: Coord = -1; x <= 1; x = (x + 1) as Coord) {
    for (let y: Coord = -1; y <= 1; y = (y + 1) as Coord) {
      for (let z: Coord = -1; z <= 1; z = (z + 1) as Coord) {
        if (x === 0 && y === 0 && z === 0) continue
        out.push([x, y, z])
      }
    }
  }
  return out
}

export function solved(): CubeState {
  const positions = allCubiePositions()
  const cubies: Cubie[] = positions.map((p, i) => ({
    id: i,
    pieceType: pieceTypeFromPos(p),
    home: p,
    pos: p,
    orientation: IDENTITY,
  }))
  return { cubies }
}

export function isSolved(state: CubeState): boolean {
  return state.cubies.every(
    (c) =>
      c.pos[0] === c.home[0] &&
      c.pos[1] === c.home[1] &&
      c.pos[2] === c.home[2] &&
      orientationsEqual(c.orientation, IDENTITY),
  )
}

export function orientationsEqual(a: Orientation, b: Orientation): boolean {
  return (
    a[0][0] === b[0][0] &&
    a[0][1] === b[0][1] &&
    a[1][0] === b[1][0] &&
    a[1][1] === b[1][1] &&
    a[2][0] === b[2][0] &&
    a[2][1] === b[2][1]
  )
}

export function gridPosEqual(a: GridPos, b: GridPos): boolean {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2]
}

export function getCubieAt(state: CubeState, pos: GridPos): Cubie | undefined {
  return state.cubies.find((c) => gridPosEqual(c.pos, pos))
}

// Orientationni nusxalash uchun helper (mutable variantga aylantirish kerak bo'lsa).
export function orientationFromTuple(
  x: AxisMap,
  y: AxisMap,
  z: AxisMap,
): Orientation {
  return [x, y, z]
}
