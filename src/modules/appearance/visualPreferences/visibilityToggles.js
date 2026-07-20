/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Visual Preferences › Visibility Toggles

Purpose
    Shows or hides individual work statistics (words, kudos, comments,
    bookmarks, hits), dates (published, updated, completed, per-chapter),
    the site header, and chapter-list statistics.

Notes
    Each preference maps to an independent CSS class on the document root, so
    any combination can be hidden or restored together with no shared state
    between preferences.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

// This submodule has no direct imports.



/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

export class VisibilityToggles {
  constructor() {
    this.classMap = {
      hideWordCount:           'ao3h-hide-wc',
      hideKudosCount:          'ao3h-hide-kudos',
      hideCommentsCount:       'ao3h-hide-comments',
      hideBookmarksCount:      'ao3h-hide-bookmarks',
      hideHits:                'ao3h-hide-hits',
      hidePublishedDate:       'ao3h-hide-pub-date',
      hideUpdatedDate:         'ao3h-hide-upd-date',
      hideCompletedDate:       'ao3h-hide-comp-date',
      hideChapterDates:        'ao3h-hide-chap-dates',
      minimalHeader:           'ao3h-minimal-header',
      hideStatsOnChaptersList: 'ao3h-hide-chap-stats',
    };
  }


  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — VISIBILITY TOGGLES
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
