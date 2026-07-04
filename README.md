# Volt — Sparks by Rabbit LLC

A custom-engineered Shopify theme for Sparks by Rabbit LLC — an
owner-operated residential electrical contractor in Scottsdale, Arizona
(Licensed Electrical Contractor — ROC #350139) — built as a premium
industrial SaaS-style dashboard rather than a generic template.

## Architecture

```
layout/theme.liquid          HTML shell: ambient light layer, 3D canvas, header/footer mounts
assets/base.css              Design system: tokens, industrial typography, glass panels, glow forms
assets/neon-ray.js           Scroll engine: orb parallax (passive scroll + rAF lerp) and panel reveals
assets/volt-field.js         Dependency-free 3D particle lattice (perspective-projected canvas)
sections/electrician-*.liquid  Header/drawer, hero + lead form, services grid, gallery, footer
templates/index.json         Home page composition (hero → services → gallery)
templates/404.liquid         Routing guard page
```

## Signature systems

- **Asymmetric grid breakout** — services and gallery use dense CSS grids with
  explicit `grid-column` / `grid-row` span math (`feature` 4×2, `wide` 3×1,
  `tall` 2×2, plus gallery `hero` / `landscape` / `portrait` tiles), producing
  a staggered editorial rhythm instead of uniform card rows. Emphasis is a
  per-block theme-editor setting.
- **Neon Ray lighting** — two fixed orbs (`blur(140px)`, `opacity: 0.12`;
  amber `#f59e0b` and electric teal/blue) drift with scroll velocity via a
  passive listener feeding a single `requestAnimationFrame` lerp loop, so the
  glass panels illuminate from behind as they pass over the light fields.
- **Volt Field** — a Three.js-style point cloud (perspective camera, slow
  rotation, scroll-driven dolly) rendered to a plain 2D canvas: zero external
  libraries, nothing to 404.
- **Industrial typography** — all `h1–h3` forced to
  `uppercase / 0.08em tracking / weight 800`; core section titles carry a
  text-clipped white → platinum-slate (`#ffffff → #94a3b8`) gradient.
- **Glow forms & magnetic drawer** — inputs rest on a 1px
  `rgba(255,255,255,0.08)` hairline and bloom into a pulsing amber halo on
  focus; drawer links glide `translateX(8px)` with an instant amber swap on
  hover, focus, and touch.

All motion respects `prefers-reduced-motion`.
