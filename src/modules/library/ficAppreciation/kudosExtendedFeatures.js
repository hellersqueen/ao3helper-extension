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
   *   streak: number                    // longest consecutive-day streak
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

    return { total, byMonth: byMonthSorted, streak: maxStreak };
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
      const rows = ['workId,date', ...Object.entries(map).map(([id, v]) => `${id},${v.date || ''}`)];
      blob     = new Blob([rows.join('\n')], { type: 'text/csv' });
      filename = `ao3h_kudos_${today}.csv`;
    } else {
      const arr = Object.entries(map).map(([workId, v]) => ({ workId, date: v.date || '' }));
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
    const { total, byMonth, streak } = this.getStats();

    const monthRows = Object.entries(byMonth)
      .slice(-6) // last 6 months
      .map(([m, c]) => `<li><span>${m}</span><span>${c} kudos</span></li>`)
      .join('');

    return `
      <div class="ao3h-fa-stats">
        <p><strong>${total}</strong> work${total !== 1 ? 's' : ''} kudos'd</p>
        ${streak > 1 ? `<p>Longest streak: <strong>${streak}</strong> days</p>` : ''}
        ${monthRows ? `<ul class="ao3h-fa-stats-months">${monthRows}</ul>` : ''}
      </div>
    `.trim();
  }


  /* ═══════════════════════════════════════════════════════════════════════
     FEATURE LIFECYCLE
  ═══════════════════════════════════════════════════════════════════════ */

  // This analytics helper is stateless and requires no cleanup.
}
