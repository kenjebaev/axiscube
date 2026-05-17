import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { AxisCubeMesh } from './three/AxisCubeMesh'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-neutral-800 px-6 py-4">
        <h1 className="text-2xl font-semibold tracking-tight">
          Axis Cube
          <span className="ml-2 text-neutral-400 font-normal text-base">
            — simulyator va o'rgatuvchi
          </span>
        </h1>
      </header>
      <main className="flex-1 grid grid-cols-[1fr_320px]">
        <section className="relative">
          <Canvas camera={{ position: [4, 4, 6], fov: 45 }} shadows>
            <color attach="background" args={['#0a0a0a']} />
            <ambientLight intensity={0.45} />
            <directionalLight
              position={[5, 8, 5]}
              intensity={1.1}
              castShadow
              shadow-mapSize-width={1024}
              shadow-mapSize-height={1024}
            />
            <directionalLight position={[-4, 3, -5]} intensity={0.35} />
            <AxisCubeMesh />
            <OrbitControls enableDamping dampingFactor={0.08} />
          </Canvas>
        </section>
        <aside className="border-l border-neutral-800 p-4 space-y-3">
          <h2 className="text-sm font-medium text-neutral-300">Boshqaruv paneli</h2>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Hozircha solved holatdagi Axis Cube ko'rsatilmoqda. Scramble va solver
            keyingi bosqichlarda qo'shiladi.
          </p>
          <div className="text-[11px] text-neutral-600 pt-2 border-t border-neutral-800">
            Sichqoncha bilan kameraga aylantirib ko'ring.
          </div>
        </aside>
      </main>
    </div>
  )
}
