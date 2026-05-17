import { useEffect, useMemo, useRef } from 'react'
import { Mesh, Material } from 'three'
import type { Cubie } from '@/cube/types'
import { orientationToQuaternion } from '@/lib/orientation'
import { buildPieceGeometry } from './pieceGeometry'

interface Props {
  cubie: Cubie
  materials: Material[]
}

export function CubieMesh({ cubie, materials }: Props) {
  const geometry = useMemo(() => buildPieceGeometry(cubie.home).geometry, [cubie.home])
  const ref = useRef<Mesh>(null!)

  useEffect(() => {
    if (ref.current) orientationToQuaternion(cubie.orientation, ref.current.quaternion)
  }, [cubie.orientation])

  return <mesh ref={ref} geometry={geometry} material={materials} />
}
