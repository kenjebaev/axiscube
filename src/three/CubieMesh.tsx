import { useEffect, useMemo, useRef } from 'react'
import { EdgesGeometry, Group, Material } from 'three'
import type { Cubie } from '@/cube/types'
import { orientationToQuaternion } from '@/lib/orientation'
import { useDebugStore } from '@/store/debug'
import { buildPieceGeometry } from './pieceGeometry'

interface Props {
  cubie: Cubie
  materials: Material[]
}

export function CubieMesh({ cubie, materials }: Props) {
  const geometry = useMemo(() => buildPieceGeometry(cubie.home).geometry, [cubie.home])
  const edgesGeometry = useMemo(() => new EdgesGeometry(geometry, 5), [geometry])
  const groupRef = useRef<Group>(null!)
  const hidePieces = useDebugStore((s) => s.flags.hidePieces)

  useEffect(() => {
    if (groupRef.current) orientationToQuaternion(cubie.orientation, groupRef.current.quaternion)
  }, [cubie.orientation])

  return (
    <group ref={groupRef}>
      {!hidePieces && <mesh geometry={geometry} material={materials} />}
      {/* Piece chegaralari har doim ko'rinadi (real kub seam'lariga o'xshash) */}
      <lineSegments geometry={edgesGeometry}>
        <lineBasicMaterial color={hidePieces ? '#888888' : '#0a0a0a'} linewidth={1} />
      </lineSegments>
    </group>
  )
}
