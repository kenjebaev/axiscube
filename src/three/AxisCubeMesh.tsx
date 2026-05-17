import { useMemo } from 'react'
import { allCubiePositions } from '@/cube/state'
import { buildPieceGeometry } from './pieceGeometry'
import { makeMaterials } from './materials'

export function AxisCubeMesh() {
  const { pieces, materials } = useMemo(() => {
    const positions = allCubiePositions()
    const pieces = positions.map((p) => ({
      pos: p,
      geometry: buildPieceGeometry(p).geometry,
    }))
    const materials = makeMaterials()
    return { pieces, materials }
  }, [])

  return (
    <group>
      {pieces.map((piece, i) => (
        <mesh
          key={i}
          geometry={piece.geometry}
          material={materials}
          castShadow
          receiveShadow
        />
      ))}
    </group>
  )
}
