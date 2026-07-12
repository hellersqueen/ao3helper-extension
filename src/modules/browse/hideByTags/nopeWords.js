/* ─────────────────────────────────────────────────────────────────────────
   AO3 Helper — HideByTags › NopeWords sub-module
   Responsibilities:
     • NOPE word list storage (get / set / add / remove)
     • Text-based matching against blurb content (summary, notes, title)
     • NOPE Words Manager panel (open/close UI, export/import)
───────────────────────────────────────────────────────────────────────── */

const LS_MIRROR   = true;
const TM_KEY_NOPE = 'hideTagsNope';
const LS_KEY_NOPE = 'hideTagsNope';

export class NopeWords {
  /**
   * @param {{ NS: string, Storage: object, UserLS: object|null, KeyboardNav: object }} opts
   */
  constructor ({ NS, Storage, UserLS, KeyboardNav }) {
    this.NS          = NS;
    this.Storage     = Storage;
    this.UserLS      = UserLS;
    this.KeyboardNav = KeyboardNav || {};
  }

  // ── Internal helpers ───────────────────────────────────────────────────

  _lsGet (key, def) {
    try {
      const raw = this.UserLS
        ? this.UserLS.getItem(key)
        : localStorage.getItem(`${this.NS}:${key}`);
      return JSON.parse(raw || 'null') ?? def;
    } catch { return def; }
  }

  _lsSet (key, value) {
    try {
      const data = JSON.stringify(value);
      if (this.UserLS) this.UserLS.setItem(key, data);
      else localStorage.setItem(`${this.NS}:${key}`, data);
    } catch {}
  }

  // ── Storage ────────────────────────────────────────────────────────────

  async getNopeWords () {
    let list = (await this.Storage.get(TM_KEY_NOPE, [])) || [];
    if ((!list || !list.length) && LS_MIRROR) {
      const fromLS = this._lsGet(LS_KEY_NOPE, []);
      if (Array.isArray(fromLS) && fromLS.length) list = fromLS;
    }
    return list.map(s => String(s).trim().toLowerCase()).filter(Boolean);
  }

  async setNopeWords (arr) {
    const cleaned = Array.from(new Set(
      arr.map(s => String(s).trim().toLowerCase()).filter(Boolean)
    ));
    await this.Storage.set(TM_KEY_NOPE, cleaned);
    if (LS_MIRROR) this._lsSet(LS_KEY_NOPE, cleaned);
    return cleaned;
  }

  async addNopeWord (word) {
    const cur = await this.getNopeWords();
    const w   = String(word).trim().toLowerCase();
    if (w && !cur.includes(w)) { cur.push(w); await this.setNopeWords(cur); }
  }

  async removeNopeWord (word) {
    const cur = await this.getNopeWords();
    const w   = String(word).trim().toLowerCase();
    const idx = cur.indexOf(w);
    if (idx >= 0) { cur.splice(idx, 1); await this.setNopeWords(cur); }
  }

  // ── Matching ───────────────────────────────────────────────────────────

  /**
   * Returns the first matching NOPE word found in the blurb, or null.
   * @param {Element} blurb
   * @param {string[]} nopeWords  — already lowercased
   * @param {{ summaries: boolean, notes: boolean, titles: boolean }} targets
   */
  matchesNope (blurb, nopeWords, targets) {
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
      if (combined.includes(w)) return w;
    }
    return null;
  }

  // ── Manager panel ──────────────────────────────────────────────────────

  /**
   * Open the NOPE Words Manager modal.
   * @param {{ processList: Function, toast: Function }} callbacks
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
      <h3>AO3 Helper — NOPE Words</h3>
      <div class="${NS}-ul-head">
        <input class="${NS}-ul-search" type="search" placeholder="Search words…" />
        <span class="${NS}-ul-count">0 / 0</span>
      </div>
      <div class="${NS}-nope-add-row">
        <input class="${NS}-nope-add-input" type="text" placeholder="Add a word or phrase…" />
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
      const words = await self.getNopeWords();
      const qn    = ($search.value || '').trim().toLowerCase();

      const filtered = qn ? words.filter(w => w.includes(qn)) : words.slice();
      filtered.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

      const prevScrollTop = $list.scrollTop;
      $list.innerHTML = '';

      for (const word of filtered) {
        const row = document.createElement('div');
        row.className = `${NS}-ul-row`;

        const label = document.createElement('span');
        label.className   = `${NS}-ul-tag`;
        label.textContent = word;

        const del = document.createElement('button');
        del.className   = `${NS}-ul-btn ${NS}-ul-del`;
        del.textContent = '🗑️';
        del.title       = 'Remove this NOPE word';
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
            del.title = 'Remove this NOPE word';
          });

          confirm.addEventListener('click', async () => {
            await self.removeNopeWord(word);
            await processList();
            reload();
          });
        });

        row.append(label, del);
        $list.append(row);
      }

      $count.textContent = `${filtered.length} / ${words.length}`;
      try { $list.scrollTop = prevScrollTop; } catch {}
    };

    $search.addEventListener('input', () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(reload, 150);
    });

    const doAdd = async () => {
      const val = $addInput.value.trim();
      if (!val) return;
      await self.addNopeWord(val);
      $addInput.value = '';
      await processList();
      reload();
      try { toast(`Added: "${val}"`); } catch {}
    };

    $addBtn.addEventListener('click', doAdd);
    $addInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); doAdd(); }
    });

    box.querySelector(`.${NS}-ul-export`).addEventListener('click', async () => {
      const list = await self.getNopeWords();
      const blob = new Blob([JSON.stringify(list, null, 2)], { type: 'application/json' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url; a.download = 'ao3h-nope-words.json';
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
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
          const current = await self.getNopeWords();
          const merged  = Array.from(new Set(
            current.concat(incoming.map(s => String(s).trim().toLowerCase()))
          )).filter(Boolean);
          await self.setNopeWords(merged);
          await processList();
          reload();
          try { toast(`Imported ${incoming.length} words`); } catch {}
        } catch (err) { try { toast('Invalid JSON: ' + (err?.message || 'not a valid words array')); } catch {} }
      });
      input.click();
    });

    reload();
  }
}
