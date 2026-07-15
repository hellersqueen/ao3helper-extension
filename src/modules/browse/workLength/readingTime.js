/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Reading Time Submodule
    Submodule ID: readingTime
    Display Name: Reading Time
    Parent Module: workLength

    Calculates and displays reading time estimates based on WPM settings.
    Shows time on work pages, per-chapter, and optionally on listings.

    Config keys read:
        - showEstimate        → master toggle
        - estimateFicPage     → show on work page
        - estimatePerChapter  → show per chapter
        - estimateListings    → show on listing blurbs
        - readSpeed           → 'slow' | 'average' | 'fast' | 'custom'
        - customWPM           → number (when readSpeed = 'custom')

═══════════════════════════════════════════════════════════════════════════ */

import { upsertChapterBadgePart, removeChapterBadgePartsByKey } from '../../../../lib/ui/chapter-badge.js';
import { onReady } from '../../../../lib/utils/index.js';

export class ReadingTime {
  constructor(NS, cfg) {
    this.NS  = NS;
    this.cfg = cfg;
    this.WPM_MAP = { slow: 150, average: 250, fast: 400 };
  }

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
      const userstuff = ch.querySelector('.userstuff');
      if (!userstuff) return;
      const chWords = (userstuff.textContent || '').split(/\s+/).filter(Boolean).length;
      const min     = chWords / this.getWPM();
      // Même sélecteur d'ancrage que chapterWordCount (reading/chapter-navigation)
      // pour que les deux modules partagent le même badge (shared.md, Z2).
      const heading = ch.querySelector('h3.title, h2.heading, h3.heading, h2, h3');
      if (heading) upsertChapterBadgePart(heading, 'time', `${this.formatTime(min)} read`);
    });
  }

  injectOnListings() {
    if (!this.cfg('estimateListings')) return;
    document.querySelectorAll('.blurb .stats dd.words, .index .stats dd.words')
      .forEach(ddEl => this.injectTimeBadge(ddEl));
  }

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
        observer = new MutationObserver(mutations => {
          mutations.forEach(mut => {
            mut.addedNodes.forEach(node => {
              if (node.nodeType !== Node.ELEMENT_NODE) return;
              node.querySelectorAll?.('.stats dd.words').forEach(ddEl => this.injectTimeBadge(ddEl));
            });
          });
        });
        observer.observe(document.body, { childList: true, subtree: true });
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
