/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Bookmark Vault › Organization Tools

Provides bookmark categories, category filtering, bulk selection, pinning, and
client-side sorting controls on the user’s bookmark page.

Notes

- Categories and pinned work IDs persist independently in local storage.
- Bulk selection uses the shared bulk-select component.
- New-bookmark events may assign matching fandom categories automatically.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { extractWorkIdFromBlurb } from '../../../../lib/ao3/parsers.js';
import { createBulkSelect } from '../../../../lib/ui/bulk-select.js';
import { observe } from '../../../../lib/utils/index.js';


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const D = document;
const SK_CATS   = 'ao3h:bookmarkVault:categories';
const SK_PINNED = 'ao3h:bookmarkVault:pinned';

export class OrganizationTools {
  constructor (cfgFn) {
    this.cfg  = cfgFn;
    this._obs = [];
    this._bookmarkAddedHandler = null;
    // lib/ui/bulk-select.js — fusionné avec markedForLaterStatus (shared.md, E6).
    this._bulkSelect = createBulkSelect({
      blurbSelector:  'li.work.blurb, li.bookmark.blurb',
      barId:          'ao3h-bv-bulk-bar',
      checkboxClass:  'ao3h-bv-bulk-chk',
      countId:        'ao3h-bv-bulk-count',
      selectAllClass: 'ao3h-bv-bulk-selall',
      removeClass:    'ao3h-bv-bulk-del',
      labels: {
        selectAll:   'Select All',
        deselectAll: 'Deselect All',
        remove:      '🗑 Remove Selected',
      },
      onRemove: (selected) => {
        if (!window.confirm(`Remove ${selected.length} bookmark(s) from view?`)) return;
        selected.forEach(b => b.remove());
      },
    });
  }

  _loadCats   () { try { return JSON.parse(localStorage.getItem(SK_CATS)   || '[]');  } catch (_) { return []; } }
  _saveCats   (c) { try { localStorage.setItem(SK_CATS,   JSON.stringify(c)); } catch (_) {} }
  _loadPinned () { try { return new Set(JSON.parse(localStorage.getItem(SK_PINNED) || '[]')); } catch (_) { return new Set(); } }
  _savePinned (s) { try { localStorage.setItem(SK_PINNED, JSON.stringify([...s])); } catch (_) {} }

  _isBookmarksPage () { return /\/users\/[^/]+\/bookmarks/.test(location.pathname); }
  _getWorkId (blurb) {
    return extractWorkIdFromBlurb(blurb);
  }

  /* ═══════════════════════════════════════════════════════════════════════
     FEATURE — CATEGORIES AND CATEGORY FILTERING
  ═══════════════════════════════════════════════════════════════════════ */

  _injectCategoryLabels (blurbs) {
    const cats = this._loadCats();
    if (!cats.length) return;
    const byWork = {};
    cats.forEach(c => (c.workIds || []).forEach(wid => {
      (byWork[wid] = byWork[wid] || []).push(c);
    }));
    Array.from(blurbs).forEach(blurb => {
      const wid = this._getWorkId(blurb);
      if (!wid || !byWork[wid]) return;
      const h4 = blurb.querySelector('h4.heading');
      if (!h4) return;
      byWork[wid].forEach(c => {
        const lbl = D.createElement('span');
        lbl.className     = 'ao3h-bv-cat-lbl';
        lbl.textContent   = c.name;
        lbl.dataset.catId = c.id;
        lbl.style.background = c.color || '#900';
        h4.appendChild(lbl);
      });
    });
  }

  _injectCategoryFilter () {
    if (D.getElementById('ao3h-bv-cf')) return;
    const cats = this._loadCats();
    if (!cats.length) return;
    const wrap = D.createElement('div');
    wrap.id    = 'ao3h-bv-cf';
    const lbl = D.createElement('strong');
    lbl.textContent = '📂 Category: ';
    wrap.appendChild(lbl);

    const mkBtn = (text, color, active, onClick) => {
      const btn = D.createElement('button');
      btn.textContent = text;
      btn.className   = 'ao3h-bv-cf-btn';
      btn.style.borderColor = color;
      btn.style.background  = active ? color : '';
      btn.style.color       = active ? '#fff' : color;
      btn.addEventListener('click', onClick);
      return btn;
    };

    wrap.appendChild(mkBtn('All', '#900', true, () => {
      D.querySelectorAll('li.work.blurb, li.bookmark.blurb').forEach(b => {
        b.style.display = '';
        delete b.dataset.bvOrgCfHidden;
      });
    }));
    cats.forEach(c => {
      const wids = new Set(c.workIds || []);
      wrap.appendChild(mkBtn(c.name, c.color || '#900', false, () => {
        D.querySelectorAll('li.work.blurb, li.bookmark.blurb').forEach(b => {
          const hide = !wids.has(this._getWorkId(b));
          b.style.display = hide ? 'none' : '';
          if (hide) b.dataset.bvOrgCfHidden = '1';
          else delete b.dataset.bvOrgCfHidden;
        });
      }));
    });

    const anchor = D.querySelector('#main > h2, #main > h3');
    if (anchor) anchor.insertAdjacentElement('afterend', wrap);
  }

  _injectCategoryManager () {
    if (D.getElementById('ao3h-bv-cm')) return;
    const panel = D.createElement('div');
    panel.id    = 'ao3h-bv-cm';
    const title = D.createElement('strong');
    title.textContent = '📂 My Categories';
    panel.appendChild(title);

    const list = D.createElement('ul');
    list.id = 'ao3h-bv-cm-list';
    const renderList = () => {
      list.innerHTML = '';
      this._loadCats().forEach(c => {
        const li = D.createElement('li');
        const dot = D.createElement('span');
        dot.className    = 'ao3h-bv-cat-dot';
        dot.style.background = c.color || '#900';
        li.appendChild(dot);
        li.append(`${c.name} (${(c.workIds||[]).length})`);
        list.appendChild(li);
      });
    };
    renderList();
    panel.appendChild(list);

    const form = D.createElement('div');
    form.className = 'ao3h-bv-cm-form';
    const nameIn  = D.createElement('input');
    nameIn.type   = 'text'; nameIn.placeholder = 'Category name…';
    const colorIn = D.createElement('input');
    colorIn.type  = 'color'; colorIn.value = '#c00040';
    const addBtn  = D.createElement('button');
    addBtn.textContent = '+ Add';
    addBtn.addEventListener('click', () => {
      const name = nameIn.value.trim();
      if (!name) return;
      const cats = this._loadCats();
      cats.push({ id: `cat_${Date.now()}`, name, color: colorIn.value, workIds: [] });
      this._saveCats(cats);
      nameIn.value = '';
      renderList();
    });
    form.appendChild(nameIn); form.appendChild(colorIn); form.appendChild(addBtn);
    panel.appendChild(form);

    const sidebar = D.querySelector('#sidebar, aside');
    if (sidebar) sidebar.insertAdjacentElement('afterbegin', panel);
    else D.querySelector('#main > h2')?.insertAdjacentElement('afterend', panel);
  }

  /* ═══════════════════════════════════════════════════════════════════════
     FEATURE — BULK SELECTION AND PINNING
  ═══════════════════════════════════════════════════════════════════════ */

  // Le marquage bvOrgDone doit rester ici (et non dans le lib partagé) : les
  // labels de catégorie (_injectCategoryLabels) n'ont pas leur propre garde
  // anti-doublon et comptent sur ce marqueur, posé historiquement ici, pour
  // ne pas être ré-appliqués par le MutationObserver de boot().
  _injectBulkSelection (blurbs) {
    Array.from(blurbs).forEach(blurb => {
      if (blurb.dataset.bvOrgDone) return;
      blurb.dataset.bvOrgDone = '1';
    });
    this._bulkSelect.scan();
    this._extendBulkBar();
  }

  _bulkSelected () {
    return Array.from(D.querySelectorAll('.ao3h-bv-bulk-chk:checked'))
      .map(c => c.closest('li.work.blurb, li.bookmark.blurb'))
      .filter(Boolean);
  }

  /** Local bulk actions besides Remove: assign to a category, pin. */
  _extendBulkBar () {
    const bar = D.getElementById('ao3h-bv-bulk-bar');
    if (!bar || bar.querySelector('.ao3h-bv-bulk-cat')) return;

    const feedback = (btn, text, original) => {
      btn.textContent = text;
      setTimeout(() => { btn.textContent = original; }, 1500);
    };

    const catBtn = D.createElement('button');
    catBtn.className   = 'ao3h-bv-bulk-cat';
    catBtn.textContent = '📂 Category';
    catBtn.title = 'Assign the selected bookmarks to a category (created if needed)';
    catBtn.addEventListener('click', () => {
      const selected = this._bulkSelected();
      if (!selected.length) { feedback(catBtn, 'Select works first', '📂 Category'); return; }
      const name = (window.prompt('Assign selected bookmarks to category:') || '').trim();
      if (!name) return;
      const cats = this._loadCats();
      let cat = cats.find(c => c.name.toLowerCase() === name.toLowerCase());
      if (!cat) { cat = { id: `cat_${Date.now()}`, name, color: '#c00040', workIds: [] }; cats.push(cat); }
      let added = 0;
      selected.forEach(blurb => {
        const wid = this._getWorkId(blurb);
        if (wid && !cat.workIds.includes(wid)) { cat.workIds.push(wid); added++; }
      });
      this._saveCats(cats);
      feedback(catBtn, `✓ ${added} added to "${cat.name}"`, '📂 Category');
    });

    const pinBtn = D.createElement('button');
    pinBtn.className   = 'ao3h-bv-bulk-pin';
    pinBtn.textContent = '📌 Pin';
    pinBtn.title = 'Pin the selected bookmarks';
    pinBtn.addEventListener('click', () => {
      const selected = this._bulkSelected();
      if (!selected.length) { feedback(pinBtn, 'Select works first', '📌 Pin'); return; }
      const pinned = this._loadPinned();
      selected.forEach(blurb => {
        const wid = this._getWorkId(blurb);
        if (wid) pinned.add(wid);
      });
      this._savePinned(pinned);
      feedback(pinBtn, `✓ ${selected.length} pinned`, '📌 Pin');
    });

    bar.append(catBtn, pinBtn);
  }

  _injectPinButtons (blurbs) {
    const pinned = this._loadPinned();
    Array.from(blurbs).forEach(blurb => {
      if (blurb.querySelector('.ao3h-bv-pin-btn')) return;
      const wid = this._getWorkId(blurb);
      if (!wid) return;
      const isPinned = pinned.has(wid);
      const btn = D.createElement('button');
      btn.className   = 'ao3h-bv-pin-btn';
      btn.textContent = isPinned ? '📌 Pinned' : '📌 Pin';
      btn.style.borderColor = isPinned ? '#900' : '#ccc';
      btn.style.color       = isPinned ? '#900' : '#999';
      btn.addEventListener('click', () => {
        const p = this._loadPinned();
        const now = p.has(wid);
        if (now) { p.delete(wid); btn.textContent = '📌 Pin'; btn.style.borderColor = '#ccc'; btn.style.color = '#999'; }
        else     { p.add(wid);    btn.textContent = '📌 Pinned'; btn.style.borderColor = '#900'; btn.style.color = '#900'; }
        this._savePinned(p);
      });
      blurb.querySelector('h4.heading')?.insertAdjacentElement('afterend', btn);
    });
  }

  _sortPinnedToTop () {
    const pinned = this._loadPinned();
    if (!pinned.size) return;
    const ol = D.querySelector('ol.work.index, ul.work.index, ol.bookmark.index, ul.bookmark.index');
    if (!ol) return;
    Array.from(ol.querySelectorAll(':scope > li')).forEach(li => {
      if (pinned.has(this._getWorkId(li))) ol.insertBefore(li, ol.firstChild);
    });
  }

  /* ═══════════════════════════════════════════════════════════════════════
     FEATURE — BOOKMARK SORTING
  ═══════════════════════════════════════════════════════════════════════ */

  _injectSortControls () {
    if (D.getElementById('ao3h-bv-sort')) return;
    const wrap = D.createElement('div');
    wrap.id    = 'ao3h-bv-sort';
    const lbl = D.createElement('strong');
    lbl.textContent = 'Sort: ';
    wrap.appendChild(lbl);
    const sel = D.createElement('select');
    const def = this.cfg('defaultSort') || 'date';
    [
      { val: 'date',   lbl: 'Date added' },
      { val: 'title',  lbl: 'Title' },
      { val: 'fandom', lbl: 'Fandom' },
      { val: 'series', lbl: 'Series' },
    ].forEach(o => {
      const opt = D.createElement('option');
      opt.value = o.val; opt.textContent = o.lbl;
      if (o.val === def) opt.selected = true;
      sel.appendChild(opt);
    });
    sel.addEventListener('change', () => this._sortBlurbs(sel.value));
    wrap.appendChild(sel);
    const anchor = D.querySelector('#main > h2, #main > h3');
    if (anchor) anchor.insertAdjacentElement('afterend', wrap);
    if (def !== 'date') this._sortBlurbs(def);
  }

  _sortBlurbs (mode) {
    const ol = D.querySelector('ol.work.index, ul.work.index, ol.bookmark.index, ul.bookmark.index');
    if (!ol) return;
    const blurbs = Array.from(ol.querySelectorAll(':scope > li'));
    blurbs.sort((a, b) => {
      if (mode === 'title') {
        const ta = (a.querySelector('h4.heading a')?.textContent || '').toLowerCase();
        const tb = (b.querySelector('h4.heading a')?.textContent || '').toLowerCase();
        return ta.localeCompare(tb);
      }
      if (mode === 'fandom') {
        const fa = (a.querySelector('h5.fandoms a')?.textContent || '').toLowerCase();
        const fb = (b.querySelector('h5.fandoms a')?.textContent || '').toLowerCase();
        return fa.localeCompare(fb);
      }
      if (mode === 'series') {
        // Works of one series end up adjacent; standalone works sort last
        const sa = (a.querySelector('ul.series a, .series a')?.textContent || '￿').toLowerCase();
        const sb = (b.querySelector('ul.series a, .series a')?.textContent || '￿').toLowerCase();
        return sa.localeCompare(sb);
      }
      return 0; // date: keep original order
    });
    blurbs.forEach(b => ol.appendChild(b));
  }

  /* ═══════════════════════════════════════════════════════════════════════
     FEATURE LIFECYCLE
  ═══════════════════════════════════════════════════════════════════════ */

  boot () {
    if (this._isBookmarksPage() === false) return;
    const blurbs = D.querySelectorAll('li.work.blurb, li.bookmark.blurb');
    if (this.cfg('showCategoryLabels'))  this._injectCategoryLabels(blurbs);
    if (this.cfg('filterByCategory'))    this._injectCategoryFilter();
    if (this.cfg('createCategories'))    this._injectCategoryManager();
    if (this.cfg('bulkSelection'))       this._injectBulkSelection(blurbs);
    if (this.cfg('pinBookmarks'))      { this._injectPinButtons(blurbs); this._sortPinnedToTop(); }
    // defaultSort: inject sort controls
    this._injectSortControls();
    // assignToCategories: feature flag — auto-assign new bookmarks to matching categories
    const autoAssign = this.cfg('assignToCategories');
    if (autoAssign) {
      this._bookmarkAddedHandler = e => {
        const { workId, fandoms } = e.detail || {};
        if (!workId || !fandoms) return;
        const cats = this._loadCats();
        cats.forEach(c => {
          if (fandoms.some(f => c.name.toLowerCase() === f.toLowerCase())) {
            if (!c.workIds.includes(workId)) { c.workIds.push(workId); }
          }
        });
        this._saveCats(cats);
      };
      D.addEventListener('ao3h:bookmarkAdded', this._bookmarkAddedHandler);
    }

    const obs = observe(D.getElementById('main') || D.body, { childList: true, subtree: true }, () => {
      const fresh = D.querySelectorAll(
        'li.work.blurb:not([data-bv-org-done]), li.bookmark.blurb:not([data-bv-org-done])'
      );
      if (!fresh.length) return;
      if (this.cfg('showCategoryLabels')) this._injectCategoryLabels(fresh);
      if (this.cfg('bulkSelection'))      this._injectBulkSelection(fresh);
      if (this.cfg('pinBookmarks'))       this._injectPinButtons(fresh);
    });
    this._obs.push(obs);
  }

  stop () {
    this._obs.forEach(o => o.disconnect());
    this._obs = [];
    if (this._bookmarkAddedHandler) {
      D.removeEventListener('ao3h:bookmarkAdded', this._bookmarkAddedHandler);
      this._bookmarkAddedHandler = null;
    }
    this._bulkSelect.destroy();
    D.querySelectorAll('.ao3h-bv-cat-lbl, .ao3h-bv-pin-btn').forEach(e => e.remove());
    D.getElementById('ao3h-bv-cf')?.remove();
    D.getElementById('ao3h-bv-cm')?.remove();
    D.getElementById('ao3h-bv-sort')?.remove();
    D.querySelectorAll('[data-bv-org-cf-hidden]').forEach(el => {
      el.style.display = '';
      delete el.dataset.bvOrgCfHidden;
    });
    D.querySelectorAll('[data-bv-org-done]').forEach(el => delete el.dataset.bvOrgDone);
  }
}
