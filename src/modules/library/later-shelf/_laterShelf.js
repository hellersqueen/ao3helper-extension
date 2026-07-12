/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Later Shelf Coordinator
    Module ID: laterShelf
    Display Name: Later Shelf
    Tab: Library

    - Role: Pure coordinator — no logic of its own
    - Exposes: W.AO3H_LaterShelf = { loadItems, saveItems, markCurrent, SK_ITEMS, cfg }
      (also exported as ES module bindings, imported directly by the 3 submodules
      below instead of going through the window global)

    - Submodules:
      - quickMarkForLaterButton — 📌 button on blurbs (opt-out)
      - markedForLaterStatus    — badges, date added, sort/filter, batch delete
      - workReminder            — timed reminders + browser notifications (opt-in)

    - Storage:
      - ao3h:laterShelf:items           — array of { wid, title, addedAt }
      - ao3h:mod:laterShelf:settings    — { showQuickButton, remindersEnabled }
      - ao3h:laterShelf:reminders       — { [wid]: { title, remindAt, status } }
      - ao3h:laterShelf:reminders:lastCheck — timestamp of last reminder check

═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { css } from '../../../../lib/utils/index.js';
import { SK_ITEMS, cfg, loadItems, markCurrent, saveItems } from './laterShelfStore.js';
import './markedForLaterStatus.js';
import './quickMarkForLaterButton.js';
import './workReminder.js';
import styles from './laterShelf.css?inline';

css(styles, 'ao3h-laterShelf');

const W    = getGlobalWindow();
const MOD  = 'laterShelf';

export { SK_ITEMS, cfg, loadItems, markCurrent, saveItems } from './laterShelfStore.js';

register(MOD, {
  title: 'Later Shelf',
  enabledByDefault: false,
}, function init () {
  W.AO3H_LaterShelf = { loadItems, saveItems, markCurrent, SK_ITEMS, cfg };
  return function cleanup () {
    if (W.AO3H_LaterShelf?.markCurrent === markCurrent) delete W.AO3H_LaterShelf;
  };
});
