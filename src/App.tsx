import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { AxisCubeMesh } from './three/AxisCubeMesh'
import { ControlPanel } from './components/ControlPanel'
import { ErrorBoundary } from './components/ErrorBoundary'
import { UI } from './content/uz/ui'
import { useUrlSync } from './hooks/useUrlSync'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'

export default function App() {
  useUrlSync()
  useKeyboardShortcuts()
  return (
    <div className="h-screen flex flex-col">
      <header className="border-b border-neutral-800 px-4 sm:px-6 py-3 sm:py-4 flex items-baseline gap-3 flex-wrap">
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">{UI.title}</h1>
        <span className="text-neutral-400 font-normal text-sm sm:text-base">
          — {UI.subtitle}
        </span>
        <span className="ml-auto text-[10px] text-neutral-600 hidden sm:inline">
          Klaviatura: R/L/U/D/F/B · Shift = ' · Space = Aralashtirish · Cmd+Z = Orqaga
        </span>
      </header>
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_340px] overflow-hidden">
        <section className="relative min-h-[50vh] lg:min-h-0">
          <ErrorBoundary>
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
          </ErrorBoundary>
          <div className="absolute bottom-3 left-4 text-[11px] text-neutral-600 pointer-events-none">
            {UI.hints.drag}
          </div>
        </section>
        <aside className="border-t lg:border-t-0 lg:border-l border-neutral-800 p-4 overflow-y-auto max-h-[50vh] lg:max-h-none">
          <ControlPanel />
        </aside>
      </main>
    </div>
  )
}
