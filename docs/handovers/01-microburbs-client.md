# Step 01 — Microburbs client, cache, Property resolver

**Status:** DONE
**Date:** 2026-11-06

## What was built
- `package.json`, `pnpm-workspace.yaml`, `tsconfig.base.json`, `.gitignore` — minimal pnpm workspace (`shared/`, `server/` only). Root scripts: `mb:probe`, `typecheck`. `packageManager: pnpm@10.34.9`.
- `shared/src/property.ts` — `Property { gnafId, address, suburb, meshBlock, lga, state, postcode }`, exported from `@hlicky/shared` (TS source, no build step).
- `server/src/env.ts` — loads `server/.env` (cwd-independent) and exposes `env` + `isSandboxKey()`.
- `server/.env.example` — `MICROBURBS_API_KEY` (default `test`), optional cache dir / TTL / offline mode.
- `server/src/microburbs/client.ts` — `mb<T>(path, params?, opts?) → T | NoData`. Bearer auth, unwraps `{data}`, `available:false` (and `data:null`) → `NoData { kind:'no-data', reason, message, path }`; non-2xx → `MicroburbsError` with `kind` (`unauthorized|payment-required|forbidden|not-found|validation|rate-limited|server|http|network|offline-miss`), `status`, `detail`. Retries 429/5xx/network twice with backoff (honours `Retry-After`), 20 s timeout, dedupes concurrent identical requests. Also `p\`…\`` tag that URL-encodes path segments, and `mbUrl()`.
- `server/src/microburbs/cache.ts` — disk JSON cache keyed by full URL (sha256 file names under `server/.cache/microburbs/`), 7-day TTL, atomic writes.
- `server/src/microburbs/sandbox-fixtures.ts` — the 8 sandbox GNAFs (address, suburb, state, postcode), the 9 sandbox suburbs, and a tolerant address matcher.
- `server/src/microburbs/resolver.ts` — `resolveProperty(addressOrGnaf)`, `geocodeAddress()`, `PropertyNotFoundError`, `looksLikeGnafId()`.
- `server/src/microburbs/index.ts` — barrel.
- `server/scripts/mb-probe.ts` — `pnpm mb:probe "<address or GNAF>"` (`--fixtures` lists fixtures).
- `docs/sandbox-fixtures.md` — what the sandbox serves, probed live.

## Decisions (and why)
- **Step 00 was still TODO.** The user asked for step 01 directly, so I created only the workspace pieces step 01 needs (root, `shared/`, `server/` with `dotenv`/`tsx`). No extension, no Hono, no README — step 00 still owns those. Step 00's text in plan.md now says to build on the existing workspace.
- **Not committed / not staged** — the user said not to commit or add anything this time. Status table updated in the working tree only.
- **Cache stores the raw envelope of 2xx responses only** (including `available:false` answers). Errors are never cached, so a 403 with the sandbox key doesn't poison the cache when a real key arrives. The cache key doesn't include the API key.
- **Offline replay:** on network/5xx failure after retries, a stale cache entry is served (with a warning). `MICROBURBS_CACHE_MODE=offline` serves only from cache, ignoring TTL — use it for step 10's "Microburbs blocked" rehearsal.
- **Property.address** is display-ready: `"<street>, <suburb without ABS suffix> <STATE> <postcode>"`. Source: fixture street (sandbox), geocode `display_name` (real key), or `street/profile` → `sale-history-latest` for a bare GNAF with a real key.
- **Real key + address → top geocode candidate.** `geocodeAddress()` is exported, so step 03 can use all candidates if it needs to disambiguate.
- **With the sandbox key, a GNAF outside the fixtures still goes to the API** (and gets a typed 403), rather than failing locally. The real error message is more useful.

## Problems hit
- `pnpm` isn't installed globally on this machine. I ran it via `corepack pnpm` (with a shim for nested `pnpm` calls in root scripts). The user needs `corepack enable` (or `npm i -g pnpm`) before `pnpm …` works.
- pnpm 10 blocks dependency build scripts by default. Added `pnpm.onlyBuiltDependencies: ["esbuild"]` to the root `package.json` (tsx worked without it, but this silences the warning and keeps it working).
- The OpenAPI example shows `"Kambah (ACT)"`, but the live API returns `"Kambah"`. Recorded in the fixtures doc.

## Gotchas for the next step
- **Always build paths with `p\`…\``** (e.g. ``p`/suburbs/${property.suburb}/crime/summary` ``). Suburb names contain spaces, parentheses and dots (`St Kilda (Vic.)`).
- Check `isNoData(result)` before touching fields. Evidence should carry the NoData `message` (step 02 `noData?`).
- `mb()` can return the response body as-is when there's no `{data}` envelope (e.g. `/v1/me`).
- Test NoData with Nightcliff `GANT_703835649`: `risks/flood`, `development/zoning-code` and `rent-history-latest` all return `available:false`.
- Belmont North `GANSW704074813` is the only NSW fixture (step 06).
- Bondi is a sandbox suburb with no fixture Property. It's useful for testing the `suburb` override in step 02.
- The cache lives in `server/.cache/` (gitignored). Delete it to force fresh calls, or pass `{ fresh: true }`.
- `tsx` scripts that use top-level await must be ESM. `server/package.json` has `"type": "module"`, so files under `server/` are fine, but stray `.ts` files outside the package need `.mts`.

## How to run / verify
```
corepack enable              # once, if pnpm isn't installed
pnpm i
pnpm mb:probe "27 Arlington St, Belmont North NSW 2280"
pnpm mb:probe GAQLD162849753
pnpm mb:probe "305/41 Robertson St, Fortitude Valley QLD"
pnpm mb:probe "107 Houston Rd, Kingsford NSW"        # not a fixture → clear error, exit 1
MICROBURBS_CACHE_MODE=offline pnpm mb:probe GANSW704074813   # served from cache
pnpm typecheck
```
What I saw:
- The first command printed `{ gnafId: "GANSW704074813", address: "27 Arlington Street, Belmont North NSW 2280", suburb: "Belmont North", meshBlock: "10434270000", lga: "Lake Macquarie", state: "NSW", postcode: "2280" }`.
- QLD (GNAF input and `305/41 …` input) resolved to `Unit 305, 41 Robertson Street, Fortitude Valley QLD 4006`, mesh block `30069772000`. The second run took 1 ms (cache hit).
- `12a chaucer st st kilda vic` resolved to suburb `St Kilda (Vic.)`, address `12A Chaucer Street, St Kilda VIC 3182`.
- Non-fixture address: `Not found: … isn't a sandbox fixture …` plus the fixture list.
- `GANSW999999999`: `Microburbs error [forbidden 403]`.
- Offline mode served the cached Property. With an uncached GNAF it gave `[offline-miss]`.
- `MICROBURBS_API_KEY=bogus` took the geocode path and got `[unauthorized 401] … invalid api key`. The real-key geocode path is wired but unverified until step 09.
- Ad-hoc script: `mb(p\`/properties/${'GANT_703835649'}/risks/flood\`)` returned `NoData { reason: 'no_data', message: 'No flood overlay for GANT_703835649' }`; `St Kilda (Vic.)` crime/summary encoded and returned data; two concurrent identical calls returned the same object; `/geocode/suburb` without `q` threw `MicroburbsError` kind `validation`.
- `pnpm typecheck` passed for `shared` and `server`.

## Open questions for the user
- Do step 00 next (extension + Hono `/health` + README); it builds on this workspace.
- Install pnpm (`corepack enable`) so `pnpm …` commands work in your shell.
- Not verified: the stale-cache fallback when the network actually drops (only `offline` mode was exercised), and `geocode/address` with a real key (step 09).
