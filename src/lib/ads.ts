/**
 * The single switch for advertising on this site (root CLAUDE.md → Advertising
 * slots). One constant drives the script tag, `/ads.txt`, the Datenschutz
 * section and the consent-withdrawal button, so the privacy notice cannot
 * describe something the site does not actually do.
 *
 * **Empty string = everything off**, and that is the state until this site's
 * own AdSense review has passed. Do not fill it in to "prepare" — an empty
 * `<ins>` and an ads.txt naming a publisher who has not been approved are both
 * worse than nothing.
 */
export const ADSENSE_CLIENT = '';

/** True once a publisher id is configured. Every ad-related branch reads this. */
export const adsEnabled = ADSENSE_CLIENT !== '';

/**
 * Auto ads stay OFF (root CLAUDE.md): Google would place units wherever it
 * likes, including between a wizard step and its result. On this site that
 * matters twice over — the audience is stressed relatives, and the design
 * direction requires advertising to be *visibly* set apart from the advice
 * (pflege-kompass/STATE.md). An ad that appears inside the reading flow, in
 * the site's own voice, is precisely the dark pattern that direction rules out.
 */
export const AUTO_ADS = false;

/**
 * Every ad unit carries a visible "Anzeige" label, not only the styling that
 * sets it apart. Required by the design direction, and it is also what German
 * law expects of recognisable advertising (§ 6 Abs. 1 Nr. 1 TMG-Nachfolge in
 * § 6 DDG, and the Trennungsgebot). Kept here so the label cannot be dropped
 * in one template and kept in another.
 */
export const AD_LABEL = 'Anzeige';

/** The loader the layout injects, only when ads are enabled. */
export function adsenseScriptUrl(): string {
  return `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
}

/**
 * Body of `/ads.txt`. Empty while ads are off — an ads.txt that names a
 * publisher relationship that does not exist is a claim we cannot back.
 */
export function adsTxt(): string {
  if (!adsEnabled) return '';
  return `google.com, ${ADSENSE_CLIENT}, DIRECT, f08c47fec0942fa0\n`;
}
