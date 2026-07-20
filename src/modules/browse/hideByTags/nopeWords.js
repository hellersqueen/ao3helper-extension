/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Hide By Tags › NOPE Words

Stores text filters, matches them against selected work-blurb content, and
provides the manager used to add, remove, import, and export NOPE words.

Notes

- Words are stored through the shared mirrored-list store.
- Matching targets are selected by the coordinator and supplied per work.
- Text matching remains case-insensitive substring matching.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { createMirroredListStore } from '../../../../lib/storage/mirrored-list.js';
import { openListManagerDialog } from '../../../../lib/ui/list-manager.js';


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const TM_KEY_NOPE = 'hideTagsNope';

const _escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Matches one NOPE entry against the lowercased combined text.
 * Entry forms (exported for tests):
 * - "/pattern/"      → regular expression (case-insensitive; invalid
 *                      patterns fall back to a plain substring match)
 * - "her*t"          → wildcard: * matches any run of characters
 * - "word"           → substring, or whole-word when opts.wholeWords
 */
export function matchesNopeEntry (combined, entry, opts = {}) {
  const w = String(entry || '');
  if (!w) return false;

  // /regex/ syntax
  if (w.length > 2 && w.startsWith('/') && w.endsWith('/')) {
    try { return new RegExp(w.slice(1, -1), 'i').test(combined); }
    catch { return combined.includes(w); }
  }

  // * wildcards
  if (w.includes('*')) {
    try {
      const pattern = w.split('*').map(_escapeRegex).join('.*');
      return new RegExp(pattern, 'i').test(combined);
    } catch { return combined.includes(w); }
  }

  // plain word
  if (opts.wholeWords) {
    try { return new RegExp(`(^|\\W)${_escapeRegex(w)}(\\W|$)`, 'i').test(combined); }
    catch { return combined.includes(w); }
  }
  return combined.includes(w);
}

export class NopeWords {
  /**
   * @param {{ NS: string, Storage: any, UserLS: any, KeyboardNav: any }} opts
   */
  constructor ({ NS, Storage, UserLS, KeyboardNav }) {
    this.NS          = NS;
    this.Storage     = Storage;
    this.UserLS      = UserLS;
    this.KeyboardNav = KeyboardNav || {};
    this._store = createMirroredListStore({ key: TM_KEY_NOPE, Storage, UserLS, NS });
  }


  /* ═══════════════════════════════════════════════════════════════════════
     FEATURE — WORD STORAGE AND TEXT MATCHING
  ═══════════════════════════════════════════════════════════════════════ */

  async getNopeWords () {
    return this._store.get();
  }

  async setNopeWords (arr) {
    return this._store.set(arr);
  }

  async addNopeWord (word) {
    return this._store.add(word);
  }

  async removeNopeWord (word) {
    return this._store.remove(word);
  }

  /**
   * Returns the first matching NOPE word found in the blurb, or null.
   * @param {Element} blurb
   * @param {string[]} nopeWords  — already lowercased
   * @param {{ summaries: boolean, notes: boolean, titles: boolean }} targets
   * @param {{ wholeWords?: boolean }} opts - wholeWords: plain words only
   *   match at word boundaries ("art" no longer hides "heart")
   */
  matchesNope (blurb, nopeWords, targets, opts = {}) {
    if (!Array.isArray(nopeWords) || !nopeWords.length) return null;
    if (!targets || typeof targets !== 'object') return null;
    const NS    = this.NS;
    const scope = blurb.querySelector(`.${NS}-cut`) || blurb;
    const parts = [];

    if (targets.summaries) {
      scope.querySelectorAll('blockquote.userstuff.summary, dd.summary .userstuff')
        .forEach(el => parts.push(el.textContent));
    }
    if (targets.notes) {
      scope.querySelectorAll('div.notes .userstuff, div.endnotes .userstuff')
        .forEach(el => parts.push(el.textContent));
    }
    if (targets.titles) {
      const h = scope.querySelector('.header .heading, h4.heading');
      if (h) parts.push(h.textContent);
    }

    const combined = parts.join(' ').toLowerCase();
    for (const w of nopeWords) {
      if (matchesNopeEntry(combined, w, opts)) return w;
    }
    return null;
  }


  /* ═══════════════════════════════════════════════════════════════════════
     FEATURE — NOPE WORDS MANAGER
  ═══════════════════════════════════════════════════════════════════════ */

  /**
   * Open the NOPE Words Manager modal.
   * @param {{ processList: Function, toast: Function }} callbacks
   */
  openManager ({ processList, toast }) {
    const self = this;

    openListManagerDialog({
      NS: this.NS,
      KeyboardNav: this.KeyboardNav,
      title: 'AO3 Helper — NOPE Words',
      searchPlaceholder: 'Search words…',
      load: () => self.getNopeWords(),
      removeButtonTitle: 'Remove this NOPE word',
      onRemove: async (word) => {
        await self.removeNopeWord(word);
        await processList();
      },
      add: {
        placeholder: 'Add a word or phrase…',
        onAdd: async (val) => {
          await self.addNopeWord(val);
          await processList();
          try { toast(`Added: "${val}"`); } catch {}
        },
      },
      exportItems: { filename: 'ao3h-nope-words.json' },
      importItems: async (incoming) => {
        if (!Array.isArray(incoming)) throw new Error('not a valid words array');
        const current = await self.getNopeWords();
        await self.setNopeWords(current.concat(incoming));
        await processList();
        try { toast(`Imported ${incoming.length} words`); } catch {}
      },
      toast: (msg) => { try { toast(msg); } catch {} },
    });
  }


  /* ═══════════════════════════════════════════════════════════════════════
     FEATURE LIFECYCLE
  ═══════════════════════════════════════════════════════════════════════ */

  // Each manager instance owns and removes its modal-level listeners on close.
}
