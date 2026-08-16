import { useMemo, useState } from 'preact/hooks';
import {
  berechne,
  einzelpunkteModul5,
  massnahmenProTag,
  TERMIN_FAKTOREN,
  type Einzelpunkte,
} from '../lib/pflegegrad';
import type { ModulBogen } from '../data/begutachtung';

/**
 * Die Pflegegrad-Selbsteinschätzung (queue task 2.6).
 *
 * **Ein Schritt pro Bildschirm** — die Designrichtung „Ruhiger Ratgeber" für
 * eine belastete Zielgruppe. Wer 48 Fragen auf einmal sieht, macht keine davon.
 *
 * **Das Ergebnis erscheint erst am Ende, und das ist eine Entscheidung gegen
 * die naheliegende Lösung.** Eine live mitlaufende Punktzahl würde aus einer
 * Selbsteinschätzung ein Spiel machen: man sieht, welche Antwort den Grad hebt,
 * und antwortet darauf statt auf die Frage. Bei einem Werkzeug, dessen Ergebnis
 * jemand gegenüber einer Pflegekasse vertritt, wäre das der falsche Anreiz.
 *
 * Die Rechnung selbst steht in `lib/pflegegrad.ts` und wird von
 * `npm run check:pflegegrad` gegen 177 Aussagen geprüft. Diese Komponente
 * rechnet nichts — sie sammelt Antworten.
 */

interface Props {
  bogen: ModulBogen[];
  diaetSkala: string[];
}

/** Antworten je Modul: Index der gewählten Stufe je Kriterium, -1 = offen. */
type Antworten = Record<number, number[]>;

interface Modul5Eingaben {
  haeufigProTag: number;
  haeufigProWoche: number;
  seltenProWoche: number;
  seltenProMonat: number;
  arztbesucheProMonat: number;
  langeBesucheProMonat: number;
  diaet: number;
}

const LEER5: Modul5Eingaben = {
  haeufigProTag: 0,
  haeufigProWoche: 0,
  seltenProWoche: 0,
  seltenProMonat: 0,
  arztbesucheProMonat: 0,
  langeBesucheProMonat: 0,
  diaet: 0,
};

export default function PflegegradWizard({ bogen, diaetSkala }: Props) {
  const [schritt, setSchritt] = useState(0);
  const [antworten, setAntworten] = useState<Antworten>(() =>
    Object.fromEntries(bogen.map((m) => [m.nummer, m.kriterien.map(() => -1)])),
  );
  const [modul5, setModul5] = useState<Modul5Eingaben>(LEER5);
  const [fertig, setFertig] = useState(false);

  // Modul 5 sitzt an seiner gesetzlichen Position zwischen Modul 4 und 6.
  const schritte = useMemo(() => {
    const s: ({ art: 'bogen'; modul: ModulBogen } | { art: 'modul5' })[] = [];
    for (const m of bogen) {
      if (m.nummer === 6) s.push({ art: 'modul5' });
      s.push({ art: 'bogen', modul: m });
    }
    return s;
  }, [bogen]);

  const einzelpunkte: Einzelpunkte = useMemo(() => {
    const summe = (nummer: number) => {
      const modul = bogen.find((m) => m.nummer === nummer);
      if (!modul) return 0;
      return (antworten[nummer] ?? []).reduce(
        // Unbeantwortet zählt als null — die Begutachtung kennt kein "vielleicht",
        // und ein übersprungenes Kriterium darf keine Punkte erfinden.
        (s, stufe, i) => s + (stufe >= 0 ? (modul.kriterien[i]?.punkte[stufe] ?? 0) : 0),
        0,
      );
    };
    const termine =
      modul5.arztbesucheProMonat * TERMIN_FAKTOREN['5.13'].monatlich +
      modul5.langeBesucheProMonat * TERMIN_FAKTOREN['5.15'].monatlich;
    return {
      1: summe(1),
      2: summe(2),
      3: summe(3),
      4: summe(4),
      5: einzelpunkteModul5({
        haeufigeMassnahmenProTag: massnahmenProTag(
          { proTag: modul5.haeufigProTag },
          { proWoche: modul5.haeufigProWoche },
        ),
        selteneMassnahmenProTag: massnahmenProTag(
          { proWoche: modul5.seltenProWoche },
          { proMonat: modul5.seltenProMonat },
        ),
        termineGewichtet: termine,
        diaet: modul5.diaet as 0 | 1 | 2 | 3,
      }),
      6: summe(6),
    };
  }, [antworten, modul5, bogen]);

  const ergebnis = useMemo(() => berechne(einzelpunkte), [einzelpunkte]);

  function waehle(modul: number, index: number, stufe: number) {
    setAntworten((prev) => {
      const kopie = [...(prev[modul] ?? [])];
      kopie[index] = stufe;
      return { ...prev, [modul]: kopie };
    });
  }

  const zahl = (n: number) =>
    n.toLocaleString('de-DE', { maximumFractionDigits: 1 });

  if (fertig) {
    return (
      <div class="rounded-lg border-2 border-sage bg-paper p-6 sm:p-8">
        <h2 class="font-display text-2xl font-semibold">Ihre Einschätzung</h2>

        {ergebnis.pflegegrad === 0 ? (
          <p class="mt-4 text-lg">
            Die Antworten ergeben <strong>{zahl(ergebnis.gesamtpunkte)} von 100 Punkten</strong>.
            Unter 12,5 Punkten sieht das Gesetz keine Pflegebedürftigkeit vor — ein Pflegegrad
            käme danach nicht in Betracht.
          </p>
        ) : (
          <p class="mt-4 text-lg">
            Die Antworten ergeben <strong>{zahl(ergebnis.gesamtpunkte)} von 100 Punkten</strong>.
            Das entspricht nach § 15 SGB XI{' '}
            <strong>Pflegegrad {ergebnis.pflegegrad}</strong>.
          </p>
        )}

        {/**
          * Die Spalte muss aufgehen.
          *
          * Der erste Entwurf listete die Module 2 und 3 einzeln mit je ihrem
          * gewichteten Wert und erklärte darunter, dass nur der höhere zählt.
          * Im Browser nachgemessen stand da 10 + 15 + 15 + 40 + 15 + 20 und als
          * Summe 100 — wer die Spalte addiert, kommt auf 115 und hält die Seite
          * für kaputt. Ein Hinweistext repariert das nicht: Menschen addieren
          * Zahlenspalten, bevor sie Fußnoten lesen.
          *
          * Also stehen 2 und 3 als **eine** Zeile mit dem Wert, der wirklich
          * zählt, und die beiden Einzelwerte darunter als Erklärung — sichtbar,
          * aber außerhalb der Spalte.
          */}
        <table class="mt-6 w-full text-[15px]">
          <caption class="sr-only">Gewichtete Punkte je Modul</caption>
          <tbody>
            <tr class="border-b border-rule">
              <th scope="row" class="py-2 pr-3 text-left font-normal">1. Mobilität</th>
              <td class="py-2 text-right tabular-nums">{zahl(ergebnis.gewichtet[1])}</td>
            </tr>
            <tr class="border-b border-rule">
              <th scope="row" class="py-2 pr-3 text-left font-normal">
                2. und 3. Denken, Sprechen und Verhalten
                <span class="block text-[13px] text-ink-mute">
                  Modul 2 ergibt {zahl(ergebnis.gewichtet[2])}, Modul 3 ergibt{' '}
                  {zahl(ergebnis.gewichtet[3])}. Gezählt wird nur der höhere der beiden, nicht
                  die Summe (§ 15 Abs. 3 Satz 2 SGB XI).
                </span>
              </th>
              <td class="py-2 text-right tabular-nums">{zahl(ergebnis.modul2und3)}</td>
            </tr>
            <tr class="border-b border-rule">
              <th scope="row" class="py-2 pr-3 text-left font-normal">4. Selbstversorgung</th>
              <td class="py-2 text-right tabular-nums">{zahl(ergebnis.gewichtet[4])}</td>
            </tr>
            <tr class="border-b border-rule">
              <th scope="row" class="py-2 pr-3 text-left font-normal">
                5. Krankheit und Therapie
              </th>
              <td class="py-2 text-right tabular-nums">{zahl(ergebnis.gewichtet[5])}</td>
            </tr>
            <tr class="border-b border-rule">
              <th scope="row" class="py-2 pr-3 text-left font-normal">
                6. Alltag und Kontakte
              </th>
              <td class="py-2 text-right tabular-nums">{zahl(ergebnis.gewichtet[6])}</td>
            </tr>
            <tr>
              <th scope="row" class="py-2 pr-3 text-left font-semibold">
                Gesamtpunkte
              </th>
              <td class="py-2 text-right font-semibold tabular-nums">
                {zahl(ergebnis.gesamtpunkte)}
              </td>
            </tr>
          </tbody>
        </table>

        <div class="mt-6 border-t border-rule pt-5">
          <h3 class="font-semibold">Was diese Zahl nicht ist</h3>
          <p class="mt-2 text-[15px]">
            Eine Selbsteinschätzung, keine Begutachtung. Über den Pflegegrad entscheidet die
            Pflegekasse nach einem Gutachten des Medizinischen Dienstes. Zwei Dinge kann diese
            Rechnung grundsätzlich nicht abbilden: die besonderen Bedarfskonstellationen nach
            § 15 Abs. 4 SGB XI, die auch unter 90 Punkten zu Pflegegrad 5 führen können, und
            den Vergleich mit altersentsprechend entwickelten Kindern.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setFertig(false);
            setSchritt(0);
          }}
          class="mt-6 rounded border-2 border-ink px-5 py-2.5 font-medium hover:bg-ink hover:text-paper"
        >
          Antworten ändern
        </button>
      </div>
    );
  }

  const aktuell = schritte[schritt]!;
  const letzter = schritt === schritte.length - 1;

  return (
    <div class="rounded-lg border border-rule bg-paper p-5 sm:p-7">
      <p class="text-[14px] text-ink-mute">
        Schritt {schritt + 1} von {schritte.length}
      </p>
      {/* Fortschritt als Balken, nicht als Punktzahl: der Fortschritt darf
          sichtbar sein, das Zwischenergebnis nicht. */}
      <div class="mt-2 h-1.5 w-full rounded-full bg-rule" aria-hidden="true">
        <div
          class="h-1.5 rounded-full bg-sage transition-all"
          style={`width: ${((schritt + 1) / schritte.length) * 100}%`}
        ></div>
      </div>

      {aktuell.art === 'bogen' ? (
        <fieldset class="mt-6">
          <legend class="font-display text-xl font-semibold">
            {aktuell.modul.nummer}. {aktuell.modul.kurz}
          </legend>
          <p class="mt-2 max-w-prose text-ink-mute">{aktuell.modul.einleitung}</p>

          <div class="mt-6 flex flex-col gap-6">
            {aktuell.modul.kriterien.map((k, i) => (
              <div key={k.ziffer}>
                <p class="font-medium">{k.frage}</p>
                <div class="mt-2 flex flex-wrap gap-2">
                  {aktuell.modul.antwortskala.map((label, stufe) => {
                    const gewaehlt = (antworten[aktuell.modul.nummer] ?? [])[i] === stufe;
                    return (
                      <label
                        key={label}
                        class={`cursor-pointer rounded border px-3 py-1.5 text-[15px] transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 ${
                          gewaehlt
                            ? 'border-sage bg-sage text-paper'
                            : 'border-rule hover:border-ink'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`k-${k.ziffer}`}
                          checked={gewaehlt}
                          onChange={() => waehle(aktuell.modul.nummer, i, stufe)}
                          class="sr-only"
                        />
                        {label}
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </fieldset>
      ) : (
        <fieldset class="mt-6">
          <legend class="font-display text-xl font-semibold">5. Krankheit und Therapie</legend>
          <p class="mt-2 max-w-prose text-ink-mute">
            Dieses Modul zählt keine Selbständigkeit, sondern Häufigkeiten. Lassen Sie stehen,
            was nicht vorkommt.
          </p>

          <div class="mt-6 flex flex-col gap-5">
            <Zahlfeld
              label="Maßnahmen pro Tag"
              hilfe="Medikamente, Injektionen, Absaugen, Einreibungen, Messungen, körpernahe Hilfsmittel — alles zusammengezählt."
              wert={modul5.haeufigProTag}
              setze={(v) => setModul5((p) => ({ ...p, haeufigProTag: v }))}
            />
            <Zahlfeld
              label="davon zusätzlich pro Woche"
              hilfe="Was nicht täglich, aber wöchentlich anfällt. Wird nach den Begutachtungs-Richtlinien durch sieben geteilt."
              wert={modul5.haeufigProWoche}
              setze={(v) => setModul5((p) => ({ ...p, haeufigProWoche: v }))}
            />
            <Zahlfeld
              label="Verbandswechsel, Stoma, Katheter, Therapien — pro Woche"
              wert={modul5.seltenProWoche}
              setze={(v) => setModul5((p) => ({ ...p, seltenProWoche: v }))}
            />
            <Zahlfeld
              label="dieselben Maßnahmen pro Monat"
              hilfe="Wird durch 30 geteilt."
              wert={modul5.seltenProMonat}
              setze={(v) => setModul5((p) => ({ ...p, seltenProMonat: v }))}
            />
            <Zahlfeld
              label="Arztbesuche pro Monat"
              wert={modul5.arztbesucheProMonat}
              setze={(v) => setModul5((p) => ({ ...p, arztbesucheProMonat: v }))}
            />
            <Zahlfeld
              label="Zeitlich ausgedehnte Behandlungen pro Monat"
              hilfe="Zum Beispiel Dialyse oder Bestrahlung — sie zählen doppelt."
              wert={modul5.langeBesucheProMonat}
              setze={(v) => setModul5((p) => ({ ...p, langeBesucheProMonat: v }))}
            />

            <div>
              <p class="font-medium">Einhaltung einer Diät oder anderer Vorschriften</p>
              <div class="mt-2 flex flex-wrap gap-2">
                {diaetSkala.map((label, stufe) => (
                  <label
                    key={label}
                    class={`cursor-pointer rounded border px-3 py-1.5 text-[15px] transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 ${
                      modul5.diaet === stufe
                        ? 'border-sage bg-sage text-paper'
                        : 'border-rule hover:border-ink'
                    }`}
                  >
                    <input
                      type="radio"
                      name="diaet"
                      checked={modul5.diaet === stufe}
                      onChange={() => setModul5((p) => ({ ...p, diaet: stufe }))}
                      class="sr-only"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </fieldset>
      )}

      <div class="mt-8 flex flex-wrap gap-3 border-t border-rule pt-5">
        <button
          type="button"
          disabled={schritt === 0}
          onClick={() => setSchritt((s) => Math.max(0, s - 1))}
          class="rounded border border-rule px-5 py-2.5 disabled:opacity-40"
        >
          Zurück
        </button>
        <button
          type="button"
          onClick={() => (letzter ? setFertig(true) : setSchritt((s) => s + 1))}
          class="rounded bg-sage px-5 py-2.5 font-medium text-paper"
        >
          {letzter ? 'Einschätzung anzeigen' : 'Weiter'}
        </button>
      </div>
    </div>
  );
}

function Zahlfeld({
  label,
  hilfe,
  wert,
  setze,
}: {
  label: string;
  hilfe?: string;
  wert: number;
  setze: (v: number) => void;
}) {
  const id = label.replace(/[^a-zA-Z]/g, '').slice(0, 20);
  return (
    <div>
      <label class="font-medium" for={id}>
        {label}
      </label>
      {hilfe && <p class="mt-1 text-[14px] text-ink-mute">{hilfe}</p>}
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min={0}
        max={99}
        value={wert}
        onInput={(e) => {
          const roh = Number((e.target as HTMLInputElement).value);
          // Geklammert auf der Eingabeseite: eine negative Häufigkeit gibt es
          // nicht, und sie würde Punkte abziehen statt keine zu geben.
          setze(Number.isFinite(roh) ? Math.min(Math.max(roh, 0), 99) : 0);
        }}
        class="mt-2 w-28 rounded border border-ink px-3 py-2 tabular-nums"
      />
    </div>
  );
}
