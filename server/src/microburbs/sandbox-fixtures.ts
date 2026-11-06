/**
 * Properties the Microburbs sandbox key (`test`) serves. The sandbox can't call
 * `/geocode/address`, so with that key the resolver matches addresses against
 * this map instead. Discovered 2026-11-06 — see docs/sandbox-fixtures.md.
 */
export interface SandboxFixture {
  gnafId: string;
  /** Street part as Microburbs returns it (street/profile, sale-history-latest). */
  street: string;
  /** Exact ABS SAL name. */
  suburb: string;
  state: string;
  postcode: string;
}

export const SANDBOX_PROPERTIES: readonly SandboxFixture[] = [
  { gnafId: 'GANSW704074813', street: '27 Arlington Street', suburb: 'Belmont North', state: 'NSW', postcode: '2280' },
  { gnafId: 'GAACT714845944', street: '9 Mcdowall Place', suburb: 'Kambah', state: 'ACT', postcode: '2902' },
  { gnafId: 'GAVIC419929404', street: '12A Chaucer Street', suburb: 'St Kilda (Vic.)', state: 'VIC', postcode: '3182' },
  { gnafId: 'GAQLD162849753', street: 'Unit 305, 41 Robertson Street', suburb: 'Fortitude Valley', state: 'QLD', postcode: '4006' },
  { gnafId: 'GAWA_146662014', street: '36 Olive Street', suburb: 'Subiaco', state: 'WA', postcode: '6008' },
  { gnafId: 'GASA_422266490', street: '53 Marion Street', suburb: 'Unley', state: 'SA', postcode: '5061' },
  { gnafId: 'GATAS702292990', street: '85 Lord Street', suburb: 'Sandy Bay', state: 'TAS', postcode: '7005' },
  { gnafId: 'GANT_703835649', street: '16 Jacksonia Circuit', suburb: 'Nightcliff', state: 'NT', postcode: '0810' },
];

/** Suburbs the sandbox serves for `/suburbs/{name}/…` (exact ABS names). */
export const SANDBOX_SUBURBS: readonly string[] = [
  'Belmont North',
  'Bondi',
  'St Kilda (Vic.)',
  'Fortitude Valley',
  'Subiaco',
  'Unley',
  'Sandy Bay',
  'Kambah',
  'Nightcliff',
];

const STREET_TYPES: Record<string, string> = {
  st: 'street', rd: 'road', pl: 'place', ave: 'avenue', av: 'avenue', dr: 'drive', cct: 'circuit',
  cir: 'circuit', cres: 'crescent', cr: 'crescent', ct: 'court', pde: 'parade', hwy: 'highway',
  ln: 'lane', tce: 'terrace', bvd: 'boulevard', blvd: 'boulevard', cl: 'close', gr: 'grove', sq: 'square',
};
const NOISE = new Set(['unit', 'u', 'apt', 'apartment', 'flat', 'shop', 'lot']);

/** Lower-case, strip punctuation and ABS suffixes, expand street-type abbreviations. */
export function normaliseAddress(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/\((nsw|vic\.?|qld|wa|sa|tas\.?|act|nt)\)/g, ' ') // "St Kilda (Vic.)" → "st kilda"
    .replace(/[^a-z0-9]+/g, ' ') // "305/41" → "305 41"
    .split(' ')
    .filter((t) => t && !NOISE.has(t))
    .map((t) => STREET_TYPES[t] ?? t);
}

/**
 * Find the fixture whose street address (number + street) is fully contained in
 * `address`. If several match, prefer the one whose suburb also appears.
 */
export function matchSandboxFixture(address: string): SandboxFixture | undefined {
  const input = new Set(normaliseAddress(address));
  const scored = SANDBOX_PROPERTIES.map((f) => {
    const streetOk = normaliseAddress(f.street).every((t) => input.has(t));
    const suburbOk = normaliseAddress(f.suburb).every((t) => input.has(t));
    return { f, score: streetOk ? (suburbOk ? 2 : 1) : 0 };
  })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored[0]?.f;
}

export const findSandboxFixtureByGnaf = (gnafId: string) =>
  SANDBOX_PROPERTIES.find((f) => f.gnafId === gnafId.toUpperCase());
