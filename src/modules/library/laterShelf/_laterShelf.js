/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper — Later Shelf Coordinator

    Module ID: laterShelf
    Display Name: Later Shelf
    Tab: Library

    Purpose

    Coordinates quick marked-for-later actions, shelf presentation, and timed
    reminders through a shared store and runtime API.

    Submodules

    - quickMarkForLaterButton.js: listing-page pin control, note/priority on
      add, undo toast, bulk-add, whole-series add
    - markedForLaterStatus.js: badges, sorting, filtering, priority/note/group
      editing, drag reorder, grid view, CSV/links export, batch removal
    - workReminder.js: scheduled reminder notifications, snooze, recurrence,
      habit-based timing, abandoned/stale nudges, history
    - laterShelfCounterBadge.js: permanent header nav counter + preview

    Notes

    - Shared store helpers are available as ES exports and AO3H_LaterShelf.
    - Each reminder and shelf collection owns a separate storage key.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { css } from '../../../../lib/utils/index.js';
import { SK_ITEMS, cfg, loadItems, markCurrent, saveItems } from './laterShelfStore.js';
import './markedForLaterStatus.js';
import './quickMarkForLaterButton.js';
import './workReminder.js';
import './laterShelfCounterBadge.js';
import styles from './laterShelf.css?inline';


/* ═══════════════════════════════════════════════════════════════════════════
   MODULE SETUP
═══════════════════════════════════════════════════════════════════════════ */

css(styles, 'ao3h-laterShelf');

const W    = getGlobalWindow();
const MOD  = 'laterShelf';

export { SK_ITEMS, cfg, loadItems, markCurrent, saveItems } from './laterShelfStore.js';


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURES
═══════════════════════════════════════════════════════════════════════════ */

// Shared store operations are exposed through the runtime bridge below.


/* ═══════════════════════════════════════════════════════════════════════════
   MODULE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(MOD, {
  title: 'Later Shelf',
  enabledByDefault: false,
}, function init () {
  W.AO3H_LaterShelf = { loadItems, saveItems, markCurrent, SK_ITEMS, cfg };
  return function cleanup () {
    if (W.AO3H_LaterShelf?.markCurrent === markCurrent) delete W.AO3H_LaterShelf;
  };
});
