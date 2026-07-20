/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Bookmark Vault › Sorting and Filtering

Hides unavailable bookmark entries behind a toggle and adds persistent client-
side sorting by date, title, or fandom.

Notes

- Archived detection uses known AO3 deletion, restriction, and lock messages.
- Sort direction and field persist between visits.
- Cleanup restores the original DOM order and all filtered entries.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { lsGet, lsSet } from '../../../../lib/utils/index.js';


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const MOD = 'sortingAndFiltering';
const NS  = 'ao3h';

// AO3 marks deleted/restricted works with "This work was deleted" or "[locked]"
const ARCHIVED_SIGNALS = [
  'this work was deleted',
  'this work is no longer available',
  '[locked]',
  'sorry, you don\'t have permission',
];


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — ARCHIVED BOOKMARK FILTER
═══════════════════════════════════════════════════════════════════════════ */

function isArchived (blurb) {
  const text = blurb.textContent.toLowerCase();
  return ARCHIVED_SIGNALS.some(sig => text.includes(sig));
}

function applyFilter (hide) {
  let hidden = 0;
  document.querySelectorAll('li.bookmark.blurb').forEach(blurb => {
    if (isArchived(blurb)) {
      blurb.style.display = hide ? 'none' : '';
      if (hide) { blurb.dataset.ao3hSfHidden = '1'; hidden++; }
      else delete blurb.dataset.ao3hSfHidden;
    }
  });
  return hidden;
}


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — PERSISTED BOOKMARK SORTING
═══════════════════════════════════════════════════════════════════════════ */

const PREF_KEY = 'ao3h:bookmarkVault:sortPreference';

function loadSortPref () {
  return lsGet(PREF_KEY, {});
}

function saveSortPref (key, dir) {
  lsSet(PREF_KEY, { key, dir });
}

function getBookmarkList () {
  return document.querySelector('#main ol.bookmark.index');
}

function tagOriginalIndices (list) {
  if (!list) return;
  Array.from(list.querySelectorAll(':scope > li.bookmark.blurb')).forEach((li, i) => {
    if (!li.dataset.ao3hSortIdx) li.dataset.ao3hSortIdx = String(i);
  });
}

function restoreOriginalOrder (list) {
  if (!list) return;
  const items = Array.from(list.querySelectorAll(':scope > li.bookmark.blurb'));
  items.sort((a, b) =>
    parseInt(a.dataset.ao3hSortIdx || '0', 10) - parseInt(b.dataset.ao3hSortIdx || '0', 10)
  );
  items.forEach(li => list.appendChild(li));
}

function sortBookmarks (list, key, dir) {
  if (!list) return;
  const items = Array.from(list.querySelectorAll(':scope > li.bookmark.blurb'));
  items.sort((a, b) => {
    let va, vb;
    if (key === 'date') {
      va = new Date(a.querySelector('time[datetime]')?.getAttribute('datetime') || 0).getTime();
      vb = new Date(b.querySelector('time[datetime]')?.getAttribute('datetime') || 0).getTime();
      return dir === 'asc' ? va - vb : vb - va;
    }
    if (key === 'title') {
      va = (a.querySelector('h4.heading a')?.textContent || '').trim().toLowerCase();
      vb = (b.querySelector('h4.heading a')?.textContent || '').trim().toLowerCase();
      return dir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
    }
    if (key === 'fandom') {
      va = (a.querySelector('dd.fandom a.tag')?.textContent || '').trim().toLowerCase();
      vb = (b.querySelector('dd.fandom a.tag')?.textContent || '').trim().toLowerCase();
      return dir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
    }
    return 0;
  });
  items.forEach(li => list.appendChild(li));
}

let activeKey = null;
let activeDir = null;

function injectSortControls (list) {
  const controlsId = `${NS}-sort-controls`;
  if (document.getElementById(controlsId)) return;

  const pref = loadSortPref();
  if (pref.key) { activeKey = pref.key; activeDir = pref.dir || 'desc'; }

  const wrap = document.createElement('div');
  wrap.id = controlsId;
  wrap.className = `${NS}-sort-controls`;

  const label = document.createElement('span');
  label.textContent = 'Sort by:';
  label.className = `${NS}-sort-label`;
  wrap.appendChild(label);

  const SORTS = [
    { key: 'date',   labels: { asc: 'Date ↑', desc: 'Date ↓' },    defaultDir: 'desc' },
    { key: 'title',  labels: { asc: 'Title A→Z', desc: 'Title Z→A' }, defaultDir: 'asc'  },
    { key: 'fandom', labels: { asc: 'Fandom A→Z', desc: 'Fandom Z→A' }, defaultDir: 'asc' },
  ];

  const buttons = {};

  SORTS.forEach(({ key, labels, defaultDir }) => {
    const btn = document.createElement('button');
    btn.dataset.sortKey = key;
    btn.className = `${NS}-sort-btn`;

    function updateLabel () {
      const dir = (activeKey === key) ? activeDir : defaultDir;
      btn.textContent = labels[dir];
      btn.classList.toggle(`${NS}-sort-active`, activeKey === key);
    }

    btn.addEventListener('click', () => {
      if (activeKey === key) {
        // Toggle direction
        activeDir = activeDir === 'asc' ? 'desc' : 'asc';
      } else {
        activeKey = key;
        activeDir = defaultDir;
      }
      saveSortPref(activeKey, activeDir);
      sortBookmarks(list, activeKey, activeDir);
      Object.values(buttons).forEach(b => b.updateLabel());
    });

    buttons[key] = { btn, updateLabel };
    updateLabel();
    wrap.appendChild(btn);
  });

  // Insert above the bookmark list
  list.insertAdjacentElement('beforebegin', wrap);

  // Apply stored sort on init
  if (activeKey) sortBookmarks(list, activeKey, activeDir);
}

function injectToggle () {
  if (!/\/users\/[^/]+\/bookmarks/.test(location.pathname)) return;
  const anchor = document.querySelector('#main h2.heading, #main h3.heading');
  if (!anchor || document.getElementById(`${NS}-archived-toggle`)) return;

  let hidden = true;
  const count = applyFilter(true);
  if (!count) return; // nothing archived — don't inject toggle

  const btn = document.createElement('button');
  btn.id          = `${NS}-archived-toggle`;
  btn.textContent = `Show ${count} archived bookmark${count !== 1 ? 's' : ''}`;

  btn.addEventListener('click', () => {
    hidden = !hidden;
    applyFilter(hidden);
    btn.textContent = hidden
      ? `Show ${count} archived bookmark${count !== 1 ? 's' : ''}`
      : `Hide archived bookmarks`;
  });

  anchor.insertAdjacentElement('afterend', btn);
}


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(MOD, {
  title:            'Sorting & Filtering',
  parent:           'bookmarkVault',
  enabledByDefault: false,
}, async function init () {
  injectToggle();

  if (/\/users\/[^/]+\/bookmarks/.test(location.pathname)) {
    const list = getBookmarkList();
    if (list) {
      tagOriginalIndices(list);
      injectSortControls(list);
    }
  }

  return () => {
    document.getElementById(`${NS}-archived-toggle`)?.remove();
    document.getElementById(`${NS}-sort-controls`)?.remove();
    const list = getBookmarkList();
    if (list) {
      restoreOriginalOrder(list);
      list.querySelectorAll(':scope > li.bookmark.blurb').forEach(li => {
        delete li.dataset.ao3hSortIdx;
      });
    }
    document.querySelectorAll('[data-ao3h-sf-hidden]').forEach(blurb => {
      blurb.style.display = '';
      delete blurb.dataset.ao3hSfHidden;
    });
    activeKey = null;
    activeDir = null;
  };
});
