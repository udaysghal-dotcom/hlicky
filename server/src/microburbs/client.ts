import { env } from '../env';
import { DiskCache } from './cache';

/**
 * Microburbs API client.
 *
 *   const profile = await mb<PropertyProfile>(p`/properties/${gnafId}/profile`);
 *   if (isNoData(profile)) …
 *
 * - Bearer auth with MICROBURBS_API_KEY.
 * - Unwraps the `{ data }` envelope.
 * - Missing data (HTTP 200, `available: false`) → a `NoData` value, never a throw.
 * - HTTP 4xx/5xx and network failures → `MicroburbsError` (typed `kind`).
 * - Successful responses are disk-cached by full URL (7-day TTL). If the network
 *   fails, a stale cache entry is served instead (offline demo replay).
 */

export const MICROBURBS_BASE_URL = 'https://api.microburbs.com.au';

/** Microburbs answered, but has no data for this request. Not an error. */
export interface NoData {
  kind: 'no-data';
  /** Microburbs' machine reason, e.g. "no_data". */
  reason: string;
  /** Microburbs' human message, e.g. "No flood overlay for GANT_703835649". */
  message: string;
  /** The API path that returned no data. */
  path: string;
}

export const isNoData = (value: unknown): value is NoData =>
  typeof value === 'object' && value !== null && (value as NoData).kind === 'no-data';

export type MicroburbsErrorKind =
  | 'unauthorized' // 401 — missing/invalid key
  | 'payment-required' // 402 — out of credit
  | 'forbidden' // 403 — e.g. sandbox key outside fixtures
  | 'not-found' // 404
  | 'validation' // 422 — FastAPI { detail: [...] }
  | 'rate-limited' // 429
  | 'server' // 5xx
  | 'http' // any other non-2xx
  | 'network' // fetch failed / timed out, nothing cached
  | 'offline-miss'; // MICROBURBS_CACHE_MODE=offline and nothing cached

export class MicroburbsError extends Error {
  override readonly name = 'MicroburbsError';
  constructor(
    readonly kind: MicroburbsErrorKind,
    message: string,
    readonly path: string,
    readonly status?: number,
    /** Raw `detail` from the response body (string or FastAPI validation list). */
    readonly detail?: unknown,
  ) {
    super(message);
  }
}

export type MbParams = Record<string, string | number | boolean | null | undefined>;

export interface MbOptions {
  /** Skip the cache read (still writes the fresh response). */
  fresh?: boolean;
  /** Per-attempt timeout. Default 20 s. */
  timeoutMs?: number;
}

/**
 * Tagged template that URL-encodes each interpolated path segment:
 *   p`/suburbs/${'St Kilda (Vic.)'}/crime/summary` → "/suburbs/St%20Kilda%20(Vic.)/crime/summary"
 */
export function p(strings: TemplateStringsArray, ...segments: Array<string | number>): string {
  return strings.reduce(
    (acc, s, i) => acc + s + (i < segments.length ? encodeURIComponent(String(segments[i])) : ''),
    '',
  );
}

const cache = new DiskCache(env.microburbsCacheDir, env.microburbsCacheTtlMs);
const inFlight = new Map<string, Promise<unknown>>();

const MAX_RETRIES = 2;

/** Build the canonical URL (sorted params, `/v1` prefix) — also the cache key. */
export function mbUrl(path: string, params: MbParams = {}): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(clean.startsWith('/v1/') ? clean : `/v1${clean}`, MICROBURBS_BASE_URL);
  for (const key of Object.keys(params).sort()) {
    const value = params[key];
    if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
  }
  return url.toString();
}

export async function mb<T>(path: string, params: MbParams = {}, opts: MbOptions = {}): Promise<T | NoData> {
  const url = mbUrl(path, params);
  const apiPath = new URL(url).pathname;

  // Collapse concurrent identical requests (topic tools run in parallel).
  let pending = inFlight.get(url) as Promise<unknown> | undefined;
  if (!pending) {
    pending = fetchEnvelope(url, apiPath, opts).finally(() => inFlight.delete(url));
    inFlight.set(url, pending);
  }
  return unwrap<T>(await pending, apiPath);
}

/** Turn a raw Microburbs JSON body into `T` or `NoData`. */
function unwrap<T>(body: unknown, apiPath: string): T | NoData {
  if (typeof body !== 'object' || body === null) return body as T;
  const env_ = body as { data?: unknown; available?: boolean; reason?: string; message?: string };
  if (env_.available === false) {
    return {
      kind: 'no-data',
      reason: env_.reason ?? 'no_data',
      message: env_.message ?? `No data for ${apiPath}`,
      path: apiPath,
    };
  }
  if (!('data' in env_)) return body as T; // e.g. /v1/me has no envelope
  if (env_.data === null || env_.data === undefined) {
    return { kind: 'no-data', reason: 'null', message: `Empty response for ${apiPath}`, path: apiPath };
  }
  return env_.data as T;
}

async function fetchEnvelope(url: string, apiPath: string, opts: MbOptions): Promise<unknown> {
  if (!opts.fresh || env.microburbsOffline) {
    const hit = await cache.get(url, { allowStale: env.microburbsOffline });
    if (hit) return hit.body;
  }
  if (env.microburbsOffline) {
    throw new MicroburbsError('offline-miss', `Offline mode and no cached response for ${apiPath}`, apiPath);
  }

  let lastError: MicroburbsError | undefined;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) await sleep(backoffMs(attempt, lastError));
    try {
      const body = await fetchOnce(url, apiPath, opts.timeoutMs ?? 20_000);
      await cache.set(url, body).catch((err) => console.warn(`[microburbs] cache write failed: ${err}`));
      return body;
    } catch (err) {
      lastError =
        err instanceof MicroburbsError
          ? err
          : new MicroburbsError('network', `Network error calling ${apiPath}: ${errMessage(err)}`, apiPath);
      if (!isRetryable(lastError)) break;
    }
  }

  // Network trouble → replay a stale cache entry if we have one.
  if (lastError && (lastError.kind === 'network' || lastError.kind === 'server')) {
    const stale = await cache.get(url, { allowStale: true });
    if (stale) {
      console.warn(`[microburbs] ${lastError.message} — serving cached response from ${stale.fetchedAt.toISOString()}`);
      return stale.body;
    }
  }
  throw lastError!;
}

async function fetchOnce(url: string, apiPath: string, timeoutMs: number): Promise<unknown> {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${env.microburbsApiKey}`, Accept: 'application/json' },
    signal: AbortSignal.timeout(timeoutMs),
  });
  const text = await res.text();
  let body: unknown;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  if (res.ok) return body;

  const detail = typeof body === 'object' && body !== null ? (body as { detail?: unknown }).detail : body;
  const err = new MicroburbsError(
    kindForStatus(res.status),
    `Microburbs ${res.status} on ${apiPath}: ${formatDetail(detail)}`,
    apiPath,
    res.status,
    detail,
  );
  const retryAfter = Number(res.headers.get('retry-after'));
  if (Number.isFinite(retryAfter) && retryAfter > 0) retryAfterMs.set(err, retryAfter * 1000);
  throw err;
}

function kindForStatus(status: number): MicroburbsErrorKind {
  if (status === 401) return 'unauthorized';
  if (status === 402) return 'payment-required';
  if (status === 403) return 'forbidden';
  if (status === 404) return 'not-found';
  if (status === 422) return 'validation';
  if (status === 429) return 'rate-limited';
  if (status >= 500) return 'server';
  return 'http';
}

function formatDetail(detail: unknown): string {
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((d: { loc?: unknown[]; msg?: string }) => `${(d.loc ?? []).join('.')}: ${d.msg ?? JSON.stringify(d)}`)
      .join('; ');
  }
  return JSON.stringify(detail);
}

const retryAfterMs = new WeakMap<MicroburbsError, number>();
const isRetryable = (e: MicroburbsError) => e.kind === 'network' || e.kind === 'server' || e.kind === 'rate-limited';
const backoffMs = (attempt: number, e?: MicroburbsError) =>
  Math.min((e && retryAfterMs.get(e)) ?? 500 * 2 ** (attempt - 1), 10_000);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const errMessage = (err: unknown) =>
  err instanceof Error ? (err.cause instanceof Error ? `${err.message} (${err.cause.message})` : err.message) : String(err);
