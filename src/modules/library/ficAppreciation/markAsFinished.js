/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Fic Appreciation › Mark as Finished

Persists finished-work records and adds reversible completion controls and
badges to work pages and listing blurbs.

Notes

- Finished records include a local ISO date and optional note.
- New completions dispatch the shared work-finished event.
- The coordinator owns removal of injected elements during cleanup.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { EV_WORK_FINISHED } from '../../../../lib/utils/event-names.js';
import { appendHeadingBadge } from '../../../../lib/ui/badges.js';
import { showToast } from '../../../../lib/ui/toast.js';


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const W = getGlobalWindow();

export class MarkAsFinished {
  /** @param {{ NS, storeGet, storeSet, cfg, helpers: typeof import('./_ficAppreciation.js').ficAppreciationHelpers }} opts */
  constructor ({ NS, storeGet, storeSet, cfg, helpers }) {
    this.NS       = NS;
    this.storeGet = storeGet;
    this.storeSet = storeSet;
    this.cfg      = cfg;
    this.helpers  = helpers;
    this.SK       = 'ficAppreciation:finished';
  }

  _load ()        { return this.storeGet(this.SK, {}); }
  _save (map)     { this.storeSet(this.SK, map); }

  /* ═══════════════════════════════════════════════════════════════════════
     FEATURE — FINISHED-WORK STORAGE
  ═══════════════════════════════════════════════════════════════════════ */

  isFinished (workId) { return workId in this._load(); }

  markFinished (workId, note) {
    const map = this._load();
    const prevCount = Object.keys(map).length;
    map[workId] = { date: new Date().toISOString().slice(0, 10), ...(note ? { note } : {}) };
    this._save(map);
    W.dispatchEvent?.(new CustomEvent(EV_WORK_FINISHED, { detail: { workId } }));

    if (this.cfg('completionMilestones') !== false) {
      const crossed = this.helpers.milestonesCrossed(prevCount, Object.keys(map).length);
      if (crossed.length) {
        const milestone = crossed[crossed.length - 1];
        showToast(`🎉 ${milestone} works finished!`, { type: 'success', duration: 4000 });
      }
    }
  }

  unmarkFinished (workId) {
    const map = this._load();
    delete map[workId];
    this._save(map);
  }

  /* ═══════════════════════════════════════════════════════════════════════
     FEATURE — WORK-PAGE AND LISTING CONTROLS
  ═══════════════════════════════════════════════════════════════════════ */

  /** Inject "Mark as Finished" button on a work page. */
  injectFinishButton (workId) {
    const { NS } = this;
    if (document.getElementById(`${NS}-fa-finish-btn`)) return;
    const target = document.querySelector('.kudos form, #kudos form, .work.meta.group .stats, #kudos');
    if (!target) return;

    const finished = this.isFinished(workId);
    const btn      = document.createElement('button');
    btn.id          = `${NS}-fa-finish-btn`;
    btn.type        = 'button';
    btn.className   = `${NS}-fa-finish-btn${finished ? ` ${NS}-fa-finished` : ''}`;
    btn.textContent = finished ? '✅ Finished' : '✓ Mark as Finished';

    btn.addEventListener('click', () => {
      if (this.isFinished(workId)) {
        this.unmarkFinished(workId);
        btn.textContent = '✓ Mark as Finished';
        btn.classList.remove(`${NS}-fa-finished`);
      } else {
        let note = null;
        if (this.cfg('completionNotes')) {
          note = W.prompt('Optional note (leave blank to skip):') || null;
        }
        this.markFinished(workId, note);
        btn.textContent = '✅ Finished';
        btn.classList.add(`${NS}-fa-finished`);
      }
    });

    target.after(btn);
  }

  /** Inject ✅ badge + quick toggle button on a listing blurb. */
  applyFinishedBadge (blurb, workId) {
    const { NS } = this;
    if (blurb.dataset.faFinished) return;
    blurb.dataset.faFinished = '1';

    if (this.isFinished(workId)) {
      appendHeadingBadge(blurb, {
        className: `${NS}-fa-badge ${NS}-fa-badge-finished`,
        guardSelector: `.${NS}-fa-badge-finished`,
        text: '✅',
        title: `Finished on ${this._load()[workId]?.date || ''}`,
      });
    }

    const stats = blurb.querySelector('.stats');
    if (stats && !stats.querySelector(`.${NS}-fa-blurb-btn`)) {
      const btn       = document.createElement('button');
      btn.type        = 'button';
      btn.className   = `${NS}-fa-blurb-btn`;
      btn.textContent = this.isFinished(workId) ? '✅' : '✓';
      btn.title       = this.isFinished(workId) ? 'Mark as unfinished' : 'Mark as finished';

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (this.isFinished(workId)) {
          this.unmarkFinished(workId);
          btn.textContent = '✓';
          btn.title       = 'Mark as finished';
          blurb.querySelector(`.${NS}-fa-badge-finished`)?.remove();
        } else {
          this.markFinished(workId);
          btn.textContent = '✅';
          btn.title       = 'Mark as unfinished';
          const h = blurb.querySelector('h4.heading');
          if (h) {
            const badge       = document.createElement('span');
            badge.className   = `${NS}-fa-badge ${NS}-fa-badge-finished`;
            badge.textContent = '✅';
            h.appendChild(badge);
          }
        }
      });
      stats.appendChild(btn);
    }
  }


  /* ═══════════════════════════════════════════════════════════════════════
     FEATURE LIFECYCLE
  ═══════════════════════════════════════════════════════════════════════ */

  // Injected UI is cleaned up centrally by the Fic Appreciation coordinator.
}
