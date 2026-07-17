/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Visual Preferences › Layout Density

Purpose
    Applies a site-wide spacing density (compact / comfortable / spacious) to
    work listings and other AO3H-styled areas via one root CSS class.

Notes
    Covers both "a compact mode for listings" and "a site-wide density
    setting" from the spec docs — a separate listings-only compact toggle
    would just be the 'compact' level of this same setting.

═══════════════════════════════════════════════════════════════════════════ */

const LEVELS = ['compact', 'comfortable', 'spacious'];

export class LayoutDensity {
  apply (level) {
    this.reset();
    if (LEVELS.includes(level) && level !== 'comfortable') {
      document.documentElement.classList.add(`ao3h-density-${level}`);
    }
  }

  reset () {
    LEVELS.forEach(l => document.documentElement.classList.remove(`ao3h-density-${l}`));
  }
}
