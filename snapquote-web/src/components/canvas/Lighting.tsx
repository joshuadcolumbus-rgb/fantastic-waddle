"use client";

import { Environment, Lightformer } from "@react-three/drei";
import { palette } from "@/lib/palette";

/**
 * All lighting is a procedural environment map built from Lightformers —
 * zero network fetches, no HDRI files. Cool steel key light overhead, warm
 * weld-amber rims low and behind, so bare metal reads cold with hot edges.
 */
export default function Lighting() {
  return (
    <>
      <Environment resolution={256} frames={1}>
        {/* cool steel key, overhead strip */}
        <Lightformer
          form="rect"
          intensity={3}
          color="#dbe4ee"
          position={[0, 6, 2]}
          rotation-x={-Math.PI / 2}
          scale={[9, 6, 1]}
        />
        {/* soft frontal fill from the camera side */}
        <Lightformer
          form="rect"
          intensity={0.9}
          color="#aab4c2"
          position={[0, 1, 9]}
          scale={[10, 4, 1]}
        />
        {/* warm amber rim, low left */}
        <Lightformer
          form="rect"
          intensity={2.2}
          color={palette.amber}
          position={[-6, -2, -3]}
          rotation-y={Math.PI / 2}
          scale={[7, 2.5, 1]}
        />
        {/* faint amber counter-rim, high right */}
        <Lightformer
          form="ring"
          intensity={1.1}
          color={palette.amber}
          position={[7, 3, -4]}
          scale={4}
        />
      </Environment>
      {/* whisper of ambient so shadowed faces never crush to pure black */}
      <ambientLight intensity={0.08} />
    </>
  );
}
