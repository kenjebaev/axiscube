import type {
  Axis,
  Cubie,
  CubeState,
  Face,
  GridPos,
  Modifier,
  Move,
  Orientation,
  Sign,
} from './types'

// Har bir face uchun aylanish o'qi va layer (qaysi koordinata qiymati).
const FACE_INFO: Record<Face, { axis: Axis; layer: -1 | 1 }> = {
  R: { axis: 0, layer: 1 },
  L: { axis: 0, layer: -1 },
  U: { axis: 1, layer: 1 },
  D: { axis: 1, layer: -1 },
  F: { axis: 2, layer: 1 },
  B: { axis: 2, layer: -1 },
}

// Konvensiya: + layerli yuz uchun "soat yo'nalishi" (CW) = o'sha o'q atrofida -90°.
// - layerli yuz uchun CW = +90°. Bu cubing notation'iga mos keladi.
// Quaternion turn count (k mod 4): 0=identity, 1=+90°, 2=180°, 3=-90°
function quarterTurns(move: Move): 0 | 1 | 2 | 3 {
  const { axis: _axis, layer } = FACE_INFO[move.face]
  void _axis
  // base = layer === 1 ? -1 : +1, ya'ni 3 yoki 1 (mod 4)
  const baseK: 1 | 3 = layer === 1 ? 3 : 1
  if (move.modifier === '2') return 2
  if (move.modifier === "'") return ((4 - baseK) % 4) as 0 | 1 | 2 | 3
  return baseK
}

// Aylanish matritsasi: o'q atrofida 90°*k.
// Bizning orientation formati: o'qi i (input) qaysi (a, s)ga aylanishi.
// Quyidagi jadval rotMat[axis][k] (k in 0..3) ko'rinishida.
type RotEntry = Orientation
const ID: RotEntry = [
  [0, 1],
  [1, 1],
  [2, 1],
]

function buildRotations(): RotEntry[][] {
  // axis 0 = +x atrofida +90°: +y → +z, +z → -y, +x → +x
  const xPos90: RotEntry = [
    [0, 1],
    [2, 1],
    [1, -1],
  ]
  // axis 1 = +y atrofida +90°: +z → +x, +x → -z, +y → +y
  const yPos90: RotEntry = [
    [2, -1],
    [1, 1],
    [0, 1],
  ]
  // axis 2 = +z atrofida +90°: +x → +y, +y → -x, +z → +z
  const zPos90: RotEntry = [
    [1, 1],
    [0, -1],
    [2, 1],
  ]

  const out: RotEntry[][] = [[], [], []]
  ;([xPos90, yPos90, zPos90] as RotEntry[]).forEach((r1, axisIdx) => {
    out[axisIdx][0] = ID
    out[axisIdx][1] = r1
    out[axisIdx][2] = compose(r1, r1)
    out[axisIdx][3] = compose(r1, out[axisIdx][2])
  })
  return out
}

// O ∘ P: avval P, keyin O (matritsa ko'paytmasi sifatida).
// Bizning formatda: (O ∘ P)[i] = O ni P[i]ga qo'llash.
function compose(o: Orientation, p: Orientation): Orientation {
  const r: Array<readonly [Axis, Sign]> = []
  for (let i = 0; i < 3; i++) {
    const [a, s] = p[i]
    const [oa, os] = o[a]
    r.push([oa, (s * os) as Sign])
  }
  return [r[0], r[1], r[2]] as Orientation
}

const ROT = buildRotations()

// Aylanish matritsasini pozitsiyaga qo'llash.
// rot[i] = [a, s]: yangi pozitsiyada a-koordinata = eski[i] * s.
function applyRotationToPos(rot: Orientation, p: GridPos): GridPos {
  const out: [number, number, number] = [0, 0, 0]
  for (let i = 0; i < 3; i++) {
    const [a, s] = rot[i]
    out[a] = p[i] * s
  }
  return out as unknown as GridPos
}

export function applyMove(state: CubeState, move: Move): CubeState {
  const { axis, layer } = FACE_INFO[move.face]
  const k = quarterTurns(move)
  if (k === 0) return state
  const rot = ROT[axis][k]
  const cubies = state.cubies.map((c): Cubie => {
    if (c.pos[axis] !== layer) return c
    return {
      ...c,
      pos: applyRotationToPos(rot, c.pos),
      orientation: compose(rot, c.orientation),
    }
  })
  return { cubies }
}

export function applyMoves(state: CubeState, moves: ReadonlyArray<Move>): CubeState {
  let s = state
  for (const m of moves) s = applyMove(s, m)
  return s
}

// Notation parser/formatter
const FACES: ReadonlyArray<Face> = ['U', 'D', 'L', 'R', 'F', 'B']

export function parseMove(s: string): Move {
  const trimmed = s.trim()
  if (trimmed.length < 1 || trimmed.length > 2) {
    throw new Error(`Yaroqsiz yurish: "${s}"`)
  }
  const face = trimmed[0] as Face
  if (!FACES.includes(face)) throw new Error(`Yaroqsiz yuz: "${face}"`)
  const mod = (trimmed[1] ?? '') as Modifier
  if (mod !== '' && mod !== "'" && mod !== '2') {
    throw new Error(`Yaroqsiz modifikator: "${mod}"`)
  }
  return { face, modifier: mod }
}

export function parseMoves(line: string): Move[] {
  return line
    .split(/\s+/)
    .filter(Boolean)
    .map(parseMove)
}

export function formatMove(m: Move): string {
  return `${m.face}${m.modifier}`
}

export function formatMoves(moves: ReadonlyArray<Move>): string {
  return moves.map(formatMove).join(' ')
}

export function inverseMove(m: Move): Move {
  if (m.modifier === '2') return m
  if (m.modifier === "'") return { face: m.face, modifier: '' }
  return { face: m.face, modifier: "'" }
}

export function inverseMoves(moves: ReadonlyArray<Move>): Move[] {
  return [...moves].reverse().map(inverseMove)
}

export const ALL_MOVES: ReadonlyArray<Move> = FACES.flatMap((face) =>
  (['', "'", '2'] as Modifier[]).map((modifier): Move => ({ face, modifier })),
)

export { FACE_INFO }
