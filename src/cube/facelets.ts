import { getCubieAt } from './state'
import type {
  Axis,
  AxisMap,
  CubeState,
  Face,
  GridPos,
  Orientation,
  Sign,
} from './types'

// Facelet harf: oqlar U, qizillar R, va h.k.
export type FaceletChar = 'U' | 'R' | 'F' | 'D' | 'L' | 'B'

function letterForDirection(dir: AxisMap): FaceletChar {
  const [axis, sign] = dir
  if (axis === 0) return sign === 1 ? 'R' : 'L'
  if (axis === 1) return sign === 1 ? 'U' : 'D'
  return sign === 1 ? 'F' : 'B'
}

// Cubie orientation O home ê_i ni s*ê_a ga yuboradi.
// O^-1(worldDir): qaysi home direction world dir bo'lib chiqadi.
function inverseApply(o: Orientation, worldDir: AxisMap): AxisMap {
  const [k, sw] = worldDir
  for (let i: Axis = 0; i < 3; i = (i + 1) as Axis) {
    const [a, si] = o[i]
    if (a === k) return [i, (sw * si) as Sign]
  }
  throw new Error('Yaroqsiz orientation')
}

// Har yuz uchun: normal o'qi, "right" va "up" tangent o'qlari (view'da).
interface FaceLayout {
  normal: AxisMap // tashqi yo'nalish
  right: AxisMap // view'da chap→o'ng (sticker ustun yo'nalishi)
  up: AxisMap // view'da pastdan→tepaga
}

// Konvensiya: URFDLB. Har yuz "view" qoidalari standart cubing layoutiga mos.
// U face: yuqoridan qaralganda. F yuzi pastda ko'rinadi.
// (sticker matritsasi top-bottom va left-right tarzida o'qiladi: index = row*3 + col)
const FACE_LAYOUTS: Record<Face, FaceLayout> = {
  U: { normal: [1, 1],  right: [0, 1],  up: [2, -1] },
  R: { normal: [0, 1],  right: [2, -1], up: [1, 1]  },
  F: { normal: [2, 1],  right: [0, 1],  up: [1, 1]  },
  D: { normal: [1, -1], right: [0, 1],  up: [2, 1]  },
  L: { normal: [0, -1], right: [2, 1],  up: [1, 1]  },
  B: { normal: [2, -1], right: [0, -1], up: [1, 1]  },
}

const FACE_ORDER: ReadonlyArray<Face> = ['U', 'R', 'F', 'D', 'L', 'B']

function buildPos(
  normal: AxisMap,
  right: AxisMap,
  up: AxisMap,
  col: number, // -1, 0, +1
  row: number, // -1, 0, +1 (up direction)
): GridPos {
  const p: [number, number, number] = [0, 0, 0]
  p[normal[0]] = normal[1]
  p[right[0]] = col * right[1]
  p[up[0]] = row * up[1]
  return p as unknown as GridPos
}

// State'ni 54-belgi facelet stringiga aylantiradi: URFDLB tartibida.
// Har yuz: o'qish tartibida (yuqori qator chapdan o'ngga, keyin pastga).
export function toFacelets(state: CubeState): string {
  const chars: string[] = []
  for (const face of FACE_ORDER) {
    const layout = FACE_LAYOUTS[face]
    // top→bottom: row = +1 (yuqori), 0, -1 (pastki)
    for (let r = 1; r >= -1; r--) {
      // left→right: col = -1, 0, +1
      for (let c = -1; c <= 1; c++) {
        const pos = buildPos(layout.normal, layout.right, layout.up, c, r)
        const cubie = getCubieAt(state, pos)
        if (!cubie) throw new Error(`Pozitsiyada cubie topilmadi: ${pos}`)
        const homeDir = inverseApply(cubie.orientation, layout.normal)
        // Sticker rangi cubie HOME pozitsiyasidagi shu home directionda joylashgan stikerga teng.
        // Sanity: cubie.home[homeDir.axis] === homeDir.sign bo'lishi kerak.
        const sticker = letterForDirection(homeDir)
        chars.push(sticker)
      }
    }
  }
  return chars.join('')
}

export { FACE_ORDER as FACELET_FACE_ORDER }
