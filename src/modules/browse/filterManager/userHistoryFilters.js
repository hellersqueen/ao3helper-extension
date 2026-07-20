/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Filter Manager › User History Filters

Purpose
    Hides works based on kudos, subscriptions, bookmarks, Later Shelf entries,
    reading history, and fully read series, with an optional hidden-work
    counter that can be peeked at (per category) without disabling filters.

Notes
    Cross-module status is read through each module's real public API/storage
    (AO3H.ficAppreciation, W.AO3H_LaterShelf, W.AO3H_ReadingTracker, and
    bookmarkVault's own storage key — bookmarkVault exposes no runtime API).
    "Fully read series" needs data no module precomputes, so it's resolved
    with a bounded, cached, same-origin fetch of the series page (read-only).
    Processed blurbs are marked to prevent duplicate work during rescans.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { extractWorkIdFromBlurb } from '../../../../lib/ao3/parsers.js';
import { fetchAO3PageText } from '../../../../lib/ao3/requests.js';



/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const SK_SERIES_CACHE  = 'ao3h:filterManager:seriesReadCache';
const SERIES_CACHE_TTL = 24 * 60 * 60 * 1000;
const REASON_LABELS = {
  kudosed:     'kudosed',
  subscribed:  'subscribed',
  bookmarked:  'bookmarked',
  mfl:         'Later Shelf',
  readHistory: 'already read',
  readSeries:  'fully-read series',
};

export class UserHistoryFilters {
  /** @param {{ NS, cfg, W, AO3H, onAsyncUpdate?: () => void, helpers: typeof import('./_filterManager.js').filterManagerHelpers }} opts */
  constructor ({ NS, cfg, W, AO3H, onAsyncUpdate, helpers }) {
    this.NS   = NS;
    this.cfg  = cfg;
    this._W   = W;
    this._AO3H = AO3H;
    this.onAsyncUpdate = onAsyncUpdate;
    this.helpers = helpers;
    this._controller = new AbortController();
    this._pendingSeriesFetches = new Set();
    this._hiddenCountEl = null;
  }


  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — CROSS-MODULE STATUS LOOKUPS
  ═════════════════════════════════════════════════════════════════════════ */

  _isKudosed (workId) { return !!this._AO3H?.ficAppreciation?.hasGivenKudos?.(workId); }

  _isBookmarked (workId) {
    try {
      const data = JSON.parse(localStorage.getItem('ao3h:bookmarkVault:data') || '{}');
      return workId in data;
    } catch { return false; }
  }

  _isInLaterShelf (workId) {
    const items = this._W.AO3H_LaterShelf?.loadItems?.() || [];
    return items.some(item => String(item.wid ?? item) === workId);
  }

  _isRead (workId) {
    const history = this._W.AO3H_ReadingTracker?.getHistory?.() || [];
    return history.some(e => e.id === workId);
  }


  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — FULLY-READ SERIES (bounded, cached, same-origin fetch)
  ═════════════════════════════════════════════════════════════════════════ */

  _loadSeriesCache ()  { try { return JSON.parse(localStorage.getItem(SK_SERIES_CACHE) || '{}'); } catch { return {}; } }
  _saveSeriesCache (c) { try { localStorage.setItem(SK_SERIES_CACHE, JSON.stringify(c)); } catch {} }

  /** Returns true only once a cached, confirmed "fully read" result exists; triggers a fetch otherwise. */
  _seriesFullyRead (seriesId) {
    const cache = this._loadSeriesCache();
    const entry = cache[seriesId];
    if (entry && (Date.now() - entry.checkedAt) < SERIES_CACHE_TTL) return entry.allRead;
    this._fetchSeriesReadState(seriesId);
    return false;
  }

  async _fetchSeriesReadState (seriesId) {
    if (this._pendingSeriesFetches.has(seriesId)) return;
    this._pendingSeriesFetches.add(seriesId);
    try {
      const html = await fetchAO3PageText(`/series/${seriesId}`, { signal: this._controller.signal });
      const tmp  = document.createElement('div');
      tmp.innerHTML = html;
      const workIds = [...tmp.querySelectorAll('li.work.blurb')]
        .map(el => extractWorkIdFromBlurb(el))
        .filter(Boolean);
      const readIds = (this._W.AO3H_ReadingTracker?.getHistory?.() || []).map(e => e.id);
      const allRead = this.helpers.isSeriesFullyRead(workIds, readIds);

      const cache = this._loadSeriesCache();
      cache[seriesId] = { allRead, checkedAt: Date.now() };
      this._saveSeriesCache(cache);
      this._pendingSeriesFetches.delete(seriesId);
      this.onAsyncUpdate?.();
    } catch {
      this._pendingSeriesFetches.delete(seriesId);
    }
  }


  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — HISTORY MATCHING
  ═════════════════════════════════════════════════════════════════════════ */

  _workIdFromBlurb (blurb) {
    return extractWorkIdFromBlurb(blurb);
  }

  _getHiddenReasons (blurb, workId) {
    const reasons = [];
    if (!workId) return reasons;

    if (this.cfg('hideKudosed') && this._isKudosed(workId)) reasons.push('kudosed');

    if (this.cfg('hideSubscribed')) {
      if (blurb.querySelector('[data-method="delete"][href*="/subscriptions/"]')) {
        reasons.push('subscribed');
      }
    }

    if (this.cfg('hideBookmarked') && this._isBookmarked(workId)) reasons.push('bookmarked');
    if (this.cfg('hideMFL') && this._isInLaterShelf(workId)) reasons.push('mfl');
    if (this.cfg('hideRead') && this._isRead(workId)) reasons.push('readHistory');

    if (this.cfg('hideReadSeries')) {
      const seriesEl = blurb.querySelector('ul.series a[href*="/series/"]');
      const seriesId  = seriesEl?.getAttribute('href')?.match(/\/series\/(\d+)/)?.[1];
      if (seriesId && this._seriesFullyRead(seriesId)) reasons.push('readSeries');
    }

    return reasons;
  }


  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — WORK VISIBILITY AND COUNT
  ═════════════════════════════════════════════════════════════════════════ */

  apply (blurbs, hiddenCountEl) {
    const NS   = this.NS;
    const mode = this.cfg('historyFilterMode') === 'dim' ? 'dim' : 'hide';
    const hiddenClass = mode === 'dim' ? `${NS}-fm-history-dimmed` : `${NS}-fm-history-hidden`;
    const otherClass  = mode === 'dim' ? `${NS}-fm-history-hidden` : `${NS}-fm-history-dimmed`;
    this._hiddenCountEl = hiddenCountEl || this._hiddenCountEl;

    /** @type {Record<string, number>} */
    const counts = {};
    let total = 0;

    for (const blurb of blurbs) {
      const workId  = this._workIdFromBlurb(blurb);
      const reasons = this._getHiddenReasons(blurb, workId);

      blurb.classList.remove(otherClass);
      if (reasons.length > 0) {
        blurb.dataset.fmHidden = `,${reasons.join(',')},`;
        blurb.classList.add(hiddenClass);
        total++;
        for (const r of reasons) counts[r] = (counts[r] || 0) + 1;
      } else {
        blurb.removeAttribute('data-fm-hidden');
        blurb.classList.remove(hiddenClass);
      }
      blurb.dataset.fmHistory = '1';
    }

    this._renderCount(total, counts);
  }

  _renderCount (total, counts) {
    const NS = this.NS;
    const el = this._hiddenCountEl;
    if (!el) return;

    if (!this.cfg('showHiddenCount') || total === 0) {
      el.hidden = true;
      el.innerHTML = '';
      return;
    }

    el.hidden = false;
    el.innerHTML = '';
    el.appendChild(document.createTextNode(`${total} work${total !== 1 ? 's' : ''} hidden by history filters `));

    for (const [reason, count] of Object.entries(counts)) {
      const peekBtn = document.createElement('button');
      peekBtn.type      = 'button';
      peekBtn.className = `${NS}-fm-peek-btn`;
      const active = document.documentElement.classList.contains(`${NS}-fm-peek-${reason}`);
      peekBtn.textContent = `(${count} ${REASON_LABELS[reason] || reason} ${active ? '🙈' : '👁'})`;
      peekBtn.title = active ? 'Hide again' : 'Temporarily show these';
      peekBtn.addEventListener('click', () => {
        document.documentElement.classList.toggle(`${NS}-fm-peek-${reason}`);
        this._renderCount(total, counts);
      });
      el.appendChild(document.createTextNode(' '));
      el.appendChild(peekBtn);
    }
  }


  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE LIFECYCLE
  ═════════════════════════════════════════════════════════════════════════ */

  cleanup () {
    const NS = this.NS;
    this._controller.abort();
    document.querySelectorAll(`.${NS}-fm-history-hidden, .${NS}-fm-history-dimmed`).forEach(el => {
      el.classList.remove(`${NS}-fm-history-hidden`, `${NS}-fm-history-dimmed`);
      el.removeAttribute('data-fm-hidden');
    });
    document.querySelectorAll('[data-fm-history]').forEach(el => {
      delete el.dataset.fmHistory;
    });
    document.documentElement.className = document.documentElement.className
      .split(' ').filter(c => !c.startsWith(`${NS}-fm-peek-`)).join(' ');
    this._hiddenCountEl = null;
  }
}
