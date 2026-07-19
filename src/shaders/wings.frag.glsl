precision highp float;

varying vec2 vUv;
varying float vPhase;

uniform vec3 uColor;
uniform vec3 uAccent;
uniform float uOpacity;

void main() {
  if (uOpacity < 0.01) discard;

  // Wing pattern: body stripe down the spine, accent tips, soft edges.
  float spine = smoothstep(0.14, 0.0, abs(vUv.x - 0.5));
  float tip = smoothstep(0.55, 0.95, abs(vUv.x - 0.5) * 2.0);
  vec3 color = mix(uColor, uAccent, tip * 0.7);
  color = mix(color, uColor * 0.35, spine);
  color *= 0.85 + 0.15 * vPhase;

  float edge = smoothstep(0.0, 0.06, vUv.x) * smoothstep(1.0, 0.94, vUv.x) *
               smoothstep(0.0, 0.08, vUv.y) * smoothstep(1.0, 0.92, vUv.y);

  gl_FragColor = vec4(color, edge * uOpacity);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
