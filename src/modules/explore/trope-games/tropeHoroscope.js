/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Trope Horoscope Submodule
    Submodule ID: tropeHoroscope
    Display Name: Trope Horoscope
    Source Module: Trope Games

    - Feature: Daily trope assignment
      - Option: Consistent trope per day
      - Option: Date-based seed algorithm
      - Option: Selects from full tropes database

    - Feature: Homepage banner display
      - Option: Auto-show on homepage (/)
      - Option: Purple gradient styling (#667eea to #764ba2)

    - Feature: Once-per-day visibility
      - Option: Tracks last seen date
      - Option: Shows only if not seen today
      - Option: LocalStorage persistence

    - Feature: Dismissal
      - Option: Click banner to dismiss
      - Option: Marks as seen for today

═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';

const W    = getGlobalWindow();
const NS   = 'ao3h';
const MOD  = 'tropeHoroscope';
const LOG  = `[AO3H][${MOD}]`;

// ── Helpers (shared API from coordinator, with graceful fallback) ──────────
function getShared () { return W.AO3H_TropeGames || null; }

function lsGet (key) {
  const s = getShared();
  if (s) return s.lsGet(key);
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch { return null; }
}
function lsSet (key, val) {
  const s = getShared();
  if (s) return s.lsSet(key, val);
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

// ── Route guard ───────────────────────────────────────────────────────────
function isHomePage () {
  return location.pathname === '/';
}

// ── Helpers ───────────────────────────────────────────────────────────────
function todayKey () {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function dayOfYear () {
  const n = new Date();
  const start = new Date(n.getFullYear(), 0, 0);
  return Math.floor((n - start) / 86400000);
}

function escapeHtml (str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const TAGLINES = [
  'Your reading destiny awaits.',
  'The tropes have spoken.',
  'Stars aligned for this pairing.',
  "Today's chapter beckons.",
  'Your fictional heart calls.',
  'Fate has chosen your next fic.',
  'The archive whispers.',
  'May your ship sail true.',
  'Dive in — destiny demands it.',
  'One more chapter never hurt.',
  'Adventure awaits in the archive.',
  'The stars demand this trope today.',
];

// ── Trope-of-the-day logic ────────────────────────────────────────────────
function getTrope () {
  const TROPE_LIST = getShared()?.TROPE_LIST;
  if (!TROPE_LIST) return null;
  const key    = `${NS}:tg:horoscope:${todayKey()}`;
  const cached = lsGet(key);
  if (cached?.dismissed) return null;
  if (cached?.trope) return cached;
  const idx   = dayOfYear() % TROPE_LIST.length;
  const trope = TROPE_LIST[idx];
  const entry = { trope, tagline: TAGLINES[idx % TAGLINES.length], dismissed: false, date: todayKey() };
  lsSet(key, entry);
  return entry;
}

function dismissToday () {
  const key = `${NS}:tg:horoscope:${todayKey()}`;
  const entry = lsGet(key) || {};
  lsSet(key, { ...entry, dismissed: true });
}

// ── DOM injection ─────────────────────────────────────────────────────────
let banner = null;

function injectBanner (entry) {
  if (!entry) return;
  if (document.querySelector(`.${NS}-tg-horoscope-banner`)) return;

  const anchor = document.querySelector('.latest.news.module');
  if (!anchor) {
    console.warn(LOG, 'Injection anchor .latest.news.module not found');
    return;
  }

  banner = document.createElement('div');
  banner.className = `${NS}-tg-horoscope-banner`;
  banner.innerHTML = `
    <span class="${NS}-tg-horo-icon" aria-hidden="true">🔮</span>
    <div>
      <span class="${NS}-tg-horo-label">Today's Trope Horoscope</span>
      <div class="${NS}-tg-horo-trope">${escapeHtml(entry.trope)}</div>
      <div class="${NS}-tg-horo-tagline">${escapeHtml(entry.tagline)}</div>
    </div>
    <button class="${NS}-tg-horo-dismiss" aria-label="Dismiss trope horoscope">✕</button>
  `;

  banner.querySelector(`.${NS}-tg-horo-dismiss`).addEventListener('click', () => {
    dismissToday();
    banner.remove();
    banner = null;
  });

  anchor.parentNode.insertBefore(banner, anchor);
  console.log(LOG, 'Horoscope banner injected:', entry.trope);
}

// ── Module registration ───────────────────────────────────────────────────
register(
  MOD,
  { title: 'Trope Horoscope', parent: 'tropeGames', enabledByDefault: true },
  async function init () {
    const s = JSON.parse(localStorage.getItem('ao3h:mod:tropeHoroscope:settings') || '{}');
    const showDailyTrope = s.showDailyTrope !== false; // default true
    console.log(LOG, 'init', { showDailyTrope });

    if (!isHomePage()) return;
    if (!showDailyTrope) return;

    const entry = getTrope();
    if (!entry) { console.log(LOG, 'Dismissed today, skipping'); return; }

    injectBanner(entry);

    return function cleanup () {
      banner?.remove();
      banner = null;
      console.log(LOG, 'cleanup');
    };
  }
);
