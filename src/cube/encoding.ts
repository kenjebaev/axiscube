import { solved } from './state'
import type {
  Axis,
  Coord,
  Cubie,
  CubeState,
  Orientation,
  Sign,
} from './types'

// MVP encoding: cubie indekslari (id'ga ko'ra tartiblangan) bo'yicha
// [posX, posY, posZ, oxAxis, oxSign, oyAxis, oySign, ozAxis, ozSign]
// — har cubie uchun 9 ta kichik son. JSON sifatida ixcham, keyin base64url.
// Format soddaroq, lekin URL biroz uzun. Phase 8'da packed binary'ga
// optimizatsiya qilinadi.

function base64UrlEncode(s: string): string {
  if (typeof btoa !== 'undefined') {
    return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  }
  // Node fallback
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const B: any = (globalThis as any).Buffer
  return B.from(s, 'utf8').toString('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlDecode(s: string): string {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4))
  const std = (s + pad).replace(/-/g, '+').replace(/_/g, '/')
  if (typeof atob !== 'undefined') return atob(std)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const B: any = (globalThis as any).Buffer
  return B.from(std, 'base64').toString('utf8')
}

export function encodeState(state: CubeState): string {
  const ordered = [...state.cubies].sort((a, b) => a.id - b.id)
  const data = ordered.map((c) => [
    c.pos[0],
    c.pos[1],
    c.pos[2],
    c.orientation[0][0], c.orientation[0][1],
    c.orientation[1][0], c.orientation[1][1],
    c.orientation[2][0], c.orientation[2][1],
  ])
  return 'v1.' + base64UrlEncode(JSON.stringify(data))
}

export function decodeState(encoded: string): CubeState {
  if (!encoded.startsWith('v1.')) throw new Error('Yaroqsiz encoding versiyasi')
  const json = base64UrlDecode(encoded.slice(3))
  const data = JSON.parse(json) as number[][]
  if (data.length !== 26) throw new Error('Cubie soni 26 emas')
  const base = solved()
  const cubies: Cubie[] = base.cubies.map((c, i) => {
    const d = data[i]
    return {
      ...c,
      pos: [d[0], d[1], d[2]] as readonly [Coord, Coord, Coord],
      orientation: [
        [d[3] as Axis, d[4] as Sign],
        [d[5] as Axis, d[6] as Sign],
        [d[7] as Axis, d[8] as Sign],
      ] as Orientation,
    }
  })
  return { cubies }
}
