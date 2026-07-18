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
import {
  DEFAULT_GEM_THRESHOLDS, isGem, gemMedal, averageRatio, isGemRelativeToPageAverage,
} from './ficEngagementHelpers.js';



/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const GEM_BADGE_CLS = 'ao3h-gem-badge';
const GEM_BLURB_CLS = 'ao3h-gem-blurb';
const DATA_ATTR     = 'ao3hGemChecked';

const MEDAL_ICON = { diamond: '💎', gold: '🥇', silver: '🥈' };
const RELATIVE_MULTIPLIER = 1.5; // how far above the page's own average ratio counts as a gem

export class HiddenGems {
  /**
   * @param {{thresholds?: Partial<typeof DEFAULT_GEM_THRESHOLDS>, compareToPageAverage?: boolean}} [opts]
   */
  constructor ({ thresholds = {}, compareToPageAverage = false } = {}) {
    this.thresholds = { ...DEFAULT_GEM_THRESHOLDS, ...thresholds };
    this.compareToPageAverage = compareToPageAverage;
  }


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
    if (isGem(stats, this.thresholds)) return true;
    if (!this.compareToPageAverage) return false;
    return isGemRelativeToPageAverage(stats, this._pageAverageRatio, RELATIVE_MULTIPLIER, this.thresholds);
  }

  _medal (stats) {
    const medal = gemMedal(stats, this.thresholds);
    if (medal) return medal;
    // Relative-only gems (didn't clear the fixed threshold, only the page-average one) get the base tier.
    return this._isGem(stats) ? 'silver' : null;
  }

  _tooltip (stats) {
    const { kudos, hits } = stats;
    const ratio = hits ? ((kudos / hits) * 100).toFixed(1) : null;
    const medal = this._medal(stats);
    const label = medal ? `${MEDAL_ICON[medal]} ${medal[0].toUpperCase()}${medal.slice(1)} hidden gem` : 'Under the radar: low kudos but high ratio';
    const parts = [label];
    if (ratio != null) parts.push(`${ratio}% ratio`);
    if (kudos  != null) parts.push(`${kudos.toLocaleString()} kudos`);
    if (hits   != null) parts.push(`${hits.toLocaleString()} hits`);
    if (this.compareToPageAverage && this._pageAverageRatio != null) {
      parts.push(`page average: ${(this._pageAverageRatio * 100).toFixed(1)}%`);
    }
    return parts[0] + ' — ' + parts.slice(1).join(' · ');
  }


  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — GEM BADGES
  ═════════════════════════════════════════════════════════════════════════ */

  _createBadge (stats) {
    const medal = this._medal(stats);
    const span = document.createElement('span');
    span.className = GEM_BADGE_CLS + (medal ? ` ${GEM_BADGE_CLS}-${medal}` : '');
    span.textContent = medal ? `${MEDAL_ICON[medal]} Hidden Gem` : '💎 Hidden Gem';
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
    const blurbs = document.querySelectorAll('li.work.blurb.group, li.bookmark.blurb.group');
    if (this.compareToPageAverage) {
      this._pageAverageRatio = averageRatio(Array.from(blurbs).map(b => this._getStatsFromBlurb(b)));
    }
    blurbs.forEach(b => this._processBlurb(b));
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
