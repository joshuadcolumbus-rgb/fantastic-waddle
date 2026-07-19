import { gsap } from 'gsap';
import type Lenis from 'lenis';

/**
 * Header behavior: transparent over the hero, frosted glass once the journey
 * begins; slides away scrolling down, returns scrolling up. Skipped (static
 * glass) under reduced motion — see bootstrap.
 */
export function initHeader(lenis: Lenis | null): void {
  const header = document.querySelector<HTMLElement>('.ts-header');
  if (!header) return;

  let lastY = 0;
  let hidden = false;

  const onScroll = (y: number): void => {
    header.classList.toggle('is-scrolled', y > 40);
    const goingDown = y > lastY + 4 && y > 220;
    const goingUp = y < lastY - 4;
    if (goingDown && !hidden) {
      hidden = true;
      gsap.to(header, { yPercent: -110, duration: 0.5, ease: 'power3.out' });
    } else if (goingUp && hidden) {
      hidden = false;
      gsap.to(header, { yPercent: 0, duration: 0.5, ease: 'power3.out' });
    }
    lastY = y;
  };

  if (lenis) {
    lenis.on('scroll', ({ scroll }: { scroll: number }) => onScroll(scroll));
  } else {
    window.addEventListener('scroll', () => onScroll(window.scrollY), { passive: true });
  }

  // Keyboard focus inside the header must always bring it back.
  header.addEventListener('focusin', () => {
    hidden = false;
    gsap.to(header, { yPercent: 0, duration: 0.3, ease: 'power3.out' });
  });

  initMobileNav(header, lenis);
}

function initMobileNav(header: HTMLElement, lenis: Lenis | null): void {
  const toggle = header.querySelector<HTMLButtonElement>('.ts-header__toggle');
  const drawer = document.querySelector<HTMLElement>('.ts-nav-drawer');
  if (!toggle || !drawer) return;

  const close = (): void => {
    toggle.setAttribute('aria-expanded', 'false');
    drawer.classList.remove('is-open');
    document.documentElement.classList.remove('nav-open');
    lenis?.start();
  };

  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    if (open) {
      close();
      return;
    }
    toggle.setAttribute('aria-expanded', 'true');
    drawer.classList.add('is-open');
    document.documentElement.classList.add('nav-open');
    lenis?.stop();
    gsap.fromTo(
      drawer.querySelectorAll('.ts-nav-drawer__link'),
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, ease: 'expo.out', stagger: 0.06, delay: 0.1 },
    );
    drawer.querySelector<HTMLElement>('a, button')?.focus();
  });

  drawer.addEventListener('click', (event) => {
    if ((event.target as HTMLElement).closest('a')) close();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && drawer.classList.contains('is-open')) {
      close();
      toggle.focus();
    }
  });
}
