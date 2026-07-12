/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper — Fic Appreciation › KudosDisplay sub-module
    Complements KudosTracker (which handles: detection, recording,
    greying out the kudos button, 🧡 badge on blurbs, quick-kudos button).
    KudosDisplay adds the richer display layer on top.

    - Feature: "Kudos given" badge on work pages
      - Option: Formatted date display (long / short / relative)
      - Option: Custom icon via cfg('kudosIcon')
      - Option: Injected after the kudos section

    - Feature: Rich tooltip on kudos badges (listings)
      - Option: Hover tooltip with formatted kudos date
      - Option: Date format: 'long' (default), 'short', 'relative'

    - Feature: Custom icon on kudos badges (listings)
      - Option: Replace default 🧡 with user-configured icon

    - Feature: Loading state indicator
      - Option: "Checking kudos status…" inline text near kudos section
      - Option: Shown during async detection, removed when done

═══════════════════════════════════════════════════════════════════════════ */

/**
 * KudosDisplay — enhanced display layer on top of KudosTracker.
 * KudosTracker handles: detection, recording, graying out button, 🧡 badge on blurbs.
 * KudosDisplay handles: formatted "Kudos given" badge on work page, rich tooltips,
 *                       loading indicator, custom icon via cfg.
 */
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

  // ── Work page ───────────────────────────────────────────────────────────

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

  // ── Listing blurbs ──────────────────────────────────────────────────────

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

  // ── Helpers ─────────────────────────────────────────────────────────────

  _formatDate (dateStr, format = 'long') {
    try {
      const d = new Date(dateStr + 'T00:00:00');
      if (format === 'short')    return d.toLocaleDateString('en-CA');
      if (format === 'relative') return this._relativeDate(d);
      // 'long' (default)
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch { return dateStr; }
  }

  _relativeDate (d) {
    const diff = Math.round((Date.now() - d.getTime()) / 86400000);
    if (diff === 0)   return 'today';
    if (diff === 1)   return 'yesterday';
    if (diff < 30)    return `${diff} days ago`;
    if (diff < 365)   return `${Math.round(diff / 30)} months ago`;
    return `${Math.round(diff / 365)} years ago`;
  }

  cleanup () {
    document.getElementById(`${this.NS}-fa-kudos-badge`)?.remove();
    this.setLoadingState(false);
  }
}
