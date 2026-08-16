import type { CategorySlug } from './kategorien';

/**
 * One entry per content page. Hubs and the search island read this registry, so
 * a page that is not listed here is a page nobody can find — adding a topic
 * means adding an entry, not only a route.
 *
 * Amounts never live here. They live in `data/leistungen.ts`, which is the one
 * place SGB XI figures are allowed (queue task 2.3), and a `kurz` line that
 * states a euro amount would be a second place for them to go stale.
 */
export interface Thema {
  /** URL segment, unique across the whole registry. */
  slug: string;
  /** The H1/link text. */
  titel: string;
  kategorie: CategorySlug;
  /** One calm sentence describing the topic — no amounts. */
  kurz: string;
  /**
   * Where the page actually lives, when it is not under `/thema/`.
   *
   * The Pflegegrad pages carry their keyword in the URL (`/pflegegrad-2/`)
   * because that is what people type. Everything else keeps the shared prefix.
   */
  pfad?: string;
}

/** The URL of a topic — the one place that rule is written down. */
export function pfadVon(thema: Thema): string {
  return thema.pfad ?? `/thema/${thema.slug}/`;
}

export const THEMEN: Thema[] = [
  {
    slug: 'pflegegrad-berechnen',
    titel: 'Pflegegrad berechnen: Selbsteinschätzung',
    kategorie: 'antrag',
    kurz: 'Die sechs Module des amtlichen Begutachtungsinstruments, Schritt für Schritt zum Punktwert.',
    pfad: '/pflegegrad-berechnen/',
  },
  {
    slug: 'pflegegrad-1',
    titel: 'Pflegegrad 1: Geld und Leistungen',
    kategorie: 'pflegegrad',
    kurz: 'Was der niedrigste Pflegegrad bringt — und was er ausdrücklich nicht bringt.',
    pfad: '/pflegegrad-1/',
  },
  {
    slug: 'pflegegrad-2',
    titel: 'Pflegegrad 2: Geld und Leistungen',
    kategorie: 'pflegegrad',
    kurz: 'Ab hier gibt es Pflegegeld und Pflegedienst — auch in Kombination.',
    pfad: '/pflegegrad-2/',
  },
  {
    slug: 'pflegegrad-3',
    titel: 'Pflegegrad 3: Geld und Leistungen',
    kategorie: 'pflegegrad',
    kurz: 'Alle Leistungen im Überblick, mit Rechner für die Aufteilung.',
    pfad: '/pflegegrad-3/',
  },
  {
    slug: 'pflegegrad-4',
    titel: 'Pflegegrad 4: Geld und Leistungen',
    kategorie: 'pflegegrad',
    kurz: 'Alle Leistungen im Überblick, mit Rechner für die Aufteilung.',
    pfad: '/pflegegrad-4/',
  },
  {
    slug: 'pflegegrad-5',
    titel: 'Pflegegrad 5: Geld und Leistungen',
    kategorie: 'pflegegrad',
    kurz: 'Der höchste Pflegegrad: alle Beträge und wie sie sich kombinieren lassen.',
    pfad: '/pflegegrad-5/',
  },
  {
    slug: 'pflegeheim-baden-wuerttemberg',
    titel: 'Pflegeheim Baden-Württemberg: Eigenanteil',
    kategorie: 'heim',
    kurz: 'Was ein Heimplatz hier selbst kostet, aufgeschlüsselt nach den drei Kostenteilen.',
    pfad: '/pflegeheim-kosten-baden-wuerttemberg/',
  },
  {
    slug: 'pflegeheim-bayern',
    titel: 'Pflegeheim Bayern: Eigenanteil',
    kategorie: 'heim',
    kurz: 'Was ein Heimplatz hier selbst kostet, aufgeschlüsselt nach den drei Kostenteilen.',
    pfad: '/pflegeheim-kosten-bayern/',
  },
  {
    slug: 'pflegeheim-berlin',
    titel: 'Pflegeheim Berlin: Eigenanteil',
    kategorie: 'heim',
    kurz: 'Was ein Heimplatz hier selbst kostet, aufgeschlüsselt nach den drei Kostenteilen.',
    pfad: '/pflegeheim-kosten-berlin/',
  },
  {
    slug: 'pflegeheim-brandenburg',
    titel: 'Pflegeheim Brandenburg: Eigenanteil',
    kategorie: 'heim',
    kurz: 'Was ein Heimplatz hier selbst kostet, aufgeschlüsselt nach den drei Kostenteilen.',
    pfad: '/pflegeheim-kosten-brandenburg/',
  },
  {
    slug: 'pflegeheim-bremen',
    titel: 'Pflegeheim Bremen: Eigenanteil',
    kategorie: 'heim',
    kurz: 'Was ein Heimplatz hier selbst kostet, aufgeschlüsselt nach den drei Kostenteilen.',
    pfad: '/pflegeheim-kosten-bremen/',
  },
  {
    slug: 'pflegeheim-hamburg',
    titel: 'Pflegeheim Hamburg: Eigenanteil',
    kategorie: 'heim',
    kurz: 'Was ein Heimplatz hier selbst kostet, aufgeschlüsselt nach den drei Kostenteilen.',
    pfad: '/pflegeheim-kosten-hamburg/',
  },
  {
    slug: 'pflegeheim-hessen',
    titel: 'Pflegeheim Hessen: Eigenanteil',
    kategorie: 'heim',
    kurz: 'Was ein Heimplatz hier selbst kostet, aufgeschlüsselt nach den drei Kostenteilen.',
    pfad: '/pflegeheim-kosten-hessen/',
  },
  {
    slug: 'pflegeheim-mecklenburg-vorpommern',
    titel: 'Pflegeheim Mecklenburg-Vorpommern: Eigenanteil',
    kategorie: 'heim',
    kurz: 'Was ein Heimplatz hier selbst kostet, aufgeschlüsselt nach den drei Kostenteilen.',
    pfad: '/pflegeheim-kosten-mecklenburg-vorpommern/',
  },
  {
    slug: 'pflegeheim-niedersachsen',
    titel: 'Pflegeheim Niedersachsen: Eigenanteil',
    kategorie: 'heim',
    kurz: 'Was ein Heimplatz hier selbst kostet, aufgeschlüsselt nach den drei Kostenteilen.',
    pfad: '/pflegeheim-kosten-niedersachsen/',
  },
  {
    slug: 'pflegeheim-nordrhein-westfalen',
    titel: 'Pflegeheim Nordrhein-Westfalen: Eigenanteil',
    kategorie: 'heim',
    kurz: 'Was ein Heimplatz hier selbst kostet, aufgeschlüsselt nach den drei Kostenteilen.',
    pfad: '/pflegeheim-kosten-nordrhein-westfalen/',
  },
  {
    slug: 'pflegeheim-rheinland-pfalz',
    titel: 'Pflegeheim Rheinland-Pfalz: Eigenanteil',
    kategorie: 'heim',
    kurz: 'Was ein Heimplatz hier selbst kostet, aufgeschlüsselt nach den drei Kostenteilen.',
    pfad: '/pflegeheim-kosten-rheinland-pfalz/',
  },
  {
    slug: 'pflegeheim-saarland',
    titel: 'Pflegeheim Saarland: Eigenanteil',
    kategorie: 'heim',
    kurz: 'Was ein Heimplatz hier selbst kostet, aufgeschlüsselt nach den drei Kostenteilen.',
    pfad: '/pflegeheim-kosten-saarland/',
  },
  {
    slug: 'pflegeheim-sachsen',
    titel: 'Pflegeheim Sachsen: Eigenanteil',
    kategorie: 'heim',
    kurz: 'Was ein Heimplatz hier selbst kostet, aufgeschlüsselt nach den drei Kostenteilen.',
    pfad: '/pflegeheim-kosten-sachsen/',
  },
  {
    slug: 'pflegeheim-sachsen-anhalt',
    titel: 'Pflegeheim Sachsen-Anhalt: Eigenanteil',
    kategorie: 'heim',
    kurz: 'Was ein Heimplatz hier selbst kostet, aufgeschlüsselt nach den drei Kostenteilen.',
    pfad: '/pflegeheim-kosten-sachsen-anhalt/',
  },
  {
    slug: 'pflegeheim-schleswig-holstein',
    titel: 'Pflegeheim Schleswig-Holstein: Eigenanteil',
    kategorie: 'heim',
    kurz: 'Was ein Heimplatz hier selbst kostet, aufgeschlüsselt nach den drei Kostenteilen.',
    pfad: '/pflegeheim-kosten-schleswig-holstein/',
  },
  {
    slug: 'pflegeheim-thueringen',
    titel: 'Pflegeheim Thüringen: Eigenanteil',
    kategorie: 'heim',
    kurz: 'Was ein Heimplatz hier selbst kostet, aufgeschlüsselt nach den drei Kostenteilen.',
    pfad: '/pflegeheim-kosten-thueringen/',
  },
];

/** All topics belonging to one category, in registry order. */
export function themenIn(kategorie: CategorySlug): Thema[] {
  return THEMEN.filter((thema) => thema.kategorie === kategorie);
}

/** Looks up a single topic by its slug, or undefined if it does not exist. */
export function themaBySlug(slug: string): Thema | undefined {
  return THEMEN.find((thema) => thema.slug === slug);
}
