import { Matrix3, Vector3 } from 'three'

// Axis Cube — standart 3x3 kesimlari [1,1,1]/√3 body diagonali atrofida 60°
// aylantirilgan. Bu yondashuv:
//   1) 3 ta perpendikulyar kesim juftligini (n^X · n^Y = 0 va h.k.) saqlaydi
//      → 3x3 mexanizmi bilan mos (26 ta harakatlanuvchi piece).
//   2) Body diagonali atrofida 3-fold simmetriya.
//   3) Cut normallari: NX=(2/3,2/3,-1/3), NY=(-1/3,2/3,2/3), NZ=(2/3,-1/3,2/3).
const T = 1 / 3
export const AXIS_ROTATION = new Matrix3().fromArray([
  // Three.js Matrix3.fromArray column-major: arr[col*3 + row]
  2 * T, 2 * T, -1 * T, // column 0 (image of ê_x)
  -1 * T, 2 * T, 2 * T, // column 1 (image of ê_y)
  2 * T, -1 * T, 2 * T, // column 2 (image of ê_z)
])

export const NX = new Vector3(1, 0, 0).applyMatrix3(AXIS_ROTATION)
export const NY = new Vector3(0, 1, 0).applyMatrix3(AXIS_ROTATION)
export const NZ = new Vector3(0, 0, 1).applyMatrix3(AXIS_ROTATION)

// Kesim masofasi: standart 3x3 da kub [-1, 1]^3 ichida ±1/3 da.
// Aylanish normalni saqlagani uchun masofa o'zgarmaydi.
export const CUT_DIST = 1 / 3

// Tashqi kub yarim o'lchami.
export const CUBE_HALF = 1
