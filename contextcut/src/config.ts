import { promises as fs } from 'fs';
import * as path from 'path';

export interface ContextCutConfig {
  mode: 'skeleton' | 'full-text';
  ignoreDirs?: string[];
}

const VALID_MODES = new Set(['skeleton', 'full-text']);

const DEFAULT_CONFIG: ContextCutConfig = {
  mode: 'skeleton',
  ignoreDirs: [],
};

/**
 * Attempts to load and parse a .contextcutrc file from the target directory.
 * Falls back to DEFAULT_CONFIG if missing or malformed. A missing file is the
 * normal case and stays silent; a malformed one gets a warning so a typo'd
 * config doesn't get silently ignored.
 */
export async function loadConfig(targetDir: string): Promise<ContextCutConfig> {
  const configPath = path.join(targetDir, '.contextcutrc');

  let raw: string;
  try {
    raw = await fs.readFile(configPath, 'utf-8');
  } catch {
    return DEFAULT_CONFIG;
  }

  try {
    const parsed = JSON.parse(raw);

    if (parsed.mode !== undefined && !VALID_MODES.has(parsed.mode)) {
      console.warn(`[ContextCut] Unknown mode "${parsed.mode}" in .contextcutrc — using "${DEFAULT_CONFIG.mode}".`);
      delete parsed.mode;
    }
    if (parsed.ignoreDirs !== undefined && !Array.isArray(parsed.ignoreDirs)) {
      console.warn('[ContextCut] "ignoreDirs" in .contextcutrc must be an array — ignoring it.');
      delete parsed.ignoreDirs;
    }

    return { ...DEFAULT_CONFIG, ...parsed };
  } catch (err) {
    console.warn(`[ContextCut] Malformed .contextcutrc — using defaults. (${(err as Error).message})`);
    return DEFAULT_CONFIG;
  }
}
