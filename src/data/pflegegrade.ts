import type { Leistung, Pflegegrad } from './leistungen';

/**
 * Was das Gesetz über jeden einzelnen Pflegegrad sagt — jenseits der Beträge.
 *
 * Bis 2026-10-31 waren die fünf Pflegegrad-Seiten nach Maskieren der Beträge
 * wortgleich (Grad 3 und 4: 83 von 83 Sätzen). Was einen Grad vom anderen
 * unterscheidet, steht aber im Gesetz selbst: seine amtliche Bezeichnung, die
 * Pflicht zum Beratungsbesuch und, bei Grad 5, die besondere
 * Bedarfskonstellation. Die Punktgrenzen kommen nicht von hier, sondern aus
 * `punktspanne()` in `lib/pflegegrad.ts` — eine Tabelle für Rechner und Seite.
 *
 * Gelesen am 2026-10-31 im Volltext auf gesetze-im-internet.de.
 */

const GELESEN = '2026-10-31';
const GESETZE = 'https://www.gesetze-im-internet.de/sgb_11';

export const QUELLE_PUNKTE: Leistung = {
  fundstelle: '§ 15 Abs. 3 SGB XI',
  url: `${GESETZE}/__15.html`,
  abgerufen: GELESEN,
};

export const QUELLE_BEDARFSKONSTELLATION: Leistung = {
  fundstelle: '§ 15 Abs. 4 SGB XI',
  url: `${GESETZE}/__15.html`,
  abgerufen: GELESEN,
};

export const QUELLE_KINDER: Leistung = {
  fundstelle: '§ 15 Abs. 7 SGB XI',
  url: `${GESETZE}/__15.html`,
  abgerufen: GELESEN,
};

export const QUELLE_BERATUNGSBESUCH: Leistung = {
  fundstelle: '§ 37 Abs. 3 und 6 SGB XI',
  url: `${GESETZE}/__37.html`,
  abgerufen: GELESEN,
};

/** Wörtlich aus § 15 Abs. 3 Satz 4 SGB XI. */
export const BEZEICHNUNG: Record<Pflegegrad, string> = {
  1: 'geringe Beeinträchtigungen der Selbständigkeit oder der Fähigkeiten',
  2: 'erhebliche Beeinträchtigungen der Selbständigkeit oder der Fähigkeiten',
  3: 'schwere Beeinträchtigungen der Selbständigkeit oder der Fähigkeiten',
  4: 'schwerste Beeinträchtigungen der Selbständigkeit oder der Fähigkeiten',
  5: 'schwerste Beeinträchtigungen der Selbständigkeit oder der Fähigkeiten mit besonderen Anforderungen an die pflegerische Versorgung',
};

/**
 * Der Beratungsbesuch in der eigenen Häuslichkeit, § 37 Abs. 3 SGB XI.
 *
 * Die einzige Stelle im Leistungsrecht, an der Grad 2/3 und Grad 4/5
 * verschiedene Regeln haben, die nicht aus einem Betrag bestehen — und eine,
 * die Geld kostet, wer sie übersieht: Ohne den Pflichtbesuch ist das
 * Pflegegeld zu kürzen, im Wiederholungsfall zu entziehen (Abs. 6).
 * Die Videoregel gilt nach Abs. 3 Satz 5 bis einschließlich 31.03.2027.
 */
export const BERATUNGSBESUCH: Record<Pflegegrad, { pflicht: boolean; text: string }> = {
  1: {
    pflicht: false,
    text: 'Bei Pflegegrad 1 ist der Beratungsbesuch keine Pflicht, sondern ein Angebot: Sie können halbjährlich einmal eine Beratung bei sich zu Hause abrufen.',
  },
  2: {
    pflicht: true,
    text: 'Wer bei Pflegegrad 2 Pflegegeld bezieht, muss halbjährlich einmal eine Beratung bei sich zu Hause abrufen.',
  },
  3: {
    pflicht: true,
    text: 'Wer bei Pflegegrad 3 Pflegegeld bezieht, muss halbjährlich einmal eine Beratung bei sich zu Hause abrufen.',
  },
  4: {
    pflicht: true,
    text: 'Wer bei Pflegegrad 4 Pflegegeld bezieht, muss halbjährlich einmal eine Beratung bei sich zu Hause abrufen — und darf sie, anders als bei Grad 2 und 3, auch vierteljährlich in Anspruch nehmen.',
  },
  5: {
    pflicht: true,
    text: 'Wer bei Pflegegrad 5 Pflegegeld bezieht, muss halbjährlich einmal eine Beratung bei sich zu Hause abrufen — und darf sie, anders als bei Grad 2 und 3, auch vierteljährlich in Anspruch nehmen.',
  },
};
