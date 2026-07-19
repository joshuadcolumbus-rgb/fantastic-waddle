precision highp float;

varying vec3 vWorldDir;

uniform vec3 uZenith;
uniform vec3 uHorizon;
uniform vec3 uSunDir;
uniform vec3 uSunColor;
uniform float uSunGlow;
uniform float uStarIntensity;
uniform float uCloudDensity;
uniform float uExposure;
uniform float uTime;

float hash21(vec2 p) {
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}

float noise2(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x),
             mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise2(p);
    p *= 2.03;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec3 dir = normalize(vWorldDir);
  float elevation = max(dir.y, 0.0);

  // Base gradient — horizon warmth rising into zenith.
  vec3 sky = mix(uHorizon, uZenith, pow(elevation, 0.62));

  // Sun disc + atmospheric glow.
  float sunDot = clamp(dot(dir, normalize(uSunDir)), 0.0, 1.0);
  float glow = pow(sunDot, 18.0) * uSunGlow;
  float disc = smoothstep(0.9994, 0.9999, sunDot);
  sky += uSunColor * (glow * 0.55 + disc * 2.4);

  // Procedural clouds: two slow fbm layers in a horizon band.
  if (uCloudDensity > 0.005 && dir.y > 0.02) {
    vec2 cuv = dir.xz / (dir.y + 0.18);
    float clouds = fbm(cuv * 0.85 + vec2(uTime * 0.006, uTime * 0.0023));
    clouds += 0.5 * fbm(cuv * 2.1 - vec2(uTime * 0.004, 0.0));
    float mask = smoothstep(0.62, 0.95, clouds * uCloudDensity * 1.6);
    mask *= smoothstep(0.02, 0.16, dir.y) * (1.0 - smoothstep(0.5, 0.95, dir.y));
    vec3 cloudColor = mix(uHorizon * 1.06, uSunColor, glow * 0.5) * (0.75 + 0.25 * clouds);
    sky = mix(sky, cloudColor, mask * 0.8);
  }

  // Stars: hashed cells, gentle twinkle, upper hemisphere, hidden by clouds.
  if (uStarIntensity > 0.003 && dir.y > 0.05) {
    vec2 grid = dir.xz / (dir.y + 0.4) * 90.0;
    vec2 cell = floor(grid);
    float star = hash21(cell);
    if (star > 0.985) {
      vec2 center = cell + vec2(hash21(cell + 7.1), hash21(cell + 3.7));
      float d = length(grid - center);
      float twinkle = 0.72 + 0.28 * sin(uTime * (1.5 + star * 3.0) + star * 40.0);
      float brightness = smoothstep(0.24, 0.0, d) * twinkle;
      sky += vec3(0.92, 0.95, 1.0) * brightness * uStarIntensity * smoothstep(0.05, 0.3, dir.y);
    }
  }

  gl_FragColor = vec4(sky * uExposure, 1.0);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
