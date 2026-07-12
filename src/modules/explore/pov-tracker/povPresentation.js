/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - POV Tracker: Presentation
    Module ID: povTracker (helper — instantiated by _povTracker.js)
    Class:     PovPresentation
    Role:      Badge injection on work blurbs + optional filter bar + stats panel

    Badge config keys (one per POV type, controlled via panel settings):
        badgeFirst | badgeSecond | badgeThird | badgeMixed | badgeMulti | badgeUnknown
    Toggle keys:
        showBadgesOnBlurbs  -- master switch for badge injection
        enablePovFilters    -- inject filter buttons above work listings
        showStats           -- inject a mini stats bar (counts by POV type)

    Badge anatomy:
        <span class="ao3h-pov-badge ao3h-pov-{type}" title="POV: {label}">
            POV label text
        </span>
        Appended to h4.heading inside the work blurb.

    Filter bar:
        <div id="ao3h-pov-filter-bar"> contains toggle buttons per POV type.
        Clicking hides/shows blurbs that have that POV.

═══════════════════════════════════════════════════════════════════════════ */

import { getGlobalWindow } from '../../../../lib/utils/globals.js';

const W = getGlobalWindow();

// ── Constants ─────────────────────────────────────────────────────────────
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

// ── Helpers ───────────────────────────────────────────────────────────────
function workIdFromBlurb (blurb) {
  const m = (blurb.id || '').match(/^work_(\d+)$/);
  return m ? m[1] : null;
}

// ── Class ─────────────────────────────────────────────────────────────────
export class PovPresentation {
  /** @param {{ cfg: Function, NS: string }} opts */
  constructor ({ cfg, NS }) {
    this.cfg      = cfg;
    this.NS       = NS;
    this._observer = null;
    this._hidden   = new Set(); // POV types currently filtered out
    this._originalDisplays = new WeakMap();
  }

  init () {
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

  // ── Badge injection ────────────────────────────────────────────────────
  _processAllBlurbs () {
    document.querySelectorAll('li.work.blurb, div.work.blurb').forEach(b => this._processBlurb(b));
    W.AO3H_PovTracker?._analysis?.flush();
  }

  _processBlurb (blurb) {
    if (!this.cfg('showBadgesOnBlurbs')) return;
    if (blurb.querySelector('.ao3h-pov-badge')) return; // already done

    const workId = workIdFromBlurb(blurb);
    if (!workId) return;

    const api      = W.AO3H_PovTracker;
    const analysis = api?._analysis;
    if (!analysis) return;

    // If autoAnalyze is off, only use cached results — skip fresh detection
    const autoAnalyze = this.cfg('autoAnalyze');
    const result = autoAnalyze
      ? analysis.getOrDetect(workId, blurb)
      : analysis.getFromCache(workId);
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

  // ── Filter bar ─────────────────────────────────────────────────────────
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
      btn.style.color   = meta.color;
      btn.style.borderColor = meta.color;
      btn.dataset.pov   = pov;
      btn.title         = `Toggle ${meta.label} works`;
      btn.addEventListener('click', () => this._toggleFilter(pov, btn, meta.color));
      bar.appendChild(btn);
    }

    const ol = main.querySelector('ol.work.index');
    if (ol) {
      ol.insertAdjacentElement('beforebegin', bar);
    } else {
      main.insertAdjacentElement('afterbegin', bar);
    }
  }

  _toggleFilter (pov, btn, color) {
    if (this._hidden.has(pov)) {
      this._hidden.delete(pov);
      btn.classList.remove('active');
      btn.style.background = '';
      btn.style.color      = color;
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
      btn.classList.add('active');
      btn.style.background = color;
      btn.style.color      = '#fff';
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

  // ── Stats bar ──────────────────────────────────────────────────────────
  _injectStatsBar () {
    if (document.getElementById(STATS_BAR_ID)) return;
    const api = W.AO3H_PovTracker;
    if (!api?._analysis) return;
    const counts = api._analysis.getStats();
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

  // ── MutationObserver ───────────────────────────────────────────────────
  _startObserver () {
    const target = document.getElementById('main') || document.body;
    this._observer = new MutationObserver(mutations => {
      for (const mut of mutations) {
        for (const node of mut.addedNodes) {
          if (!(node instanceof Element)) continue;
          if (node.matches('li.work.blurb, div.work.blurb')) {
            this._processBlurb(node);
          } else {
            node.querySelectorAll('li.work.blurb, div.work.blurb').forEach(b => this._processBlurb(b));
          }
        }
        W.AO3H_PovTracker?._analysis?.flush();
      }
    });
    this._observer.observe(target, { childList: true, subtree: true });
  }

  _stopObserver () {
    this._observer?.disconnect();
    this._observer = null;
  }

}
