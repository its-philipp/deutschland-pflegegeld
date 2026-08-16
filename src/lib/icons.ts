/** Every symbol in src/components/IconSprite.astro, by id without the `i-` prefix. */
export type IconName =
  // Category marks (see data/kategorien.ts for the accent that goes with each)
  | 'pflegegrad'
  | 'leistungen'
  | 'heim'
  | 'antrag'
  // interface
  | 'suche'
  | 'check'
  | 'schliessen'
  | 'pfeil-rechts'
  | 'info';
