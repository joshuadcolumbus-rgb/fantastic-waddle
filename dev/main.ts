/**
 * Dev-only entry: registers the same variable fonts the theme self-hosts,
 * builds the harness DOM (mirroring Liquid output), then boots the real
 * theme runtime. Order matters — the DOM must exist before boot measures
 * scene anchors, hence the dynamic import.
 */
import '@fontsource-variable/fraunces';
import '@fontsource-variable/fraunces/wght-italic.css';
import '@fontsource-variable/inter';
import { renderHarness } from './harness';

renderHarness();

await import('../src/main');
