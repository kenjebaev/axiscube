import { Matrix3, Vector3 } from 'three'

// Axis Cube — standart 3x3 kesimlari [1,1,1]/√3 body diagonali atrofida 60°
// aylantirilgan. Bu yondashuv:
//   1) 3 ta perpendikulyar kesim juftligini (n^X · n^Y = 0) saqlaydi
//      → 3x3 mexanizmi bilan mos (26 ta harakatlanuvchi piece, hech qanday gap).
//   2) Body diagonali atrofida 3-fold simmetriya.
//   3) Stilized Axis Cube ko'rinishi (har yuzda ~7 sticker; real Axis Cube'ning
//      9 stickerli pattern'iga to'liq mos emas — bu fundamental matematik chegara).
const T = 1 / 3
export const AXIS_ROTATION = new Matrix3().fromArray([
  // Three.js Matrix3.fromArray column-major: arr[col*3 + row]
  2 * T, 2 * T, -1 * T, // column 0 (image of ê_x → NX)
  -1 * T, 2 * T, 2 * T, // column 1 (image of ê_y → NY)
  2 * T, -1 * T, 2 * T, // column 2 (image of ê_z → NZ)
])

export const NX = new Vector3(1, 0, 0).applyMatrix3(AXIS_ROTATION)
export const NY = new Vector3(0, 1, 0).applyMatrix3(AXIS_ROTATION)
export const NZ = new Vector3(0, 0, 1).applyMatrix3(AXIS_ROTATION)

// Kesim masofasi: standart 3x3 da kub [-1, 1]^3 ichida ±1/3 da.
export const CUT_DIST = 1 / 3

// Tashqi kub yarim o'lchami.
export const CUBE_HALF = 1
