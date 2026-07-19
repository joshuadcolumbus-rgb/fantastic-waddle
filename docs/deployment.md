# Deployment

## Prerequisites

- Node ≥ 20 (`npm install` pulls Shopify CLI as a dev dependency)
- A Shopify store you can push themes to

## Build & verify

```bash
npm install
npm run build        # bundles src → theme/assets + copies fonts/decoders
npm run typecheck    # tsc --noEmit
npm run theme:check  # Shopify theme check (must be clean)
```

Compiled assets are committed (Shopify has no build step), but always
rebuild before pushing so `theme/assets` matches `src/`.

## Local development

Two loops, use whichever fits the change:

1. **Experience work (no store needed):** `npm run dev` serves
   `dev/index.html` — a harness that mirrors the exact markup the Liquid
   sections emit — with HMR into `src/`. `npm run screenshots` (while the
   dev server runs) captures the journey headless and fails on console
   errors.
2. **Liquid/theme work:** `npm run theme:dev` (wraps
   `shopify theme dev --path theme`) for a live preview against your
   store. Run `npm run build` first so assets exist.

## Pushing to a store

```bash
npm run build
npm run theme:push          # interactive theme selection
# or explicitly:
npx shopify theme push --path theme --store your-store.myshopify.com --unpublished
```

Then in **Online Store → Themes**: preview, and publish when satisfied.

## Post-deploy checklist

- Create the `main-menu` and `footer` navigation menus (header/footer
  link to them).
- Upload real project imagery in the Portfolio journey + chapter sections
  (placeholders render until then).
- Review **Theme settings → Immersive experience** (WebGL on, particles
  on, intensity 1.0 by default) and **Colors / Contact details**.
- Confirm the contact form recipient (Shopify contact forms email the
  store's sender address).

## Adding premium 3D assets later

1. Drop source `.glb`/`.gltf` files in `assets-src/models/`.
2. `npm run assets:models` → DRACO+meshopt-compressed
   `theme/assets/model-<name>.glb`.
3. Load with `loaders/draco.ts` (`loadModel(modelUrl('<name>'))`) — the
   decoders are already hosted in `theme/assets` and fetch on demand.
   KTX2 textures follow the same pattern via `loaders/ktx2.ts`.

## Rollback

Shopify keeps prior theme versions: publish the previous theme from the
admin, or `git revert` + `npm run build` + `theme:push` for asset-level
rollback.
