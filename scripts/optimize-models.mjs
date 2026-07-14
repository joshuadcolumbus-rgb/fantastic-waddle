/**
 * Optimizes GLTF/GLB source models into theme-ready, compressed .glb files.
 *
 * Usage: place source models in assets-src/models/, then `npm run assets:models`.
 * Each model is DRACO-compressed, meshopt-optimized, pruned and welded via
 * gltf-transform, then written to theme/assets/model-<name>.glb.
 *
 * The v1 environment is fully procedural, so this pipeline ships empty — it
 * exists so premium sculpted assets (specimen trees, stone set pieces) can be
 * dropped in later without any loader or performance work.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { basename, dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = join(root, 'assets-src', 'models');
const outDir = join(root, 'theme', 'assets');

if (!existsSync(srcDir)) {
  console.log('No assets-src/models directory — nothing to optimize.');
  process.exit(0);
}
mkdirSync(outDir, { recursive: true });

const models = readdirSync(srcDir).filter((f) => ['.glb', '.gltf'].includes(extname(f)));
if (models.length === 0) {
  console.log('No source models found in assets-src/models.');
  process.exit(0);
}

const cli = join(root, 'node_modules', '.bin', 'gltf-transform');
for (const file of models) {
  const name = basename(file, extname(file));
  const out = join(outDir, `model-${name}.glb`);
  execFileSync(cli, ['optimize', join(srcDir, file), out, '--compress', 'draco', '--texture-compress', 'webp'], {
    stdio: 'inherit',
  });
  console.log(`✓ model-${name}.glb`);
}
