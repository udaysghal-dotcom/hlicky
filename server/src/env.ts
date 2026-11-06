import { config } from 'dotenv';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

/** Absolute path of the `server/` package, independent of the process cwd. */
export const SERVER_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

config({ path: path.join(SERVER_ROOT, '.env') });

export const env = {
  microburbsApiKey: process.env.MICROBURBS_API_KEY?.trim() || 'test',
  microburbsCacheDir:
    process.env.MICROBURBS_CACHE_DIR?.trim() || path.join(SERVER_ROOT, '.cache', 'microburbs'),
  microburbsCacheTtlMs: Number(process.env.MICROBURBS_CACHE_TTL_HOURS || 168) * 3600_000,
  microburbsOffline: process.env.MICROBURBS_CACHE_MODE?.trim() === 'offline',
};

export const isSandboxKey = () => env.microburbsApiKey === 'test';
