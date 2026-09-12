/**
 * Die Jahreszahl im Titel — abgeleitet aus dem Stand der Daten, nicht aus der Uhr.
 *
 * **Warum nicht `new Date().getFullYear()`.** Das war der naheliegende Griff,
 * und er ist falsch. Ein Titel, der am 1. Januar von selbst auf „2027"
 * springt, behauptet Aktualität, die die Zahlen darunter nicht haben: Die
 * SGB-XI-Beträge stehen in einer Fassung, die zu einem bestimmten Datum gegen
 * das Gesetz gelesen wurde. Solange niemand sie erneut geprüft hat, ist
 * „Pflegegeld 2027" über einem Stand von 2026 keine veraltete Angabe mehr,
 * sondern eine unwahre. **Ein hartkodiertes altes Jahr ist ehrlich alt; ein
 * mitlaufendes ist aktiv falsch.**
 *
 * Aus der Bauzeit abzuleiten hätte ohnehin weniger gebracht als es scheint:
 * Ein statischer Build ändert sich nur, wenn jemand ihn anstößt. Ohne Deploy im
 * Januar stünde dort weiterhin die alte Zahl — nur ohne die Kopplung, die
 * erklärt, warum.
 *
 * **Was diese Ableitung stattdessen leistet:** Titel und Datenstand können
 * nicht mehr auseinanderlaufen. Wer den Datensatz auffrischt, frischt den Titel
 * mit auf, ohne daran zu denken; wer ihn nicht auffrischt, sieht die Jahreszahl
 * stehen bleiben. Genau das meldet `check-seo` ab dem 1. Januar als „Jahr 2026
 * im Titel, laufendes Jahr ist 2027" — und diese Meldung ist dann kein
 * Fehlalarm, sondern die jährliche Erinnerung, die Quelle neu zu lesen. Der
 * Prüfer wird damit vom Ärgernis zum Auslöser.
 *
 * Dieselbe Überlegung hat gemeindegebuehren schon 2026-08-29 angestellt und die
 * Jahreszahl dort ganz aus dem Titel genommen, weil sie der Stichtag eines
 * einzelnen Hebesatzes war. Hier bleibt sie, weil sie etwas anderes bedeutet —
 * „diese Beträge wurden in diesem Jahr gegen das Gesetz geprüft" — aber sie
 * darf sich nicht selbst weiterzählen.
 */

/**
 * Die vierstellige Jahreszahl aus einer Standangabe.
 *
 * Verträgt beide Schreibweisen, die im Bestand vorkommen: ein ISO-Datum
 * (`2026-08-03`) und die Klartextform des vdek (`1. Juli 2026`). Gesucht wird
 * eine Zahl zwischen 1900 und 2199 — eng genug, dass eine Tagesangabe oder eine
 * Paragrafennummer nicht versehentlich als Jahr durchgeht.
 */
export function jahrAus(stand: string): number {
  const treffer = stand.match(/\b(19\d\d|20\d\d|21\d\d)\b/);
  if (!treffer) {
    // Kein stiller Rückfall auf das laufende Jahr: Das wäre genau die
    // mitlaufende Jahreszahl, gegen die diese Datei geschrieben ist.
    throw new Error(
      `Aus der Standangabe „${stand}" lässt sich keine Jahreszahl lesen. ` +
        `Ein Titel darf seine Jahreszahl nicht raten.`,
    );
  }
  return Number(treffer[1]);
}
