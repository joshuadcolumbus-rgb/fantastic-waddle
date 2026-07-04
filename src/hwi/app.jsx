/*
 * Howard Air & Plumbing — hyper-immersive scroll-driven 3D experience.
 * React Three Fiber scene (bloom + god rays + N8AO) behind the content,
 * GSAP ScrollTrigger + Lenis for scroll mechanics, 2.5D parallax on mobile.
 * Bundled by esbuild into assets/hwi-bundle.js (see package.json "build").
 */
import React, { useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom, GodRays, N8AO, Vignette } from '@react-three/postprocessing';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const CFG = window.HWI_CFG;
const S = { p: 0 }; // scroll progress shared with the render loop

/* ---------------- 3D scene ---------------- */
const GOLD = new THREE.Color(CFG.theme.primaryColor);

function Ring({ radius, tube, i }) {
  const m = useRef();
  useFrame((st) => {
    const t = st.clock.elapsedTime * 0.22, p = S.p, mesh = m.current;
    mesh.rotation.z = t * (i % 2 ? -1 : 1) * (0.5 + i * 0.2);
    mesh.rotation.x = Math.PI / 2.15 + Math.sin(t * 2 + i) * 0.06 + p * 0.55;
    mesh.scale.setScalar(1 + Math.sin(t * 3 + i * 2) * 0.045 + p * (i + 1) * 0.09);
    mesh.material.emissiveIntensity = 0.55 + p * 0.9 + Math.sin(t * 4 + i) * 0.14;
  });
  return (
    <mesh ref={m} position={[0, -1 - i * 0.6, 0]}>
      <torusGeometry args={[radius, tube, 32, 200]} />
      <meshStandardMaterial color="#1c1c19" emissive={GOLD} emissiveIntensity={0.55} metalness={0.85} roughness={0.22} />
    </mesh>
  );
}

function Particles() {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const a = new Float32Array(1200 * 3);
    for (let i = 0; i < a.length; i++) a[i] = (Math.random() - 0.5) * 46;
    g.setAttribute('position', new THREE.BufferAttribute(a, 3));
    return g;
  }, []);
  const ref = useRef();
  useFrame((st) => { ref.current.rotation.y = st.clock.elapsedTime * 0.014; });
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial color="#8a8471" size={0.055} transparent opacity={0.65} sizeAttenuation />
    </points>
  );
}

/* camera choreography: dive through the ring field as the page scrolls */
function Rig() {
  useFrame((st) => {
    const p = S.p;
    st.camera.position.x += (st.pointer.x * 0.9 - st.camera.position.x) * 0.05;
    st.camera.position.y += (-p * 7.5 + st.pointer.y * 0.5 - st.camera.position.y) * 0.07;
    st.camera.position.z = 16 - p * 5;
    st.camera.lookAt(0, -p * 6.8, 0);
    window.__hwiFrames = (window.__hwiFrames || 0) + 1;
    if (window.HWI_DEBUG) window.__hwiInfo = { calls: st.gl.info.render.calls, tris: st.gl.info.render.triangles, cam: st.camera.position.toArray().map(n => +n.toFixed(2)) };
  });
  return null;
}

function Sun({ onReady }) {
  const ref = useRef();
  useFrame((st) => {
    const p = S.p, t = st.clock.elapsedTime * 0.22, mesh = ref.current;
    mesh.position.y = -p * 4 + Math.sin(t * 2.4) * 0.25;
    mesh.material.emissiveIntensity = 0.95 + p * 1.1;
  });
  return (
    <mesh ref={(el) => { ref.current = el; if (el) onReady(el); }} position={[5.5, 0, -7]}>
      <sphereGeometry args={[2.1, 64, 64]} />
      <meshStandardMaterial color="#151512" emissive={GOLD} emissiveIntensity={1.3} metalness={0.4} roughness={0.35} />
    </mesh>
  );
}

const FX = () => window.HWI_FX || 'full'; // debug bisect flag; 'full' in production

function Effects({ sun }) {
  const fx = FX();
  if (fx === 'none') return null;
  return (
    <EffectComposer multisampling={4}>
      {fx !== 'bloom' && <N8AO aoRadius={2.2} intensity={4} distanceFalloff={2.4} />}
      <Bloom mipmapBlur intensity={0.9} luminanceThreshold={0.22} luminanceSmoothing={0.32} />
      {fx === 'full' && <GodRays sun={sun} samples={60} density={0.94} decay={0.92} weight={0.3} exposure={0.2} clampMax={1} blur />}
      <Vignette eskil={false} offset={0.18} darkness={0.78} />
    </EffectComposer>
  );
}

function Scene() {
  const [sun, setSun] = useState(null);
  return (
    <>
      <color attach="background" args={['#0c0c0b']} />
      <fogExp2 attach="fog" args={['#0c0c0b', 0.04]} />
      <ambientLight intensity={0.35} />
      <pointLight color={GOLD} intensity={1.35} distance={70} position={[0, 4, 8]} />
      <directionalLight intensity={0.5} position={[-6, 8, 10]} />
      <Sun onReady={setSun} />
      {[6, 9.5, 13.5].map((r, i) => <Ring key={i} radius={r} tube={0.07 + i * 0.03} i={i} />)}
      <Particles />
      <Rig />
      {sun && <Effects sun={sun} />}
    </>
  );
}

function mount3D(host) {
  const root = createRoot(host);
  root.render(
    <Canvas
      dpr={[1, 1.75]}
      gl={{ antialias: false, powerPreference: 'high-performance', preserveDrawingBuffer: !!window.HWI_DEBUG }}
      camera={{ fov: 52, near: 0.1, far: 130, position: [0, 0, 16] }}
    >
      <Scene />
    </Canvas>
  );
  window.__HWI_MODE = '3d';
  return root;
}

/* ------------- 2.5D touch parallax (mobile / small viewports) ------------- */
function mount25D(bg) {
  bg.innerHTML = ['a', 'b', 'glow', 'dots'].map((k) => `<div class="hwi-l25 hwi-l25-${k}"></div>`).join('');
  const layers = Array.from(bg.children);
  const triggers = layers.map((el, i) =>
    gsap.to(el, { yPercent: -(6 + i * 8), ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.6 } }).scrollTrigger
  );
  const qx = layers.map((el) => gsap.quickTo(el, 'x', { duration: 0.9, ease: 'power2' }));
  const qy = layers.map((el) => gsap.quickTo(el, 'y', { duration: 0.9, ease: 'power2' }));
  const move = (nx, ny) => layers.forEach((_, i) => { const f = (i + 1) * 7; qx[i]((nx - 0.5) * f); qy[i]((ny - 0.5) * f); });
  const onP = (e) => move(e.clientX / innerWidth, e.clientY / innerHeight);
  const onT = (e) => { const t = e.touches[0]; if (t) move(t.clientX / innerWidth, t.clientY / innerHeight); };
  addEventListener('pointermove', onP, { passive: true });
  addEventListener('touchmove', onT, { passive: true });
  window.__HWI_MODE = '25d';
  return () => {
    removeEventListener('pointermove', onP);
    removeEventListener('touchmove', onT);
    triggers.forEach((t) => t && t.kill());
    bg.innerHTML = '';
  };
}

/* ---------------- config → DOM (single pass, no hardcoded blocks) ---------------- */
function renderContent(root) {
  const $ = (s) => root.querySelector(s);
  root.style.setProperty('--p', CFG.theme.primaryColor);
  root.style.setProperty('--bg', CFG.theme.accentColor);
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
  $('.hwi-grid').innerHTML = CFG.reviews.map((r, i) =>
    `<article class="hwi-card rv"><em>${'★'.repeat(r.rating)}</em><p>“${r.text}”</p><b>${r.author} — Google</b></article>`).join('');
}

/* ---------------- scroll mechanics: Lenis + GSAP ScrollTrigger ---------------- */
function setupScroll(root, reduced) {
  if (!reduced) {
    const lenis = new Lenis({ lerp: 0.09 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (st) => { S.p = st.progress; } });
  ScrollTrigger.create({ start: 40, end: 'max', toggleClass: { targets: root.querySelector('.hwi-nav'), className: 'on' } });

  if (reduced) {
    gsap.set('.rv', { autoAlpha: 1 });
    return;
  }
  /* cinematic hero exit: title scales down & fades as you dive into the rings */
  gsap.to('.hwi-hero-inner', {
    autoAlpha: 0, scale: 0.92, yPercent: -8, ease: 'none',
    scrollTrigger: { trigger: '.hwi-hero', start: 'top top', end: 'bottom 35%', scrub: 0.5 }
  });
  /* reveals */
  ScrollTrigger.batch('.rv', {
    start: 'top 88%', once: true,
    onEnter: (els) => gsap.fromTo(els,
      { autoAlpha: 0, y: 52, scale: 0.97 },
      { autoAlpha: 1, y: 0, scale: 1, duration: 1.05, ease: 'power3.out', stagger: 0.12, overwrite: true })
  });
  /* floating parallax on review cards over the 3D field */
  gsap.utils.toArray('.hwi-card').forEach((el, i) => {
    gsap.to(el, {
      y: -(28 + (i % 3) * 24), ease: 'none',
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.8 }
    });
  });
}

/* ---------------- boot & responsive mode switching ---------------- */
function init() {
  const root = document.getElementById('hwi');
  if (!root || root.dataset.hwiInit || !CFG) return;
  root.dataset.hwiInit = '1';
  renderContent(root);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  setupScroll(root, reduced);

  const glHost = root.querySelector('#hwi-gl-host');
  const bg25 = root.querySelector('#hwi-bg25');
  const mq = matchMedia('(pointer: coarse), (max-width: 820px)');
  let r3f = null, cleanup = null, watchdog = null;

  function apply() {
    clearTimeout(watchdog);
    if (cleanup) { cleanup(); cleanup = null; }
    if (r3f) { r3f.unmount(); r3f = null; }
    if (reduced) { cleanup = mount25D(bg25); window.__HWI_MODE = 'static'; return; }
    if (mq.matches) { cleanup = mount25D(bg25); }
    else {
      try {
        window.__hwiFrames = 0;
        r3f = mount3D(glHost);
        /* if WebGL never produced a frame, fall back to the 2.5D layers */
        watchdog = setTimeout(() => {
          if (!window.__hwiFrames) { if (r3f) r3f.unmount(); r3f = null; cleanup = mount25D(bg25); }
        }, 1800);
      } catch (e) { cleanup = mount25D(bg25); }
    }
    ScrollTrigger.refresh();
  }
  mq.addEventListener('change', apply);
  apply();
}

if (document.readyState !== 'loading') init();
else addEventListener('DOMContentLoaded', init);
document.addEventListener('shopify:section:load', init);
