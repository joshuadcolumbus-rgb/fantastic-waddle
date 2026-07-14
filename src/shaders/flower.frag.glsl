precision highp float;

varying vec2 vUv;
varying float vJitter;

uniform vec3 uStem;
uniform vec3 uPetalA;
uniform vec3 uPetalB;
uniform float uExposure;
uniform vec3 uFogColor;
uniform float uFogDensity;

void main() {
  // Lower quad = stem/leaf green; upper = bloom, blended per plant.
  vec3 petal = mix(uPetalA, uPetalB, vJitter);
  float bloom = smoothstep(0.55, 0.72, vUv.y);
  vec3 color = mix(uStem, petal, bloom);
  color *= 0.8 + 0.2 * vUv.y;
  color *= uExposure;

  float depth = gl_FragCoord.z / gl_FragCoord.w;
  float fogFactor = 1.0 - exp(-uFogDensity * uFogDensity * depth * depth);
  color = mix(color, uFogColor * uExposure, clamp(fogFactor, 0.0, 1.0));

  gl_FragColor = vec4(color, 1.0);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
