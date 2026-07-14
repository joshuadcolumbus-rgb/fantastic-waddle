# Shopify integration

## Merchant model

Everything user-facing is Theme Editor content. Nothing in the copy,
imagery, palette or journey order is hardcoded.

- **Sections** (add/remove/reorder on the homepage): Immersive hero,
  About, Service chapter (repeatable — one per service), Portfolio
  journey, Testimonials, Process, Service areas, Contact.
- **Theme blocks** (`theme/blocks/`): service-card, testimonial,
  gallery-image (project), process-step, service-area, stat. Sections
  render them with `{% content_for 'blocks' %}`.
- **Scene mood**: every journey section has a "Scene mood" select that
  binds it to a beat of the WebGL walk (dawn garden → … → still-water
  night). Reordering sections re-choreographs the camera and lighting
  automatically.
- **Global settings** (`config/settings_schema.json`): brand colors
  (re-declared as CSS custom properties in `theme.liquid`, so they win
  over the bundled defaults), logo, contact details, social links, and
  the *Immersive experience* panel — WebGL on/off, particles on/off,
  atmosphere intensity. These flow to the runtime through the `#ts-config`
  JSON block.

## Templates

Full required set: `index`, `product`, `collection`, `list-collections`,
`cart`, `page`, `page.contact`, `blog`, `article`, `search`, `404`,
`password`, `gift_card.liquid` and all seven `customers/*` templates.
Commerce pages are functional-minimal by design (this is an
experience-first service business) but share the design system and are
ready to extend.

## Metafields

`gallery-image` blocks are the natural hook for dynamic sources: connect
the image/title/meta settings to a `project` metaobject in the Theme
Editor's dynamic-source picker to drive the portfolio from structured
data. The theme requires no code changes for this.

## Asset pipeline constraints

Shopify's `assets/` directory is **flat** — no subfolders. Conventions
used instead: `font-*.woff2`, `model-*.glb`, `tex-*.ktx2`, canonical
decoder names (`draco_*`, `basis_*` — the loaders resolve them from the
CDN base path injected via `#ts-config.assetsBase`). Build outputs use
stable names (`app.js`, `app.css`, `webgl.js`) so Liquid references never
change; Shopify's CDN handles cache-busting with `?v=` query params.

Because Shopify has no build step, **compiled assets are committed**. Run
`npm run build` before pushing theme changes.

## Theme Editor live-editing

`app/bootstrap.ts` listens for `shopify:section:load / unload / reorder`
and re-runs reveal init, beat measurement and master-timeline construction,
so the immersive layer stays coherent while a merchant edits.

## Checks

`npm run theme:check` (Shopify CLI theme check) passes with zero offenses.
Run it after any Liquid change.
