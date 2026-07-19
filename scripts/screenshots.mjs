/**
 * Visual verification against the dev harness. Expects `npm run dev` to be
 * serving on :5173 (or pass PORT). Captures the journey at several beats,
 * the mobile framing, and the reduced-motion static fallback, and fails on
 * console errors.
 *
 * Usage: node scripts/screenshots.mjs
 */
import { mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'dev', 'screenshots');
mkdirSync(outDir, { recursive: true });

const BASE = process.env.HARNESS_URL ?? 'http://localhost:5173/';
const errors = [];

const browser = await chromium.launch({
  // Pre-provisioned Chromium (env may pin a different playwright version).
  executablePath: process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});

async function newPage(options = {}) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    ...options,
  });
  const page = await context.newPage();
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const location = msg.location();
      errors.push(`[console] ${msg.text()} (${location.url})`);
    }
  });
  page.on('pageerror', (err) => errors.push(`[pageerror] ${err.message}`));
  return { page, context };
}

async function scrollTo(page, fraction, settleMs = 2600) {
  await page.evaluate((f) => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({ top: max * f, behavior: 'auto' });
  }, fraction);
  await page.waitForTimeout(settleMs);
}

/* ---- desktop journey ---- */
{
  const { page, context } = await newPage();
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(6500); // staging + intro
  await page.screenshot({ path: join(outDir, '01-hero-dawn.png') });

  await scrollTo(page, 0.18);
  await page.screenshot({ path: join(outDir, '02-morning-chapters.png') });

  await scrollTo(page, 0.42);
  await page.screenshot({ path: join(outDir, '03-midday-water.png') });

  await scrollTo(page, 0.58);
  await page.screenshot({ path: join(outDir, '04-dusk-lighting.png') });

  await scrollTo(page, 0.78);
  await page.screenshot({ path: join(outDir, '05-night-gallery.png') });

  await scrollTo(page, 1.0, 3200);
  await page.screenshot({ path: join(outDir, '06-contact-still-water.png') });

  // Lazy-load check: webgl chunk must be a separate request.
  const webglLoaded = await page.evaluate(() =>
    performance.getEntriesByType('resource').some((e) => e.name.includes('webgl')),
  );
  console.log(`webgl chunk lazy-loaded: ${webglLoaded}`);
  await context.close();
}

/* ---- mobile framing ---- */
{
  const { page, context } = await newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2,
  });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(6000);
  await page.screenshot({ path: join(outDir, '07-mobile-hero.png') });
  await scrollTo(page, 0.5);
  await page.screenshot({ path: join(outDir, '08-mobile-midway.png') });
  await context.close();
}

/* ---- reduced motion: static premium fallback, no WebGL ---- */
{
  const { page, context } = await newPage({ reducedMotion: 'reduce' });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const state = await page.evaluate(() => ({
    motion: document.documentElement.dataset.motion,
    webgl: document.documentElement.dataset.webgl,
    canvasChildren: document.getElementById('ts-canvas-root')?.childElementCount ?? -1,
    webglRequested: performance.getEntriesByType('resource').some((e) => e.name.includes('webgl')),
  }));
  console.log('reduced-motion state:', JSON.stringify(state));
  await page.screenshot({ path: join(outDir, '09-reduced-motion-fallback.png') });
  await context.close();
  if (state.webglRequested) errors.push('reduced-motion still downloaded the webgl chunk');
  if (state.motion !== 'reduced') errors.push('reduced-motion gate did not engage');
}

await browser.close();

if (errors.length > 0) {
  console.error('\nFAILURES:');
  for (const e of errors) console.error(' -', e);
  process.exit(1);
}
console.log('\nAll screenshots captured cleanly →', outDir);
