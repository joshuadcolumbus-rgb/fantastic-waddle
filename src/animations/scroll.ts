import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

/**
 * Lenis owns the scroll; GSAP's ticker owns time. ScrollTrigger listens to
 * Lenis so every scrubbed timeline (including the master timeline) advances
 * with the smoothed value — scrolling feels physical, not mechanical.
 */
export function initSmoothScroll(): Lenis {
  const lenis = new Lenis({
    duration: 1.15,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    touchMultiplier: 1.4,
  });

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // In-page anchors glide through Lenis instead of jumping.
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement | null;
    const link = target?.closest<HTMLAnchorElement>('a[href^="#"]');
    if (!link) return;
    const id = link.getAttribute('href');
    if (!id || id === '#') return;
    const destination = document.querySelector<HTMLElement>(id);
    if (!destination) return;
    event.preventDefault();
    lenis.scrollTo(destination, { offset: -72, duration: 1.4 });
    // Keep keyboard/AT context in sync with the visual scroll.
    destination.setAttribute('tabindex', '-1');
    destination.focus({ preventScroll: true });
  });

  return lenis;
}
