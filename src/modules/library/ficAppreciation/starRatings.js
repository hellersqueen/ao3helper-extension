/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Fic Appreciation › Star Ratings

Persists personal one-to-five-star ratings (optionally with half-star
precision, per-category breakdowns, mood tags, and rating-change history) and
adds interactive full or compact rating controls to work pages and listing
blurbs.

Notes

- Rating records include a local ISO date and optional note.
- Compact listing controls never prompt for notes and never show half-stars,
  categories, mood tags, or the community-stats comparison — those are
  work-page-only to keep listings lightweight.
- The coordinator owns removal of injected rating widgets.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import {
  computeRatingStats, ratingByMonth, appendRatingHistory, combinedCategoryScore, halfStarValue,
} from './ficAppreciationHelpers.js';


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const W = getGlobalWindow();
const CATEGORIES = { plot: 'Plot', characters: 'Characters', writing: 'Writing' };

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
     FEATURE — RATING STORAGE
  ═══════════════════════════════════════════════════════════════════════ */

  getRating (workId) { return this._load()[workId]?.stars ?? null; }

  getRatingHistory (workId) { return this._load()[workId]?.history || []; }

  /**
   * @param {string} workId
   * @param {number} stars - whole or half-star value (e.g. 3.5)
   * @param {string|null} [note]
   */
  setRating (workId, stars, note) {
    const map     = this._load();
    const prev    = map[workId];
    const history = appendRatingHistory(prev, stars);
    const entry   = { stars, date: new Date().toISOString().slice(0, 10) };
    const finalNote = note !== undefined && note !== null ? note : prev?.note;
    if (finalNote) entry.note = finalNote;
    if (history.length) entry.history = history;
    if (prev?.categories) entry.categories = prev.categories;
    if (prev?.moodTags?.length) entry.moodTags = prev.moodTags;
    map[workId] = entry;
    this._save(map);
  }

  getCategoryRatings (workId) { return this._load()[workId]?.categories || null; }

  /** @param {string} workId @param {string} category @param {number} value */
  setCategoryRating (workId, category, value) {
    const map  = this._load();
    const prev = map[workId] || { stars: 0, date: new Date().toISOString().slice(0, 10) };
    map[workId] = { ...prev, categories: { ...(prev.categories || {}), [category]: value } };
    this._save(map);
  }

  getMoodTags (workId) { return this._load()[workId]?.moodTags || []; }

  /** @param {string} workId @param {string[]} tags */
  setMoodTags (workId, tags) {
    const map  = this._load();
    const prev = map[workId] || { stars: 0, date: new Date().toISOString().slice(0, 10) };
    map[workId] = { ...prev, moodTags: tags };
    this._save(map);
  }

  /** @returns {{total: number, average: number, distribution: Record<number, number>, byMonth: Record<string, number>}} */
  getRatingStats () {
    const map = this._load();
    return { ...computeRatingStats(map), byMonth: ratingByMonth(map) };
  }

  /* ═══════════════════════════════════════════════════════════════════════
     FEATURE — STAR WIDGET
  ═══════════════════════════════════════════════════════════════════════ */

  _starInnerHTML (full, half) {
    const { NS } = this;
    if (half) return `<span class="${NS}-fa-star-back">☆</span><span class="${NS}-fa-star-front">★</span>`;
    return full ? '★' : '☆';
  }

  buildStarWidget (workId, compact = false) {
    const { NS } = this;
    const current   = this.getRating(workId) || 0;
    const allowHalf = this.cfg('halfStars') && !compact;
    const el      = document.createElement('span');
    el.className  = `${NS}-fa-stars${compact ? ` ${NS}-fa-stars-compact` : ''}`;
    el.dataset.workId = workId;
    el.setAttribute('role', 'group');
    el.setAttribute('aria-label', 'Personal rating');
    el.innerHTML = [1, 2, 3, 4, 5].map(n => {
      const full = n <= Math.floor(current);
      const half = !full && n === Math.ceil(current) && current % 1 !== 0;
      return `<button type="button"
               class="${NS}-fa-star${full ? ` ${NS}-fa-star-on` : ''}${half ? ` ${NS}-fa-star-half` : ''}"
               data-star="${n}"
               aria-label="${n} star${n > 1 ? 's' : ''}"
               aria-pressed="${full}">${this._starInnerHTML(full, half)}</button>`;
    }).join('');

    el.addEventListener('click', (e) => {
      const btn = e.target instanceof Element ? e.target.closest(`.${NS}-fa-star`) : null;
      if (!btn) return;
      const starIndex = parseInt(/** @type {HTMLElement} */ (btn).dataset.star, 10);
      let stars = starIndex;
      if (allowHalf && e instanceof MouseEvent) {
        const rect = btn.getBoundingClientRect();
        stars = halfStarValue(e.clientX - rect.left, rect.width, starIndex, true);
      }
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
      const n    = parseInt(/** @type {HTMLElement} */ (btn).dataset.star, 10);
      const full = n <= Math.floor(current);
      const half = !full && n === Math.ceil(current) && current % 1 !== 0;
      btn.innerHTML = this._starInnerHTML(full, half);
      btn.classList.toggle(`${NS}-fa-star-on`, full);
      btn.classList.toggle(`${NS}-fa-star-half`, half);
      btn.setAttribute('aria-pressed', String(full));
    });
  }

  /* ═══════════════════════════════════════════════════════════════════════
     FEATURE — CATEGORY RATINGS (plot / characters / writing)
  ═══════════════════════════════════════════════════════════════════════ */

  buildCategoryRatingsWidget (workId) {
    const { NS } = this;
    const current = this.getCategoryRatings(workId) || {};
    const wrap    = document.createElement('div');
    wrap.className = `${NS}-fa-categories`;

    for (const [key, label] of Object.entries(CATEGORIES)) {
      const row = document.createElement('div');
      row.className = `${NS}-fa-category-row`;
      const rowLabel = document.createElement('span');
      rowLabel.className   = `${NS}-fa-category-label`;
      rowLabel.textContent  = label;
      row.appendChild(rowLabel);

      const value = current[key] || 0;
      const stars = document.createElement('span');
      stars.className = `${NS}-fa-stars ${NS}-fa-stars-compact`;
      stars.innerHTML = [1, 2, 3, 4, 5].map(n =>
        `<button type="button" class="${NS}-fa-star${n <= value ? ` ${NS}-fa-star-on` : ''}"
                 data-star="${n}" aria-label="${label} ${n} star${n > 1 ? 's' : ''}">${n <= value ? '★' : '☆'}</button>`
      ).join('');
      stars.addEventListener('click', (e) => {
        const btn = e.target instanceof Element ? e.target.closest(`.${NS}-fa-star`) : null;
        if (!btn) return;
        this.setCategoryRating(workId, key, parseInt(/** @type {HTMLElement} */ (btn).dataset.star, 10));
        this._refreshCategoryWidget(wrap, workId);
      });
      row.appendChild(stars);
      wrap.appendChild(row);
    }

    const scoreLine = document.createElement('div');
    scoreLine.className = `${NS}-fa-category-score`;
    wrap.appendChild(scoreLine);
    this._refreshCategoryScoreLine(scoreLine, workId);

    return wrap;
  }

  _refreshCategoryWidget (wrap, workId) {
    const { NS } = this;
    const current = this.getCategoryRatings(workId) || {};
    Array.from(wrap.querySelectorAll(`.${NS}-fa-category-row`)).forEach((row, i) => {
      const key   = Object.keys(CATEGORIES)[i];
      const value = current[key] || 0;
      row.querySelectorAll(`.${NS}-fa-star`).forEach(btn => {
        const n  = parseInt(/** @type {HTMLElement} */ (btn).dataset.star, 10);
        const on = n <= value;
        btn.textContent = on ? '★' : '☆';
        btn.classList.toggle(`${NS}-fa-star-on`, on);
      });
    });
    this._refreshCategoryScoreLine(wrap.querySelector(`.${NS}-fa-category-score`), workId);
  }

  _refreshCategoryScoreLine (scoreLine, workId) {
    if (!scoreLine) return;
    const score = combinedCategoryScore(this.getCategoryRatings(workId));
    scoreLine.textContent = score !== null ? `Combined score: ${score} / 5` : '';
  }

  /* ═══════════════════════════════════════════════════════════════════════
     FEATURE — MOOD TAGS
  ═══════════════════════════════════════════════════════════════════════ */

  buildMoodTagsInput (workId) {
    const { NS } = this;
    const wrap  = document.createElement('div');
    wrap.className = `${NS}-fa-mood-tags`;

    const label = document.createElement('label');
    label.className   = `${NS}-fa-mood-tags-label`;
    label.textContent  = 'Mood tags:';
    wrap.appendChild(label);

    const input = document.createElement('input');
    input.type        = 'text';
    input.className   = `${NS}-fa-mood-tags-input`;
    input.placeholder = 'e.g. funny, comforting, bittersweet';
    input.value        = this.getMoodTags(workId).join(', ');
    input.addEventListener('change', () => {
      const tags = input.value.split(',').map(t => t.trim()).filter(Boolean);
      this.setMoodTags(workId, tags);
    });
    wrap.appendChild(input);

    return wrap;
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

    const history = this.getRatingHistory(workId);
    if (history.length) {
      const info = document.createElement('span');
      info.className = `${NS}-fa-rating-history-info`;
      info.textContent = 'ℹ️';
      info.title = 'Previous ratings:\n' + history.map(h => `${h.stars}★ on ${h.date || '?'}`).join('\n');
      li.appendChild(info);
    }

    if (this.cfg('showCommunityStats')) {
      const kudosCount = document.querySelector('dl.stats dd.kudos')?.textContent.trim();
      const hitsCount  = document.querySelector('dl.stats dd.hits')?.textContent.trim();
      if (kudosCount || hitsCount) {
        const community = document.createElement('div');
        community.className = `${NS}-fa-community-stats`;
        community.textContent = `Community: ${kudosCount ? `${kudosCount} kudos` : ''}${kudosCount && hitsCount ? ' · ' : ''}${hitsCount ? `${hitsCount} hits` : ''}`;
        li.appendChild(community);
      }
    }

    if (this.cfg('ratingCategories')) {
      li.appendChild(this.buildCategoryRatingsWidget(workId));
    }

    if (this.cfg('moodTags')) {
      li.appendChild(this.buildMoodTagsInput(workId));
    }

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

    if (this.cfg('ratingCategories')) {
      const score = combinedCategoryScore(this.getCategoryRatings(workId));
      if (score !== null) {
        const badge = document.createElement('span');
        badge.className = `${this.NS}-fa-badge ${this.NS}-fa-category-score-badge`;
        badge.textContent = `Ⓒ${score}`;
        badge.title = 'Combined score (plot / characters / writing average)';
        heading.appendChild(badge);
      }
    }
  }


  /* ═══════════════════════════════════════════════════════════════════════
     FEATURE LIFECYCLE
  ═══════════════════════════════════════════════════════════════════════ */

  // Injected UI is cleaned up centrally by the Fic Appreciation coordinator.
}
