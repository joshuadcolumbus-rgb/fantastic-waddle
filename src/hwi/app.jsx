/*
 * Howard Air & Plumbing — scroll-bound 3D monolith scene.
 * R3F canvas in #canvas-container (fixed, z:-1) behind the content,
 * Lenis global smooth scroll wired to GSAP ScrollTrigger, one scrubbed
 * timeline driving the monolith (scale / tilt / emissive → neon yellow).
 * Post FX (bloom + N8AO) disabled under 768px; touch-drag velocity feeds
 * a 2.5D camera parallax on mobile. Built into assets/hwi-bundle.js.
 */
import React, { useMemo, useRef, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom, N8AO, Vignette } from '@react-three/postprocessing';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const S = { p: 0, tvx: 0, tvy: 0 }; // scroll progress + touch-drag velocity
const NEON = () => new THREE.Color((window.HWI_CFG?.theme.primaryColor) || '#FFD200');

/* ---------------- declarative scene ---------------- */

function DataRing({ radius, i }) {
  const m = useRef();
  const gold = useMemo(NEON, []);
  useFrame((st) => {
    const t = st.clock.elapsedTime, mesh = m.current;
    mesh.rotation.z = t * (i ? -0.22 : 0.3); /* horizontal loop */
    mesh.rotation.x = Math.PI / 2 + Math.sin(t * 0.6 + i) * 0.05 + S.p * 0.35;
    mesh.material.emissiveIntensity = 0.5 + S.p * 0.8 + Math.sin(t * 2 + i) * 0.1;
  });
  return (
    <mesh ref={m} position={[0, -0.4 - i * 0.7, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[radius, 0.06 + i * 0.035, 24, 180]} />
      <meshStandardMaterial color="#1c1c19" emissive={gold} emissiveIntensity={0.5} metalness={0.8} roughness={0.25} />
    </mesh>
  );
}

function Particles() {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const a = new Float32Array(1000 * 3);
    for (let i = 0; i < a.length; i++) a[i] = (Math.random() - 0.5) * 44;
    g.setAttribute('position', new THREE.BufferAttribute(a, 3));
    return g;
  }, []);
  const ref = useRef();
  useFrame((st) => { ref.current.rotation.y = st.clock.elapsedTime * 0.014; });
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial color="#8a8471" size={0.05} transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

/* camera rig: scroll descent + pointer drift + touch-drag velocity parallax */
function Rig() {
  useFrame((st) => {
    const p = S.p, cam = st.camera;
    S.tvx *= 0.94; S.tvy *= 0.94;
    cam.position.x += (st.pointer.x * 0.9 + S.tvx - cam.position.x) * 0.06;
    cam.position.y += (-p * 6.5 + st.pointer.y * 0.5 - S.tvy - cam.position.y) * 0.07;
    cam.position.z = 15 - p * 4;
    cam.lookAt(0, -p * 5.6, 0);
    window.__hwiFrames = (window.__hwiFrames || 0) + 1;
    if (window.HWI_DEBUG) {
      window.__hwiInfo = {
        calls: st.gl.info.render.calls, tris: st.gl.info.render.triangles,
        cam: cam.position.toArray().map((n) => +n.toFixed(2))
      };
    }
  });
  return null;
}

/* one dry scrubbed timeline over the whole scroll track */
function ScrollFX({ mono }) {
  useEffect(() => {
    if (!mono) return;
    const c = NEON();
    const tl = gsap.timeline({
      scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: true }
    });
    tl.to(mono.scale, { x: 1.5, y: 1.5, z: 1.5, ease: 'none' }, 0)
      .to(mono.rotation, { x: THREE.MathUtils.degToRad(15), ease: 'none' }, 0)
      .to(mono.material, { emissiveIntensity: 1.05, ease: 'none' }, 0)
      .to(mono.material.emissive, { r: c.r, g: c.g, b: c.b, ease: 'none' }, 0);
    if (window.HWI_DEBUG) window.__hwiTl = tl;
    return () => { tl.scrollTrigger && tl.scrollTrigger.kill(); tl.kill(); };
  }, [mono]);
  return null;
}

const FX = () => window.HWI_FX || 'full'; // debug bisect flag; 'full' in production

function Scene() {
  const [mono, setMono] = useState(null);
  /* heavy post FX only on >=768px screens */
  const [heavy, setHeavy] = useState(() => matchMedia('(min-width: 768px)').matches);
  useEffect(() => {
    const mq = matchMedia('(min-width: 768px)');
    const on = () => setHeavy(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return (
    <>
      <color attach="background" args={['#0c0c0b']} />
      <fogExp2 attach="fog" args={['#0c0c0b', 0.045]} />
      <ambientLight intensity={0.4} />
      <pointLight color={NEON()} intensity={1.2} distance={60} position={[4, 6, 8]} />
      <directionalLight intensity={0.5} position={[-6, 8, 10]} />
      {/* monolith: dark obsidian slab, upright at rest */}
      <mesh ref={setMono} position={[0, -0.5, 0]}>
        <boxGeometry args={[2.6, 5.2, 1.1]} />
        <meshStandardMaterial color="#17171a" roughness={0.92} metalness={0} emissive="#000000" emissiveIntensity={0} />
      </mesh>
      <DataRing radius={4.4} i={0} />
      <DataRing radius={6.2} i={1} />
      <Particles />
      <Rig />
      {mono && <ScrollFX mono={mono} />}
      {heavy && FX() !== 'none' && (
        <EffectComposer multisampling={4}>
          <N8AO aoRadius={2.2} intensity={4} distanceFalloff={2.4} />
          <Bloom mipmapBlur intensity={0.9} luminanceThreshold={0.22} luminanceSmoothing={0.32} />
          <Vignette eskil={false} offset={0.18} darkness={0.78} />
        </EffectComposer>
      )}
    </>
  );
}

function mount3D(host) {
  const root = createRoot(host);
  root.render(
    <Canvas
      dpr={[1, 1.75]}
      gl={{ antialias: false, powerPreference: 'high-performance', preserveDrawingBuffer: !!window.HWI_DEBUG }}
      camera={{ fov: 50, near: 0.1, far: 120, position: [0, 1, 15] }}
    >
      <Scene />
    </Canvas>
  );
  window.__HWI_MODE = '3d';
  return root;
}

/* ------------- 2.5D DOM layers (reduced-motion / WebGL-failure fallback) ------------- */
function mount25D(bg, animate) {
  bg.innerHTML = ['a', 'b', 'glow', 'dots'].map((k) => `<div class="hwi-l25 hwi-l25-${k}"></div>`).join('');
  const layers = Array.from(bg.children);
  let triggers = [];
  if (animate) {
    triggers = layers.map((el, i) =>
      gsap.to(el, { yPercent: -(6 + i * 8), ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.6 } }).scrollTrigger
    );
  }
  window.__HWI_MODE = '25d';
  return () => { triggers.forEach((t) => t && t.kill()); bg.innerHTML = ''; };
}

/* ---------------- config → DOM (single pass, data preserved verbatim) ---------------- */
function renderContent(root) {
  const CFG = window.HWI_CFG;
  const $ = (s) => root.querySelector(s);
  root.style.setProperty('--p', CFG.theme.primaryColor);
  const tel = 'tel:' + CFG.contact.phone.replace(/\D/g, '');
  $('.hwi-nav-brand').textContent = CFG.businessName;
  $('.hwi-nav-phone').textContent = CFG.contact.phone; $('.hwi-nav-phone').href = tel;
  $('.hwi-nav-cta').textContent = CFG.contact.ctaText; $('.hwi-nav-cta').href = tel;
  $('.hwi-kicker').textContent = CFG.businessType + ' — since 1977';
  $('.hwi-title').innerHTML = CFG.businessName.replace('&', '<em>&amp;</em>');
  $('.hwi-tag').textContent = CFG.tagline;
  $('.hwi-area').textContent = CFG.serviceArea;
  $('.hwi-contact-row').innerHTML =
    `<a class="big" href="${tel}">${CFG.contact.ctaText} · ${CFG.contact.phone}</a>` +
    `<a class="ghost" href="mailto:${CFG.contact.email}">${CFG.contact.email}</a>`;
  $('.hwi-services').innerHTML = CFG.services.map((s, i) =>
    `<div class="hwi-svc rv" style="--d:${i * 0.12}s"><h3>${s.name}</h3><p>${s.desc}</p></div>`).join('');
  $('.hwi-grid').innerHTML = CFG.reviews.map((r) =>
    `<article class="hwi-card rv"><em>${'★'.repeat(r.rating)}</em><p>“${r.text}”</p><b>${r.author} — Google</b></article>`).join('');
}

/* ---------------- Lenis global + GSAP ScrollTrigger ---------------- */
function setupScroll(root, reduced) {
  if (!reduced) {
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true, syncTouch: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    window.__hwiLenis = lenis;
  }
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (st) => { S.p = st.progress; } });
  ScrollTrigger.create({ start: 40, end: 'max', toggleClass: { targets: root.querySelector('.hwi-nav'), className: 'on' } });

  if (reduced) {
    gsap.set('.rv', { autoAlpha: 1 });
    return;
  }
  gsap.to('.hwi-hero-inner', {
    autoAlpha: 0, scale: 0.92, yPercent: -8, ease: 'none',
    scrollTrigger: { trigger: '.hwi-hero', start: 'top top', end: 'bottom 35%', scrub: 0.5 }
  });
  ScrollTrigger.batch('.rv', {
    start: 'top 88%', once: true,
    onEnter: (els) => gsap.fromTo(els,
      { autoAlpha: 0, y: 52, scale: 0.97 },
      { autoAlpha: 1, y: 0, scale: 1, duration: 1.05, ease: 'power3.out', stagger: 0.12, overwrite: true })
  });
  gsap.utils.toArray('.hwi-card').forEach((el, i) => {
    gsap.to(el, {
      y: -(28 + (i % 3) * 24), ease: 'none',
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.8 }
    });
  });
}

/* touch-drag velocity → S.tvx/S.tvy for the 2.5D camera parallax */
function trackTouchVelocity() {
  let last = null;
  addEventListener('touchmove', (e) => {
    const t = e.touches[0]; if (!t) return;
    if (last) { S.tvx += (t.clientX - last.x) * 0.02; S.tvy += (t.clientY - last.y) * 0.02; }
    last = { x: t.clientX, y: t.clientY };
  }, { passive: true });
  addEventListener('touchend', () => { last = null; }, { passive: true });
}

/* ---------------- boot ---------------- */
function init() {
  const root = document.getElementById('hwi');
  if (!root || root.dataset.hwiInit || !window.HWI_CFG) return;
  root.dataset.hwiInit = '1';
  renderContent(root);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  setupScroll(root, reduced);
  trackTouchVelocity();

  const host = document.getElementById('canvas-container');
  const bg25 = root.querySelector('#hwi-bg25');
  if (reduced) { mount25D(bg25, false); window.__HWI_MODE = 'static'; return; }

  try {
    window.__hwiFrames = 0;
    let r3f = mount3D(host);
    /* watchdog: if WebGL never produced a frame, fall back to the 2.5D layers */
    setTimeout(() => {
      if (!window.__hwiFrames) { if (r3f) r3f.unmount(); r3f = null; mount25D(bg25, true); }
    }, 1800);
  } catch (e) { mount25D(bg25, true); }
}

if (document.readyState !== 'loading') init();
else addEventListener('DOMContentLoaded', init);
document.addEventListener('shopify:section:load', init);
