/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Reading Tracker › Seen Tracking

Records work visits and identifies listing works that have been updated since
the reader's prior visit.

Notes

- Update badges use recent, medium, and old recency categories.
- Updated-only mode temporarily hides unchanged works and restores them later.
- Visit records preserve the first-seen timestamp while refreshing read metadata.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { appendHeadingBadge } from '../../../../lib/ui/badges.js';
import { extractWorkIdFromHref } from '../../../../lib/ao3/parsers.js';
import { nextVisitCount, formatUpdatedLabel } from './readingTrackerHelpers.js';

const SK_EXCLUDED = 'ao3h:rt:excludedWorks';

function loadExcluded () {
  try { return new Set(JSON.parse(localStorage.getItem(SK_EXCLUDED) || '[]')); }
  catch { return new Set(); }
}

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

// Tracking state is stored on each helper instance.

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — WORK-VISIT HISTORY
═══════════════════════════════════════════════════════════════════════════ */

export class SeenTracking {
  /** @param {{ NS, cfg, getHistory, saveHistory, relativeTime }} opts */
  constructor ({ NS, cfg, getHistory, saveHistory, relativeTime }) {
    this.NS           = NS;
    this.cfg          = cfg;
    this.getHistory   = getHistory;
    this.saveHistory  = saveHistory;
    this.relativeTime = relativeTime;
    this._BADGE_CLS   = `${NS}-updated-badge`;
    this._COUNTER_ID  = `${NS}-updated-counter`;
    this._originalDisplays = new Map();
  }

  parseWorkId () {
    return extractWorkIdFromHref(location.pathname);
  }

  parseWorkMeta () {
    const title  = document.querySelector('h2.title')?.textContent.trim() || '';
    const author = document.querySelector('h3.byline a')?.textContent.trim() || '';
    const fandoms = [...document.querySelectorAll('dd.fandom.tags a')].map(a => a.textContent.trim());
    const chapDd    = document.querySelector('dd.chapters');
    const chapText  = chapDd?.textContent.trim() || '';
    const chapMatch = chapText.match(/^(\d+)\/(\d+|\?)$/);
    const chapter       = chapMatch ? parseInt(chapMatch[1], 10) : 1;
    const totalChapters = chapMatch && chapMatch[2] !== '?' ? parseInt(chapMatch[2], 10) : null;
    const select    = document.querySelector('select#selected_id');
    const selOpt    = select?.querySelector('option[selected]');
    const chapterId = selOpt?.value || null;
    const workId    = this.parseWorkId();
    return {
      title, author, fandoms, chapter, chapterId, totalChapters,
      href:        location.pathname,
      chapterHref: chapterId && workId ? `/works/${workId}/chapters/${chapterId}` : null,
    };
  }

  /** True if this work — or a fandom it belongs to — is on the "never track" exclusion list. */
  isExcluded (workId, fandoms = []) {
    const excluded = loadExcluded();
    if (excluded.has(workId)) return true;
    return fandoms.some(f => excluded.has(`fandom:${f}`));
  }

  /** Adds a workId to the "never track in history" list (used by the privacy toggle). */
  excludeWork (workId) {
    const excluded = loadExcluded();
    excluded.add(workId);
    try { localStorage.setItem(SK_EXCLUDED, JSON.stringify([...excluded])); } catch {}
  }

  includeWork (workId) {
    const excluded = loadExcluded();
    excluded.delete(workId);
    try { localStorage.setItem(SK_EXCLUDED, JSON.stringify([...excluded])); } catch {}
  }

  recordVisit (workId, meta) {
    if (this.isExcluded(workId, meta.fandoms)) return;
    const { getHistory, saveHistory } = this;
    const history  = getHistory();
    const existing = history.findIndex(e => e.id === workId);
    const prev     = existing >= 0 ? history[existing] : null;
    const entry    = {
      id:            workId,
      title:         meta.title         || '',
      author:        meta.author        || '',
      href:          meta.href          || location.pathname,
      seenAt:        prev ? prev.seenAt : Date.now(),
      lastReadAt:    Date.now(),
      chapter:       meta.chapter       || null,
      chapterId:     meta.chapterId     || null,
      chapterHref:   meta.chapterHref   || null,
      totalChapters: meta.totalChapters || null,
      visitCount:    nextVisitCount(prev),
      // Carried forward from the history browser (pin/note) — recordVisit
      // must never silently wipe them out on the next page load.
      ...(prev?.pinned ? { pinned: prev.pinned } : {}),
      ...(prev?.note ? { note: prev.note } : {}),
    };
    if (existing >= 0) history.splice(existing, 1);
    history.push(entry);
    saveHistory(history);
  }

  markSeen (workId) {
    const { getHistory, saveHistory } = this;
    const history = getHistory();
    if (history.find(e => e.id === workId)) return;
    history.push({
      id: workId, seenAt: Date.now(), lastReadAt: Date.now(),
      title: '', author: '', href: `/works/${workId}`,
      chapter: null, chapterId: null, chapterHref: null, totalChapters: null,
      visitCount: 1,
    });
    saveHistory(history);
  }

  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — UPDATED-SINCE MARKERS
  ═════════════════════════════════════════════════════════════════════════ */

  /** Parse the update timestamp from an AO3 blurb element. */
  _getBlurbUpdatedAt (blurb) {
    // AO3 uses <abbr class="day datetime" title="YYYY-MM-DD"> inside the stats block
    const abbr = blurb.querySelector('abbr.datetime[title], p.datetime abbr[title]');
    if (abbr) {
      const d = new Date(abbr.title);
      if (!isNaN(d.getTime())) return d.getTime();
    }
    // Fallback: plain text in <p class="datetime">
    const dt = blurb.querySelector('p.datetime');
    if (dt) {
      const d = new Date(dt.textContent.trim());
      if (!isNaN(d.getTime())) return d.getTime();
    }
    return null;
  }

  /** Returns 'recent' (<7d), 'medium' (<30d), or 'old' (>=30d). */
  _recencyClass (updatedAt) {
    const days = (Date.now() - updatedAt) / 86400000;
    if (days < 7)  return 'recent';
    if (days < 30) return 'medium';
    return 'old';
  }

  applyUpdatedBadges () {
    const { NS, cfg, getHistory, relativeTime, _BADGE_CLS } = this;
    if (!cfg('updatedBadge')) return;

    const history     = getHistory();
    const seenMap     = new Map(history.map(e => [e.id, e.seenAt]));
    const onlyUpdated = cfg('updatedOnlyMode');
    let updatedCount  = 0;

    document.querySelectorAll('li.work.blurb, div.work.blurb').forEach(blurb => {
      const m = (blurb.id || '').match(/^work_(\d+)$/);
      if (!m) return;
      const workId    = m[1];
      const seenAt    = seenMap.get(workId);
      if (!seenAt) return;

      const updatedAt = this._getBlurbUpdatedAt(blurb);
      const isUpdated = updatedAt && updatedAt > seenAt;

      if (onlyUpdated && !isUpdated) {
        if (!this._originalDisplays.has(blurb)) this._originalDisplays.set(blurb, blurb.style.display);
        blurb.style.display = 'none';
        return;
      }

      if (!isUpdated) return;
      if (blurb.querySelector(`.${_BADGE_CLS}`)) return;

      updatedCount++;
      const recency = this._recencyClass(updatedAt);
      const label   = formatUpdatedLabel(updatedAt, this.cfg('updatedDateFormat') || 'relative', relativeTime);
      appendHeadingBadge(blurb, {
        className: `${_BADGE_CLS} ${_BADGE_CLS}--${recency}`,
        guardSelector: `.${_BADGE_CLS}`,
        text: `\u{1F195} Updated ${label}`,
        title: 'This work was updated since your last visit',
      });
    });

    if (updatedCount > 0) this._injectUpdatedCounter(updatedCount);
  }

  _injectUpdatedCounter (count) {
    const { NS, _COUNTER_ID } = this;
    if (document.getElementById(_COUNTER_ID)) return;
    const main = document.getElementById('main');
    if (!main) return;
    const bar       = document.createElement('p');
    bar.id          = _COUNTER_ID;
    bar.className   = `${NS}-updated-counter`;
    bar.textContent = `${count} work${count !== 1 ? 's' : ''} updated since your last visit`;
    main.insertAdjacentElement('afterbegin', bar);
  }

  removeUpdatedBadges () {
    const { _BADGE_CLS, _COUNTER_ID } = this;
    document.querySelectorAll(`.${_BADGE_CLS}`).forEach(el => el.remove());
    document.getElementById(_COUNTER_ID)?.remove();
    // Restore any blurbs hidden by updatedOnlyMode
    this._originalDisplays.forEach((display, blurb) => { blurb.style.display = display; });
    this._originalDisplays.clear();
  }

  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE LIFECYCLE
  ═════════════════════════════════════════════════════════════════════════ */

  setup ()    { this.applyUpdatedBadges(); }
  teardown () { this.removeUpdatedBadges(); }
}
