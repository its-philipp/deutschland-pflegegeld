// @ts-check
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { CATEGORIES } from './src/data/kategorien.ts';
import { THEMEN } from './src/data/themen.ts';
import checkPlaceholders from './scripts/check-placeholders.mjs';

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
    preact(),
    // Bricht den Build ab, wenn ein Deploy-Platzhalter es ins `dist/` geschafft
    // hat. Cloudflare Pages baut mit `npm run build`, ein roter Build ist also
    // ein Deploy, der nicht stattfindet.
    checkPlaceholders(),

    // Never ask Google to crawl what we tell it not to index: Impressum and
    // Datenschutz are noindex by construction, the empty hubs by derivation.
    sitemap({
      filter: (page) =>
        !page.includes('/impressum/') &&
        !page.includes('/datenschutz/') &&
        !noindexPaths.some((path) => page.includes(path)),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
