/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Visual Preferences › Dates & Timestamps

Purpose
    Controls the visibility of publication, update, completion, and chapter
    dates independently.

Notes
    Each preference toggles a CSS class on the document root. Relative date
    formatting is handled elsewhere and is outside this feature's scope.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

// This submodule has no direct imports.



/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

export class DatesTimestamps {
  constructor() {
    this.classMap = {
      hidePublishedDate: 'ao3h-hide-pub-date',
      hideUpdatedDate:   'ao3h-hide-upd-date',
      hideCompletedDate: 'ao3h-hide-comp-date',
      hideChapterDates:  'ao3h-hide-chap-dates',
    };
  }


  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — DATE VISIBILITY
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
