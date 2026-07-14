/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Theme Management Submodule
    Submodule ID: themeManagement
    Display Name: Theme Management
    Source Module: Theme Builder

    - Feature: Theme creation
      - Option: Create and save custom themes
      - Option: Setting: `customThemes` (array of theme objects)
      - Option: Theme metadata (name, author, description)

    - Feature: Import/export themes
      - Option: Export themes as JSON (individual or all)
      - Option: Import themes from JSON files
      - Option: Copy theme as JSON to clipboard

    - Feature: Theme library
      - Option: Browse saved themes
      - Option: Quick-switch between themes
      - Option: Theme preview

═══════════════════════════════════════════════════════════════════════════ */

import { register, AO3H } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { downloadJSON } from '../../../../lib/utils/json-file.js';
import { escapeHtml } from '../../../../lib/utils/dom.js';

const W    = getGlobalWindow();
// Étape 318 : AO3H importé du core/lifecycle (avant : capture window.AO3H).
const NS   = AO3H.env?.NS || 'ao3h';
const MOD  = 'themeManagement';
const LOG  = `[AO3H][${MOD}]`;
const THEMES_SK = `${NS}:tb:themes`;
const ACTIVE_SK = `${NS}:tb:active-theme`;

// ── Helpers ───────────────────────────────────────────────────────────────
function getShared () { return W.AO3H_ThemeBuilder || null; }
function lsGet (key) {
  const s = getShared();
  if (!s) { console.warn(LOG, 'shared ThemeBuilder not ready'); return null; }
  return s.lsGet(key) ?? null;
}
function lsSet (key, val) {
  const s = getShared();
  if (!s) { console.warn(LOG, 'shared ThemeBuilder not ready, drop write', key); return; }
  s.lsSet(key, val);
}
function applyCSS (css, src) { getShared()?.applyCSS(css, src || 'theme'); }
function removeCSS () { getShared()?.removeCSS(); }

function loadThemes () { return lsGet(THEMES_SK) || []; }
function saveThemes (list) { lsSet(THEMES_SK, list); }

// ── Built-in themes ───────────────────────────────────────────────────────
const BUILTIN = [
  {
    id: 'builtin-dark',
    name: 'Dark Mode',
    createdAt: 'builtin',
    css: `
      body, #main { background: #1a1a1a !important; color: #ddd !important; }
      a { color: #89c4f4 !important; }
      .work.blurb { background: #252525 !important; border-color: #444 !important; }
      #sidebar { background: #222 !important; color: #ccc !important; }
      #sidebar a { color: #89c4f4 !important; }
      #header { background: #111 !important; }
    `,
  },
  {
    id: 'builtin-soft',
    name: 'Soft Cream',
    createdAt: 'builtin',
    css: `
      body { background: #fdf6ec !important; color: #3a2a1a !important; }
      #main { background: #fdf6ec !important; }
      a { color: #8b4513 !important; }
      .work.blurb { background: #fff8f0 !important; border-color: #e0c8a0 !important; }
      #header { background: #5a3010 !important; }
    `,
  },
  {
    id: 'builtin-high-contrast',
    name: 'High Contrast',
    createdAt: 'builtin',
    css: `
      body, #main { background: #000 !important; color: #fff !important; }
      a { color: #ff0 !important; }
      .work.blurb { background: #111 !important; border: 2px solid #fff !important; }
      #sidebar { background: #000 !important; color: #fff !important; }
      #header { background: #000 !important; border-bottom: 2px solid #fff !important; }
    `,
  },
];

function getAllThemes () { return [...BUILTIN, ...loadThemes()].map(migrateTheme); }

function migrateTheme (t) {
  return { author: '', description: '', ...t };
}


// ── Panel state ───────────────────────────────────────────────────────────
let panelEl      = null;
let triggerBtn   = null;
let previewingId = null; // ID of theme currently being previewed
let previewPrev  = null; // CSS string to revert to on preview cancel

function renderThemeList () {
  const themes   = getAllThemes();
  const activeId = lsGet(ACTIVE_SK);
  if (!themes.length) return `<p class="${NS}-tb-empty-notice">No themes saved yet.</p>`;
  return themes.map(t => {
    const isBuiltin    = t.createdAt === 'builtin';
    const isActive     = t.id === activeId;
    const isPreviewing = t.id === previewingId;
    return `
      <div class="${NS}-tb-theme-item${isActive ? ' ' + NS + '-tb-theme-active' : ''}" data-id="${escapeHtml(t.id)}">
        <div class="${NS}-tb-theme-header">
          <span class="${NS}-tb-theme-name">${escapeHtml(t.name)}</span>
          ${t.author ? `<span class="${NS}-tb-theme-author">by ${escapeHtml(t.author)}</span>` : ''}
          ${isActive     ? `<span class="${NS}-tb-theme-badge">active</span>` : ''}
          ${isPreviewing ? `<span class="${NS}-tb-theme-badge ${NS}-tb-theme-badge--preview">previewing</span>` : ''}
        </div>
        ${t.description ? `<p class="${NS}-tb-theme-desc">${escapeHtml(t.description)}</p>` : ''}
        <div class="${NS}-tb-row ${NS}-tb-row--compact">
          <button class="${NS}-tb-btn primary ${NS}-tb-btn--sm" data-action="apply">Apply</button>
          <button class="${NS}-tb-btn ${NS}-tb-btn--sm"         data-action="preview">${isPreviewing ? 'Revert' : 'Preview'}</button>
          <button class="${NS}-tb-btn ${NS}-tb-btn--sm"         data-action="share"   title="Copy as JSON">📋</button>
          ${!isBuiltin ? `<button class="${NS}-tb-btn ${NS}-tb-btn--sm" data-action="export">↓</button>` : ''}
          ${!isBuiltin ? `<button class="${NS}-tb-btn ${NS}-tb-btn--sm" data-action="edit">✎</button>` : ''}
          ${!isBuiltin ? `<button class="${NS}-tb-btn ${NS}-tb-btn--sm ${NS}-tb-btn--danger" data-action="delete">✕</button>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

function openPanel () {
  if (panelEl) {
    if (previewingId) revertPreview();
    panelEl.remove(); panelEl = null;
    return;
  }

  panelEl = document.createElement('div');
  panelEl.className = `${NS}-tb-panel`;
  panelEl.innerHTML = `
    <button class="${NS}-tb-panel-close" aria-label="Close themes">✕</button>
    <h4>🎨 Themes</h4>

    <div id="${NS}-tb-preview-notice" style="display:none">
      Previewing: <strong id="${NS}-tb-preview-name"></strong>
      <button class="${NS}-tb-btn" data-action="revert-preview">Revert</button>
    </div>

    <div class="${NS}-tb-themes-list">${renderThemeList()}</div>

    <div class="${NS}-tb-section">
      <div class="${NS}-tb-row ${NS}-tb-row--center">
        <div class="${NS}-tb-section-title ${NS}-tb-section-title--flex">New Theme</div>
        <button class="${NS}-tb-btn ${NS}-tb-btn--sm" data-action="toggle-new-form">＋ Add</button>
      </div>
      <div id="${NS}-tb-new-theme-form" style="display:none">
        <input  class="${NS}-tb-input" id="${NS}-tb-nt-name"   placeholder="Name *">
        <input  class="${NS}-tb-input" id="${NS}-tb-nt-author" placeholder="Author (optional)">
        <textarea class="${NS}-tb-input" id="${NS}-tb-nt-desc" placeholder="Description (optional)" rows="2"></textarea>
        <textarea class="${NS}-tb-input" id="${NS}-tb-nt-css"  placeholder="/* CSS */"              rows="5"></textarea>
        <div class="${NS}-tb-row">
          <button class="${NS}-tb-btn primary" data-action="submit-new-theme">Save Theme</button>
          <button class="${NS}-tb-btn"         data-action="toggle-new-form">Cancel</button>
        </div>
      </div>
    </div>

    <div class="${NS}-tb-section">
      <div class="${NS}-tb-section-title">Import / Export</div>
      <div class="${NS}-tb-row">
        <button class="${NS}-tb-btn" data-action="import">Import JSON</button>
        <button class="${NS}-tb-btn" data-action="export-all">Export All</button>
        <button class="${NS}-tb-btn ${NS}-tb-btn--danger" data-action="reset-active">Remove active</button>
      </div>
      <input type="file" accept=".json" id="${NS}-tb-import-file">
    </div>
  `;
  document.body.appendChild(panelEl);
  attachPanelEvents();

  if (getShared()?.cfg?.('importEnabled') === false) {
    panelEl.querySelector('[data-action="import"]')?.remove();
    panelEl.querySelector(`#${NS}-tb-import-file`)?.remove();
  }
}

// ── Panel helpers ─────────────────────────────────────────────────────────
function refreshList () {
  if (!panelEl) return;
  panelEl.querySelector(`.${NS}-tb-themes-list`).innerHTML = renderThemeList();
}

function revertPreview () {
  if (previewPrev !== null) applyCSS(previewPrev, 'theme');
  else removeCSS();
  previewingId = null;
  previewPrev  = null;
}

function updatePreviewNotice () {
  const notice = panelEl?.querySelector(`#${NS}-tb-preview-notice`);
  const nameEl = panelEl?.querySelector(`#${NS}-tb-preview-name`);
  if (!notice) return;
  if (previewingId) {
    const t = getAllThemes().find(t => t.id === previewingId);
    if (nameEl) nameEl.textContent = t?.name || '';
    notice.style.display = '';
  } else {
    notice.style.display = 'none';
  }
}

function renderEditForm (item, theme) {
  item.innerHTML = `
    <input  class="${NS}-tb-input" data-field="name"        value="${escapeHtml(theme.name)}"           placeholder="Name *">
    <input  class="${NS}-tb-input" data-field="author"      value="${escapeHtml(theme.author || '')}"    placeholder="Author (optional)">
    <textarea class="${NS}-tb-input" data-field="description" rows="2">${escapeHtml(theme.description || '')}</textarea>
    <textarea class="${NS}-tb-input" data-field="css" rows="5">${escapeHtml(theme.css)}</textarea>
    <div class="${NS}-tb-row">
      <button class="${NS}-tb-btn primary" data-edit-save>Save</button>
      <button class="${NS}-tb-btn"         data-edit-cancel>Cancel</button>
    </div>
  `;
  item.querySelector('[data-edit-save]').addEventListener('click', () => {
    const newName = item.querySelector('[data-field="name"]').value.trim();
    if (!newName) { alert('Name is required.'); return; }
    const all = loadThemes();
    const idx = all.findIndex(t => t.id === theme.id);
    if (idx >= 0) {
      all[idx] = {
        ...all[idx],
        name:        newName,
        author:      item.querySelector('[data-field="author"]').value.trim(),
        description: item.querySelector('[data-field="description"]').value.trim(),
        css:         item.querySelector('[data-field="css"]').value.trim(),
      };
      saveThemes(all);
    }
    refreshList();
  });
  item.querySelector('[data-edit-cancel]').addEventListener('click', refreshList);
}

function attachPanelEvents () {
  // ── Close ──
  panelEl.querySelector(`.${NS}-tb-panel-close`).addEventListener('click', () => {
    if (previewingId) revertPreview();
    panelEl?.remove(); panelEl = null;
  });

  // ── Preview notice revert button ──
  panelEl.querySelector('[data-action="revert-preview"]').addEventListener('click', () => {
    revertPreview();
    updatePreviewNotice();
    refreshList();
  });

  // ── Theme list actions (delegated) ──
  panelEl.querySelector(`.${NS}-tb-themes-list`).addEventListener('click', e => {
    const btn    = e.target.closest('[data-action]');
    const item   = e.target.closest('[data-id]');
    if (!btn || !item) return;
    const id     = item.dataset.id;
    const theme  = getAllThemes().find(t => t.id === id);
    if (!theme) return;
    const action = btn.dataset.action;

    if (action === 'apply') {
      previewingId = null;
      previewPrev  = null;
      applyCSS(theme.css, 'theme');
      lsSet(ACTIVE_SK, theme.id);
      updatePreviewNotice();
      refreshList();
      console.log(LOG, 'Applied theme:', theme.name);

    } else if (action === 'preview') {
      if (previewingId === theme.id) {
        revertPreview();
      } else {
        const prevTheme = (() => {
          const aid = lsGet(ACTIVE_SK);
          return aid ? getAllThemes().find(t => t.id === aid) : null;
        })();
        previewPrev  = prevTheme?.css || null;
        previewingId = theme.id;
        applyCSS(theme.css, 'preview');
      }
      updatePreviewNotice();
      refreshList();

    } else if (action === 'share') {
      const payload = JSON.stringify({ name: theme.name, author: theme.author || '', description: theme.description || '', css: theme.css }, null, 2);
      const orig = btn.textContent;
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(payload)
          .then(() => { btn.textContent = '✓'; setTimeout(() => { btn.textContent = orig; }, 1500); })
          .catch(() => { prompt('Copy this JSON:', payload); });
      } else {
        prompt('Copy this JSON:', payload);
      }

    } else if (action === 'export') {
      downloadJSON({ name: theme.name, author: theme.author || '', description: theme.description || '', css: theme.css },
        `${theme.name.replace(/\s+/g, '-').toLowerCase()}.json`);

    } else if (action === 'edit') {
      renderEditForm(item, theme);

    } else if (action === 'delete') {
      if (!confirm(`Delete theme "${theme.name}"?`)) return;
      saveThemes(loadThemes().filter(t => t.id !== id));
      refreshList();
    }
  });

  // ── New theme form toggle (delegated, covers both ＋ and Cancel) ──
  panelEl.addEventListener('click', e => {
    if (!e.target.closest('[data-action="toggle-new-form"]')) return;
    const form   = panelEl.querySelector(`#${NS}-tb-new-theme-form`);
    const isOpen = form.style.display !== 'none';
    form.style.display = isOpen ? 'none' : '';
    if (isOpen) form.querySelectorAll('input, textarea').forEach(el => { el.value = ''; });
  });

  // ── New theme form submit ──
  panelEl.querySelector('[data-action="submit-new-theme"]').addEventListener('click', () => {
    const name = panelEl.querySelector(`#${NS}-tb-nt-name`).value.trim();
    if (!name) { alert('Theme name is required.'); return; }
    const css  = panelEl.querySelector(`#${NS}-tb-nt-css`).value.trim();
    if (!css)  { alert('CSS is required.'); return; }
    const all  = loadThemes();
    all.push({
      id:          `t${Date.now()}`,
      name,
      author:      panelEl.querySelector(`#${NS}-tb-nt-author`).value.trim(),
      description: panelEl.querySelector(`#${NS}-tb-nt-desc`).value.trim(),
      css,
      createdAt:   new Date().toISOString(),
    });
    saveThemes(all);
    const form = panelEl.querySelector(`#${NS}-tb-new-theme-form`);
    form.style.display = 'none';
    form.querySelectorAll('input, textarea').forEach(el => { el.value = ''; });
    refreshList();
    console.log(LOG, 'New theme created:', name);
  });

  // ── Import ──
  const fileInput = panelEl.querySelector(`#${NS}-tb-import-file`);
  panelEl.querySelector('[data-action="import"]').addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data  = JSON.parse(ev.target.result);
        const items = Array.isArray(data) ? data : [data];
        const existing = loadThemes();
        items.forEach(it => {
          if (it.name && it.css) {
            existing.push({ id: `t${Date.now()}-${Math.random().toString(36).slice(2)}`, name: it.name, author: it.author || '', description: it.description || '', css: it.css, createdAt: new Date().toISOString() });
          }
        });
        saveThemes(existing);
        refreshList();
        console.log(LOG, 'Imported', items.length, 'themes');
      } catch {
        alert('Invalid JSON file.');
      }
    };
    reader.readAsText(file);
    fileInput.value = '';
  });

  // ── Export all user themes ──
  panelEl.querySelector('[data-action="export-all"]').addEventListener('click', () => {
    downloadJSON(loadThemes().map(migrateTheme), 'ao3h-themes.json');
  });

  // ── Remove active theme ──
  panelEl.querySelector('[data-action="reset-active"]').addEventListener('click', () => {
    removeCSS();
    lsSet(ACTIVE_SK, null);
    previewingId = null;
    previewPrev  = null;
    updatePreviewNotice();
    refreshList();
    console.log(LOG, 'Active theme removed');
  });
}


// ── Module registration ───────────────────────────────────────────────────
register(
  MOD,
  { title: 'Theme Management', parent: 'themeBuilder', enabledByDefault: true },
  async function init () {
    console.log(LOG, 'init');

    triggerBtn = document.createElement('button');
    triggerBtn.className = `${NS}-tb-trigger ${NS}-tb-trigger--themes`;
    triggerBtn.textContent = '🎨 Themes';
    triggerBtn.setAttribute('aria-label', 'Open theme library');
    triggerBtn.addEventListener('click', openPanel);
    document.body.appendChild(triggerBtn);

    return function cleanup () {
      if (previewingId) revertPreview();
      panelEl?.remove();
      triggerBtn?.remove();
      panelEl    = null;
      triggerBtn = null;
      console.log(LOG, 'cleanup');
    };
  }
);
