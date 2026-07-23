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
import { lsGet, lsSet, onReady } from '../../../../lib/utils/index.js';
import { getLogger } from '../../../../lib/utils/logger.js';
const log = getLogger('tropeHoroscope');


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

function dayOfYear () {
  const n = new Date();
  const start = new Date(n.getFullYear(), 0, 0);
  return Math.floor((n.getTime() - start.getTime()) / 86400000);
}

/** Did yesterday's predicted trope actually get read? null = no verdict yet. */
function getRetrospective () {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yKey = getShared().dateKey(yesterday);
  const entry = lsGet(`${NS}:tg:horoscope:${yKey}`);
  if (!entry?.trope) return null;
  const seen = lsGet(W.AO3H_TropeGames.storageKeys.statsSeen) || [];
  const cameTrue = getShared().horoscopeCameTrue(seen, entry.trope, yKey);
  if (cameTrue === null) return null;
  return { trope: entry.trope, cameTrue };
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

function getOrCreateTodayEntry () {
  const shared = getShared();
  const TROPE_LIST = shared?.TROPE_LIST;
  if (!TROPE_LIST) return null;
  const today  = shared.dateKey();
  const key    = `${NS}:tg:horoscope:${today}`;
  const cached = lsGet(key);
  if (cached?.trope) return cached;
  const idx   = dayOfYear() % TROPE_LIST.length;
  const trope = TROPE_LIST[idx];
  const entry = { trope, tagline: TAGLINES[idx % TAGLINES.length], dismissed: false, date: today };
  lsSet(key, entry);
  return entry;
}

/** For the auto-shown banner — hidden once dismissed for today. */
function getTrope () {
  const entry = getOrCreateTodayEntry();
  if (!entry || entry.dismissed) return null;
  return entry;
}

function dismissToday () {
  const key = `${NS}:tg:horoscope:${getShared().dateKey()}`;
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

  const retro = getRetrospective();
  const retroHtml = retro
    ? `<div class="${NS}-tg-horo-retro">${retro.cameTrue ? '✅' : '❌'} Yesterday's trope (${escapeHtml(retro.trope)}) ${retro.cameTrue ? 'came true!' : "didn't come up"}</div>`
    : '';

  banner = document.createElement('div');
  banner.className = `${NS}-tg-horoscope-banner`;
  banner.innerHTML = `
    <span class="${NS}-tg-horo-icon" aria-hidden="true">🔮</span>
    <div>
      <span class="${NS}-tg-horo-label">Today's Trope Horoscope</span>
      <div class="${NS}-tg-horo-trope">${escapeHtml(entry.trope)}</div>
      <div class="${NS}-tg-horo-tagline">${escapeHtml(entry.tagline)}</div>
      ${retroHtml}
    </div>
    <button class="${NS}-tg-horo-dismiss" aria-label="Dismiss trope horoscope">✕</button>
  `;

  banner.querySelector(`.${NS}-tg-horo-dismiss`).addEventListener('click', () => {
    dismissToday();
    banner.remove();
    banner = null;
  });

  anchor.parentNode.insertBefore(banner, anchor);
  log.debug('Horoscope banner injected:', entry.trope);
}


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — MANUAL REDISPLAY (available even after today's banner was dismissed)
═══════════════════════════════════════════════════════════════════════════ */

let modalEl = null;
let triggerBtn = null;

function openManualModal () {
  const entry = getOrCreateTodayEntry();
  if (!entry) return;
  const retro = getRetrospective();
  const retroHtml = retro
    ? `<div class="${NS}-tg-horo-retro">${retro.cameTrue ? '✅' : '❌'} Yesterday's trope (${escapeHtml(retro.trope)}) ${retro.cameTrue ? 'came true!' : "didn't come up"}</div>`
    : '';

  if (!modalEl) {
    modalEl = document.createElement('div');
    modalEl.className = `${NS}-tg-horoscope-modal`;
    modalEl.addEventListener('click', e => { if (e.target === modalEl) closeManualModal(); });
    document.body.appendChild(modalEl);
  }
  modalEl.innerHTML = `
    <div class="${NS}-tg-horo-modal-inner" role="dialog" aria-modal="true" aria-label="Today's Trope Horoscope">
      <button class="${NS}-tg-modal-close" aria-label="Close horoscope">✕</button>
      <span class="${NS}-tg-horo-icon" aria-hidden="true">🔮</span>
      <div class="${NS}-tg-horo-label">Today's Trope Horoscope</div>
      <div class="${NS}-tg-horo-trope">${escapeHtml(entry.trope)}</div>
      <div class="${NS}-tg-horo-tagline">${escapeHtml(entry.tagline)}</div>
      ${retroHtml}
    </div>
  `;
  modalEl.style.display = 'flex';
  modalEl.querySelector(`.${NS}-tg-modal-close`).addEventListener('click', closeManualModal);
}

function closeManualModal () {
  if (modalEl) modalEl.style.display = 'none';
}

function injectManualTrigger () {
  triggerBtn = document.createElement('button');
  triggerBtn.className = `${NS}-tg-btn ${NS}-tg-trigger-btn ${NS}-tg-horo-trigger`;
  triggerBtn.textContent = '🔮 Horoscope';
  triggerBtn.setAttribute('aria-label', 'Show today\'s trope horoscope');
  triggerBtn.addEventListener('click', openManualModal);
  W.AO3H_TropeGames?.registerMenuItem(triggerBtn);
}


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(
  MOD,
  { title: 'Trope Horoscope', parent: 'tropeGames', enabledByDefault: true },
  async function init () {
    const showDailyTrope = getShared()?.cfg('showDailyTrope') ?? true;
    log.debug('init', { showDailyTrope });

    let active = true;
    onReady(() => {
      if (!active) return;
      injectManualTrigger();
    });

    if (isHomePage() && showDailyTrope) {
      const entry = getTrope();
      if (!entry) log.debug('Dismissed today, skipping banner');
      else injectBanner(entry);
    }

    return function cleanup () {
      active = false;
      banner?.remove();
      banner = null;
      closeManualModal();
      modalEl?.remove();
      modalEl = null;
      triggerBtn?.remove();
      triggerBtn = null;
      log.debug('cleanup');
    };
  }
);
