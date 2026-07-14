/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper — Fic Appreciation › MarkAsFinished sub-module
    Storage key: ficAppreciation:finished  — { [workId]: { date, note? } }
    Methods: isFinished, markFinished, unmarkFinished,
             injectFinishButton, applyFinishedBadge

═══════════════════════════════════════════════════════════════════════════ */

import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { EV_WORK_FINISHED } from '../../../../lib/utils/event-names.js';

const W = getGlobalWindow();

export class MarkAsFinished {
  /** @param {{ NS, storeGet, storeSet, cfg }} opts */
  constructor ({ NS, storeGet, storeSet, cfg }) {
    this.NS       = NS;
    this.storeGet = storeGet;
    this.storeSet = storeSet;
    this.cfg      = cfg;
    this.SK       = 'ficAppreciation:finished';
  }

  _load ()        { return this.storeGet(this.SK, {}); }
  _save (map)     { this.storeSet(this.SK, map); }

  isFinished (workId) { return workId in this._load(); }

  markFinished (workId, note) {
    const map = this._load();
    map[workId] = { date: new Date().toISOString().slice(0, 10), ...(note ? { note } : {}) };
    this._save(map);
    W.dispatchEvent?.(new CustomEvent(EV_WORK_FINISHED, { detail: { workId } }));
  }

  unmarkFinished (workId) {
    const map = this._load();
    delete map[workId];
    this._save(map);
  }

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

    const heading = blurb.querySelector('h4.heading');
    if (heading && this.isFinished(workId)) {
      const badge       = document.createElement('span');
      badge.className   = `${NS}-fa-badge ${NS}-fa-badge-finished`;
      badge.textContent = '✅';
      badge.title       = `Finished on ${this._load()[workId]?.date || ''}`;
      heading.appendChild(badge);
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
}
