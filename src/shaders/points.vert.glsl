// Shared by pollen and fireflies — behavior differs by uniforms only.
attribute float aSeed;       // 0..1 per particle
attribute float aSize;

uniform float uTime;
uniform float uWind;
uniform float uRise;         // vertical bob amplitude
uniform float uDrift;        // horizontal wander amplitude
uniform float uPixelRatio;

varying float vSeed;
varying float vTwinkle;

void main() {
  vSeed = aSeed;

  vec3 pos = position;
  float t = uTime * (0.4 + aSeed * 0.6);
  pos.x += sin(t * 0.9 + aSeed * 6.283) * uDrift * (0.6 + uWind);
  pos.z += cos(t * 0.7 + aSeed * 12.566) * uDrift * (0.6 + uWind);
  pos.y += sin(t * 1.3 + aSeed * 9.42) * uRise;

  // Blink phase used by fireflies; pollen re-purposes it as glisten.
  vTwinkle = 0.5 + 0.5 * sin(uTime * (1.2 + aSeed * 2.4) + aSeed * 40.0);

  vec4 mvPosition = viewMatrix * vec4(pos, 1.0);
  gl_PointSize = aSize * uPixelRatio * (28.0 / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;
}
