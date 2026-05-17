import { useCubeStore } from '@/store/cube'
import { formatMove } from '@/cube'

export function MoveList() {
  const queue = useCubeStore((s) => s.queue)
  const current = useCubeStore((s) => s.current)
  const history = useCubeStore((s) => s.history)

  const upcoming = current ? [current.move, ...queue] : queue
  if (upcoming.length === 0 && history.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      {upcoming.length > 0 && (
        <div>
          <div className="text-xs text-neutral-400 mb-2">
            Bajarilayotgan yurishlar <span className="text-neutral-600">({upcoming.length})</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {upcoming.slice(0, 30).map((m, i) => (
              <span
                key={i}
                className={
                  i === 0
                    ? 'px-2 py-0.5 rounded text-xs font-mono bg-blue-600 text-white'
                    : 'px-2 py-0.5 rounded text-xs font-mono bg-neutral-800 text-neutral-300'
                }
              >
                {formatMove(m)}
              </span>
            ))}
            {upcoming.length > 30 && (
              <span className="px-2 py-0.5 text-xs text-neutral-500">
                +{upcoming.length - 30} ko'p
              </span>
            )}
          </div>
        </div>
      )}
      {upcoming.length === 0 && history.length > 0 && (
        <div>
          <div className="text-xs text-neutral-400 mb-2">
            Oxirgi yurishlar <span className="text-neutral-600">({history.length})</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {history.slice(-20).map((m, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded text-xs font-mono bg-neutral-800 text-neutral-400"
              >
                {formatMove(m)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
