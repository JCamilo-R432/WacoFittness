/**
 * Cloudflare Worker — Geo-Routing + Data Residency
 * Deploy: wrangler deploy infrastructure/edge/geo-routing.ts
 *
 * Handles:
 *  1. Data residency: EU/GDPR users → EU cluster
 *  2. Latency-based routing for other regions
 *  3. Custom domain white-label resolution
 *  4. Edge caching for static + public API responses
 */

interface Env {
  WACOPRO_API_US_EAST: string;   // "https://us-east.wacopro.com"
  WACOPRO_API_EU_CENTRAL: string; // "https://eu.wacopro.com"
  WACOPRO_API_AP_SOUTHEAST: string; // "https://ap.wacopro.com"
  API_SECRET: string;
}

// Countries that MUST use EU region (GDPR + data residency)
const EU_GDPR_COUNTRIES = new Set([
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
  'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
  'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
  'GB', 'NO', 'IS', 'LI', 'CH', // EEA + UK + Switzerland
]);

// Countries that prefer Asia-Pacific
const APAC_COUNTRIES = new Set([
  'JP', 'KR', 'SG', 'AU', 'NZ', 'TH', 'MY', 'ID', 'PH', 'VN', 'HK', 'TW',
]);

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const country = (request as any).cf?.country as string | undefined;
    const cfCity = (request as any).cf?.city as string | undefined;

    // ── 1. Cache static assets at edge ───────────────────────────────────
    if (isStaticAsset(url.pathname)) {
      const cache = caches.default;
      const cached = await cache.match(request);
      if (cached) {
        return addEdgeHeaders(cached, 'HIT', country);
      }
    }

    // ── 2. Data residency routing ─────────────────────────────────────────
    let targetOrigin: string;
    let region: string;

    if (country && EU_GDPR_COUNTRIES.has(country)) {
      targetOrigin = env.WACOPRO_API_EU_CENTRAL;
      region = 'eu-central-1';
    } else if (country && APAC_COUNTRIES.has(country)) {
      targetOrigin = env.WACOPRO_API_AP_SOUTHEAST;
      region = 'ap-southeast-1';
    } else {
      targetOrigin = env.WACOPRO_API_US_EAST;
      region = 'us-east-1';
    }

    // ── 3. User-specified region override (for testing) ───────────────────
    const userRegion = request.headers.get('X-Preferred-Region');
    if (userRegion === 'eu') { targetOrigin = env.WACOPRO_API_EU_CENTRAL; region = 'eu-central-1'; }
    if (userRegion === 'ap') { targetOrigin = env.WACOPRO_API_AP_SOUTHEAST; region = 'ap-southeast-1'; }
    if (userRegion === 'us') { targetOrigin = env.WACOPRO_API_US_EAST; region = 'us-east-1'; }

    // ── 4. Build proxied request ──────────────────────────────────────────
    const targetUrl = new URL(url.pathname + url.search, targetOrigin);
    const proxyRequest = new Request(targetUrl.toString(), {
      method: request.method,
      headers: request.headers,
      body: request.body,
      redirect: 'follow',
    });

    // Add tracing headers
    const traceId = crypto.randomUUID();
    proxyRequest.headers.set('X-Source-Country', country || 'unknown');
    proxyRequest.headers.set('X-Source-City', cfCity || 'unknown');
    proxyRequest.headers.set('X-Routed-Region', region);
    proxyRequest.headers.set('X-Edge-Trace-Id', traceId);
    proxyRequest.headers.set('X-Forwarded-For', request.headers.get('CF-Connecting-IP') || '');

    // ── 5. Proxy to origin ────────────────────────────────────────────────
    try {
      const response = await fetch(proxyRequest);

      // Cache public API responses (health checks, white-label configs)
      if (isCacheable(url.pathname, request.method, response.status)) {
        const cache = caches.default;
        const cacheKey = new Request(url.toString(), request);
        const responseToCache = new Response(response.clone().body, {
          status: response.status,
          headers: {
            ...Object.fromEntries(response.headers),
            'Cache-Control': 'public, max-age=60',
          },
        });
        ctx.waitUntil(cache.put(cacheKey, responseToCache));
      }

      return addEdgeHeaders(response, 'MISS', country, region, traceId);
    } catch (err) {
      // Fallback to US East if regional origin fails
      if (targetOrigin !== env.WACOPRO_API_US_EAST) {
        const fallbackUrl = new URL(url.pathname + url.search, env.WACOPRO_API_US_EAST);
        const fallbackRes = await fetch(fallbackUrl.toString(), {
          method: request.method,
          headers: request.headers,
          body: request.body,
        });
        return addEdgeHeaders(fallbackRes, 'FALLBACK', country, 'us-east-1', traceId);
      }

      return new Response(JSON.stringify({ error: 'Service unavailable', code: 'EDGE_ERROR' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },
};

// ── Helpers ────────────────────────────────────────────────────────────────

function isStaticAsset(pathname: string): boolean {
  return /\.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?|ttf|eot)$/i.test(pathname);
}

function isCacheable(pathname: string, method: string, status: number): boolean {
  return method === 'GET' && status === 200 && (
    pathname === '/api/health' ||
    pathname.startsWith('/api/enterprise/white-label/domain')
  );
}

function addEdgeHeaders(
  response: Response,
  cacheStatus: string,
  country?: string,
  region?: string,
  traceId?: string,
): Response {
  const newHeaders = new Headers(response.headers);
  newHeaders.set('X-Cache', cacheStatus);
  if (country) newHeaders.set('X-Client-Country', country);
  if (region) newHeaders.set('X-Served-Region', region);
  if (traceId) newHeaders.set('X-Edge-Trace-Id', traceId);
  newHeaders.set('X-Edge-Pop', 'cloudflare');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}
