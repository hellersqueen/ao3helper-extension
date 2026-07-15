/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Stats Visibility Submodule
    Submodule ID: statsVisibility
    Display Name: Stats Visibility
    Parent Module: visualPreferences

    Manages visibility of engagement stats on AO3 work listings and pages.
    Each stat toggle applies a CSS class to document.documentElement.

    Keys managed:
        - hideWordCount     → ao3h-hide-wc
        - hideKudosCount    → ao3h-hide-kudos
        - hideCommentsCount → ao3h-hide-comments
        - hideBookmarksCount → ao3h-hide-bookmarks
        - hideHits          → ao3h-hide-hits

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
