/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Work Length › Reading Time

Calculates configurable reading-time estimates and displays them on work-page
statistics, individual chapters, and optionally listing blurbs.

Notes

- Slow, average, and fast presets map to fixed words-per-minute values.
- A custom speed falls back to 250 WPM when invalid.
- Chapter estimates share the common chapter badge with other modules.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { upsertChapterBadgePart, removeChapterBadgePartsByKey } from '../../../../lib/ui/chapter-badge.js';
import { onReady, observe, countWords } from '../../../../lib/utils/index.js';
import { getChapterProse } from '../../../../lib/ao3/work-page.js';


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

export class ReadingTime {
  constructor(NS, cfg) {
    this.NS  = NS;
    this.cfg = cfg;
    this.WPM_MAP = { slow: 150, average: 250, fast: 400 };
  }


  /* ═══════════════════════════════════════════════════════════════════════
     FEATURE — READING-TIME CALCULATION
  ═══════════════════════════════════════════════════════════════════════ */

  getWPM() {
    const speed = this.cfg('readSpeed');
    if (speed === 'custom') return parseInt(this.cfg('customWPM'), 10) || 250;
    return this.WPM_MAP[speed] || 250;
  }

  formatTime(minutes) {
    if (minutes < 1) return '<1 min';
    if (minutes < 60) return `${Math.round(minutes)} min`;
    const h = Math.floor(minutes / 60);
    const m = Math.round(minutes % 60);
    return m > 0 ? `${h}h${String(m).padStart(2, '0')}min` : `${h}h`;
  }

  parseWordCount(el) {
    const text = el.textContent.trim().replace(/,/g, '');
    return parseInt(text, 10) || 0;
  }


  /* ═══════════════════════════════════════════════════════════════════════
     FEATURE — WORK, CHAPTER, AND LISTING BADGES
  ═══════════════════════════════════════════════════════════════════════ */

  buildTimeBadge(words, onWorkPage = false) {
    if (!this.cfg('showEstimate')) return '';
    if (onWorkPage && !this.cfg('estimateFicPage')) return '';
    if (words < 100) return '';
    const { NS } = this;
    const wpm = this.getWPM();
    const min = words / wpm;
    return `<span class="${NS}-wl-time" title="Reading time @ ${wpm} wpm">⏱ ${this.formatTime(min)}</span>`;
  }

  injectTimeBadge(ddEl, onWorkPage = false) {
    if (ddEl.querySelector(`.${this.NS}-wl-time`)) return;
    const words = this.parseWordCount(ddEl);
    const html  = this.buildTimeBadge(words, onWorkPage);
    if (html) ddEl.insertAdjacentHTML('beforeend', html);
  }

  injectPerChapter() {
    if (!this.cfg('showEstimate') || !this.cfg('estimatePerChapter')) return;
    const chapters = document.querySelectorAll('#chapters > .chapter');
    if (chapters.length <= 1) return;
    chapters.forEach(ch => {
      if (!ch.querySelector('.userstuff')) return;
      // Même extraction de prose (exclusion préfaces/notes) et même compteur
      // Unicode que chapterWordCount — les deux badges affichent maintenant
      // un nombre de mots cohérent (shared.md, Z1/Z2).
      const chWords = countWords(getChapterProse(ch));
      const min     = chWords / this.getWPM();
      const heading = ch.querySelector('h3.title, h2.heading, h3.heading, h2, h3');
      if (heading) upsertChapterBadgePart(heading, 'time', `${this.formatTime(min)} read`);
    });
  }

  injectOnListings() {
    if (!this.cfg('estimateListings')) return;
    document.querySelectorAll('.blurb .stats dd.words, .index .stats dd.words')
      .forEach(ddEl => this.injectTimeBadge(ddEl));
  }


  /* ═══════════════════════════════════════════════════════════════════════
     FEATURE LIFECYCLE
  ═══════════════════════════════════════════════════════════════════════ */

  setup() {
    const isWork = /^\/works\/\d+/.test(location.pathname);
    let observer = null;
    let active = true;

    if (isWork) {
      // #chapters peut ne pas encore être parsé quand ce module boote (surtout
      // sur un gros work) — injectPerChapter() n'a pas de retry, contrairement
      // à chapterWordCount ; sans ce report, le badge partagé (lib/ui/chapter-badge.js)
      // ne reçoit jamais sa partie « temps de lecture » sur un chargement lent.
      onReady(() => {
        if (!active) return;
        const stat = document.querySelector('dl.stats dd.words');
        if (stat) this.injectTimeBadge(stat, true);
        this.injectPerChapter();
      });
    } else {
      this.injectOnListings();

      if (this.cfg('estimateListings')) {
        observer = observe(document.body, { childList: true, subtree: true }, mutations => {
          mutations.forEach(mut => {
            mut.addedNodes.forEach(node => {
              if (!(node instanceof Element)) return;
              node.querySelectorAll?.('.stats dd.words').forEach(ddEl => this.injectTimeBadge(ddEl));
            });
          });
        });
      }
    }

    return function cleanup() {
      active = false;
      if (observer) { observer.disconnect(); observer = null; }
    };
  }

  reset() {
    const { NS } = this;
    document.querySelectorAll(`.${NS}-wl-time`).forEach(el => el.remove());
    removeChapterBadgePartsByKey('time');
  }
}
