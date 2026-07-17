/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Fic Engagement › Hidden Gems

Purpose
    Identifies underexposed works with strong kudos-to-hit engagement and adds
    a Hidden Gem badge to their blurbs or work page.

Notes
    Fixed thresholds require at least 50 hits, 5 kudos, and a 5% ratio, with
    either no more than 100 kudos or no more than 10 bookmarks. Dynamic listing
    content is scanned through a managed observer.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { observe } from '../../../../lib/utils/index.js';



/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const GEM_BADGE_CLS = 'ao3h-gem-badge';
const GEM_BLURB_CLS = 'ao3h-gem-blurb';
const DATA_ATTR     = 'ao3hGemChecked';

const MIN_HITS      = 50;
const MIN_KUDOS     = 5;
const MIN_RATIO     = 0.05;  // 5%
const MAX_KUDOS     = 100;
const MAX_BOOKMARKS = 10;

export class HiddenGems {


  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — STATISTICS EXTRACTION
  ═════════════════════════════════════════════════════════════════════════ */

  _parseNum (node) {
    if (!node) return null;
    const n = parseInt((node.textContent || '').replace(/,/g, '').trim(), 10);
    return isNaN(n) ? null : n;
  }

  _getStatsFromBlurb (blurb) {
    const dl = blurb.querySelector('dl.stats');
    if (!dl) return null;
    const kudos     = this._parseNum(dl.querySelector('dd.kudos'));
    const hits      = this._parseNum(dl.querySelector('dd.hits'));
    const bookmarks = this._parseNum(dl.querySelector('dd.bookmarks'));
    if (kudos == null && hits == null) return null;
    return { kudos, hits, bookmarks };
  }

  _getStatsFromWorkPage () {
    const dl = document.querySelector('dl.work.meta.group dl.stats, #main dl.stats');
    if (!dl) return null;
    const kudos     = this._parseNum(dl.querySelector('dd.kudos'));
    const hits      = this._parseNum(dl.querySelector('dd.hits'));
    const bookmarks = this._parseNum(dl.querySelector('dd.bookmarks'));
    if (kudos == null && hits == null) return null;
    return { kudos, hits, bookmarks };
  }


  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — GEM DETECTION
  ═════════════════════════════════════════════════════════════════════════ */

  _isGem (stats) {
    if (!stats) return false;
    const { kudos, hits, bookmarks } = stats;
    if (!kudos || !hits) return false;
    if (hits < MIN_HITS || kudos < MIN_KUDOS) return false;
    const ratio  = kudos / hits;
    const lowPop = kudos <= MAX_KUDOS || (bookmarks != null && bookmarks <= MAX_BOOKMARKS);
    return ratio >= MIN_RATIO && lowPop;
  }

  _tooltip (stats) {
    const { kudos, hits } = stats;
    const ratio = hits ? ((kudos / hits) * 100).toFixed(1) : null;
    const parts = ['Under the radar: low kudos but high ratio'];
    if (ratio != null) parts.push(`${ratio}% ratio`);
    if (kudos  != null) parts.push(`${kudos.toLocaleString()} kudos`);
    if (hits   != null) parts.push(`${hits.toLocaleString()} hits`);
    return parts[0] + ' — ' + parts.slice(1).join(' · ');
  }


  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — GEM BADGES
  ═════════════════════════════════════════════════════════════════════════ */

  _createBadge (stats) {
    const span = document.createElement('span');
    span.className = GEM_BADGE_CLS;
    span.textContent = '💎 Hidden Gem';
    span.title = this._tooltip(stats);
    return span;
  }

  _attachToBlurb (blurb, stats) {
    if (blurb.querySelector('.' + GEM_BADGE_CLS)) return;
    blurb.classList.add(GEM_BLURB_CLS);
    const target = blurb.querySelector('h4.heading') || blurb;
    target.appendChild(this._createBadge(stats));
  }

  _attachToWorkPage (stats) {
    const target =
      document.querySelector('div.preface.group h2.title') ||
      document.querySelector('h2.title.heading');
    if (!target || target.querySelector('.' + GEM_BADGE_CLS)) return;
    target.appendChild(this._createBadge(stats));
  }


  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — PAGE PROCESSING
  ═════════════════════════════════════════════════════════════════════════ */

  _processBlurb (blurb) {
    if (blurb.dataset[DATA_ATTR]) return;
    blurb.dataset[DATA_ATTR] = '1';
    const stats = this._getStatsFromBlurb(blurb);
    if (this._isGem(stats)) this._attachToBlurb(blurb, stats);
  }

  _scan () {
    document.querySelectorAll('li.work.blurb.group, li.bookmark.blurb.group')
      .forEach(b => this._processBlurb(b));
  }


  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE LIFECYCLE
  ═════════════════════════════════════════════════════════════════════════ */

  init () {
    this._scan();

    if (/^\/works\/\d+/.test(location.pathname)) {
      const stats = this._getStatsFromWorkPage();
      if (this._isGem(stats)) this._attachToWorkPage(stats);
    }

    this._mo = observe(document.querySelector('#main') || document.body, {
      childList: true, subtree: true,
    }, () => this._scan());
  }

  cleanup () {
    this._mo?.disconnect();
    document.querySelectorAll('.' + GEM_BADGE_CLS).forEach(el => el.remove());
    document.querySelectorAll('.' + GEM_BLURB_CLS).forEach(el => {
      el.classList.remove(GEM_BLURB_CLS);
    });
    document.querySelectorAll('[data-ao3h-gem-checked]')
      .forEach(el => delete el.dataset[DATA_ATTR]);
  }
}
