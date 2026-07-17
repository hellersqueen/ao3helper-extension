/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - User Relationships › Blocklist Management

Provides an on-page interface for adding, removing, importing, exporting, and
clearing blocked AO3 usernames.

Notes

- The panel appears only on relevant profile, preferences, and dashboard pages.
- Imported usernames are normalized, merged, and deduplicated.
- Clearing the entire list requires confirmation.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { downloadJSON } from '../../../../lib/utils/json-file.js';

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const MOD  = 'blocklistManagement';
const NS   = 'ao3h';

const STORAGE_KEY = 'userBlocker:list';

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — BLOCKLIST STORAGE AND MANAGEMENT PANEL
═══════════════════════════════════════════════════════════════════════════ */

function getList () {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch (_) { return []; }
}

function saveList (arr) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

function buildPanel () {
  const wrap = document.createElement('div');
  wrap.id = `${NS}-blocklist-manager`;

  function render () {
    const list = getList();
    wrap.innerHTML = `
      <h4>
        AO3 Helper — Blocked Users (${list.length})
      </h4>
      <ul id="${NS}-bl-list"></ul>
      <div class="${NS}-bl-controls">
        <input id="${NS}-bl-input" type="text" placeholder="Username to block" />
        <button id="${NS}-bl-add">Add</button>
        <button id="${NS}-bl-export">Export JSON</button>
        <label class="${NS}-bl-label">
          Import JSON
          <input id="${NS}-bl-import" type="file" accept=".json" />
        </label>
        <button id="${NS}-bl-clear">
          Clear All
        </button>
      </div>`;

    const ul = wrap.querySelector(`#${NS}-bl-list`);
    if (!list.length) {
      ul.innerHTML =
        `<li class="${NS}-bl-empty">No blocked users.</li>`;
    } else {
      list.forEach(user => {
        const li = document.createElement('li');
        li.className = `${NS}-bl-item`;
        const removeBtn = document.createElement('button');
        removeBtn.textContent = '✕ Remove';
        removeBtn.className = `${NS}-bl-remove-btn`;
        removeBtn.addEventListener('click', () => {
          saveList(getList().filter(u => u !== user));
          render();
        });
        li.append(Object.assign(document.createElement('span'), { textContent: user }), removeBtn);
        ul.appendChild(li);
      });
    }

    wrap.querySelector(`#${NS}-bl-add`).addEventListener('click', () => {
      const input = wrap.querySelector(`#${NS}-bl-input`);
      const username = input.value.trim().toLowerCase();
      if (!username) return;
      const current = getList();
      if (!current.includes(username)) saveList([...current, username]);
      input.value = '';
      render();
    });

    wrap.querySelector(`#${NS}-bl-input`).addEventListener('keydown', e => {
      if (e.key === 'Enter') wrap.querySelector(`#${NS}-bl-add`).click();
    });

    wrap.querySelector(`#${NS}-bl-export`).addEventListener('click', () => {
      downloadJSON(getList(), 'ao3h-blocklist.json');
    });

    wrap.querySelector(`#${NS}-bl-import`).addEventListener('change', function (e) {
      const input = /** @type {HTMLInputElement} */ (e.target);
      const file = input.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = evt => {
        try {
          if (typeof reader.result !== 'string') throw new Error('invalid text file');
          const imported = JSON.parse(reader.result);
          if (!Array.isArray(imported)) throw new Error('not an array');
          const merged = [...new Set([...getList(), ...imported.map(u => String(u).toLowerCase())])];
          saveList(merged);
          render();
        } catch (_) {
          // Invalid file — silently ignore
        }
      };
      reader.readAsText(file);
    });

    wrap.querySelector(`#${NS}-bl-clear`).addEventListener('click', () => {
      if (confirm('AO3 Helper: Clear all blocked users?')) {
        saveList([]);
        render();
      }
    });
  }

  render();
  return wrap;
}

/** Inject only on pages where it's contextually appropriate: profile / preferences / dashboard. */
function isManagementPage () {
  return (
    /\/users\/[^/]+\/(preferences|profile|dashboard)/.test(location.pathname) ||
    /\/users\/[^/]+$/.test(location.pathname)
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(MOD, {
  title:            'Blocklist Management',
  parent:           'userRelationships',
  enabledByDefault: true,
}, async function init () {
  if (!isManagementPage()) return () => {};

  const panel  = buildPanel();
  const anchor = document.querySelector('#main');
  if (anchor) anchor.prepend(panel);

  return () => panel.remove();
});
