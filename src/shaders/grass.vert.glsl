// Per-instance attributes packed by GrassField.
attribute vec3 aOffset;      // world position of the blade root
attribute float aScale;      // blade height multiplier
attribute float aAngle;      // yaw
attribute float aJitter;     // 0..1 color/phase variation

uniform float uTime;
uniform float uWind;

varying float vHeight;       // 0 root → 1 tip
varying float vJitter;
varying vec3 vWorldPos;

void main() {
  vHeight = position.y;
  vJitter = aJitter;

  float c = cos(aAngle);
  float s = sin(aAngle);
  vec3 pos = position;
  pos.xz = mat2(c, -s, s, c) * pos.xz;
  pos *= aScale;

  // Wind: a slow travelling gust wave plus per-blade flutter. Displacement
  // grows with height² so roots stay planted.
  float sway = vHeight * vHeight;
  float gust = sin(uTime * 1.35 + aOffset.x * 0.16 + aOffset.z * 0.23);
  float flutter = sin(uTime * 3.1 + aJitter * 6.283 + aOffset.z * 0.7) * 0.35;
  float bend = (gust + flutter) * uWind * 0.32 * sway;
  pos.x += bend;
  pos.z += bend * 0.6;
  // Blades shorten slightly as they bend — cheap arc-length conservation.
  pos.y *= 1.0 - abs(bend) * 0.22;

  vec3 world = pos + aOffset;
  vWorldPos = world;
  gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
}
