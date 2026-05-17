import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { Vector3 } from 'three'
import { useCubeStore } from '@/store/cube'
import type { Axis, Face, Move } from '@/cube/types'

interface DragStart {
  startX: number
  startY: number
  cubieCoord: [number, number, number]
  faceAxis: Axis
  faceSign: 1 | -1
}

const PIXEL_THRESHOLD_SQ = 100 // 10px ga teng masofa

const FACE_LETTERS: Record<number, [Face, Face]> = {
  0: ['R', 'L'],
  1: ['U', 'D'],
  2: ['F', 'B'],
}

// Drag controller: cube mesh ustida pointer hodisalarini boshqaradi.
// onPointerDown'da yuz va cubie aniqlanadi; pointerup'da drag yo'nalishi
// bo'yicha yurish chiqariladi.
export function useDragController(): {
  onPointerDown: (e: any) => void // eslint-disable-line @typescript-eslint/no-explicit-any
} {
  const startRef = useRef<DragStart | null>(null)
  const { camera, controls } = useThree() as unknown as {
    camera: { matrix: { extractBasis: (right: Vector3, up: Vector3, dir: Vector3) => void } }
    controls?: { enabled: boolean } | null
  }
  const enqueue = useCubeStore.getState().enqueue

  const onPointerDown = (e: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const store = useCubeStore.getState()
    if (store.current || store.queue.length > 0) return
    if (!e.face || !e.object) return

    // World normal: triangle normalini mesh worldMatrix orqali aylantirib normalize qilamiz
    const worldNormal = e.face.normal.clone().transformDirection(e.object.matrixWorld).normalize() as Vector3

    // Eng yaqin standart o'qqa yumalatish
    const abs = [Math.abs(worldNormal.x), Math.abs(worldNormal.y), Math.abs(worldNormal.z)]
    let maxAxis: Axis = 0
    if (abs[1] > abs[maxAxis]) maxAxis = 1
    if (abs[2] > abs[maxAxis]) maxAxis = 2
    const compVal = maxAxis === 0 ? worldNormal.x : maxAxis === 1 ? worldNormal.y : worldNormal.z
    const sign: 1 | -1 = compVal > 0 ? 1 : -1

    // Cubie pozitsiyasi (yumaltirish)
    const p = e.point.clone() as Vector3
    const cubieCoord: [number, number, number] = [
      Math.max(-1, Math.min(1, Math.round(p.x))),
      Math.max(-1, Math.min(1, Math.round(p.y))),
      Math.max(-1, Math.min(1, Math.round(p.z))),
    ]
    cubieCoord[maxAxis] = sign

    startRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      cubieCoord,
      faceAxis: maxAxis,
      faceSign: sign,
    }
    if (controls) controls.enabled = false
    e.stopPropagation()
  }

  useEffect(() => {
    const handleUp = (e: PointerEvent) => {
      const start = startRef.current
      if (!start) return
      startRef.current = null
      if (controls) controls.enabled = true

      const dx = e.clientX - start.startX
      const dy = e.clientY - start.startY
      if (dx * dx + dy * dy < PIXEL_THRESHOLD_SQ) return

      // Camera basisini olamiz (right va up dunyo koordinatlarida)
      const camRight = new Vector3()
      const camUp = new Vector3()
      camera.matrix.extractBasis(camRight, camUp, new Vector3())

      // Screen drag'ni dunyo bo'yicha taxminan: right * dx + up * (-dy)  (Y screen invertirlangan)
      const worldDrag = new Vector3()
        .addScaledVector(camRight, dx)
        .addScaledVector(camUp, -dy)

      // Face normal yo'nalishi
      const faceNormal = new Vector3()
      const fn: [number, number, number] = [0, 0, 0]
      fn[start.faceAxis] = start.faceSign
      faceNormal.set(fn[0], fn[1], fn[2])

      // Drag'ni yuz tekisligiga proyeksiyalash (face normal komponentini olib tashlash)
      const projected = worldDrag.clone().addScaledVector(faceNormal, -worldDrag.dot(faceNormal))

      // Dominant tangent o'qni topish (face axis bo'lmagan ikkitadan biri)
      const absProj = [Math.abs(projected.x), Math.abs(projected.y), Math.abs(projected.z)]
      absProj[start.faceAxis] = -1
      let dragAxis: Axis = 0
      if (absProj[1] > absProj[dragAxis]) dragAxis = 1
      if (absProj[2] > absProj[dragAxis]) dragAxis = 2
      if (dragAxis === start.faceAxis) return

      const dragComp = dragAxis === 0 ? projected.x : dragAxis === 1 ? projected.y : projected.z
      const dragSign = dragComp > 0 ? 1 : -1

      // Rotation o'qi = 3 - faceAxis - dragAxis
      const rotAxis = (3 - start.faceAxis - dragAxis) as Axis
      const layer = start.cubieCoord[rotAxis]
      if (layer === 0) return // o'rta qatlam — face move emas

      const face: Face = layer > 0 ? FACE_LETTERS[rotAxis][0] : FACE_LETTERS[rotAxis][1]

      // Yurish yo'nalishi (CW vs CCW)
      // Right-hand cross: expectedDrag = rotDir × faceDir → CW yo'nalishi
      // rotDir = layer signli rotAxis o'qi
      // faceDir = face normal (faceSign signli faceAxis o'qi)
      const rotDir = new Vector3()
      const rd: [number, number, number] = [0, 0, 0]
      rd[rotAxis] = layer
      rotDir.set(rd[0], rd[1], rd[2])
      const expectedDrag = new Vector3().crossVectors(rotDir, faceNormal)
      const dragVec = new Vector3()
      const dv: [number, number, number] = [0, 0, 0]
      dv[dragAxis] = dragSign
      dragVec.set(dv[0], dv[1], dv[2])

      const matches = dragVec.dot(expectedDrag) > 0
      const modifier = matches ? '' : ("'" as const)

      const move: Move = { face, modifier }
      enqueue(move)
    }

    window.addEventListener('pointerup', handleUp)
    return () => window.removeEventListener('pointerup', handleUp)
  }, [camera, controls, enqueue])

  return { onPointerDown }
}
