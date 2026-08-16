/**
 * Rechnet die Ermittlung des Pflegegrades gegen den erhobenen Datensatz.
 * Lauf: `npm run check:pflegegrad`.
 *
 * Warum das hier steht und nicht nur ein paar Beispiele: **das Ergebnis dieses
 * Rechners ist eine Zahl, an der jemand eine Erwartung festmacht.** Ein
 * Gebührenrechner, der danebenliegt, nennt einen falschen Preis; dieser hier
 * sagt einer erschöpften Angehörigen, mit welchem Pflegegrad zu rechnen ist.
 * Deshalb prüft er nicht Beispiele, sondern **Invarianten** — Aussagen, die für
 * jede mögliche Eingabe gelten müssen:
 *
 * 1. Die Punktbereichsgrenzen in `lib/pflegegrad.ts` sind dieselben wie in
 *    `src/data/sources/pflegegrad-begutachtung.json`. Die Grenzen stehen damit
 *    zweimal im Repo — also wird die Übereinstimmung geprüft, nicht behauptet.
 * 2. Alle Module auf Maximum ergeben **exakt 100 Gesamtpunkte**. Das ist die
 *    schärfste Einzelaussage über das ganze Modell: sie fällt sofort, wenn ein
 *    Gewicht, eine Bereichsgrenze oder die Modul-2/3-Regel falsch ist.
 * 3. Modul 2 und 3 werden **nicht addiert** (§ 15 Abs. 3 Satz 2).
 * 4. Die Grenze gehört zum höheren Grad: genau 27,0 Punkte sind Pflegegrad 2.
 * 5. Jede Modulsumme von 0 bis zum Maximum fällt in genau einen Punktbereich,
 *    und die Bereiche steigen monoton — lückenlos und ohne Sprung zurück.
 * 6. Modul 5 erreicht aus seinen vier Blöcken höchstens 15 Punkte.
 */
import { readFileSync } from 'node:fs';
import {
  MODUL_MAXIMUM,
  berechne,
  einzelpunkteModul5,
  gewichtetePunkte,
  massnahmenProTag,
  pflegegradAus,
  pflegegradAusFuerSaeugling,
  punktbereich,
  punkteSelteneMassnahmen,
  punkteTermine,
  type Einzelpunkte,
  type ModulNummer,
} from '../src/lib/pflegegrad.ts';

const daten = JSON.parse(
  readFileSync(new URL('../src/data/sources/pflegegrad-begutachtung.json', import.meta.url), 'utf8'),
);

let geprueft = 0;
const fehler: string[] = [];

function pruefe(name: string, erwartet: unknown, ist: unknown) {
  geprueft++;
  if (JSON.stringify(ist) !== JSON.stringify(erwartet)) {
    fehler.push(`${name}: erwartet ${JSON.stringify(erwartet)}, berechnet ${JSON.stringify(ist)}`);
  }
}

const MODULE: ModulNummer[] = [1, 2, 3, 4, 5, 6];

// 1 — die Tabelle im Code gegen die Tabelle im Datensatz
for (const m of MODULE) {
  const quelle = daten.module[String(m)];
  pruefe(`Modul ${m}: Maximum aus Anlage 2`, quelle.punktbereiche[4][1], MODUL_MAXIMUM[m]);
  quelle.punktbereiche.forEach((bereich: [number, number], i: number) => {
    pruefe(`Modul ${m}, Punktbereich ${i}: Untergrenze ${bereich[0]}`, i, punktbereich(m, bereich[0]));
    pruefe(`Modul ${m}, Punktbereich ${i}: Obergrenze ${bereich[1]}`, i, punktbereich(m, bereich[1]));
    pruefe(
      `Modul ${m}, Punktbereich ${i}: gewichtete Punkte`,
      quelle.gewichtete_punkte[i],
      gewichtetePunkte(m, bereich[1]),
    );
    /**
     * **Und die Zahl danach muss draußen sein.**
     *
     * Ohne diese Zeile prüft der Test nur eine Hälfte der Grenze. Nachgewiesen
     * durch einen absichtlich eingebauten Fehler am 2026-08-16: Modul 4 von
     * `18` auf `19` verschoben — alle 115 Aussagen blieben grün, weil 18 auch
     * im zu weiten Bereich noch als Bereich 2 gilt. Eine Grenze hat zwei
     * Seiten, und eine Prüfung, die nur eine ansieht, findet jede Verschiebung
     * nach oben nicht.
     */
    if (i < quelle.punktbereiche.length - 1) {
      pruefe(
        `Modul ${m}, Punktbereich ${i}: ${bereich[1] + 1} gehört nicht mehr dazu`,
        i + 1,
        punktbereich(m, bereich[1] + 1),
      );
    }
  });
}

// 2 — alles auf Maximum sind exakt 100 Punkte
const maximum = Object.fromEntries(MODULE.map((m) => [m, MODUL_MAXIMUM[m]])) as Einzelpunkte;
pruefe('Alle Module auf Maximum: Gesamtpunkte', 100, berechne(maximum).gesamtpunkte);
pruefe('Alle Module auf Maximum: Pflegegrad', 5, berechne(maximum).pflegegrad);
pruefe('Alle Module auf null: Gesamtpunkte', 0, berechne(
  Object.fromEntries(MODULE.map((m) => [m, 0])) as Einzelpunkte,
).gesamtpunkte);
pruefe('Alle Module auf null: kein Pflegegrad', 0, berechne(
  Object.fromEntries(MODULE.map((m) => [m, 0])) as Einzelpunkte,
).pflegegrad);

// 3 — Modul 2 und 3 werden nicht addiert
{
  const nurModul2: Einzelpunkte = { 1: 0, 2: 33, 3: 0, 4: 0, 5: 0, 6: 0 };
  const nurModul3: Einzelpunkte = { 1: 0, 2: 0, 3: 65, 4: 0, 5: 0, 6: 0 };
  const beide: Einzelpunkte = { 1: 0, 2: 33, 3: 65, 4: 0, 5: 0, 6: 0 };
  pruefe('Nur Modul 2 auf Maximum', 15, berechne(nurModul2).gesamtpunkte);
  pruefe('Nur Modul 3 auf Maximum', 15, berechne(nurModul3).gesamtpunkte);
  pruefe(
    'Modul 2 UND 3 auf Maximum — der höhere Wert zählt, nicht die Summe',
    15,
    berechne(beide).gesamtpunkte,
  );
}

// 4 — die Grenze gehört zum höheren Grad
for (const { grad, ab } of [
  { grad: 1, ab: 12.5 },
  { grad: 2, ab: 27 },
  { grad: 3, ab: 47.5 },
  { grad: 4, ab: 70 },
  { grad: 5, ab: 90 },
] as const) {
  pruefe(`Genau ${ab} Punkte sind Pflegegrad ${grad}`, grad, pflegegradAus(ab));
  pruefe(`Knapp unter ${ab} Punkten noch nicht`, grad - 1, pflegegradAus(ab - 0.01));
}
pruefe('Unter 12,5 Punkten kein Pflegegrad', 0, pflegegradAus(12.49));
pruefe('100 Punkte sind Pflegegrad 5', 5, pflegegradAus(100));

// Die Schwellen im Code gegen die im Datensatz
for (const s of daten.pflegegrade.schwellen) {
  pruefe(`Datensatz: ab ${s.ab} Punkten Pflegegrad ${s.grad}`, s.grad, pflegegradAus(s.ab));
}

// 5 — lückenlos und monoton über jede erreichbare Modulsumme
for (const m of MODULE) {
  let vorher = -1;
  for (let summe = 0; summe <= MODUL_MAXIMUM[m]; summe++) {
    const bereich = punktbereich(m, summe);
    if (bereich < vorher) {
      geprueft++;
      fehler.push(`Modul ${m}: Punktbereich fällt bei Summe ${summe} von ${vorher} auf ${bereich}`);
    }
    vorher = bereich;
  }
  geprueft++;
  pruefe(`Modul ${m}: Maximum liegt im höchsten Punktbereich`, 4, punktbereich(m, MODUL_MAXIMUM[m]));
}

// 6 — Modul 5 aus seinen vier Blöcken
{
  const hoechstens = einzelpunkteModul5({
    haeufigeMassnahmenProTag: 99,
    selteneMassnahmenProTag: 99,
    termineGewichtet: 999,
    diaet: 3,
  });
  pruefe('Modul 5: Maximum aus den vier Blöcken', MODUL_MAXIMUM[5], hoechstens);
  pruefe(
    'Modul 5: Summe der Blockmaxima im Datensatz',
    MODUL_MAXIMUM[5],
    daten.module['5'].gruppen.reduce((s: number, g: { maximum: number }) => s + g.maximum, 0),
  );
  pruefe('Modul 5: nichts angegeben ergibt null', 0, einzelpunkteModul5({
    haeufigeMassnahmenProTag: 0,
    selteneMassnahmenProTag: 0,
    termineGewichtet: 0,
    diaet: 0,
  }));
  // Der Sprung von 3 auf 6 ist im Gesetz so vorgesehen — es gibt keine 4 und keine 5.
  pruefe('Termine: 59,9 gewichtet ergibt 3 Punkte', 3, punkteTermine(59.9));
  pruefe('Termine: 60 gewichtet ergibt 6 Punkte', 6, punkteTermine(60));
  for (const s of daten.module['5'].gruppen.find((g: { id: string }) => g.id === 'termine')
    .schwellen_summe) {
    pruefe(`Termine: ab ${s.ab} → ${s.einzelpunkte} Punkte`, s.einzelpunkte, punkteTermine(s.ab));
  }
}

// Umrechnung der Häufigkeiten (BRi zu Modul 5) — gegen den Wortlaut und gegen
// das Beispiel, das die Richtlinie selbst durchrechnet.
{
  const u = daten.module['5'].gruppen.find((g: { id: string }) => g.id === 'haeufig').umrechnung;
  pruefe('BRi: pro Woche geteilt durch 7', 7, u.pro_woche_geteilt_durch);
  pruefe('BRi: pro Monat geteilt durch 30', 30, u.pro_monat_geteilt_durch);
  // „Täglich dreimal Medikamentengabe und einmal Blutzuckermessen sind vier
  // Maßnahmen pro Tag" — das Beispiel steht so in der Richtlinie.
  pruefe(
    'BRi-Beispiel: 3× täglich + 1× täglich = 4 Maßnahmen pro Tag',
    4,
    massnahmenProTag({ proTag: 3 }, { proTag: 1 }),
  );
  pruefe('7× pro Woche sind 1 pro Tag', 1, massnahmenProTag({ proWoche: 7 }));
  pruefe('30× pro Monat sind 1 pro Tag', 1, massnahmenProTag({ proMonat: 30 }));
  pruefe('Nichts angegeben ist null pro Tag', 0, massnahmenProTag({}));
  // Die Schwelle „seltener als einmal wöchentlich" liegt genau bei 1/7 pro Tag.
  pruefe('Einmal wöchentlich ist noch 1 Punkt', 1, punkteSelteneMassnahmen(massnahmenProTag({ proWoche: 1 })));
  pruefe('Einmal monatlich ist 0 Punkte', 0, punkteSelteneMassnahmen(massnahmenProTag({ proMonat: 1 })));
}

// Kinder bis 18 Monate (§ 15 Abs. 7): dieselben Spannen, ein Grad höher
pruefe('Säugling: 12,5 Punkte sind Pflegegrad 2', 2, pflegegradAusFuerSaeugling(12.5));
pruefe('Säugling: 90 Punkte bleiben Pflegegrad 5', 5, pflegegradAusFuerSaeugling(90));
pruefe('Säugling: unter 12,5 Punkten kein Pflegegrad', 0, pflegegradAusFuerSaeugling(12.49));

console.log(`Pflegegrad: ${geprueft} Aussagen geprüft, ${fehler.length} Abweichungen`);
for (const f of fehler) console.error('  ! ' + f);
if (fehler.length) process.exit(1);
