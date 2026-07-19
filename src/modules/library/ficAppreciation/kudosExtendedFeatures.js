/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Fic Appreciation › Kudos Extended Features

Calculates kudos totals, monthly distribution, and longest streak, and exposes
JSON, CSV, and embeddable HTML representations of those statistics.

Notes

- Kudos Tracker owns the underlying storage and revisit assistance.
- Export filenames include the current local date.
- The HTML summary displays at most the latest six months.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { downloadFile } from '../../../../lib/utils/json-file.js';
import {
  groupCounts, topEntries, hourOfDayHistogram, peakHours,
  filterKudosHistory, sortKudosHistoryByDate,
} from './ficAppreciationHelpers.js';


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

export class KudosExtendedFeatures {
  /** @param {{ storeGet: function }} opts */
  constructor ({ storeGet }) {
    this.storeGet = storeGet;
    this.SK       = 'ficAppreciation:kudosed';
  }

  _load () { return this.storeGet(this.SK, {}); }

  /* ═══════════════════════════════════════════════════════════════════════
     FEATURE — KUDOS STATISTICS
  ═══════════════════════════════════════════════════════════════════════ */

  /**
   * Return a summary object:
   * {
   *   total:  number,
   *   byMonth: { 'YYYY-MM': count },   // sorted ascending
   *   streak: number,                   // longest consecutive-day streak
   *   byFandom: {key, count}[],         // top 10, from entries with fandom metadata
   *   byAuthor: {key, count}[],         // top 10, from entries with author metadata
   * }
   */
  getStats () {
    const map = this._load();
    const entries = Object.values(map);
    const total   = entries.length;

    // By month
    const byMonth = {};
    for (const { date } of entries) {
      if (!date) continue;
      const month = date.slice(0, 7); // 'YYYY-MM'
      byMonth[month] = (byMonth[month] || 0) + 1;
    }
    // Sort ascending
    const byMonthSorted = {};
    for (const k of Object.keys(byMonth).sort()) byMonthSorted[k] = byMonth[k];

    // Longest streak (consecutive calendar days)
    const dates = [...new Set(entries.map(e => e.date).filter(Boolean))].sort();
    let streak = 0, maxStreak = 0, prev = null;
    for (const d of dates) {
      if (prev) {
        const gap = (new Date(d).getTime() - new Date(prev).getTime()) / 86400000;
        streak = gap === 1 ? streak + 1 : 1;
      } else {
        streak = 1;
      }
      if (streak > maxStreak) maxStreak = streak;
      prev = d;
    }

    const byFandom = topEntries(groupCounts(entries, e => e.fandoms || []), 10);
    const byAuthor = topEntries(groupCounts(entries, e => e.author ? [e.author] : []), 10);

    return { total, byMonth: byMonthSorted, streak: maxStreak, byFandom, byAuthor };
  }

  /**
   * Chronological, searchable kudos history.
   * @param {{query?: string, order?: 'asc'|'desc'}} [opts]
   * @returns {{workId: string, date?: string, ts?: number, title?: string, author?: string, fandoms?: string[]}[]}
   */
  getHistory ({ query = '', order = 'desc' } = {}) {
    const map     = this._load();
    const entries = Object.entries(map).map(([workId, v]) => ({ workId, ...v }));
    return sortKudosHistoryByDate(filterKudosHistory(entries, query), order);
  }

  /**
   * Hour-of-day kudos-giving habits, based on entries that carry a `ts`
   * (recorded going forward — pre-existing entries lack timestamp precision).
   * @returns {{hist: number[], counted: number, peak: {hour: number, count: number}[]}|null}
   */
  getTimeHabits () {
    const entries = Object.values(this._load());
    const { hist, counted } = hourOfDayHistogram(entries);
    if (!counted) return null;
    return { hist, counted, peak: peakHours(hist, 3) };
  }

  /* ═══════════════════════════════════════════════════════════════════════
     FEATURE — KUDOS EXPORT
  ═══════════════════════════════════════════════════════════════════════ */

  /**
   * Trigger a file download of the kudos list.
   * @param {'json'|'csv'} format
   */
  exportKudos (format = 'json') {
    const map   = this._load();
    const today = new Date().toLocaleDateString('en-CA');

    let blob, filename;
    if (format === 'csv') {
      const esc  = (s) => String(s ?? '').replace(/,/g, ';');
      const rows = [
        'workId,date,title,author,fandoms',
        ...Object.entries(map).map(([id, v]) =>
          `${id},${v.date || ''},${esc(v.title)},${esc(v.author)},${esc((v.fandoms || []).join('|'))}`
        ),
      ];
      blob     = new Blob([rows.join('\n')], { type: 'text/csv' });
      filename = `ao3h_kudos_${today}.csv`;
    } else {
      const arr = Object.entries(map).map(([workId, v]) => ({ workId, ...v }));
      blob     = new Blob([JSON.stringify(arr, null, 2)], { type: 'application/json' });
      filename = `ao3h_kudos_${today}.json`;
    }

    downloadFile(blob, filename);
  }

  /* ═══════════════════════════════════════════════════════════════════════
     FEATURE — EMBEDDABLE STATISTICS SUMMARY
  ═══════════════════════════════════════════════════════════════════════ */

  /**
   * Returns an HTML string summarising kudos stats.
   * Safe to inject into a panel or tooltip.
   */
  buildStatsHTML () {
    const { total, byMonth, streak, byFandom, byAuthor } = this.getStats();
    const habits = this.getTimeHabits();

    const monthRows = Object.entries(byMonth)
      .slice(-6) // last 6 months
      .map(([m, c]) => `<li><span>${m}</span><span>${c} kudos</span></li>`)
      .join('');

    const fandomRows = byFandom.slice(0, 5)
      .map(({ key, count }) => `<li><span>${key}</span><span>${count}</span></li>`)
      .join('');
    const authorRows = byAuthor.slice(0, 5)
      .map(({ key, count }) => `<li><span>${key}</span><span>${count}</span></li>`)
      .join('');

    const HOURS_12 = ['12am','1am','2am','3am','4am','5am','6am','7am','8am','9am','10am','11am',
      '12pm','1pm','2pm','3pm','4pm','5pm','6pm','7pm','8pm','9pm','10pm','11pm'];
    const peakText = habits?.peak.length
      ? `Most active around ${habits.peak.map(p => HOURS_12[p.hour]).join(', ')}`
      : '';

    return `
      <div class="ao3h-fa-stats">
        <p><strong>${total}</strong> work${total !== 1 ? 's' : ''} kudos'd</p>
        ${streak > 1 ? `<p>Longest streak: <strong>${streak}</strong> days</p>` : ''}
        ${monthRows ? `<ul class="ao3h-fa-stats-months">${monthRows}</ul>` : ''}
        ${fandomRows ? `<p class="ao3h-fa-stats-subhead">Top fandoms</p><ul class="ao3h-fa-stats-months">${fandomRows}</ul>` : ''}
        ${authorRows ? `<p class="ao3h-fa-stats-subhead">Top authors</p><ul class="ao3h-fa-stats-months">${authorRows}</ul>` : ''}
        ${peakText ? `<p>${peakText}</p>` : ''}
      </div>
    `.trim();
  }


  /* ═══════════════════════════════════════════════════════════════════════
     FEATURE LIFECYCLE
  ═══════════════════════════════════════════════════════════════════════ */

  // This analytics helper is stateless and requires no cleanup.
}
