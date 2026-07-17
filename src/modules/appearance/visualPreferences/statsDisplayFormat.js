/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Visual Preferences › Stats Display Format

Purpose
    Formats statistic labels as icons or icons with text and converts supported
    publication/status dates to relative values.

Notes
    Original date text and title attributes are retained for restoration.
    Relative dates are also applied to dynamically inserted content under
    #main through a managed observer.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { observe } from '../../../../lib/utils/index.js';



/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

export class StatsDisplayFormat {
  constructor() {
    this._observer  = null;
    this._originalDateTitles = new WeakMap();
  }


  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — STATISTICS DISPLAY
  ═════════════════════════════════════════════════════════════════════════ */

  // Called by the coordinator with the full visualPreferences state object.
  apply(state) {
    this.reset();
    if (state.statsAsIcons) {
      this._applyStatsAsIcons(state.statsIconsMode || 'icons');
    }
    if (state.relativeDates) {
      this._applyRelativeDates();
      this._observeForDynamicContent();
    }
  }

  _applyStatsAsIcons(mode) {
    document.documentElement.classList.add('ao3h-stats-as-icons');
    if (mode === 'icons-text') {
      document.documentElement.classList.add('ao3h-stats-icons-text');
    }
    // Add title attributes so screen readers and tooltips keep the label text.
    document.querySelectorAll('dl.stats dt').forEach(dt => {
      if (!dt.title) {
        dt.title = dt.textContent.trim().replace(/:$/, '');
        dt.dataset.ao3hTitleAdded = '1';
      }
    });
  }


  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — RELATIVE DATES
  ═════════════════════════════════════════════════════════════════════════ */

  _applyRelativeDates() {
    document.querySelectorAll('dl.stats dd.published, dl.stats dd.status').forEach(dd => {
      this._convertToRelative(dd);
    });
  }

  _convertToRelative(el) {
    if (el.dataset.ao3hOriginalDate) return; // already processed
    const raw = el.textContent.trim();
    if (!raw) return;
    const date = new Date(raw);
    if (isNaN(date.getTime())) return;
    this._originalDateTitles.set(el, {
      present: el.hasAttribute('title'),
      value: el.getAttribute('title'),
    });
    el.dataset.ao3hOriginalDate = raw;
    el.title = raw;
    el.textContent = this._getRelativeTime(date);
  }

  _getRelativeTime(date) {
    const diffMs     = Date.now() - date.getTime();
    const diffDays   = Math.floor(diffMs / 86400000);
    const diffMonths = Math.floor(diffDays / 30.44);
    const diffYears  = Math.floor(diffDays / 365.25);

    if (diffYears  >= 1) return `${diffYears} year${diffYears !== 1 ? 's' : ''} ago`;
    if (diffMonths >= 1) return `${diffMonths} month${diffMonths !== 1 ? 's' : ''} ago`;
    if (diffDays   >= 1) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    return 'today';
  }

  _observeForDynamicContent() {
    if (this._observer) return;
    const main = document.getElementById('main');
    if (!main) return;
    this._observer = observe(main, { childList: true, subtree: true }, () => this._applyRelativeDates());
  }


  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE LIFECYCLE
  ═════════════════════════════════════════════════════════════════════════ */

  reset() {
    document.documentElement.classList.remove(
      'ao3h-stats-as-icons',
      'ao3h-stats-icons-text'
    );
    document.querySelectorAll('[data-ao3h-original-date]').forEach(el => {
      el.textContent = el.dataset.ao3hOriginalDate;
      delete el.dataset.ao3hOriginalDate;
      const originalTitle = this._originalDateTitles.get(el);
      if (originalTitle?.present) el.setAttribute('title', originalTitle.value);
      else el.removeAttribute('title');
      this._originalDateTitles.delete(el);
    });
    document.querySelectorAll('[data-ao3h-title-added]').forEach(el => {
      el.removeAttribute('title');
      delete el.dataset.ao3hTitleAdded;
    });

    if (this._observer) {
      this._observer.disconnect();
      this._observer = null;
    }
  }
}
