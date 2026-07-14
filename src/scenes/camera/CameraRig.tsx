import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { CatmullRomCurve3, Vector3 } from 'three';
import { useSceneEnv } from '@/hooks/useSceneEnv';
import { useSceneStore } from '@/stores/sceneStore';
import { BEAT_PRESETS, DEFAULT_BEAT_ORDER } from '@/animations/presets';
import { damp } from '@/utils/math';

/**
 * The walk. Two Catmull-Rom splines (position + look target) are rebuilt
 * from the beats in DOM order — desktop and mobile author their own framing.
 * The master timeline owns progress (cam.u); this rig adds damping, a slow
 * breathing drift, and pointer parallax so the camera always feels alive.
 */
export function CameraRig(): null {
  const { env, cam, pointer } = useSceneEnv();
  const beats = useSceneStore((state) => state.beats);
  const mobile = useSceneStore((state) => state.mobileCamera);

  const { posCurve, lookCurve } = useMemo(() => {
    const names = beats.length >= 2 ? beats.map((b) => b.beat) : DEFAULT_BEAT_ORDER;
    const positions: Vector3[] = [];
    const looks: Vector3[] = [];
    for (const name of names) {
      const preset = BEAT_PRESETS[name];
      if (!preset) continue;
      const pos = mobile && preset.camMobile ? preset.camMobile : preset.cam;
      const look = mobile && preset.lookMobile ? preset.lookMobile : preset.look;
      positions.push(new Vector3(...pos));
      looks.push(new Vector3(...look));
    }
    if (positions.length < 2) {
      positions.push(new Vector3(0, 2.3, 9), new Vector3(0, 2.3, -20));
      looks.push(new Vector3(0, 1.6, -6), new Vector3(0, 1.5, -40));
    }
    return {
      posCurve: new CatmullRomCurve3(positions, false, 'catmullrom', 0.35),
      lookCurve: new CatmullRomCurve3(looks, false, 'catmullrom', 0.35),
    };
  }, [beats, mobile]);

  const smoothU = useRef(0);
  const pos = useRef(new Vector3());
  const look = useRef(new Vector3());
  const parallax = useRef({ x: 0, y: 0 });

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 20);
    smoothU.current = damp(smoothU.current, cam.u, 4.2, dt);
    const u = Math.min(Math.max(smoothU.current, 0), 1);

    posCurve.getPointAt(u, pos.current);
    lookCurve.getPointAt(u, look.current);

    // Breathing drift — barely perceptible, keeps stillness alive.
    const t = state.clock.elapsedTime;
    const drift = env.wind * 0.5 + 0.5;
    pos.current.x += Math.sin(t * 0.21) * 0.11 * drift;
    pos.current.y += Math.sin(t * 0.27 + 1.7) * 0.05 * drift;

    // Pointer parallax (fine pointers write store.pointer; touch stays 0).
    parallax.current.x = damp(parallax.current.x, pointer.x, 2.2, dt);
    parallax.current.y = damp(parallax.current.y, pointer.y, 2.2, dt);
    pos.current.x += parallax.current.x * 0.32;
    pos.current.y += -parallax.current.y * 0.18;
    look.current.x += parallax.current.x * 0.9;
    look.current.y += -parallax.current.y * 0.45;

    state.camera.position.copy(pos.current);
    state.camera.lookAt(look.current);
  });

  return null;
}
