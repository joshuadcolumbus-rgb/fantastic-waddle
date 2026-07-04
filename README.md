# fantastic-waddle

## Howard Air & Plumbing — Kinetic Physics Portfolio (Shopify theme)

A minimal, self-contained Shopify theme whose homepage is an interactive Matter.js
physics scene: the brand header, service cards, contact pills, and Google review
cards are rigid bodies you can grab and toss. Built for **Howard Air & Plumbing**
(HVAC · Plumbing · Drain — Phoenix, AZ).

### Structure

- `sections/howard-immersive.liquid` — the current homepage: hyper-immersive
  scroll-driven 3D experience. Markup/CSS shells + unified `HWI_CFG` JSON; all
  logic lives in `assets/hwi-bundle.js`, built from `src/hwi/app.jsx`
  (`npm install && npm run build`).
- `src/hwi/app.jsx` → `assets/hwi-bundle.js` — React Three Fiber scene (emissive
  ring field, god-ray sun, particles) with a cinematic post chain (Bloom, GodRays
  volumetric light, N8AO ambient occlusion, Vignette via postprocessing), GSAP
  ScrollTrigger + Lenis scroll mechanics (scrubbed hero exit, batched reveals,
  parallax review cards, camera dive tied to scroll progress). On mobile /
  coarse pointers the background swaps to a 2.5D touch-parallax layer stack, and
  a watchdog falls back to 2.5D if WebGL fails; `prefers-reduced-motion` gets a
  static layout.
- `sections/howard-physics.liquid` — the earlier physics playground (preserved,
  not referenced by the index template): unified `CFG` JSON
  (business info, theme colors, `physicsBounciness`, `gravityY`, reviews array),
  global CSS utility classes, and one DRY loop that maps every config entry and
  review to a Matter.js body. Matter.js loads from the jsDelivr CDN; no other
  dependencies.
- `layout/theme.liquid`, `templates/index.json`, `config/settings_schema.json`,
  `locales/en.default.json` — minimal valid theme scaffold.

### Features

- Full-bleed 100vw/100vh physics viewport, invisible walls + floor rebuilt on
  window resize so nothing falls out of frame.
- Click/touch drag-and-toss via Matter MouseConstraint; grab and high-velocity
  collision visual states.
- DOM elements track body x/y/θ via CSS transforms (no canvas text, crisp type).
- "Read info" toggle: static overlay with name, phone, email, and CTA for clean
  reading; `prefers-reduced-motion` falls back to a static layout.
- ~20 bodies total (capped for 60fps); review card width scales with text length
  and long reviews are truncated.

### Deploying safely (unpublished theme only)

Never push to the live theme. From this repo root:

```sh
shopify theme push --unpublished --theme "Howard Physics DEV"   # first push
shopify theme dev --theme <DEV_THEME_ID>                        # local preview
```

Both commands target the new unpublished development theme only. Publish is a
deliberate, separate action in the Shopify admin after review.
