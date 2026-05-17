import { useMemo, useRef } from 'react'
import { Group } from 'three'
import { useFrame } from '@react-three/fiber'
import { useCubeStore } from '@/store/cube'
import { FACE_INFO } from '@/cube/moves'
import type { Face, Modifier } from '@/cube/types'
import { easeInOutCubic } from '@/lib/easing'
import { CubieMesh } from './CubieMesh'
import { makeMaterials } from './materials'
import { useDragController } from './DragController'

// Yurish burchagi (radian). Konvensiya moves.ts dan: + layer ka CW = -90°, - layer ka CW = +90°.
function moveAngleRad(face: Face, modifier: Modifier): number {
  const { layer } = FACE_INFO[face]
  const baseSign = layer === 1 ? -1 : 1
  if (modifier === '2') return Math.PI
  if (modifier === "'") return -baseSign * (Math.PI / 2)
  return baseSign * (Math.PI / 2)
}

export function AxisCubeMesh() {
  const materials = useMemo(() => makeMaterials(), [])
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
      if (groupRef.current) groupRef.current.rotation.set(0, 0, 0)
      return
    }
    const now = performance.now()
    const tRaw = (now - cur.startedAt) / cur.duration
    const totalAngle = moveAngleRad(cur.move.face, cur.move.modifier)
    const info = FACE_INFO[cur.move.face]
    if (tRaw >= 1) {
      // Snap final state, keyin commit
      if (groupRef.current) {
        groupRef.current.rotation.set(
          info.axis === 0 ? totalAngle : 0,
          info.axis === 1 ? totalAngle : 0,
          info.axis === 2 ? totalAngle : 0,
        )
      }
      useCubeStore.getState().commitCurrent()
      return
    }
    const eased = easeInOutCubic(tRaw)
    const angle = eased * totalAngle
    if (groupRef.current) {
      groupRef.current.rotation.set(
        info.axis === 0 ? angle : 0,
        info.axis === 1 ? angle : 0,
        info.axis === 2 ? angle : 0,
      )
    }
  })

  const { onPointerDown } = useDragController()

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
      {/* axis ishlatilmaydi, lekin TypeScript noUnusedLocals uchun ref qilamiz */}
      <group visible={false} userData={{ axis }} />
    </group>
  )
}
