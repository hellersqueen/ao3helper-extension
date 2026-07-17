/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Fic Appreciation › Kudos Tracking

Coordinates kudos state across browser tabs and provides an on-demand work-page
control for checking the current user’s presence in the kudos list.

Notes

- Cross-tab callbacks fire only for work IDs newly added to storage.
- Manual checks delegate detection to Kudos Tracker.
- Pending result timers and storage listeners are removed during cleanup.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { getGlobalWindow } from '../../../../lib/utils/globals.js';


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const W = getGlobalWindow();

export class KudosTracking {
  /** @param {{ NS, storeGet, storeSet, cfg }} opts */
  constructor ({ NS, storeGet, storeSet, cfg }) {
    this.NS       = NS;
    this.storeGet = storeGet;
    this.storeSet = storeSet;
    this.cfg      = cfg;
    this.SK       = 'ficAppreciation:kudosed';
    this._storageHandler = null;
    this._timers = new Set();
  }

  /* ═══════════════════════════════════════════════════════════════════════
     FEATURE — CROSS-TAB KUDOS SYNCHRONIZATION
  ═══════════════════════════════════════════════════════════════════════ */

  /**
   * Start listening for kudos changes made in other tabs.
   * @param {(workId: string) => void} onKudosChange — called with workId when a new kudos is recorded
   */
  startTabSync (onKudosChange) {
    if (this._storageHandler) return; // already started

    this._storageHandler = (e) => {
      if (e.key !== this.SK) return;
      try {
        const prev = e.oldValue ? JSON.parse(e.oldValue) : {};
        const next = e.newValue ? JSON.parse(e.newValue) : {};
        for (const workId of Object.keys(next)) {
          if (!(workId in prev)) onKudosChange(workId);
        }
      } catch { /* ignore parse errors */ }
    };

    W.addEventListener('storage', this._storageHandler);
  }

  stopTabSync () {
    if (this._storageHandler) {
      W.removeEventListener('storage', this._storageHandler);
      this._storageHandler = null;
    }
  }

  /* ═══════════════════════════════════════════════════════════════════════
     FEATURE — MANUAL KUDOS CHECK
  ═══════════════════════════════════════════════════════════════════════ */

  /**
   * Inject a "Check Kudos" button on a work page.
   * @param {string}       workId
   * @param {import('./kudosTracker.js').KudosTracker} kudosTracker — used to run detection on demand
   */
  injectManualCheckButton (workId, kudosTracker) {
    const { NS } = this;
    const id = `${NS}-fa-kudos-check-btn`;
    if (document.getElementById(id)) return;

    const actionsList = document.querySelector('#feedback ul.actions, .kudos ~ ul.actions, #kudos + ul');
    if (!actionsList) return;

    const li  = document.createElement('li');
    li.id     = id;

    const btn       = document.createElement('button');
    btn.type        = 'button';
    btn.className   = `${NS}-fa-check-btn`;
    btn.textContent = '❤ Check Kudos';

    const result       = document.createElement('span');
    result.className   = `${NS}-fa-check-result`;

    btn.addEventListener('click', () => {
      btn.disabled    = true;
      result.textContent = 'Checking…';
      const found = kudosTracker.detectKudosOnWorkPage(workId);
      const timer = setTimeout(() => {
        this._timers.delete(timer);
        result.textContent = found ? '✓ Kudos given!' : 'Not found in kudos list.';
        btn.disabled = false;
      }, 300);
      this._timers.add(timer);
    });

    li.appendChild(btn);
    li.appendChild(result);
    actionsList.insertBefore(li, actionsList.firstChild);
  }

  /* ═══════════════════════════════════════════════════════════════════════
     FEATURE LIFECYCLE
  ═══════════════════════════════════════════════════════════════════════ */

  cleanup () {
    this._timers.forEach(timer => clearTimeout(timer));
    this._timers.clear();
    this.stopTabSync();
    document.getElementById(`${this.NS}-fa-kudos-check-btn`)?.remove();
  }
}
