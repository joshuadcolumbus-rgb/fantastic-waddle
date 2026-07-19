import { gsap } from 'gsap';
import { hasFinePointer } from '@/utils/device';

/**
 * Magnetic buttons: elements tagged [data-magnetic] lean toward the pointer
 * inside a proximity field and snap back elastically on leave. The inner
 * label (.ts-btn__label) moves a touch further for depth. Fine pointers only.
 */
export function initMagnetic(scope: ParentNode = document): void {
  if (!hasFinePointer()) return;

  for (const el of scope.querySelectorAll<HTMLElement>('[data-magnetic]')) {
    if (el.dataset.magneticInit) continue;
    el.dataset.magneticInit = 'true';

    const strength = parseFloat(el.dataset.magnetic || '0.35') || 0.35;
    const label = el.querySelector<HTMLElement>('.ts-btn__label');
    const xTo = gsap.quickTo(el, 'x', { duration: 0.35, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.35, ease: 'power3.out' });

    el.addEventListener('pointermove', (event) => {
      if (event.pointerType !== 'mouse') return;
      const rect = el.getBoundingClientRect();
      const relX = event.clientX - (rect.left + rect.width / 2);
      const relY = event.clientY - (rect.top + rect.height / 2);
      xTo(relX * strength);
      yTo(relY * strength);
      if (label) {
        gsap.to(label, { x: relX * strength * 0.45, y: relY * strength * 0.45, duration: 0.35, ease: 'power3.out' });
      }
    });

    el.addEventListener('pointerleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.35)' });
      if (label) gsap.to(label, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.35)' });
    });
  }
}
