import { gsap } from 'gsap';
import { Flip } from 'gsap/Flip';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import type Lenis from 'lenis';
import { initCursor } from '@/animations/cursor';
import { initGallery } from '@/animations/gallery';
import { initHeader } from '@/animations/header';
import { playIntro, revealWithoutMotion } from '@/animations/intro';
import { initMagnetic } from '@/animations/magnetic';
import { buildMasterTimeline, destroyMasterTimeline } from '@/animations/masterTimeline';
import { initReveals, initStaggerGroups } from '@/animations/reveals';
import { initSmoothScroll } from '@/animations/scroll';
import { detectQualityTier } from '@/app/quality';
import { sceneStore } from '@/stores/sceneStore';
import { isMobileViewport, prefersReducedMotion, webglAvailable } from '@/utils/device';
import { measureSceneBeats, readThemeConfig } from '@/utils/dom-data';

/**
 * Boot order matters:
 *   1. gates (reduced motion / WebGL capability / merchant toggle)
 *   2. smooth scroll + DOM choreography (small, immediate)
 *   3. master timeline from measured scene anchors
 *   4. WebGL chunk — dynamically imported only when it will actually run,
 *      so the three.js bundle never ships to fallback visitors.
 */
export function boot(): void {
  const html = document.documentElement;
  html.dataset.js = 'true';

  const config = readThemeConfig();
  const store = sceneStore.getState();
  store.setExperienceSettings({
    particlesEnabled: config.particlesEnabled,
    intensity: config.intensity,
  });

  if (prefersReducedMotion()) {
    html.dataset.motion = 'reduced';
    html.dataset.webgl = 'disabled';
    sceneStore.getState().setWebglStatus('disabled');
    initHeader(null);
    revealWithoutMotion();
    return;
  }
  html.dataset.motion = 'full';

  gsap.registerPlugin(ScrollTrigger, SplitText, Flip);

  // Hide intro elements only now that JS owns the reveal.
  const headline = document.querySelector<HTMLElement>('[data-intro="headline"]');
  if (headline) gsap.set(headline, { opacity: 0 });

  const lenis = initSmoothScroll();
  initHeader(lenis);
  initReveals();
  initStaggerGroups();
  initMagnetic();
  initCursor();
  initGallery(lenis);
  trackPointer();

  rebuildSceneGraph();
  bindRebuildEvents();

  startWebgl(config.webglEnabled);
}

function trackPointer(): void {
  const { pointer } = sceneStore.getState();
  window.addEventListener(
    'pointermove',
    (event) => {
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (event.clientY / window.innerHeight) * 2 - 1;
    },
    { passive: true },
  );
}

/** Measure anchors → rebuild the master timeline. Reused by editor events. */
function rebuildSceneGraph(): void {
  const store = sceneStore.getState();
  store.setMobileCamera(isMobileViewport());
  const beats = measureSceneBeats();
  store.setBeats(beats);
  buildMasterTimeline(beats);
}

function bindRebuildEvents(): void {
  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      rebuildSceneGraph();
      ScrollTrigger.refresh();
    }, 250);
  });

  // Shopify Theme Editor: sections load/reorder live — remeasure everything.
  for (const type of ['shopify:section:load', 'shopify:section:unload', 'shopify:section:reorder']) {
    document.addEventListener(type, () => {
      initReveals();
      initStaggerGroups();
      initMagnetic();
      rebuildSceneGraph();
      ScrollTrigger.refresh();
    });
  }
}

function startWebgl(enabledByMerchant: boolean): void {
  const html = document.documentElement;
  const store = sceneStore.getState();

  if (!enabledByMerchant) {
    html.dataset.webgl = 'disabled';
    store.setWebglStatus('disabled');
    playIntro();
    return;
  }
  if (!webglAvailable()) {
    html.dataset.webgl = 'failed';
    store.setWebglStatus('failed');
    playIntro();
    return;
  }

  store.setTier(detectQualityTier());
  store.setWebglStatus('loading');
  html.dataset.webgl = 'loading';

  // First staged frames of the world → dissolve the veil, play the overture.
  const unsubscribe = sceneStore.subscribe(
    (state) => state.stage,
    (stage) => {
      if (stage >= 1) {
        html.dataset.webgl = 'running';
        playIntro();
        unsubscribe();
      }
    },
  );

  import('@/webgl')
    .then((module) => module.mountWebgl())
    .catch((error) => {
      console.error('[terra-stone] WebGL failed to start, falling back:', error);
      unsubscribe();
      failWebgl();
    });

  // If the world hasn't produced a frame after 6s (slow network/GPU), the
  // intro plays anyway over the static fallback — never a stuck veil.
  window.setTimeout(() => playIntro(), 6000);
}

/** Central failure path — also called by the React error boundary. */
export function failWebgl(): void {
  destroyWebglSafely();
  document.documentElement.dataset.webgl = 'failed';
  sceneStore.getState().setWebglStatus('failed');
  playIntro();
}

function destroyWebglSafely(): void {
  try {
    const host = document.getElementById('ts-canvas-root');
    if (host) host.innerHTML = '';
  } catch {
    /* the fallback must never throw */
  }
}

export type { Lenis };
