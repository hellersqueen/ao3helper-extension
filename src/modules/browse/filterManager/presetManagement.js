/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Filter Manager › Preset Management

Purpose
    Captures, stores, previews, applies, edits, imports, and exports AO3 filter
    presets through a toolbar integrated with the native filter form.

Notes
    Presets can be starred, remembered per fandom, expanded into removable
    chips, and activated with keyboard shortcuts. Imported presets and bundles
    are merged by ID.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { downloadJSON } from '../../../../lib/utils/json-file.js';
import { escapeHtml } from '../../../../lib/utils/dom.js';



/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const W = getGlobalWindow();

const FILTER_FORM_SEL = 'form#work-filters, form.narrow-hidden.filters';

const SEARCH_FIELDS = [
  'work_search[other_tag_names]',
  'work_search[excluded_tag_names]',
  'work_search[rating_ids][]',
  'work_search[archive_warning_ids][]',
  'work_search[category_ids][]',
  'work_search[fandom_names]',
  'work_search[relationship_names]',
  'work_search[character_names]',
  'work_search[hits]',
  'work_search[kudos_count]',
  'work_search[word_count]',
  'work_search[date_from]',
  'work_search[date_to]',
  'work_search[complete]',
  'work_search[crossover]',
  'work_search[single_chapter]',
  'work_search[language_id]',
  'work_search[sort_column]',
  'work_search[sort_direction]',
];

const FRIENDLY_FIELD_NAMES = {
  'work_search[other_tag_names]':       'Other tags',
  'work_search[excluded_tag_names]':    'Excluded tags',
  'work_search[rating_ids][]':          'Rating',
  'work_search[archive_warning_ids][]': 'Archive warning',
  'work_search[category_ids][]':        'Category',
  'work_search[fandom_names]':          'Fandom',
  'work_search[relationship_names]':    'Relationships',
  'work_search[character_names]':       'Characters',
  'work_search[hits]':                  'Hit count',
  'work_search[kudos_count]':           'Kudos',
  'work_search[word_count]':            'Word count',
  'work_search[date_from]':             'Date from',
  'work_search[date_to]':               'Date to',
  'work_search[complete]':              'Complete',
  'work_search[crossover]':             'Crossover',
  'work_search[single_chapter]':        'Single chapter',
  'work_search[language_id]':           'Language',
  'work_search[sort_column]':           'Sort by',
  'work_search[sort_direction]':        'Sort direction',
};

const MULTI_TAG_FIELDS = new Set([
  'work_search[other_tag_names]',
  'work_search[excluded_tag_names]',
  'work_search[fandom_names]',
  'work_search[relationship_names]',
  'work_search[character_names]',
]);

export class PresetManagement {
  constructor ({ NS, storeGet, storeSet, cfg, detectCurrentFandom, getBundleFor, loadBundles, saveBundles, KEY_PRESETS, KEY_BUNDLES, KEY_LAST }) {
    this.NS                  = NS;
    this.storeGet            = storeGet;
    this.storeSet            = storeSet;
    this.cfg                 = cfg;
    this.detectCurrentFandom = detectCurrentFandom;
    this.getBundleFor        = getBundleFor;
    this.loadBundles         = loadBundles;
    this.saveBundles         = saveBundles;
    this.KEY_PRESETS         = KEY_PRESETS;
    this.KEY_BUNDLES         = KEY_BUNDLES;
    this.KEY_LAST            = KEY_LAST;
    this.toolbar             = null;
    this.toolbarHeading      = null;
    this.listenerController  = null;
  }


  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — PRESET STORAGE
  ═════════════════════════════════════════════════════════════════════════ */

  _mergeById (existing, incoming) {
    const map = new Map(existing.map(x => [x.id, x]));
    for (const item of incoming) map.set(item.id, item);
    return [...map.values()];
  }

  _downloadJson (data, filename) {
    downloadJSON(data, filename);
  }

  _friendlyFieldName (field) {
    return FRIENDLY_FIELD_NAMES[field]
      || field.replace(/^work_search\[|\](\[\])?$/g, '').replace(/_/g, ' ');
  }

  loadPresets ()  { return this.storeGet(this.KEY_PRESETS, []); }
  savePresets (p) { this.storeSet(this.KEY_PRESETS, p); }

  createPreset (name, filters, fandom) {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    return { id, name, starred: false, fandom: fandom || null, createdAt: Date.now(), filters };
  }

  sortedPresets (presets) {
    if (!this.cfg('starredPresetsFirst')) return presets;
    return [...presets].sort((a, b) => (b.starred ? 1 : 0) - (a.starred ? 1 : 0));
  }


  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — FILTER CAPTURE AND APPLICATION
  ═════════════════════════════════════════════════════════════════════════ */

  captureCurrentFilters () {
    const form = document.querySelector(FILTER_FORM_SEL);
    if (!form) return {};
    const data = {};
    for (const field of SEARCH_FIELDS) {
      const els = /** @type {HTMLInputElement[]} */ ([...form.querySelectorAll(`[name="${field}"]`)]);
      if (!els.length) continue;
      if (els.length > 1) {
        data[field] = els.filter(el => el.checked).map(el => el.value);
      } else {
        const el = els[0];
        if (el.type === 'checkbox') {
          data[field] = el.checked ? '1' : '0';
        } else {
          data[field] = el.value;
        }
      }
    }
    return data;
  }

  applyPresetToForm (preset) {
    const form = document.querySelector(FILTER_FORM_SEL);
    if (!form || !preset?.filters) return false;
    for (const [field, value] of Object.entries(preset.filters)) {
      const els = /** @type {HTMLInputElement[]} */ ([...form.querySelectorAll(`[name="${field}"]`)]);
      if (!els.length) continue;
      if (Array.isArray(value)) {
        els.forEach(el => { el.checked = value.includes(el.value); });
      } else {
        const el = els[0];
        if (el.type === 'checkbox') {
          el.checked = value === '1' || value === true;
        } else {
          el.value = value;
        }
      }
    }
    return true;
  }


  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — EXPANDED FILTER CHIPS
  ═════════════════════════════════════════════════════════════════════════ */

  buildExpandedFilters (preset, container) {
    const NS = this.NS;
    container.innerHTML = '';
    const filters  = preset.filters || {};
    const nonEmpty = Object.entries(filters).filter(([, v]) =>
      v !== null && v !== undefined && String(v).trim() !== '' && v !== '0' && v !== false
    );
    if (nonEmpty.length === 0) { container.hidden = true; return; }

    const labelEl     = document.createElement('span');
    labelEl.className   = `${NS}-active-filters-label`;
    labelEl.textContent = 'Active filters:';
    container.appendChild(labelEl);

    for (const [field, value] of nonEmpty) {
      const chipLabel = this._friendlyFieldName(field);
      if (MULTI_TAG_FIELDS.has(field) && !Array.isArray(value)) {
        const tags = String(value).split(',').map(t => t.trim()).filter(Boolean);
        for (const tag of tags) {
          const bundleTags = this.cfg('tagBundlesEnabled') ? this.getBundleFor(tag) : [tag];
          const bundleHint = bundleTags.length > 1
            ? ` <span class="${NS}-chip-bundle" title="In bundle: ${escapeHtml(bundleTags.join(', '))}">🔗</span>`
            : '';
          const chip = document.createElement('span');
          chip.className = `${NS}-filter-chip`;
          chip.innerHTML =
            `<span class="${NS}-chip-label">${escapeHtml(chipLabel)}: <em>${escapeHtml(tag)}</em>${bundleHint}</span>`
            + `<button type="button" class="${NS}-chip-remove"`
            + ` data-field="${escapeHtml(field)}"`
            + ` data-tag-value="${escapeHtml(tag)}"`
            + ` aria-label="Remove tag: ${escapeHtml(tag)}">✕</button>`;
          container.appendChild(chip);
        }
      } else {
        const items = Array.isArray(value) ? value : [String(value)];
        for (const item of items) {
          const chip = document.createElement('span');
          chip.className = `${NS}-filter-chip`;
          const arrayAttr = Array.isArray(value)
            ? ` data-array-value="${escapeHtml(item)}"`
            : '';
          chip.innerHTML =
            `<span class="${NS}-chip-label">${escapeHtml(chipLabel)}: <em>${escapeHtml(item)}</em></span>`
            + `<button type="button" class="${NS}-chip-remove"`
            + ` data-field="${escapeHtml(field)}"${arrayAttr}`
            + ` aria-label="Remove filter: ${escapeHtml(chipLabel)}">✕</button>`;
          container.appendChild(chip);
        }
      }
    }
    container.hidden = false;
  }


  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — PRESET TOOLBAR
  ═════════════════════════════════════════════════════════════════════════ */

  buildPresetToolbar (presets, fandom) {
    const NS = this.NS;
    const dt = document.createElement('dt');
    dt.className = `heading ${NS}-presets-dt`;
    dt.innerHTML = `
      <h4><span aria-hidden="true">🔖</span> Filter Presets
        <button type="button" class="${NS}-help-btn" aria-label="How Filter Presets work">
          <span class="symbol question"><span>?</span></span>
        </button>
      </h4>
      <div class="${NS}-help-popover" hidden role="tooltip">
        <p><strong>Filter Presets</strong> let you save and reapply your filter combinations in one click.</p>
        <ul>
          <li>Click <strong>💾 Save</strong> to save your current filters under a name.</li>
          <li>Pick a preset from the dropdown to select it.</li>
          <li>Click <strong>↩ Apply</strong> to fill the filters, then submit the form.</li>
          <li>Click <strong>🏷 Edit as chips</strong> to fine-tune each filter individually before searching.</li>
          <li>Click ★ to pin a preset to the top of the list.</li>
        </ul>
      </div>
    `;

    const dd = document.createElement('dd');
    dd.id        = `${NS}-preset-toolbar`;
    dd.className = `${NS}-preset-toolbar ${NS}-presets-dd`;

    const helpBtn     = dt.querySelector(`.${NS}-help-btn`);
    const helpPopover = /** @type {HTMLElement} */ (dt.querySelector(`.${NS}-help-popover`));
    helpBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      helpPopover.hidden = !helpPopover.hidden;
    });
    const sorted = this.sortedPresets(presets);
    const lastId = fandom ? (this.storeGet(this.KEY_LAST, {})[fandom] || null) : null;

    dd.innerHTML = `
      <div class="${NS}-preset-toolbar-inner">
        <div class="${NS}-preset-controls">
          <div class="${NS}-preset-select-wrap">
            <button type="button" class="${NS}-preset-current"
                    aria-haspopup="listbox"
                    aria-expanded="false">
              <span class="${NS}-preset-current-name">— Choose a preset —</span>
              <span aria-hidden="true">▾</span>
            </button>
            <ul class="${NS}-preset-dropdown"
                role="listbox"
                aria-label="Filter presets"
                hidden>
              ${sorted.map(p => `
                <li class="${NS}-preset-item${lastId === p.id ? ` ${NS}-last-used` : ''}"
                    role="option"
                    data-id="${escapeHtml(p.id)}"
                    title="${this.cfg('presetHoverPreview') && p.filters
                      ? Object.entries(p.filters)
                          .filter(([, v]) => v && String(v).trim())
                          .map(([k, v]) => `${this._friendlyFieldName(k)}: ${v}`)
                          .join('\n')
                      : ''}">
                  <span class="${NS}-preset-star${p.starred ? ` ${NS}-starred` : ''}"
                        data-star="${escapeHtml(p.id)}"
                        aria-label="${p.starred ? 'Unstar' : 'Star'} preset"
                        role="button"
                        tabindex="0">★</span>
                  <span class="${NS}-preset-name">${escapeHtml(p.name)}</span>
                  <button type="button" class="${NS}-preset-delete"
                          data-del="${escapeHtml(p.id)}"
                          aria-label="Delete preset ${escapeHtml(p.name)}">✕</button>
                </li>
              `).join('')}
              ${sorted.length === 0
                ? `<li class="${NS}-preset-empty" role="option" aria-disabled="true">No presets yet — configure your filters, then click 💾 Save</li>`
                : ''}
            </ul>
          </div>
          <button type="button" class="${NS}-preset-save"   title="Save current filters as a new preset (Ctrl+Shift+S)">💾 Save</button>
          <button type="button" class="${NS}-preset-import" title="Import presets from JSON file">⬆ Import</button>
          <button type="button" class="${NS}-preset-export" title="Export all presets as JSON file">⬇ Export</button>
        </div>
        <div class="${NS}-preset-action-row" hidden>
          <span class="${NS}-preset-ready-label"></span>
          <button type="button" class="${NS}-preset-apply"  title="Fill the search form with all filters from this preset">↩ Apply</button>
          <button type="button" class="${NS}-preset-expand" title="Apply this preset and show each filter as a removable chip — fine-tune before searching">🏷 Edit as chips</button>
        </div>
        <div class="${NS}-active-filters" hidden></div>
      </div>
    `;
    dd._ao3hDt = dt;
    this.toolbar = dd;
    this.toolbarHeading = dt;
    return { dt, dd };
  }

  attachPresetToolbarEvents (toolbar, options = {}) {
    this.listenerController?.abort();
    this.listenerController = new AbortController();
    const { signal } = this.listenerController;

    const NS            = this.NS;
    const currentBtn    = toolbar.querySelector(`.${NS}-preset-current`);
    const dropdown      = toolbar.querySelector(`.${NS}-preset-dropdown`);
    const saveBtn       = toolbar.querySelector(`.${NS}-preset-save`);
    const importBtn     = toolbar.querySelector(`.${NS}-preset-import`);
    const exportBtn     = toolbar.querySelector(`.${NS}-preset-export`);
    const actionRow     = toolbar.querySelector(`.${NS}-preset-action-row`);
    const applyBtn      = toolbar.querySelector(`.${NS}-preset-apply`);
    const expandBtn     = toolbar.querySelector(`.${NS}-preset-expand`);
    const activeFilters = toolbar.querySelector(`.${NS}-active-filters`);
    const readyLabel    = toolbar.querySelector(`.${NS}-preset-ready-label`);
    let   selectedPreset = null;

    currentBtn?.addEventListener('click', () => {
      const open = currentBtn.getAttribute('aria-expanded') === 'true';
      currentBtn.setAttribute('aria-expanded', String(!open));
      dropdown.hidden = open;
    });

    document.addEventListener('click', (e) => {
      if (!toolbar.contains(e.target)) {
        currentBtn?.setAttribute('aria-expanded', 'false');
        if (dropdown) dropdown.hidden = true;
      }
    }, { signal });

    const toolbarHeading = toolbar._ao3hDt;
    const helpPopover = toolbarHeading?.querySelector(`.${NS}-help-popover`);
    document.addEventListener('click', (e) => {
      if (helpPopover && !toolbarHeading.contains(e.target)) helpPopover.hidden = true;
    }, { capture: true, signal });

    dropdown?.addEventListener('click', (e) => {
      const delBtn  = e.target.closest(`.${NS}-preset-delete`);
      const starBtn = e.target.closest(`.${NS}-preset-star`);
      const item    = e.target.closest(`.${NS}-preset-item`);

      if (delBtn) {
        e.stopPropagation();
        const id = delBtn.dataset.del;
        const updated = this.loadPresets().filter(p => p.id !== id);
        this.savePresets(updated);
        const fresh = this._replaceToolbar(toolbar, updated);
        this.attachPresetToolbarEvents(fresh);
        return;
      }

      if (starBtn) {
        e.stopPropagation();
        const id = starBtn.dataset.star;
        const updated = this.loadPresets().map(p =>
          p.id === id ? { ...p, starred: !p.starred } : p
        );
        this.savePresets(updated);
        const fresh = this._replaceToolbar(toolbar, updated);
        this.attachPresetToolbarEvents(fresh);
        return;
      }

      if (item && !item.getAttribute('aria-disabled')) {
        const id     = item.dataset.id;
        const preset = this.loadPresets().find(p => p.id === id);
        if (!preset) return;

        const nameEl = toolbar.querySelector(`.${NS}-preset-current-name`);
        if (nameEl) nameEl.textContent = preset.name;
        currentBtn?.setAttribute('aria-expanded', 'false');
        dropdown.hidden = true;

        if (this.cfg('showExpandPreset')) {
          selectedPreset = preset;
          if (actionRow) actionRow.hidden = false;
          if (readyLabel) readyLabel.textContent = `"${preset.name}"`;
          if (activeFilters) { activeFilters.innerHTML = ''; activeFilters.hidden = true; }
        } else {
          this.applyPresetToForm(preset);
          const fandom = this.detectCurrentFandom();
          if (fandom && this.cfg('rememberLastPresetByFandom')) {
            const last = this.storeGet(this.KEY_LAST, {});
            last[fandom] = id;
            this.storeSet(this.KEY_LAST, last);
          }
        }
      }
    });

    dropdown?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const starBtn = e.target.closest(`.${NS}-preset-star`);
        if (starBtn) { e.preventDefault(); starBtn.click(); }
      }
    });

    saveBtn?.addEventListener('click', () => {
      const name = W.prompt('Preset name:');
      if (!name?.trim()) return;
      const filters   = this.captureCurrentFilters();
      const fandom    = this.detectCurrentFandom();
      const updated   = this.loadPresets();
      const newPreset = this.createPreset(name.trim(), filters, fandom);
      updated.push(newPreset);
      this.savePresets(updated);
      const fresh = this._replaceToolbar(toolbar, updated);
      this.attachPresetToolbarEvents(fresh, { preselectId: newPreset.id });
    });

    exportBtn?.addEventListener('click', () => {
      const data = { presets: this.loadPresets(), bundles: this.loadBundles() };
      this._downloadJson(data, 'ao3h-filterManager-export.json');
    });

    importBtn?.addEventListener('click', () => {
      const input  = document.createElement('input');
      input.type   = 'file';
      input.accept = '.json,application/json';
      input.addEventListener('change', () => {
        const file = input.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          try {
            const data = JSON.parse(/** @type {string} */ (ev.target.result));
            if (Array.isArray(data.presets)) {
              this.savePresets(this._mergeById(this.loadPresets(), data.presets));
            }
            if (Array.isArray(data.bundles)) {
              this.saveBundles(this._mergeById(this.loadBundles(), data.bundles));
            }
            const fresh = this._replaceToolbar(toolbar, this.loadPresets());
            this.attachPresetToolbarEvents(fresh);
          } catch (err) {
            console.error('[AO3H][filterManager]', 'Import parse error', err);
          }
        };
        reader.readAsText(file);
      });
      input.click();
    });

    const _commitPreset = (preset) => {
      this.applyPresetToForm(preset);
      const fandom = this.detectCurrentFandom();
      if (fandom && this.cfg('rememberLastPresetByFandom')) {
        const last = this.storeGet(this.KEY_LAST, {});
        last[fandom] = preset.id;
        this.storeSet(this.KEY_LAST, last);
      }
    };

    applyBtn?.addEventListener('click', () => {
      if (!selectedPreset) return;
      _commitPreset(selectedPreset);
      if (actionRow) actionRow.hidden = true;
      if (activeFilters) { activeFilters.innerHTML = ''; activeFilters.hidden = true; }
      selectedPreset = null;
    });

    expandBtn?.addEventListener('click', () => {
      if (!selectedPreset) return;
      _commitPreset(selectedPreset);
      if (actionRow) actionRow.hidden = true;
      if (activeFilters) this.buildExpandedFilters(selectedPreset, activeFilters);
      selectedPreset = null;
    });

    activeFilters?.addEventListener('click', (e) => {
      const removeBtn = e.target.closest(`.${NS}-chip-remove`);
      if (!removeBtn) return;
      const field      = removeBtn.dataset.field;
      const tagValue   = removeBtn.dataset.tagValue;
      const arrayValue = removeBtn.dataset.arrayValue;
      const form = document.querySelector(FILTER_FORM_SEL);
      if (!form) return;

      if (tagValue !== undefined) {
        const el = /** @type {HTMLInputElement} */ (form.querySelector(`[name="${field}"]`));
        if (el) {
          const remaining = el.value
            .split(',').map(t => t.trim())
            .filter(t => t.toLowerCase() !== tagValue.toLowerCase());
          el.value = remaining.join(', ');
        }
      } else if (arrayValue !== undefined) {
        for (const el of /** @type {NodeListOf<HTMLInputElement>} */ (form.querySelectorAll(`[name="${field}"]`))) {
          if (el.type === 'checkbox' && el.value === arrayValue) el.checked = false;
        }
      } else {
        for (const el of /** @type {NodeListOf<HTMLInputElement>} */ (form.querySelectorAll(`[name="${field}"]`))) {
          if (el.type === 'checkbox') el.checked = false;
          else el.value = '';
        }
      }

      removeBtn.closest(`.${NS}-filter-chip`)?.remove();
      if (!activeFilters.querySelectorAll(`.${NS}-filter-chip`).length) {
        activeFilters.hidden = true;
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && !e.shiftKey && !e.altKey) {
        const n = parseInt(e.key, 10);
        if (n >= 1 && n <= 9) {
          const preset = this.sortedPresets(this.loadPresets())[n - 1];
          if (preset) { this.applyPresetToForm(preset); e.preventDefault(); }
        }
      }
      if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        saveBtn?.click();
        e.preventDefault();
      }
    }, { signal });

    if (options.preselectId && this.cfg('showExpandPreset')) {
      const preset = this.loadPresets().find(p => p.id === options.preselectId);
      if (preset) {
        const nameEl = toolbar.querySelector(`.${NS}-preset-current-name`);
        if (nameEl) nameEl.textContent = preset.name;
        selectedPreset = preset;
        if (actionRow) actionRow.hidden = false;
        if (readyLabel) readyLabel.textContent = `"${preset.name}"`;
      }
    }
  }

  _replaceToolbar (toolbar, presets) {
    const { dt, dd } = this.buildPresetToolbar(presets, this.detectCurrentFandom());
    if (toolbar._ao3hDt) toolbar._ao3hDt.replaceWith(dt);
    toolbar.replaceWith(dd);
    return dd;
  }


  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE LIFECYCLE
  ═════════════════════════════════════════════════════════════════════════ */

  cleanup () {
    this.listenerController?.abort();
    this.listenerController = null;
    this.toolbar?.remove();
    this.toolbarHeading?.remove();
    this.toolbar = null;
    this.toolbarHeading = null;
  }
}
