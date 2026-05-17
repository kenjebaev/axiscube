import { create } from 'zustand'

export interface DebugFlags {
  cutPlanes: boolean // 6 ta kesim tekisligini ko'rsatish
  innerHighlight: boolean // ichki yuzlarni ajratib ko'rsatish (sariq)
  hidePieces: boolean // pieces'larni butunlay yashirish (faqat kesim tekisliklari ko'rinsin)
}

interface DebugStore {
  flags: DebugFlags
  toggle: (key: keyof DebugFlags) => void
  reset: () => void
}

const DEFAULT_FLAGS: DebugFlags = {
  cutPlanes: false,
  innerHighlight: false,
  hidePieces: false,
}

export const useDebugStore = create<DebugStore>((set) => ({
  flags: DEFAULT_FLAGS,
  toggle: (key) =>
    set((s) => ({ flags: { ...s.flags, [key]: !s.flags[key] } })),
  reset: () => set({ flags: DEFAULT_FLAGS }),
}))
