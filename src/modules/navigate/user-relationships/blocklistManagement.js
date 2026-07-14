/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Blocklist Management Submodule
    Submodule ID: blocklistManagement
    Parent: userRelationships
    Display Name: Blocklist Management

    - Feature: Blocklist panel
      - Option: Injects a management UI on profile/preferences/dashboard pages
      - Option: Displays all currently blocked users with count
      - Option: Scrollable list, max-height 220px

    - Feature: Add users
      - Option: Text input + "Add" button to block a new username
      - Option: Enter key submits the input
      - Option: Lowercases and deduplicates on add

    - Feature: Remove users
      - Option: Per-user "✕ Remove" button to unblock
      - Option: List re-renders immediately after removal

    - Feature: Export / import
      - Option: Export blocklist as a JSON file download
      - Option: Import JSON file — merges with existing list, deduplicates
      - Option: Invalid files silently ignored

    - Feature: Clear all
      - Option: "Clear All" button with confirmation dialog
      - Option: Empties the entire blocklist on confirm

═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { downloadJSON } from '../../../../lib/utils/json-file.js';

const MOD  = 'blocklistManagement';
const NS   = 'ao3h';

const STORAGE_KEY = 'userBlocker:list';

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
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = evt => {
        try {
          const imported = JSON.parse(evt.target.result);
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
