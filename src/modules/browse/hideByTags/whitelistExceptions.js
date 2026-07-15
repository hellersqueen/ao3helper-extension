/* ─────────────────────────────────────────────────────────────────────────
   AO3 Helper — HideByTags › WhitelistExceptions sub-module
   Responsibilities:
     • Whitelist tag storage (get / set / add / remove)
     • Whitelist matching: given a blurb's tags + blacklist reasons, decide
       whether the work should be rescued and how to present it
     • Whitelist Manager panel (open/close UI, export/import)
───────────────────────────────────────────────────────────────────────── */

import { downloadJSON } from '../../../../lib/utils/json-file.js';
import { createMirroredListStore } from '../../../../lib/storage/mirrored-list.js';

const TM_KEY_WL  = 'hideTagsWhitelist';

export class WhitelistExceptions {
  /**
   * @param {{ NS: string, Storage: object, UserLS: object|null, KeyboardNav: object }} opts
   */
  constructor ({ NS, Storage, UserLS, KeyboardNav }) {
    this.NS          = NS;
    this.Storage     = Storage;
    this.UserLS      = UserLS;
    this.KeyboardNav = KeyboardNav || {};
    this._store = createMirroredListStore({ key: TM_KEY_WL, Storage, UserLS, NS });
  }

  // ── Storage ────────────────────────────────────────────────────────────

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

  // ── Matching ───────────────────────────────────────────────────────────

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

  // ── Manager panel ──────────────────────────────────────────────────────

  /**
   * Open the Whitelist Manager modal.
   * @param {{ toast: Function }} callbacks
   */
  openManager ({ processList, toast }) {
    const NS          = this.NS;
    const KeyboardNav = this.KeyboardNav || {};
    const self        = this;

    const backdrop = document.createElement('div');
    backdrop.className = `${NS}-mgr-backdrop`;

    const box = document.createElement('div');
    box.className = `${NS}-mgr`;
    box.innerHTML = `
      <button class="${NS}-close-x" type="button" aria-label="Close" title="Close">×</button>
      <h3>AO3 Helper — Whitelist Exceptions</h3>
      <div class="${NS}-ul-head">
        <input class="${NS}-ul-search" type="search" placeholder="Search tags…" />
        <span class="${NS}-ul-count">0 / 0</span>
      </div>
      <div class="${NS}-nope-add-row">
        <input class="${NS}-nope-add-input" type="text" placeholder="Add a tag…" />
        <button class="${NS}-ul-btn ${NS}-nope-add-btn" type="button">Add</button>
      </div>
      <div class="${NS}-ul-actions">
        <button class="${NS}-ul-btn ${NS}-ul-export" type="button">Export JSON</button>
        <button class="${NS}-ul-btn ${NS}-ul-import" type="button">Import JSON</button>
      </div>
      <div class="${NS}-ul-list" aria-live="polite"></div>
    `;

    let cleanupKeyboard = null;
    let focusTrap       = null;

    const close = () => {
      try { cleanupKeyboard?.(); } catch {}
      try { focusTrap?.deactivate(); } catch {}
      document.documentElement.classList.remove(`${NS}-lock`);
      document.body.classList.remove(`${NS}-lock`);
      const y = parseInt(document.body.dataset[`${NS}ScrollY`] || '0', 10);
      document.body.style.top = '';
      delete document.body.dataset[`${NS}ScrollY`];
      window.scrollTo(0, y);
      backdrop.remove();
      box.remove();
    };

    backdrop.addEventListener('click', close);
    backdrop.addEventListener('wheel',     e => e.preventDefault(), { passive: false });
    backdrop.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
    box.querySelector(`.${NS}-close-x`).addEventListener('click', close);

    if (KeyboardNav.setupMenuKeyboardNav) {
      cleanupKeyboard = KeyboardNav.setupMenuKeyboardNav(box, { onClose: close, vertical: true });
    }
    if (KeyboardNav.createFocusTrap) {
      focusTrap = KeyboardNav.createFocusTrap(box);
      focusTrap.activate();
    }
    document.addEventListener('keydown', function esc (e) {
      if (e.key !== 'Escape') return;
      close();
      document.removeEventListener('keydown', esc);
    });

    document.body.append(backdrop, box);

    // Lock scroll
    document.documentElement.classList.add(`${NS}-lock`);
    document.body.classList.add(`${NS}-lock`);
    const y = window.scrollY || window.pageYOffset || 0;
    document.body.dataset[`${NS}ScrollY`] = String(y);
    document.body.style.top = `-${y}px`;

    const $search   = box.querySelector(`.${NS}-ul-search`);
    const $count    = box.querySelector(`.${NS}-ul-count`);
    const $list     = box.querySelector(`.${NS}-ul-list`);
    const $addInput = box.querySelector(`.${NS}-nope-add-input`);
    const $addBtn   = box.querySelector(`.${NS}-nope-add-btn`);

    let searchTimer = 0;

    const reload = async () => {
      const tags = await self.getWhitelistTags();
      const qn   = ($search.value || '').trim().toLowerCase();

      const filtered = qn ? tags.filter(t => t.includes(qn)) : tags.slice();
      filtered.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

      const prevScrollTop = $list.scrollTop;
      $list.innerHTML = '';

      for (const tag of filtered) {
        const row = document.createElement('div');
        row.className = `${NS}-ul-row`;

        const label = document.createElement('span');
        label.className   = `${NS}-ul-tag`;
        label.textContent = tag;

        const del = document.createElement('button');
        del.className   = `${NS}-ul-btn ${NS}-ul-del`;
        del.textContent = '🗑️';
        del.title       = 'Remove this whitelist tag';
        del.addEventListener('click', async () => {
          if (del.dataset.confirming === 'true') return;
          del.dataset.confirming = 'true';
          del.title = '';

          const confirm = document.createElement('button');
          confirm.className   = `${NS}-ul-btn ${NS}-ul-del-confirm`;
          confirm.textContent = '✓';
          confirm.title       = 'Confirm removal';

          const cancel = document.createElement('button');
          cancel.className   = `${NS}-ul-btn ${NS}-ul-del-cancel`;
          cancel.textContent = '✗';
          cancel.title       = 'Cancel';

          del.replaceWith(confirm, cancel);

          cancel.addEventListener('click', () => {
            confirm.replaceWith(del);
            cancel.remove();
            delete del.dataset.confirming;
            del.title = 'Remove this whitelist tag';
          });

          confirm.addEventListener('click', async () => {
            await self.removeWhitelistTag(tag);
            if (typeof processList === 'function') await processList();
            reload();
          });
        });

        row.append(label, del);
        $list.append(row);
      }

      $count.textContent = `${filtered.length} / ${tags.length}`;
      try { $list.scrollTop = prevScrollTop; } catch {}
    };

    $search.addEventListener('input', () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(reload, 150);
    });

    const doAdd = async () => {
      const val = $addInput.value.trim().toLowerCase();
      if (!val) return;
      await self.addWhitelistTag(val);
      $addInput.value = '';
      reload();
      try { toast(`Added: "${val}"`); } catch {}
    };

    $addBtn.addEventListener('click', doAdd);
    $addInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); doAdd(); }
    });

    box.querySelector(`.${NS}-ul-export`).addEventListener('click', async () => {
      const list = await self.getWhitelistTags();
      downloadJSON(list, 'ao3h-whitelist-tags.json');
    });

    box.querySelector(`.${NS}-ul-import`).addEventListener('click', async () => {
      const input  = document.createElement('input');
      input.type   = 'file';
      input.accept = 'application/json';
      input.addEventListener('change', async () => {
        const file = input.files?.[0];
        if (!file) return;
        try {
          const incoming = JSON.parse(await file.text());
          if (!Array.isArray(incoming)) throw new Error('Not an array');
          const current = await self.getWhitelistTags();
          const merged  = Array.from(new Set(
            current.concat(incoming.map(s => String(s).trim().toLowerCase()))
          )).filter(Boolean);
          await self.setWhitelistTags(merged);
          reload();
          try { toast(`Imported ${incoming.length} tags`); } catch {}
        } catch (err) { try { toast('Invalid JSON: ' + (err?.message || 'not a valid tags array')); } catch {} }
      });
      input.click();
    });

    reload();
  }
}
