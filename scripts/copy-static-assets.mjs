/**
 * Copies static runtime assets into theme/assets after each Vite build.
 *
 * Shopify's assets directory is flat, so everything lands at the top level:
 *  - Self-hosted variable fonts (Fraunces display + Inter text).
 *  - DRACO + Basis(KTX2) decoder binaries, kept under their canonical file
 *    names because DRACOLoader/KTX2Loader resolve them by name from a base
 *    path. They are only fetched on demand when a compressed .glb / .ktx2
 *    asset is actually loaded, so shipping them costs nothing at runtime.
 */
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'theme', 'assets');
mkdirSync(out, { recursive: true });

const copies = [
  // Variable fonts (latin subsets)
  ['node_modules/@fontsource-variable/fraunces/files/fraunces-latin-wght-normal.woff2', 'font-fraunces-var.woff2'],
  ['node_modules/@fontsource-variable/fraunces/files/fraunces-latin-wght-italic.woff2', 'font-fraunces-var-italic.woff2'],
  ['node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2', 'font-inter-var.woff2'],
  // DRACO decoder (canonical names expected by DRACOLoader.setDecoderPath)
  ['node_modules/three/examples/jsm/libs/draco/gltf/draco_decoder.js', 'draco_decoder.js'],
  ['node_modules/three/examples/jsm/libs/draco/gltf/draco_decoder.wasm', 'draco_decoder.wasm'],
  ['node_modules/three/examples/jsm/libs/draco/gltf/draco_wasm_wrapper.js', 'draco_wasm_wrapper.js'],
  // Basis transcoder (canonical names expected by KTX2Loader.setTranscoderPath)
  ['node_modules/three/examples/jsm/libs/basis/basis_transcoder.js', 'basis_transcoder.js'],
  ['node_modules/three/examples/jsm/libs/basis/basis_transcoder.wasm', 'basis_transcoder.wasm'],
];

let failed = false;
for (const [src, dest] of copies) {
  const from = join(root, src);
  if (!existsSync(from)) {
    console.error(`✗ missing source asset: ${src}`);
    failed = true;
    continue;
  }
  copyFileSync(from, join(out, dest));
  console.log(`✓ ${dest}`);
}
if (failed) process.exit(1);
