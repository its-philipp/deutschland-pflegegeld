import { useMemo, useState } from 'preact/hooks';
import {
  ENTLASTUNGSBETRAG,
  GEMEINSAMER_JAHRESBETRAG,
  PFLEGEGELD,
  PFLEGESACHLEISTUNG,
  SGB_XI_STAND,
  TEILSTATIONAERE_PFLEGE,
  kombinationsleistung,
  type Pflegegrad,
} from '../data/leistungen';

/**
 * Der Leistungsrechner für die häusliche Pflege (queue task 2.4).
 *
 * The one question this answers is the one the Pflegekasse's own letters do not:
 * **what happens if I use only part of the Sachleistung?** § 38 SGB XI reduces
 * the Pflegegeld by the percentage of the Sachleistung actually drawn, and that
 * sentence is where most people give up. A slider makes it visible in one move.
 *
 * Every amount comes from `data/leistungen.ts` and therefore from SGB XI. This
 * component never contains a figure of its own — that is the rule the constants
 * file exists to enforce, because these amounts change by Verordnung and a
 * number copied into a component is one nobody will find when it does.
 *
 * Tone follows the site's design direction (STATE.md → Ruhiger Ratgeber): one
 * decision at a time, no urgency, no colour that means anything except the
 * Pflegegrad scale.
 */

const GRADE: Pflegegrad[] = [2, 3, 4, 5];

function euro(betrag: number): string {
  return betrag.toLocaleString('de-DE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: betrag % 1 === 0 ? 0 : 2,
  });
}

function isoToGerman(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}`;
}

interface Props {
  /** Fixes the Grad on a Pflegegrad page; omitted, the reader picks. */
  grad?: Pflegegrad;
}

export default function LeistungsRechner({ grad: fixerGrad }: Props) {
  const [grad, setGrad] = useState<Pflegegrad>(fixerGrad ?? 2);
  // Percentage of the Sachleistung budget actually used, 0…100.
  const [anteil, setAnteil] = useState(0);

  const sachleistung = PFLEGESACHLEISTUNG.betrag[grad] ?? 0;
  const pflegegeldVoll = PFLEGEGELD.betrag[grad] ?? 0;

  const { genutzteSachleistung, restPflegegeld, gesamt } = useMemo(() => {
    const genutzt = (sachleistung * anteil) / 100;
    const rest = kombinationsleistung(grad, anteil / 100) ?? 0;
    return { genutzteSachleistung: genutzt, restPflegegeld: rest, gesamt: genutzt + rest };
  }, [grad, anteil, sachleistung]);

  return (
    <div class="sheet p-5 sm:p-7">
      {!fixerGrad && (
        <fieldset>
          <legend class="font-display text-lg text-ink">Welcher Pflegegrad?</legend>
          <p class="mt-1 text-ink-soft">
            Ab Pflegegrad 2 gibt es Pflegegeld und Sachleistungen. Pflegegrad 1 hat nur den
            Entlastungsbetrag.
          </p>
          <div class="mt-4 flex flex-wrap gap-2">
            {GRADE.map((g) => (
              <label
                key={g}
                class={`cursor-pointer rounded-full border px-5 py-2 font-display transition-colors ${
                  g === grad ? 'border-ink bg-ink text-paper' : 'border-rule hover:border-ink-soft'
                }`}
              >
                <input
                  type="radio"
                  name="grad"
                  class="sr-only"
                  checked={g === grad}
                  onChange={() => setGrad(g)}
                />
                Grad {g}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <div class={fixerGrad ? '' : 'mt-8 border-t border-rule pt-8'}>
        <label class="font-display text-lg text-ink" for="anteil">
          Wie viel vom Pflegedienst nutzen Sie?
        </label>
        <p class="mt-1 text-ink-soft">
          Nehmen Sie die Sachleistung nur teilweise in Anspruch, bekommen Sie den Rest als
          anteiliges Pflegegeld – vermindert um genau den Prozentsatz, den Sie verbraucht haben
          (§&nbsp;38 SGB&nbsp;XI).
        </p>

        <div class="mt-4 flex items-center gap-4">
          <input
            id="anteil"
            type="range"
            min={0}
            max={100}
            step={5}
            value={anteil}
            onInput={(e) => setAnteil(Number((e.target as HTMLInputElement).value))}
            class="min-w-0 flex-1 accent-[var(--color-pflegegrad-4)]"
          />
          <output class="w-16 text-right font-display text-xl tabular-nums text-ink">
            {anteil}%
          </output>
        </div>

        <div class="mt-3 flex justify-between text-ink-soft">
          <span>nur Pflegegeld</span>
          <span>nur Pflegedienst</span>
        </div>
      </div>

      <dl class="mt-8 border-t border-rule pt-6" aria-live="polite">
        <div class="flex items-baseline justify-between gap-4 py-2">
          <dt>Pflegedienst (Sachleistung)</dt>
          <dd class="font-display text-xl tabular-nums">{euro(genutzteSachleistung)}</dd>
        </div>
        <div class="flex items-baseline justify-between gap-4 border-t border-rule py-2">
          <dt>Pflegegeld an Sie</dt>
          <dd class="font-display text-xl tabular-nums">{euro(restPflegegeld)}</dd>
        </div>
        <div class="flex items-baseline justify-between gap-4 border-t-2 border-ink py-3">
          <dt class="font-semibold">Zusammen im Monat</dt>
          <dd class="font-display text-2xl tabular-nums">{euro(gesamt)}</dd>
        </div>
        <div class="flex items-baseline justify-between gap-4 border-t border-rule py-2 text-ink-soft">
          <dt>
            Dazu der Entlastungsbetrag
            <span class="block text-[15px]">
              Zusätzlich, unabhängig von der Wahl oben. Nicht für Barauszahlung, sondern für
              anerkannte Angebote.
            </span>
          </dt>
          <dd class="font-display text-xl tabular-nums">{euro(ENTLASTUNGSBETRAG.betrag)}</dd>
        </div>
      </dl>

      <div class="mt-7 border-t border-rule pt-5 text-ink-soft">
        <p>
          Zum Vergleich: die volle Sachleistung wären {euro(sachleistung)}, das volle Pflegegeld{' '}
          {euro(pflegegeldVoll)}. Tages- oder Nachtpflege gibt es mit{' '}
          {euro(TEILSTATIONAERE_PFLEGE.betrag[grad] ?? 0)} im Monat obendrauf, und für
          Verhinderungs- und Kurzzeitpflege stehen zusammen{' '}
          {euro(GEMEINSAMER_JAHRESBETRAG.betrag)} im Jahr bereit.
        </p>
        <p class="mt-3">
          An die Aufteilung sind Sie sechs Monate gebunden (§&nbsp;38 Satz&nbsp;3 SGB&nbsp;XI).
          Stand der Beträge: {isoToGerman(SGB_XI_STAND)}.
        </p>
      </div>
    </div>
  );
}
