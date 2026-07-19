import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import glsl from 'vite-plugin-glsl';

/**
 * Two modes:
 *  - `vite` (dev)      → serves dev/index.html, a standalone harness that mirrors
 *                        the markup the Liquid sections render, importing src/ directly.
 *  - `vite build`      → bundles src/main.ts into theme/assets with STABLE file names
 *                        (app.js / app.css / webgl.js) so Liquid references never change.
 *
 * Shopify's assets directory is flat: every output file must live at the top
 * level of theme/assets, so chunk names are fixed and no subfolders are emitted.
 */
export default defineConfig(({ command }) => ({
  root: command === 'serve' ? 'dev' : '.',
  publicDir: command === 'serve' ? fileURLToPath(new URL('./public', import.meta.url)) : false,
  plugins: [glsl()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    outDir: 'theme/assets',
    emptyOutDir: false,
    target: 'es2022',
    cssCodeSplit: false,
    sourcemap: false,
    rollupOptions: {
      input: fileURLToPath(new URL('./src/main.ts', import.meta.url)),
      output: {
        entryFileNames: 'app.js',
        chunkFileNames: (chunk) => (chunk.name === 'webgl' ? 'webgl.js' : 'webgl-[name].js'),
        assetFileNames: (asset) =>
          asset.names?.some((n) => n.endsWith('.css')) ? 'app.css' : '[name][extname]',
      },
    },
    chunkSizeWarningLimit: 1600,
  },
}));
