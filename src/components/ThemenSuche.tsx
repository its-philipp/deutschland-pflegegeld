import { useState } from 'preact/hooks';
import type { IconName } from '../lib/icons';

/**
 * Plain data for one topic — reduced by the caller so the island's serialized
 * props stay small (never pass a whole config object, root task brief).
 */
export interface ThemenSucheItem {
  slug: string;
  /**
   * Fertiger Pfad aus `pfadVon()` — die Insel baut ihn **nicht** selbst.
   *
   * Vorher baute die Insel den Pfad selbst aus dem Slug zusammen, und damit
   * zeigten alle 21 Links der Startseite ins Leere: die Pflegegrad-Seiten liegen unter
   * `/pflegegrad-2/`, die Heimseiten unter `/pflegeheim-kosten-<land>/`, und
   * `/thema/…` gibt es überhaupt nicht. Die Registry sagt in ihrem eigenen
   * Kommentar, `pfadVon()` sei „the one place that rule is written down" — sie
   * war es nur nicht, weil diese Insel eine zweite Fassung mitführte.
   *
   * Gefunden erst beim Nachmessen am gebauten `dist/`, nicht beim Lesen: im
   * Quelltext sieht beides plausibel aus.
   */
  pfad: string;
  titel: string;
  kategorie: string;
  kategorieLabel: string;
  accent: string;
  icon: IconName;
}

interface Props {
  items: ThemenSucheItem[];
}

/** "Pflegegeld" and "pflegegeld" (and, should it come up, "Pflegegrad") must find the same entry. */
function fold(s: string): string {
  return s
    .toLowerCase()
    .replaceAll('ä', 'ae')
    .replaceAll('ö', 'oe')
    .replaceAll('ü', 'ue')
    .replaceAll('ß', 'ss')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Filters the topic list client-side. Astro server-renders the complete list
 * as this island's initial markup (see index.astro) — the query starts
 * empty, so the full list is real HTML before hydration and search still
 * works with JavaScript disabled; the island only narrows what is already
 * there (was-kostet's TopicSearch.tsx, same mechanics).
 */
export default function ThemenSuche({ items }: Props) {
  const [query, setQuery] = useState('');

  if (items.length === 0) {
    return (
      <p class="max-w-prose text-ink-mute">
        Wir bauen die Themenseiten gerade noch auf. Sobald die ersten Rechner und Übersichten
        stehen, finden Sie sie hier.
      </p>
    );
  }

  const term = fold(query.trim());
  const matches = items.filter(
    (item) => term.length === 0 || fold(`${item.titel} ${item.kategorieLabel}`).includes(term),
  );

  const showEmpty = matches.length === 0;
  const list = showEmpty ? items : matches;

  return (
    <div>
      <div class="flex max-w-lg items-stretch overflow-hidden rounded-[4px] border-[1.5px] border-ink">
        <label class="sr-only" for="themen-suche">
          Wonach suchen Sie?
        </label>
        <input
          id="themen-suche"
          type="search"
          value={query}
          onInput={(e) => setQuery((e.currentTarget as HTMLInputElement).value)}
          placeholder="z. B. Pflegegeld"
          class="w-full px-3 py-2.5 text-ink outline-none placeholder:text-ink-mute"
        />
        <span class="flex items-center bg-sage px-4 text-paper" aria-hidden="true">
          <svg class="h-[18px] w-[18px]">
            <use href="#i-suche"></use>
          </svg>
        </span>
      </div>

      <p class="mt-3 text-[14px] text-ink-mute" role="status" aria-live="polite">
        {term.length === 0
          ? `${items.length} Themen`
          : matches.length === 1
            ? '1 Thema gefunden'
            : `${matches.length} Themen gefunden`}
      </p>

      {showEmpty && (
        <p class="mt-2 text-ink">
          Dazu haben wir noch nichts gefunden. Hier ist die vollständige Liste unserer Themen:
        </p>
      )}

      <ul class="mt-4 flex flex-col divide-y divide-rule border-y border-rule">
        {list.map((item) => (
          <li key={item.slug}>
            <a
              href={item.pfad}
              style={`--accent: ${item.accent}`}
              class="flex items-center gap-3 px-1 py-3 transition-colors hover:bg-(--accent)/5"
            >
              <svg class="h-5 w-5 shrink-0 text-(--accent)" aria-hidden="true">
                <use href={`#i-${item.icon}`}></use>
              </svg>
              <span class="min-w-0 flex-1">
                <span class="block font-medium text-ink">{item.titel}</span>
                <span class="mt-0.5 block text-[14px] text-(--accent)">{item.kategorieLabel}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
