# Axis Cube

Tony Fisher Axis Cube uchun 3D simulyator, yechuvchi va o'zbekcha darslik.

## Stack

Vite + React 18 + TypeScript + Three.js (react-three-fiber + drei) + Zustand + Tailwind CSS + Vitest.

## Buyruqlar

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # vitest
npm run build
```

## Tuzilma

- `src/cube/` — sof logika (no react, no three): state, moves, scramble, solver, encoding
- `src/three/` — geometriya, animatsiya, drag controller
- `src/components/` — React UI
- `src/store/` — Zustand
- `src/content/uz/` — o'zbekcha matnlar
- `src/test/` — vitest

Reja: `~/.claude/plans/cryptic-cooking-honey.md`
