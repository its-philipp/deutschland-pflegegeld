// Site-wide constants. Keep SITE_URL in sync with `site` in astro.config.mjs
// (the sitemap integration reads it from there, canonical/OG tags from here).
export const SITE_URL = 'https://deutschland-pflegegeld.de';

/**
 * Wortmarke (owner decision 2026-08-03, STATE.md): "Deutschland Pflegegeld",
 * following the chosen domain deutschland-pflegegeld.de. "Kompass" was
 * dropped as a brand term — the folder name `pflege-kompass/` stays only as
 * the internal identifier.
 *
 * The brand is narrower than the content: Heimkosten, Eigenanteil and the
 * Pflegegrad-Wizard live under this name too, not just Pflegegeld. Every
 * page's navigation must make that breadth visible rather than implying a
 * single-purpose Pflegegeld-Rechner.
 */
export const SITE_NAME = 'Deutschland Pflegegeld';

/**
 * Impressum/Datenschutz identity — placeholders until the owner supplies them
 * (launch blockers, not build blockers; the pre-deploy `grep -r '{{'` must find
 * them). They live here rather than inline in the pages for two reasons: a
 * literal `{{` in Astro markup is a parse error, and one definition means the
 * Impressum and the Datenschutzerklärung cannot end up naming different people.
 *
 * Never replace these with plausible-looking values — a wrong Impressum is a
 * worse defect than an obviously missing one.
 */
export const CONTACT_EMAIL = 'kontakt@deutschland-pflegegeld.de';
export const IMPRESSUM_NAME = 'Philipp Trinh';
export const IMPRESSUM_ADDRESS = 'Döscherstraße 3, 22083 Hamburg';
export const IMPRESSUM_HOSTER = 'Cloudflare, Inc., 101 Townsend Street, San Francisco, CA 94107, USA';

/**
 * Öffentlicher Spiegel des Quellcodes dieser Seite.
 *
 * Verlinkt, weil zwei Dinge hier nachlesbar sein sollten statt geglaubt: die
 * Beträge aus dem SGB XI und das Bewertungsmodell hinter der
 * Selbsteinschätzung. Bei einem Werkzeug, das einer erschöpften Angehörigen
 * eine Zahl nennt, an der sie planen wird, ist ein lesbares Modell mehr wert
 * als auf jeder anderen Seite.
 */
export const GITHUB_REPO = 'https://github.com/its-philipp/deutschland-pflegegeld';

export const CURRENT_YEAR = 2026;

/** Absolute URL for canonical/OG tags. `path` must start with '/'. */
export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path}`;
}
