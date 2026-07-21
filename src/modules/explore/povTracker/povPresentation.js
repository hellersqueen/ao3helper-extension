/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - POV Tracker › POV Presentation

Presents cached or newly detected POV classifications as work-blurb badges,
filter controls, and optional aggregate statistics.

Notes

- Badge visibility is configurable independently for every POV classification.
- Filtered blurbs retain and later recover their original inline display value.
- Dynamically added blurbs are analyzed and decorated through an observer.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { observe } from '../../../../lib/utils/index.js';
import { extractWorkIdFromBlurb } from '../../../../lib/ao3/parsers.js';


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const FILTER_BAR_ID = 'ao3h-pov-filter-bar';
const STATS_BAR_ID  = 'ao3h-pov-stats-bar';
const BADGE_ATTR    = 'data-ao3h-pov';

const POV_META = {
  first   : { label: '1st Person', cfgKey: 'badgeFirst',   color: '#6a5acd' },
  second  : { label: '2nd Person', cfgKey: 'badgeSecond',  color: '#2e8b57' },
  third   : { label: '3rd Person', cfgKey: 'badgeThird',   color: '#4682b4' },
  mixed   : { label: 'Mixed POV',  cfgKey: 'badgeMixed',   color: '#b8860b' },
  multi   : { label: 'Multi POV',  cfgKey: 'badgeMulti',   color: '#8b4513' },
  unknown : { label: 'POV ?',      cfgKey: 'badgeUnknown', color: '#888888' },
};

export class PovPresentation {
  /** @param {{ cfg: Function, analysis: Object, parsePreferredPovs: Function }} opts */
  constructor ({ cfg, analysis, parsePreferredPovs }) {
    this.cfg      = cfg;
    this.analysis = analysis;
    this._parsePreferredPovs = parsePreferredPovs || (() => []);
    this._observer = null;
    this._hidden   = new Set(); // POV types currently filtered out
    this._originalDisplays = new WeakMap();
  }

  /* ═══════════════════════════════════════════════════════════════════════
     FEATURE — POV BADGES
  ═══════════════════════════════════════════════════════════════════════ */

  _processAllBlurbs () {
    document.querySelectorAll('li.work.blurb, div.work.blurb').forEach(b => this._processBlurb(b));
    this.analysis.flush();
  }

  _processBlurb (blurb) {
    if (!this.cfg('showBadgesOnBlurbs')) return;
    if (blurb.querySelector('.ao3h-pov-badge')) return; // already done

    const workId = extractWorkIdFromBlurb(blurb);
    if (!workId) return;

    // If autoAnalyze is off, only use cached results — skip fresh detection
    const autoAnalyze = this.cfg('autoAnalyze');
    const result = autoAnalyze
      ? this.analysis.getOrDetect(workId, blurb)
      : this.analysis.getFromCache(workId);
    if (!result) return;

    const { pov } = result;
    const meta     = POV_META[pov];
    if (!meta) return;
    if (!this.cfg(meta.cfgKey)) return;

    const heading = blurb.querySelector('h4.heading, h5.heading');
    if (!heading) return;

    const badge       = document.createElement('span');
    badge.className   = `ao3h-pov-badge ao3h-pov-${pov}`;
    badge.setAttribute(BADGE_ATTR, pov);
    badge.textContent = meta.label;
    badge.title       = `POV: ${meta.label}`;
    heading.appendChild(badge);

    // Apply filter state if already active
    if (this._hidden.has(pov)) {
      this._hideBlurb(blurb);
    }
  }

  /* ═══════════════════════════════════════════════════════════════════════
     FEATURE — POV FILTERS
  ═══════════════════════════════════════════════════════════════════════ */

  _injectFilterBar () {
    if (document.getElementById(FILTER_BAR_ID)) return;
    const main = document.getElementById('main');
    if (!main) return;

    const bar = document.createElement('div');
    bar.id    = FILTER_BAR_ID;

    const lbl       = document.createElement('span');
    lbl.className   = 'ao3h-pov-filter-label';
    lbl.textContent = 'POV:';
    bar.appendChild(lbl);

    for (const [pov, meta] of Object.entries(POV_META)) {
      if (!this.cfg(meta.cfgKey)) continue;
      const btn         = document.createElement('button');
      btn.textContent   = meta.label;
      btn.style.borderColor = meta.color;
      btn.dataset.pov   = pov;
      btn.title         = `Toggle ${meta.label} works`;
      btn.addEventListener('click', () => this._toggleFilter(pov, btn, meta.color));
      this._setButtonActive(btn, meta.color, this._hidden.has(pov));
      bar.appendChild(btn);
    }

    const ol = main.querySelector('ol.work.index');
    if (ol) {
      ol.insertAdjacentElement('beforebegin', bar);
    } else {
      main.insertAdjacentElement('afterbegin', bar);
    }
  }

  _setButtonActive (btn, color, active) {
    btn.classList.toggle('active', active);
    btn.style.background = active ? color : '';
    btn.style.color      = active ? '#fff' : color;
  }

  _toggleFilter (pov, btn, color) {
    if (this._hidden.has(pov)) {
      this._hidden.delete(pov);
      this._setButtonActive(btn, color, false);
      // Restore
      document.querySelectorAll(`[data-ao3h-pov-hidden]`).forEach(blurb => {
        const badge = blurb.querySelector(`.ao3h-pov-badge[${BADGE_ATTR}="${pov}"]`);
        if (!badge) return;
        // Only un-hide if no other currently-active filter also covers this blurb
        const stillHidden = [...this._hidden].some(h =>
          blurb.querySelector(`.ao3h-pov-badge[${BADGE_ATTR}="${h}"]`)
        );
        if (!stillHidden) {
          this._restoreBlurb(blurb);
        }
      });
    } else {
      this._hidden.add(pov);
      this._setButtonActive(btn, color, true);
      // Hide
      document.querySelectorAll(`li.work.blurb, div.work.blurb`).forEach(blurb => {
        const badge = blurb.querySelector(`.ao3h-pov-badge[${BADGE_ATTR}="${pov}"]`);
        if (badge) {
          this._hideBlurb(blurb);
        }
      });
    }
  }

  _hideBlurb (blurb) {
    if (!this._originalDisplays.has(blurb)) {
      this._originalDisplays.set(blurb, blurb.style.display);
    }
    blurb.style.display = 'none';
    blurb.setAttribute('data-ao3h-pov-hidden', '1');
  }

  _restoreBlurb (blurb) {
    if (this._originalDisplays.has(blurb)) {
      blurb.style.display = this._originalDisplays.get(blurb);
      this._originalDisplays.delete(blurb);
    }
    blurb.removeAttribute('data-ao3h-pov-hidden');
  }

  /* ═══════════════════════════════════════════════════════════════════════
     FEATURE — POV STATISTICS
  ═══════════════════════════════════════════════════════════════════════ */

  _injectStatsBar () {
    if (document.getElementById(STATS_BAR_ID)) return;
    const counts = this.analysis.getStats();
    const total  = Object.values(counts).reduce((a, b) => a + b, 0);
    if (total === 0) return;

    const bar = document.createElement('div');
    bar.id    = STATS_BAR_ID;
    bar.textContent = 'POV stats: ';
    for (const [pov, count] of Object.entries(counts)) {
      if (count === 0) continue;
      const s       = document.createElement('span');
      s.textContent = `${POV_META[pov]?.label ?? pov}: ${count}`;
      s.style.color = POV_META[pov]?.color ?? '#555';
      bar.appendChild(s);
    }

    const main = document.getElementById('main');
    if (main) main.insertAdjacentElement('afterbegin', bar);
  }

  _startObserver () {
    const target = document.getElementById('main') || document.body;
    this._observer = observe(target, { childList: true, subtree: true }, mutations => {
      for (const mut of mutations) {
        for (const node of mut.addedNodes) {
          if (!(node instanceof Element)) continue;
          if (node.matches('li.work.blurb, div.work.blurb')) {
            this._processBlurb(node);
          } else {
            node.querySelectorAll('li.work.blurb, div.work.blurb').forEach(b => this._processBlurb(b));
          }
        }
        this.analysis.flush();
      }
    });
  }

  _stopObserver () {
    this._observer?.disconnect();
    this._observer = null;
  }

  /* ═══════════════════════════════════════════════════════════════════════
     FEATURE — PREFERRED POV AUTO-FILTER
  ═══════════════════════════════════════════════════════════════════════ */

  // Pre-populates `_hidden` with every non-preferred POV type before blurbs
  // are processed, so the existing badge-time auto-hide check (see
  // _processBlurb) applies the preference without a separate code path.
  _applyPreferredPovDefaults () {
    if (!this.cfg('autoApplyPreferredFilter')) return;
    const preferred = this._parsePreferredPovs(this.cfg('preferredPovs'));
    if (!preferred.length) return;
    for (const pov of Object.keys(POV_META)) {
      if (!preferred.includes(pov)) this._hidden.add(pov);
    }
  }

  /* ═══════════════════════════════════════════════════════════════════════
     FEATURE LIFECYCLE
  ═══════════════════════════════════════════════════════════════════════ */

  init () {
    this._applyPreferredPovDefaults();
    if (this.cfg('showBadgesOnBlurbs')) this._processAllBlurbs();
    if (this.cfg('enablePovFilters'))   this._injectFilterBar();
    if (this.cfg('showStats'))          this._injectStatsBar();
    this._startObserver();
  }

  destroy () {
    this._stopObserver();
    document.querySelectorAll(`.ao3h-pov-badge`).forEach(el => el.remove());
    document.getElementById(FILTER_BAR_ID)?.remove();
    document.getElementById(STATS_BAR_ID)?.remove();
    // Un-hide any filtered blurbs
    document.querySelectorAll(`[data-ao3h-pov-hidden]`).forEach(el => {
      this._restoreBlurb(el);
    });
  }
}
