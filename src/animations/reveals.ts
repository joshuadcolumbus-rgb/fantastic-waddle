import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

/**
 * Declarative DOM reveals, applied to anything the Liquid sections tag:
 *
 *   data-reveal="chars"  — headline splits into characters, staggered rise
 *   data-reveal="lines"  — body copy rises line by line behind a clip
 *   data-reveal="fade"   — simple rise + fade
 *   data-reveal="mask"   — media unmasks with a slow inner scale
 *   data-reveal-delay    — optional extra delay (seconds)
 *   data-parallax="0.2"  — scrubbed vertical drift (fraction of viewport)
 *
 * Content is only hidden AFTER JS takes over (initial states are set here,
 * not in CSS), so no-JS visitors and crawlers always see everything.
 */

export function initReveals(scope: ParentNode = document): void {
  for (const el of scope.querySelectorAll<HTMLElement>('[data-reveal]')) {
    if (el.dataset.revealInit) continue;
    el.dataset.revealInit = 'true';
    const kind = el.dataset.reveal ?? 'fade';
    const delay = parseFloat(el.dataset.revealDelay ?? '0');

    switch (kind) {
      case 'chars': {
        const split = SplitText.create(el, { type: 'chars,words', charsClass: 'ts-char', aria: 'auto' });
        gsap.set(split.chars, { yPercent: 108, opacity: 0, rotate: 2 });
        gsap.to(split.chars, {
          yPercent: 0,
          opacity: 1,
          rotate: 0,
          duration: 1.1,
          ease: 'expo.out',
          stagger: 0.018,
          delay,
          scrollTrigger: { trigger: el, start: 'top 82%', once: true },
        });
        break;
      }
      case 'lines': {
        const split = SplitText.create(el, {
          type: 'lines',
          linesClass: 'ts-line',
          mask: 'lines',
          aria: 'auto',
        });
        gsap.set(split.lines, { yPercent: 112 });
        gsap.to(split.lines, {
          yPercent: 0,
          duration: 1.0,
          ease: 'expo.out',
          stagger: 0.09,
          delay,
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        });
        break;
      }
      case 'mask': {
        el.classList.add('ts-mask');
        const inner = el.querySelector<HTMLElement>('img, video, .ts-mask-inner') ?? el;
        gsap.set(el, { clipPath: 'inset(12% 6% 12% 6% round 14px)', opacity: 0 });
        gsap.set(inner, { scale: 1.18 });
        const tl = gsap.timeline({
          delay,
          scrollTrigger: { trigger: el, start: 'top 80%', once: true },
        });
        tl.to(el, { clipPath: 'inset(0% 0% 0% 0% round 14px)', opacity: 1, duration: 1.3, ease: 'expo.out' })
          .to(inner, { scale: 1, duration: 1.7, ease: 'expo.out' }, 0);
        break;
      }
      default: {
        gsap.set(el, { y: 36, opacity: 0 });
        gsap.to(el, {
          y: 0,
          opacity: 1,
          duration: 1.0,
          ease: 'expo.out',
          delay,
          scrollTrigger: { trigger: el, start: 'top 86%', once: true },
        });
      }
    }
  }

  for (const el of scope.querySelectorAll<HTMLElement>('[data-parallax]')) {
    if (el.dataset.parallaxInit) continue;
    el.dataset.parallaxInit = 'true';
    const speed = parseFloat(el.dataset.parallax ?? '0.15');
    gsap.fromTo(
      el,
      { y: () => speed * 0.5 * window.innerHeight },
      {
        y: () => -speed * 0.5 * window.innerHeight,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
      },
    );
  }
}

/** Stagger groups: children of [data-stagger] rise together with offsets. */
export function initStaggerGroups(scope: ParentNode = document): void {
  for (const group of scope.querySelectorAll<HTMLElement>('[data-stagger]')) {
    if (group.dataset.staggerInit) continue;
    group.dataset.staggerInit = 'true';
    const items = Array.from(group.children) as HTMLElement[];
    if (items.length === 0) continue;
    gsap.set(items, { y: 44, opacity: 0 });
    gsap.to(items, {
      y: 0,
      opacity: 1,
      duration: 0.95,
      ease: 'expo.out',
      stagger: 0.09,
      scrollTrigger: { trigger: group, start: 'top 84%', once: true },
    });
  }
}

export function refreshTriggers(): void {
  ScrollTrigger.refresh();
}
