import roh from './sources/vdek-eigenanteile.json';

/**
 * Was ein Heimplatz die Bewohnerin selbst kostet, je Bundesland.
 *
 * Source: the vdek's half-yearly survey, 1 July 2026, published 14 July 2026.
 * The raw record — including how the figures were checked — is the JSON this
 * module reads. It is imported rather than retyped so there is exactly one copy
 * of the numbers in the repository.
 *
 * **Three things this data will be got wrong by anyone who skims it**, and the
 * reason each helper below exists:
 *
 * 1. The Leistungszuschlag under § 43c SGB XI applies **only to the EEE**, not
 *    to Unterkunft, Verpflegung and Investitionskosten. Applying it to the whole
 *    bill promises a relief that does not exist.
 * 2. The published "mit Zuschuss" figures are authoritative. Subtracting them
 *    yourself differs by one euro in 16 of 68 cases, because the vdek rounds the
 *    Zuschuss and the result independently. A page that recomputes them would
 *    contradict the source it cites.
 * 3. They are **averages**. Costs differ from home to home; within one home the
 *    EEE is the same for everyone in Pflegegrad 2 to 5.
 */

export interface Zuschuss {
  bis_12_monate_15: number;
  ab_12_monate_30: number;
  ab_24_monate_50: number;
  ab_36_monate_75: number;
}

export interface MitZuschuss {
  bis_12_monate: number;
  ab_12_monate: number;
  ab_24_monate: number;
  ab_36_monate: number;
}

export interface LandEigenanteil {
  code: string;
  name: string;
  eee_ohne_zuschuss: number;
  davon_ausbildungskosten: number;
  unterkunft_verpflegung: number;
  investitionskosten: number;
  eigenbeteiligung_ohne_zuschuss: number;
  zuschuss: Zuschuss;
  eigenbeteiligung_mit_zuschuss: MitZuschuss;
}

const alle = roh.laender as LandEigenanteil[];

/** The federal average, which the vdek publishes as one more row. */
export const BUND: LandEigenanteil = alle.find((l) => l.code === 'BUND')!;

/** The sixteen Länder, alphabetically — without the federal row. */
export const LAENDER: LandEigenanteil[] = alle
  .filter((l) => l.code !== 'BUND')
  .sort((a, b) => a.name.localeCompare(b.name, 'de'));

export const EIGENANTEIL_QUELLE = roh._meta.quelle;

/** URL segment for a Bundesland page: "nordrhein-westfalen". */
export function landSlug(land: LandEigenanteil): string {
  return land.name
    .toLowerCase()
    .replaceAll('ä', 'ae')
    .replaceAll('ö', 'oe')
    .replaceAll('ü', 'ue')
    .replaceAll('ß', 'ss')
    .replaceAll('-', '-')
    .replaceAll(' ', '-');
}

export function landBySlug(slug: string): LandEigenanteil | undefined {
  return LAENDER.find((l) => landSlug(l) === slug);
}

/** Cheapest and dearest Land in the first year — used to frame a single Land. */
export function spanneErstesJahr(): { guenstigste: LandEigenanteil; teuerste: LandEigenanteil } {
  const sortiert = [...LAENDER].sort(
    (a, b) => a.eigenbeteiligung_mit_zuschuss.bis_12_monate - b.eigenbeteiligung_mit_zuschuss.bis_12_monate,
  );
  return { guenstigste: sortiert[0]!, teuerste: sortiert[sortiert.length - 1]! };
}

/** Rank of a Land in the first year, 1 = cheapest. */
export function rangErstesJahr(land: LandEigenanteil): number {
  const sortiert = [...LAENDER].sort(
    (a, b) => a.eigenbeteiligung_mit_zuschuss.bis_12_monate - b.eigenbeteiligung_mit_zuschuss.bis_12_monate,
  );
  return sortiert.findIndex((l) => l.code === land.code) + 1;
}
