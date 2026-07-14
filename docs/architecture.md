# Architecture

Terra & Stone is a Shopify Online Store 2.0 theme with an immersive WebGL
layer. The guiding principle is a strict **two-layer model**:

1. **Content layer (Liquid → DOM).** Every piece of real content — headings,
   copy, images, forms, products — is rendered by Liquid sections as
   semantic, accessible HTML. It works with JavaScript disabled, is fully
   crawlable, and is 100% editable in the Theme Editor.
2. **Experience layer (TypeScript → WebGL/GSAP).** A single fixed-position
   canvas behind the DOM renders a continuous procedural garden. It reads
   its choreography *from* the DOM (`data-scene-anchor` attributes emitted
   by sections) and never owns content.

If the experience layer can't run — reduced motion, WebGL failure, weak
device, merchant toggle — the content layer stands alone over a static
premium backdrop. Nothing is lost but motion.

## Repository layout

```
theme/            Shopify theme root (deploy-ready; run Shopify CLI here)
  assets/         FLAT directory (Shopify constraint). Prefix conventions:
                  app.js/app.css (entry), webgl.js (lazy chunk),
                  font-*.woff2, draco_*/basis_* decoder binaries,
                  model-*.glb / tex-*.ktx2 for future premium assets
  blocks/         Theme blocks (service-card, testimonial, gallery-image,
                  process-step, service-area, stat)
  sections/       Journey sections + header/footer groups + main-* sections
  snippets/       button, section-heading, scene-anchor, canvas-root, icon
  templates/      index.json + full required set incl. customers/
src/              TypeScript source, bundled by Vite into theme/assets
  main.ts         app.js entry — small, immediate (styles, gates, DOM anims)
  webgl.tsx       webgl.js chunk entry — everything three.js lives behind this
  app/            bootstrap (boot order + gates), quality (tier detection)
  animations/     masterTimeline, presets (beats), scroll (Lenis), reveals,
                  gallery, cursor, magnetic, header, intro
  scenes/         R3F world: camera/, environment/, grass/, trees/, water/,
                  sky/, lighting/, particles/, PostFx, PerfGovernor
  shaders/        GLSL (imported via vite-plugin-glsl)
  stores/         zustand sceneStore — the DOM↔WebGL bridge
  hooks/ loaders/ types/ utils/ styles/
dev/              Standalone harness mirroring Liquid markup (no store needed)
scripts/          copy-static-assets, optimize-models, screenshots
```

## The DOM ↔ WebGL contract

- `layout/theme.liquid` emits `#ts-config` (JSON): CDN assets base, merchant
  experience toggles, brand.
- Each section renders `data-scene-anchor data-beat="<preset>"` via the
  `scene-anchor` snippet. The beat is a Theme Editor select ("Scene mood").
- At boot, `utils/dom-data.ts` measures every anchor's normalized scroll
  position; `animations/masterTimeline.ts` lays interpolation tweens between
  consecutive beats; `scenes/camera/CameraRig.tsx` rebuilds its splines from
  the same ordered list. Reordering sections in the editor re-choreographs
  the walk automatically (listeners on `shopify:section:*` events).

## State model (`stores/sceneStore.ts`)

Two kinds of state, deliberately separated:

- **Frame state** (`env`, `cam`, `pointer`): plain mutable objects. GSAP
  writes them every scrolled frame; `useFrame` reads them. Object identity
  never changes → scrolling triggers **zero** React renders.
- **Reactive state** (tier, webglStatus, stage, beats): changes rarely,
  drives mounting/rebuilding via selectors.

## Boot order (`app/bootstrap.ts`)

1. Gates: `prefers-reduced-motion` → static mode; merchant toggle; WebGL2
   capability probe.
2. Lenis + GSAP ticker wiring; DOM choreography (reveals, cursor, magnetic,
   header, gallery).
3. Beat measurement → master timeline.
4. `import('@/webgl')` — the three.js chunk downloads **only** when it will
   actually run. First staged frame lifts the veil and plays the intro; a
   6-second failsafe plays it regardless.

## Error recovery

- `WebGLErrorBoundary` catches render/compile errors → `failWebgl()`.
- `webglcontextlost` (without restore) → `failWebgl()`.
- `failWebgl()` empties the canvas host, sets `html[data-webgl="failed"]`,
  and the CSS fallback backdrop takes over. Content is unaffected.

## Why zustand and no React providers

The original sketch had `providers/QualityProvider` etc.; a single zustand
store covers both the reactive and imperative access patterns (the GSAP
side uses `sceneStore.getState()`), with less indirection and no context
re-render hazards. `hooks/useQualityTier` and `hooks/useSceneEnv` are the
read API components use.
