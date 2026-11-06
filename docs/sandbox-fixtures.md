# Microburbs sandbox fixtures (key `test`)

Probed live on 2026-11-06. The sandbox key is free and serves only what's listed here; anything else returns **403** with a message listing the allowed values. `/v1/geocode/address` is **403** on the sandbox ("this endpoint isn't in the public sandbox"), so with `MICROBURBS_API_KEY=test` the Property resolver matches addresses against the map in [server/src/microburbs/sandbox-fixtures.ts](../server/src/microburbs/sandbox-fixtures.ts).

## Properties (GNAF IDs)

Street address from `properties/{gnaf}/street/profile` (or `sale-history-latest` for QLD, whose street profile is `available:false`). Everything else from `properties/{gnaf}/profile`.

| GNAF ID | Address | ABS suburb | Mesh Block | LGA |
|---|---|---|---|---|
| `GANSW704074813` | 27 Arlington Street, Belmont North NSW 2280 | Belmont North | 10434270000 | Lake Macquarie |
| `GAACT714845944` | 9 Mcdowall Place, Kambah ACT 2902 | Kambah | 80025270000 | Unincorporated ACT |
| `GAVIC419929404` | 12A Chaucer Street, St Kilda VIC 3182 | St Kilda (Vic.) | 20528650000 | Port Phillip |
| `GAQLD162849753` | Unit 305, 41 Robertson Street, Fortitude Valley QLD 4006 | Fortitude Valley | 30069772000 | Brisbane |
| `GAWA_146662014` | 36 Olive Street, Subiaco WA 6008 | Subiaco | 50295940000 | Subiaco |
| `GASA_422266490` | 53 Marion Street, Unley SA 5061 | Unley | 40195720000 | Unley |
| `GATAS702292990` | 85 Lord Street, Sandy Bay TAS 7005 | Sandy Bay | 60061580000 | Hobart |
| `GANT_703835649` | 16 Jacksonia Circuit, Nightcliff NT 0810 | Nightcliff | 70010720000 | Darwin |

Note: the OpenAPI example for `properties/{gnaf}/profile` shows `"suburb": "Kambah (ACT)"`, but the live API returns `"Kambah"`. Trust the live response.

## Suburbs

`Belmont North`, `Bondi`, `St Kilda (Vic.)`, `Fortitude Valley`, `Subiaco`, `Unley`, `Sandy Bay`, `Kambah`, `Nightcliff` — plus (per the spec) the LGAs and SA4s they sit in, the mesh blocks inside them, and every economics series. `Bondi` is the only suburb with no property fixture.

## Free on the sandbox

- `/v1/geocode/suburb?q=` works for **any** suburb (not limited to the list above).
- `/v1/me` works (reports `sandbox.is_sandbox: true`).

## Good fixtures for later steps

- **Belmont North (NSW)** — the only NSW property; use it for step 06 (NSW Planning Portal).
- **Nightcliff (NT)** — returns `available:false` for `risks/flood`, `development/zoning-code`, `rent-history-latest`: good for testing NoData handling.
- **Fortitude Valley (QLD)** — a unit; `street/profile` is `available:false`.

## Address matching

`matchSandboxFixture()` lower-cases, strips punctuation and ABS suffixes, expands street-type abbreviations (`St`→`street`, `Rd`, `Pl`, `Cct`, …), drops `unit`/`apt`, and requires every token of the fixture's street (number + name) to appear in the input. So `305/41 Robertson St, Fortitude Valley QLD` and `12a chaucer st st kilda vic` both match. A bare `41 Robertson Street` doesn't (the unit number is missing).
