/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Trope Games › Trope Horoscope

Selects a deterministic trope and tagline for the current day and presents it
as a dismissible banner on the AO3 homepage.

Notes

- The day-of-year selects from the coordinator’s shared trope list.
- The selected entry and dismissal state persist under a date-specific key.
- A dismissed horoscope remains hidden for the rest of that local day.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { escapeHtml } from '../../../../lib/utils/dom.js';
import { loadModuleSettings } from '../../../../lib/storage/module-settings.js';
import { lsGet, lsSet } from '../../../../lib/utils/index.js';


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const W    = getGlobalWindow();
const NS   = 'ao3h';
const MOD  = 'tropeHoroscope';
const LOG  = `[AO3H][${MOD}]`;

function getShared () { return W.AO3H_TropeGames || null; }

function isHomePage () {
  return location.pathname === '/';
}


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — DAILY TROPE SELECTION AND DISMISSAL
═══════════════════════════════════════════════════════════════════════════ */

function todayKey () {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function dayOfYear () {
  const n = new Date();
  const start = new Date(n.getFullYear(), 0, 0);
  return Math.floor((n.getTime() - start.getTime()) / 86400000);
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


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — HOMEPAGE HOROSCOPE BANNER
═══════════════════════════════════════════════════════════════════════════ */

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


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(
  MOD,
  { title: 'Trope Horoscope', parent: 'tropeGames', enabledByDefault: true },
  async function init () {
    const s = loadModuleSettings(MOD);
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
