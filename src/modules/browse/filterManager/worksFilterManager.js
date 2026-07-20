/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Filter Manager › Works Filter Manager

Purpose
    Classifies work blurbs (one-shot, crossover, tag count, anonymous,
    summary, kudos ratio, update date, abandoned-looking WIPs) and provides
    quick controls for filtering on those classifications, plus a per-blurb
    manual hide button and keyboard shortcut.

Notes
    Classification is stored in data attributes, while visibility is controlled
    by document-root classes and rules in filterManager.css. Processed blurbs
    are marked to avoid duplicate work during rescans. One-shot and crossover
    filters are three-state (all / only / hide); the rest are simple toggles.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { extractWorkIdFromBlurb, parseChapterCount } from '../../../../lib/ao3/parsers.js';



/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const KEY_MANUAL_HIDDEN = 'filterManager:manualHidden';

export class WorksFilterManager {
  constructor ({ NS, cfg, storeGet, storeSet, helpers }) {
    this.NS        = NS;
    this.cfg       = cfg;
    this.storeGet  = storeGet;
    this.storeSet  = storeSet;
    this.helpers   = helpers;
    this._panel    = null;
    this._hoveredBlurb   = null;
    this._keydownHandler = null;
    this._dateSelect      = null;
  }


  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — WORK CLASSIFICATION
  ═════════════════════════════════════════════════════════════════════════ */

  _isOneshot (blurb) {
    const chapters = blurb.querySelector('dd.chapters')?.textContent.trim();
    return chapters === '1/1' || chapters === '1';
  }

  _isCrossover (blurb) {
    return blurb.querySelectorAll('h6.fandoms a.tag').length > 1;
  }

  _isAnonymous (blurb) {
    const byline = blurb.querySelector('h4.heading')?.textContent || '';
    return /\bAnonymous\b/.test(byline) && !blurb.querySelector('h4.heading a[rel="author"]');
  }

  _tagCount (blurb) {
    return blurb.querySelectorAll(
      'ul.tags .tag, .fandoms a.tag, .warnings a.tag, .relationships a.tag, .characters a.tag, .freeforms a.tag'
    ).length;
  }

  _summaryText (blurb) {
    return blurb.querySelector('.summary blockquote, blockquote.userstuff')?.textContent || '';
  }

  _kudosAndHits (blurb) {
    const kudosText = blurb.querySelector('dd.kudos')?.textContent.replace(/,/g, '').trim();
    const hitsText  = blurb.querySelector('dd.hits')?.textContent.replace(/,/g, '').trim();
    return {
      kudos: kudosText ? parseInt(kudosText, 10) : null,
      hits:  hitsText ? parseInt(hitsText, 10) : null,
    };
  }

  _lastUpdated (blurb) {
    return this.helpers.parseAO3Date(blurb.querySelector('p.datetime')?.textContent);
  }

  apply (blurbs) {
    const cfg = this.cfg;
    for (const blurb of blurbs) {
      if (blurb.dataset.fmWfm) continue;
      blurb.dataset.fmWfm = '1';

      if (this._isOneshot(blurb))   blurb.dataset.fmOneshot   = '1';
      if (this._isCrossover(blurb)) blurb.dataset.fmCrossover = '1';

      if (cfg('quickFilterLowTags') && this.helpers.belowTagThreshold(this._tagCount(blurb), cfg('lowTagThreshold') || 0)) {
        blurb.dataset.fmLowtags = '1';
      }
      if (cfg('quickFilterAnonymous') && this._isAnonymous(blurb)) {
        blurb.dataset.fmAnon = '1';
      }
      if (cfg('quickFilterSummary') && this.helpers.summaryTooShort(this._summaryText(blurb), cfg('minSummaryLength') || 0)) {
        blurb.dataset.fmNosummary = '1';
      }
      if (cfg('quickFilterRatio')) {
        const { kudos, hits } = this._kudosAndHits(blurb);
        if (this.helpers.belowRatioThreshold(this.helpers.kudosRatio(kudos, hits), cfg('minKudosRatio') || 0)) {
          blurb.dataset.fmLowratio = '1';
        }
      }
      const updated = this._lastUpdated(blurb);
      if (cfg('quickFilterDate') && updated) {
        blurb.dataset.fmUpdatedAt = String(updated.getTime());
      }
      if (cfg('quickFilterAbandoned')) {
        const { isComplete } = parseChapterCount(blurb.querySelector('dd.chapters'));
        if (this.helpers.looksAbandoned(updated, isComplete)) blurb.dataset.fmAbandoned = '1';
      }

      if (this.cfg('showOneshotBadge') && this._isOneshot(blurb) && !blurb.querySelector(`.${this.NS}-fm-oneshot-badge`)) {
        const badge = document.createElement('span');
        badge.className   = `${this.NS}-fm-oneshot-badge`;
        badge.textContent = '1️⃣';
        badge.title       = 'One-shot';
        blurb.querySelector('h4.heading')?.appendChild(badge);
      }

      if (this.cfg('manualHideEnabled')) this._injectHideButton(blurb);
    }
    this._applyManualHidden(blurbs);
    if (cfg('quickFilterDate')) this._applyDateFilter(this._dateSelect?.value || '');
  }

  /** Recomputes which blurbs are "stale" for the currently selected date range. */
  _applyDateFilter (range) {
    document.querySelectorAll('[data-fm-updated-at]').forEach(blurb => {
      const updated = new Date(parseInt(/** @type {HTMLElement} */ (blurb).dataset.fmUpdatedAt, 10));
      if (range && !this.helpers.isWithinDateRange(updated, range)) {
        blurb.setAttribute('data-fm-staledate', '1');
      } else {
        blurb.removeAttribute('data-fm-staledate');
      }
    });
  }


  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — MANUAL PER-WORK HIDE
  ═════════════════════════════════════════════════════════════════════════ */

  _loadManualHidden () { return this.storeGet(KEY_MANUAL_HIDDEN, []); }
  _saveManualHidden (ids) { this.storeSet(KEY_MANUAL_HIDDEN, ids); }

  hideWork (workId) {
    if (!workId) return;
    const ids = this._loadManualHidden();
    if (!ids.includes(workId)) { ids.push(workId); this._saveManualHidden(ids); }
  }

  unhideAll () { this._saveManualHidden([]); }

  _applyManualHidden (blurbs) {
    const hidden = new Set(this._loadManualHidden());
    for (const blurb of blurbs) {
      const workId = extractWorkIdFromBlurb(blurb);
      if (workId && hidden.has(workId)) {
        blurb.dataset.fmManualHidden = '1';
      }
    }
    this._refreshManualCount();
  }

  _injectHideButton (blurb) {
    const NS = this.NS;
    if (blurb.querySelector(`.${NS}-fm-hide-btn`)) return;
    const stats = blurb.querySelector('.stats') || blurb.querySelector('h4.heading');
    if (!stats) return;
    const btn       = document.createElement('button');
    btn.type        = 'button';
    btn.className   = `${NS}-fm-hide-btn`;
    btn.title       = 'Hide this work';
    btn.textContent = '✕';
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const workId = extractWorkIdFromBlurb(blurb);
      this.hideWork(workId);
      blurb.dataset.fmManualHidden = '1';
      this._refreshManualCount();
    });
    blurb.addEventListener('mouseenter', () => { this._hoveredBlurb = blurb; });
    stats.appendChild(btn);
  }

  _refreshManualCount () {
    if (!this._manualCountEl) return;
    const count = this._loadManualHidden().length;
    if (count > 0) {
      this._manualCountEl.hidden = false;
      this._manualCountEl.innerHTML = '';
      this._manualCountEl.appendChild(
        document.createTextNode(`${count} work${count !== 1 ? 's' : ''} manually hidden `)
      );
      const undoBtn = document.createElement('button');
      undoBtn.type = 'button';
      undoBtn.className = `${this.NS}-fm-unhide-all`;
      undoBtn.textContent = '↺ Unhide all';
      undoBtn.addEventListener('click', () => {
        this.unhideAll();
        document.querySelectorAll('[data-fm-manual-hidden]').forEach(el => delete el.dataset.fmManualHidden);
        this._refreshManualCount();
      });
      this._manualCountEl.appendChild(undoBtn);
    } else {
      this._manualCountEl.hidden = true;
    }
  }


  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — KEYBOARD SHORTCUT
  ═════════════════════════════════════════════════════════════════════════ */

  _wireKeyboardShortcut () {
    if (this._keydownHandler) return;
    this._keydownHandler = (e) => {
      if (!this.cfg('manualHideShortcut')) return;
      if (e.key.toLowerCase() !== 'x' || e.ctrlKey || e.metaKey || e.altKey) return;
      const target = /** @type {HTMLElement} */ (e.target);
      if (target?.closest('input, textarea, select, [contenteditable]')) return;
      if (!this._hoveredBlurb) return;
      const workId = extractWorkIdFromBlurb(this._hoveredBlurb);
      this.hideWork(workId);
      this._hoveredBlurb.dataset.fmManualHidden = '1';
      this._refreshManualCount();
    };
    document.addEventListener('keydown', this._keydownHandler);
  }


  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — QUICK FILTER CONTROLS
  ═════════════════════════════════════════════════════════════════════════ */

  buildPanel () {
    const NS  = this.NS;
    const cfg = this.cfg;
    const panel = document.createElement('div');
    panel.className = `${NS}-fm-quick-panel`;

    const label = document.createElement('span');
    label.className   = `${NS}-fm-quick-label`;
    label.textContent = 'Quick filters:';
    panel.appendChild(label);

    let any = false;

    if (cfg('quickFilterOneshot')) { any = true; panel.appendChild(this._makeThreeStateBtn('oneshot', '1️⃣ One-shots')); }
    if (cfg('quickFilterCrossover')) { any = true; panel.appendChild(this._makeThreeStateBtn('crossover', '🌐 Crossovers')); }
    if (cfg('quickFilterLowTags'))   { any = true; panel.appendChild(this._makeToggleBtn('lowtags', '🏷️ Hide low-tag works')); }
    if (cfg('quickFilterAnonymous')) { any = true; panel.appendChild(this._makeToggleBtn('anon', '👤 Hide anonymous')); }
    if (cfg('quickFilterSummary'))   { any = true; panel.appendChild(this._makeToggleBtn('nosummary', '📝 Require summary')); }
    if (cfg('quickFilterRatio'))     { any = true; panel.appendChild(this._makeToggleBtn('lowratio', '💔 Min kudos ratio')); }
    if (cfg('quickFilterAbandoned')) { any = true; panel.appendChild(this._makeToggleBtn('abandoned', '🕸️ Hide abandoned WIPs')); }
    if (cfg('quickFilterDate'))      { any = true; panel.appendChild(this._makeDateSelect()); }

    if (!any && !cfg('manualHideEnabled')) return null;

    if (cfg('manualHideEnabled')) {
      const countEl = document.createElement('span');
      countEl.className = `${NS}-fm-manual-count`;
      countEl.hidden = true;
      panel.appendChild(countEl);
      this._manualCountEl = countEl;
      this._wireKeyboardShortcut();
      this._refreshManualCount();
    }

    this._panel = panel;
    return panel;
  }

  _makeThreeStateBtn (key, label) {
    const NS  = this.NS;
    const cls = `${NS}-fm-${key}`;
    const btn = document.createElement('button');
    btn.type      = 'button';
    btn.className = `${NS}-fm-quick-btn`;
    /** @type {'all'|'only'|'hide'} */
    let state = 'all';
    const render = () => {
      btn.textContent = `${label}: ${state === 'all' ? 'All' : state === 'only' ? 'Only' : 'Hide'}`;
      btn.classList.toggle(`${NS}-fm-active`, state !== 'all');
      btn.setAttribute('aria-pressed', String(state !== 'all'));
      document.documentElement.classList.toggle(`${cls}-only`, state === 'only');
      document.documentElement.classList.toggle(`${cls}-hide`, state === 'hide');
    };
    render();
    btn.addEventListener('click', () => { state = this.helpers.nextThreeState(state); render(); });
    return btn;
  }

  _makeToggleBtn (key, label) {
    const btn = this._makeBtn(label, () => {
      const active = document.documentElement.classList.toggle(`${this.NS}-fm-${key}-active`);
      btn.classList.toggle(`${this.NS}-fm-active`, active);
      btn.setAttribute('aria-pressed', String(active));
    });
    return btn;
  }

  _makeDateSelect () {
    const NS  = this.NS;
    const wrap = document.createElement('span');
    wrap.className = `${NS}-fm-date-wrap`;
    const label = document.createElement('label');
    label.textContent = '📅 Updated within: ';
    const select = document.createElement('select');
    select.className = `${NS}-fm-date-select`;
    select.innerHTML = `
      <option value="">Any time</option>
      <option value="today">Today</option>
      <option value="week">This week</option>
      <option value="month">This month</option>
    `;
    select.addEventListener('change', () => {
      document.documentElement.classList.toggle(`${NS}-fm-date-active`, !!select.value);
      this._applyDateFilter(select.value);
    });
    label.appendChild(select);
    wrap.appendChild(label);
    this._dateSelect = select;
    return wrap;
  }

  _makeBtn (label, onClick) {
    const NS  = this.NS;
    const btn = document.createElement('button');
    btn.type        = 'button';
    btn.className   = `${NS}-fm-quick-btn`;
    btn.textContent = label;
    btn.setAttribute('aria-pressed', 'false');
    btn.addEventListener('click', onClick);
    return btn;
  }


  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE LIFECYCLE
  ═════════════════════════════════════════════════════════════════════════ */

  cleanup () {
    const NS = this.NS;
    document.documentElement.classList.remove(
      `${NS}-fm-oneshot-only`, `${NS}-fm-oneshot-hide`,
      `${NS}-fm-crossover-only`, `${NS}-fm-crossover-hide`,
      `${NS}-fm-lowtags-active`, `${NS}-fm-anon-active`,
      `${NS}-fm-nosummary-active`, `${NS}-fm-lowratio-active`,
      `${NS}-fm-abandoned-active`, `${NS}-fm-date-active`
    );
    document.querySelectorAll('[data-fm-wfm]').forEach(el => {
      delete el.dataset.fmWfm;
      delete el.dataset.fmOneshot;
      delete el.dataset.fmCrossover;
      delete el.dataset.fmLowtags;
      delete el.dataset.fmAnon;
      delete el.dataset.fmNosummary;
      delete el.dataset.fmLowratio;
      delete el.dataset.fmStaledate;
      delete el.dataset.fmUpdatedAt;
      delete el.dataset.fmAbandoned;
      el.querySelector(`.${NS}-fm-oneshot-badge`)?.remove();
      el.querySelector(`.${NS}-fm-hide-btn`)?.remove();
    });
    document.querySelectorAll('[data-fm-manual-hidden]').forEach(el => {
      delete el.dataset.fmManualHidden;
    });
    if (this._keydownHandler) {
      document.removeEventListener('keydown', this._keydownHandler);
      this._keydownHandler = null;
    }
    this._hoveredBlurb  = null;
    this._manualCountEl = null;
    this._dateSelect    = null;
    this._panel?.remove();
    this._panel = null;
  }
}
