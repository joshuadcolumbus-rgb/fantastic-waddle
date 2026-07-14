attribute vec3 aOffset;
attribute float aScale;
attribute float aAngle;
attribute float aJitter;

uniform float uTime;
uniform float uWind;

varying vec2 vUv;
varying float vJitter;

void main() {
  vUv = uv;
  vJitter = aJitter;

  float c = cos(aAngle);
  float s = sin(aAngle);
  vec3 pos = position;
  pos.xz = mat2(c, -s, s, c) * pos.xz;
  pos *= aScale;

  // Whole plant sways from the root; the bloom nods a little extra.
  float phase = aOffset.x * 0.3 + aOffset.z * 0.41 + aJitter * 6.283;
  float sway = sin(uTime * 1.7 + phase) * uWind * 0.16 * position.y;
  pos.x += sway;
  pos.z += sway * 0.7;

  gl_Position = projectionMatrix * viewMatrix * vec4(pos + aOffset, 1.0);
}
