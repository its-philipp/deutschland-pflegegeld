/**
 * Die Ermittlung des Pflegegrades nach § 15 SGB XI — reine Rechenlogik, ohne
 * Anzeige.
 *
 * Belegt in `src/data/sources/pflegegrad-begutachtung.json`, dort mit Fundstelle
 * je Schritt. `npm run check:pflegegrad` rechnet die Invarianten und Grenzfälle
 * bei jedem Lauf gegen diese Datei; weicht einer ab, scheitert die Prüfung.
 *
 * **Zwei Fehler, die ein naiv gebauter Rechner macht, und die hier bewusst
 * vermieden sind:**
 *
 * 1. **Modul 2 und Modul 3 werden nicht addiert.** § 15 Abs. 3 Satz 2 gibt
 *    beiden einen *gemeinsamen* gewichteten Punkt, nämlich den höheren der
 *    beiden. Wer addiert, kommt auf bis zu 15 Gesamtpunkte zu viel — bei einer
 *    Skala von 100 Punkten und Grad-Grenzen alle 20 Punkte ist das leicht ein
 *    ganzer Pflegegrad zu hoch.
 * 2. **Modul 5 ist nicht „je Kriterium eine Stufe".** Es besteht aus vier
 *    Blöcken (Häufigkeiten, seltenere Häufigkeiten, Termine mit Faktoren, Diät),
 *    die zusammen höchstens 15 Einzelpunkte ergeben. Wer es wie die übrigen
 *    Module behandelt, kommt auf 67 statt 15 — genau so ist es bei der Erhebung
 *    am 2026-08-16 zuerst passiert.
 *
 * Der Rechner bildet **§ 15 Abs. 4 nicht ab** (besondere Bedarfskonstellationen,
 * die auch unter 90 Punkten zu Pflegegrad 5 führen können). Das ist eine
 * pflegefachliche Entscheidung, keine Rechnung — die Oberfläche muss das sagen.
 */

/** Die sechs Module des Begutachtungsinstruments (§ 15 Abs. 2 Satz 1). */
export type ModulNummer = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Punktbereiche und gewichtete Punkte aus Anlage 2.
 *
 * `grenzen[i]` ist die **Obergrenze** des Punktbereichs i; die Summe fällt in
 * den ersten Bereich, dessen Obergrenze sie nicht überschreitet. So steht es in
 * der Anlage: „0 – 1", „2 – 3", „4 – 5" … — lückenlos und ohne Zwischenwerte,
 * weil Einzelpunkte immer ganzzahlig sind.
 */
interface ModulSkala {
  grenzen: [number, number, number, number, number];
  gewichtet: [number, number, number, number, number];
}

const SKALEN: Record<ModulNummer, ModulSkala> = {
  1: { grenzen: [1, 3, 5, 9, 15], gewichtet: [0, 2.5, 5, 7.5, 10] },
  2: { grenzen: [1, 5, 10, 16, 33], gewichtet: [0, 3.75, 7.5, 11.25, 15] },
  3: { grenzen: [0, 2, 4, 6, 65], gewichtet: [0, 3.75, 7.5, 11.25, 15] },
  4: { grenzen: [2, 7, 18, 36, 54], gewichtet: [0, 10, 20, 30, 40] },
  5: { grenzen: [0, 1, 3, 5, 15], gewichtet: [0, 5, 10, 15, 20] },
  6: { grenzen: [0, 3, 6, 11, 18], gewichtet: [0, 3.75, 7.5, 11.25, 15] },
};

/** Höchstmögliche Summe der Einzelpunkte je Modul — die Obergrenze aus Anlage 2. */
export const MODUL_MAXIMUM: Record<ModulNummer, number> = {
  1: 15,
  2: 33,
  3: 65,
  4: 54,
  5: 15,
  6: 18,
};

/** Einzelpunkte je Modul, wie sie die Begutachtung feststellt. */
export type Einzelpunkte = Record<ModulNummer, number>;

/** Der Punktbereich 0–4, in den eine Modulsumme fällt (Anlage 2). */
export function punktbereich(modul: ModulNummer, summe: number): 0 | 1 | 2 | 3 | 4 {
  const { grenzen } = SKALEN[modul];
  for (let i = 0; i < grenzen.length; i++) {
    if (summe <= grenzen[i]!) return i as 0 | 1 | 2 | 3 | 4;
  }
  // Oberhalb des höchsten Bereichs kann eine korrekte Erhebung nicht liegen;
  // die Prüfung deckelt statt zu werfen, damit eine Eingabe nie die Seite bricht.
  return 4;
}

/** Die gewichteten Punkte eines Moduls (Anlage 2). */
export function gewichtetePunkte(modul: ModulNummer, summe: number): number {
  return SKALEN[modul].gewichtet[punktbereich(modul, summe)]!;
}

export interface Ergebnis {
  /** Gewichtete Punkte je Modul. Module 2 und 3 stehen hier noch einzeln. */
  gewichtet: Record<ModulNummer, number>;
  /** Der gemeinsame Wert für die Module 2 und 3 — der höhere der beiden. */
  modul2und3: number;
  /** Summe aller gewichteten Punkte, 0 bis 100. */
  gesamtpunkte: number;
  /** 0 bedeutet: keine Pflegebedürftigkeit im Sinne des Gesetzes. */
  pflegegrad: 0 | 1 | 2 | 3 | 4 | 5;
}

/**
 * Die Pflegegrad-Schwellen aus § 15 Abs. 3 Satz 4.
 *
 * Als Untergrenzen notiert, weil das Gesetz sie so schreibt („ab 12,5 bis unter
 * 27"). Absteigend geprüft, damit die Grenze selbst zum höheren Grad gehört —
 * genau 27,0 Punkte sind Pflegegrad 2, nicht 1.
 */
const SCHWELLEN: { ab: number; grad: 1 | 2 | 3 | 4 | 5 }[] = [
  { ab: 90, grad: 5 },
  { ab: 70, grad: 4 },
  { ab: 47.5, grad: 3 },
  { ab: 27, grad: 2 },
  { ab: 12.5, grad: 1 },
];

export function pflegegradAus(gesamtpunkte: number): 0 | 1 | 2 | 3 | 4 | 5 {
  return SCHWELLEN.find((s) => gesamtpunkte >= s.ab)?.grad ?? 0;
}

/**
 * Kinder bis zu 18 Monaten (§ 15 Abs. 7).
 *
 * Dieselben Punktspannen führen jeweils einen Grad höher; ab 12,5 Punkten
 * beginnt hier Pflegegrad 2 statt 1. Nicht als eigene Tabelle gebaut, sondern
 * als Verschiebung — so kann die eine Schwellentabelle nicht von der anderen
 * abweichen.
 */
export function pflegegradAusFuerSaeugling(gesamtpunkte: number): 0 | 1 | 2 | 3 | 4 | 5 {
  const regulaer = pflegegradAus(gesamtpunkte);
  if (regulaer === 0) return 0;
  return Math.min(regulaer + 1, 5) as 1 | 2 | 3 | 4 | 5;
}

export function berechne(
  einzelpunkte: Einzelpunkte,
  optionen: { bisAchtzehnMonate?: boolean } = {},
): Ergebnis {
  const gewichtet = {
    1: gewichtetePunkte(1, einzelpunkte[1]),
    2: gewichtetePunkte(2, einzelpunkte[2]),
    3: gewichtetePunkte(3, einzelpunkte[3]),
    4: gewichtetePunkte(4, einzelpunkte[4]),
    5: gewichtetePunkte(5, einzelpunkte[5]),
    6: gewichtetePunkte(6, einzelpunkte[6]),
  } as Record<ModulNummer, number>;

  // § 15 Abs. 3 Satz 2 — der höhere der beiden Werte, nicht die Summe.
  const modul2und3 = Math.max(gewichtet[2], gewichtet[3]);

  const gesamtpunkte =
    gewichtet[1] + modul2und3 + gewichtet[4] + gewichtet[5] + gewichtet[6];

  return {
    gewichtet,
    modul2und3,
    gesamtpunkte,
    pflegegrad: optionen.bisAchtzehnMonate
      ? pflegegradAusFuerSaeugling(gesamtpunkte)
      : pflegegradAus(gesamtpunkte),
  };
}

/* ---------------------------------------------------------------------------
 * Modul 5 — die vier Blöcke aus Anlage 1.
 *
 * Getrennt vom Rest, weil das Modul seine Einzelpunkte nicht aus Stufen je
 * Kriterium bildet. Die Funktionen hier liefern die Einzelpunkte, die dann wie
 * bei jedem anderen Modul in `berechne` gehen.
 * ------------------------------------------------------------------------- */

/**
 * Häufigkeiten, wie ein Mensch sie angibt — nicht alles ist täglich.
 *
 * Anlage 1 schreibt nur „Umrechnung in Maßnahmen pro Tag" vor und nennt keine
 * Divisoren; sie ist ein Erhebungsbogen mit leeren Spalten. Die Faktoren stehen
 * in den **Begutachtungs-Richtlinien nach § 17 Abs. 1 SGB XI** (BRi vom
 * 21.08.2024), dort im Wortlaut: monatliche Maßnahmen durch 30, wöchentliche
 * durch sieben. Am 2026-08-16 im PDF der Richtlinie selbst gelesen.
 */
export interface Haeufigkeit {
  proTag?: number;
  proWoche?: number;
  proMonat?: number;
}

/** Häufigkeiten in einen Durchschnittswert pro Tag umrechnen (BRi zu Modul 5). */
export function massnahmenProTag(...angaben: Haeufigkeit[]): number {
  return angaben.reduce(
    (summe, a) =>
      summe + (a.proTag ?? 0) + (a.proWoche ?? 0) / 7 + (a.proMonat ?? 0) / 30,
    0,
  );
}

/**
 * Blöcke 5.1–5.7: Maßnahmen **pro Tag**, aufsummiert über alle sieben Kriterien.
 *
 * Der Aufrufer übergibt den bereits umgerechneten Durchschnittswert — dafür ist
 * `massnahmenProTag` da.
 */
export function punkteHaeufigeMassnahmen(massnahmenProTag: number): 0 | 1 | 2 | 3 {
  if (massnahmenProTag < 1) return 0;
  if (massnahmenProTag <= 3) return 1;
  if (massnahmenProTag <= 8) return 2;
  return 3;
}

/**
 * Blöcke 5.8–5.11: dieselbe Zählung, andere Schwellen.
 *
 * „seltener als einmal wöchentlich" ist die Nullgrenze — in Maßnahmen pro Tag
 * ist das weniger als 1/7.
 */
export function punkteSelteneMassnahmen(massnahmenProTag: number): 0 | 1 | 2 | 3 {
  if (massnahmenProTag < 1 / 7) return 0;
  if (massnahmenProTag < 1) return 1;
  if (massnahmenProTag < 3) return 2;
  return 3;
}

/**
 * Blöcke 5.12–5.15 und 5.K: Termine, mit den Faktoren aus Anlage 1 gewichtet.
 *
 * Der Aufrufer übergibt die bereits gewichtete Summe. Die Punkte springen von 3
 * auf **6** — es gibt keine 4 und keine 5. Das ist kein Tippfehler in der
 * Anlage, sondern der Grund, warum Modul 5 überhaupt 15 Punkte erreichen kann.
 */
export function punkteTermine(gewichteteSumme: number): 0 | 1 | 2 | 3 | 6 {
  if (gewichteteSumme < 4.3) return 0;
  if (gewichteteSumme < 8.6) return 1;
  if (gewichteteSumme < 12.9) return 2;
  if (gewichteteSumme < 60) return 3;
  return 6;
}

/** Die Faktoren aus Anlage 1, je Ziffer. */
export const TERMIN_FAKTOREN = {
  '5.12': { taeglich: 60, woechentlich: 8.6, monatlich: 2 },
  '5.13': { woechentlich: 4.3, monatlich: 1 },
  '5.14': { woechentlich: 4.3, monatlich: 1 },
  '5.15': { woechentlich: 8.6, monatlich: 2 },
  '5.K': { woechentlich: 4.3, monatlich: 1 },
} as const;

/** Die Einzelpunkte des Moduls 5 aus seinen vier Blöcken. */
export function einzelpunkteModul5(teile: {
  haeufigeMassnahmenProTag: number;
  selteneMassnahmenProTag: number;
  termineGewichtet: number;
  /** 5.16 Diät: 0 = entfällt oder selbständig … 3 = unselbständig. */
  diaet: 0 | 1 | 2 | 3;
}): number {
  return (
    punkteHaeufigeMassnahmen(teile.haeufigeMassnahmenProTag) +
    punkteSelteneMassnahmen(teile.selteneMassnahmenProTag) +
    punkteTermine(teile.termineGewichtet) +
    teile.diaet
  );
}
