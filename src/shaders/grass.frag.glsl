precision highp float;

varying float vHeight;
varying float vJitter;
varying vec3 vWorldPos;

uniform vec3 uBaseColor;     // root green
uniform vec3 uTipColor;      // sunlit tip green
uniform vec3 uDryColor;      // warm meadow accent
uniform vec3 uSunColor;
uniform vec3 uSunDir;
uniform float uSunIntensity;
uniform float uExposure;
uniform vec3 uFogColor;
uniform float uFogDensity;

void main() {
  // Root→tip gradient with per-blade jitter and dry warm patches driven by
  // a large-scale world hash, echoing a real meadow's color drift.
  vec3 color = mix(uBaseColor, uTipColor, smoothstep(0.05, 0.95, vHeight));
  float patch = fract(sin(dot(floor(vWorldPos.xz * 0.22), vec2(127.1, 311.7))) * 43758.5453);
  color = mix(color, uDryColor, patch * 0.28 * vHeight);
  color *= 0.92 + vJitter * 0.16;

  // Fake occlusion at the root, sun wrap at the tip.
  color *= 0.55 + 0.45 * vHeight;
  float sunWrap = clamp(uSunDir.y, 0.0, 1.0) * 0.35 + 0.65;
  color *= uSunColor * uSunIntensity * sunWrap * 0.9 + vec3(0.12);
  color *= uExposure;

  // Exponential-squared fog, matched to the scene fog.
  float depth = gl_FragCoord.z / gl_FragCoord.w;
  float fogFactor = 1.0 - exp(-uFogDensity * uFogDensity * depth * depth);
  color = mix(color, uFogColor * uExposure, clamp(fogFactor, 0.0, 1.0));

  gl_FragColor = vec4(color, 1.0);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
