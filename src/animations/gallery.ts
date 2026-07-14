import { gsap } from 'gsap';
import { Flip } from 'gsap/Flip';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type Lenis from 'lenis';

/**
 * Portfolio, not a grid: a pinned storytelling passage where floating panels
 * drift through at staggered depths while the WebGL world dims to twilight
 * behind them. Clicking (or pressing Enter on) a panel FLIP-expands it into
 * an accessible fullscreen viewer with caption and location.
 */
export function initGallery(lenis: Lenis | null): void {
  for (const gallery of document.querySelectorAll<HTMLElement>('[data-gallery]')) {
    if (gallery.dataset.galleryInit) continue;
    gallery.dataset.galleryInit = 'true';

    const track = gallery.querySelector<HTMLElement>('.ts-gallery__track');
    const panels = Array.from(gallery.querySelectorAll<HTMLElement>('.ts-gallery__panel'));
    if (!track || panels.length === 0) continue;

    // Pinned scrub: the track glides horizontally while depth layers drift
    // at their own rates (parallax via data-depth on each panel).
    const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
    const pin = gsap.timeline({
      scrollTrigger: {
        trigger: gallery,
        start: 'top top',
        end: () => `+=${distance() + window.innerHeight * 0.5}`,
        scrub: 0.8,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });
    pin.to(track, { x: () => -distance(), ease: 'none' }, 0);
    for (const panel of panels) {
      const depth = parseFloat(panel.dataset.depth ?? '0');
      if (depth !== 0) {
        pin.to(panel, { x: () => -distance() * depth * 0.15, y: depth * -30, ease: 'none' }, 0);
      }
    }

    initViewer(gallery, panels, lenis);
  }
}

function initViewer(gallery: HTMLElement, panels: HTMLElement[], lenis: Lenis | null): void {
  const viewer = document.createElement('div');
  viewer.className = 'ts-viewer';
  viewer.setAttribute('role', 'dialog');
  viewer.setAttribute('aria-modal', 'true');
  viewer.setAttribute('aria-label', 'Project viewer');
  viewer.innerHTML = `
    <div class="ts-viewer__backdrop"></div>
    <figure class="ts-viewer__stage"></figure>
    <figcaption class="ts-viewer__caption"><h3></h3><p></p></figcaption>
    <button class="ts-viewer__close" type="button" aria-label="Close project viewer">&times;</button>`;
  document.body.appendChild(viewer);

  const stage = viewer.querySelector<HTMLElement>('.ts-viewer__stage');
  const captionTitle = viewer.querySelector<HTMLElement>('.ts-viewer__caption h3');
  const captionBody = viewer.querySelector<HTMLElement>('.ts-viewer__caption p');
  const closeBtn = viewer.querySelector<HTMLButtonElement>('.ts-viewer__close');
  if (!stage || !captionTitle || !captionBody || !closeBtn) return;

  let activePanel: HTMLElement | null = null;
  let activeImg: HTMLElement | null = null;
  let lastFocus: HTMLElement | null = null;

  const open = (panel: HTMLElement): void => {
    const img = panel.querySelector<HTMLElement>('img');
    if (!img || activeImg) return;
    activePanel = panel;
    activeImg = img;
    lastFocus = document.activeElement as HTMLElement | null;

    captionTitle.textContent = panel.dataset.title ?? '';
    captionBody.textContent = panel.dataset.meta ?? '';

    const state = Flip.getState(img);
    stage.appendChild(img);
    viewer.classList.add('is-open');
    lenis?.stop();
    Flip.from(state, { duration: 0.8, ease: 'expo.inOut', absolute: true });
    gsap.fromTo(
      ['.ts-viewer__backdrop', '.ts-viewer__caption', '.ts-viewer__close'],
      { opacity: 0 },
      { opacity: 1, duration: 0.6, delay: 0.2 },
    );
    closeBtn.focus();
  };

  const close = (): void => {
    if (!activePanel || !activeImg) return;
    const state = Flip.getState(activeImg);
    activePanel.querySelector('.ts-gallery__media')?.appendChild(activeImg);
    Flip.from(state, {
      duration: 0.7,
      ease: 'expo.inOut',
      absolute: true,
      onComplete: () => viewer.classList.remove('is-open'),
    });
    gsap.to(['.ts-viewer__backdrop', '.ts-viewer__caption', '.ts-viewer__close'], { opacity: 0, duration: 0.35 });
    lenis?.start();
    lastFocus?.focus();
    activePanel = null;
    activeImg = null;
  };

  for (const panel of panels) {
    const trigger = panel.querySelector<HTMLElement>('.ts-gallery__media') ?? panel;
    trigger.setAttribute('role', 'button');
    trigger.setAttribute('tabindex', '0');
    trigger.setAttribute('aria-label', `Open project: ${panel.dataset.title ?? 'project image'}`);
    trigger.addEventListener('click', () => open(panel));
    trigger.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        open(panel);
      }
    });
  }

  closeBtn.addEventListener('click', close);
  viewer.querySelector('.ts-viewer__backdrop')?.addEventListener('click', close);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && viewer.classList.contains('is-open')) close();
  });
}

export function refreshGallery(): void {
  ScrollTrigger.refresh();
}
