varying vec3 vWorldDir;

void main() {
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vWorldDir = normalize(worldPos.xyz - cameraPosition);
  vec4 mvPosition = viewMatrix * worldPos;
  gl_Position = projectionMatrix * mvPosition;
  // Pin the dome to the far plane so it never clips geometry.
  gl_Position.z = gl_Position.w * 0.9999;
}
