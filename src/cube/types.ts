// Sof logika: hech qanday three.js yoki react import qilinmaydi.

export type Axis = 0 | 1 | 2 // 0=x, 1=y, 2=z
export type Sign = -1 | 1
export type Coord = -1 | 0 | 1
export type Vec3 = readonly [number, number, number]
export type GridPos = readonly [Coord, Coord, Coord]

// Orientation — signed permutation matrix.
// orientation[i] = [a, s] degani: cubie'ning home +i o'qi
// hozir world frame'da s * ê_a yo'nalishini ko'rsatadi.
export type AxisMap = readonly [Axis, Sign]
export type Orientation = readonly [AxisMap, AxisMap, AxisMap]

export type PieceType = 'corner' | 'edge' | 'center'

export type Face = 'U' | 'D' | 'L' | 'R' | 'F' | 'B'
export type Modifier = '' | "'" | '2'

export interface Move {
  readonly face: Face
  readonly modifier: Modifier
}

export interface Cubie {
  readonly id: number // 0..25, barqaror identitet
  readonly pieceType: PieceType
  readonly home: GridPos // boshlang'ich pozitsiya
  readonly pos: GridPos // joriy pozitsiya
  readonly orientation: Orientation
}

export interface CubeState {
  readonly cubies: ReadonlyArray<Cubie>
}
