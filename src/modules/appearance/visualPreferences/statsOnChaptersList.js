/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Visual Preferences › Chapter List Statistics

Purpose
    Shows or hides word counts, dates, and comment counts in a work's chapter
    listing.

Notes
    The hideStatsOnChaptersList preference toggles ao3h-hide-chap-stats on the
    document root. Presentation rules are supplied by the coordinator's CSS.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

// This submodule has no direct imports.



/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

export class StatsOnChaptersList {
  constructor() {
    this.className = 'ao3h-hide-chap-stats';
  }


  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — CHAPTER LIST VISIBILITY
  ═════════════════════════════════════════════════════════════════════════ */

  apply(enabled) {
    document.documentElement.classList.toggle(this.className, !!enabled);
  }


  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE LIFECYCLE
  ═════════════════════════════════════════════════════════════════════════ */

  reset() {
    document.documentElement.classList.remove(this.className);
  }
}
