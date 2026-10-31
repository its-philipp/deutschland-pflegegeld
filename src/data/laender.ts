import statistik from './sources/pflege-laenderstatistik.json';
import { BUND, LAENDER, type LandEigenanteil } from './eigenanteile';

/**
 * Was ein Land von den anderen fünfzehn unterscheidet — außer seinen
 * Eigenanteilen (2026-10-31).
 *
 * Die sechzehn Länderseiten waren bis dahin dieselbe Seite mit anderen Zahlen
 * (95 % wortgleiche Sätze), und Google hat die Domain abgestuft. Was hier steht,
 * ist je Land tatsächlich verschieden: wie stark der Eigenanteil in einem Jahr
 * gestiegen ist, wie viele Menschen dort im Heim leben, und wie die
 * Pflegeberatung organisiert ist.
 *
 * Quellen und Prüfung stehen im `_meta` von `pflege-laenderstatistik.json`
 * (Destatis-Pflegestatistik 2023, vdek-Eigenanteile 1. Juli 2025, Landesportale
 * und vdek-Landesvertretungen; 410 automatische Prüfungen). Gerechnet wird hier
 * nur mit veröffentlichten Summen, nie mit selbst subtrahierten Zuschüssen.
 */

type Roh = (typeof statistik.laender)[number];

export const PFLEGESTATISTIK_QUELLE = statistik._meta.quelle_pflegestatistik;
export const VORJAHR_QUELLE = statistik._meta.quelle_vorjahr;

const roh = (code: string): Roh => {
  const r = statistik.laender.find((l) => l.code === code);
  if (!r) throw new Error(`pflege-laenderstatistik.json: kein Eintrag für ${code}`);
  return r;
};

const prozent = (teil: number, ganz: number) => Math.round((teil / ganz) * 1000) / 10;

/** Veränderung des Eigenanteils im ersten Jahr, 1. Juli 2025 → 1. Juli 2026. */
export interface Anstieg {
  vorjahr: number;
  differenz: number;
  prozent: number;
  /** 1 = stärkster Anstieg der sechzehn Länder. */
  rang: number;
}

function anstiegRoh(land: LandEigenanteil): Omit<Anstieg, 'rang'> {
  const vorjahr = roh(land.code).eigenanteil_vorjahr.bis_12_monate;
  const jetzt = land.eigenbeteiligung_mit_zuschuss.bis_12_monate;
  return { vorjahr, differenz: jetzt - vorjahr, prozent: prozent(jetzt - vorjahr, vorjahr) };
}

export function anstieg(land: LandEigenanteil): Anstieg {
  const alle = LAENDER.map((l) => ({ code: l.code, ...anstiegRoh(l) })).sort(
    (a, b) => b.prozent - a.prozent,
  );
  return { ...anstiegRoh(land), rang: alle.findIndex((a) => a.code === land.code) + 1 };
}

export const ANSTIEG_BUND: Omit<Anstieg, 'rang'> = (() => {
  const vorjahr = statistik.bund_vorjahr.bis_12_monate;
  const jetzt = BUND.eigenbeteiligung_mit_zuschuss.bis_12_monate;
  return { vorjahr, differenz: jetzt - vorjahr, prozent: prozent(jetzt - vorjahr, vorjahr) };
})();

/** Heime, Plätze und Bewohner zum 15.12.2023 (Destatis). */
export interface Heimstatistik {
  heime: number;
  plaetze: number;
  bewohner: number;
  pflegebeduerftige: number;
  /** Anteil der Pflegebedürftigen des Landes, die dauerhaft im Heim leben, in %. */
  heimquote: number;
  /** Belegte Plätze in %. */
  auslastung: number;
}

function heimstatistikAus(s: {
  pflegeheime_mit_vollstationaerer_dauerpflege: number;
  plaetze_vollstationaer_dauer: number;
  pflegebeduerftige_vollstationaer: number;
  pflegebeduerftige_gesamt: number;
}): Heimstatistik {
  return {
    heime: s.pflegeheime_mit_vollstationaerer_dauerpflege,
    plaetze: s.plaetze_vollstationaer_dauer,
    bewohner: s.pflegebeduerftige_vollstationaer,
    pflegebeduerftige: s.pflegebeduerftige_gesamt,
    heimquote: prozent(s.pflegebeduerftige_vollstationaer, s.pflegebeduerftige_gesamt),
    auslastung: Math.round((s.pflegebeduerftige_vollstationaer / s.plaetze_vollstationaer_dauer) * 100),
  };
}

export const heimstatistik = (land: LandEigenanteil): Heimstatistik =>
  heimstatistikAus(roh(land.code).pflegestatistik);

export const HEIMSTATISTIK_BUND: Heimstatistik = heimstatistikAus(statistik.bund_pflegestatistik);

/**
 * Wie die Pflegeberatung im Land organisiert ist, in einem Satz.
 *
 * Bewusst von Hand je Land formuliert: Die Rohdaten unterscheiden amtlich
 * genannte Zahlen, selbst gezählte Listeneinträge, Standorte und Stützpunkte —
 * eine Schablone („X hat N Pflegestützpunkte") wäre bei der Hälfte der Länder
 * schlicht falsch. Jeder Satz gibt nur wieder, was in `pflegestuetzpunkte` des
 * Landes samt Hinweis belegt ist.
 */
const BERATUNG_TEXT: Record<string, string> = {
  BW: 'In Baden-Württemberg hat jeder Stadt- und Landkreis einen Pflegestützpunkt, oft mit mehreren Standorten — die Landeskarte verzeichnet 123.',
  BY: 'Bayern zählt 59 Pflegestützpunkte (Stand März 2026).',
  BE: 'Berlin hat 36 Standorte von Pflegestützpunkten (Stand April 2025).',
  BB: 'Brandenburg hat 19 Pflegestützpunkte und zusätzlich 27 Außenstellen (Stand April 2025).',
  HB: 'Bremen hat sechs Pflegestützpunkt-Standorte: Vahr, Vegesack, Gröpelingen, Huchting, Huckelriede und Bremerhaven.',
  HH: 'Hamburg hat in jedem der sieben Bezirke einen Pflegestützpunkt, dazu einen eigenen für Kinder und Jugendliche.',
  HE: 'Hessen hat nach Angabe des Landes 26 Pflegestützpunkte — in jedem Landkreis und jeder kreisfreien Stadt einen (Stand Mai 2025).',
  MV: 'Mecklenburg-Vorpommern hat 19 Pflegestützpunkte.',
  NI: 'Niedersachsen hat Pflegestützpunkte und Seniorenservicebüros 2014 zu „Senioren- und Pflegestützpunkten" zusammengelegt; die Liste des Landes führt 52 Einrichtungen.',
  NW: 'In Nordrhein-Westfalen gibt es Pflegestützpunkte nicht überall: Ob ein Kreis oder eine Stadt einen einrichtet, hängt von der Kommune ab, und ihre Zahl ist nach Angaben der Ersatzkassen zurückgegangen. Welche Beratungsstelle für Sie zuständig ist, sagt Ihnen Ihre Pflegekasse.',
  RP: 'Rheinland-Pfalz hat 135 Pflegestützpunkte (Stand März 2026).',
  SL: 'Das Saarland hat acht Pflegestützpunkte.',
  SN: 'Sachsen hat statt Pflegestützpunkten eine vernetzte Pflegeberatung, organisiert in 13 Netzwerkregionen.',
  ST: 'Sachsen-Anhalt setzt statt auf Pflegestützpunkte auf eine vernetzte Pflegeberatung; das Landesportal nennt rund 150 Beratungsstellen.',
  SH: 'In Schleswig-Holstein hat jeder der 15 Kreise und kreisfreien Städte einen Pflegestützpunkt (Stand Februar 2026).',
  TH: 'Thüringen hat sieben Pflegestützpunkte, nicht in jedem Kreis; dazu kommen kommunale Beratungsstellen.',
};

export interface Beratung {
  text: string;
  url: string;
  abgerufen: string;
}

export function beratung(land: LandEigenanteil): Beratung {
  const p = roh(land.code).pflegestuetzpunkte as Roh['pflegestuetzpunkte'] & { url_alternativ?: string };
  const text = BERATUNG_TEXT[land.code];
  if (!text) throw new Error(`laender.ts: kein Beratungstext für ${land.code}`);
  // saarland.de antwortet automatisierten Abrufen mit 403; die vdek-Seite trägt dieselbe Angabe.
  const url = p.url_alternativ ?? p.url ?? p.quelle_anzahl_url;
  if (!url) throw new Error(`pflege-laenderstatistik.json: keine Quelle für die Beratung in ${land.code}`);
  return { text, url, abgerufen: p.abgerufen };
}
