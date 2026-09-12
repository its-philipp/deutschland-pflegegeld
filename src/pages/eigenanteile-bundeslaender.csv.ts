import type { APIRoute } from 'astro';
import { BUND, EIGENANTEIL_QUELLE, LAENDER, type LandEigenanteil } from '../data/eigenanteile';

/**
 * Die vdek-Ländertabelle als CSV zum Herunterladen.
 *
 * **Warum es diese Datei gibt.** Der vdek veröffentlicht die sechzehn
 * Länderwerte **nur als Grafik** — die PDF-Pressemitteilung führt sie nicht im
 * Text (`_meta.method` im Datensatz sagt das ausdrücklich). Wer sie zitieren
 * will, liest sie vom Bild ab. Dieses Projekt hat sie ohnehin übertragen und
 * rechnerisch gegen sich selbst geprüft; sie danach nur in Seiten zu gießen,
 * hieße, das mühsam Gewonnene wieder in Fließtext einzusperren.
 *
 * Der Anlass steht in `docs/link-prospects-deutschland-pflegegeld-2026-09-12.md`:
 * Eine Redaktion, der man schreibt „ich schicke Ihnen die Tabelle", bekommt
 * eine Bitte um Korrespondenz. Eine Datei, die ohne Rückfrage abrufbar und
 * zitierfähig ist, ist ein Gut. Das ist der Unterschied zwischen Outreach und
 * einem Grund, verlinkt zu werden.
 *
 * **Die Quellenangabe steht in der Datei, nicht daneben.** Eine CSV wandert
 * weiter, wird in eine Tabellenkalkulation geladen und taucht Monate später
 * ohne ihren Herkunftskontext wieder auf. Deshalb tragen die ersten Zeilen
 * Herausgeber, Titel, Stand, Abrufdatum und die Adresse der
 * Pressemitteilung — als Kommentarzeilen mit `#`, die jede Tabellenkalkulation
 * überliest und jeder Mensch findet.
 *
 * **Semikolon statt Komma** als Trennzeichen, und eine BOM davor: Beides
 * zusammen ist das, was Excel in einer deutschen Windows-Installation ohne
 * Importdialog richtig öffnet. Ein Komma-CSV landet dort in einer einzigen
 * Spalte, und eine Datei, die beim Doppelklick kaputt aussieht, wird nicht
 * zitiert.
 */

const SPALTEN = [
  'Bundesland',
  'Pflegebedingter Eigenanteil (EEE) ohne Zuschuss',
  'darunter Ausbildungskosten',
  'Unterkunft und Verpflegung',
  'Investitionskosten',
  'Eigenbeteiligung gesamt ohne Zuschuss',
  'Leistungszuschlag bis 12 Monate (15 %)',
  'Leistungszuschlag ab 12 Monate (30 %)',
  'Leistungszuschlag ab 24 Monate (50 %)',
  'Leistungszuschlag ab 36 Monate (75 %)',
  'Eigenbeteiligung 1. Jahr',
  'Eigenbeteiligung ab 12 Monaten',
  'Eigenbeteiligung ab 24 Monaten',
  'Eigenbeteiligung ab 36 Monaten',
] as const;

/**
 * Ein Feld für die CSV.
 *
 * Zahlen gehen als reine Ganzzahlen hinaus, **ohne Tausenderpunkt und ohne
 * Euro-Zeichen**: Eine Tabellenkalkulation soll damit rechnen können. Die
 * Einheit steht einmal im Kopf der Datei statt achtzehnmal je Zeile.
 */
function feld(wert: string | number): string {
  if (typeof wert === 'number') return String(wert);
  // Semikolon, Anführungszeichen und Zeilenumbrüche müssen maskiert werden,
  // sonst verschiebt ein einziger Ländername die ganze Zeile.
  return /[";\n]/.test(wert) ? `"${wert.replace(/"/g, '""')}"` : wert;
}

const zeile = (l: LandEigenanteil): string =>
  [
    l.name,
    l.eee_ohne_zuschuss,
    l.davon_ausbildungskosten,
    l.unterkunft_verpflegung,
    l.investitionskosten,
    l.eigenbeteiligung_ohne_zuschuss,
    l.zuschuss.bis_12_monate_15,
    l.zuschuss.ab_12_monate_30,
    l.zuschuss.ab_24_monate_50,
    l.zuschuss.ab_36_monate_75,
    l.eigenbeteiligung_mit_zuschuss.bis_12_monate,
    l.eigenbeteiligung_mit_zuschuss.ab_12_monate,
    l.eigenbeteiligung_mit_zuschuss.ab_24_monate,
    l.eigenbeteiligung_mit_zuschuss.ab_36_monate,
  ]
    .map(feld)
    .join(';');

export function csv(): string {
  const q = EIGENANTEIL_QUELLE;
  const kopf = [
    `# ${q.titel}`,
    `# Herausgeber: ${q.herausgeber}`,
    `# Stand: ${q.stand} (veroeffentlicht ${q.veroeffentlicht}, abgerufen ${q.abgerufen})`,
    `# Pressemitteilung: ${q.pressemitteilung}`,
    '# Alle Betraege in Euro je Monat.',
    '# Die Laendertabelle liegt beim vdek nur als Grafik vor; diese Fassung wurde',
    '# uebertragen und rechnerisch geprueft (Spaltensummen und Zuschussprozente',
    '# nach § 43c SGB XI). Massgeblich bleibt die Veroeffentlichung des vdek.',
    '# Aufbereitung: deutschland-pflegegeld.de',
  ];
  // Der Bundesdurchschnitt steht als letzte Zeile und nicht als erste: Sortiert
  // jemand die Datei nach Land, soll er die 16 echten Länder beisammen haben
  // und den Durchschnitt nicht mittendrin als siebzehntes „Land" finden.
  return [...kopf, SPALTEN.join(';'), ...LAENDER.map(zeile), zeile(BUND)].join('\n') + '\n';
}

export const GET: APIRoute = () =>
  new Response('﻿' + csv(), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'inline; filename="eigenanteile-pflegeheim-bundeslaender.csv"',
    },
  });
