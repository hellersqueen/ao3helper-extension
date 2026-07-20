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

const AGE_BUCKETS = ['today', 'week', 'month', 'older'];



/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

export class StatsDisplayFormat {
  /**
   * @param {{ dateAgeBucket?: (dateLike: string|Date, now?: number) => (string|null) }} [opts]
   */
  constructor({ dateAgeBucket } = {}) {
    this._observer  = null;
    this._originalDateTitles = new WeakMap();
    this._activeFlags = { relativeDates: false, dateAgeColoring: false };
    this._dateAgeBucket = dateAgeBucket || (() => null);
  }


  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — STATISTICS DISPLAY
  ═════════════════════════════════════════════════════════════════════════ */

  // Called by the coordinator with the full visualPreferences state object.
  apply(state) {
    this.reset();
    this._activeFlags = {
      relativeDates:   !!state.relativeDates,
      dateAgeColoring: !!state.dateAgeColoring,
    };
    if (state.statsAsIcons) {
      this._applyStatsAsIcons(state.statsIconsMode || 'icons');
    }
    if (state.relativeDates) {
      this._applyRelativeDates();
    }
    if (state.dateAgeColoring) {
      this._applyDateAgeColoring();
    }
    if (state.relativeDates || state.dateAgeColoring) {
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

  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — DATE AGE COLORING
  ═════════════════════════════════════════════════════════════════════════ */

  // Targets both work-page stats and listing blurb dates.
  _dateElements () {
    return document.querySelectorAll(
      'dl.stats dd.published, dl.stats dd.status, li.blurb p.datetime'
    );
  }

  _applyDateAgeColoring () {
    this._dateElements().forEach(el => {
      // Read the original date text — untouched even if relativeDates also
      // ran first and replaced el.textContent with "3 days ago".
      const raw = el.dataset.ao3hOriginalDate || el.textContent.trim();
      const bucket = this._dateAgeBucket(raw);
      if (!bucket) return;
      AGE_BUCKETS.forEach(b => el.classList.remove(`ao3h-date-age-${b}`));
      el.classList.add(`ao3h-date-age-${bucket}`);
      el.dataset.ao3hDateAged = '1';
    });
  }

  _observeForDynamicContent() {
    if (this._observer) return;
    const main = document.getElementById('main');
    if (!main) return;
    this._observer = observe(main, { childList: true, subtree: true }, () => {
      if (this._activeFlags.relativeDates) this._applyRelativeDates();
      if (this._activeFlags.dateAgeColoring) this._applyDateAgeColoring();
    });
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
    document.querySelectorAll('[data-ao3h-date-aged]').forEach(el => {
      AGE_BUCKETS.forEach(b => el.classList.remove(`ao3h-date-age-${b}`));
      delete el.dataset.ao3hDateAged;
    });

    if (this._observer) {
      this._observer.disconnect();
      this._observer = null;
    }
  }
}
