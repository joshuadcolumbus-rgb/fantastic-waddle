# Shaders

All GLSL lives in `src/shaders/` and is imported as strings via
`vite-plugin-glsl`. Custom `ShaderMaterial`s end their fragment stage with
three's `#include <tonemapping_fragment>` / `#include <colorspace_fragment>`
so they match the PBR materials under ACES tone mapping. Exposure is
applied as a lighting multiplier (`env.exposure` scales sun/hemisphere
intensity and the custom materials' `uExposure`), which keeps all three
post-FX tiers visually consistent.

Every animated uniform is written per-frame from the master timeline's
`env` state — shaders never own time-of-day logic.

## sky.vert / sky.frag — atmosphere dome

Inverted sphere pinned to the far plane. Fragment builds:
- zenith→horizon gradient (`pow(elevation, 0.62)` curve),
- sun disc + wide atmospheric glow around `uSunDir`,
- two drifting fbm cloud layers in a horizon band, masked by `uCloudDensity`,
- hashed-cell stars with per-star twinkle, faded in by `uStarIntensity`.

## grass.vert / grass.frag — instanced meadow

Per-instance attributes: `aOffset` (root position), `aScale`, `aAngle`,
`aJitter`. Vertex: yaw rotation, then wind = travelling gust wave +
per-blade flutter, displacement ∝ height² with cheap arc-length
compensation (blades shorten as they bend). Fragment: root→tip gradient,
smooth world-hash dryness drift, fake root occlusion, sun-wrapped tint,
exp² fog matched to scene fog. Note: `patch` is a reserved GLSL word —
that's why the variable is `dryness`.

## water.vert / water.frag — analytic-reflection ponds

Two drifting value-noise layers perturb the normal; fresnel mixes water
color toward a *sky-gradient sample along the reflected ray* — reads as a
true reflection without a planar-reflection pass (which would render the
90k-blade meadow twice). Sharp `pow(…, 240)` sun/moon glint scaled by
`uGlint`, tight shore fade so the edge reads as a bank. The sky share is
capped (`fresnel * 0.55 + 0.1`, max 0.62) so bright day skies don't wash
the surface to white.

## points.vert / points.frag — pollen & fireflies

One shader, two behaviors by uniform: `uTwinkleMix` 0 = steady glisten
(pollen), 1 = blinking (fireflies). Drift is fully vertex-shader
(sin/cos wander scaled by `uWind`), size attenuates with depth,
additive-blended soft sprites with a hot core. `uOpacity` is the master
timeline's weight — 0 discards.

## flower.vert / flower.frag — instanced blooms

Crossed quads; whole-plant sway from the root (vs. grass's height² bend).
Petal color = mix(`uPetalA`, `uPetalB`) by per-instance jitter above a
stem threshold.

## wings.vert / wings.frag — butterflies & distant birds

Instanced wing pairs; `sign(position.x)` selects the wing and flap rotates
it around the spine (`abs(x)` lift + span foreshortening). Same geometry
serves butterflies (low, small, day) and birds (high, large, dark) via
uniforms. Instance matrices follow CPU Lissajous wander paths — a handful
of instances, negligible cost.

## Injected chunks (onBeforeCompile)

- **Terrain** (`scenes/environment/Terrain.tsx`): `MeshStandardMaterial`
  with `USE_UV` forced; albedo split meadow/stone/basin by the world-mask
  texture, smooth value-noise green drift, cobble variation on the walk.
  Keeps full PBR lighting + shadow receiving.
- **Foliage** (`scenes/trees/Flora.tsx`): height²-weighted sway added
  after `begin_vertex`, phase from `instanceMatrix` translation — one
  material, full shadows, all varieties.
