import { gsap } from 'gsap';
import { hasFinePointer } from '@/utils/device';

/**
 * Custom cursor: a small dot that tracks instantly plus a trailing ring that
 * eases behind it. Interactive targets tagged [data-cursor="..."] morph the
 * ring ("view" shows a label for gallery panels).
 *
 * Renders only for fine pointers; the native cursor is kept (never hidden
 * for keyboard/AT users) — the ring is an accent layered on top.
 */
export function initCursor(): void {
  if (!hasFinePointer()) return;

  const root = document.createElement('div');
  root.className = 'ts-cursor';
  root.setAttribute('aria-hidden', 'true');
  root.innerHTML = '<div class="ts-cursor__dot"></div><div class="ts-cursor__ring"><span class="ts-cursor__label"></span></div>';
  document.body.appendChild(root);

  const dot = root.querySelector<HTMLElement>('.ts-cursor__dot');
  const ring = root.querySelector<HTMLElement>('.ts-cursor__ring');
  const label = root.querySelector<HTMLElement>('.ts-cursor__label');
  if (!dot || !ring || !label) return;

  const dotX = gsap.quickTo(dot, 'x', { duration: 0.08, ease: 'power2.out' });
  const dotY = gsap.quickTo(dot, 'y', { duration: 0.08, ease: 'power2.out' });
  const ringX = gsap.quickTo(ring, 'x', { duration: 0.42, ease: 'power3.out' });
  const ringY = gsap.quickTo(ring, 'y', { duration: 0.42, ease: 'power3.out' });

  let visible = false;
  window.addEventListener('pointermove', (event) => {
    if (event.pointerType !== 'mouse') return;
    if (!visible) {
      visible = true;
      gsap.to(root, { opacity: 1, duration: 0.3 });
    }
    dotX(event.clientX);
    dotY(event.clientY);
    ringX(event.clientX);
    ringY(event.clientY);
  });
  document.documentElement.addEventListener('pointerleave', () => {
    visible = false;
    gsap.to(root, { opacity: 0, duration: 0.3 });
  });

  const setMode = (mode: string | null): void => {
    ring.dataset.mode = mode ?? '';
    label.textContent = mode === 'view' ? 'View' : '';
    gsap.to(ring, {
      scale: mode ? (mode === 'view' ? 2.6 : 1.7) : 1,
      duration: 0.35,
      ease: 'power3.out',
    });
    gsap.to(dot, { scale: mode ? 0 : 1, duration: 0.25, ease: 'power3.out' });
  };

  document.addEventListener('pointerover', (event) => {
    const target = (event.target as HTMLElement | null)?.closest<HTMLElement>(
      '[data-cursor], a, button, .ts-btn',
    );
    setMode(target ? (target.dataset.cursor ?? 'link') : null);
  });
  document.addEventListener('pointerout', (event) => {
    const target = (event.target as HTMLElement | null)?.closest('[data-cursor], a, button, .ts-btn');
    if (target) setMode(null);
  });
}
