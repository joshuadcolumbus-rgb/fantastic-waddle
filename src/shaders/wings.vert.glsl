// Butterflies / distant birds: instanced pairs of quads flapping around a
// central spine. position.x sign selects the wing; instance matrices are
// updated on the CPU along wander paths (a handful of instances only).
attribute float aPhase;

uniform float uTime;
uniform float uFlapSpeed;

varying vec2 vUv;
varying float vPhase;

void main() {
  vUv = uv;
  vPhase = aPhase;

  vec3 pos = position;
  float flap = sin(uTime * uFlapSpeed + aPhase * 6.283) * 0.95;
  // Rotate each wing up around the body spine — the outer edge lifts most,
  // and the span narrows as the wings raise (cheap rotation approximation).
  pos.y += abs(pos.x) * flap;
  pos.x *= cos(flap * 0.9);

  vec4 world = modelMatrix * instanceMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * viewMatrix * world;
}
