import roh from './sources/pflegegrad-begutachtung.json';

/**
 * Der Begutachtungsbogen als Daten für die Oberfläche.
 *
 * Liest den erhobenen Datensatz und reicht genau das weiter, was der Wizard
 * anzeigen muss — nicht mehr. Die Insel bekommt serialisierte Props, und ein
 * ganzer Datensatz mit Fundstellen, Gegenrechnungen und Warnungen hätte in
 * jeder ausgelieferten Seite gestanden.
 *
 * **Die Rechenregeln stehen nicht hier, sondern in `lib/pflegegrad.ts`.** Diese
 * Datei beschreibt, was gefragt wird; jene, wie gerechnet wird. Beides zu
 * mischen wäre der kurze Weg zu einer zweiten Fassung der Punktbereiche.
 */

interface RohKriterium {
  ziffer: string;
  kriterium: string;
  einzelpunkte: number[];
}

interface RohModul {
  name: string;
  antwortskala?: string[];
  kriterien?: RohKriterium[];
}

const module = roh.module as unknown as Record<string, RohModul>;

export interface Kriterium {
  ziffer: string;
  frage: string;
  /** Punktwert je Antwortstufe, in der Reihenfolge der Skala. */
  punkte: number[];
}

export interface ModulBogen {
  nummer: 1 | 2 | 3 | 4 | 6;
  name: string;
  /** Kurzname für Fortschritt und Überschrift. */
  kurz: string;
  /** Ein Satz, der erklärt, worum es in diesem Modul geht. */
  einleitung: string;
  antwortskala: string[];
  kriterien: Kriterium[];
}

/**
 * Die Einleitungen sind der einzige Text hier, der nicht aus der Norm kommt.
 *
 * Sie sind nötig, weil die Modulnamen des Gesetzes niemandem helfen, der zum
 * ersten Mal einen Antrag stellt: „Bewältigung von und selbständiger Umgang mit
 * krankheits- oder therapiebedingten Anforderungen und Belastungen" ist eine
 * korrekte Überschrift und keine Frage, die jemand beantworten kann.
 */
const EINLEITUNGEN: Record<number, { kurz: string; einleitung: string }> = {
  1: {
    kurz: 'Mobilität',
    einleitung:
      'Es geht nur um die Fortbewegung selbst — nicht darum, wofür sie gebraucht wird. Waschen und Anziehen kommen später.',
  },
  2: {
    kurz: 'Denken und Sprechen',
    einleitung:
      'Gefragt ist, was jemand versteht, erkennt und mitteilen kann — nicht, ob er es tut.',
  },
  3: {
    kurz: 'Verhalten',
    einleitung:
      'Hier zählt, wie oft etwas vorkommt, nicht wie selbständig jemand ist. Kommt nichts davon vor, ist das eine vollständige Antwort.',
  },
  4: {
    kurz: 'Selbstversorgung',
    einleitung:
      'Der Bereich mit dem größten Gewicht: 40 Prozent der Gesamtpunkte entstehen hier.',
  },
  6: {
    kurz: 'Alltag und Kontakte',
    einleitung:
      'Tagesablauf, Beschäftigung und Kontakte — auch das zählt in die Begutachtung.',
  },
};

export const BOGEN: ModulBogen[] = ([1, 2, 3, 4, 6] as const).map((nummer) => {
  const m = module[String(nummer)]!;
  return {
    nummer,
    name: m.name,
    kurz: EINLEITUNGEN[nummer]!.kurz,
    einleitung: EINLEITUNGEN[nummer]!.einleitung,
    // „Fähigkeit vorhanden/ unbeeinträchtigt" steht so in der Anlage, mit dem
    // Leerzeichen nach dem Schrägstrich. Für eine Schaltfläche geglättet, ohne
    // den Wortlaut zu ändern.
    antwortskala: (m.antwortskala ?? []).map((s) => s.replace('/ ', ' / ')),
    kriterien: (m.kriterien ?? []).map((k) => ({
      ziffer: k.ziffer,
      frage: k.kriterium,
      punkte: k.einzelpunkte,
    })),
  };
});

/** Modul 5, das als einziges nicht nach Stufen fragt. */
export const MODUL5 = {
  nummer: 5 as const,
  name: module['5']!.name,
  kurz: 'Krankheit und Therapie',
  einleitung:
    'Dieses Modul zählt keine Selbständigkeit, sondern Häufigkeiten: wie oft eine Maßnahme nötig ist. Geben Sie an, was regelmäßig vorkommt.',
  diaetSkala: [
    'entfällt oder selbständig',
    'überwiegend selbständig',
    'überwiegend unselbständig',
    'unselbständig',
  ],
};

export const STAND: string = (roh as unknown as { _meta: { retrieved: string } })._meta.retrieved;
