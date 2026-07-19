# Performance

Targets: **60 FPS desktop, 45–60 FPS mobile**. The strategy is budgets +
tiers + a runtime governor — never "hope it's fast enough".

## Hard per-tier budgets

Defined in `src/app/quality.ts` (`BUDGETS`); every scene system builds
against them. Change them there, nowhere else.

| Budget | High | Medium | Low |
| --- | --- | --- | --- |
| Grass instances (3 tris each) | 90,000 | 42,000 | 14,000 |
| Flower instances | 2,400 | 1,200 | 500 |
| Tree/shrub instances | 110 | 70 | 40 |
| Particles (points total) | 3,000 | 1,200 | 400 |
| Shadow map | 2048² | 1024² | off (512² budget reserved) |
| Post FX | bloom + DoF + vignette + ACES | bloom + vignette + ACES | none (renderer ACES) |
| DPR clamp | ≤ 2 | ≤ 1.5 | ≤ 1.25 |
| Visible-triangle envelope | ≤ 200k | ≤ 100k | ≤ 50k |

Grass dominates the triangle count; chunk frustum culling (below) keeps
the *visible* share of the 90k high-tier blades around 35–45%, which lands
the whole frame inside the envelope with terrain (~23k tris high tier),
trees and set pieces included.

## Tier selection

`detectQualityTier()` combines GPU renderer-string heuristics
(`WEBGL_debug_renderer_info`), `deviceMemory`, core count and pointer
type. It guesses slightly optimistic on purpose, because…

## Runtime governor

`scenes/PerfGovernor.tsx` measures real frame rate in 2.5 s windows once
the full world is mounted. Two consecutive windows more than 12 FPS under
target → tier steps down (high → medium → low, never back up), all
budgeted systems rebuild at the smaller counts, and a cooldown prevents
oscillation.

## Draw-call & culling strategy

- Grass: one shared `ShaderMaterial` (single program), one
  `InstancedBufferGeometry` per ~8 m path chunk with a hand-set bounding
  sphere → three.js culls whole chunks; ~20 draw calls worst case.
- Trees: one `InstancedMesh` per variety (3 draws) with a shared
  `onBeforeCompile`d standard material — full PBR + shadows, one program.
- Flowers: one instanced draw. Particles: two `Points` draws + two small
  instanced wing flocks (CPU updates ≤ 17 matrices/frame).
- Set pieces are static meshes; the whole frame sits well under 120 calls
  (high tier ceiling).

## Load strategy

- `app.js` (≈73 kB gz) ships alone: styles, Lenis, GSAP, gates. Time to
  content does not wait for three.js.
- `webgl.js` (≈327 kB gz) is dynamically imported only when WebGL will
  actually run — fallback/reduced-motion visitors never download it
  (asserted by the screenshot suite).
- The world mounts in stages (`loaders/progressiveLoader.ts`): sky+terrain
  on first frame → grass/flowers → trees/water/set pieces → particles+post,
  each step scheduled through `requestIdleCallback`. The veil lifts on
  stage 1, so there is never a blank canvas.
- Fonts are two preloaded variable woff2 files; decoder wasm (DRACO/Basis)
  is fetched only if a compressed asset is ever requested.

## Shadows

One directional light with a 52 m ortho frustum that **follows the
camera** down the walk — a modest map stays sharp because it only ever
covers the visible pocket of garden. Low tier disables shadow maps
entirely.

## Verifying

`npm run screenshots` (with `npm run dev` serving) walks the journey
headless, fails on any console error, asserts the webgl chunk stayed lazy
and that reduced-motion skipped it. For real-device FPS, use the browser
performance HUD against `npm run dev` — SwiftShader numbers in CI are not
representative.
