import { Matrix4, Quaternion } from 'three'
import type { Orientation } from '@/cube/types'

// Orientation O home ê_i ni s*ê_a ga yuboradi.
// Standart 3x3 matritsa: M[a][i] = s, qolgan elementlari 0.
// Matrix4 column-major: e[col*4 + row]
export function orientationToMatrix4(o: Orientation, target?: Matrix4): Matrix4 {
  const e = new Array<number>(16).fill(0)
  for (let i = 0; i < 3; i++) {
    const [a, s] = o[i]
    e[i * 4 + a] = s
  }
  e[15] = 1
  const m = target ?? new Matrix4()
  return m.fromArray(e)
}

const tmpMatrix = new Matrix4()

export function orientationToQuaternion(o: Orientation, target?: Quaternion): Quaternion {
  orientationToMatrix4(o, tmpMatrix)
  const q = target ?? new Quaternion()
  return q.setFromRotationMatrix(tmpMatrix)
}
