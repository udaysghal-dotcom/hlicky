/**
 * Resolve an address or GNAF ID to a Property and print it.
 *
 *   pnpm mb:probe "27 Arlington St, Belmont North NSW 2280"
 *   pnpm mb:probe GANSW704074813
 *   pnpm mb:probe --fixtures          # list sandbox fixtures
 */
import { env, isSandboxKey } from '../src/env';
import { MicroburbsError, PropertyNotFoundError, resolveProperty, SANDBOX_PROPERTIES } from '../src/microburbs';

const query = process.argv.slice(2).filter((a) => a !== '--').join(' ').trim();

if (!query || query === '--fixtures') {
  console.log('Usage: pnpm mb:probe "<address or GNAF ID>"\n\nSandbox fixtures (key `test`):');
  for (const f of SANDBOX_PROPERTIES) console.log(`  ${f.gnafId}  ${f.street}, ${f.suburb} ${f.state} ${f.postcode}`);
  process.exit(query ? 0 : 1);
}

console.error(
  `[mb:probe] key=${isSandboxKey() ? 'test (sandbox)' : 'real'}  cache=${env.microburbsCacheDir}` +
    (env.microburbsOffline ? '  OFFLINE' : ''),
);
const started = Date.now();
try {
  const property = await resolveProperty(query);
  console.log(JSON.stringify(property, null, 2));
  console.error(`[mb:probe] resolved in ${Date.now() - started} ms`);
} catch (err) {
  if (err instanceof PropertyNotFoundError) console.error(`Not found: ${err.message}`);
  else if (err instanceof MicroburbsError) console.error(`Microburbs error [${err.kind}${err.status ? ` ${err.status}` : ''}]: ${err.message}`);
  else throw err;
  process.exit(1);
}
