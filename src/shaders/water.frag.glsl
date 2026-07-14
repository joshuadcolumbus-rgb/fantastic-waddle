precision highp float;

varying vec3 vWorldPos;
varying vec2 vUv;

uniform float uTime;
uniform vec3 uWaterColor;
uniform vec3 uZenith;
uniform vec3 uHorizon;
uniform vec3 uSunColor;
uniform vec3 uSunDir;
uniform float uGlint;
uniform float uExposure;
uniform vec3 uFogColor;
uniform float uFogDensity;
uniform float uWind;

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

void main() {
  // Two drifting ripple layers perturb an analytic surface normal.
  float speed = 0.35 + uWind * 0.4;
  vec2 p = vWorldPos.xz;
  float r1 = noise2(p * 1.4 + vec2(uTime * 0.06 * speed, uTime * 0.045 * speed));
  float r2 = noise2(p * 3.1 - vec2(uTime * 0.045 * speed, uTime * 0.07 * speed));
  vec2 grad = vec2(r1 - 0.5, r2 - 0.5) * (0.24 + uWind * 0.18);
  vec3 normal = normalize(vec3(grad.x, 1.0, grad.y));

  vec3 viewDir = normalize(cameraPosition - vWorldPos);
  float fresnel = pow(1.0 - clamp(dot(viewDir, normal), 0.0, 1.0), 2.6);

  // Reflected sky: gradient sampled along the bounced ray's elevation.
  vec3 reflected = reflect(-viewDir, normal);
  vec3 skyRefl = mix(uHorizon, uZenith, pow(clamp(reflected.y, 0.0, 1.0), 0.6));

  // Sun / moon glint streak.
  float glint = pow(clamp(dot(reflected, normalize(uSunDir)), 0.0, 1.0), 240.0);
  vec3 color = mix(uWaterColor, skyRefl, clamp(fresnel * 0.85 + 0.12, 0.0, 1.0));
  color += uSunColor * glint * uGlint * 2.2;

  // Soft shore fade using the disc UV radius.
  float shore = smoothstep(1.0, 0.82, length(vUv - 0.5) * 2.0);

  color *= uExposure;
  float depth = gl_FragCoord.z / gl_FragCoord.w;
  float fogFactor = 1.0 - exp(-uFogDensity * uFogDensity * depth * depth);
  color = mix(color, uFogColor * uExposure, clamp(fogFactor, 0.0, 1.0));

  gl_FragColor = vec4(color, shore * 0.96);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
