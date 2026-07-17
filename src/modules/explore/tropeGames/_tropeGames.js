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
import { css, lsGet, lsSet } from '../../../../lib/utils/index.js';
import { TROPE_NAMES } from '../../../../lib/ao3/constants.js';
import styles from './tropeGames.css?inline';

import './tropeAchievements.js';
import './tropeBingoPatterns.js';
import './tropeHoroscope.js';
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


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURES
═══════════════════════════════════════════════════════════════════════════ */

// The shared API is the integration point for all child modules.


/* ═══════════════════════════════════════════════════════════════════════════
   MODULE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(
  MOD,
  { title: 'Trope Games', enabledByDefault: false },
  async function init () {
    // Expose shared API for submodules
    W.AO3H_TropeGames = { TROPE_LIST, lsGet, lsSet, NS };
    return function cleanup () {
      delete W.AO3H_TropeGames;
    };
  }
);
