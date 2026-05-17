import { BufferAttribute, BufferGeometry, Vector3 } from 'three'
import { CUBE_HALF, CUT_DIST, NX, NY, NZ } from './cutPlanes'
import type { GridPos } from '@/cube/types'

const EPS = 1e-6

// Plane: n · p = d. Yarim fazo: n · p ≤ d (yo'nalishni hisobga olib).
interface Plane {
  normal: Vector3
  d: number
  key: string
}

// Tashqi kub 6 yuzi: n · p ≤ d ko'rinishida (normal tashqariga qaragan).
const OUTER_PLANES: Plane[] = [
  { normal: new Vector3(1, 0, 0), d: CUBE_HALF, key: '+X' },
  { normal: new Vector3(-1, 0, 0), d: CUBE_HALF, key: '-X' },
  { normal: new Vector3(0, 1, 0), d: CUBE_HALF, key: '+Y' },
  { normal: new Vector3(0, -1, 0), d: CUBE_HALF, key: '-Y' },
  { normal: new Vector3(0, 0, 1), d: CUBE_HALF, key: '+Z' },
  { normal: new Vector3(0, 0, -1), d: CUBE_HALF, key: '-Z' },
]

// Sticker klassifikatsiyasi: outer plane key (yoki null = ichki).
export type StickerFace = '+X' | '-X' | '+Y' | '-Y' | '+Z' | '-Z' | 'INNER'

// Cubie (a, b, c) ni o'rab turgan tekisliklar va yarim fazo shartlarini quradi.
// 3 ta aylantirilgan kesim juftligi (n_x, n_y, n_z) — har biri ±1/3 da.
function pieceBoundingPlanes(p: GridPos): {
  bounding: Plane[]    // bu piece chegarasini hosil qiluvchi tekisliklar
  constraints: Plane[] // p shu yarim fazolarning hammasida bo'lishi shart
} {
  const bounding: Plane[] = [...OUTER_PLANES]
  const constraints: Plane[] = OUTER_PLANES.map((pl) => ({ ...pl }))

  const axes = [
    { n: NX, a: p[0], k: 'NX' },
    { n: NY, a: p[1], k: 'NY' },
    { n: NZ, a: p[2], k: 'NZ' },
  ]

  for (const { n, a, k } of axes) {
    if (a === 1) {
      // n · p ≥ 1/3, ya'ni chegara: n · p = 1/3 (tashqi normalga teskari)
      bounding.push({ normal: n.clone().negate(), d: -CUT_DIST, key: `${k}=+` })
      constraints.push({ normal: n.clone().negate(), d: -CUT_DIST, key: `${k}≥+` })
    } else if (a === -1) {
      bounding.push({ normal: n.clone(), d: -CUT_DIST, key: `${k}=-` })
      constraints.push({ normal: n.clone(), d: -CUT_DIST, key: `${k}≤-` })
    } else {
      // -1/3 ≤ n · p ≤ 1/3: ikkala chegara ham bu piece chegarasi
      // n · p ≤ 1/3 chegarasi (yuqori): { normal: n, d: 1/3 }
      // n · p ≥ -1/3 chegarasi (pastki): { normal: -n, d: 1/3 }
      bounding.push({ normal: n.clone(), d: CUT_DIST, key: `${k}=+` })
      bounding.push({ normal: n.clone().negate(), d: CUT_DIST, key: `${k}=-` })
      constraints.push({ normal: n.clone(), d: CUT_DIST, key: `${k}≤+` })
      constraints.push({ normal: n.clone().negate(), d: CUT_DIST, key: `${k}≤-` })
    }
  }

  return { bounding, constraints }
}

// 3 ta tekislik kesishmasidan nuqta. Agar kesishmaydigan bo'lsa null.
function intersect3(p1: Plane, p2: Plane, p3: Plane): Vector3 | null {
  // Linear system: [n1; n2; n3] * v = [d1, d2, d3]
  const a = p1.normal,
    b = p2.normal,
    c = p3.normal
  const det =
    a.x * (b.y * c.z - b.z * c.y) -
    a.y * (b.x * c.z - b.z * c.x) +
    a.z * (b.x * c.y - b.y * c.x)
  if (Math.abs(det) < EPS) return null
  const inv = 1 / det
  const vx =
    p1.d * (b.y * c.z - b.z * c.y) -
    a.y * (p2.d * c.z - b.z * p3.d) +
    a.z * (p2.d * c.y - b.y * p3.d)
  const vy =
    a.x * (p2.d * c.z - b.z * p3.d) -
    p1.d * (b.x * c.z - b.z * c.x) +
    a.z * (b.x * p3.d - p2.d * c.x)
  const vz =
    a.x * (b.y * p3.d - p2.d * c.y) -
    a.y * (b.x * p3.d - p2.d * c.x) +
    p1.d * (b.x * c.y - b.y * c.x)
  return new Vector3(vx * inv, vy * inv, vz * inv)
}

function satisfiesAll(v: Vector3, constraints: Plane[]): boolean {
  for (const pl of constraints) {
    if (pl.normal.dot(v) - pl.d > EPS) return false
  }
  return true
}

function vectorKey(v: Vector3): string {
  const r = (x: number) => Math.round(x * 1e5) / 1e5
  return `${r(v.x)},${r(v.y)},${r(v.z)}`
}

// Piece vertices: barcha (bounding plane) triplet kesishmalarini hisoblab,
// constraints ichidagilarni qoldiramiz.
function pieceVertices(p: GridPos): Vector3[] {
  const { bounding, constraints } = pieceBoundingPlanes(p)
  const seen = new Map<string, Vector3>()
  for (let i = 0; i < bounding.length; i++) {
    for (let j = i + 1; j < bounding.length; j++) {
      for (let k = j + 1; k < bounding.length; k++) {
        const v = intersect3(bounding[i], bounding[j], bounding[k])
        if (!v) continue
        if (!satisfiesAll(v, constraints)) continue
        const key = vectorKey(v)
        if (!seen.has(key)) seen.set(key, v)
      }
    }
  }
  return [...seen.values()]
}

// Vertexlarni plane bo'yicha guruhlash: vertex tekislikda yotsa, faceiga qo'shamiz.
function vertsOnPlane(verts: Vector3[], plane: Plane): Vector3[] {
  return verts.filter((v) => Math.abs(plane.normal.dot(v) - plane.d) < 1e-4)
}

// Polygon vertexlarini normal atrofida burchak bo'yicha tartiblash (CCW).
function sortPolygon(verts: Vector3[], normal: Vector3): Vector3[] {
  if (verts.length < 3) return verts
  const centroid = new Vector3()
  verts.forEach((v) => centroid.add(v))
  centroid.divideScalar(verts.length)
  // Plane ichida 2D basis qurish
  const n = normal.clone().normalize()
  const tmp = Math.abs(n.x) > 0.5 ? new Vector3(0, 1, 0) : new Vector3(1, 0, 0)
  const u = new Vector3().crossVectors(n, tmp).normalize()
  const v2 = new Vector3().crossVectors(n, u).normalize()
  return [...verts].sort((p, q) => {
    const pa = p.clone().sub(centroid)
    const qa = q.clone().sub(centroid)
    const angP = Math.atan2(pa.dot(v2), pa.dot(u))
    const angQ = Math.atan2(qa.dot(v2), qa.dot(u))
    return angP - angQ
  })
}

// Plane → StickerFace klassifikatsiyasi.
function classifyPlane(plane: Plane): StickerFace {
  // Tashqi kub yuzlari (n · p = 1, n = ±ê_i)
  const n = plane.normal
  if (Math.abs(plane.d - CUBE_HALF) < EPS) {
    if (Math.abs(n.x - 1) < EPS) return '+X'
    if (Math.abs(n.x + 1) < EPS) return '-X'
    if (Math.abs(n.y - 1) < EPS) return '+Y'
    if (Math.abs(n.y + 1) < EPS) return '-Y'
    if (Math.abs(n.z - 1) < EPS) return '+Z'
    if (Math.abs(n.z + 1) < EPS) return '-Z'
  }
  return 'INNER'
}

// Material indeksi: 0=inner, 1=+X, 2=-X, 3=+Y, 4=-Y, 5=+Z, 6=-Z
export const MATERIAL_GROUPS: StickerFace[] = ['INNER', '+X', '-X', '+Y', '-Y', '+Z', '-Z']
const GROUP_INDEX: Record<StickerFace, number> = {
  INNER: 0, '+X': 1, '-X': 2, '+Y': 3, '-Y': 4, '+Z': 5, '-Z': 6,
}

export interface PieceGeometryResult {
  geometry: BufferGeometry
  // Har sticker face uchun trianglular soni (debug uchun)
  faceCounts: Record<StickerFace, number>
}

export function buildPieceGeometry(p: GridPos): PieceGeometryResult {
  const verts = pieceVertices(p)
  const { bounding } = pieceBoundingPlanes(p)

  // Triangulyatsiya va guruhlar
  const positions: number[] = []
  const normals: number[] = []
  type Group = { start: number; count: number; mat: number }
  const groups: Group[] = []
  const faceCounts: Record<StickerFace, number> = {
    INNER: 0, '+X': 0, '-X': 0, '+Y': 0, '-Y': 0, '+Z': 0, '-Z': 0,
  }

  // Har plane uchun: vertexlar uni quradi → polygon → fan triangulation
  for (const plane of bounding) {
    const on = vertsOnPlane(verts, plane)
    if (on.length < 3) continue
    const sorted = sortPolygon(on, plane.normal)
    const sticker = classifyPlane(plane)
    const mat = GROUP_INDEX[sticker]
    const groupStart = positions.length / 3
    // Tashqi normal: plane.normal (already outward for outer faces).
    // Inner faces: plane.normal aslida cubie ichidagi yarim fazoning tashqisiga ishora qiladi.
    const nrm = plane.normal.clone().normalize()
    for (let i = 1; i < sorted.length - 1; i++) {
      const a = sorted[0]
      const b = sorted[i]
      const c = sorted[i + 1]
      positions.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z)
      normals.push(nrm.x, nrm.y, nrm.z, nrm.x, nrm.y, nrm.z, nrm.x, nrm.y, nrm.z)
      faceCounts[sticker]++
    }
    const groupCount = positions.length / 3 - groupStart
    if (groupCount > 0) {
      groups.push({ start: groupStart, count: groupCount, mat })
    }
  }

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3))
  geometry.setAttribute('normal', new BufferAttribute(new Float32Array(normals), 3))
  // Group merge (bir xil mat ketma-ket bo'lsa)
  for (const g of groups) {
    geometry.addGroup(g.start, g.count, g.mat)
  }
  return { geometry, faceCounts }
}
