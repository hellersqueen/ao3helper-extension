/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Work Length › Length Display

Adds configurable length-category, book-comparison, and page-equivalent badges
to AO3 word counts on work pages and listing blurbs.

Notes

- Category thresholds come from the parent Work Length configuration.
- Page equivalents use an estimate of 275 words per page.
- Book comparisons select the reference with the nearest word count.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { onReady, observe } from '../../../../lib/utils/index.js';
import { parseStatNumber } from '../../../../lib/ao3/work-stats.js';


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

export class LengthDisplay {
  constructor(NS, cfg, helpers) {
    this.NS  = NS;
    this.cfg = cfg;
    this.helpers = helpers;

    this.BOOK_COMPARISONS = [
      { title: 'The Great Gatsby',                          words:  47094 },
      { title: 'Animal Farm',                               words:  29966 },
      { title: 'Of Mice and Men',                           words:  29160 },
      { title: 'The Hobbit',                                words:  95356 },
      { title: "Harry Potter and the Sorcerer's Stone",     words:  77325 },
      { title: 'Harry Potter and the Chamber of Secrets',   words:  84799 },
      { title: 'Harry Potter and the Prisoner of Azkaban',  words: 106821 },
      { title: 'Harry Potter and the Goblet of Fire',       words: 190858 },
      { title: 'Harry Potter and the Order of the Phoenix', words: 257045 },
      { title: 'The Hunger Games',                          words: 101564 },
      { title: 'Twilight',                                  words: 118975 },
      { title: 'Pride and Prejudice',                       words: 122189 },
      { title: '1984',                                      words:  88942 },
      { title: 'To Kill a Mockingbird',                     words: 100388 },
      { title: 'The Catcher in the Rye',                    words:  73404 },
      { title: 'Lord of the Flies',                         words:  59900 },
      { title: 'Fahrenheit 451',                            words:  46118 },
      { title: 'The Lord of the Rings (all)',               words: 481103 },
    ];
  }


  /* ═══════════════════════════════════════════════════════════════════════
     FEATURE — LENGTH CATEGORIES AND BOOK COMPARISONS
  ═══════════════════════════════════════════════════════════════════════ */

  /** Built-in references plus the user's own comparison books. */
  getBooks() {
    const custom = this.helpers.parseCustomBooks(this.cfg('customBooks'));
    return custom.length ? this.BOOK_COMPARISONS.concat(custom) : this.BOOK_COMPARISONS;
  }

  findClosestBook(words) {
    return this.getBooks().reduce((prev, curr) =>
      Math.abs(curr.words - words) < Math.abs(prev.words - words) ? curr : prev
    );
  }

  getDynamicCategory(words) {
    const tFlash   = this.cfg('thresholdFlash')   ?? 1000;
    const tShort   = this.cfg('thresholdShort')   ?? 17500;
    const tNovella = this.cfg('thresholdNovella') ?? 60000;
    const tEpic    = this.cfg('thresholdEpic')    ?? 150000;
    if (words <= tFlash)   return { name: 'Flash Fiction', emoji: '🔥', slug: 'flash' };
    if (words <= tShort)   return { name: 'Short story',   emoji: '⚡', slug: 'short' };
    if (words <= tNovella) return { name: 'Novella',       emoji: '📄', slug: 'novella' };
    if (words <= tEpic)    return { name: 'Novel',         emoji: '📖', slug: 'novel' };
    return                        { name: 'Epic Novel',    emoji: '📚', slug: 'epic' };
  }

  buildBadgeHTML(words) {
    if (words < 100) return '';
    const { NS, cfg } = this;

    const cat     = this.getDynamicCategory(words);
    const book    = this.findClosestBook(words);
    const pctDiff = (Math.abs(words - book.words) / book.words * 100).toFixed(0);
    const sym     = Number(pctDiff) < 5 ? '≈' : words > book.words ? '>' : '<';

    let html = `<span class="${NS}-wl-badge" title="${words.toLocaleString()} words | ${book.title}: ${book.words.toLocaleString()} words">`;
    if (cfg('showLengthCategory') !== false) {
      html += `<span class="${NS}-wl-cat ${NS}-wl-cat--${cat.slug}">${cat.emoji} ${cat.name}</span>`;
    }
    html += `${sym} ${book.title}`;
    html += '</span>';

    if (cfg('showPageEquiv')) {
      const wpp   = parseInt(String(cfg('wordsPerPage') ?? 275), 10) || 275;
      const pages = Math.ceil(words / wpp);
      const label = this.helpers.formatPages(pages, cfg('pageFormat') || 'compact');
      html += `<span class="${NS}-wl-pages" title="~${pages} pages (@ ${wpp} wpp)">📄 ${label}</span>`;
    }

    return html;
  }


  /* ═══════════════════════════════════════════════════════════════════════
     FEATURE — BADGE INJECTION
  ═══════════════════════════════════════════════════════════════════════ */

  inject(ddEl) {
    if (ddEl.querySelector(`.${this.NS}-wl-badge`)) return;
    const words = parseStatNumber(ddEl);
    const html  = this.buildBadgeHTML(words);
    if (html) ddEl.insertAdjacentHTML('beforeend', html);
  }

  injectListings() {
    document.querySelectorAll('.blurb .stats dd.words, .index .stats dd.words')
      .forEach(ddEl => this.inject(ddEl));
    this.applyGradient();
  }

  /** Tint each word-count stat relative to the shortest/longest work listed. */
  applyGradient() {
    if (!this.cfg('lengthGradient')) return;
    const ddEls = [...document.querySelectorAll('.blurb .stats dd.words, .index .stats dd.words')];
    const counts = ddEls.map(el => parseStatNumber(el)).filter(w => w > 0);
    if (counts.length < 2) return;
    const min = Math.min(...counts), max = Math.max(...counts);
    ddEls.forEach(el => {
      const words = parseStatNumber(el);
      if (words > 0) {
        el.classList.add(`${this.NS}-wl-gradient`);
        el.style.backgroundColor = this.helpers.gradientColor(words, min, max);
      }
    });
  }

  /** "📊 ~X w/ch" on a work page's stats line (multi-chapter works only). */
  injectAvgChapterLength() {
    if (!this.cfg('showAvgChapterLength')) return;
    const wordsEl    = document.querySelector('dl.stats dd.words');
    const chaptersEl = document.querySelector('dl.stats dd.chapters');
    if (!wordsEl || !chaptersEl || wordsEl.querySelector(`.${this.NS}-wl-avgch`)) return;
    const progress = this.helpers.parseChapterProgress(chaptersEl.textContent);
    if (!progress || progress.published < 2) return;
    const avg = this.helpers.avgChapterWords(parseStatNumber(wordsEl), progress.published);
    if (!avg) return;
    wordsEl.insertAdjacentHTML('beforeend',
      `<span class="${this.NS}-wl-avgch" title="Average chapter length (${progress.published} chapters)">📊 ~${avg.toLocaleString()} w/ch</span>`);
  }

  /** Total word count (and page equivalent) of a whole series page. */
  injectSeriesTotal() {
    if (this.cfg('showSeriesTotal') === false) return;
    if (document.querySelector(`.${this.NS}-wl-series-total`)) return;
    const ddEls = [...document.querySelectorAll('li.blurb .stats dd.words')];
    if (ddEls.length < 2) return;
    const total = ddEls.reduce((sum, el) => sum + parseStatNumber(el), 0);
    if (total < 100) return;

    const banner = document.createElement('div');
    banner.className = `${this.NS}-wl-series-total`;
    let text = `Σ ${total.toLocaleString()} words across ${ddEls.length} works`;
    if (this.cfg('showPageEquiv')) {
      const wpp = parseInt(String(this.cfg('wordsPerPage') ?? 275), 10) || 275;
      text += ` (📄 ${this.helpers.formatPages(Math.ceil(total / wpp), this.cfg('pageFormat') || 'compact')})`;
    }
    banner.textContent = text;
    const anchor = document.querySelector('#main h2.heading');
    if (anchor) anchor.insertAdjacentElement('afterend', banner);
    else document.querySelector('#main')?.prepend(banner);
  }


  /* ═══════════════════════════════════════════════════════════════════════
     FEATURE LIFECYCLE
  ═══════════════════════════════════════════════════════════════════════ */

  setup() {
    const isWork   = /^\/works\/\d+/.test(location.pathname);
    const isSeries = /^\/series\/\d+/.test(location.pathname);
    let observer = null;
    let active = true;

    // document.body peut ne pas encore exister quand ce module boote — sans ce
    // report, l'observer plantait (Cannot read properties of null), constaté
    // sur plusieurs modules similaires en test (même bug que readingTime.js).
    onReady(() => {
      if (!active) return;
      if (isWork) {
        const stat = document.querySelector('dl.stats dd.words');
        if (stat) this.inject(stat);
        this.injectAvgChapterLength();
      } else {
        if (isSeries) this.injectSeriesTotal();
        this.injectListings();

        observer = observe(document.body, { childList: true, subtree: true }, mutations => {
          let added = false;
          mutations.forEach(mut => {
            mut.addedNodes.forEach(node => {
              if (!(node instanceof Element)) return;
              node.querySelectorAll?.('.stats dd.words').forEach(ddEl => { this.inject(ddEl); added = true; });
            });
          });
          if (added) this.applyGradient();
        });
      }
    });

    return function cleanup() {
      active = false;
      if (observer) { observer.disconnect(); observer = null; }
    };
  }

  reset() {
    const { NS } = this;
    document.querySelectorAll(`.${NS}-wl-badge, .${NS}-wl-pages, .${NS}-wl-avgch, .${NS}-wl-series-total`).forEach(el => el.remove());
    document.querySelectorAll(`.${NS}-wl-gradient`).forEach(el => {
      el.classList.remove(`${NS}-wl-gradient`);
      el.style.backgroundColor = '';
    });
  }
}
