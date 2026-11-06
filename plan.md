# Hlicky — Build Plan

**Goal:** a Chrome extension that answers a buyer's question about the property listing they're viewing, using Microburbs data (+ free NSW government APIs). Built for a Microburbs-sponsored hackathon. Prep day 2026-11-06, hack day 2026-11-07.

**Product in one paragraph:** On a realestate.com.au or domain.com.au listing, the user holds a hotkey (default: Option), asks a question out loud ("Hey Hlicky, how safe is this area?"), and releases. Hlicky works out which Property the Listing is, pulls the relevant Microburbs data, and streams a short Answer into an on-page panel: a Verdict first, then Evidence with numbers and sources, at both mesh-block and suburb (vs national) Scale where possible. Follow-ups on the same Listing continue the Conversation; opening another page starts a new one. A simple Dashboard (an extension page) shows history, stats, and settings.

**Read alongside:**
- [CONTEXT.md](CONTEXT.md) — domain glossary. Use these terms in code and docs.
- [docs/adr/](docs/adr/) — architecture decisions (read 0001 before touching page reading).
- [docs/microburbs-openapi.json](docs/microburbs-openapi.json) — full Microburbs OpenAPI spec (params, response shapes, examples).
- [api.md](api.md) — flat endpoint list.
- [docs/handovers/](docs/handovers/) — one handover per completed step.

---

## Execution protocol (every Opus instance follows this)

1. Read this file, [CONTEXT.md](CONTEXT.md), and the handover of the most recent DONE step.
2. Pick the **first step in the status table whose status is not DONE**. If one is `IN PROGRESS`, read its partial handover (if any) and resume it. Set its status to `IN PROGRESS` in the table before starting work.
3. Do **only that step's scope**. If you must deviate from the plan, record why in the handover. If a later step's plan is now wrong because of what you learned, edit that step's text below and say so in the handover.
4. Verify using the step's **Done when** check. There are no automated tests in this project (time constraint) — verify manually and describe what you saw.
5. Write `docs/handovers/NN-<slug>.md` using [docs/handovers/TEMPLATE.md](docs/handovers/TEMPLATE.md): what was built, decisions + why, problems hit, gotchas for the next step, how to run/verify, open questions for the user.
6. Update the status table: `DONE` (or `BLOCKED: <reason>`) and link the handover. If a domain term was sharpened, update CONTEXT.md. Commit with message `step NN: <title>`.
7. Stop. Do not start the next step.

If you need something only the user can provide (an API key, a decision, a Chrome action), mark the step `BLOCKED: <what you need>`, write the handover, and stop.

---

## Status

| # | Step | When | Status | Handover |
|---|---|---|---|---|
| 00 | Scaffold monorepo | Prep day | TODO | – |
| 01 | Microburbs client, cache, Property resolver | Prep day | TODO | – |
| 02 | Topic tools → Evidence | Prep day | TODO | – |
| 03 | LLM adapter, mock provider, answer engine, `/ask` SSE | Prep day | TODO | – |
| 04 | Listing Context extraction + background relay | Prep day | TODO | – |
| 05 | Push-to-talk + overlay panel | Prep day | TODO | – |
| 06 | NSW Planning Portal Evidence | Prep day | TODO | – |
| 07 | Dashboard (history, stats, settings) | Prep day | TODO | – |
| 08 | Real LLM providers (OpenAI-compatible + Anthropic), written blind | Prep day | TODO | – |
| 09 | Hack-day switch-on (real keys, real listings) | Hack day | TODO | – |
| 10 | Demo hardening + demo script | Hack day | TODO | – |
| S1 | Stretch: NSW public schools CSV | If time | TODO | – |
| S2 | Stretch: BOCSAR suburb crime import | If time | TODO | – |
| S3 | Stretch: TfNSW trip planner | If time | TODO | – |
| S4 | Stretch: TTS read-out | If time | TODO | – |

---

## Settled decisions

- **Demo:** live, on 2–3 pre-chosen listings. Polish golden paths over breadth.
- **Modality:** voice in (Web Speech API, `en-AU`) → streamed text Answer in an on-page overlay. TTS is stretch.
- **Extension:** standard Manifest V3. Default trigger: hold **Option** > 300 ms (detected in the content script; configurable). Fallback `chrome.commands` shortcut Cmd+Shift+H opens a typed prompt. (`chrome.commands` can't bind a lone modifier; holding Cmd clashes with Cmd+C/Cmd+click.)
- **Sites:** realestate.com.au and domain.com.au. Listing Page → answer directly. Search Results Page → Clarification: Hlicky asks which Listing (clickable chips, or say it). Anything else → "open a listing and ask me again".
- **Page reading:** address is read **only from the tab the user is viewing, only when they trigger Hlicky** (JSON-LD / title / meta). No crawling, no bulk storage. See [ADR 0001](docs/adr/0001-address-from-open-tab-only.md).
- **Architecture:** thin extension + backend. The backend holds the Microburbs and LLM keys. (Microburbs CORS rejects `chrome-extension://` origins anyway, and keys in an extension are public.)
- **Answer engine:** hybrid — resolve the Property up front, then call only the Topic tools the Question needs.
- **LLM:** a free hackathon LLM key arrives on hack day, quality unknown. **No LLM key on prep day**, so everything goes through an LLM adapter whose `mock` provider (keyword router + templated Answer) is fully usable. The mock doubles as the on-stage "safe mode".
- **Scale:** give mesh-block AND suburb (vs national) insight whenever available.
- **Other data:** free NSW government APIs only. No web search, no scraping.
- **Conversation:** one per Listing; navigating to a different page starts a new one.
- **Stance:** Verdict first, then Evidence with numbers and sources. **No "not financial advice" disclaimer.**
- **Dashboard:** extension page, `chrome.storage.local`, no accounts, no server-side history.
- **Cost:** Microburbs hackathon credit is treated as free/unlimited — no budget caps, no spend tracking, no spend stat. Still prefer focused endpoints over big bundles (faster, fewer LLM tokens).
- **Tests:** none. Each step has a manual **Done when**.

---

## Architecture

```
[Listing tab: realestate.com.au / domain.com.au]
  content script
   ├ hotkey (hold Option) → Web Speech → transcript
   ├ reads Listing Context from THIS tab only (one address | candidates)
   └ overlay panel (shadow DOM): transcript, status trace, streamed Answer, Evidence chips, Clarification chips
        │ chrome.runtime port
  background service worker ── fetch (SSE stream) ──► server (Hono on Node, localhost:8787)
                                                       ├ resolve Listing → Property (geocode → profile), disk-cached
                                                       ├ answer engine: Question → Topics → topic tools → Evidence → Answer
                                                       ├ LLM adapter: mock | openai (compatible) | anthropic
                                                       └ sources: Microburbs client (disk-cached), NSW clients
  dashboard.html (extension page) ◄──► chrome.storage.local (history, settings)
```

- TypeScript everywhere. pnpm workspaces:
  - `extension/` — WXT + React (MV3)
  - `server/` — Hono + `tsx`
  - `shared/` — types shared by both: `ListingContext`, `Property`, `Evidence`, SSE event union, `Settings`
- **SSE events** from `/ask`: `status` (e.g. "Checking crime on your block…"), `clarify` (candidate Listings), `evidence`, `token`, `done` (topics used), `error`.
- **Server env** (`.env`, see `.env.example`):
  - `MICROBURBS_API_KEY` — default `test` (sandbox)
  - `LLM_PROVIDER` — `mock` | `openai` | `anthropic` (default `mock`)
  - `LLM_BASE_URL`, `LLM_API_KEY`, `LLM_MODEL`
  - `LLM_MODE` — `tools` (native tool calling) | `json-router` (model returns `{"topics":[...]}`)
- The extension calls the server **only from the background service worker** (content-script fetches are subject to the page's CORS).

---

## Steps

### 00 — Scaffold monorepo
**Goal:** an empty-but-running skeleton everyone after you builds on.
**Scope:**
- pnpm workspace with `extension/`, `server/`, `shared/`.
- WXT + React extension: MV3, host permissions for `*://*.realestate.com.au/*`, `*://*.domain.com.au/*`, and the server URL (`http://localhost:8787/*`). A content script that logs "Hlicky loaded" on both sites. Background service worker stub. Dashboard page stub.
- Hono server with `GET /health`, CORS allowing the extension origin, `dotenv` loading.
- `.env.example`, `.gitignore` (ignore `.env`, `node_modules`, build output, cache dir), README with run instructions (`pnpm i`, `pnpm dev:server`, `pnpm dev:ext`, how to load unpacked).
**Done when:** extension loads unpacked in Chrome and logs on a realestate.com.au page; `curl localhost:8787/health` returns ok.

### 01 — Microburbs client, cache, Property resolver
**Goal:** one reliable way to call Microburbs and to turn an address into a Property.
**Scope:**
- `mb(path, params)` — bearer auth, unwraps `{data}`, turns `available:false` into a typed `NoData` result (with `reason`, `message`) rather than throwing; 4xx/5xx → typed error.
- Disk JSON cache keyed by full URL (TTL 7 days). The cache doubles as offline replay for the demo.
- `resolveProperty(addressString | gnafId)` → `Property { gnafId, address, suburb, meshBlock, lga, state, postcode }` via `geocode/address` → `properties/{gnaf}/profile`.
- The sandbox key `test` can't call `geocode/address`: discover which GNAF IDs / suburbs the sandbox serves, record them in `docs/sandbox-fixtures.md`, and let the resolver use a fixture map (address → GNAF) when the key is `test`.
- CLI: `pnpm mb:probe "<address or gnaf>"`.
**Done when:** `pnpm mb:probe` prints a resolved Property for a sandbox fixture.
**Notes:** endpoint params and response shapes are in `docs/microburbs-openapi.json` — grep it, don't guess.

### 02 — Topic tools → Evidence
**Goal:** one function per Topic, each returning compact, LLM-friendly Evidence.
**Scope:**
- `Evidence { topic, scale: 'property'|'street'|'mesh-block'|'suburb'|'national', facts: {label, value, unit?, comparison?}[], source: {provider, endpoint}, noData? }`.
- Topics and suggested endpoints (prefer focused endpoints over heavy bundles):
  - **crime** — suburb `crime/summary`, `crime/breakdown`, `mesh-blocks/crime` (pick the Property's own mesh block: rank in suburb %, rank national %)
  - **hazards** — property `risks/all`
  - **value** — property `valuation/all`, `sale-history-latest`, `street/profile`; suburb `market/median-sale-price`, `market/price-growth`, `market/days-on-market`
  - **rent** — property `rent-history-latest`; suburb `market/median-rent`, `market/vacancy-rate`, `market/yield-pct`
  - **schools** — property `schools/nearby` (avoid `schools/all`)
  - **transport** — property `transport/nearby`
  - **lifestyle** — property `amenities/nearby`; suburb `lifestyle/livability`, `lifestyle/narrative`
  - **demographics** — suburb `demographics/all`; mesh-block `tenure` (own block)
  - **development** — property `development/all`; suburb `development/applications`
- Mesh-block endpoints return every block in the suburb — filter to `Property.meshBlock` yourself.
- Every tool accepts an optional `suburb` override so follow-ups like "compared to Randwick?" work (resolve names via free `geocode/suburb?q=`; names must be exact ABS form, e.g. `Richmond (Vic.)`).
- CLI: `pnpm tools:run <topic> <gnaf>`.
**Done when:** `crime` and `hazards` print sensible Evidence for a sandbox fixture, including at least one mesh-block fact.

### 03 — LLM adapter, mock provider, answer engine, `/ask`
**Goal:** the server can answer a Question end-to-end without any real LLM.
**Scope:**
- LLM adapter interface: `chat({ system, messages, tools? }) → { text } | { toolCalls }`, plus a streaming variant. Providers selected by `LLM_PROVIDER`.
- `mock` provider: keyword router (safe/crime/safety → crime; flood/fire/bushfire → hazards; worth/price/value → value; rent/yield → rent; school → schools; train/bus/commute → transport; …; default = crime + hazards + value) and a templated Answer (Verdict line built from Evidence, then 3–5 Evidence bullets with Scale + source).
- Answer engine:
  1. Resolve Listing → Property. If the Listing Context has several candidates and the transcript doesn't match one (street number/name), emit `clarify` and stop.
  2. Choose Topics (native tool calling, json-router, or mock).
  3. Run topic tools (in parallel), emit `status` + `evidence` events.
  4. Compose the Answer. System prompt rules: Verdict first; every number tied to its source; mesh-block + suburb + national when available; say plainly when Microburbs has no data (never invent); ~120 words (or longer if Settings say "detailed"); **no advice disclaimer**.
- Conversation `{ conversationId, listingKey, turns[] }` kept server-side in memory.
- `POST /ask` `{ conversationId?, listingContext, question, settings }` → SSE stream.
**Done when:** `curl -N` to `/ask` with a sandbox fixture and "how safe is this area?" streams `status` → `evidence` → `token`s → `done`.

### 04 — Listing Context extraction + background relay
**Goal:** the extension knows which Listing the user means and can talk to the server.
**Scope:**
- Content script page-type detection on both sites:
  - **Listing Page** → address from JSON-LD (`schema.org` `address` / `geo`), fallback `og:title` / `document.title` parsing. Capture `geo` lat/lng if present (step 06 uses it).
  - **Search Results Page** → candidates from visible listing cards (address + URL).
  - **Other** → unsupported.
- Extraction runs **only when the user triggers Hlicky** ([ADR 0001](docs/adr/0001-address-from-open-tab-only.md)).
- Background service worker: opens a fetch-SSE stream to the server and relays events to the tab over a `chrome.runtime` port. Detect SPA URL changes (both sites are SPAs) → reset the Conversation.
**Done when:** on a real listing on each site, a debug trigger logs the right address; on a search page it logs candidates; the SW relays a mock `/ask` Answer to the console.
**Notes:** inspect the live DOM in the user's Chrome — selectors can't be guessed and both sites block bots. Prefer JSON-LD; it's stabler than class names. If you can't access a real page, mark BLOCKED and ask the user to paste the page's JSON-LD / `<title>`.

### 05 — Push-to-talk + overlay panel
**Goal:** the demo interaction works on a real page.
**Scope:**
- Hold-Option detection: keydown Option, start after 300 ms if no other key pressed; cancel if another key goes down; ignore when focus is in an input/textarea/contenteditable. Keyup → stop and send.
- `webkitSpeechRecognition`, `lang` from Settings (default `en-AU`), interim results shown live. Handle mic-permission denial gracefully (fall back to typed input).
- Overlay in a shadow DOM, bottom-right: listening state, live transcript, status trace ("Checked crime · hazards"), streamed Answer (minimal markdown: bold, bullets), Evidence chips with source, Clarification chips, a typed input box, close button.
- Cmd+Shift+H (`chrome.commands`) opens the panel in typed mode.
**Done when:** on a real listing, hold Option, speak, release → mock Answer streams into the panel; on a search page, Clarification chips appear and picking one produces an Answer.

### 06 — NSW Planning Portal Evidence
**Goal:** add free NSW government data to the hazards and development Topics.
**Scope:**
- Lat/lng from the page's JSON-LD `geo` if present, else the NSW GURAS geocoder (`portal.spatial.nsw.gov.au/server/rest/services/NSW_Geocoded_Addressing_Theme/FeatureServer`, no auth).
- ArcGIS point `query` (no auth) on `mapprod3.environment.nsw.gov.au/arcgis/rest/services/ePlanning/`:
  - `Planning_Portal_Principal_Planning` — land zoning (layer 19), height of buildings (14), FSR (11), heritage (16), min lot size (22)
  - `Planning_Portal_Hazard` — bushfire prone land (229), flood planning (230), landslide risk (232)
  - Verify layer IDs with `?f=pjson` first; they may have shifted.
- Emit as Evidence with source "NSW Planning Portal (CC BY 4.0)". Disk-cache like Microburbs. Only for `state === 'NSW'`.
**Done when:** a NSW address returns zoning + flood/bushfire Evidence alongside the Microburbs Evidence.

### 07 — Dashboard
**Goal:** a simple Wispr-Flow-style page to see history and configure Hlicky.
**Scope:**
- `dashboard.html` (React), opened from the toolbar icon. Tabs:
  - **History** — grouped by Listing: address, time, Question, Answer, Topics; click to expand.
  - **Stats** — Questions asked, Listings explored, top Topics, Suburbs explored.
  - **Settings** — trigger key + hold threshold, server URL, Answer length (brief / detailed), speech language, enabled sites.
- Overlay writes each completed turn to `chrome.storage.local`; content script and SW read Settings live (`chrome.storage.onChanged`).
**Done when:** after 3 Questions, History and Stats show them; changing the trigger key takes effect without reloading the extension.

### 08 — Real LLM providers (written blind)
**Goal:** swapping to the hackathon LLM tomorrow is a config change.
**Scope:**
- `openai` provider — OpenAI-compatible `/chat/completions` with `tools` and streaming; `LLM_BASE_URL` configurable (most hackathon LLMs speak this format).
- `anthropic` provider — Messages API with tool use and streaming.
- `json-router` mode for models without tool calling: ask for `{"topics": [...]}`, run tools, then ask for the Answer with Evidence in context.
- Robust parsing: malformed tool calls / JSON → fall back to mock routing, never crash the stream.
**Done when:** typechecks; switching `LLM_PROVIDER` / `LLM_MODE` selects the right code path; `mock` still works end-to-end. (Real verification happens in step 09.)

### 09 — Hack-day switch-on
**Goal:** everything works with real keys on real listings.
**Scope:**
- Put the real `MICROBURBS_API_KEY` and hackathon LLM credentials into `server/.env`.
- `GET /v1/me` works. Confirm the credit really is unlimited; if not, note it in the handover (calls return 402 when credit runs out).
- Verify `geocode/address` on real listing addresses (e.g. "107 Houston Rd, Kingsford NSW") and remove reliance on sandbox fixtures.
- Try `LLM_MODE=tools`; if the model fumbles tool calls, switch to `json-router`.
- Tune the system prompt for verdict-first, evidence-backed tone.
- **Ask the user to confirm with organisers** that reading the open tab's address is OK. If not, switch to "user says the address" per ADR 0001.
**Done when:** 3 real listings answer crime / flood / value Questions correctly end-to-end with the real LLM.

### 10 — Demo hardening + demo script
**Goal:** a demo that can't fail on stage.
**Scope:**
- Pick 3 demo listings (one Search Results Page to show Clarification); pre-warm the cache for each.
- Check answer latency; trim Topics or prompt if slow.
- One-flag fallback to `LLM_PROVIDER=mock` if the LLM misbehaves.
- Write `docs/demo.md`: script, listing URLs, exact Questions, expected Answers, fallback steps.
**Done when:** the full demo runs twice in a row cleanly, including once with network access to Microburbs blocked (served from cache).

### Stretch (only after 10 is DONE)
- **S1** NSW public schools master dataset (data.nsw CSV, no auth) → nearest public schools Evidence.
- **S2** BOCSAR suburb crime (bulk ZIP, CC BY) imported locally → second crime source.
- **S3** TfNSW Trip Planner (needs a free key the **user** must register) → real commute times.
- **S4** TTS read-out of the Verdict (Settings toggle).

---

## Reference

### Microburbs API
- Base URL `https://api.microburbs.com.au`, all routes under `/v1`. Auth: `Authorization: Bearer <key>`. Spec: [docs/microburbs-openapi.json](docs/microburbs-openapi.json) (source: `https://api.microburbs.com.au/openapi.json`). Docs: `https://www.microburbs.com.au/developers/api-docs`.
- Response envelope `{ data: ... }`. Missing data is **HTTP 200** with `data: null, available: false, reason, message` — not an error.
- Errors: 422 (FastAPI `{detail: [...]}`), 403 (sandbox key outside fixtures), 402 (out of credit), 429 (rate limit; numbers undocumented).
- Billing headers (`X-Cost-Cents`, `X-Remaining-Cents`, …) exist but we ignore them. Per-endpoint price is `x-price-cents` in the spec — reference only.
- **Sandbox key `test`**: free, serves only one sample suburb/property per state plus a few named suburbs (e.g. `Bondi`, `St Kilda (Vic.)`); 403 otherwise; **cannot call `/geocode/address`**.
- **CORS**: only whitelisted origins; `chrome-extension://` is rejected → call from the server.
- **Resolution chain**: `GET /v1/geocode/address?address=…` → `data[].id` is the GNAF ID (up to 10 candidates) → `GET /v1/properties/{gnaf}/profile` → `suburb` (exact ABS name), `mesh_block`, `lga`, `state`, `postcode`, `sa1–sa4`.
- **Suburb names** must be the exact ABS SAL name; duplicates carry a suffix (`Richmond (NSW)`, `Richmond (Vic.)`). `GET /v1/geocode/suburb?q=` (free) resolves them.
- **Mesh-block endpoints** (`/suburbs/{s}/mesh-blocks/*`, `/crime/by-mesh-block`) take no filter and return every block in the suburb.
- **Crime**: `crime/summary` → `suburb_median, national_median, vs_national_pct, verdict` (Very low | Below average | Average | Above average | High), unit "predicted incidents per 100,000 residents per year". `crime/breakdown` → per-type `rate, national_median, diff_pct, verdict`. `mesh-blocks/crime` (beta) → per block `crime_rate_total`, 8 types, `crime_rank_in_suburb_pct`, `crime_rank_national_pct`.
- **Risks**: property `risks/all` → keys `bushfire, flood, historical_flood, heritage, public_housing, landslide, erosion, environment, hv_power_line, mobile_black_spot`; each an array of `{name, on_property, nearest_distance_m, features_within_radius, search_radius_m, value}`.
- **Heavy payloads to avoid**: suburb `schools/all`, `schools/catchment`, `market/all`; property `schools/all`, `history/all`, `comparables/all`.
- Microburbs also exposes an MCP server at `https://api.microburbs.com.au/mcp` (same key). Not used; noted in case it's useful with the hackathon LLM.

### Free NSW APIs
| Source | Auth | Licence | Use |
|---|---|---|---|
| NSW Planning Portal ArcGIS — `mapprod3.environment.nsw.gov.au/arcgis/rest/services/ePlanning/` | none | CC BY 4.0 | zoning, height, FSR, heritage, bushfire, flood, landslide by point (step 06) |
| NSW GURAS geocoder — `portal.spatial.nsw.gov.au/server/rest/services/NSW_Geocoded_Addressing_Theme/FeatureServer` | none | CC BY 4.0 | address → lat/lng (step 06) |
| NSW public schools master dataset — data.nsw.gov.au | none | CC BY | nearest public schools (S1) |
| BOCSAR crime — `bocsarblob.blob.core.windows.net/bocsar-open-data/SuburbData.zip` | none | CC BY | bulk only; local import (S2) |
| TfNSW Open Data — `api.transport.nsw.gov.au/v1/` | free key (user registers) | CC BY 4.0 | trip planner, nearby stops (S3) |
| data.nsw CKAN — `data.nsw.gov.au/data/api/3/action/` | none | varies | dataset discovery |

No free official API was found for road/aircraft noise.
