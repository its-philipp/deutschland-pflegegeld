import recht from './sources/landesrecht-pflege.json';
import type { LandEigenanteil } from './eigenanteile';

/**
 * Was ein Land für Heimbewohner selbst regelt (2026-10-31): Heimgesetz und
 * Aufsicht, Hilfe zu den Investitionskosten (Pflegewohngeld), Landespflegegeld.
 *
 * Die Rohdaten (`landesrecht-pflege.json`, data-researcher) sind
 * unterschiedlich gut belegt — mehrere Landesportale sperren automatische
 * Abrufe. Die Regel hier: **Es steht nur, was gelesen wurde.**
 *
 * - Heimrecht nur, wo `verifikation` Gesetzestext, Gesetzblatt oder eine
 *   amtliche Seite ist (10 Länder). RP, SL, TH (nur Suchtreffer), ST
 *   (Zuständigkeit aus Suchtreffer), SH (nur Landtagsdrucksache) und MV (nur
 *   Gesetzentwurf) bekommen keinen Heimrecht-Absatz.
 * - Pflegewohngeld „nein" beruht auf der Länderabfrage des BMG für das
 *   Berichtsjahr 2024 und wird mit diesem Stand genannt. Thüringen ist
 *   unbelegt und bekommt keine Aussage.
 *
 * Die Sätze sind je Land von Hand formuliert und geben nur wieder, was im
 * Datensatz mit Fundstelle steht. Adressen kommen aus dem Datensatz, damit es
 * für jede Quelle genau eine Stelle gibt.
 */

type Roh = (typeof recht.laender)[number];

const roh = (code: string): Roh => {
  const r = recht.laender.find((l) => l.code === code);
  if (!r) throw new Error(`landesrecht-pflege.json: kein Eintrag für ${code}`);
  return r;
};

export interface Absatz {
  text: string;
  quelle: string;
  url: string | null;
  abgerufen: string;
}

const HEIMRECHT_GELESEN = new Set([
  'gesetzestext_gelesen',
  'gesetzblatt_gelesen',
  'amtliche_seite_gelesen',
  'inhaltsuebersicht_und_amtliche_seite_gelesen',
]);

const HEIMRECHT_TEXT: Record<string, string> = {
  BW: 'Seit dem 28. Februar 2026 gilt in Baden-Württemberg das Gesetz für Teilhabe- und Pflegequalität (TPQG). Es hat das bisherige WTPG abgelöst; die Heimaufsicht heißt seitdem Beratungs- und Prüfbehörde.',
  BY: 'In Bayern regelt das Pflege- und Wohnqualitätsgesetz (PfleWoqG) die Pflegeheime. Die Aufsicht führt die FQA, die Fachstelle für Pflege- und Behinderteneinrichtungen bei den Kreisverwaltungsbehörden.',
  BE: 'In Berlin gilt das Wohnteilhabegesetz (WTG), 2021 neu gefasst. Die Heimaufsicht sitzt beim Landesamt für Gesundheit und Soziales.',
  BB: 'In Brandenburg gilt das Brandenburgische Pflege- und Betreuungswohngesetz (BbgPBWoG). Zuständig ist die Aufsicht für unterstützende Wohnformen (AuW).',
  HB: 'In Bremen gilt seit 2023 das Bremische Wohn- und Betreuungsgesetz (BremWoBeG); die Aufsicht führt die Bremische Wohn- und Betreuungsaufsicht.',
  HH: 'In Hamburg gilt das Hamburgische Wohn- und Betreuungsqualitätsgesetz (HmbWBG). Die Wohn-Pflege-Aufsicht ist in den sieben Bezirksämtern angesiedelt.',
  HE: 'In Hessen gilt das Hessische Gesetz über Betreuungs- und Pflegeleistungen (HGBP); geprüft wird von der Hessischen Betreuungs- und Pflegeaufsicht.',
  NI: 'In Niedersachsen gilt das Niedersächsische Gesetz über unterstützende Wohnformen (NuWG); zuständig ist die Heimaufsicht.',
  NW: 'In Nordrhein-Westfalen gilt das Wohn- und Teilhabegesetz (WTG NRW). Geprüft wird von den Beratungs- und Prüfbehörden, die meist Heimaufsicht genannt werden. Eine Neufassung soll nach Angabe des Landes Anfang 2027 in Kraft treten.',
  SN: 'In Sachsen gilt seit 2024 das Sächsische Wohnteilhabegesetz (SächsWTG), das das frühere SächsBeWoG abgelöst hat. Die Aufsicht liegt beim Kommunalen Sozialverband Sachsen (KSV).',
};

export function heimrecht(land: LandEigenanteil): Absatz | null {
  const h = roh(land.code).heimrecht;
  const text = HEIMRECHT_TEXT[land.code];
  if (!text || !HEIMRECHT_GELESEN.has(h.verifikation)) return null;
  return { text, quelle: `${h.titel} (${h.abkuerzung})`, url: h.url, abgerufen: h.abgerufen };
}

/** Was das Land stattdessen fördert — je Land aus dem BMG-Bericht. */
const STATTDESSEN: Record<string, string> = {
  BW: 'Das Land fördert nur einzelne Einrichtungen, über das Innovationsprogramm Pflege.',
  BY: 'Das Land fördert nur einzelne Einrichtungen, etwa über die Förderrichtlinie „Pflege im sozialen Nahraum".',
  BE: 'Die Berliner Landespauschale gilt nur für Tages- und Kurzzeitpflegeplätze.',
  BB: 'Das Land fördert Einrichtungen über die Pflegezukunftsinvestitions-Richtlinie, nicht die Bewohner.',
  HB: 'Die bremische Landesförderung gilt nur für teilstationäre Pflege und Kurzzeitpflege.',
  HH: 'Hamburg fördert nur Kurzzeitpflegeplätze und kleinräumige Wohnformen.',
  HE: 'Die Förderung von Altenpflegeeinrichtungen hat Hessen 2014 eingestellt.',
  NI: 'Niedersachsen stellt die Investitionskosten nach eigener Angabe einer Miete gleich und fördert stationäre Einrichtungen deshalb nicht.',
  RP: 'Rheinland-Pfalz meldet keine Förderung der Investitionskosten.',
  SL: 'Die saarländische Landesförderung gilt nur für teilstationäre Pflege und Kurzzeitpflege.',
  SN: 'Sachsen fördert lediglich neue Kurzzeitpflegeplätze.',
  ST: 'Sachsen-Anhalt meldet nur eine Corona-Investitionsrichtlinie für Einrichtungen.',
};

export function investitionskostenHilfe(land: LandEigenanteil, euro: (n: number) => string): Absatz | null {
  const i = roh(land.code).investitionskosten_hilfe;
  const imLand = land.name === 'Saarland' ? 'im Saarland' : `in ${land.name}`;
  const kosten = euro(land.investitionskosten);

  if (land.code === 'NW') {
    return {
      text: `Nordrhein-Westfalen zahlt Pflegewohngeld: Wer die Investitionskosten von ${kosten} im Monat nicht aus eigenem Einkommen und Vermögen tragen kann — auch das des Partners zählt —, bekommt sie vom Land bezuschusst. Barvermögen bis 10.000 € (Paare 15.000 €) bleibt dabei unberücksichtigt. Das Geld geht direkt an das Heim; den Antrag stellt meist das Heim mit Ihrer Zustimmung beim Sozialhilfeträger.`,
      quelle: '§ 14 APG NRW, § 16 APG DVO NRW',
      url: i.url,
      abgerufen: i.abgerufen,
    };
  }
  if (land.code === 'SH') {
    return {
      text: `Schleswig-Holstein zahlt Pflegewohngeld, wenn Einkommen und Vermögen für die Investitionskosten von ${kosten} im Monat nicht reichen — höchstens 15,35 € am Tag. Den Antrag kann das Heim beim örtlichen Sozialhilfeträger stellen.`,
      quelle: '§ 6 Abs. 4 LPflegeG Schleswig-Holstein, Landesseite „Pflege bezahlen"',
      url: i.url,
      abgerufen: i.abgerufen,
    };
  }
  if (land.code === 'MV') {
    // Die einzige gefundene Adresse ist eine private Spiegelung der Drucksache;
    // genannt wird deshalb die Drucksache selbst, ohne Link.
    return {
      text: `Mecklenburg-Vorpommern hat sein Pflegewohngeld 2012 für neu einziehende Bewohner abgeschafft. Die Investitionskosten von ${kosten} im Monat tragen Sie selbst; reicht das Geld nicht, kann das Sozialamt mit Hilfe zur Pflege einspringen.`,
      quelle: 'Landtag Mecklenburg-Vorpommern, Drucksache 6/5862 (Antwort der Landesregierung, 2016)',
      url: null,
      abgerufen: i.abgerufen,
    };
  }
  if (i.gibt_es === false && STATTDESSEN[land.code]) {
    return {
      text: `Ein Pflegewohngeld, wie es Nordrhein-Westfalen und Schleswig-Holstein zahlen, gibt es ${imLand} nicht: Die Investitionskosten von ${kosten} im Monat tragen Sie selbst; reicht das Geld nicht, kann das Sozialamt mit Hilfe zur Pflege einspringen. ${STATTDESSEN[land.code]}`,
      quelle: 'Länderabfrage des Bundesgesundheitsministeriums zur Investitionskostenförderung, Berichtsjahr 2024',
      url: i.url,
      abgerufen: i.abgerufen,
    };
  }
  return null;
}

export function landespflegegeld(land: LandEigenanteil): Absatz | null {
  const p = roh(land.code).landespflegegeld;
  if (land.code !== 'BY' || p.gibt_es !== true) return null;
  return {
    text: 'Zusätzlich zahlt Bayern ein Landespflegegeld: 500 € im Jahr für alle mit mindestens Pflegegrad 2 und Hauptwohnsitz in Bayern — ausdrücklich auch im Pflegeheim, unabhängig vom Einkommen und ohne Anrechnung auf Pflegeversicherung oder Sozialhilfe. Bis 2025 waren es 1.000 €. Beantragt wird es einmal beim Landesamt für Pflege; der Betrag eines Jahres wird bis zum 31. Januar des Folgejahres ausgezahlt.',
    quelle: 'Art. 2 Abs. 1 und 4 BayLPflGG (Fassung ab 01.01.2026)',
    url: p.url,
    abgerufen: p.abgerufen,
  };
}
