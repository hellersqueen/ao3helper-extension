/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Fic Appreciation › Star Ratings

Persists personal one-to-five-star ratings and adds interactive full or compact
rating controls to work pages and listing blurbs.

Notes

- Rating records include a local ISO date and optional note.
- Compact listing controls never prompt for notes.
- The coordinator owns removal of injected rating widgets.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { getGlobalWindow } from '../../../../lib/utils/globals.js';


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const W = getGlobalWindow();

export class StarRatings {
  /** @param {{ NS, storeGet, storeSet, cfg }} opts */
  constructor ({ NS, storeGet, storeSet, cfg }) {
    this.NS       = NS;
    this.storeGet = storeGet;
    this.storeSet = storeSet;
    this.cfg      = cfg;
    this.SK       = 'ficAppreciation:ratings';
  }

  _load ()    { return this.storeGet(this.SK, {}); }
  _save (map) { this.storeSet(this.SK, map); }

  /* ═══════════════════════════════════════════════════════════════════════
     FEATURE — RATING STORAGE AND STAR WIDGET
  ═══════════════════════════════════════════════════════════════════════ */

  getRating (workId) { return this._load()[workId]?.stars ?? null; }

  setRating (workId, stars, note) {
    const map    = this._load();
    map[workId]  = { stars, date: new Date().toISOString().slice(0, 10), ...(note ? { note } : {}) };
    this._save(map);
  }

  buildStarWidget (workId, compact = false) {
    const { NS } = this;
    const current = this.getRating(workId) || 0;
    const el      = document.createElement('span');
    el.className  = `${NS}-fa-stars${compact ? ` ${NS}-fa-stars-compact` : ''}`;
    el.dataset.workId = workId;
    el.setAttribute('role', 'group');
    el.setAttribute('aria-label', 'Personal rating');
    el.innerHTML = [1,2,3,4,5].map(n =>
      `<button type="button"
               class="${NS}-fa-star${n <= current ? ` ${NS}-fa-star-on` : ''}"
               data-star="${n}"
               aria-label="${n} star${n > 1 ? 's' : ''}"
               aria-pressed="${n <= current}">${n <= current ? '★' : '☆'}</button>`
    ).join('');

    el.addEventListener('click', (e) => {
      const btn = e.target instanceof Element ? e.target.closest(`.${NS}-fa-star`) : null;
      if (!btn) return;
      const stars = parseInt(btn.dataset.star, 10);
      let note = null;
      if (this.cfg('ratingNotes') && !compact) {
        note = W.prompt(`Note for your ${stars}★ rating (optional):`) || null;
      }
      this.setRating(workId, stars, note);
      this.refreshStarWidget(el, workId);
    });

    return el;
  }

  refreshStarWidget (el, workId) {
    const { NS } = this;
    const current = this.getRating(workId) || 0;
    el.querySelectorAll(`.${NS}-fa-star`).forEach(btn => {
      const n  = parseInt(btn.dataset.star, 10);
      const on = n <= current;
      btn.textContent = on ? '★' : '☆';
      btn.classList.toggle(`${NS}-fa-star-on`, on);
      btn.setAttribute('aria-pressed', String(on));
    });
  }

  /* ═══════════════════════════════════════════════════════════════════════
     FEATURE — WORK-PAGE AND LISTING RATINGS
  ═══════════════════════════════════════════════════════════════════════ */

  /** Inject full star widget on a work page inside ul.actions. */
  injectStarWidgetOnWorkPage (workId) {
    const { NS } = this;
    if (document.getElementById(`${NS}-fa-star-widget`)) return;
    const actionsList = document.querySelector('#feedback ul.actions');
    if (!actionsList) return;

    const li      = document.createElement('li');
    li.id         = `${NS}-fa-star-widget`;
    li.className  = `${NS}-fa-star-wrap`;

    const label       = document.createElement('span');
    label.className   = `${NS}-fa-star-label`;
    label.textContent = 'Rate:';
    li.appendChild(label);
    li.appendChild(this.buildStarWidget(workId, false));

    actionsList.insertBefore(li, actionsList.firstChild);
  }

  /** Add compact star badge on a listing blurb (if showRatingOnBlurbs enabled). */
  applyRatingBadge (blurb, workId) {
    if (blurb.dataset.faRating) return;
    blurb.dataset.faRating = '1';

    if (!this.cfg('showRatingOnBlurbs')) return;

    const heading = blurb.querySelector('h4.heading');
    if (!heading) return;

    const stars = this.buildStarWidget(workId, true);
    heading.appendChild(stars);
  }


  /* ═══════════════════════════════════════════════════════════════════════
     FEATURE LIFECYCLE
  ═══════════════════════════════════════════════════════════════════════ */

  // Injected UI is cleaned up centrally by the Fic Appreciation coordinator.
}
