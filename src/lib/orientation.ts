import { Matrix4, Quaternion } from 'three'
import type { Orientation } from '@/cube/types'
import { AXIS_ROTATION } from '@/three/cutPlanes'

// Orientation O label-frame'da: home ê_i (label) ni s*ê_a (label) ga yuboradi.
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

// Axis Cube uchun: orientation label-frame'da, lekin geometriya world-frame
// (aylantirilgan kesimlar) bo'yicha qurilgan. Bu sababli rendering uchun
// world-frame rotation kerak: M_world = N · M_label · N^(-1)
// N = AXIS_ROTATION (label ê_i ni n_i ga aylantiradi).
const N_MATRIX = new Matrix4().setFromMatrix3(AXIS_ROTATION)
const N_INV_MATRIX = N_MATRIX.clone().invert()
const tmpLabelMatrix = new Matrix4()
const tmpWorldMatrix = new Matrix4()

export function orientationToWorldQuaternion(
  o: Orientation,
  target?: Quaternion,
): Quaternion {
  orientationToMatrix4(o, tmpLabelMatrix)
  tmpWorldMatrix.multiplyMatrices(N_MATRIX, tmpLabelMatrix).multiply(N_INV_MATRIX)
  const q = target ?? new Quaternion()
  return q.setFromRotationMatrix(tmpWorldMatrix)
}
