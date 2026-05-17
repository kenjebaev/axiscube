// Standart Rubik rang palitrasi (WCA western scheme).
// U=oq, D=sariq, R=qizil, L=zarg'aldoq, F=yashil, B=ko'k.

export const STICKER_COLORS = {
  U: '#f8fafc', // oq
  D: '#facc15', // sariq
  R: '#ef4444', // qizil
  L: '#f97316', // zarg'aldoq
  F: '#22c55e', // yashil
  B: '#3b82f6', // ko'k
  INNER: '#1f1f1f',
} as const

export type StickerKey = keyof typeof STICKER_COLORS
