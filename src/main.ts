/**
 * app.js entry — the only script theme.liquid loads directly.
 *
 * Deliberately small: styles, the DOM choreography layer and the boot gates.
 * The heavy WebGL bundle (three.js / R3F / postprocessing) lives in a
 * separate `webgl.js` chunk that bootstrap dynamically imports only when the
 * device will actually run it.
 */
import '@/styles/index.css';
import { boot } from '@/app/bootstrap';

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
