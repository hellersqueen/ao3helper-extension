/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Activity Panel › Helpers

Pure logic shared across Activity Panel submodules: period filtering, tag
clouds, day×hour heatmaps, reread/intensive-session detection, abandon-point
estimation, period-over-period comparison, tag-trend detection, category/
quarter grouping, reader-profile derivation, and recap text. No DOM or
storage access — everything here takes plain session/stat arrays in and
returns plain data out.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   PERIOD FILTERING
═══════════════════════════════════════════════════════════════════════════ */

const PERIOD_DAYS = { today: 1, week: 7, month: 30, year: 365 };

/**
 * @template {{startedAt?: number}} T
 * @param {T[]} sessions
 * @param {'today'|'week'|'month'|'year'|'all'} period
 * @returns {T[]}
 */
export function filterSessionsByPeriod (sessions, period) {
  if (!period || period === 'all') return sessions;
  if (period === 'today') {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const cutoff = startOfDay.getTime();
    return sessions.filter(s => s.startedAt && s.startedAt >= cutoff);
  }
  const days = PERIOD_DAYS[period];
  if (!days) return sessions;
  const cutoff = Date.now() - days * 86400000;
  return sessions.filter(s => s.startedAt && s.startedAt >= cutoff);
}


/* ═══════════════════════════════════════════════════════════════════════════
   TAG CLOUD
═══════════════════════════════════════════════════════════════════════════ */

/**
 * @param {{name: string, count: number}[]} topTags
 * @param {{minSize?: number, maxSize?: number}} [opts]
 * @returns {{name: string, count: number, size: number}[]}
 */
export function buildTagCloud (topTags, { minSize = 12, maxSize = 32 } = {}) {
  if (!topTags.length) return [];
  const counts = topTags.map(t => t.count);
  const max = Math.max(...counts);
  const min = Math.min(...counts);
  return topTags.map(t => {
    const ratio = max === min ? 1 : (t.count - min) / (max - min);
    return { ...t, size: Math.round(minSize + ratio * (maxSize - minSize)) };
  });
}


/* ═══════════════════════════════════════════════════════════════════════════
   DAY × HOUR HEATMAP
═══════════════════════════════════════════════════════════════════════════ */

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** @param {{startedAt?: number}[]} sessions @returns {number[][]} 7×24 grid, [day][hour] */
export function dayHourHeatmap (sessions) {
  const grid = Array.from({ length: 7 }, () => Array(24).fill(0));
  for (const s of sessions) {
    if (!s.startedAt) continue;
    const d = new Date(s.startedAt);
    grid[d.getDay()][d.getHours()]++;
  }
  return grid;
}

/** @param {number[][]} grid @returns {{day: number, hour: number, count: number}|null} */
export function bestReadingSlot (grid) {
  let best = { day: 0, hour: 0, count: 0 };
  grid.forEach((row, day) => row.forEach((count, hour) => {
    if (count > best.count) best = { day, hour, count };
  }));
  return best.count > 0 ? best : null;
}

/** @param {{day: number, hour: number}|null} slot @returns {string|null} */
export function formatSlotLabel (slot) {
  if (!slot) return null;
  return `${DAY_NAMES[slot.day]}s around ${String(slot.hour).padStart(2, '0')}:00`;
}


/* ═══════════════════════════════════════════════════════════════════════════
   REREADS AND INTENSIVE SESSIONS
═══════════════════════════════════════════════════════════════════════════ */

/**
 * @param {{workId?: string, title?: string}[]} sessions
 * @returns {{workId: string, title: string, count: number}[]} sorted, count > 1 only
 */
export function detectRereads (sessions) {
  /** @type {Record<string, {workId: string, title: string, count: number}>} */
  const byWork = {};
  for (const s of sessions) {
    if (!s.workId) continue;
    if (!byWork[s.workId]) byWork[s.workId] = { workId: s.workId, title: s.title || s.workId, count: 0 };
    byWork[s.workId].count++;
  }
  return Object.values(byWork).filter(w => w.count > 1).sort((a, b) => b.count - a.count);
}

/**
 * Sessions with page views well above the user's own average (a proxy for
 * an intense, single-sitting reading binge).
 * @param {{pageViews?: number}[]} sessions
 * @param {number} [multiplier]
 * @returns {typeof sessions}
 */
export function detectIntensiveSessions (sessions, multiplier = 2) {
  if (!sessions.length) return [];
  const avg = sessions.reduce((a, s) => a + (s.pageViews || 0), 0) / sessions.length;
  if (!avg) return [];
  return sessions.filter(s => (s.pageViews || 0) >= avg * multiplier);
}


/* ═══════════════════════════════════════════════════════════════════════════
   ABANDON-POINT ESTIMATE
═══════════════════════════════════════════════════════════════════════════ */

/**
 * Average page views reached on works never marked finished — a rough proxy
 * for "how far you usually get before setting a fic aside."
 * @param {{workId?: string, pageViews?: number}[]} sessions
 * @param {(workId: string) => boolean} isFinished
 * @returns {number|null}
 */
export function estimateAbandonPoint (sessions, isFinished) {
  const unfinished = sessions.filter(s => s.workId && !isFinished(s.workId));
  if (!unfinished.length) return null;
  const avg = unfinished.reduce((a, s) => a + (s.pageViews || 0), 0) / unfinished.length;
  return Math.round(avg * 10) / 10;
}


/* ═══════════════════════════════════════════════════════════════════════════
   PERIOD-OVER-PERIOD COMPARISON
═══════════════════════════════════════════════════════════════════════════ */

/**
 * @param {{startedAt?: number, workId?: string, words?: number}[]} sessions
 * @param {'month'|'year'} unit
 * @param {Date} [now]
 * @returns {{current: {works: number, words: number}, previous: {works: number, words: number}, deltaPct: number|null}}
 */
export function compareByPeriod (sessions, unit, now = new Date()) {
  const key = (ts) => {
    const d = new Date(ts);
    return unit === 'month' ? `${d.getFullYear()}-${d.getMonth()}` : `${d.getFullYear()}`;
  };
  const curKey = key(now.getTime());
  const prevDate = new Date(now);
  if (unit === 'month') prevDate.setMonth(prevDate.getMonth() - 1);
  else prevDate.setFullYear(prevDate.getFullYear() - 1);
  const prevKey = key(prevDate.getTime());

  const bucket = (k) => sessions.filter(s => s.startedAt && key(s.startedAt) === k);
  const summarize = (arr) => ({
    works: new Set(arr.map(s => s.workId).filter(Boolean)).size,
    words: arr.reduce((a, s) => a + (s.words || 0), 0),
  });

  const current  = summarize(bucket(curKey));
  const previous = summarize(bucket(prevKey));
  const deltaPct = previous.works ? Math.round(((current.works - previous.works) / previous.works) * 100) : null;

  return { current, previous, deltaPct };
}


/* ═══════════════════════════════════════════════════════════════════════════
   TAG TREND DETECTION
═══════════════════════════════════════════════════════════════════════════ */

/**
 * Tags read more often in the recent window than the equal-length window before it.
 * @param {{startedAt?: number, tags?: string[]}[]} sessions
 * @param {number} [days]
 * @param {number} [now]
 * @returns {{tag: string, count: number, priorCount: number}[]}
 */
export function detectTagTrend (sessions, days = 30, now = Date.now()) {
  const recent = sessions.filter(s => s.startedAt && now - s.startedAt < days * 86400000);
  const prior  = sessions.filter(s =>
    s.startedAt && now - s.startedAt >= days * 86400000 && now - s.startedAt < days * 2 * 86400000
  );
  const countTags = (arr) => {
    /** @type {Record<string, number>} */
    const m = {};
    arr.forEach(s => (s.tags || []).forEach(t => { m[t] = (m[t] || 0) + 1; }));
    return m;
  };
  const recentCounts = countTags(recent);
  const priorCounts  = countTags(prior);

  return Object.entries(recentCounts)
    .map(([tag, count]) => ({ tag, count, priorCount: priorCounts[tag] || 0 }))
    .filter(t => t.count > t.priorCount && t.count >= 2)
    .sort((a, b) => (b.count - b.priorCount) - (a.count - a.priorCount))
    .slice(0, 5);
}


/* ═══════════════════════════════════════════════════════════════════════════
   GROUPING (category / rating / quarter)
═══════════════════════════════════════════════════════════════════════════ */

/**
 * @template {Record<string, any>} T
 * @param {T[]} sessions
 * @param {keyof T} field
 * @returns {{name: string, count: number}[]} sorted descending
 */
export function groupByField (sessions, field) {
  /** @type {Record<string, number>} */
  const counts = {};
  for (const s of sessions) {
    const v = s[field];
    if (v) counts[v] = (counts[v] || 0) + 1;
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count }));
}

/** @param {{startedAt?: number}[]} sessions @returns {{label: string, count: number}[]} sorted chronologically */
export function quarterlyBreakdown (sessions) {
  /** @type {Record<string, number>} */
  const counts = {};
  for (const s of sessions) {
    if (!s.startedAt) continue;
    const d = new Date(s.startedAt);
    const q = Math.floor(d.getMonth() / 3) + 1;
    const key = `${d.getFullYear()} Q${q}`;
    counts[key] = (counts[key] || 0) + 1;
  }
  return Object.entries(counts).sort(([a], [b]) => a < b ? -1 : 1).map(([label, count]) => ({ label, count }));
}


/* ═══════════════════════════════════════════════════════════════════════════
   READER PROFILE (night owl / regularity)
═══════════════════════════════════════════════════════════════════════════ */

/** @param {number[]} byHour - 24-slot hour-of-day histogram @returns {boolean} */
export function isNightOwl (byHour) {
  const total = byHour.reduce((a, b) => a + b, 0);
  if (!total) return false;
  const night = byHour.slice(0, 6).reduce((a, b) => a + b, 0) + byHour.slice(22, 24).reduce((a, b) => a + b, 0);
  return night / total >= 0.5;
}

/**
 * Percentage of the user's active reading span that had at least one session.
 * @param {{startedAt?: number}[]} sessions
 * @returns {number} 0-100
 */
export function regularityScore (sessions) {
  const timestamps = sessions.filter(s => s.startedAt).map(s => s.startedAt);
  if (!timestamps.length) return 0;
  const days = new Set(timestamps.map(ts => new Date(ts).toDateString()));
  const spanDays = Math.max(1, Math.ceil((Math.max(...timestamps) - Math.min(...timestamps)) / 86400000) + 1);
  return Math.round((days.size / spanDays) * 100);
}


/* ═══════════════════════════════════════════════════════════════════════════
   FANDOM PERCENTAGES AND RECAP TEXT
═══════════════════════════════════════════════════════════════════════════ */

/**
 * @param {{name: string, count: number}[]} topFandoms
 * @param {number} total
 * @returns {{name: string, count: number, pct: number}[]}
 */
export function fandomPercentages (topFandoms, total) {
  if (!total) return [];
  return topFandoms.map(f => ({ ...f, pct: Math.round((f.count / total) * 1000) / 10 }));
}

/**
 * @param {string} label - e.g. "October 2026" or "2026"
 * @param {{works: number, words: number}} stats
 * @returns {string}
 */
export function buildRecapText (label, stats) {
  return `Your ${label} on AO3: ${stats.works} work${stats.works !== 1 ? 's' : ''}, ${stats.words.toLocaleString('en-US')} words read.`;
}
