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

// ── Shared trope list ─────────────────────────────────────────────────────
const TROPE_LIST = [
  'Slow Burn', 'Enemies to Lovers', 'Hurt/Comfort', 'Fake Dating',
  'Soulmates', 'Found Family', 'Angst with a Happy Ending', 'Coffee Shop AU',
  'Road Trip', 'Mutual Pining', 'Idiots in Love', 'Amnesia',
  'Time Travel', 'Bodyswap', 'Roommates', 'Second Chance Romance',
  'Forbidden Love', 'Secret Identity', 'Stranded Together', 'Undercover',
  'Hanahaki Disease', 'Reincarnation', 'Canon Divergence', 'Fix-It',
  'Chosen Family', 'First Meeting', 'Reunion', "Villain's POV",
  'Mentor/Protégé', 'Sacrifice', 'Whump', 'Comfort without Hurt',
  'Fake Marriage', 'Pining', 'Miscommunication', 'Jealousy',
  'Protective', 'Touch-Starved', 'Childhood Friends', 'Dreams',
  'Letters/Emails', 'Sickfic', 'Pre-Canon', 'Post-Canon', 'AU: Human',
  'AU: Fantasy', 'AU: Modern', 'Epistolary', 'Unrequited Love', 'Loyalty',
];

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
