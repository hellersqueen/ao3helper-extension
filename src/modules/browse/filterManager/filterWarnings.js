/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Filter Warnings Submodule
    Submodule ID: filterWarnings
    Parent Module: filterManager

    - Feature: Archive Warning exclusion detection
      - Option: Scans current URL search params for excluded Archive Warnings
      - Option: Tracks all 6 official AO3 Archive Warnings
      - Option: Supports both array and bare param name forms

    - Feature: Dismissible warning banner
      - Option: Injected at the top of #main on listing pages
      - Option: Lists the names of all excluded warnings inline
      - Option: ⚠️ icon with role="alert" for accessibility
      - Option: ✕ dismiss button removes banner from DOM
      - Option: Guards against duplicate banner injection

    - Feature: Remove exclusion button
      - Option: "Remove exclusion" button shown when cfg excludeWarningRemoveButton is true
      - Option: Rebuilds current URL removing excluded Archive Warning params (both bracket and bare forms)
      - Option: Navigates to the updated URL on click

    Dependencies injected via constructor: NS, cfg

═══════════════════════════════════════════════════════════════════════════ */

const ARCHIVE_WARNINGS = [
  'Graphic Depictions of Violence',
  'Major Character Death',
  'Rape/Non-Con',
  'Underage',
  'Choose Not To Use Archive Warnings',
  'No Archive Warnings Apply',
];

export class FilterWarnings {
  constructor ({ NS, cfg }) {
    this.NS  = NS;
    this.cfg = cfg;
  }

  _escapeHtml (str) {
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /** Returns the list of Archive Warnings excluded by the current URL. */
  detect (params) {
    const raw = [...new Set([
      ...params.getAll('work_search[excluded_tag_names][]'),
      ...params.getAll('work_search[excluded_tag_names]'),
    ])];
    return ARCHIVE_WARNINGS.filter(w => raw.includes(w));
  }

  /** Inserts the warning banner and returns the element (or null if nothing to show). */
  insert (excluded) {
    const NS = this.NS;
    if (!excluded.length) return null;
    if (document.getElementById(`${NS}-fm-warning-banner`)) return null;

    const labels = excluded.map(w => `"${this._escapeHtml(w)}"`).join(', ');
    const banner = document.createElement('div');
    banner.id        = `${NS}-fm-warning-banner`;
    banner.className = `${NS}-fm-warning-banner`;
    banner.setAttribute('role', 'alert');
    banner.innerHTML = `
      <span class="${NS}-fm-warn-icon" aria-hidden="true">⚠️</span>
      <span class="${NS}-fm-warn-text">
        <strong>Active exclusion:</strong> Works tagged with ${labels} are hidden by your current filters.
      </span>
      ${this.cfg('excludeWarningRemoveButton') ? `
        <button class="${NS}-fm-warn-remove">Remove exclusion</button>
      ` : ''}
      <button class="${NS}-fm-warn-dismiss" aria-label="Dismiss">✕</button>
    `;

    banner.querySelector(`.${NS}-fm-warn-dismiss`)
      ?.addEventListener('click', () => banner.remove());

    if (this.cfg('excludeWarningRemoveButton')) {
      banner.querySelector(`.${NS}-fm-warn-remove`)
        ?.addEventListener('click', () => {
          const url = new URL(location.href);
          const remaining = url.searchParams
            .getAll('work_search[excluded_tag_names][]')
            .filter(v => !excluded.includes(v));
          url.searchParams.delete('work_search[excluded_tag_names][]');
          url.searchParams.delete('work_search[excluded_tag_names]');
          remaining.forEach(v =>
            url.searchParams.append('work_search[excluded_tag_names][]', v)
          );
          location.href = url.toString();
        });
    }

    document.querySelector('#main')?.prepend(banner);
    return banner;
  }
}
