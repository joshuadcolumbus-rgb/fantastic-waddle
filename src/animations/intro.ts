import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';

/**
 * Page-load overture. Runs once, either when the WebGL world reports its
 * first staged frames or immediately if WebGL is unavailable:
 *
 *   1. the veil dissolves as the landscape fades in
 *   2. the hero headline rises character by character
 *   3. eyebrow, lede and CTA follow, each a beat later
 *   4. the scroll hint breathes in last
 */
let played = false;

export function playIntro(): void {
  if (played) return;
  played = true;

  const veil = document.querySelector<HTMLElement>('.ts-veil');
  const hero = document.querySelector<HTMLElement>('[data-section-type="hero"]');
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });

  if (veil) {
    tl.to(veil, {
      opacity: 0,
      duration: 1.6,
      ease: 'power2.inOut',
      onComplete: () => {
        veil.style.display = 'none';
      },
    });
  }

  if (!hero) return;
  const headline = hero.querySelector<HTMLElement>('[data-intro="headline"]');
  const eyebrow = hero.querySelector<HTMLElement>('[data-intro="eyebrow"]');
  const lede = hero.querySelector<HTMLElement>('[data-intro="lede"]');
  const cta = hero.querySelector<HTMLElement>('[data-intro="cta"]');
  const hint = hero.querySelector<HTMLElement>('[data-intro="hint"]');

  if (headline) {
    const split = SplitText.create(headline, { type: 'chars,words', charsClass: 'ts-char', aria: 'auto' });
    gsap.set(headline, { opacity: 1 });
    tl.from(
      split.chars,
      { yPercent: 118, opacity: 0, rotate: 3, duration: 1.4, stagger: 0.024 },
      veil ? 0.55 : 0,
    );
  }
  if (eyebrow) tl.from(eyebrow, { y: 24, opacity: 0, duration: 0.9 }, '<0.35');
  if (lede) tl.from(lede, { y: 30, opacity: 0, duration: 1.0 }, '<0.15');
  if (cta) tl.from(cta, { y: 34, opacity: 0, duration: 1.0 }, '<0.15');
  if (hint) {
    tl.from(hint, { opacity: 0, duration: 1.2 }, '<0.3');
    gsap.to(hint, { y: 8, repeat: -1, yoyo: true, duration: 1.4, ease: 'sine.inOut', delay: 3 });
  }
}

/** Instant, animation-free variant for reduced motion: just clear the veil. */
export function revealWithoutMotion(): void {
  played = true;
  const veil = document.querySelector<HTMLElement>('.ts-veil');
  if (veil) veil.style.display = 'none';
  const headline = document.querySelector<HTMLElement>('[data-intro="headline"]');
  if (headline) headline.style.opacity = '1';
}
