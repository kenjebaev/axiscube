import { useState } from 'react'
import { useCubeStore, type Speed } from '@/store/cube'
import { parseMove, randomScramble } from '@/cube'
import { UI } from '@/content/uz/ui'
import { MoveList } from './MoveList'

const FACE_GROUPS: Array<{ face: 'U' | 'D' | 'L' | 'R' | 'F' | 'B'; label: string }> = [
  { face: 'U', label: 'Yuqori' },
  { face: 'D', label: 'Past' },
  { face: 'L', label: 'Chap' },
  { face: 'R', label: "O'ng" },
  { face: 'F', label: 'Old' },
  { face: 'B', label: 'Orqa' },
]

const MODS = ['', "'", '2'] as const

const SPEED_LABELS: Record<Speed, string> = {
  slow: UI.controls.speedSlow,
  normal: UI.controls.speedNormal,
  fast: UI.controls.speedFast,
  instant: UI.controls.speedInstant,
}

export function ControlPanel() {
  const enqueue = useCubeStore((s) => s.enqueue)
  const enqueueMany = useCubeStore((s) => s.enqueueMany)
  const reset = useCubeStore((s) => s.reset)
  const speed = useCubeStore((s) => s.speed)
  const setSpeed = useCubeStore((s) => s.setSpeed)
  const solveFromHistory = useCubeStore((s) => s.solveFromHistory)
  const undo = useCubeStore((s) => s.undo)
  const redo = useCubeStore((s) => s.redo)
  const historyLen = useCubeStore((s) => s.history.length)
  const undoLen = useCubeStore((s) => s.undoStack.length)
  const redoLen = useCubeStore((s) => s.redoStack.length)
  const busy = useCubeStore((s) => s.queue.length > 0 || !!s.current)
  const canSolve = historyLen > 0 && !busy
  const canUndo = undoLen > 0 && !busy
  const canRedo = redoLen > 0 && !busy

  const [shareMsg, setShareMsg] = useState<string | null>(null)
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setShareMsg(UI.controls.shareCopied)
    } catch {
      setShareMsg(UI.controls.shareFailed)
    }
    window.setTimeout(() => setShareMsg(null), 2000)
  }

  return (
    <div className="space-y-4 text-sm">
      <div className="space-y-2">
        <button
          onClick={() => enqueueMany(randomScramble(20))}
          disabled={busy}
          className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {UI.controls.scramble}
        </button>
        <button
          onClick={solveFromHistory}
          disabled={!canSolve}
          className="w-full px-3 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          title={
            busy
              ? 'Animatsiya tugagunicha kuting'
              : historyLen === 0
                ? "Avval aralashtirish kerak"
                : `${historyLen} ta yurishni teskari qaytaradi`
          }
        >
          {UI.controls.solve}
        </button>
        <button
          onClick={reset}
          className="w-full px-3 py-2 bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-900 text-neutral-200 rounded transition-colors"
        >
          {UI.controls.reset}
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={undo}
            disabled={!canUndo}
            className="px-2 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title={canUndo ? `${undoLen} ta qadam` : 'Orqaga qaytadigan qadam yo\'q'}
          >
            ← {UI.controls.undo}
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className="px-2 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title={canRedo ? `${redoLen} ta qadam` : 'Oldinga yo\'l yo\'q'}
          >
            {UI.controls.redo} →
          </button>
        </div>
        <button
          onClick={handleShare}
          className="w-full px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-xs transition-colors"
        >
          {shareMsg ?? UI.controls.share}
        </button>
      </div>

      <div>
        <label className="block text-xs text-neutral-400 mb-1">{UI.controls.speed}</label>
        <select
          value={speed}
          onChange={(e) => setSpeed(e.target.value as Speed)}
          className="w-full px-2 py-1.5 bg-neutral-800 border border-neutral-700 rounded text-neutral-100 focus:outline-none focus:border-blue-500"
        >
          {(Object.keys(SPEED_LABELS) as Speed[]).map((s) => (
            <option key={s} value={s}>
              {SPEED_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <div className="text-xs text-neutral-400 mb-2">{UI.controls.moves}</div>
        <div className="grid grid-cols-2 gap-x-2 gap-y-2">
          {FACE_GROUPS.map(({ face, label }) => (
            <div key={face} className="space-y-1">
              <div className="text-[10px] uppercase text-neutral-500 tracking-wide">
                {label}
              </div>
              <div className="grid grid-cols-3 gap-1">
                {MODS.map((m) => (
                  <button
                    key={face + m}
                    onClick={() => enqueue(parseMove(face + m))}
                    className="px-1 py-1.5 bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-900 text-neutral-100 rounded text-xs font-mono transition-colors"
                  >
                    {face}
                    <span className="text-neutral-400">{m}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-3 border-t border-neutral-800">
        <MoveList />
      </div>
      <div className="text-[11px] text-neutral-600 pt-2 border-t border-neutral-800">
        {UI.controls.solverNote}
      </div>
    </div>
  )
}
