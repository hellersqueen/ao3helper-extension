/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Visual Preferences › Statistics Visibility

Purpose
    Controls the visibility of word, kudos, comment, bookmark, and hit counts
    on AO3 work listings and pages.

Notes
    Each preference maps to an independent CSS class on the document root, so
    multiple statistics can be hidden or restored together.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

// This submodule has no direct imports.



/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

export class StatsVisibility {
  constructor() {
    this.classMap = {
      hideWordCount:      'ao3h-hide-wc',
      hideKudosCount:     'ao3h-hide-kudos',
      hideCommentsCount:  'ao3h-hide-comments',
      hideBookmarksCount: 'ao3h-hide-bookmarks',
      hideHits:           'ao3h-hide-hits',
    };
  }


  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — STATISTICS VISIBILITY
  ═════════════════════════════════════════════════════════════════════════ */

  apply(key, enabled) {
    const className = this.classMap[key];
    if (className) {
      document.documentElement.classList.toggle(className, !!enabled);
    }
  }

  applyAll(state) {
    Object.keys(this.classMap).forEach(key => {
      if (state[key] !== undefined) {
        this.apply(key, state[key]);
      }
    });
  }


  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE LIFECYCLE
  ═════════════════════════════════════════════════════════════════════════ */

  reset() {
    Object.values(this.classMap).forEach(className => {
      document.documentElement.classList.remove(className);
    });
  }
}
