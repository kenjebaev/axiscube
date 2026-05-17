import { useDebugStore, type DebugFlags } from '@/store/debug'

const LABELS: Record<keyof DebugFlags, { title: string; hint: string }> = {
  cutPlanes: {
    title: 'Kesim tekisliklari',
    hint: "6 ta aylantirilgan kesim tekisligini yarim shaffof ko'rsatadi (qizg'ish=NX, yashil=NY, ko'k=NZ).",
  },
  innerHighlight: {
    title: 'Ichki yuzlarni ajratish',
    hint: "Stikersiz ichki yuzlarni sariq rangga aylantiradi (qaerda bo'shliq borligini ko'rish uchun).",
  },
  hidePieces: {
    title: 'Pieces sirtini yashirish',
    hint: "Faqat chegara chiziqlari ko'rinadi (clean wireframe).",
  },
}

export function DebugPanel() {
  const flags = useDebugStore((s) => s.flags)
  const toggle = useDebugStore((s) => s.toggle)
  const reset = useDebugStore((s) => s.reset)
  const anyOn = Object.values(flags).some(Boolean)

  return (
    <details className="bg-neutral-900 border border-neutral-800 rounded-lg" open={anyOn}>
      <summary className="px-3 py-2 text-xs text-neutral-400 cursor-pointer select-none flex items-center justify-between">
        <span>Debug ko'rinish</span>
        {anyOn && (
          <button
            onClick={(e) => {
              e.preventDefault()
              reset()
            }}
            className="text-[10px] text-neutral-500 hover:text-neutral-300"
          >
            Tiklash
          </button>
        )}
      </summary>
      <div className="px-3 pb-3 space-y-2">
        {(Object.keys(LABELS) as Array<keyof DebugFlags>).map((key) => (
          <label key={key} className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={flags[key]}
              onChange={() => toggle(key)}
              className="mt-0.5 accent-blue-500"
            />
            <div>
              <div className="text-xs text-neutral-200">{LABELS[key].title}</div>
              <div className="text-[10px] text-neutral-500 leading-snug">{LABELS[key].hint}</div>
            </div>
          </label>
        ))}
      </div>
    </details>
  )
}
