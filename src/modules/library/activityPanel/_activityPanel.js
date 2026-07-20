/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper — Activity Panel Coordinator

    Module ID: activityPanel
    Display Name: Activity Panel
    Tab: Library

    Purpose

    Coordinates reading-session collection and the analytical widgets shown on
    AO3 dashboard and profile pages.

    Submodules

    - Coordinator-owned aggregation and reading-stat calculations
    - fandomBreakdown.js: ranked fandom totals
    - habitsAnalysis.js: reading-time distribution
    - patternAnalysis.js: seasonal and behavioral patterns
    - readingInsights.js: overview cards, streaks, and achievements
    - sessionHistory.js: work-page session recording

    Notes

    - Shared storage, configuration, and namespace helpers are ES exports.
    - The same helpers are exposed through AO3H_ActivityPanel while active.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { css } from '../../../../lib/utils/index.js';
import { makeCfg } from '../../../../lib/storage/module-settings.js';
import { getBookmarkVaultWorkIds } from '../../../../lib/storage/keys.js';
import './fandomBreakdown.js';
import './habitsAnalysis.js';
import './patternAnalysis.js';
import './readingInsights.js';
import './sessionHistory.js';
import styles from './activityPanel.css?inline';


/* ═══════════════════════════════════════════════════════════════════════════
   MODULE SETUP
═══════════════════════════════════════════════════════════════════════════ */

css(styles, 'ao3h-activityPanel');

const W   = getGlobalWindow();
const MOD = 'activityPanel';
export const NS = 'ao3h';

const DEFAULTS = {
  showTagCloud: true,
  readingAchievements: true,
};

export const cfg = makeCfg(MOD, DEFAULTS, { globalConfig: true });

export const store = {
  get (key) {
    try {
      const value = localStorage.getItem(`ao3h:${key}`);
      return value ? JSON.parse(value) : null;
    } catch { return null; }
  },
  set (key, value) {
    try { localStorage.setItem(`ao3h:${key}`, JSON.stringify(value)); } catch { /* unavailable */ }
  },
};


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURES
═══════════════════════════════════════════════════════════════════════════ */

const PERIOD_DAYS = { today: 1, week: 7, month: 30, year: 365 };
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function filterSessionsByPeriod (sessions, period) {
  if (!period || period === 'all') return sessions;
  if (period === 'today') {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    return sessions.filter(s => s.startedAt && s.startedAt >= startOfDay.getTime());
  }
  const days = PERIOD_DAYS[period];
  if (!days) return sessions;
  const cutoff = Date.now() - days * 86400000;
  return sessions.filter(s => s.startedAt && s.startedAt >= cutoff);
}

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

export function dayHourHeatmap (sessions) {
  const grid = Array.from({ length: 7 }, () => Array(24).fill(0));
  for (const s of sessions) {
    if (!s.startedAt) continue;
    const d = new Date(s.startedAt);
    grid[d.getDay()][d.getHours()]++;
  }
  return grid;
}

export function bestReadingSlot (grid) {
  let best = { day: 0, hour: 0, count: 0 };
  grid.forEach((row, day) => row.forEach((count, hour) => {
    if (count > best.count) best = { day, hour, count };
  }));
  return best.count > 0 ? best : null;
}

export function formatSlotLabel (slot) {
  return slot ? `${DAY_NAMES[slot.day]}s around ${String(slot.hour).padStart(2, '0')}:00` : null;
}

export function detectRereads (sessions) {
  const byWork = {};
  for (const s of sessions) {
    if (!s.workId) continue;
    if (!byWork[s.workId]) byWork[s.workId] = { workId: s.workId, title: s.title || s.workId, count: 0 };
    byWork[s.workId].count++;
  }
  return Object.values(byWork).filter(w => w.count > 1).sort((a, b) => b.count - a.count);
}

export function detectIntensiveSessions (sessions, multiplier = 2) {
  if (!sessions.length) return [];
  const avg = sessions.reduce((a, s) => a + (s.pageViews || 0), 0) / sessions.length;
  return avg ? sessions.filter(s => (s.pageViews || 0) >= avg * multiplier) : [];
}

export function estimateAbandonPoint (sessions, isFinished) {
  const unfinished = sessions.filter(s => s.workId && !isFinished(s.workId));
  if (!unfinished.length) return null;
  const avg = unfinished.reduce((a, s) => a + (s.pageViews || 0), 0) / unfinished.length;
  return Math.round(avg * 10) / 10;
}

export function compareByPeriod (sessions, unit, now = new Date()) {
  const key = (ts) => {
    const d = new Date(ts);
    return unit === 'month' ? `${d.getFullYear()}-${d.getMonth()}` : `${d.getFullYear()}`;
  };
  const curKey = key(now.getTime());
  const prevDate = new Date(now);
  if (unit === 'month') prevDate.setMonth(prevDate.getMonth() - 1);
  else prevDate.setFullYear(prevDate.getFullYear() - 1);
  const summarize = (arr) => ({
    works: new Set(arr.map(s => s.workId).filter(Boolean)).size,
    words: arr.reduce((a, s) => a + (s.words || 0), 0),
  });
  const bucket = k => sessions.filter(s => s.startedAt && key(s.startedAt) === k);
  const current = summarize(bucket(curKey));
  const previous = summarize(bucket(key(prevDate.getTime())));
  const deltaPct = previous.works ? Math.round(((current.works - previous.works) / previous.works) * 100) : null;
  return { current, previous, deltaPct };
}

export function detectTagTrend (sessions, days = 30, now = Date.now()) {
  const recent = sessions.filter(s => s.startedAt && now - s.startedAt < days * 86400000);
  const prior = sessions.filter(s => s.startedAt && now - s.startedAt >= days * 86400000 && now - s.startedAt < days * 2 * 86400000);
  const countTags = (items) => {
    const counts = {};
    items.forEach(s => (s.tags || []).forEach(t => { counts[t] = (counts[t] || 0) + 1; }));
    return counts;
  };
  const recentCounts = countTags(recent);
  const priorCounts = countTags(prior);
  return Object.entries(recentCounts)
    .map(([tag, count]) => ({ tag, count, priorCount: priorCounts[tag] || 0 }))
    .filter(t => t.count > t.priorCount && t.count >= 2)
    .sort((a, b) => (b.count - b.priorCount) - (a.count - a.priorCount))
    .slice(0, 5);
}

export function groupByField (sessions, field) {
  const counts = {};
  for (const s of sessions) {
    const value = s[field];
    if (value) counts[value] = (counts[value] || 0) + 1;
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count }));
}

export function quarterlyBreakdown (sessions) {
  const counts = {};
  for (const s of sessions) {
    if (!s.startedAt) continue;
    const d = new Date(s.startedAt);
    const label = `${d.getFullYear()} Q${Math.floor(d.getMonth() / 3) + 1}`;
    counts[label] = (counts[label] || 0) + 1;
  }
  return Object.entries(counts).sort(([a], [b]) => a < b ? -1 : 1).map(([label, count]) => ({ label, count }));
}

export function isNightOwl (byHour) {
  const total = byHour.reduce((a, b) => a + b, 0);
  if (!total) return false;
  const night = byHour.slice(0, 6).reduce((a, b) => a + b, 0) + byHour.slice(22, 24).reduce((a, b) => a + b, 0);
  return night / total >= 0.5;
}

export function regularityScore (sessions) {
  const timestamps = sessions.filter(s => s.startedAt).map(s => s.startedAt);
  if (!timestamps.length) return 0;
  const days = new Set(timestamps.map(ts => new Date(ts).toDateString()));
  const spanDays = Math.max(1, Math.ceil((Math.max(...timestamps) - Math.min(...timestamps)) / 86400000) + 1);
  return Math.round((days.size / spanDays) * 100);
}

export function fandomPercentages (topFandoms, total) {
  return total ? topFandoms.map(f => ({ ...f, pct: Math.round((f.count / total) * 1000) / 10 })) : [];
}

export function buildRecapText (label, stats) {
  return `Your ${label} on AO3: ${stats.works} work${stats.works !== 1 ? 's' : ''}, ${stats.words.toLocaleString('en-US')} words read.`;
}

const activityPanelHelpers = {
  filterSessionsByPeriod, buildTagCloud, dayHourHeatmap, bestReadingSlot, formatSlotLabel,
  detectRereads, detectIntensiveSessions, estimateAbandonPoint, compareByPeriod,
  detectTagTrend, groupByField, quarterlyBreakdown, isNightOwl, regularityScore,
  fandomPercentages, buildRecapText,
};

export class DataCollection {
  constructor ({ storage }) { this.storage = storage; }

  aggregate () {
    const readingHistory = this.storage?.get('rt:history') || [];
    const kudosHistory = this.storage?.get('ficAppreciation:kudosed') || {};
    const sessions = this.storage?.get('activityPanel:sessions') || [];
    const wordsByWork = {};
    const sessionMetaByWork = {};
    sessions.forEach(session => {
      if (!session.workId) return;
      if (session.words > 0) wordsByWork[session.workId] = Math.max(wordsByWork[session.workId] || 0, session.words);
      const meta = sessionMetaByWork[session.workId] || (sessionMetaByWork[session.workId] = {});
      if (!meta.fandoms && session.fandoms?.length) meta.fandoms = session.fandoms;
      if (!meta.tags && session.tags?.length) meta.tags = session.tags;
      if (!meta.rating && session.rating) meta.rating = session.rating;
    });

    const ranked = (counts, limit) => Object.entries(counts)
      .sort((a, b) => b[1] - a[1]).slice(0, limit)
      .map(([name, count]) => ({ name, count }));
    const totalWords = Object.values(wordsByWork).reduce((sum, words) => sum + words, 0);
    const fandomCounts = {};
    const tagCounts = {};
    const authorCounts = {};
    const ratingCounts = {};
    readingHistory.forEach(work => {
      const meta = sessionMetaByWork[work.id] || {};
      const fandom = (Array.isArray(work.fandoms) ? work.fandoms[0] : work.fandom) || meta.fandoms?.[0] || 'Unknown';
      fandomCounts[fandom] = (fandomCounts[fandom] || 0) + 1;
      (work.tags?.length ? work.tags : meta.tags || []).forEach(tag => { tagCounts[tag] = (tagCounts[tag] || 0) + 1; });
      const author = work.author || 'Anonymous';
      authorCounts[author] = (authorCounts[author] || 0) + 1;
      const rating = work.rating || meta.rating || 'Not Rated';
      ratingCounts[rating] = (ratingCounts[rating] || 0) + 1;
    });
    let averageWordsPerDay = 0;
    if (readingHistory.length) {
      const firstRead = Math.min(...readingHistory.map(work => work.seenAt || work.timestamp || Date.now()));
      averageWordsPerDay = Math.round(totalWords / Math.max(1, Math.ceil((Date.now() - firstRead) / 86400000)));
    }
    return {
      totalWorks: readingHistory.length,
      totalWords,
      totalHours: Math.round((totalWords / 250) / 60),
      totalKudos: Object.keys(kudosHistory).length,
      totalBookmarks: getBookmarkVaultWorkIds().size,
      topFandoms: ranked(fandomCounts, 10),
      topTags: ranked(tagCounts, 20),
      topAuthors: ranked(authorCounts, 10),
      averageWordsPerDay,
      favoriteRating: Object.entries(ratingCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Not Rated',
      _readingHistory: readingHistory,
    };
  }
}

export class ReadingStats {
  calculateStreak (history) {
    if (!history?.length) return 0;
    const dates = [...new Set(history.map(work => new Date(work.seenAt || work.timestamp || work.readDate).toDateString()))]
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    let streak = 0;
    const currentDate = new Date();
    for (const date of dates) {
      if (date !== currentDate.toDateString()) break;
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }
    return streak;
  }

  calculateAchievements (stats) {
    const achievements = [];
    const { totalWorks = 0, totalWords = 0, totalKudos = 0, readingStreak = 0, topFandoms = [] } = stats;
    if (totalWorks >= 100) achievements.push({ name: 'Centennial Reader', icon: '📚', desc: 'Read 100+ works' });
    if (totalWorks >= 500) achievements.push({ name: 'Voracious Reader', icon: '🔥', desc: 'Read 500+ works' });
    if (totalWorks >= 1000) achievements.push({ name: 'Legendary Reader', icon: '👑', desc: 'Read 1,000+ works' });
    if (totalWords >= 1_000_000) achievements.push({ name: 'Million Words', icon: '📖', desc: 'Read 1M+ words' });
    if (totalWords >= 10_000_000) achievements.push({ name: 'Epic Journey', icon: '🌟', desc: 'Read 10M+ words' });
    if (totalKudos >= 100) achievements.push({ name: 'Kudos Giver', icon: '⭐', desc: 'Given 100+ kudos' });
    if (totalKudos >= 1000) achievements.push({ name: 'Star Spreader', icon: '✨', desc: 'Given 1,000+ kudos' });
    if (readingStreak >= 7) achievements.push({ name: 'Week Warrior', icon: '🔥', desc: '7-day reading streak' });
    if (readingStreak >= 30) achievements.push({ name: 'Monthly Marathon', icon: '🏆', desc: '30-day reading streak' });
    if (readingStreak >= 100) achievements.push({ name: 'Century Streak', icon: '💯', desc: '100-day reading streak' });
    if (topFandoms.length >= 10) achievements.push({ name: 'Multifandom Explorer', icon: '🗺️', desc: 'Read 10+ fandoms' });
    if (topFandoms.length >= 50) achievements.push({ name: 'Fandom Nomad', icon: '🌍', desc: 'Read 50+ fandoms' });
    return achievements;
  }
}

Object.assign(activityPanelHelpers, { DataCollection, ReadingStats });


/* ═══════════════════════════════════════════════════════════════════════════
   MODULE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(MOD, {
  title: 'Activity Panel',
  enabledByDefault: false,
}, async function init () {
  W.AO3H_ActivityPanel = { store, cfg, NS, ...activityPanelHelpers };
  return function cleanup () {
    delete W.AO3H_ActivityPanel;
  };
});
