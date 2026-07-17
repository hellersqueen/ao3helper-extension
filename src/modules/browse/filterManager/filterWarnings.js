/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Filter Manager › Filter Warnings

Purpose
    Detects excluded AO3 Archive Warnings in the current search parameters and
    displays an accessible, dismissible warning banner.

Notes
    The optional removal action rebuilds the current URL without the detected
    exclusions. The coordinator owns removal of the returned banner on cleanup.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { escapeHtml } from '../../../../lib/utils/dom.js';
import { ARCHIVE_WARNING_FORM_LABELS as ARCHIVE_WARNINGS } from '../../../../lib/ao3/constants.js';



/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

export class FilterWarnings {
  constructor ({ NS, cfg }) {
    this.NS  = NS;
    this.cfg = cfg;
  }


  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — EXCLUSION DETECTION
  ═════════════════════════════════════════════════════════════════════════ */

  /** Returns the list of Archive Warnings excluded by the current URL. */
  detect (params) {
    const raw = [...new Set([
      ...params.getAll('work_search[excluded_tag_names][]'),
      ...params.getAll('work_search[excluded_tag_names]'),
    ])];
    return ARCHIVE_WARNINGS.filter(w => raw.includes(w));
  }


  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — WARNING BANNER
  ═════════════════════════════════════════════════════════════════════════ */

  /** Inserts the warning banner and returns the element (or null if nothing to show). */
  insert (excluded) {
    const NS = this.NS;
    if (!excluded.length) return null;
    if (document.getElementById(`${NS}-fm-warning-banner`)) return null;

    const labels = excluded.map(w => `"${escapeHtml(w)}"`).join(', ');
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



/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

// The coordinator removes the banner element returned by insert().
