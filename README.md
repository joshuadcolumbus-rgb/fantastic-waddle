# Terra & Stone — immersive Shopify theme

A premium Shopify Online Store 2.0 theme for a luxury landscaping studio.
Scrolling the homepage is a continuous cinematic walk through a procedural
WebGL garden — dawn meadow to firefly-lit midnight pond — while every word,
image and chapter stays merchant-editable in the Theme Editor.

**Stack:** Shopify CLI · Liquid · TypeScript · Vite · React Three Fiber ·
Three.js · GSAP ScrollTrigger · Lenis · GLSL · zustand

## How it works (short version)

Liquid renders all content as accessible, crawlable HTML. One fixed canvas
behind the page renders the garden; each section declares a "scene mood"
(`data-beat`) and a single scrubbed GSAP master timeline interpolates
camera, lighting, atmosphere and particles between the beats in section
order. Weak devices step down through hard performance budgets; reduced
motion or WebGL failure falls back to a static premium page — the three.js
bundle is never even downloaded.

Full detail in [`docs/architecture.md`](docs/architecture.md),
[`docs/animation-system.md`](docs/animation-system.md),
[`docs/performance.md`](docs/performance.md),
[`docs/shopify-integration.md`](docs/shopify-integration.md),
[`docs/shaders.md`](docs/shaders.md),
[`docs/deployment.md`](docs/deployment.md).

## Quick start

```bash
npm install
npm run dev           # standalone harness at :5173 — no store required
npm run build         # bundle src → theme/assets (stable names)
npm run typecheck     # strict tsc
npm run theme:check   # Shopify theme check (clean)
npm run screenshots   # headless journey walk; fails on console errors
```

Against a real store (Shopify CLI is a dev dependency):

```bash
npm run theme:dev     # live preview   (shopify theme dev  --path theme)
npm run theme:push    # deploy         (shopify theme push --path theme)
```

See [`docs/deployment.md`](docs/deployment.md) for the full checklist.

## Repository map

```
theme/      deploy-ready Shopify theme (sections, blocks, templates, assets)
src/        TypeScript/React/GLSL source, bundled into theme/assets
dev/        store-free dev harness + screenshot output
scripts/    asset copy, model optimization (DRACO/meshopt), screenshots
docs/       architecture, animation system, performance, Shopify, shaders, deployment
```

## Homepage journey

Hero → About → Landscape design → Outdoor living → Irrigation & water →
Artificial turf → Lighting → Hardscapes → Commercial → Portfolio →
Testimonials → Process → Service areas → Contact — each a section bound to
a beat of the dawn-to-night walk. Merchants can reorder, remove or repeat
chapters; the camera path and lighting re-choreograph automatically.
