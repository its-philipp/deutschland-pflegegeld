import type { IconName } from '../lib/icons';

export type CategorySlug = 'pflegegrad' | 'leistungen' | 'heim' | 'antrag';

export interface Category {
  slug: CategorySlug;
  label: string;
  /** Hex accent, measured on --color-paper (#F6F7F4). */
  accent: string;
  icon: IconName;
}

/**
 * The four content categories (root CLAUDE.md → Design conventions: "accent
 * colour per category, not one flat brand colour"). Deliberately NOT green
 * for leistungen/heim/antrag — on this site green means the Pflegegrad scale
 * and nothing else (STATE.md → Design-Richtung). No clinic blue either
 * (explicit owner decision). All four clear 4.5:1 on --color-paper.
 */
export const CATEGORIES: Category[] = [
  { slug: 'pflegegrad', label: 'Pflegegrad', accent: '#3A5A44', icon: 'pflegegrad' }, // Salbeigrün, 7.16:1
  { slug: 'leistungen', label: 'Leistungen', accent: '#7A5518', icon: 'leistungen' }, // Ocker, 6.22:1
  { slug: 'heim', label: 'Pflegeheim & Eigenanteil', accent: '#9A4A2B', icon: 'heim' }, // Ton, 5.76:1
  { slug: 'antrag', label: 'Antrag & Begutachtung', accent: '#6E3B5C', icon: 'antrag' }, // Aubergine, 7.99:1
];

/** Sprite icon per category (src/components/IconSprite.astro). */
export const CATEGORY_ICONS: Record<CategorySlug, IconName> = {
  pflegegrad: 'pflegegrad',
  leistungen: 'leistungen',
  heim: 'heim',
  antrag: 'antrag',
};

/** Fallback accent for anything not (yet) mapped to a category. */
export const DEFAULT_ACCENT = '#22282A'; // --color-ink

export function accentFor(categorySlug: string): string {
  return CATEGORIES.find((category) => category.slug === categorySlug)?.accent ?? DEFAULT_ACCENT;
}

/**
 * Icon for a specific topic slug, falling back to its category's icon.
 * Empty for now — no topic pages exist yet (that lands with the hubs, later
 * queue tasks); iconFor() already has the fallback chain ready for them.
 */
export const TOPIC_ICONS: Record<string, IconName> = {};

export function iconFor(topicSlug: string, categorySlug: string): IconName {
  return TOPIC_ICONS[topicSlug] ?? CATEGORY_ICONS[categorySlug as CategorySlug] ?? 'suche';
}
