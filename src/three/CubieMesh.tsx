import { useEffect, useMemo, useRef } from 'react'
import { EdgesGeometry, Group, Material } from 'three'
import { useThree } from '@react-three/fiber'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2.js'
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry.js'
import type { Cubie } from '@/cube/types'
import { orientationToQuaternion } from '@/lib/orientation'
import { useDebugStore } from '@/store/debug'
import { buildPieceGeometry } from './pieceGeometry'

interface Props {
  cubie: Cubie
  materials: Material[]
}

const EDGE_LINEWIDTH = 2 // pikselda (LineMaterial uchun)

export function CubieMesh({ cubie, materials }: Props) {
  const geometry = useMemo(() => buildPieceGeometry(cubie.home).geometry, [cubie.home])
  const hidePieces = useDebugStore((s) => s.flags.hidePieces)
  const size = useThree((s) => s.size)

  // EdgesGeometry → LineSegmentsGeometry (Line2 oilasi uchun)
  const lineGeometry = useMemo(() => {
    const eg = new EdgesGeometry(geometry, 5)
    const positions = Array.from(eg.attributes.position.array as Float32Array)
    const lsg = new LineSegmentsGeometry()
    lsg.setPositions(positions)
    eg.dispose()
    return lsg
  }, [geometry])

  const lineMaterial = useMemo(
    () =>
      new LineMaterial({
        color: 0x0a0a0a,
        linewidth: EDGE_LINEWIDTH,
        worldUnits: false,
        depthTest: true,
        transparent: false,
      }),
    [],
  )

  const lineSegs = useMemo(
    () => new LineSegments2(lineGeometry, lineMaterial),
    [lineGeometry, lineMaterial],
  )

  // Hide pieces holatida chiziqlarni kulrang qilamiz
  useEffect(() => {
    lineMaterial.color.set(hidePieces ? 0x888888 : 0x0a0a0a)
  }, [hidePieces, lineMaterial])

  // Resolution'ni window o'lchamiga moslab borish (LineMaterial uchun zarur)
  useEffect(() => {
    lineMaterial.resolution.set(size.width, size.height)
  }, [size, lineMaterial])

  const groupRef = useRef<Group>(null!)

  useEffect(() => {
    if (groupRef.current) orientationToQuaternion(cubie.orientation, groupRef.current.quaternion)
  }, [cubie.orientation])

  return (
    <group ref={groupRef}>
      {!hidePieces && <mesh geometry={geometry} material={materials} />}
      {/* Piece chegaralari — Line2 oilasi (haqiqiy yo'g'on chiziq) */}
      <primitive object={lineSegs} />
    </group>
  )
}
