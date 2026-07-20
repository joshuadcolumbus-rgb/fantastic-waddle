"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { scrollState } from "@/lib/scroll";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Camera flight path over the full narrative: hold wide → dive through the
// manifold center → pull back as the grid snaps → settle framing the invoice
// and its fanned panes.
const CAM_PATH = new THREE.CatmullRomCurve3(
  [
    new THREE.Vector3(0, 0.5, 14),
    new THREE.Vector3(0.35, 0.25, 9.5),
    new THREE.Vector3(-0.3, -0.1, 3.4),
    new THREE.Vector3(0.5, 0.35, 6.8),
    new THREE.Vector3(0, 0.2, 7.4),
    new THREE.Vector3(0, 0.05, 9.0),
  ],
  false,
  "catmullrom",
  0.6,
);

const LOOK_CHAOS = new THREE.Vector3(0, 0, 0);
const LOOK_INVOICE = new THREE.Vector3(0, 0.05, 0.9);

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

// Reduced motion: no scrubbing — snap to one representative state per beat.
function quantizeToBeat(p: number) {
  if (p < 0.25) return 0.05; // chaos manifold, wide
  if (p < 0.55) return 0.6; // grid snapped, invoice materialized
  if (p < 0.8) return 0.8; // fracture underway
  return 1; // panes fanned
}

/**
 * The single source of truth for scroll: one master ScrollTrigger spanning
 * the whole page writes raw progress into scrollState; useFrame damps it and
 * drives the camera. Everything else in the canvas reads scrollState.smooth.
 */
export default function ScrollManager() {
  const camera = useThree((state) => state.camera);
  const pos = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(), []);

  useGSAP(() => {
    ScrollTrigger.create({
      trigger: document.body,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        scrollState.progress = self.progress;
      },
    });
    // The canvas mounts client-only after the sections lay out — re-measure.
    requestAnimationFrame(() => ScrollTrigger.refresh());
  });

  useFrame(({ clock }, delta) => {
    if (scrollState.reducedMotion) {
      scrollState.smooth = quantizeToBeat(scrollState.progress);
    } else {
      // Frame-rate-independent damping on top of Lenis smoothing. The heavy
      // time constant (~95% caught up in 1.2s) is the 3D rig's equivalent of
      // scrub: 1.2 — camera and morph carry inertia through fast flicks,
      // matching the HTML sections' scrub: 1 catch-up.
      scrollState.smooth +=
        (scrollState.progress - scrollState.smooth) *
        (1 - Math.pow(0.08, delta));
    }

    const p = scrollState.smooth;
    CAM_PATH.getPoint(p, pos);
    if (!scrollState.reducedMotion) {
      // Subtle handheld sway, fading as the scene resolves into order.
      const t = clock.elapsedTime;
      pos.x += Math.sin(t * 0.4) * 0.06 * (1 - p * 0.6);
      pos.y += Math.cos(t * 0.31) * 0.04 * (1 - p * 0.6);
    }
    camera.position.copy(pos);

    look.lerpVectors(LOOK_CHAOS, LOOK_INVOICE, clamp01((p - 0.5) / 0.3));
    camera.lookAt(look);
  });

  return null;
}
