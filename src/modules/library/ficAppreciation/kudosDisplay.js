/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Fic Appreciation › Kudos Display

Adds the enhanced presentation layer for recorded kudos, including work-page
confirmation, formatted listing tooltips, custom icons, and loading feedback.

Notes

- Kudos Tracker remains responsible for detection and persistence.
- Long, short, and relative date formats are supported.
- Work-page confirmation appears only after a kudos record exists.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { formatDate } from '../../../../lib/utils/format-date.js';


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

export class KudosDisplay {
  /** @param {{ NS, storeGet, cfg }} opts */
  constructor ({ NS, storeGet, cfg }) {
    this.NS       = NS;
    this.storeGet = storeGet;
    this.cfg      = cfg;
    this.SK       = 'ficAppreciation:kudosed';
    this._loading = false;
  }

  _load () { return this.storeGet(this.SK, {}); }

  /* ═══════════════════════════════════════════════════════════════════════
     FEATURE — WORK-PAGE KUDOS CONFIRMATION
  ═══════════════════════════════════════════════════════════════════════ */

  /**
   * Inject a "🧡 Kudos given on <date>" badge after the kudos section on a work page.
   * Only shown if kudos have been recorded (i.e. KudosTracker already detected them).
   */
  injectKudosBadgeOnWorkPage (workId) {
    const { NS } = this;
    if (document.getElementById(`${NS}-fa-kudos-badge`)) return;
    const entry = this._load()[workId];
    if (!entry) return; // not recorded yet — KudosTracker will detect & record first

    const kudosEl = document.querySelector('#kudos, .kudos');
    if (!kudosEl) return;

    const icon  = this.cfg('kudosIcon') || '🧡';
    const badge = document.createElement('p');
    badge.id        = `${NS}-fa-kudos-badge`;
    badge.className = `${NS}-fa-kudos-badge`;
    badge.innerHTML =
      `<span class="${NS}-fa-badge-icon">${icon}</span> ` +
      `Kudos given${entry.date ? ` on ${this._formatDate(entry.date)}` : ''}`;
    kudosEl.after(badge);
  }

  /**
   * Show / hide a "Checking kudos status…" indicator near the kudos section.
   * Call with `true` before an async detection, `false` when done.
   */
  setLoadingState (on) {
    const { NS } = this;
    const area = document.querySelector('#kudos, .kudos');
    if (!area) return;
    if (on) {
      if (!area.querySelector(`.${NS}-fa-kudos-loading`)) {
        const el       = document.createElement('span');
        el.className   = `${NS}-fa-kudos-loading`;
        el.textContent = 'Checking kudos status…';
        area.appendChild(el);
      }
      this._loading = true;
    } else {
      area.querySelector(`.${NS}-fa-kudos-loading`)?.remove();
      this._loading = false;
    }
  }

  /* ═══════════════════════════════════════════════════════════════════════
     FEATURE — LISTING TOOLTIP AND CUSTOM ICON
  ═══════════════════════════════════════════════════════════════════════ */

  /**
   * Enrich a kudos badge element (created by KudosTracker) with a rich tooltip
   * showing the formatted kudos date.
   */
  applyTooltip (badgeEl, workId) {
    const entry = this._load()[workId];
    if (!entry?.date) return;
    const fmt   = this.cfg('tooltipDateFormat') || 'long';
    const label = `Kudos given on ${this._formatDate(entry.date, fmt)}`;
    badgeEl.title              = label;
    badgeEl.setAttribute('aria-label', label);
  }

  /**
   * Replace the default 🧡 emoji on a kudos badge with the user's configured icon.
   */
  applyCustomIcon (badgeEl) {
    const icon = this.cfg('kudosIcon');
    if (icon && icon !== '🧡') badgeEl.textContent = icon;
  }

  /** @param {string} dateStr @param {'long'|'relative'|'short'} [format='long'] */
  _formatDate (dateStr, format = 'long') {
    return formatDate(dateStr, format);
  }

  /* ═══════════════════════════════════════════════════════════════════════
     FEATURE LIFECYCLE
  ═══════════════════════════════════════════════════════════════════════ */

  cleanup () {
    document.getElementById(`${this.NS}-fa-kudos-badge`)?.remove();
    this.setLoadingState(false);
  }
}
