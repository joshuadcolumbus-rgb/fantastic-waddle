/**
 * webgl.js chunk entry — everything three.js lives behind this dynamic
 * import. Mounts the R3F canvas into #ts-canvas-root (rendered by the
 * canvas-root Liquid snippet, fixed behind the DOM content).
 */
import { createRoot } from 'react-dom/client';
import { createElement } from 'react';
import { CanvasRoot } from '@/components/CanvasRoot';

export function mountWebgl(): void {
  const host = document.getElementById('ts-canvas-root');
  if (!host) throw new Error('missing #ts-canvas-root');
  createRoot(host).render(createElement(CanvasRoot));
}
