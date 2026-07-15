/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - User History Filters Submodule
    Submodule ID: userHistoryFilters
    Parent Module: filterManager

    - Feature: History-based work hiding
      - Option: Hide works I have kudosed (hideKudosed) — reads ficAppreciation kudosTracker API
      - Option: Hide works I am subscribed to (hideSubscribed) — detects AO3 native subscription delete button
      - Option: Hide bookmarked works (hideBookmarked) — reads bookmarkVault API
      - Option: Hide works in Marked for Later (hideMFL) — reads laterShelf API
      - Option: Hide works belonging to a fully-read series (hideReadSeries) — reads readingTracker API
      - Option: Guard against re-processing blurbs (data-fm-history marker)

    - Feature: Hidden count display
      - Option: Shows "N works hidden by history filters" above the listing (showHiddenCount)
      - Option: Hides the counter when count is zero

    - Feature: Cleanup
      - Option: Removes hidden class and all data markers from all processed blurbs

    Dependencies injected via constructor: NS, cfg, W, AO3H
    Note: W/AO3H sont injectes par _filterManager (qui importe AO3H du core depuis
    l'etape 318). Les lectures window.AO3H_Modules.* et modules.getService restent
    des no-op herites du legacy (E3, jamais poses nulle part) — fallbacks DOM/service
    utilises, comportement identique. Documente etapes 307/318 ; hors scope migration.

═══════════════════════════════════════════════════════════════════════════ */

import { extractWorkIdFromBlurb } from '../../../../lib/ao3/parsers.js';

export class UserHistoryFilters {
  constructor ({ NS, cfg, W, AO3H }) {
    this.NS   = NS;
    this.cfg  = cfg;
    this._W   = W;
    this._AO3H = AO3H;
  }

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
