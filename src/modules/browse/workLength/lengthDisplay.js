/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Length Display Submodule
    Submodule ID: lengthDisplay
    Display Name: Length Display
    Parent Module: workLength

    Displays length category badges (⚡/📄/📖/📚) and famous book
    comparisons on work pages and listing blurbs. Absorbs pageCount.

    Config keys read:
        - showPageEquiv       → show "~X pages" badge
        - showLengthCategory  → show category emoji + label
        - thresholdShort      → word count ceiling for "Short story" tier
        - thresholdNovella    → word count ceiling for "Novella" tier

═══════════════════════════════════════════════════════════════════════════ */

import { onReady } from '../../../../lib/utils/index.js';

export class LengthDisplay {
  constructor(NS, cfg) {
    this.NS  = NS;
    this.cfg = cfg;

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

  findClosestBook(words) {
    return this.BOOK_COMPARISONS.reduce((prev, curr) =>
      Math.abs(curr.words - words) < Math.abs(prev.words - words) ? curr : prev
    );
  }

  parseWordCount(el) {
    const text = el.textContent.trim().replace(/,/g, '');
    return parseInt(text, 10) || 0;
  }

  getDynamicCategory(words) {
    const tShort   = this.cfg('thresholdShort')   ?? 17500;
    const tNovella = this.cfg('thresholdNovella') ?? 60000;
    if (words <= tShort)   return { name: 'Short story', emoji: '⚡', slug: 'short' };
    if (words <= tNovella) return { name: 'Novella',     emoji: '📄', slug: 'novella' };
    return                        { name: 'Novel',       emoji: '📖', slug: 'novel' };
  }

  buildBadgeHTML(words) {
    if (words < 100) return '';
    const { NS, cfg } = this;

    const cat     = this.getDynamicCategory(words);
    const book    = this.findClosestBook(words);
    const pctDiff = (Math.abs(words - book.words) / book.words * 100).toFixed(0);
    const sym     = pctDiff < 5 ? '≈' : words > book.words ? '>' : '<';

    let html = `<span class="${NS}-wl-badge" title="${words.toLocaleString()} words | ${book.title}: ${book.words.toLocaleString()} words">`;
    if (cfg('showLengthCategory') !== false) {
      html += `<span class="${NS}-wl-cat ${NS}-wl-cat--${cat.slug}">${cat.emoji} ${cat.name}</span>`;
    }
    html += `${sym} ${book.title}`;
    html += '</span>';

    if (cfg('showPageEquiv')) {
      const pages = Math.ceil(words / 275);
      html += `<span class="${NS}-wl-pages" title="~${pages} pages (@ 275 wpp)">📄 ~${pages} pg</span>`;
    }

    return html;
  }

  inject(ddEl) {
    if (ddEl.querySelector(`.${this.NS}-wl-badge`)) return;
    const words = this.parseWordCount(ddEl);
    const html  = this.buildBadgeHTML(words);
    if (html) ddEl.insertAdjacentHTML('beforeend', html);
  }

  injectListings() {
    document.querySelectorAll('.blurb .stats dd.words, .index .stats dd.words')
      .forEach(ddEl => this.inject(ddEl));
  }

  setup() {
    const isWork = /^\/works\/\d+/.test(location.pathname);
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
      } else {
        this.injectListings();

        observer = new MutationObserver(mutations => {
          mutations.forEach(mut => {
            mut.addedNodes.forEach(node => {
              if (node.nodeType !== Node.ELEMENT_NODE) return;
              node.querySelectorAll?.('.stats dd.words').forEach(ddEl => this.inject(ddEl));
            });
          });
        });
        observer.observe(document.body, { childList: true, subtree: true });
      }
    });

    return function cleanup() {
      active = false;
      if (observer) { observer.disconnect(); observer = null; }
    };
  }

  reset() {
    const { NS } = this;
    document.querySelectorAll(`.${NS}-wl-badge, .${NS}-wl-pages`).forEach(el => el.remove());
  }
}
