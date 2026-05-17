import { Matrix3, Vector3 } from 'three'

// Axis Cube cut planes — standart 3x3 kesimlari [1,1,1]/√3 body diagonali atrofida
// 60° aylantirilgan. Natijada kesim normal vektorlari (2/3, 2/3, -1/3) kabi qiymatlar oladi.

// Aylanish matritsasi: 60° about (1,1,1)/√3
// R = (1/3) * [[2, -1, 2], [2, 2, -1], [-1, 2, 2]]
const T = 1 / 3
export const AXIS_ROTATION = new Matrix3().fromArray([
  // Three.js Matrix3.fromArray column-major formatda kutadi
  2 * T, 2 * T, -1 * T, // column 0
  -1 * T, 2 * T, 2 * T, // column 1
  2 * T, -1 * T, 2 * T, // column 2
])

// Aylantirilgan kesim normal vektorlari (asl ±X, ±Y, ±Z normallaridan).
export const NX = new Vector3(1, 0, 0).applyMatrix3(AXIS_ROTATION)
export const NY = new Vector3(0, 1, 0).applyMatrix3(AXIS_ROTATION)
export const NZ = new Vector3(0, 0, 1).applyMatrix3(AXIS_ROTATION)

// Cubie pozitsiyasi (a, b, c) bilan p nuqtasi ichida bo'lishi shartlari.
// Standart 3x3 da chegara qiymati 1/3 (kub [-1, 1]^3 ichida).
export const CUT_DIST = 1 / 3

// Tashqi kub yarim o'lchami.
export const CUBE_HALF = 1
