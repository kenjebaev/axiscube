import { useMemo } from 'react'
import {
  BufferAttribute,
  BufferGeometry,
  DoubleSide,
  Vector3,
} from 'three'
import { CUBE_HALF, CUT_DIST, NX, NY, NZ } from './cutPlanes'

// 6 ta kesim tekisligini kub ichida ko'rsatadi. Har plane uchun
// kub bilan kesishishini hisoblab, polygonni render qiladi.

interface PlaneViz {
  normal: Vector3
  d: number // n · p = d
  color: string
}

const PLANES: PlaneViz[] = [
  { normal: NX, d: CUT_DIST, color: '#ef4444' }, // +nx — qizg'ish
  { normal: NX, d: -CUT_DIST, color: '#7f1d1d' },
  { normal: NY, d: CUT_DIST, color: '#22c55e' }, // +ny — yashil
  { normal: NY, d: -CUT_DIST, color: '#14532d' },
  { normal: NZ, d: CUT_DIST, color: '#3b82f6' }, // +nz — ko'k
  { normal: NZ, d: -CUT_DIST, color: '#1e3a8a' },
]

// Kub yuzlari (n_i, ±1)
const CUBE_FACE_NORMALS: Array<{ axis: number; sign: number }> = [
  { axis: 0, sign: 1 }, { axis: 0, sign: -1 },
  { axis: 1, sign: 1 }, { axis: 1, sign: -1 },
  { axis: 2, sign: 1 }, { axis: 2, sign: -1 },
]

const EPS = 1e-6

// Cramer 3 plane intersection (Vector3 normallari uchun)
function intersect3Planes(
  n1: Vector3, d1: number,
  n2: Vector3, d2: number,
  n3: Vector3, d3: number,
): Vector3 | null {
  const det =
    n1.x * (n2.y * n3.z - n2.z * n3.y) -
    n1.y * (n2.x * n3.z - n2.z * n3.x) +
    n1.z * (n2.x * n3.y - n2.y * n3.x)
  if (Math.abs(det) < EPS) return null
  const inv = 1 / det
  const x =
    d1 * (n2.y * n3.z - n2.z * n3.y) -
    n1.y * (d2 * n3.z - n2.z * d3) +
    n1.z * (d2 * n3.y - n2.y * d3)
  const y =
    n1.x * (d2 * n3.z - n2.z * d3) -
    d1 * (n2.x * n3.z - n2.z * n3.x) +
    n1.z * (n2.x * d3 - d2 * n3.x)
  const z =
    n1.x * (n2.y * d3 - d2 * n3.y) -
    n1.y * (n2.x * d3 - d2 * n3.x) +
    d1 * (n2.x * n3.y - n2.y * n3.x)
  return new Vector3(x * inv, y * inv, z * inv)
}

function planeCubeIntersection(plane: PlaneViz): Vector3[] {
  // Kub 6 yuzi va plane'ni juftlab kesib, kubdagi nuqtalarni topish.
  const verts: Vector3[] = []
  const seen = new Set<string>()
  for (let i = 0; i < CUBE_FACE_NORMALS.length; i++) {
    for (let j = i + 1; j < CUBE_FACE_NORMALS.length; j++) {
      const f1 = CUBE_FACE_NORMALS[i]
      const f2 = CUBE_FACE_NORMALS[j]
      if (f1.axis === f2.axis) continue // parallel yuzlar
      const n1 = new Vector3(); n1.setComponent(f1.axis, f1.sign)
      const n2 = new Vector3(); n2.setComponent(f2.axis, f2.sign)
      const p = intersect3Planes(plane.normal, plane.d, n1, CUBE_HALF, n2, CUBE_HALF)
      if (!p) continue
      // Kub ichida bo'lishi shart
      if (
        Math.abs(p.x) > CUBE_HALF + EPS ||
        Math.abs(p.y) > CUBE_HALF + EPS ||
        Math.abs(p.z) > CUBE_HALF + EPS
      ) continue
      const key = `${p.x.toFixed(5)},${p.y.toFixed(5)},${p.z.toFixed(5)}`
      if (!seen.has(key)) {
        seen.add(key)
        verts.push(p)
      }
    }
  }
  return verts
}

function sortPolygon(verts: Vector3[], normal: Vector3): Vector3[] {
  if (verts.length < 3) return verts
  const c = new Vector3()
  verts.forEach((v) => c.add(v))
  c.divideScalar(verts.length)
  const n = normal.clone().normalize()
  const tmp = Math.abs(n.x) > 0.5 ? new Vector3(0, 1, 0) : new Vector3(1, 0, 0)
  const u = new Vector3().crossVectors(n, tmp).normalize()
  const v = new Vector3().crossVectors(n, u).normalize()
  return [...verts].sort((p, q) => {
    const pa = p.clone().sub(c)
    const qa = q.clone().sub(c)
    return Math.atan2(pa.dot(v), pa.dot(u)) - Math.atan2(qa.dot(v), qa.dot(u))
  })
}

function buildPlaneGeometry(plane: PlaneViz): BufferGeometry {
  const verts = sortPolygon(planeCubeIntersection(plane), plane.normal)
  const positions: number[] = []
  for (let i = 1; i < verts.length - 1; i++) {
    const a = verts[0], b = verts[i], c = verts[i + 1]
    positions.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z)
  }
  const g = new BufferGeometry()
  g.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3))
  g.computeVertexNormals()
  return g
}

export function CutPlanesViz() {
  const geometries = useMemo(() => PLANES.map((p) => ({ plane: p, geometry: buildPlaneGeometry(p) })), [])
  return (
    <group>
      {geometries.map((g, i) => (
        <mesh key={i} geometry={g.geometry}>
          <meshBasicMaterial
            color={g.plane.color}
            transparent
            opacity={0.18}
            side={DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}
