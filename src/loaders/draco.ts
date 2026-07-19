import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { assetsBase } from '@/loaders/assetManifest';

/**
 * GLTF pipeline for premium sculpted assets: DRACO + meshopt decoding, with
 * decoder binaries self-hosted in theme/assets (canonical file names, so the
 * loaders resolve them straight from the CDN base path). Decoders are only
 * fetched when a model actually loads — the procedural v1 scene costs nothing.
 */
let loader: GLTFLoader | null = null;

export function gltfLoader(): GLTFLoader {
  if (!loader) {
    const draco = new DRACOLoader();
    draco.setDecoderPath(assetsBase());
    loader = new GLTFLoader();
    loader.setDRACOLoader(draco);
    loader.setMeshoptDecoder(MeshoptDecoder);
  }
  return loader;
}

export const loadModel = (url: string): Promise<GLTF> =>
  new Promise((resolve, reject) => gltfLoader().load(url, resolve, undefined, reject));
