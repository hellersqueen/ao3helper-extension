/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Stats On Chapters List Submodule
    Submodule ID: statsOnChaptersList
    Display Name: Stats On Chapters List
    Parent Module: visualPreferences

    Hides statistics (word counts, dates, comment counts) in the chapter
    listing of a work page.

    Key managed:
        - hideStatsOnChaptersList → ao3h-hide-chap-stats

═══════════════════════════════════════════════════════════════════════════ */

export class StatsOnChaptersList {
  constructor() {
    this.className = 'ao3h-hide-chap-stats';
  }

  apply(enabled) {
    document.documentElement.classList.toggle(this.className, !!enabled);
  }

  reset() {
    document.documentElement.classList.remove(this.className);
  }
}
