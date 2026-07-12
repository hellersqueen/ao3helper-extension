/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper — Fic Appreciation › KudosTracking sub-module
    Complements KudosTracker (which handles: detection, recording,
    greying out the kudos button, badges, quick-kudos button).
    KudosTracking adds the cross-session coordination layer.

    - Feature: Cross-tab sync
      - Option: Listens to storage events from other tabs
      - Option: Re-applies kudos badges when kudos are recorded elsewhere
      - Option: Calls onKudosChange(workId) callback on change

    - Feature: Manual "Check Kudos" button on work pages
      - Option: Injected into ul.actions alongside the kudos form
      - Option: Triggers KudosTracker.detectKudosOnWorkPage() on click
      - Option: Shows result inline (found / not found)
      - Option: Removed on cleanup

    - Feature: Hide-kudosed filter persistence
      - Option: Saves the hideKudosedFilter toggle state across sessions
      - Option: Integration with coordinator cfg

═══════════════════════════════════════════════════════════════════════════ */

import { getGlobalWindow } from '../../../../lib/utils/globals.js';

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

  // ── Cross-tab sync ──────────────────────────────────────────────────────

  /**
   * Start listening for kudos changes made in other tabs.
   * @param {function(string)} onKudosChange — called with workId when a new kudos is recorded
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

  // ── Manual check button ─────────────────────────────────────────────────

  /**
   * Inject a "Check Kudos" button on a work page.
   * @param {string}       workId
   * @param {KudosTracker} kudosTracker — used to run detection on demand
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

  // ── Cleanup ─────────────────────────────────────────────────────────────

  cleanup () {
    this._timers.forEach(timer => clearTimeout(timer));
    this._timers.clear();
    this.stopTabSync();
    document.getElementById(`${this.NS}-fa-kudos-check-btn`)?.remove();
  }
}
