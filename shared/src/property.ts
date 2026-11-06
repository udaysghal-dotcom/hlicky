/**
 * The physical dwelling a Listing advertises, identified by its GNAF ID.
 * Resolved server-side from a Listing's address (see server/src/microburbs/resolver.ts).
 */
export interface Property {
  /** National address identifier, e.g. "GANSW704074813". The key for property-level Microburbs data. */
  gnafId: string;
  /** Human-readable street address, e.g. "27 Arlington Street, Belmont North NSW 2280". */
  address: string;
  /** Exact ABS SAL name, e.g. "Belmont North", "St Kilda (Vic.)". Use as-is in `/suburbs/{name}/…` paths. */
  suburb: string;
  /** ABS Mesh Block code ("your block"), e.g. "10434270000". */
  meshBlock: string;
  /** Local government area name, e.g. "Lake Macquarie". */
  lga: string;
  /** State/territory abbreviation, e.g. "NSW", "VIC". */
  state: string;
  postcode: string;
}
