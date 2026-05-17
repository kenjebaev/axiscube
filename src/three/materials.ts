import { MeshStandardMaterial } from 'three'
import { STICKER_COLORS } from './colors'
import { MATERIAL_GROUPS } from './pieceGeometry'

// Material massivi: pieceGeometry'dagi MATERIAL_GROUPS tartibida.
// 0=inner, 1=+X (R), 2=-X (L), 3=+Y (U), 4=-Y (D), 5=+Z (F), 6=-Z (B)

const STICKER_FOR_FACE = {
  INNER: STICKER_COLORS.INNER,
  '+X': STICKER_COLORS.R,
  '-X': STICKER_COLORS.L,
  '+Y': STICKER_COLORS.U,
  '-Y': STICKER_COLORS.D,
  '+Z': STICKER_COLORS.F,
  '-Z': STICKER_COLORS.B,
} as const

export function makeMaterials(): MeshStandardMaterial[] {
  return MATERIAL_GROUPS.map(
    (key) =>
      new MeshStandardMaterial({
        color: STICKER_FOR_FACE[key],
        roughness: 0.5,
        metalness: 0.0,
      }),
  )
}
