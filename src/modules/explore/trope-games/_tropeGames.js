/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Trope Games Module Coordinator
    Module ID: tropeGames
    Display Name: Trope Games
    Tab: Explore

    Submodules (parent/child registration pattern):
        tropeGames/tropeHoroscope    -- daily trope banner on homepage
        tropeGames/tropeBingoPatterns -- 5x5 card auto-checked from work tags
        tropeGames/tropeRoulette     -- random 3-trope combo modal
        tropeGames/tropeStatistics   -- per-trope read counts, top-10
        tropeGames/tropeAchievements -- badge unlocks for reading habits

    Coordinator role:
        - Provides shared TROPE_LIST + storage helpers on W.AO3H_TropeGames
        - Injects shared CSS once
        - Defers all page-level work to submodules

    Storage keys:
        ao3h:tg:horoscope:{YYYY-MM-DD}  -- today's trope key
        ao3h:tg:bingo                   -- { card, checked, completed }
        ao3h:tg:stats                   -- { [tropeKey]: count }
        ao3h:tg:stats:seen              -- [workId, ...] (dedup, max 1000)
        ao3h:tg:achievements            -- [{ id, unlockedAt }]

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

css(styles, 'ao3h-tropeGames');

const W    = getGlobalWindow();
const NS   = 'ao3h';
const MOD  = 'tropeGames';

// ── Shared trope list (référence commune : lib/ao3/constants.js TROPE_NAMES,
// aussi utilisée par relatedSearches/CO_TAGS et filterManager/BUILTIN_BUNDLES) ──
const TROPE_LIST = TROPE_NAMES;

// ── Coordinator registration ──────────────────────────────────────────────
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
