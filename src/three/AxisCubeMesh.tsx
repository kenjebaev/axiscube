import { useMemo, useRef } from 'react'
import { Group, Vector3 } from 'three'
import { useFrame } from '@react-three/fiber'
import { useCubeStore } from '@/store/cube'
import { useDebugStore } from '@/store/debug'
import { FACE_INFO } from '@/cube/moves'
import type { Face, Modifier } from '@/cube/types'
import { easeInOutCubic } from '@/lib/easing'
import { CubieMesh } from './CubieMesh'
import { makeMaterials } from './materials'
import { useDragController } from './DragController'
import { CutPlanesViz } from './CutPlanesViz'
import { NX, NY, NZ } from './cutPlanes'

// Yurish burchagi (radian). Konvensiya moves.ts dan: + layer ka CW = -90°, - layer ka CW = +90°.
function moveAngleRad(face: Face, modifier: Modifier): number {
  const { layer } = FACE_INFO[face]
  const baseSign = layer === 1 ? -1 : 1
  if (modifier === '2') return Math.PI
  if (modifier === "'") return -baseSign * (Math.PI / 2)
  return baseSign * (Math.PI / 2)
}

// Label-frame axis (0=x, 1=y, 2=z) → world-frame rotation o'qi (n_X, n_Y, n_Z)
const AXIS_VECTORS: Vector3[] = [NX, NY, NZ]

export function AxisCubeMesh() {
  const innerHighlight = useDebugStore((s) => s.flags.innerHighlight)
  const materials = useMemo(() => makeMaterials(innerHighlight), [innerHighlight])
  const cubies = useCubeStore((s) => s.state.cubies)
  const current = useCubeStore((s) => s.current)

  const { staticCubies, rotatingCubies, axis } = useMemo(() => {
    if (!current) {
      return { staticCubies: cubies, rotatingCubies: [], axis: -1 }
    }
    const info = FACE_INFO[current.move.face]
    const staticC = cubies.filter((c) => c.pos[info.axis] !== info.layer)
    const rotC = cubies.filter((c) => c.pos[info.axis] === info.layer)
    return { staticCubies: staticC, rotatingCubies: rotC, axis: info.axis }
  }, [cubies, current])

  const groupRef = useRef<Group>(null!)

  useFrame(() => {
    const cur = useCubeStore.getState().current
    if (!cur) {
      if (groupRef.current) groupRef.current.quaternion.set(0, 0, 0, 1)
      return
    }
    const now = performance.now()
    const tRaw = (now - cur.startedAt) / cur.duration
    const totalAngle = moveAngleRad(cur.move.face, cur.move.modifier)
    const info = FACE_INFO[cur.move.face]
    const axisVec = AXIS_VECTORS[info.axis]
    if (tRaw >= 1) {
      // Snap final state, keyin commit (world-frame: n_X/n_Y/n_Z atrofida aylanish)
      if (groupRef.current) {
        groupRef.current.quaternion.setFromAxisAngle(axisVec, totalAngle)
      }
      useCubeStore.getState().commitCurrent()
      return
    }
    const eased = easeInOutCubic(tRaw)
    const angle = eased * totalAngle
    if (groupRef.current) {
      groupRef.current.quaternion.setFromAxisAngle(axisVec, angle)
    }
  })

  const { onPointerDown } = useDragController()
  const showCutPlanes = useDebugStore((s) => s.flags.cutPlanes)

  return (
    <group onPointerDown={onPointerDown}>
      {staticCubies.map((c) => (
        <CubieMesh key={c.id} cubie={c} materials={materials} />
      ))}
      <group ref={groupRef}>
        {rotatingCubies.map((c) => (
          <CubieMesh key={c.id} cubie={c} materials={materials} />
        ))}
      </group>
      {showCutPlanes && <CutPlanesViz />}
      {/* axis ishlatilmaydi, lekin TypeScript noUnusedLocals uchun ref qilamiz */}
      <group visible={false} userData={{ axis }} />
    </group>
  )
}
