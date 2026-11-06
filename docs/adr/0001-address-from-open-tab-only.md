# 0001 — Read the Listing address only from the tab the user is viewing

**Status:** Accepted (2026-11-06). Revisit if hackathon organisers object.

## Context
Hlicky needs the address of the Listing the user is looking at to resolve the Property. The hackathon rules forbid scraping data from websites that don't allow it, and realestate.com.au and domain.com.au terms prohibit scraping. realestate.com.au listing URLs don't contain the street address, so the URL alone isn't enough.

## Decision
When — and only when — the user triggers Hlicky, the content script reads the address (JSON-LD, `og:title`, or `document.title`) from the single tab the user is currently viewing. On a Search Results Page it reads the addresses of the visible listing cards so the user can pick one. Hlicky never crawls, never fetches listing pages itself, and stores page-derived data only in the user's own local history.

## Alternatives considered
- **URL parsing only** — works for domain.com.au, but realestate.com.au URLs lack the street, so most Questions would need a follow-up.
- **User speaks the address** — safest under the rules but makes every interaction clunky and weakens the demo.

## Consequences
- Must be confirmed with organisers on hack day (step 09). If they object, fall back to "user speaks the address" — the answer engine already accepts a free-text address.
- Extraction depends on the sites' page structure; JSON-LD is preferred because it's more stable than class names.
