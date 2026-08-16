/**
 * Every SGB-XI amount this site is allowed to state, in one place.
 *
 * **Rule (queue task 2.3): never hardcode a care benefit amount anywhere else.**
 * A page, a calculator or a wizard reads from here or it does not show a number.
 * The reason is not tidiness: these amounts change by Verordnung (§ 30 SGB XI
 * dynamisation), and a figure copied into a component is a figure nobody will
 * find when it changes.
 *
 * Every entry carries the provision it comes from. The values below were read
 * on 2026-08-03 from the consolidated text of SGB XI on gesetze-im-internet.de
 * (`sgb_11/xml.zip`), in the version
 * **"Zuletzt geändert durch Art. 8 G v. 16.4.2026 I Nr. 107"**. They were not
 * taken from a search summary, a care portal or a press release — this project's
 * rule is that a statutory amount comes from the statute.
 */

export const SGB_XI_STAND = '2026-08-03' as const;
export const SGB_XI_FASSUNG =
  'Zuletzt geändert durch Art. 8 G v. 16.4.2026 I Nr. 107' as const;

const GESETZE = 'https://www.gesetze-im-internet.de/sgb_11';

/** The five Pflegegrade. Grad 1 exists but carries almost no cash benefit. */
export type Pflegegrad = 1 | 2 | 3 | 4 | 5;

/** A monetary entitlement plus the provision it rests on. */
export interface Leistung {
  /** Human-readable, e.g. "§ 37 Abs. 1 SGB XI". */
  fundstelle: string;
  url: string;
  /** ISO date the provision was read. Printed as "abgerufen am …". */
  abgerufen: string;
}

const q = (paragraf: string, absatz: string, anker: string): Leistung => ({
  fundstelle: `§ ${paragraf} ${absatz} SGB XI`,
  url: `${GESETZE}/__${anker}.html`,
  abgerufen: SGB_XI_STAND,
});

/** Amounts that exist per Pflegegrad. Grad 1 is `null` where there is no claim. */
export type ProGrad = Record<Pflegegrad, number | null>;

/**
 * Pflegegeld — the cash benefit paid when care is organised privately.
 * Monthly, § 37 Abs. 1 SGB XI. No claim in Pflegegrad 1.
 */
export const PFLEGEGELD: { betrag: ProGrad; quelle: Leistung } = {
  betrag: { 1: null, 2: 347, 3: 599, 4: 800, 5: 990 },
  quelle: q('37', 'Abs. 1', '37'),
};

/**
 * Pflegesachleistung — the value of professional home care per month.
 * § 36 Abs. 3 SGB XI. No claim in Pflegegrad 1.
 */
export const PFLEGESACHLEISTUNG: { betrag: ProGrad; quelle: Leistung } = {
  betrag: { 1: null, 2: 796, 3: 1497, 4: 1859, 5: 2299 },
  quelle: q('36', 'Abs. 3', '36'),
};

/**
 * Tages- und Nachtpflege — partial inpatient care, monthly.
 * § 41 Abs. 2 SGB XI. No claim in Pflegegrad 1.
 */
export const TEILSTATIONAERE_PFLEGE: { betrag: ProGrad; quelle: Leistung } = {
  betrag: { 1: null, 2: 721, 3: 1357, 4: 1685, 5: 2085 },
  quelle: q('41', 'Abs. 2', '41'),
};

/**
 * Vollstationäre Pflege — what the Pflegekasse pays towards a nursing home,
 * monthly. § 43 Abs. 2 SGB XI. Pflegegrad 1 gets a flat 131 € under Abs. 3,
 * which is a Zuschuss, not the Abs.-2 benefit — hence the separate constant.
 */
export const VOLLSTATIONAER: { betrag: ProGrad; quelle: Leistung } = {
  betrag: { 1: null, 2: 805, 3: 1319, 4: 1855, 5: 2096 },
  quelle: q('43', 'Abs. 2', '43'),
};

export const VOLLSTATIONAER_GRAD_1 = {
  betrag: 131,
  quelle: q('43', 'Abs. 3', '43'),
} as const;

/**
 * Entlastungsbetrag — 131 € a month for everyone in home care, **including
 * Pflegegrad 1**. § 45b Abs. 1 SGB XI.
 */
export const ENTLASTUNGSBETRAG = {
  betrag: 131,
  quelle: q('45b', 'Abs. 1', '45b'),
} as const;

/**
 * Gemeinsamer Jahresbetrag für Verhinderungs- und Kurzzeitpflege.
 *
 * **This replaced the two separate budgets.** § 42a Abs. 1 SGB XI now grants
 * one combined annual amount for both, from Pflegegrad 2 upwards. Any page
 * still describing a separate Verhinderungspflege budget and a separate
 * Kurzzeitpflege budget is describing the old law.
 */
export const GEMEINSAMER_JAHRESBETRAG = {
  betrag: 3539,
  ab_pflegegrad: 2,
  quelle: q('42a', 'Abs. 1', '42a'),
} as const;

/**
 * Pflegehilfsmittel zum Verbrauch (gloves, disinfectant, bed pads), monthly cap.
 * § 40 Abs. 2 SGB XI.
 */
export const PFLEGEHILFSMITTEL_VERBRAUCH = {
  betrag: 42,
  quelle: q('40', 'Abs. 2', '40'),
} as const;

/**
 * Zuzahlung for non-consumable Pflegehilfsmittel: 10 %, capped at 25 € per item,
 * for insured persons who have turned 18. § 40 Abs. 3 SGB XI.
 */
export const PFLEGEHILFSMITTEL_ZUZAHLUNG = {
  prozent: 10,
  hoechstbetrag: 25,
  ab_alter: 18,
  quelle: q('40', 'Abs. 3', '40'),
} as const;

/**
 * Wohnumfeldverbessernde Maßnahmen (stairlift, walk-in shower, door widening).
 * 4.180 € per measure and per person; where several people in one household
 * qualify, the total per measure is capped at 16.720 €. § 40 Abs. 4 SGB XI.
 */
export const WOHNUMFELDVERBESSERUNG = {
  je_massnahme: 4180,
  gesamt_je_massnahme_max: 16720,
  quelle: q('40', 'Abs. 4', '40'),
} as const;

/**
 * Leistungszuschlag — the cap on what a resident pays for the care portion of a
 * nursing home, rising with length of stay. § 43c SGB XI, Pflegegrade 2–5.
 *
 * It is a percentage **of the resident's own Eigenanteil an den pflegebedingten
 * Aufwendungen**, not of the total bill: Unterkunft, Verpflegung and
 * Investitionskosten are untouched by it. Getting that wrong overstates the
 * relief massively, so any UI built on this must name what the percentage
 * applies to.
 */
export const LEISTUNGSZUSCHLAG = {
  stufen: [
    { ab_monat: 0, bis_monat: 12, prozent: 15 },
    { ab_monat: 13, bis_monat: 24, prozent: 30 },
    { ab_monat: 25, bis_monat: 36, prozent: 50 },
    { ab_monat: 37, bis_monat: null, prozent: 75 },
  ],
  gilt_ab_pflegegrad: 2,
  quelle: q('43c', '', '43c'),
} as const;

/**
 * Pflegegeld while Verhinderungs- or Kurzzeitpflege is running: half the
 * previous amount, for up to eight weeks per calendar year each.
 * § 37 Abs. 2 Satz 2 SGB XI.
 */
export const PFLEGEGELD_WAEHREND_ERSATZPFLEGE = {
  anteil: 0.5,
  wochen_je_kalenderjahr: 8,
  quelle: q('37', 'Abs. 2 Satz 2', '37'),
} as const;

/**
 * Kombinationsleistung — Pflegegeld and Sachleistung side by side.
 *
 * § 38 SGB XI: the Pflegegeld is reduced by **the percentage of the
 * Sachleistung that was used**. The decision binds for six months.
 *
 * So: `pflegegeldAnteil = PFLEGEGELD × (1 − verbrauchterSachleistungsanteil)`.
 * There is no separate table for this — it is arithmetic on the two constants
 * above, which is exactly why they must not be duplicated anywhere.
 */
export const KOMBINATIONSLEISTUNG = {
  bindungsdauer_monate: 6,
  quelle: q('38', '', '38'),
} as const;

/**
 * Anteiliges Pflegegeld for a partial month: the month counts as 30 days.
 * § 37 Abs. 2 Satz 1 SGB XI.
 */
export const TAGE_JE_MONAT = 30 as const;

/**
 * Kombinationsleistung: what is left in cash after using part of the
 * Sachleistung budget.
 *
 * @param grad Pflegegrad 2–5.
 * @param sachleistungAnteil Share of the Sachleistung budget used, 0…1.
 * @returns Monthly Pflegegeld in euro, or `null` where there is no claim.
 */
export function kombinationsleistung(
  grad: Pflegegrad,
  sachleistungAnteil: number,
): number | null {
  const geld = PFLEGEGELD.betrag[grad];
  if (geld === null) return null;
  const anteil = Math.min(Math.max(sachleistungAnteil, 0), 1);
  return geld * (1 - anteil);
}

/**
 * The Leistungszuschlag percentage for a given length of stay.
 * Returns 0 below Pflegegrad 2, where § 43c does not apply.
 */
export function leistungszuschlagProzent(grad: Pflegegrad, monate: number): number {
  if (grad < LEISTUNGSZUSCHLAG.gilt_ab_pflegegrad) return 0;
  const stufe = LEISTUNGSZUSCHLAG.stufen.find(
    (s) => monate >= s.ab_monat && (s.bis_monat === null || monate <= s.bis_monat),
  );
  return stufe ? stufe.prozent : 0;
}
