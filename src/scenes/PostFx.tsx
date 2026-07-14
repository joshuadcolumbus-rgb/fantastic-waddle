import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Bloom, DepthOfField, EffectComposer, ToneMapping, Vignette } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import { useQualityTier } from '@/hooks/useQualityTier';
import { useSceneEnv } from '@/hooks/useSceneEnv';

/**
 * Tiered post-processing chain:
 *   full — bloom + depth of field + vignette + ACES tone mapping
 *   lite — bloom + vignette + ACES
 *   none — no composer; the renderer's own ACES tone mapping applies
 *
 * Bloom breathes with the journey (env.bloom rises at dusk/night so lantern
 * glow, fireflies and glints bloom out); exposure is applied through the
 * lighting rig, keeping tone mapping consistent across all three tiers.
 */
export function PostFx(): React.JSX.Element | null {
  const { budget } = useQualityTier();
  const { env } = useSceneEnv();

  const bloomRef = useRef<{ intensity: number } | null>(null);

  useFrame(() => {
    if (bloomRef.current) bloomRef.current.intensity = env.bloom * 1.15;
  });

  if (budget.postFx === 'none') return null;

  return (
    <EffectComposer multisampling={budget.postFx === 'full' ? 4 : 0}>
      {budget.postFx === 'full' ? (
        <DepthOfField focusDistance={0.028} focalLength={0.09} bokehScale={2.4} height={480} />
      ) : (
        <></>
      )}
      <Bloom
        ref={bloomRef}
        intensity={0.6}
        luminanceThreshold={0.82}
        luminanceSmoothing={0.3}
        mipmapBlur
      />
      <Vignette eskil={false} offset={0.18} darkness={0.72} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  );
}
