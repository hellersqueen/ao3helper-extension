/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Filter Manager › User History Filters

Purpose
    Hides works based on kudos, subscriptions, bookmarks, Later Shelf entries,
    and fully read series, with an optional hidden-work counter.

Notes
    Cross-module status is read through injected AO3 Helper bridges; native AO3
    subscription controls provide the subscription fallback. Processed blurbs
    are marked to prevent duplicate work during rescans.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { extractWorkIdFromBlurb } from '../../../../lib/ao3/parsers.js';



/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

export class UserHistoryFilters {
  constructor ({ NS, cfg, W, AO3H }) {
    this.NS   = NS;
    this.cfg  = cfg;
    this._W   = W;
    this._AO3H = AO3H;
  }


  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — HISTORY MATCHING
  ═════════════════════════════════════════════════════════════════════════ */

  _workIdFromBlurb (blurb) {
    return extractWorkIdFromBlurb(blurb);
  }

  _getHiddenReasons (blurb, workId) {
    const W    = this._W;
    const AO3H = this._AO3H;
    const reasons = [];
    if (!workId) return reasons;

    if (this.cfg('hideKudosed')) {
      const kudosApi = W.AO3H_Modules?.ficAppreciation?.kudosTracker
                    || AO3H.modules?.getService?.('kudosHistory');
      if (kudosApi?.has?.(workId) || kudosApi?.hasGivenKudos?.(workId)) {
        reasons.push('kudosed');
      }
    }

    if (this.cfg('hideSubscribed')) {
      if (blurb.querySelector('[data-method="delete"][href*="/subscriptions/"]')) {
        reasons.push('subscribed');
      }
    }

    if (this.cfg('hideBookmarked')) {
      const bvApi = W.AO3H_Modules?.bookmarkVault;
      if (bvApi?.isBookmarked?.(workId)) reasons.push('bookmarked');
    }

    if (this.cfg('hideMFL')) {
      const lsApi = W.AO3H_Modules?.laterShelf;
      if (lsApi?.isMarkedForLater?.(workId)) reasons.push('mfl');
    }

    if (this.cfg('hideReadSeries')) {
      const rtApi = W.AO3H_Modules?.readingTracker;
      const seriesEl = blurb.querySelector('ul.series a[href*="/series/"]');
      if (seriesEl && rtApi?.isSeriesRead?.(seriesEl.getAttribute('href'))) {
        reasons.push('readSeries');
      }
    }

    return reasons;
  }


  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — WORK VISIBILITY AND COUNT
  ═════════════════════════════════════════════════════════════════════════ */

  apply (blurbs, hiddenCountEl) {
    const NS = this.NS;
    let count = 0;

    for (const blurb of blurbs) {
      if (blurb.dataset.fmHistory) continue;
      blurb.dataset.fmHistory = '1';

      const workId  = this._workIdFromBlurb(blurb);
      const reasons = this._getHiddenReasons(blurb, workId);

      if (reasons.length > 0) {
        blurb.dataset.fmHidden = reasons.join(',');
        blurb.classList.add(`${NS}-fm-history-hidden`);
        count++;
      } else {
        blurb.removeAttribute('data-fm-hidden');
        blurb.classList.remove(`${NS}-fm-history-hidden`);
      }
    }

    if (hiddenCountEl) {
      if (this.cfg('showHiddenCount') && count > 0) {
        hiddenCountEl.textContent =
          `${count} work${count !== 1 ? 's' : ''} hidden by history filters`;
        hiddenCountEl.hidden = false;
      } else {
        hiddenCountEl.hidden = true;
      }
    }
  }


  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE LIFECYCLE
  ═════════════════════════════════════════════════════════════════════════ */

  cleanup () {
    const NS = this.NS;
    document.querySelectorAll(`.${NS}-fm-history-hidden`).forEach(el => {
      el.classList.remove(`${NS}-fm-history-hidden`);
      el.removeAttribute('data-fm-hidden');
    });
    document.querySelectorAll('[data-fm-history]').forEach(el => {
      delete el.dataset.fmHistory;
    });
  }
}
