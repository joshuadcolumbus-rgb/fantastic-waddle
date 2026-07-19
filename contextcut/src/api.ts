import type { ContextCutConfig } from './config.js';

// In production, this would be your actual Cloudflare Worker URL
const API_BASE_URL = process.env.CONTEXTCUT_API_URL || 'https://contextcut-api.your-subdomain.workers.dev';

interface TeamData {
  id: string;
  name?: string;
  plan?: string;
}

interface VerifyResponse {
  active: boolean;
  team: TeamData;
}

export interface RemoteConfigResult {
  team: TeamData;
  config: Partial<ContextCutConfig>;
}

/** Rejected credentials — the caller should fail hard rather than degrade. */
export class LicenseError extends Error {}

/**
 * Authenticates against the Edge API and pulls down team configurations.
 * Throws LicenseError on rejected credentials; plain Error on network/server
 * trouble so the caller can choose to continue with local config.
 */
export async function fetchRemoteConfig(licenseKey: string): Promise<RemoteConfigResult> {
  // Step 1: Validate License
  const verifyRes = await fetch(`${API_BASE_URL}/api/verify`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${licenseKey}` },
  });

  if (verifyRes.status === 401 || verifyRes.status === 403) {
    const errorData = (await verifyRes.json().catch(() => ({}))) as { error?: string };
    throw new LicenseError(errorData.error || 'Invalid or expired license key');
  }
  if (!verifyRes.ok) {
    throw new Error(`License verification failed (HTTP ${verifyRes.status})`);
  }

  const { team } = (await verifyRes.json()) as VerifyResponse;

  // Step 2: Fetch the Team's custom rules — the worker keys teams by `id`
  const configRes = await fetch(`${API_BASE_URL}/api/config/${team.id}`, {
    headers: { Authorization: `Bearer ${licenseKey}` },
  });

  if (configRes.status === 404) {
    // License is valid, but the team hasn't saved a custom config yet
    return { team, config: {} };
  }
  if (!configRes.ok) {
    throw new Error(`Failed to retrieve team configuration from Edge (HTTP ${configRes.status})`);
  }

  return { team, config: (await configRes.json()) as Partial<ContextCutConfig> };
}
