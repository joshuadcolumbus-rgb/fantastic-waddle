/**
 * Dev harness renderer — mirrors the exact markup the Liquid sections emit
 * (same classes, data attributes and structure) so the full experience can
 * be developed and screenshot-tested without a Shopify store. Content comes
 * from mock-data.json; imagery is generated gradient SVG.
 */
import data from './mock-data.json';

function svgImage(hue: [number, number], label: string, w = 900, h = 1125): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="hsl(${hue[0]}, 32%, 34%)"/>
      <stop offset="1" stop-color="hsl(${hue[1]}, 42%, 16%)"/>
    </linearGradient></defs>
    <rect width="${w}" height="${h}" fill="url(#g)"/>
    <circle cx="${w * 0.75}" cy="${h * 0.22}" r="${w * 0.3}" fill="hsl(${hue[0]}, 45%, 46%)" opacity="0.35"/>
    <circle cx="${w * 0.2}" cy="${h * 0.85}" r="${w * 0.42}" fill="hsl(${hue[1]}, 38%, 12%)" opacity="0.5"/>
    <text x="50%" y="52%" fill="rgba(244,241,232,0.5)" font-family="georgia" font-size="${w * 0.045}" font-style="italic" text-anchor="middle">${label}</text>
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const featureItem = (f: { title: string; text: string }): string => `
  <li class="ts-service-card">
    <span style="color: var(--c-gold);">◆</span>
    <span><strong>${f.title}</strong> — ${f.text}</span>
  </li>`;

function heroSection(): string {
  const h = data.hero;
  return `
  <section class="ts-section ts-hero" id="hero" data-scene-anchor data-beat="${h.beat}" data-section-type="hero">
    <div class="ts-container">
      <p class="ts-eyebrow" data-intro="eyebrow">${h.eyebrow}</p>
      <h1 class="ts-hero__headline" data-intro="headline">${h.headline} <em>${h.accent}</em></h1>
      <p class="ts-lede" data-intro="lede">${h.lede}</p>
      <div class="ts-hero__actions" data-intro="cta">
        <a class="ts-btn" href="#contact" data-magnetic><span class="ts-btn__label">${h.ctaPrimary}</span></a>
        <a class="ts-btn ts-btn--ghost" href="#portfolio" data-magnetic><span class="ts-btn__label">${h.ctaSecondary}</span></a>
      </div>
    </div>
    <p class="ts-hero__hint" data-intro="hint" aria-hidden="true">${h.hint}</p>
  </section>`;
}

function aboutSection(): string {
  const a = data.about;
  return `
  <section class="ts-section ts-chapter" id="about" data-scene-anchor data-beat="${a.beat}" data-section-type="about">
    <div class="ts-container"><div class="ts-chapter__grid">
      <div class="ts-chapter__copy"><div class="ts-glass" style="padding: clamp(1.6rem, 3.5vw, 3rem);">
        <p class="ts-eyebrow" data-reveal="fade">${a.eyebrow}</p>
        <h2 class="ts-chapter__title" data-reveal="chars">${a.title}</h2>
        <p class="ts-lede" data-reveal="lines">${a.lede}</p>
        <div data-reveal="fade"><p>${a.body}</p></div>
        <div class="ts-chapter__stats" data-stagger>
          ${a.stats.map((s) => `<div class="ts-stat"><div class="ts-stat__value">${s.value}</div><div class="ts-stat__label">${s.label}</div></div>`).join('')}
        </div>
      </div></div>
      <div class="ts-chapter__media" data-reveal="mask" data-parallax="0.12">
        <img src="${svgImage([100, 140], 'The studio')}" alt="Garden designers reviewing a master plan on site" width="900" height="1125">
      </div>
    </div></div>
  </section>`;
}

function chapterSection(c: (typeof data.chapters)[number], index: number): string {
  return `
  <section class="ts-section ts-chapter${c.flip ? ' ts-chapter--flip' : ''}" id="chapter-${index}" data-scene-anchor data-beat="${c.beat}" data-section-type="service">
    <div class="ts-container"><div class="ts-chapter__grid">
      <div class="ts-chapter__copy"><div class="ts-glass" style="padding: clamp(1.6rem, 3.5vw, 3rem);">
        <p class="ts-eyebrow" data-reveal="fade">${c.eyebrow}</p>
        <h2 class="ts-chapter__title" data-reveal="chars">${c.title}</h2>
        <p class="ts-lede" data-reveal="lines">${c.lede}</p>
        <ul class="ts-feature-list" data-stagger>${c.features.map(featureItem).join('')}</ul>
        <div style="margin-top: var(--space-3);" data-reveal="fade">
          <a class="ts-btn ts-btn--ghost" href="#contact" data-magnetic><span class="ts-btn__label">Explore the service</span></a>
        </div>
      </div></div>
      <div class="ts-chapter__media" data-reveal="mask" data-parallax="0.15">
        <img src="${svgImage(c.hue as [number, number], c.title)}" alt="${c.title}" width="900" height="1125">
      </div>
    </div></div>
  </section>`;
}

function gallerySection(): string {
  const g = data.gallery;
  return `
  <section class="ts-section ts-gallery" id="portfolio" data-gallery data-scene-anchor data-beat="${g.beat}" data-section-type="gallery">
    <div class="ts-gallery__pin">
      <div class="ts-container ts-gallery__head">
        <p class="ts-eyebrow" data-reveal="fade">${g.eyebrow}</p>
        <h2 class="ts-chapter__title" data-reveal="chars">${g.title}</h2>
        <p class="ts-lede" data-reveal="lines">${g.lede}</p>
      </div>
      <div class="ts-gallery__track">
        ${g.projects
          .map(
            (p) => `
        <article class="ts-gallery__panel" data-depth="${p.depth}" data-title="${p.title}" data-meta="${p.meta}">
          <div class="ts-gallery__media" data-cursor="view">
            <img src="${svgImage(p.hue as [number, number], p.title, 1200, 1500)}" alt="${p.title} — ${p.meta}" width="1200" height="1500">
          </div>
          <div class="ts-gallery__caption"><h3>${p.title}</h3><span>${p.meta}</span></div>
        </article>`,
          )
          .join('')}
      </div>
    </div>
  </section>`;
}

function testimonialsSection(): string {
  const t = data.testimonials;
  return `
  <section class="ts-section ts-testimonials" id="testimonials" data-scene-anchor data-beat="${t.beat}" data-section-type="testimonials">
    <div class="ts-container">
      <p class="ts-eyebrow" data-reveal="fade">${t.eyebrow}</p>
      <h2 class="ts-chapter__title" data-reveal="chars">${t.title}</h2>
      <div class="ts-testimonials__rail" data-stagger>
        ${t.quotes
          .map(
            (q) => `
        <figure class="ts-quote ts-glass">
          <span class="ts-quote__stars" aria-label="5 out of 5 stars">★★★★★</span>
          <blockquote>${q.quote}</blockquote>
          <figcaption><span class="ts-quote__name">${q.name}</span><span class="ts-quote__meta">${q.meta}</span></figcaption>
        </figure>`,
          )
          .join('')}
      </div>
    </div>
  </section>`;
}

function processSection(): string {
  const p = data.process;
  return `
  <section class="ts-section ts-process" id="process" data-scene-anchor data-beat="${p.beat}" data-section-type="process">
    <div class="ts-container">
      <p class="ts-eyebrow" data-reveal="fade">${p.eyebrow}</p>
      <h2 class="ts-chapter__title" data-reveal="chars">${p.title}</h2>
      <div class="ts-process__steps" data-stagger>
        ${p.steps.map((s) => `<div class="ts-step ts-glass"><div><h3>${s.title}</h3><p>${s.text}</p></div></div>`).join('')}
      </div>
    </div>
  </section>`;
}

function areasSection(): string {
  const a = data.areas;
  return `
  <section class="ts-section ts-areas" id="areas" data-scene-anchor data-beat="${a.beat}" data-section-type="areas">
    <div class="ts-container">
      <p class="ts-eyebrow" data-reveal="fade">${a.eyebrow}</p>
      <h2 class="ts-chapter__title" data-reveal="chars">${a.title}</h2>
      <p class="ts-lede" data-reveal="lines">${a.lede}</p>
      <div class="ts-areas__cloud" data-stagger>
        ${a.names.map((n) => `<span class="ts-area">${n}</span>`).join('')}
      </div>
    </div>
  </section>`;
}

function contactSection(): string {
  const c = data.contact;
  return `
  <section class="ts-section ts-contact" id="contact" data-scene-anchor data-beat="${c.beat}" data-section-type="contact">
    <div class="ts-container">
      <div class="ts-contact__card ts-glass" data-reveal="fade">
        <div>
          <p class="ts-eyebrow">${c.eyebrow}</p>
          <h2 class="ts-contact__title" data-reveal="chars">${c.title}</h2>
          <p class="ts-lede">${c.lede}</p>
          <div class="ts-contact__channels">
            <p class="ts-contact__channel"><span>Telephone</span><a href="tel:${c.phone}">${c.phone}</a></p>
            <p class="ts-contact__channel"><span>Email</span><a href="mailto:${c.email}">${c.email}</a></p>
            <p class="ts-contact__channel"><span>Studio hours</span>${c.hours}</p>
          </div>
        </div>
        <div>
          <form class="ts-form" action="#" method="post">
            <div class="ts-field"><label for="f-name">Name</label><input id="f-name" type="text" autocomplete="name" required></div>
            <div class="ts-field"><label for="f-email">Email</label><input id="f-email" type="email" autocomplete="email" required></div>
            <div class="ts-field"><label for="f-phone">Telephone</label><input id="f-phone" type="tel" autocomplete="tel"></div>
            <div class="ts-field"><label for="f-body">Tell us about your grounds</label><textarea id="f-body" rows="4" required></textarea></div>
            <button type="submit" class="ts-btn" data-magnetic><span class="ts-btn__label">${c.submit}</span></button>
          </form>
        </div>
      </div>
    </div>
  </section>`;
}

export function renderHarness(): void {
  document.body.insertAdjacentHTML(
    'afterbegin',
    `
  <a class="skip-link" href="#main-content">Skip to content</a>
  <div class="ts-fallback" aria-hidden="true"></div>
  <div id="ts-canvas-root" class="ts-canvas" aria-hidden="true"></div>
  <div class="ts-veil" aria-hidden="true"></div>

  <header class="ts-header" role="banner">
    <div class="ts-header__inner">
      <a class="ts-header__brand" href="#hero">Terra &amp; Stone</a>
      <nav class="ts-header__nav" aria-label="Primary">
        <a class="ts-header__link" href="#about">Studio</a>
        <a class="ts-header__link" href="#portfolio">Portfolio</a>
        <a class="ts-header__link" href="#process">Process</a>
        <a class="ts-header__link" href="#contact">Contact</a>
      </nav>
      <button class="ts-header__toggle" type="button" aria-expanded="false" aria-controls="ts-nav-drawer" aria-label="Open menu">
        <span></span><span></span><span></span>
      </button>
    </div>
  </header>
  <div class="ts-nav-drawer" id="ts-nav-drawer">
    <a class="ts-nav-drawer__link" href="#about">Studio</a>
    <a class="ts-nav-drawer__link" href="#portfolio">Portfolio</a>
    <a class="ts-nav-drawer__link" href="#process">Process</a>
    <a class="ts-nav-drawer__link" href="#contact">Contact</a>
  </div>

  <main id="main-content" role="main">
    ${heroSection()}
    ${aboutSection()}
    ${data.chapters.map((c, i) => chapterSection(c, i)).join('')}
    ${gallerySection()}
    ${testimonialsSection()}
    ${processSection()}
    ${areasSection()}
    ${contactSection()}
  </main>

  <footer class="ts-footer" role="contentinfo">
    <div class="ts-container">
      <div class="ts-footer__legal">
        <span>&copy; 2026 Terra &amp; Stone. All rights reserved.</span>
        <span>Licensed · Bonded · Insured</span>
      </div>
    </div>
  </footer>
  <div class="ts-grain" aria-hidden="true"></div>
  `,
  );
}
