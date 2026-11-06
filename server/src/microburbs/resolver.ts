import type { Property } from '@hlicky/shared';
import { isSandboxKey } from '../env';
import { isNoData, mb, p } from './client';
import { findSandboxFixtureByGnaf, matchSandboxFixture, SANDBOX_PROPERTIES } from './sandbox-fixtures';

/** `GET /v1/geocode/address` item. */
export interface GnafCandidate {
  id: string;
  name: string;
  display_name: string;
  abbr: string;
  property_type?: string;
}

/** `GET /v1/properties/{gnaf}/profile` data. */
export interface PropertyProfile {
  mesh_block: string;
  sa1: string;
  sa2: string;
  sa3: string;
  sa4: string;
  gccsa: string;
  state: string;
  lga: string;
  suburb: string;
  postcode: string;
}

/** The address string or GNAF ID couldn't be turned into a Property. */
export class PropertyNotFoundError extends Error {
  override readonly name = 'PropertyNotFoundError';
  constructor(
    message: string,
    readonly query: string,
  ) {
    super(message);
  }
}

const GNAF_RE = /^GA[A-Z]{2,3}_?\d{6,}$/i;
export const looksLikeGnafId = (s: string) => GNAF_RE.test(s.trim());

/**
 * Resolve a Listing's address (free text) or a GNAF ID to a Property:
 *   address → `geocode/address` (top candidate) → `properties/{gnaf}/profile`.
 * With the sandbox key, `geocode/address` is unavailable, so addresses are
 * matched against the sandbox fixtures instead.
 *
 * Throws `PropertyNotFoundError` when nothing matches, `MicroburbsError` on API failure.
 */
export async function resolveProperty(query: string): Promise<Property> {
  const q = query.trim();
  if (!q) throw new PropertyNotFoundError('Empty address', query);

  let gnafId: string;
  let street: string | undefined; // address as known before the profile call

  if (looksLikeGnafId(q)) {
    gnafId = q.toUpperCase();
  } else if (isSandboxKey()) {
    const fixture = matchSandboxFixture(q);
    if (!fixture) {
      const known = SANDBOX_PROPERTIES.map((f) => `${f.street}, ${f.suburb}`).join('; ');
      throw new PropertyNotFoundError(
        `"${q}" isn't a sandbox fixture, and the sandbox key can't geocode addresses. ` +
          `Set MICROBURBS_API_KEY to a real key, or use one of: ${known}`,
        query,
      );
    }
    gnafId = fixture.gnafId;
    street = fixture.street;
  } else {
    const [top] = await geocodeAddress(q);
    if (!top) throw new PropertyNotFoundError(`No Microburbs address matches "${q}"`, query);
    gnafId = top.id;
    street = top.display_name || top.name;
  }

  const profile = await mb<PropertyProfile>(p`/properties/${gnafId}/profile`);
  if (isNoData(profile)) {
    throw new PropertyNotFoundError(`Microburbs has no profile for ${gnafId}: ${profile.message}`, query);
  }

  street ??= findSandboxFixtureByGnaf(gnafId)?.street ?? (await lookupStreetAddress(gnafId));

  return {
    gnafId,
    address: formatAddress(street, profile),
    suburb: profile.suburb,
    meshBlock: profile.mesh_block,
    lga: profile.lga,
    state: profile.state,
    postcode: profile.postcode,
  };
}

/** Up to 10 GNAF candidates for a free-text address, best first. Not available on the sandbox key. */
export async function geocodeAddress(address: string): Promise<GnafCandidate[]> {
  const res = await mb<GnafCandidate[]>('/geocode/address', { address });
  return isNoData(res) ? [] : res;
}

/** Street address for a bare GNAF ID. street/profile is also used by the value Topic, so it's usually cached. */
async function lookupStreetAddress(gnafId: string): Promise<string | undefined> {
  const street = await mb<{ address?: string }>(p`/properties/${gnafId}/street/profile`).catch(() => undefined);
  if (street && !isNoData(street) && street.address) return street.address;
  const sale = await mb<{ address?: string }>(p`/properties/${gnafId}/sale-history-latest`).catch(() => undefined);
  if (sale && !isNoData(sale) && sale.address) return sale.address;
  return undefined;
}

/** "27 Arlington Street" + profile → "27 Arlington Street, Belmont North NSW 2280". */
function formatAddress(street: string | undefined, profile: PropertyProfile): string {
  const suburbName = profile.suburb.replace(/\s*\([^)]*\)\s*$/, ''); // drop ABS suffix for display
  const tail = `${profile.state} ${profile.postcode}`;
  if (!street) return `${suburbName} ${tail}`;
  // geocode display_name already includes the suburb ("27 Arlington Street, Belmont North").
  const hasSuburb = street.toLowerCase().includes(suburbName.toLowerCase());
  const base = hasSuburb ? street : `${street}, ${suburbName}`;
  return base.includes(profile.postcode) ? base : `${base} ${tail}`;
}
