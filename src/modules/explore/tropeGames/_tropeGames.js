/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper — Trope Games Coordinator

    Module ID: tropeGames
    Display Name: Trope Games
    Tab: Explore

    Purpose

    Coordinates playful trope discovery, tracking, statistics, and achievement
    features through a shared trope catalog and storage API.

    Submodules

    - tropeHoroscope.js: daily homepage trope
    - tropeBingoPatterns.js: tag-driven bingo card
    - tropeRoulette.js: random three-trope combinations
    - tropeStatistics.js: per-trope reading counts
    - tropeAchievements.js: reading-habit badge unlocks

    Notes

    - The canonical trope names come from lib/ao3/constants.js.
    - Children access the catalog and storage helpers through AO3H_TropeGames.
    - Each child owns its own persisted state.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { css, lsGet, lsSet, onReady } from '../../../../lib/utils/index.js';
import { makeCfg } from '../../../../lib/storage/module-settings.js';
import { TROPE_NAMES } from '../../../../lib/ao3/constants.js';
import styles from './tropeGames.css?inline';

import './tropeAchievements.js';
import './tropeBingoPatterns.js';
import './tropeHoroscope.js';
import './tropeMoodQuiz.js';
import './tropeRoulette.js';
import './tropeStatistics.js';


/* ═══════════════════════════════════════════════════════════════════════════
   MODULE SETUP
═══════════════════════════════════════════════════════════════════════════ */

css(styles, 'ao3h-tropeGames');

const W    = getGlobalWindow();
const NS   = 'ao3h';
const MOD  = 'tropeGames';

// Shared with related searches and filter bundles through the common constants file.
const TROPE_LIST = TROPE_NAMES;

// Chantier 4 fix: the settings panel writes to `ao3h:mod:tropeGames:settings`
// (the parent's id — see configs/explore/tropeGames-config.js), but every
// child submodule used to read `ao3h:mod:<childId>:settings` via its own
// `loadModuleSettings(MOD)` call — a key the panel never wrote to, so every
// checkbox in this module's panel was silently a no-op. All settings now
// live in one place here and children read them through `cfg()` on the
// shared API, the same pattern textToSpeech/readingFormatter already use.
const DEFAULTS = {
  showDailyTrope:      true,
  achievementsEnabled: true,
  enableBingo:         true,
  enableRoulette:      true,
  enableStats:         true,
  enableMoodQuiz:      true,
  seasonalTheme:       false,
  bingoSize:           25,   // 9 | 25
  bingoCategory:       '',
  bingoExclude:        '',
  rouletteCount:       3,
};

const cfg = makeCfg(MOD, DEFAULTS);

export const TROPE_STORAGE_KEYS = Object.freeze({
  stats: `${NS}:tg:stats`,
  statsSeen: `${NS}:tg:stats:seen`,
  bingo: `${NS}:tg:bingo`,
});

export const TROPE_CATEGORIES = {
  'Slow Burn': 'Romance', 'Enemies to Lovers': 'Romance', 'Fake Dating': 'Romance',
  'Soulmates': 'Romance', 'Mutual Pining': 'Romance', 'Idiots in Love': 'Romance',
  'Second Chance Romance': 'Romance', 'Forbidden Love': 'Romance', 'Pining': 'Romance',
  'Fake Marriage': 'Romance', 'Unrequited Love': 'Romance', 'Jealousy': 'Romance',
  'Miscommunication': 'Romance', 'Hurt/Comfort': 'Comfort',
  'Angst with a Happy Ending': 'Comfort', 'Whump': 'Comfort',
  'Comfort without Hurt': 'Comfort', 'Touch-Starved': 'Comfort', 'Sickfic': 'Comfort',
  'Protective': 'Comfort', 'Found Family': 'Found Family', 'Chosen Family': 'Found Family',
  'Childhood Friends': 'Found Family', 'Mentor/Protégé': 'Found Family',
  'Loyalty': 'Found Family', 'Coffee Shop AU': 'AU', 'AU: Human': 'AU',
  'AU: Fantasy': 'AU', 'AU: Modern': 'AU', 'Roommates': 'AU',
  'Time Travel': 'Speculative', 'Bodyswap': 'Speculative', 'Reincarnation': 'Speculative',
  'Hanahaki Disease': 'Speculative', 'Dreams': 'Speculative',
  'Canon Divergence': 'Plot', 'Fix-It': 'Plot', 'Pre-Canon': 'Plot', 'Post-Canon': 'Plot',
  "Villain's POV": 'Plot', 'Secret Identity': 'Plot', 'Undercover': 'Plot',
  'Sacrifice': 'Plot', 'Road Trip': 'Adventure', 'Stranded Together': 'Adventure',
  'Amnesia': 'Adventure', 'First Meeting': 'Slice of Life', 'Reunion': 'Slice of Life',
  'Letters/Emails': 'Slice of Life', 'Epistolary': 'Slice of Life',
};
export function categoryOf (trope) { return TROPE_CATEGORIES[trope] || 'Other'; }
export function getCategories (list) { return [...new Set((list || []).map(categoryOf))].sort(); }
export function filterTropesByCategory (list, category) {
  return category ? (list || []).filter(trope => categoryOf(trope) === category) : list || [];
}
export function groupStatsByCategory (stats) {
  const groups = {};
  Object.entries(stats || {}).forEach(([trope, count]) => {
    const category = categoryOf(trope);
    groups[category] = (groups[category] || 0) + count;
  });
  return groups;
}
export function dateKey (date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function monthKey (date) { return typeof date === 'string' ? date.slice(0, 7) : null; }
function daysAgoKey (days, from = new Date()) {
  const date = new Date(from);
  date.setDate(date.getDate() - days);
  return dateKey(date);
}
export const WEEKLY_CHALLENGE_TARGET = 5;
export const WEEKLY_CHALLENGE_WINDOW_DAYS = 7;
export function computeWeeklyChallenge (entries, {
  windowDays = WEEKLY_CHALLENGE_WINDOW_DAYS,
  target = WEEKLY_CHALLENGE_TARGET,
  now = new Date(),
} = {}) {
  const dates = new Set(Array.from({ length: windowDays }, (_, index) => daysAgoKey(index, now)));
  const distinct = new Set();
  (entries || []).forEach(entry => {
    if (entry && dates.has(entry.date)) (entry.tropes || []).forEach(trope => distinct.add(trope));
  });
  return { distinct: distinct.size, target, complete: distinct.size >= target };
}
export function bucketTropesByMonth (entries) {
  const buckets = {};
  (entries || []).forEach(entry => {
    const month = monthKey(entry?.date);
    if (!month) return;
    buckets[month] ||= {};
    (entry.tropes || []).forEach(trope => { buckets[month][trope] = (buckets[month][trope] || 0) + 1; });
  });
  return buckets;
}
function topN (counts, size) {
  return Object.entries(counts || {}).sort((a, b) => b[1] - a[1]).slice(0, size);
}
export function monthlyTrend (entries, { now = new Date(), topSize = 3 } = {}) {
  const buckets = bucketTropesByMonth(entries);
  const current = topN(buckets[monthKey(dateKey(now))], topSize);
  const previousDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previous = topN(buckets[monthKey(dateKey(previousDate))], topSize);
  const previousTropes = new Set(previous.map(([trope]) => trope));
  return { current, previous, rising: current.map(([trope]) => trope).filter(trope => !previousTropes.has(trope)) };
}
export function unexploredTropes (list, stats) { return (list || []).filter(trope => !(stats?.[trope] > 0)); }
export function bingoProgressPercent (checked, freeIndex) {
  if (!Array.isArray(checked) || !checked.length) return 0;
  const total = checked.length - (freeIndex != null ? 1 : 0);
  if (total <= 0) return 100;
  return Math.round((checked.filter((value, index) => value && index !== freeIndex).length / total) * 100);
}
export function freeCenterIndex (size) { return Math.floor((size * size) / 2); }
export function buildBingoPatterns (size) {
  const patterns = {};
  for (let row = 0; row < size; row++) patterns[`Row ${row + 1}`] = Array.from({ length: size }, (_, col) => row * size + col);
  for (let col = 0; col < size; col++) patterns[`Col ${col + 1}`] = Array.from({ length: size }, (_, row) => row * size + col);
  const first = Array.from({ length: size }, (_, index) => index * size + index);
  const second = Array.from({ length: size }, (_, index) => index * size + size - 1 - index);
  patterns['Diagonal \\'] = first;
  patterns['Diagonal /'] = second;
  patterns.X = [...new Set([...first, ...second])];
  patterns.Corners = [0, size - 1, size * (size - 1), size * size - 1];
  const frame = new Set();
  for (let col = 0; col < size; col++) { frame.add(col); frame.add((size - 1) * size + col); }
  for (let row = 0; row < size; row++) { frame.add(row * size); frame.add(row * size + size - 1); }
  patterns.Frame = [...frame];
  patterns.Blackout = Array.from({ length: size * size }, (_, index) => index);
  return patterns;
}
const SEASONS = [
  { id: 'winter', months: [12, 1, 2] }, { id: 'spring', months: [3, 4, 5] },
  { id: 'summer', months: [6, 7, 8] }, { id: 'halloween', months: [10] },
  { id: 'autumn', months: [9, 11] },
];
export function getSeasonalTheme (date = new Date()) {
  const month = date.getMonth() + 1;
  return SEASONS.find(season => season.months.includes(month))?.id || null;
}
export const MOOD_QUIZ = [{
  question: 'What are you in the mood for?',
  options: [
    { label: '💔 Something emotional', mood: 'emotional' },
    { label: '😂 Something light and fun', mood: 'fun' },
    { label: '😳 Something swoony', mood: 'romantic' },
    { label: '🗺️ Something adventurous', mood: 'adventurous' },
  ],
}];
const MOOD_TROPES = {
  emotional: ['Hurt/Comfort', 'Angst with a Happy Ending', 'Whump', 'Found Family'],
  fun: ['Idiots in Love', 'Coffee Shop AU', 'Fake Dating', 'Roommates'],
  romantic: ['Slow Burn', 'Mutual Pining', 'Soulmates', 'Enemies to Lovers'],
  adventurous: ['Road Trip', 'Time Travel', 'Stranded Together', 'Canon Divergence'],
};
export function pickTropeForMood (mood, list) {
  const candidates = (MOOD_TROPES[mood] || []).filter(trope => (list || []).includes(trope));
  const pool = candidates.length ? candidates : list || [];
  return pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
}
export const MEDAL_ICON = { bronze: '🥉', silver: '🥈', gold: '🥇', platinum: '💎' };
export function medalIcon (tier) { return MEDAL_ICON[tier] || ''; }
export function horoscopeCameTrue (entries, trope, date) {
  if (!trope || !date) return null;
  const sameDay = (entries || []).filter(entry => entry?.date === date);
  if (!sameDay.length) return null;
  return sameDay.some(entry => (entry.tropes || []).includes(trope));
}

// Shared by tropeBingoPatterns (auto-check) and tropeStatistics (record) —
// both used to reimplement this same DOM read independently.
export function getPageFreeformTagsLower () {
  return Array.from(document.querySelectorAll('dd.freeform.tags li a.tag'))
    .map(el => el.textContent.trim().toLowerCase());
}

const tropeGamesHelpers = {
  TROPE_CATEGORIES, categoryOf, getCategories, filterTropesByCategory,
  groupStatsByCategory, dateKey, monthKey, computeWeeklyChallenge,
  bucketTropesByMonth, monthlyTrend, unexploredTropes, bingoProgressPercent,
  freeCenterIndex, buildBingoPatterns, getSeasonalTheme, MOOD_QUIZ,
  pickTropeForMood, medalIcon, horoscopeCameTrue, getPageFreeformTagsLower,
};


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — CONSOLIDATED FLOATING MENU
═══════════════════════════════════════════════════════════════════════════ */

// Submodules call registerMenuItem(btn) instead of appending their own
// trigger button straight to document.body — this is what groups all the
// mini-games' entry points behind one floating "🃏" toggle.
const MENU_ID = `${NS}-tg-menu`;
const FAB_ID  = `${NS}-tg-menu-fab`;

function createMenu () {
  const fab = document.createElement('button');
  fab.id = FAB_ID;
  fab.className = `${NS}-tg-menu-fab`;
  fab.textContent = '🃏';
  fab.title = 'Trope Games';
  fab.setAttribute('aria-label', 'Open Trope Games menu');
  fab.setAttribute('aria-expanded', 'false');

  const menu = document.createElement('div');
  menu.id = MENU_ID;
  menu.className = `${NS}-tg-menu`;
  menu.hidden = true;

  fab.addEventListener('click', () => {
    menu.hidden = !menu.hidden;
    fab.setAttribute('aria-expanded', String(!menu.hidden));
  });

  document.body.appendChild(menu);
  document.body.appendChild(fab);

  return {
    registerMenuItem (btn) { menu.appendChild(btn); },
    destroy () { fab.remove(); menu.remove(); },
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — SEASONAL THEME
═══════════════════════════════════════════════════════════════════════════ */

function applySeasonalTheme (enabled) {
  const season = enabled ? getSeasonalTheme() : null;
  if (season) document.documentElement.setAttribute(`data-${NS}-tg-season`, season);
  else document.documentElement.removeAttribute(`data-${NS}-tg-season`);
}


/* ═══════════════════════════════════════════════════════════════════════════
   MODULE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(
  MOD,
  { title: 'Trope Games', enabledByDefault: false },
  async function init () {
    let menu = null;
    let active = true;
    onReady(() => {
      if (!active) return;
      menu = createMenu();
      // Late-bound: a child may register before this runs, so re-check.
      if (W.AO3H_TropeGames) W.AO3H_TropeGames.registerMenuItem = menu.registerMenuItem;
    });

    // Expose shared API for submodules
    W.AO3H_TropeGames = {
      TROPE_LIST, storageKeys: TROPE_STORAGE_KEYS, lsGet, lsSet, NS, cfg, ...tropeGamesHelpers,
      registerMenuItem (btn) { menu ? menu.registerMenuItem(btn) : onReady(() => menu?.registerMenuItem(btn)); },
    };

    applySeasonalTheme(!!cfg('seasonalTheme'));

    return function cleanup () {
      active = false;
      delete W.AO3H_TropeGames;
      menu?.destroy();
      menu = null;
      applySeasonalTheme(false);
    };
  }
);
