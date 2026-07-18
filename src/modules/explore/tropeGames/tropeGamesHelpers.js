/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Trope Games › Pure Helpers

Pure computations backing the chantier-4 additions across all trope-game
submodules: category grouping, the weekly challenge, monthly trend, rare
(unread) tropes, bingo progress, seasonal theming, the mood quiz, and
achievement medal tiers.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   TROPE CATEGORIES
═══════════════════════════════════════════════════════════════════════════ */

// Hand-picked primary category per trope in lib/ao3/constants.js's TROPE_NAMES.
// A trope belongs to exactly one bucket here — good enough for browsing/
// filtering, not meant to be an authoritative taxonomy.
export const TROPE_CATEGORIES = {
  'Slow Burn': 'Romance', 'Enemies to Lovers': 'Romance', 'Fake Dating': 'Romance',
  'Soulmates': 'Romance', 'Mutual Pining': 'Romance', 'Idiots in Love': 'Romance',
  'Second Chance Romance': 'Romance', 'Forbidden Love': 'Romance', 'Pining': 'Romance',
  'Fake Marriage': 'Romance', 'Unrequited Love': 'Romance', 'Jealousy': 'Romance',
  'Miscommunication': 'Romance',
  'Hurt/Comfort': 'Comfort', 'Angst with a Happy Ending': 'Comfort', 'Whump': 'Comfort',
  'Comfort without Hurt': 'Comfort', 'Touch-Starved': 'Comfort', 'Sickfic': 'Comfort',
  'Protective': 'Comfort',
  'Found Family': 'Found Family', 'Chosen Family': 'Found Family',
  'Childhood Friends': 'Found Family', 'Mentor/Protégé': 'Found Family', 'Loyalty': 'Found Family',
  'Coffee Shop AU': 'AU', 'AU: Human': 'AU', 'AU: Fantasy': 'AU', 'AU: Modern': 'AU',
  'Roommates': 'AU',
  'Time Travel': 'Speculative', 'Bodyswap': 'Speculative', 'Reincarnation': 'Speculative',
  'Hanahaki Disease': 'Speculative', 'Dreams': 'Speculative',
  'Canon Divergence': 'Plot', 'Fix-It': 'Plot', 'Pre-Canon': 'Plot', 'Post-Canon': 'Plot',
  "Villain's POV": 'Plot', 'Secret Identity': 'Plot', 'Undercover': 'Plot', 'Sacrifice': 'Plot',
  'Road Trip': 'Adventure', 'Stranded Together': 'Adventure', 'Amnesia': 'Adventure',
  'First Meeting': 'Slice of Life', 'Reunion': 'Slice of Life', 'Letters/Emails': 'Slice of Life',
  'Epistolary': 'Slice of Life',
};

export function categoryOf (trope) {
  return TROPE_CATEGORIES[trope] || 'Other';
}

export function getCategories (tropeList) {
  return [...new Set((tropeList || []).map(categoryOf))].sort();
}

export function filterTropesByCategory (tropeList, category) {
  if (!category) return tropeList || [];
  return (tropeList || []).filter(t => categoryOf(t) === category);
}

export function groupStatsByCategory (stats) {
  const groups = {};
  for (const [trope, count] of Object.entries(stats || {})) {
    const cat = categoryOf(trope);
    groups[cat] = (groups[cat] || 0) + count;
  }
  return groups;
}

/* ═══════════════════════════════════════════════════════════════════════════
   DATE HELPERS
═══════════════════════════════════════════════════════════════════════════ */

export function dateKey (d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function monthKey (dateStr) {
  return typeof dateStr === 'string' ? dateStr.slice(0, 7) : null;
}

function daysAgoKey (n, from = new Date()) {
  const d = new Date(from);
  d.setDate(d.getDate() - n);
  return dateKey(d);
}

/* ═══════════════════════════════════════════════════════════════════════════
   WEEKLY CHALLENGE — distinct tropes read in the last 7 days
═══════════════════════════════════════════════════════════════════════════ */

export const WEEKLY_CHALLENGE_TARGET = 5;
export const WEEKLY_CHALLENGE_WINDOW_DAYS = 7;

/**
 * @param {Array<{date: string, tropes?: string[]}>} seenEntries
 * @returns {{distinct: number, target: number, complete: boolean}}
 */
export function computeWeeklyChallenge (seenEntries, {
  windowDays = WEEKLY_CHALLENGE_WINDOW_DAYS,
  target = WEEKLY_CHALLENGE_TARGET,
  now = new Date(),
} = {}) {
  const cutoffKeys = new Set(Array.from({ length: windowDays }, (_, i) => daysAgoKey(i, now)));
  const distinct = new Set();
  for (const entry of seenEntries || []) {
    if (!entry || !cutoffKeys.has(entry.date)) continue;
    (entry.tropes || []).forEach(t => distinct.add(t));
  }
  return { distinct: distinct.size, target, complete: distinct.size >= target };
}

/* ═══════════════════════════════════════════════════════════════════════════
   MONTHLY TREND — this month's top tropes vs last month's
═══════════════════════════════════════════════════════════════════════════ */

/** @param {Array<{date: string, tropes?: string[]}>} seenEntries */
export function bucketTropesByMonth (seenEntries) {
  const buckets = {};
  for (const entry of seenEntries || []) {
    const mk = monthKey(entry?.date);
    if (!mk) continue;
    buckets[mk] = buckets[mk] || {};
    (entry.tropes || []).forEach(t => { buckets[mk][t] = (buckets[mk][t] || 0) + 1; });
  }
  return buckets;
}

function topN (counts, n) {
  return Object.entries(counts || {}).sort((a, b) => b[1] - a[1]).slice(0, n);
}

/**
 * Compares the top tropes of the current month against the previous one.
 * @returns {{current: [string, number][], previous: [string, number][], rising: string[]}}
 */
export function monthlyTrend (seenEntries, { now = new Date(), topSize = 3 } = {}) {
  const buckets = bucketTropesByMonth(seenEntries);
  const currentKey = monthKey(dateKey(now));
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousKey = monthKey(dateKey(prevDate));

  const current = topN(buckets[currentKey], topSize);
  const previous = topN(buckets[previousKey], topSize);
  const previousTropes = new Set(previous.map(([t]) => t));
  const rising = current.map(([t]) => t).filter(t => !previousTropes.has(t));

  return { current, previous, rising };
}

/* ═══════════════════════════════════════════════════════════════════════════
   RARE / UNEXPLORED TROPES
═══════════════════════════════════════════════════════════════════════════ */

export function unexploredTropes (tropeList, stats) {
  return (tropeList || []).filter(t => !(stats?.[t] > 0));
}

/* ═══════════════════════════════════════════════════════════════════════════
   BINGO
═══════════════════════════════════════════════════════════════════════════ */

export function bingoProgressPercent (checked, freeIndex) {
  if (!Array.isArray(checked) || !checked.length) return 0;
  const total = checked.length - (freeIndex != null ? 1 : 0);
  if (total <= 0) return 100;
  const done = checked.filter((c, i) => c && i !== freeIndex).length;
  return Math.round((done / total) * 100);
}

/* ═══════════════════════════════════════════════════════════════════════════
   BINGO CARD PATTERNS — generic N×N (N odd, so a center cell exists)
═══════════════════════════════════════════════════════════════════════════ */

export function freeCenterIndex (n) {
  return Math.floor((n * n) / 2);
}

/** @returns {Record<string, number[]>} pattern name -> cell indices, for an n×n card */
export function buildBingoPatterns (n) {
  const patterns = {};
  for (let r = 0; r < n; r++) {
    patterns[`Row ${r + 1}`] = Array.from({ length: n }, (_, c) => r * n + c);
  }
  for (let c = 0; c < n; c++) {
    patterns[`Col ${c + 1}`] = Array.from({ length: n }, (_, r) => r * n + c);
  }
  const diag1 = Array.from({ length: n }, (_, i) => i * n + i);
  const diag2 = Array.from({ length: n }, (_, i) => i * n + (n - 1 - i));
  patterns['Diagonal \\'] = diag1;
  patterns['Diagonal /']  = diag2;
  patterns['X'] = [...new Set([...diag1, ...diag2])];
  patterns['Corners'] = [0, n - 1, n * (n - 1), n * n - 1];

  const frame = new Set();
  for (let c = 0; c < n; c++) { frame.add(c); frame.add((n - 1) * n + c); }
  for (let r = 0; r < n; r++) { frame.add(r * n); frame.add(r * n + (n - 1)); }
  patterns.Frame = [...frame];

  patterns.Blackout = Array.from({ length: n * n }, (_, i) => i);
  return patterns;
}

/* ═══════════════════════════════════════════════════════════════════════════
   SEASONAL THEME
═══════════════════════════════════════════════════════════════════════════ */

const SEASONS = [
  { id: 'winter',   months: [12, 1, 2] },
  { id: 'spring',   months: [3, 4, 5] },
  { id: 'summer',   months: [6, 7, 8] },
  { id: 'halloween', months: [10] },
  { id: 'autumn',   months: [9, 11] },
];

export function getSeasonalTheme (date = new Date()) {
  const month = date.getMonth() + 1;
  return SEASONS.find(s => s.months.includes(month))?.id || null;
}

/* ═══════════════════════════════════════════════════════════════════════════
   MOOD QUIZ
═══════════════════════════════════════════════════════════════════════════ */

export const MOOD_QUIZ = [
  {
    question: 'What are you in the mood for?',
    options: [
      { label: '💔 Something emotional', mood: 'emotional' },
      { label: '😂 Something light and fun', mood: 'fun' },
      { label: '😳 Something swoony', mood: 'romantic' },
      { label: '🗺️ Something adventurous', mood: 'adventurous' },
    ],
  },
];

const MOOD_TROPES = {
  emotional:    ['Hurt/Comfort', 'Angst with a Happy Ending', 'Whump', 'Found Family'],
  fun:          ['Idiots in Love', 'Coffee Shop AU', 'Fake Dating', 'Roommates'],
  romantic:     ['Slow Burn', 'Mutual Pining', 'Soulmates', 'Enemies to Lovers'],
  adventurous:  ['Road Trip', 'Time Travel', 'Stranded Together', 'Canon Divergence'],
};

/** Deterministic-ish pick (caller may seed Math.random for tests). */
export function pickTropeForMood (mood, tropeList) {
  const candidates = (MOOD_TROPES[mood] || []).filter(t => (tropeList || []).includes(t));
  const pool = candidates.length ? candidates : (tropeList || []);
  if (!pool.length) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

/* ═══════════════════════════════════════════════════════════════════════════
   ACHIEVEMENT MEDAL TIERS
═══════════════════════════════════════════════════════════════════════════ */

export const MEDAL_ICON = { bronze: '🥉', silver: '🥈', gold: '🥇', platinum: '💎' };

export function medalIcon (tier) {
  return MEDAL_ICON[tier] || '';
}

/* ═══════════════════════════════════════════════════════════════════════════
   HOROSCOPE RETROSPECTIVE
═══════════════════════════════════════════════════════════════════════════ */

/** Did the trope predicted on `dateStr` get read that same day? */
export function horoscopeCameTrue (seenEntries, trope, dateStr) {
  if (!trope || !dateStr) return null;
  const sameDay = (seenEntries || []).filter(e => e?.date === dateStr);
  if (!sameDay.length) return null; // nothing read that day — no verdict
  return sameDay.some(e => (e.tropes || []).includes(trope));
}
