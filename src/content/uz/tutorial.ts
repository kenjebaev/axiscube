// LBL (Layer-By-Layer) yondashuvi bo'yicha o'zbekcha darslik matnlari.
// MVP: yechim 5 ta bo'lakka ajratilib, har biri konseptual bosqichga mos
// matn bilan ko'rsatiladi. To'liq haqiqiy LBL solver kelajakda qo'shiladi.

export interface TutorialStage {
  id: string
  title: string
  intro: string
  hint: string
}

export const TUTORIAL_STAGES: TutorialStage[] = [
  {
    id: 'cross',
    title: '1-bosqich: Pastki xoch',
    intro:
      "Yechishni pastki yuzda xoch hosil qilishdan boshlaymiz. Pastki yuzning markaziy rangi (oq) bo'yicha 4 ta qirra cubie'sini pastga olib boramiz va ularning yon ranglari mos markazlarga to'g'ri kelishini ta'minlaymiz.",
    hint:
      "Klassik LBL'da bu \"oq xoch\" deyiladi. Axis Cube'da xoch shakli ham buralgan ko'rinadi, lekin printsip o'zgarmaydi.",
  },
  {
    id: 'first-layer',
    title: '2-bosqich: Pastki qatlamning burchaklari',
    intro:
      "Endi pastki yuzning 4 ta burchak cubie'sini joyiga qo'yamiz. Har bir burchak uchta rangli yuzdan iborat — oqning ostda bo'lishi va yon ranglari mos markazlarga to'g'ri kelishi kerak.",
    hint:
      "Asosiy algoritm: R U R' U' (sexy move). Bu yurishlar oxirgi qatlamni buzmasdan burchakni joyiga keltiradi.",
  },
  {
    id: 'middle-layer',
    title: "3-bosqich: O'rta qatlam qirralari",
    intro:
      "O'rta qatlamning 4 ta qirra cubie'si pastki qatlamni buzmasdan joyiga qo'yiladi. Har bir qirrani yuqori qatlamdan boshlab tegishli yon yo'lakka kiritamiz.",
    hint:
      "Insert qilish uchun ikki algoritm: o'ngdan (URU'R' U'F'UF) va chapdan (U'L'UL UFU'F').",
  },
  {
    id: 'last-layer-orient',
    title: '4-bosqich: Yuqori yuzni orientatsiya qilish',
    intro:
      "Yuqori qatlamdagi cubie'larning yuqori yuzini sariq rangga aylantiramiz. Avval qirralar (OLL edge), keyin burchaklar (OLL corner).",
    hint:
      "OLL edge: F R U R' U' F'. OLL corner: R U R' U R U2 R'.",
  },
  {
    id: 'last-layer-permute',
    title: '5-bosqich: Yuqori qatlamni joylashtirish',
    intro:
      "Yuqori qatlamning barcha cubie'lari to'g'ri yuzga qaragan. Endi ularni to'g'ri pozitsiyalarga ko'chirib qo'yamiz: avval burchaklarni (PLL corner), keyin qirralarni (PLL edge).",
    hint:
      "Axis Cube'ning o'ziga xosligi: ba'zi markazlar 180° buralgan bo'lishi mumkin — ularni ham to'g'rilash kerak.",
  },
]
