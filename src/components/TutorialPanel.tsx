import { useEffect } from 'react'
import { useCubeStore } from '@/store/cube'
import { TUTORIAL_STAGES } from '@/content/uz/tutorial'

export function TutorialPanel() {
  const tutorial = useCubeStore((s) => s.tutorial)
  const busy = useCubeStore((s) => s.queue.length > 0 || !!s.current)
  const advance = useCubeStore((s) => s.advanceTutorialStage)
  const cancel = useCubeStore((s) => s.cancelTutorial)

  // Bosqich animatsiyasi tugadi-yu, stageDone ni avtomatik belgilab qo'yamiz.
  useEffect(() => {
    if (tutorial && !busy && !tutorial.stageDone) {
      useCubeStore.setState({
        tutorial: { ...tutorial, stageDone: true },
      })
    }
  }, [busy, tutorial])

  if (!tutorial) return null

  const stage = TUTORIAL_STAGES[tutorial.stageIndex] ?? {
    id: `stage-${tutorial.stageIndex}`,
    title: `${tutorial.stageIndex + 1}-bosqich`,
    intro: 'Yechimning bu qismi avtomatik yurishlardan iborat.',
    hint: '',
  }

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-xs text-neutral-500">
          Bosqich {tutorial.stageIndex + 1} / {tutorial.totalStages}
        </div>
        <button
          onClick={cancel}
          className="text-[11px] text-neutral-500 hover:text-neutral-300"
        >
          Yopish
        </button>
      </div>
      <h3 className="text-sm font-semibold text-neutral-100">{stage.title}</h3>
      <p className="text-xs text-neutral-300 leading-relaxed">{stage.intro}</p>
      {stage.hint && (
        <p className="text-[11px] text-neutral-500 leading-relaxed italic">
          Maslahat: {stage.hint}
        </p>
      )}
      <div className="pt-2 flex justify-end">
        <button
          onClick={advance}
          disabled={!tutorial.stageDone}
          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {tutorial.stageIndex + 1 === tutorial.totalStages
            ? 'Yakunlash'
            : 'Davom etish →'}
        </button>
      </div>
    </div>
  )
}
