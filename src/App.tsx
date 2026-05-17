import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { AxisCubeMesh } from './three/AxisCubeMesh'
import { ControlPanel } from './components/ControlPanel'
import { UI } from './content/uz/ui'
import { useUrlSync } from './hooks/useUrlSync'

export default function App() {
  useUrlSync()
  return (
    <div className="h-screen flex flex-col">
      <header className="border-b border-neutral-800 px-6 py-4 flex items-baseline gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">{UI.title}</h1>
        <span className="text-neutral-400 font-normal text-base">— {UI.subtitle}</span>
      </header>
      <main className="flex-1 grid grid-cols-[1fr_340px] overflow-hidden">
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
          <div className="absolute bottom-3 left-4 text-[11px] text-neutral-600 pointer-events-none">
            {UI.hints.drag}
          </div>
        </section>
        <aside className="border-l border-neutral-800 p-4 overflow-y-auto">
          <ControlPanel />
        </aside>
      </main>
    </div>
  )
}
