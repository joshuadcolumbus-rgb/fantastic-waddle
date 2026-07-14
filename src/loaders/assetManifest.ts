import { readThemeConfig } from '@/utils/dom-data';

/**
 * Central asset URL resolution. Shopify serves theme assets from its CDN at
 * a versioned base path that Liquid injects into ts-config; the dev harness
 * serves the same file names from Vite's public dir.
 *
 * The flat Shopify assets directory uses prefix conventions instead of
 * folders: tex-*.ktx2 / model-*.glb / font-*.woff2.
 */
let base: string | null = null;

export function assetsBase(): string {
  if (base === null) {
    base = readThemeConfig().assetsBase;
    if (!base.endsWith('/')) base += '/';
  }
  return base;
}

export const assetUrl = (file: string): string => `${assetsBase()}${file}`;

export const modelUrl = (name: string): string => assetUrl(`model-${name}.glb`);
export const textureUrl = (name: string, ext: 'ktx2' | 'webp' = 'ktx2'): string =>
  assetUrl(`tex-${name}.${ext}`);
