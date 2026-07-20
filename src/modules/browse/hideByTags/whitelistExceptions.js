/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Hide By Tags › Whitelist Exceptions

Stores whitelist tags, identifies exceptions that rescue otherwise hidden
works, and provides the manager used to maintain and transfer the whitelist.

Notes

- Whitelist tags use the shared mirrored-list store.
- The coordinator supplies canonical work tags for exception matching.
- A work may be rescued by more than one whitelist tag.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { createMirroredListStore } from '../../../../lib/storage/mirrored-list.js';
import { openListManagerDialog } from '../../../../lib/ui/list-manager.js';


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const TM_KEY_WL = 'hideTagsWhitelist';

export class WhitelistExceptions {
  /**
   * @param {{ NS: string, Storage: any, UserLS: any, KeyboardNav: any }} opts
   */
  constructor ({ NS, Storage, UserLS, KeyboardNav }) {
    this.NS          = NS;
    this.Storage     = Storage;
    this.UserLS      = UserLS;
    this.KeyboardNav = KeyboardNav || {};
    this._store = createMirroredListStore({ key: TM_KEY_WL, Storage, UserLS, NS });
  }


  /* ═══════════════════════════════════════════════════════════════════════
     FEATURE — WHITELIST STORAGE AND EXCEPTION MATCHING
  ═══════════════════════════════════════════════════════════════════════ */

  async getWhitelistTags () {
    return this._store.get();
  }

  async setWhitelistTags (arr) {
    return this._store.set(arr);
  }

  async addWhitelistTag (canon) {
    return this._store.add(canon);
  }

  async removeWhitelistTag (canon) {
    return this._store.remove(canon);
  }

  /**
   * Given the canonical tags of a blurb and the active whitelist Set,
   * returns the list of whitelist tags that rescue this work (or []).
   * @param {string[]} blurbTags  — canonical tags from the blurb
   * @param {Set<string>} wlSet
   */
  savedBy (blurbTags, wlSet) {
    if (!Array.isArray(blurbTags) || !blurbTags.length) return [];
    if (!(wlSet instanceof Set)) return [];
    return blurbTags.filter(t => wlSet.has(t));
  }


  /* ═══════════════════════════════════════════════════════════════════════
     FEATURE — WHITELIST MANAGER
  ═══════════════════════════════════════════════════════════════════════ */

  /**
   * Open the Whitelist Manager modal.
   * @param {{ processList: Function, toast: Function }} callbacks
   */
  openManager ({ processList, toast }) {
    const self = this;

    openListManagerDialog({
      NS: this.NS,
      KeyboardNav: this.KeyboardNav,
      title: 'AO3 Helper — Whitelist Exceptions',
      searchPlaceholder: 'Search tags…',
      load: () => self.getWhitelistTags(),
      removeButtonTitle: 'Remove this whitelist tag',
      onRemove: async (tag) => {
        await self.removeWhitelistTag(tag);
        if (typeof processList === 'function') await processList();
      },
      add: {
        placeholder: 'Add a tag…',
        onAdd: async (raw) => {
          const val = raw.toLowerCase();
          await self.addWhitelistTag(val);
          try { toast(`Added: "${val}"`); } catch {}
        },
      },
      exportItems: { filename: 'ao3h-whitelist-tags.json' },
      importItems: async (incoming) => {
        if (!Array.isArray(incoming)) throw new Error('not a valid tags array');
        const current = await self.getWhitelistTags();
        await self.setWhitelistTags(current.concat(incoming));
        try { toast(`Imported ${incoming.length} tags`); } catch {}
      },
      toast: (msg) => { try { toast(msg); } catch {} },
    });
  }


  /* ═══════════════════════════════════════════════════════════════════════
     FEATURE LIFECYCLE
  ═══════════════════════════════════════════════════════════════════════ */

  // Each manager instance owns and removes its modal-level listeners on close.
}
