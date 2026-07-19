precision highp float;

varying float vSeed;
varying float vTwinkle;

uniform vec3 uColor;
uniform float uOpacity;      // master weight from the timeline (0 hides)
uniform float uTwinkleMix;   // 0 = steady (pollen), 1 = blinking (fireflies)

void main() {
  if (uOpacity < 0.01) discard;

  // Soft round sprite with a hot core.
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv) * 2.0;
  float alpha = smoothstep(1.0, 0.15, d);
  float core = smoothstep(0.5, 0.0, d);

  float blink = mix(1.0, 0.15 + 0.85 * vTwinkle * vTwinkle, uTwinkleMix);
  vec3 color = uColor * (0.7 + core * 1.6);

  gl_FragColor = vec4(color, alpha * uOpacity * blink * (0.55 + vSeed * 0.45));

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
