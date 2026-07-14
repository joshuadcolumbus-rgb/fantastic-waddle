import type { Texture, WebGLRenderer } from 'three';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';
import { assetsBase } from '@/loaders/assetManifest';

/**
 * KTX2/Basis compressed texture loading (UASTC for normals, ETC1S for
 * albedo). The transcoder wasm is self-hosted in theme/assets and fetched
 * only when a .ktx2 texture is requested.
 */
let loader: KTX2Loader | null = null;

export function ktx2Loader(renderer: WebGLRenderer): KTX2Loader {
  if (!loader) {
    loader = new KTX2Loader();
    loader.setTranscoderPath(assetsBase());
    loader.detectSupport(renderer);
  }
  return loader;
}

export const loadKtx2 = (renderer: WebGLRenderer, url: string): Promise<Texture> =>
  new Promise((resolve, reject) => ktx2Loader(renderer).load(url, resolve, undefined, reject));
