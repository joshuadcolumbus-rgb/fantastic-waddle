# Animation system

## One master timeline

`src/animations/masterTimeline.ts` builds a single GSAP timeline
(duration normalized to 1) scrubbed by exactly one ScrollTrigger spanning
the whole document. It is the **sole owner** of scene state:

- camera progress along the journey spline (`cam.u`)
- sun/moon position, color, intensity; exposure
- sky gradient, fog color/density, cloud cover, star intensity
- particle weights (pollen ↔ fireflies ↔ butterflies crossfades)
- wind strength, water tint/glint, bloom intensity

Sections never create scene ScrollTriggers. They *register beats*: the
`scene-anchor` snippet stamps `data-beat="<preset-name>"` on the section
root, `measureSceneBeats()` normalizes each anchor's scroll position, and
the timeline lays a tween from each beat to the next across that scroll
span. Colors tween per-channel (`{r,g,b}` objects) so GSAP interpolates
them like any scalar.

Camera segments ease with `sine.inOut` — the walk *settles* at each
chapter — while environment values interpolate linearly; ScrollTrigger's
`scrub: 0.9` adds the physical lag.

**Beat presets** live in `src/animations/presets.ts`: fourteen moods from
`dawn-garden` to `still-water`, each with env targets plus desktop *and
mobile* camera position/look-at. The camera splines (Catmull-Rom, in
`scenes/camera/CameraRig.tsx`) are rebuilt from the beats in DOM order, so
Theme Editor reordering re-authors the walk.

## Section-local DOM choreography

Lightweight, content-only triggers that never touch scene state
(`src/animations/reveals.ts`):

| Attribute | Effect |
| --- | --- |
| `data-reveal="chars"` | SplitText character rise (headlines) |
| `data-reveal="lines"` | masked line-by-line rise (ledes) |
| `data-reveal="mask"`  | clip-path unmask + slow inner scale (media) |
| `data-reveal="fade"`  | rise + fade |
| `data-stagger`        | children rise with stagger (cards, lists) |
| `data-parallax="0.15"`| scrubbed vertical drift |

Initial hidden states are set **by JavaScript only** — no-JS visitors and
crawlers always see full content.

## Smooth scroll

Lenis drives scrolling; GSAP's ticker drives Lenis
(`src/animations/scroll.ts`). ScrollTrigger updates on Lenis' scroll
events, so every scrubbed animation reads the smoothed value. In-page
anchors route through `lenis.scrollTo` and move keyboard focus to the
target.

## Gallery (portfolio journey)

`src/animations/gallery.ts`: the section pins for the track's width;
panels translate horizontally with per-panel `data-depth` parallax.
Click/Enter FLIP-expands the image into a fullscreen `role="dialog"`
viewer (Esc closes, focus restored, Lenis paused).

## Intro overture

`src/animations/intro.ts`: veil dissolve → headline chars → eyebrow/lede/
CTA → breathing scroll hint. Triggered by the WebGL world's first staged
frame (or immediately when WebGL is off), with a 6 s failsafe so the veil
can never strand the page.

## Microinteractions

- `magnetic.ts` — pointer-proximity lean with elastic return
  (`[data-magnetic]`, fine pointers only).
- `cursor.ts` — dot + trailing ring; `[data-cursor="view"]` morphs the
  ring into a labeled "View" lens over portfolio panels. The native cursor
  is never hidden.
- `header.ts` — transparent → frosted glass, hide-on-scroll-down with
  focus-safe return; accessible mobile drawer.

## Reduced motion

`prefers-reduced-motion: reduce` short-circuits in `bootstrap.ts`: no
Lenis, no GSAP reveals, no WebGL download. Content renders immediately
over the static backdrop.
