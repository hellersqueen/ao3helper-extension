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
import { getSeasonalTheme } from './tropeGamesHelpers.js';
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
      TROPE_LIST, lsGet, lsSet, NS, cfg,
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
