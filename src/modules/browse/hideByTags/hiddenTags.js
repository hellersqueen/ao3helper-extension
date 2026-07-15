/* ─────────────────────────────────────────────────────────────────────────
   AO3 Helper — HideByTags › HiddenTags sub-module
   Responsibilities:
     • Tag blacklist storage (get / set / add)
     • Group-map storage (get / set)
     • Tag canonicalisation & matching
     • Inline 🚫 icon injection on tag links
     • Hidden Tags Manager panel (open/close UI, export/import)
───────────────────────────────────────────────────────────────────────── */

import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { downloadJSON } from '../../../../lib/utils/json-file.js';
import { extractWorkIdFromBlurb } from '../../../../lib/ao3/parsers.js';
import { loadModuleSettings } from '../../../../lib/storage/module-settings.js';

const W = getGlobalWindow();

// ── Constants ────────────────────────────────────────────────────────────
const LS_MIRROR      = true;
const TM_KEY         = 'hideTags';
const LS_KEY         = 'hideTags';
const TM_KEY_GROUPS  = 'hideTagsGroups';
const LS_KEY_GROUPS  = 'hideTagsGroups';
const LS_KEY_COLLAPSED = 'hideTagsGroupsCollapsed';

export class HiddenTags {
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

  // ── Canonicalisation ───────────────────────────────────────────────────

  canonicalFromAnchor (a) {
    try {
      const href = a.getAttribute('href') || '';
      const m    = href.match(/\/tags\/([^/]+)/);
      if (!m) return null;
      let s = decodeURIComponent(m[1]).replace(/\+/g, ' ');
      s = s.replace(/\*a\*/gi, '&').replace(/\*s\*/gi, '/');
      return s.replace(/\s+/g, ' ').replace(/ /g, ' ').trim().toLowerCase();
    } catch { return null; }
  }

  toNorm (s) {
    const base = (s || '').normalize('NFD').toLowerCase().trim();
    try   { return base.replace(/\p{Diacritic}/gu, ''); }
    catch { return base.replace(/[̀-ͯ]/g, ''); }
  }

  // ── Blacklist storage ──────────────────────────────────────────────────

  async getHidden () {
    let list = (await this.Storage.get(TM_KEY, [])) || [];
    if ((!list || !list.length) && LS_MIRROR) {
      const fromLS = this._lsGet(LS_KEY, []);
      if (Array.isArray(fromLS) && fromLS.length) list = fromLS;
    }
    return list;
  }

  async setHidden (arr) {
    const cleaned = Array.from(new Set(
      arr.map(s => String(s).trim().toLowerCase()).filter(Boolean)
    ));
    await this.Storage.set(TM_KEY, cleaned);
    if (LS_MIRROR) this._lsSet(LS_KEY, cleaned);
    return cleaned;
  }

  async addHiddenTag (canon) {
    const cur = await this.getHidden();
    if (!cur.includes(canon)) { cur.push(canon); await this.setHidden(cur); }
  }

  async removeHiddenTag (canon) {
    const cur = await this.getHidden();
    const idx = cur.indexOf(canon);
    if (idx >= 0) { cur.splice(idx, 1); await this.setHidden(cur); }
  }

  // ── Group-map storage ──────────────────────────────────────────────────

  async getGroupsMap () {
    let map = (await this.Storage.get(TM_KEY_GROUPS, {})) || {};
    if ((!map || !Object.keys(map).length) && LS_MIRROR) {
      const fromLS = this._lsGet(LS_KEY_GROUPS, {});
      if (fromLS && typeof fromLS === 'object') map = fromLS;
    }
    const cleaned = {};
    for (const [k, v] of Object.entries(map)) {
      if (!k) continue;
      cleaned[String(k).toLowerCase()] = String(v || '').trim();
    }
    return cleaned;
  }

  async setGroupsMap (map) {
    const hidden        = await this.getHidden();
    const setHiddenTags = new Set(hidden);
    const cleaned       = {};
    for (const [k, v] of Object.entries(map || {})) {
      const key = String(k).toLowerCase();
      if (setHiddenTags.has(key)) cleaned[key] = String(v || '').trim();
    }
    await this.Storage.set(TM_KEY_GROUPS, cleaned);
    if (LS_MIRROR) this._lsSet(LS_KEY_GROUPS, cleaned);
    return cleaned;
  }

  // ── Collapsed-groups state ─────────────────────────────────────────────

  getCollapsedSet () {
    try {
      const arr = this._lsGet(LS_KEY_COLLAPSED, []);
      return new Set(Array.isArray(arr) ? arr : []);
    } catch { return new Set(); }
  }

  setCollapsedSet (set) {
    this._lsSet(LS_KEY_COLLAPSED, [...set]);
  }

  // ── Matching ───────────────────────────────────────────────────────────

  /** Returns the canonical forms of hidden tags found in `scope`. */
  reasonsFor (scope, hiddenSet) {
    if (!(hiddenSet instanceof Set)) return [];
    const canon = Array.from(scope.querySelectorAll('a.tag'))
      .map(a => this.canonicalFromAnchor(a))
      .filter(Boolean);
    return canon.filter(t => hiddenSet.has(t));
  }

  // ── Inline icon injection ──────────────────────────────────────────────

  ensureInlineIcons (root = document, getWorkBlurbs) {
    if (loadModuleSettings('hideByTags').quickAddIcon === false) return;
    const scopes = getWorkBlurbs(root);
    if (scopes.length === 0) {
      const fallback = document.querySelector('#workskin') ||
                       document.querySelector('#main') || document;
      scopes.push(fallback);
    }
    scopes.forEach(scope => this._ensureInlineIconsFor(scope));
  }

  _ensureInlineIconsFor (scope) {
    const NS   = this.NS;
    const tags = Array.from(scope.querySelectorAll('a.tag'));
    const managedLists = new Set();

    tags.forEach(a => {
      a.classList.add(`${NS}-tag-wrap`);

      if (!a.querySelector(`.${NS}-hide-ico`)) {
        const canon = this.canonicalFromAnchor(a);
        if (canon) {
          const ico = document.createElement('span');
          ico.className  = `${NS}-hide-ico`;
          ico.title      = 'Hide this tag from results';
          ico.setAttribute('role', 'button');
          ico.setAttribute('aria-label', `Hide tag "${canon}"`);
          ico.dataset.tag = canon;
          ico.textContent = '🚫';
          a.appendChild(ico);
        }
      }

      if (!a.querySelector(`.${NS}-tag-txt`)) {
        for (let n = a.firstChild; n; n = n.nextSibling) {
          if (n.nodeType === Node.TEXT_NODE && n.nodeValue.trim()) {
            const textWrap = document.createElement('span');
            textWrap.className = `${NS}-tag-txt`;
            a.insertBefore(textWrap, n);
            textWrap.appendChild(n);
            break;
          }
        }
      }

      const li   = a.closest('li');
      const list = a.closest('ul.commas, ol.commas, .commas');
      const textWrap = a.querySelector(`.${NS}-tag-txt`);
      if (!li || !list || !textWrap) return;

      managedLists.add(list);

      const needsComma = !!li.nextElementSibling;
      let comma = a.querySelector(`.${NS}-tag-comma`);
      if (needsComma) {
        if (!comma) {
          comma = document.createElement('span');
          comma.className   = `${NS}-tag-comma`;
          comma.textContent = ',';
          const ico = a.querySelector(`.${NS}-hide-ico`);
          a.insertBefore(comma, ico || null);
        }
      } else if (comma) {
        comma.remove();
      }
    });

    managedLists.forEach(ul => ul.classList.add(`${NS}-own-commas`));
  }

  // ── Manager panel ──────────────────────────────────────────────────────

  /**
   * Open the Hidden Tags Manager modal.
   * @param {{ processList: Function, toast: Function }} callbacks
   */
  openManager ({ processList, toast }) {
    const NS          = this.NS;
    const KeyboardNav = this.KeyboardNav;
    const self        = this;

    const backdrop = document.createElement('div');
    backdrop.className = `${NS}-mgr-backdrop`;

    const box = document.createElement('div');
    box.className   = `${NS}-mgr`;
    box.innerHTML = `
      <button class="${NS}-close-x" type="button" aria-label="Close" title="Close">×</button>
      <h3>AO3 Helper — Hidden Tags (Groups)</h3>
      <div class="${NS}-ul-head">
        <input class="${NS}-ul-search" type="search" placeholder="Search by tag or group…" />
        <span class="${NS}-ul-count">0 / 0</span>
      </div>
      <div class="${NS}-ul-actions">
        <button class="${NS}-ul-btn ${NS}-ul-export"   type="button">Export JSON (tags)</button>
        <button class="${NS}-ul-btn ${NS}-ul-import"   type="button">Import JSON (tags)</button>
        <button class="${NS}-ul-btn ${NS}-ul-exportg"  type="button" title="Export groups mapping">Export Groups</button>
        <button class="${NS}-ul-btn ${NS}-ul-importg"  type="button" title="Import Groups">Import Groups</button>
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

    const $search = box.querySelector(`.${NS}-ul-search`);
    const $count  = box.querySelector(`.${NS}-ul-count`);
    const $list   = box.querySelector(`.${NS}-ul-list`);

    let searchTimer = 0;

    const reload = async () => {
      const hidden    = await self.getHidden();
      const groupsMap = await self.getGroupsMap();
      const qn        = self.toNorm($search.value || '');

      const domHasGroups = $list.querySelectorAll(`.${NS}-ul-group`).length > 0;
      const expandedNow = domHasGroups
        ? new Set(
            Array.from($list.querySelectorAll(`.${NS}-ul-group[aria-expanded="true"]`))
              .map(el => el?.dataset?.gname || '')
              .filter(Boolean)
          )
        : null;
      const collapsedFromStorage = expandedNow === null ? self.getCollapsedSet() : null;

      const filtered = hidden.filter(t =>
        !qn || self.toNorm(t).includes(qn) || self.toNorm(groupsMap[t] || '').includes(qn)
      );

      const grouped = new Map();
      for (const t of filtered) {
        const key = (groupsMap[t] || '').trim() || '(ungrouped)';
        if (!grouped.has(key)) grouped.set(key, []);
        grouped.get(key).push(t);
      }
      for (const [, arr] of grouped) {
        arr.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
      }
      const entries = [...grouped.entries()]
        .sort((a, b) => a[0].localeCompare(b[0], undefined, { sensitivity: 'base' }));

      const prevScrollTop = $list.scrollTop;
      $list.innerHTML = '';
      let shown = 0;

      for (const [gname, tags] of entries) {
        const block    = document.createElement('div');
        block.className  = `${NS}-ul-group`;
        block.dataset.gname = gname;
        const shouldExpand = expandedNow !== null ? expandedNow.has(gname) : !collapsedFromStorage.has(gname);
        block.setAttribute('aria-expanded', String(!!shouldExpand));

        const head  = document.createElement('div');
        head.className = `${NS}-ul-ghead`;
        head.setAttribute('role', 'button');
        head.setAttribute('tabindex', '0');

        const chev  = document.createElement('span');
        chev.className  = `${NS}-ul-chevron`;
        chev.textContent = '';

        const glabel = document.createElement('span');
        glabel.className   = `${NS}-ul-glabel`;
        glabel.textContent = `${gname} — ${tags.length}`;

        head.append(chev, glabel);
        block.append(head);

        const wrap = document.createElement('div');
        wrap.className  = `${NS}-ul-gwrap`;

        for (const tag of tags) {
          const row   = document.createElement('div');
          row.className = `${NS}-ul-row`;

          const label = document.createElement('span');
          label.className   = `${NS}-ul-tag`;
          label.textContent = tag;

          const del   = document.createElement('button');
          del.className   = `${NS}-ul-btn ${NS}-ul-del`;
          del.textContent = '🗑️';
          del.title       = 'Remove this hidden tag';
          del.addEventListener('click', async () => {
            if (del.dataset.confirming === 'true') return;
            del.dataset.confirming = 'true';
            del.title = '';

            const confirm  = document.createElement('button');
            confirm.className   = `${NS}-ul-btn ${NS}-ul-del-confirm`;
            confirm.textContent = '✓';
            confirm.title       = 'Confirm removal';

            const cancel  = document.createElement('button');
            cancel.className   = `${NS}-ul-btn ${NS}-ul-del-cancel`;
            cancel.textContent = '✗';
            cancel.title       = 'Cancel';

            del.replaceWith(confirm, cancel);

            cancel.addEventListener('click', () => {
              confirm.replaceWith(del);
              cancel.remove();
              delete del.dataset.confirming;
              del.title = 'Remove this hidden tag';
            });

            confirm.addEventListener('click', async () => {
              await self.removeHiddenTag(tag);
              const map = await self.getGroupsMap();
              if (tag in map) { delete map[tag]; await self.setGroupsMap(map); }
              await processList();
              reload();
            });
          });

          row.append(label, del);
          wrap.append(row);
          shown++;
        }

        block.append(wrap);
        $list.append(block);

        const toggleGroup = () => {
          const expanded = block.getAttribute('aria-expanded') !== 'true';
          block.setAttribute('aria-expanded', String(expanded));
          const newCollapsed = new Set(
            Array.from($list.querySelectorAll(`.${NS}-ul-group[aria-expanded="false"]`))
              .map(el => el?.dataset?.gname || '')
              .filter(Boolean)
          );
          self.setCollapsedSet(newCollapsed);
        };
        head.addEventListener('click', toggleGroup);
        head.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleGroup(); }
        });
      }

      $count.textContent = `${shown} / ${hidden.length}`;
      try { $list.scrollTop = prevScrollTop; } catch {}
    };

    $search.addEventListener('input', () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(reload, 150);
    });

    // Export / import buttons
    box.querySelector(`.${NS}-ul-export`).addEventListener('click', async () => {
      const list = await self.getHidden();
      downloadJSON(list, 'ao3h-hidden-tags.json');
    });

    box.querySelector(`.${NS}-ul-import`).addEventListener('click', async () => {
      const input   = document.createElement('input');
      input.type    = 'file';
      input.accept  = 'application/json';
      input.addEventListener('change', async () => {
        const file = input.files?.[0];
        if (!file) return;
        try {
          const incoming = JSON.parse(await file.text());
          if (!Array.isArray(incoming)) throw new Error('Not an array');
          const current = await self.getHidden();
          const merged  = Array.from(new Set(
            current.concat(incoming.map(s => String(s).trim().toLowerCase()))
          )).filter(Boolean);
          await self.setHidden(merged);
          await processList();
          reload();
          try { toast(`Imported ${incoming.length} tags`); } catch {}
        } catch (err) { try { toast('Invalid JSON: ' + (err?.message || 'not a valid tags array')); } catch {} }
      });
      input.click();
    });

    box.querySelector(`.${NS}-ul-exportg`).addEventListener('click', async () => {
      const map  = await self.getGroupsMap();
      downloadJSON(map, 'ao3h-hidden-tags-groups.json');
    });

    box.querySelector(`.${NS}-ul-importg`).addEventListener('click', async () => {
      const input  = document.createElement('input');
      input.type   = 'file';
      input.accept = 'application/json';
      input.addEventListener('change', async () => {
        const file = input.files?.[0];
        if (!file) return;
        try {
          const incoming = JSON.parse(await file.text());
          if (!incoming || typeof incoming !== 'object' || Array.isArray(incoming)) {
            throw new Error('Not an object');
          }
          const map    = await self.getGroupsMap();
          await self.setGroupsMap({ ...map, ...incoming });
          reload();
          try { toast('Imported groups mapping'); } catch {}
        } catch (err) { try { toast('Invalid JSON: ' + (err?.message || 'not a valid groups object')); } catch {} }
      });
      input.click();
    });

    reload();
  }

  // ── Blurb helpers ──────────────────────────────────────────────────────

  getWorkBlurbs (root = document) {
    // Etape 318 : lecture window conservee volontairement — lib/ao3/parsers.js est
    // hors graphe Vite (fallback DOM complet ci-dessous utilise cote Vite,
    // parseurs partages cote legacy). Resolu en Phase 27.
    const Parsers = W.AO3H_Common?.Parsers || {};
    if (Parsers.findAllBlurbs) return Parsers.findAllBlurbs(root);
    const NS = this.NS;
    const a = Array.from(root.querySelectorAll(
      '#main .work.blurb.group, #main .work.blurb, #main .bookmark.blurb.group, #main .blurb.group, #main .blurb'
    ));
    const b = Array.from(root.querySelectorAll('li.blurb'));
    return Array.from(new Set([...a, ...b]));
  }

  getWorkIdFromBlurb (blurb) {
    return extractWorkIdFromBlurb(blurb);
  }

  // ── Fold / cut DOM helpers ─────────────────────────────────────────────

  forceShow (el) {
    try {
      el.hidden = false;
      el.style?.removeProperty?.('display');
      el.classList.add(`${this.NS}-force-show`);
    } catch {}
  }

  makeReasonToken (displayTag, isExpanded, onRemove) {
    const strong = document.createElement('strong');
    strong.textContent = displayTag;
    if (!isExpanded || !onRemove) return strong;

    const chip = document.createElement('span');
    chip.className = `${this.NS}-fold-chip`;

    const btn = document.createElement('span');
    btn.className = `${this.NS}-fold-remove-btn`;
    btn.textContent = '\xd7';
    btn.title = 'Remove from list';
    btn.setAttribute('role', 'button');
    btn.setAttribute('tabindex', '0');
    btn.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      e.preventDefault();
      onRemove();
    });

    chip.append(strong, btn);
    return chip;
  }

  updateFoldContent (fold, reasons, isExpanded, notesLock, wlNote = null, removeCbs = {}) {
    const NS = this.NS;
    fold.innerHTML = '';

    const note = document.createElement('span');
    note.className   = `${NS}-note`;
    note.textContent = isExpanded ? 'ℹ️ This work was hidden.' : '🚫 This work is hidden';

    const why = document.createElement('span');
    why.className = `${NS}-reason`;

    const addText = (el, txt) => el.appendChild(document.createTextNode(txt));

    if (reasons.length) {
      addText(why, ' — (Reason: tags include ');
      reasons.forEach((t, i) => {
        let token;
        if (t.charCodeAt(0) === 0x26D4) {
          const word = t.slice(3, -1);
          token = this.makeReasonToken(t, isExpanded, removeCbs.nope ? () => removeCbs.nope(word) : null);
        } else {
          token = this.makeReasonToken(t, isExpanded, removeCbs.blacklist ? () => removeCbs.blacklist(t) : null);
        }
        why.appendChild(token);
        if (i < reasons.length - 1) addText(why, ', ');
      });
      addText(why, '.)');
    }

    const hint = document.createElement('span');
    hint.className = `${NS}-hint`;

    if (notesLock) {
      hint.textContent = 'Hidden by a Note';
      fold.classList.add(`${NS}-disabled`);
      fold.setAttribute('aria-disabled', 'true');
      fold.setAttribute('aria-expanded', 'false');
    } else {
      hint.textContent = isExpanded ? 'Click to hide' : 'Click to show';
      fold.classList.remove(`${NS}-disabled`);
      fold.removeAttribute('aria-disabled');
    }

    fold.dataset.reasons = reasons.join('|');
    if (!notesLock) fold.setAttribute('aria-expanded', String(!!isExpanded));
    fold.append(note, document.createTextNode(' '), why, hint);

    if (wlNote) {
      const wlSpan = document.createElement('span');
      wlSpan.className = `${NS}-wl-fold-note`;
      const wlTags = wlNote.split(',').map(s => s.trim()).filter(Boolean);
      const frag   = document.createDocumentFragment();
      frag.appendChild(document.createTextNode(' 🟢 Could be kept by: '));
      wlTags.forEach((tag, i) => {
        frag.appendChild(this.makeReasonToken(
          tag, isExpanded,
          removeCbs.whitelist ? () => removeCbs.whitelist(tag) : null
        ));
        if (i < wlTags.length - 1) frag.appendChild(document.createTextNode(', '));
      });
      wlSpan.appendChild(frag);
      fold.appendChild(wlSpan);
    }
  }

  ensureWrapped (blurb, buildRemoveCbs) {
    const NS = this.NS;
    if (blurb.classList.contains(`${NS}-wrapped`)) {
      return { fold: blurb.querySelector(`.${NS}-fold`), cut: blurb.querySelector(`.${NS}-cut`) };
    }
    blurb.classList.add(`${NS}-wrapped`);
    this.forceShow(blurb);

    const cut   = document.createElement('div');
    cut.className = `${NS}-cut`;
    const cutId = `${NS}-cut-${Math.random().toString(36).slice(2)}`;
    cut.id = cutId;
    while (blurb.firstChild) cut.appendChild(blurb.firstChild);
    blurb.appendChild(cut);

    const fold = document.createElement('div');
    fold.className = `${NS}-fold`;
    fold.setAttribute('role', 'button');
    fold.setAttribute('tabindex', '0');
    fold.setAttribute('aria-expanded', 'false');
    fold.setAttribute('aria-controls', cutId);
    blurb.insertBefore(fold, cut);

    const doToggle = () => {
      if (fold.classList.contains(`${NS}-disabled`) || fold.getAttribute('aria-disabled') === 'true') return;
      const nowExpanded = fold.getAttribute('aria-expanded') !== 'true';
      fold.setAttribute('aria-expanded', String(nowExpanded));
      const reasons      = (fold.dataset.reasons || '').split('|').filter(Boolean);
      const hideType     = fold.dataset.hideType || 'blacklist';
      const storedWlNote = fold.dataset.wlNote || null;
      const removeCbs    = nowExpanded ? buildRemoveCbs(hideType) : {};
      this.updateFoldContent(fold, reasons, nowExpanded, false, storedWlNote, removeCbs);

      if (nowExpanded) {
        try {
          const workId = this.getWorkIdFromBlurb(blurb);
          if (workId) document.dispatchEvent(new CustomEvent(`${NS}:work-visible`, { detail: { workId } }));
        } catch {}
      }
    };

    fold.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); doToggle(); });
    fold.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); doToggle(); } });

    return { fold, cut };
  }

  wrapWork (blurb, reasons, buildRemoveCbs, wlNote = null, hideType = 'blacklist') {
    const NS = this.NS;
    const { fold } = this.ensureWrapped(blurb, buildRemoveCbs);
    const notesLock  = this.isHiddenByNotes(blurb);
    const isExpanded = (!notesLock) && (fold.getAttribute('aria-expanded') === 'true');
    fold.dataset.hideType = hideType;
    if (wlNote) fold.dataset.wlNote = wlNote;
    else delete fold.dataset.wlNote;

    if (notesLock) { fold.removeAttribute('role'); fold.removeAttribute('tabindex'); }
    else { fold.setAttribute('role', 'button'); fold.setAttribute('tabindex', '0'); }

    if (isExpanded
        && fold.dataset.reasons === reasons.join('|')
        && (fold.dataset.hideType || 'blacklist') === hideType
        && (fold.dataset.wlNote || null) === wlNote) {
      this.forceShow(blurb);
      return;
    }

    const removeCbs = isExpanded ? buildRemoveCbs(hideType) : {};
    this.updateFoldContent(fold, reasons, isExpanded, notesLock, wlNote, removeCbs);
    this.forceShow(blurb);
  }

  unwrapWork (blurb) {
    const NS   = this.NS;
    const fold = blurb.querySelector(`.${NS}-fold`);
    const cut  = blurb.querySelector(`.${NS}-cut`);
    blurb.classList.remove(`${NS}-wrapped`, `${NS}-force-show`);
    if (fold) fold.remove();
    if (cut) { while (cut.firstChild) blurb.insertBefore(cut.firstChild, cut); cut.remove(); }
    blurb.hidden = false;
    blurb.style?.removeProperty?.('display');

    try {
      const workId = this.getWorkIdFromBlurb(blurb);
      if (workId) document.dispatchEvent(new CustomEvent(`${NS}:work-visible`, { detail: { workId } }));
    } catch {}
  }

  clearWLHighlights (blurb) {
    blurb.classList.remove(`${this.NS}-wl-saved`);
    blurb.querySelector(`.${this.NS}-wl-strip`)?.remove();
  }

  isHiddenByNotes (blurb) {
    return blurb.hasAttribute('data-ao3h-notes-hidden');
  }

  // ── Delegate events ────────────────────────────────────────────────────

  /**
   * Attach click-delegate handlers for the inline hide icons and alt+click on tags.
   * @param {{ onTagHidden: Function, toast: Function }} callbacks
   */
  attachDelegates ({ onTagHidden, toast }) {
    if (this._delegatesAttached) return;
    this._delegatesAttached = true;
    this._delegateController = new AbortController();
    const signal = this._delegateController.signal;

    document.addEventListener('click', async (e) => {
      const ico = e.target?.closest?.(`.${this.NS}-hide-ico`);
      if (!ico) return;
      e.preventDefault(); e.stopPropagation();
      const canon = (ico.dataset.tag || '').trim();
      if (!canon) return;
      await this.addHiddenTag(canon);
      await onTagHidden();
      toast(`Hidden: ${canon}`);
    }, { capture: true, signal });

    document.addEventListener('click', async (e) => {
      const link = e.target?.closest?.('a.tag');
      if (!link || !e.altKey) return;
      e.preventDefault();
      const canon = this.canonicalFromAnchor(link);
      if (!canon) return;
      await this.addHiddenTag(canon);
      await onTagHidden();
      toast(`Hidden: ${canon}`);
    }, { capture: true, signal });
  }

  cleanup () {
    this._delegateController?.abort();
    this._delegateController = null;
    this._delegatesAttached = false;
  }

  // ── Toast ──────────────────────────────────────────────────────────────

  toast (msg) {
    const NS = this.NS;
    const el = document.createElement('div');
    el.className   = `${NS}-hbt-toast`;
    el.textContent = msg;
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add(`${NS}-hbt-toast--visible`));
    setTimeout(() => { el.classList.remove(`${NS}-hbt-toast--visible`); setTimeout(() => el.remove(), 200); }, 1000);
  }
}
