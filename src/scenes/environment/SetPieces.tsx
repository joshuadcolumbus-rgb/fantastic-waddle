import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Color, Group, MeshStandardMaterial } from 'three';
import { useSceneEnv } from '@/hooks/useSceneEnv';
import { getWorldMask, groundPath, HEDGES, PERGOLA, TERRACE, terrainHeight } from '@/scenes/environment/world';
import { mulberry32 } from '@/utils/math';

/**
 * Built set pieces the journey frames: cedar pergola with lounge, bluestone
 * terrace with a fire bowl, estate hedge geometry, scattered boulders, and
 * path lanterns whose glow follows the night (driven by starIntensity, so
 * they ignite exactly as the sky darkens — the "lighting" chapter's moment).
 */

const wood = new MeshStandardMaterial({ color: new Color('#7a5b40'), roughness: 0.72 });
const woodDark = new MeshStandardMaterial({ color: new Color('#5d4430'), roughness: 0.8 });
const stone = new MeshStandardMaterial({ color: new Color('#8d8779'), roughness: 0.95 });
const bluestone = new MeshStandardMaterial({ color: new Color('#5d6167'), roughness: 0.9 });
const hedge = new MeshStandardMaterial({ color: new Color('#2c4a26'), roughness: 0.98 });
const cushion = new MeshStandardMaterial({ color: new Color('#e4dccb'), roughness: 0.85 });

function Pergola() {
  const y = terrainHeight(PERGOLA.x, PERGOLA.z);
  return (
    <group position={[PERGOLA.x, y, PERGOLA.z]} rotation={[0, PERGOLA.rotation, 0]}>
      {/* posts */}
      {[-2.2, 2.2].map((x) =>
        [-1.8, 1.8].map((z) => (
          <mesh key={`${x}${z}`} material={wood} position={[x, 1.5, z]} castShadow>
            <boxGeometry args={[0.22, 3, 0.22]} />
          </mesh>
        )),
      )}
      {/* beams */}
      {[-1.8, 1.8].map((z) => (
        <mesh key={z} material={woodDark} position={[0, 3.05, z]} castShadow>
          <boxGeometry args={[5.4, 0.18, 0.3]} />
        </mesh>
      ))}
      {/* slat roof */}
      {Array.from({ length: 9 }, (_, i) => (
        <mesh key={i} material={wood} position={[-2.2 + i * 0.55, 3.22, 0]} castShadow>
          <boxGeometry args={[0.12, 0.12, 4.4]} />
        </mesh>
      ))}
      {/* lounge */}
      <mesh material={cushion} position={[-0.8, 0.36, 0.2]} castShadow>
        <boxGeometry args={[1.9, 0.5, 0.9]} />
      </mesh>
      <mesh material={woodDark} position={[0.9, 0.28, -0.6]} castShadow>
        <boxGeometry args={[1.1, 0.34, 1.1]} />
      </mesh>
      {/* deck */}
      <mesh material={bluestone} position={[0, 0.04, 0]} receiveShadow>
        <boxGeometry args={[5.8, 0.1, 4.6]} />
      </mesh>
    </group>
  );
}

function Terrace({ emberIntensity }: { emberIntensity: React.MutableRefObject<number> }) {
  const y = terrainHeight(TERRACE.x, TERRACE.z);
  const ember = useRef<MeshStandardMaterial>(null);

  useFrame((state) => {
    if (ember.current) {
      const flicker = 0.85 + Math.sin(state.clock.elapsedTime * 7.3) * 0.08 + Math.sin(state.clock.elapsedTime * 13.7) * 0.07;
      ember.current.emissiveIntensity = emberIntensity.current * flicker * 3.2;
    }
  });

  return (
    <group position={[TERRACE.x, y, TERRACE.z]}>
      {/* paver field */}
      {Array.from({ length: 14 }, (_, i) => {
        const rng = mulberry32(i * 31 + 7);
        const px = (rng() - 0.5) * 6.5;
        const pz = (rng() - 0.5) * 6.5;
        return (
          <mesh key={i} material={bluestone} position={[px, 0.03, pz]} rotation={[0, rng() * Math.PI, 0]} receiveShadow>
            <cylinderGeometry args={[0.85 + rng() * 0.4, 0.85 + rng() * 0.4, 0.09, 6]} />
          </mesh>
        );
      })}
      {/* fire bowl */}
      <mesh material={stone} position={[0, 0.32, 0]} castShadow>
        <cylinderGeometry args={[0.62, 0.45, 0.5, 18]} />
      </mesh>
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.06, 18]} />
        <meshStandardMaterial ref={ember} color="#31221a" emissive="#ff7d36" emissiveIntensity={0} />
      </mesh>
    </group>
  );
}

function EstateHedges() {
  const y = terrainHeight(HEDGES.x, HEDGES.z);
  return (
    <group position={[HEDGES.x, y, HEDGES.z]} rotation={[0, 0.2, 0]}>
      {[
        [-3.5, 0, 0.9, 4.2],
        [3.5, 0, 0.9, 4.2],
        [0, -2.6, 5.5, 0.9],
        [0, 2.6, 5.5, 0.9],
      ].map(([x, z, w, d], i) => (
        <mesh key={i} material={hedge} position={[x ?? 0, 0.55, z ?? 0]} castShadow receiveShadow>
          <boxGeometry args={[w ?? 1, 1.1, d ?? 1]} />
        </mesh>
      ))}
      {/* specimen topiary spheres */}
      {[-3.5, 3.5].map((x) => (
        <mesh key={x} material={hedge} position={[x, 1.65, 0]} castShadow>
          <sphereGeometry args={[0.55, 12, 10]} />
        </mesh>
      ))}
    </group>
  );
}

function Boulders() {
  const boulders = useMemo(() => {
    const mask = getWorldMask();
    const rng = mulberry32(880011);
    return Array.from({ length: 10 }, () => {
      const z = 16 - rng() * 150;
      const x = (rng() > 0.5 ? 1 : -1) * (3 + rng() * 14);
      return {
        position: [x, terrainHeight(x, z, mask) - 0.15, z] as const,
        scale: [0.5 + rng() * 1.1, 0.35 + rng() * 0.6, 0.5 + rng() * 1.1] as const,
        rotation: rng() * Math.PI,
      };
    });
  }, []);

  return (
    <group>
      {boulders.map((b, i) => (
        <mesh
          key={i}
          material={stone}
          position={[b.position[0], b.position[1], b.position[2]]}
          scale={[b.scale[0], b.scale[1], b.scale[2]]}
          rotation={[0, b.rotation, 0]}
          castShadow
        >
          <icosahedronGeometry args={[1, 1]} />
        </mesh>
      ))}
    </group>
  );
}

const sharedLanternMaterial = new MeshStandardMaterial({
  color: new Color('#2b2317'),
  emissive: new Color('#ffc06a'),
  emissiveIntensity: 0,
});

function Lanterns() {
  const spots = useMemo(() => {
    const mask = getWorldMask();
    const positions: { x: number; y: number; z: number }[] = [];
    const count = 12;
    for (let i = 1; i < count; i++) {
      const p = groundPath.getPointAt(i / count);
      const side = i % 2 === 0 ? 1 : -1;
      const x = p.x + side * 1.7;
      const z = p.z;
      positions.push({ x, y: terrainHeight(x, z, mask), z });
    }
    return positions;
  }, []);

  return (
    <group>
      {spots.map((s, i) => (
        <group key={i} position={[s.x, s.y, s.z]}>
          <mesh material={woodDark} position={[0, 0.35, 0]} castShadow>
            <cylinderGeometry args={[0.035, 0.05, 0.7, 6]} />
          </mesh>
          <mesh material={sharedLanternMaterial} position={[0, 0.76, 0]}>
            <boxGeometry args={[0.16, 0.2, 0.16]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function SetPieces(): React.JSX.Element {
  const { env } = useSceneEnv();
  const group = useRef<Group>(null);
  const glow = useRef(0);
  const ember = useRef(0);

  useFrame(() => {
    // Lanterns + fire ignite as the stars come out.
    glow.current = Math.min(1, env.starIntensity * 1.6 + Math.max(0, -env.sunElevation) * 0.04);
    ember.current = glow.current;
    sharedLanternMaterial.emissiveIntensity = glow.current * 4.2;
  });

  return (
    <group ref={group}>
      <Pergola />
      <Terrace emberIntensity={ember} />
      <EstateHedges />
      <Boulders />
      <Lanterns />
    </group>
  );
}
