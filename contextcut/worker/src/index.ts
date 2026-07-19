import Stripe from 'stripe';

export interface Env {
  // Binds the Cloudflare KV namespace to our worker
  //   license_<key>  -> JSON team data: { "id": "<teamId>", ... }
  //   config_<teamId> -> JSON .contextcutrc payload
  CONTEXTCUT_DB: KVNamespace;
  // Set via `wrangler secret put <NAME>` — never in wrangler.toml [vars]
  STRIPE_API_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
}

interface TeamData {
  id: string;
  name?: string;
  plan?: string;
  active?: boolean;
  createdAt?: string;
}

// Standard CORS headers so the CLI and future Dashboard can hit the API
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

/** JSON response with CORS + Content-Type applied consistently. */
function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

/** Extracts the Bearer token from a request, or null. */
function bearerToken(request: Request): string | null {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return authHeader.slice('Bearer '.length) || null;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // Route: Stripe Webhook (license provisioning)
      if (path === '/api/webhooks/stripe' && request.method === 'POST') {
        return await handleStripeWebhook(request, env);
      }

      // Route: License Verification
      if (path === '/api/verify' && request.method === 'POST') {
        return await handleVerify(request, env);
      }

      // Route: Sync Remote Configuration
      if (path.startsWith('/api/config/') && request.method === 'GET') {
        const teamId = path.split('/')[3];
        return await handleConfigSync(request, env, teamId);
      }

      return json({ error: 'Route not found' }, 404);
    } catch (error) {
      console.error('[contextcut-api]', error);
      return json({ error: 'Internal Edge Error' }, 500);
    }
  },
};

/**
 * Validates a license key and returns the associated team context.
 */
async function handleVerify(request: Request, env: Env): Promise<Response> {
  const licenseKey = bearerToken(request);
  if (!licenseKey) {
    return json({ error: 'Missing or invalid token' }, 401);
  }

  // Look up the license in KV (Format: "license_<key>" -> JSON string of team data)
  const licenseData = await env.CONTEXTCUT_DB.get<TeamData>(`license_${licenseKey}`, 'json');

  if (!licenseData) {
    return json({ active: false, error: 'Invalid or expired license' }, 403);
  }

  return json({ active: true, team: licenseData }, 200);
}

/**
 * Fetches the team-wide .contextcutrc configuration. The caller's license must
 * belong to the requested team — an Authorization header alone is not enough,
 * or any bearer value could read any team's config.
 */
async function handleConfigSync(request: Request, env: Env, teamId: string): Promise<Response> {
  if (!teamId) {
    return json({ error: 'Missing team id' }, 400);
  }

  const licenseKey = bearerToken(request);
  if (!licenseKey) {
    return json({ error: 'Unauthorized' }, 401);
  }

  const licenseData = await env.CONTEXTCUT_DB.get<TeamData>(`license_${licenseKey}`, 'json');
  if (!licenseData) {
    return json({ error: 'Invalid or expired license' }, 403);
  }
  if (licenseData.id !== teamId) {
    return json({ error: 'License does not grant access to this team' }, 403);
  }

  // Look up the team's config in KV (Format: "config_<teamId>" -> JSON config)
  const config = await env.CONTEXTCUT_DB.get(`config_${teamId}`, 'json');

  if (!config) {
    // If no remote config exists, return 404 so the CLI knows to use local defaults
    return json({ error: 'No remote configuration found' }, 404);
  }

  return json(config, 200);
}

/**
 * Handles incoming webhooks from Stripe, securely verifying the signature at the edge.
 */
async function handleStripeWebhook(request: Request, env: Env): Promise<Response> {
  // 1. Extract the Stripe signature header
  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return json({ error: 'Missing signature' }, 400);
  }

  // 2. Initialize Stripe with the Edge-compatible HTTP client
  const stripe = new Stripe(env.STRIPE_API_KEY, {
    httpClient: Stripe.createFetchHttpClient(),
  });

  try {
    // 3. Read the request body as text (required for signature validation)
    const body = await request.text();

    // 4. Validate asynchronously using Web Crypto API
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
      undefined,
      Stripe.createSubtleCryptoProvider()
    );

    // 5. Process a successful checkout
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;

      // Guest checkouts (and `stripe trigger` fixtures) can arrive without a customer.
      // Ack with 200 so Stripe doesn't retry forever, but never mint an ownerless key.
      // Real checkout sessions should be created with customer_creation: 'always'.
      if (!customerId) {
        console.error(`[Webhook Error] checkout.session.completed without customer (session ${session.id})`);
        return json({ received: true, provisioned: false }, 200);
      }

      // Stripe retries webhooks — never mint a second license for the same session
      const sessionMarker = `stripe_session_${session.id}`;
      if (await env.CONTEXTCUT_DB.get(sessionMarker)) {
        return json({ received: true, duplicate: true }, 200);
      }

      // Generate a secure, URL-safe license key
      const rawUuid = crypto.randomUUID().replace(/-/g, '');
      const licenseKey = `cc_key_${rawUuid}`;

      // Construct the team payload — the rest of the system keys teams by `id`
      const teamData: TeamData = {
        id: customerId, // Using Stripe's Customer ID as the internal Team ID
        plan: 'premium',
        active: true,
        createdAt: new Date().toISOString(),
      };

      // 6. Write the License Key and default Team Config to KV storage
      await env.CONTEXTCUT_DB.put(`license_${licenseKey}`, JSON.stringify(teamData));

      const defaultConfig = { mode: 'skeleton', ignoreDirs: [] };
      await env.CONTEXTCUT_DB.put(`config_${customerId}`, JSON.stringify(defaultConfig));
      await env.CONTEXTCUT_DB.put(sessionMarker, licenseKey);

      // Truncated on purpose: the full key is a credential and must stay out of logs
      console.log(`[ContextCut] Provisioned new license: ${licenseKey.slice(0, 11)}… for ${customerId}`);
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (err) {
    console.error(`[Webhook Error] ${(err as Error).message}`);
    return json({ error: 'Webhook signature verification failed' }, 400);
  }
}
