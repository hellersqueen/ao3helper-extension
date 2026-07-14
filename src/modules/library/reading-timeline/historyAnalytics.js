/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper — Reading Timeline › HistoryAnalytics sub-module
    Loads reading history from readingTracker API / localStorage,
    transforms it into a date-keyed heatmap structure,
    and computes stats (total, busiest day, top fandoms, streak).

═══════════════════════════════════════════════════════════════════════════ */

import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { downloadJSON } from '../../../../lib/utils/json-file.js';

const W = getGlobalWindow();

export class HistoryAnalytics {
  constructor () {
    this.heatmapData = {};
    this._originalBackgrounds = new Map();
    this._originalDisplays = new Map();
  }

  getDateKey (date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  /** Load history from readingTracker API or localStorage fallback.
   *  Returns the heatmapData object { [YYYY-MM-DD]: work[] } */
  loadReadingHistory () {
    const rtAPI = W.AO3H_ReadingTracker;
    let history = rtAPI?.getHistory?.() || [];

    if (!history.length) {
      try {
        const raw = localStorage.getItem('ao3h:readingHistory:data');
        if (raw) history = JSON.parse(raw) || [];
      } catch { /* */ }
    }

    this.heatmapData = {};
    history.forEach(entry => {
      const date = new Date(entry.timestamp || entry.readDate);
      if (isNaN(date.getTime())) return;
      const dateKey = this.getDateKey(date);
      if (!this.heatmapData[dateKey]) this.heatmapData[dateKey] = [];
      this.heatmapData[dateKey].push({
        workId:       entry.workId,
        title:        entry.title       || 'Untitled',
        author:       entry.author      || 'Anonymous',
        fandom:       entry.fandom      || 'Unknown',
        rating:       entry.rating      || 'Not Rated',
        wordCount:    entry.wordCount   || 0,
        chaptersRead: entry.chaptersRead || 1,
        completed:    entry.completed   || false,
        tags:         entry.tags        || [],
      });
    });

    return this.heatmapData;
  }

  /** Compute aggregate stats from the current heatmapData. */
  getStats () {
    const data = this.heatmapData;
    let totalReads = 0;
    let busiestDay = null;
    let busiestCount = 0;
    const fandomCounts = {};
    const dateCounts   = {};

    Object.entries(data).forEach(([date, works]) => {
      totalReads += works.length;
      dateCounts[date] = works.length;
      if (works.length > busiestCount) {
        busiestCount = works.length;
        busiestDay   = date;
      }
      works.forEach(w => {
        fandomCounts[w.fandom] = (fandomCounts[w.fandom] || 0) + 1;
      });
    });

    const topFandoms = Object.entries(fandomCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    // Consecutive-day streak ending today
    let streak = 0;
    let cur    = new Date();
    while (true) {
      const key = this.getDateKey(cur);
      if (!dateCounts[key]) break;
      streak++;
      cur.setDate(cur.getDate() - 1);
    }

    return { totalReads, busiestDay, busiestCount, topFandoms, streak };
  }

  /** Build a lookup map: workId (string) → { dates: string[], count: number }
   *  from the current heatmapData. */
  buildWorkLookup () {
    const lookup = {};
    Object.entries(this.heatmapData).forEach(([dateKey, works]) => {
      works.forEach(w => {
        const id = String(w.workId);
        if (!lookup[id]) lookup[id] = { dates: [], count: 0 };
        lookup[id].dates.push(dateKey);
        lookup[id].count++;
      });
    });
    return lookup;
  }

  /** Return a pale tinted CSS background color based on days since lastDateKey. */
  _recencyColor (lastDateKey) {
    const days = (Date.now() - new Date(lastDateKey).getTime()) / 86_400_000;
    if (days <= 1)   return 'rgba(64,196,99,0.18)';
    if (days <= 7)   return 'rgba(64,196,99,0.12)';
    if (days <= 30)  return 'rgba(44,95,138,0.10)';
    if (days <= 365) return 'rgba(44,95,138,0.07)';
    return 'rgba(0,0,0,0.04)';
  }

  /** Highlight already-read works on any listing page.
   *  @param {{ highlight: boolean, hide: boolean }} opts */
  highlightReadWorksOnPage ({ highlight = true, hide = false } = {}) {
    if (!highlight && !hide) return;

    const lookup = this.buildWorkLookup();

    document.querySelectorAll('li.work.blurb').forEach(blurb => {
      const link = blurb.querySelector('h4.heading a[href^="/works/"]');
      if (!link) return;

      const m      = link.getAttribute('href').match(/\/works\/(\d+)/);
      const workId = m ? String(m[1]) : '';
      if (!workId || !lookup[workId]) return;

      const info     = lookup[workId];
      const lastDate = info.dates.slice().sort().at(-1);

      if (hide) {
        if (!this._originalDisplays.has(blurb)) {
          this._originalDisplays.set(blurb, blurb.style.display);
        }
        blurb.style.display = 'none';
        blurb.dataset.ao3hReadingTimelineHidden = '1';
        return;
      }

      // Recency background + left border
      if (!this._originalBackgrounds.has(blurb)) {
        this._originalBackgrounds.set(blurb, blurb.style.backgroundColor);
      }
      blurb.classList.add('ao3h-rt-read-blurb');
      blurb.style.backgroundColor = this._recencyColor(lastDate);

      // Badge (idempotent)
      if (!blurb.querySelector('.ao3h-read-badge')) {
        const badge       = document.createElement('span');
        badge.className   = 'ao3h-read-badge';
        badge.title       = info.count > 1
          ? `Read ${info.count}× — last read ${lastDate}`
          : `Read on ${lastDate}`;
        badge.textContent = info.count > 1 ? `📚 Read ${info.count}×` : '📚 Read';
        link.insertAdjacentElement('afterend', badge);
      }
    });
  }

  cleanupDom () {
    document.querySelectorAll('.ao3h-read-badge').forEach(el => el.remove());
    this._originalBackgrounds.forEach((background, blurb) => {
      blurb.classList.remove('ao3h-rt-read-blurb');
      blurb.style.backgroundColor = background;
    });
    this._originalBackgrounds.clear();

    this._originalDisplays.forEach((display, blurb) => {
      blurb.style.display = display;
      delete blurb.dataset.ao3hReadingTimelineHidden;
    });
    this._originalDisplays.clear();

    document.querySelectorAll('.ao3h-session-divider').forEach(el => el.remove());
  }

  /** Insert time-period section dividers on AO3's native history/readings page
   *  (/users/ * /readings). */
  insertSessionDividers () {
    const items = Array.from(
      document.querySelectorAll('#main ol.reading.work li.reading.work, ol.index.group li.work.blurb')
    );
    if (!items.length) return;

    const today     = new Date(); today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    const lastWeek  = new Date(today); lastWeek.setDate(today.getDate() - 7);
    const lastMonth = new Date(today); lastMonth.setMonth(today.getMonth() - 1);

    const getLabel = d => {
      if (d >= today)     return 'Today';
      if (d >= yesterday) return 'Yesterday';
      if (d >= lastWeek)  return 'Last 7 Days';
      if (d >= lastMonth) return 'Last Month';
      return 'Earlier';
    };

    let lastLabel = null;
    items.forEach(item => {
      // Try the AO3 readings page timestamp element first, then heatmapData
      const dateEl  = item.querySelector('[datetime]') || item.querySelector('p.datetime');
      const rawDate = dateEl?.getAttribute('datetime') || dateEl?.textContent?.trim();
      const date    = rawDate ? new Date(rawDate) : null;
      if (!date || isNaN(date.getTime())) return;

      date.setHours(0, 0, 0, 0);
      const label = getLabel(date);
      if (label === lastLabel) return;

      lastLabel = label;
      const divider       = document.createElement('li');
      divider.className   = 'ao3h-session-divider';
      divider.setAttribute('aria-hidden', 'true');
      divider.textContent = label;
      item.parentElement.insertBefore(divider, item);
    });
  }

  exportJSON () {
    downloadJSON(this.heatmapData, `ao3-timeline-${new Date().toISOString().split('T')[0]}.json`);
  }
}
