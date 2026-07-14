import { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { ACESFilmicToneMapping } from 'three';
import { failWebgl } from '@/app/bootstrap';
import { useQualityTier } from '@/hooks/useQualityTier';
import { LandscapeScene } from '@/scenes/LandscapeScene';
import { useSceneStore } from '@/stores/sceneStore';
import { WebGLErrorBoundary } from '@/components/WebGLErrorBoundary';
import { BEAT_PRESETS } from '@/animations/presets';

/**
 * The single persistent canvas, fixed behind the DOM content (the host
 * element is styled in CSS; pointer events pass straight through). One
 * WebGL context for the entire journey — sections never own canvases.
 */
export function CanvasRoot(): React.JSX.Element {
  const { budget, tier } = useQualityTier();
  const setWebglStatus = useSceneStore((state) => state.setWebglStatus);

  useEffect(() => {
    setWebglStatus('running');
  }, [setWebglStatus]);

  const first = Object.values(BEAT_PRESETS)[0];
  const initialCam = first?.cam ?? [0, 2.3, 9];

  return (
    <WebGLErrorBoundary>
      <Canvas
        dpr={[1, budget.maxDpr]}
        shadows={tier !== 'low'}
        gl={{
          antialias: budget.antialias,
          powerPreference: 'high-performance',
          alpha: false,
          stencil: false,
        }}
        camera={{ fov: 42, near: 0.1, far: 420, position: initialCam }}
        style={{ pointerEvents: 'none' }}
        onCreated={({ gl }) => {
          gl.toneMapping = ACESFilmicToneMapping;
          gl.toneMappingExposure = 1;
          gl.domElement.addEventListener(
            'webglcontextlost',
            (event) => {
              event.preventDefault();
              failWebgl();
            },
            { once: true },
          );
        }}
      >
        <Suspense fallback={null}>
          <LandscapeScene />
        </Suspense>
      </Canvas>
    </WebGLErrorBoundary>
  );
}
