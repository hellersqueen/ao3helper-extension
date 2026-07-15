/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Dates & Timestamps Submodule
    Submodule ID: datesTimestamps
    Display Name: Dates & Timestamps
    Parent Module: visualPreferences

    Manages visibility of date information on AO3 (publication, update,
    completion, and chapter dates), each independently toggleable.

    Keys managed:
        - hidePublishedDate  → ao3h-hide-pub-date
        - hideUpdatedDate    → ao3h-hide-upd-date
        - hideCompletedDate  → ao3h-hide-comp-date
        - hideChapterDates   → ao3h-hide-chap-dates

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

  reset() {
    Object.values(this.classMap).forEach(className => {
      document.documentElement.classList.remove(className);
    });
  }
}
