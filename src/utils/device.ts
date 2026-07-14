/** Environment gates — evaluated once at boot, before any heavy code loads. */

export const prefersReducedMotion = (): boolean =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const hasFinePointer = (): boolean => window.matchMedia('(pointer: fine)').matches;

export const isTouchPrimary = (): boolean => window.matchMedia('(pointer: coarse)').matches;

/** Narrow/tall viewports get the dedicated mobile camera spline. */
export const isMobileViewport = (): boolean =>
  window.innerWidth < 820 || window.innerWidth / window.innerHeight < 0.8;

/** Cheap WebGL2 capability probe without keeping a context alive. */
export function webglAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2', { failIfMajorPerformanceCaveat: true });
    if (!gl) return false;
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}

/** Best-effort GPU renderer string for the quality heuristic. */
export function gpuRendererString(): string {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
    if (!gl) return '';
    const info = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = info
      ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL))
      : String(gl.getParameter(gl.RENDERER));
    (gl.getExtension('WEBGL_lose_context') as { loseContext(): void } | null)?.loseContext();
    return renderer;
  } catch {
    return '';
  }
}
