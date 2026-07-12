// ── SeenTracking ─────────────────────────────────────────────────────────
// Submodule of: readingTracker — work visit recording + updated-since badges
//
// Features:
//   - Record work visits in history (recordVisit, parseWorkMeta, parseWorkId)
//   - "Updated since last visit" badge on listing blurbs
//       Color-coded by recency: recent (<7d) / medium (<30d) / old (>=30d)
//   - "Only show updated works" filter mode (cfg: updatedOnlyMode)
//   - Count notification: "X works updated since your last visit"

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

  // ── Work ID / metadata parsing ────────────────────────────────────────

  parseWorkId () {
    return location.pathname.match(/\/works\/(\d+)/)?.[1] || null;
  }

  parseWorkMeta () {
    const title  = document.querySelector('h2.title')?.textContent.trim() || '';
    const author = document.querySelector('h3.byline a')?.textContent.trim() || '';
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
      title, author, chapter, chapterId, totalChapters,
      href:        location.pathname,
      chapterHref: chapterId && workId ? `/works/${workId}/chapters/${chapterId}` : null,
    };
  }

  // ── Record a work visit ────────────────────────────────────────────────

  recordVisit (workId, meta) {
    const { getHistory, saveHistory } = this;
    const history  = getHistory();
    const existing = history.findIndex(e => e.id === workId);
    const entry    = {
      id:            workId,
      title:         meta.title         || '',
      author:        meta.author        || '',
      href:          meta.href          || location.pathname,
      seenAt:        existing >= 0 ? history[existing].seenAt : Date.now(),
      lastReadAt:    Date.now(),
      chapter:       meta.chapter       || null,
      chapterId:     meta.chapterId     || null,
      chapterHref:   meta.chapterHref   || null,
      totalChapters: meta.totalChapters || null,
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
    });
    saveHistory(history);
  }

  // ── Updated-since badges ───────────────────────────────────────────────

  /** Parse the update timestamp from an AO3 blurb element. */
  _getBlurbUpdatedAt (blurb) {
    // AO3 uses <abbr class="day datetime" title="YYYY-MM-DD"> inside the stats block
    const abbr = blurb.querySelector('abbr.datetime[title], p.datetime abbr[title]');
    if (abbr) {
      const d = new Date(abbr.title);
      if (!isNaN(d)) return d.getTime();
    }
    // Fallback: plain text in <p class="datetime">
    const dt = blurb.querySelector('p.datetime');
    if (dt) {
      const d = new Date(dt.textContent.trim());
      if (!isNaN(d)) return d.getTime();
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
      const recency     = this._recencyClass(updatedAt);
      const label       = relativeTime(updatedAt);
      const badge       = document.createElement('span');
      badge.className   = `${_BADGE_CLS} ${_BADGE_CLS}--${recency}`;
      badge.textContent = `\u{1F195} Updated ${label}`;
      badge.title       = 'This work was updated since your last visit';
      const heading = blurb.querySelector('h4.heading');
      if (heading) heading.appendChild(badge);
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

  setup ()    { this.applyUpdatedBadges(); }
  teardown () { this.removeUpdatedBadges(); }
}
