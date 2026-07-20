/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Visual Preferences › Word Occurrence Counter

Purpose
    On a work page, counts how many times a character name (or any chosen
    word/phrase) appears in the fic's own text.

Notes
    Counts only the currently loaded chapters' prose (excludes summary,
    notes, and endnotes) — matches whole words/phrases, case-insensitively.
    The last searched word is remembered per browser (not per work).

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { getChapterProse } from '../../../../lib/ao3/work-page.js';

const NS = 'ao3h';
const LAST_WORD_KEY = `${NS}:vp:lastOccurrenceWord`;

export class WordOccurrenceCounter {
  /**
   * @param {{ countOccurrences?: (text: string, word: string) => number }} [opts]
   */
  constructor ({ countOccurrences } = {}) {
    this._widget = null;
    this._countOccurrences = countOccurrences || (() => 0);
  }

  _isWorkPage () {
    return /^\/works\/\d+/.test(location.pathname);
  }

  _runCount (word) {
    if (!word.trim()) return null;
    const text = getChapterProse();
    return this._countOccurrences(text, word);
  }

  _build () {
    const statsBlock = document.querySelector('#workskin')?.closest('#main')?.querySelector('dl.stats')
      || document.querySelector('dl.stats');
    if (!statsBlock) return;

    const wrap = document.createElement('div');
    wrap.className = `${NS}-word-occurrence`;

    const label = document.createElement('label');
    label.textContent = '🔍 Count in text:';
    label.htmlFor = `${NS}-word-occurrence-input`;

    const input = document.createElement('input');
    input.type = 'text';
    input.id = `${NS}-word-occurrence-input`;
    input.placeholder = 'e.g. a character name';
    let saved = '';
    try { saved = localStorage.getItem(LAST_WORD_KEY) || ''; } catch {}
    input.value = saved;

    const result = document.createElement('span');
    result.className = `${NS}-word-occurrence-result`;

    const refresh = () => {
      const word = input.value;
      try { localStorage.setItem(LAST_WORD_KEY, word); } catch {}
      const count = this._runCount(word);
      result.textContent = count === null ? '' : `${count} occurrence${count === 1 ? '' : 's'}`;
    };

    input.addEventListener('input', refresh);
    wrap.append(label, input, result);
    statsBlock.insertAdjacentElement('afterend', wrap);
    this._widget = wrap;

    if (saved) refresh();
  }

  apply (enabled) {
    this.reset();
    if (!enabled || !this._isWorkPage()) return;
    this._build();
  }

  reset () {
    this._widget?.remove();
    this._widget = null;
  }
}
