/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Visual Preferences › Grid View

Purpose
    Displays work/bookmark listings as a wrapping grid of cards instead of
    AO3's default single-column list, purely through CSS (no DOM changes).

Notes
    Targets the standard listing containers used across works, bookmarks,
    and search results. Content and order inside each blurb are untouched —
    this only changes how the <li> blurbs wrap and size.

═══════════════════════════════════════════════════════════════════════════ */

const LISTING_SELECTOR = 'ol.work.index, ul.work.index, ol.bookmark.index, ul.bookmark.index';

export class GridView {
  apply (enabled) {
    if (enabled) {
      document.documentElement.classList.add('ao3h-grid-view');
      document.querySelectorAll(LISTING_SELECTOR).forEach(list => {
        list.classList.add('ao3h-grid-view-list');
      });
    } else {
      this.reset();
    }
  }

  reset () {
    document.documentElement.classList.remove('ao3h-grid-view');
    document.querySelectorAll('.ao3h-grid-view-list').forEach(list => {
      list.classList.remove('ao3h-grid-view-list');
    });
  }
}
