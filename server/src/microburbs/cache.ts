import { createHash } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

/**
 * Disk JSON cache keyed by full request URL. One file per URL.
 *
 * Doubles as offline replay for the demo: entries past their TTL are still
 * returned by `get(..., { allowStale: true })`, which the client uses when the
 * network is unreachable or MICROBURBS_CACHE_MODE=offline.
 */
export interface CacheEntry<T = unknown> {
  url: string;
  fetchedAt: string;
  body: T;
}

export interface CacheHit<T> {
  body: T;
  fetchedAt: Date;
  stale: boolean;
}

export class DiskCache {
  constructor(
    private readonly dir: string,
    private readonly ttlMs: number,
  ) {}

  private fileFor(url: string): string {
    const hash = createHash('sha256').update(url).digest('hex').slice(0, 32);
    return path.join(this.dir, `${hash}.json`);
  }

  async get<T>(url: string, opts: { allowStale?: boolean } = {}): Promise<CacheHit<T> | undefined> {
    let entry: CacheEntry<T>;
    try {
      entry = JSON.parse(await readFile(this.fileFor(url), 'utf8')) as CacheEntry<T>;
    } catch {
      return undefined; // missing or corrupt → miss
    }
    if (entry.url !== url) return undefined; // hash collision guard
    const fetchedAt = new Date(entry.fetchedAt);
    const stale = Date.now() - fetchedAt.getTime() > this.ttlMs;
    if (stale && !opts.allowStale) return undefined;
    return { body: entry.body, fetchedAt, stale };
  }

  async set<T>(url: string, body: T): Promise<void> {
    await mkdir(this.dir, { recursive: true });
    const file = this.fileFor(url);
    const entry: CacheEntry<T> = { url, fetchedAt: new Date().toISOString(), body };
    // Write-then-rename so a crash mid-write never leaves a half-written entry.
    const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
    await writeFile(tmp, JSON.stringify(entry, null, 2));
    await rename(tmp, file);
  }
}
