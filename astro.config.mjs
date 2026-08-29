// @ts-check
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { CATEGORIES } from './src/data/kategorien.ts';
import { THEMEN } from './src/data/themen.ts';
import checkPlaceholders from './scripts/check-placeholders.mjs';
import checkUrls from './scripts/check-urls.mjs';
import checkSeo from './scripts/check-seo.mjs';

// Everything the site renders but tells crawlers not to index, derived from the
// registry itself so the sitemap and the pages' own robots meta cannot drift
// apart. Today that is every category hub with no topics yet — thin content,
// and all four are empty until the data tasks unblock. Deriving it here rather
// than maintaining a second list is the fix deutschland-kosten needed after its hubs
// shipped noindex *and* sitemapped.
const noindexPaths = CATEGORIES.filter(
  (category) => !THEMEN.some((thema) => thema.kategorie === category.slug),
).map((category) => `/kategorie/${category.slug}/`);

// `site` feeds @astrojs/sitemap; canonical and OG tags are built from
// SITE_URL in src/lib/site.ts. **Keep the two in sync** — they are two
// definitions of one fact, and nothing checks them against each other.
export default defineConfig({
  site: 'https://deutschland-pflegegeld.de',
  output: 'static',
  integrations: [
    checkSeo({ domain: 'deutschland-pflegegeld.de', jahrImTitel: true }),
    preact(),
    // Bricht den Build ab, wenn ein Deploy-Platzhalter es ins `dist/` geschafft
    // hat. Cloudflare Pages baut mit `npm run build`, ein roter Build ist also
    // ein Deploy, der nicht stattfindet.
    checkPlaceholders(),
    // Bricht den Build ab, wenn canonical, og:url, ein interner Link oder ein
    // Sitemap-Eintrag auf eine Adresse zeigt, die Pages weiterleitet — die
    // Ursache der Search-Console-Meldung „Page with redirect" vom 2026-08-23.
    checkUrls(),

    // Never ask Google to crawl what we tell it not to index: Impressum and
    // Datenschutz are noindex by construction, the empty hubs by derivation.
/**
     * Impressum und Datenschutz sind seit 2026-08-28 indexierbar und in der
     * Sitemap. Die frühere Begründung — ein Rechtstext konkurriere um nichts und
     * verdünne nur die indexierte Fläche — war teuer: deutschland-vorlagen wurde
     * von AdSense mit „Low value content" abgelehnt, und der erste Befund der
     * Diagnose lautete, im Index stehe nirgends, wer die Seite betreibt. Googles
     * Mindestanforderungen nennen genau das. Der Fund war portfolioweit: alle
     * sechs Seiten trugen dieselbe Einstellung.
     */
    sitemap({
      filter: (page) =>
        !noindexPaths.some((path) => page.includes(path)),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
