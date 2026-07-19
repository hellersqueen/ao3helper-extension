/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Later Shelf › Counter Badge

Adds a small "📌 N" badge to AO3's header navigation, on every page — a
permanent, always-visible count of the shelf. Clicking it opens a quick
preview of the most recent items without navigating away.

Notes

- Injected independently of mainNavigation (no cross-module DOM coupling):
  same resilient header-UL lookup, but its own element.
- The badge count reflects new additions live (EV_MARKED_FOR_LATER); removals
  made elsewhere on the same page are picked up next time the preview opens.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { loadItems } from './laterShelfStore.js';
import { EV_MARKED_FOR_LATER } from '../../../../lib/utils/event-names.js';

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const MOD = 'laterShelfCounterBadge';
const D   = document;

function findPrimaryHeaderUL () {
  const selectors = [
    '#header ul.primary.navigation',
    '#header nav ul.primary.navigation',
    '#header ul.primary',
    '#header nav ul',
    'ul.primary.navigation',
  ];
  for (const s of selectors) {
    const el = D.querySelector(s);
    if (el && el.tagName === 'UL' && !el.closest('#ao3h-helper, #ao3h-menu, .ao3h-root')) return el;
  }
  return null;
}

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(MOD, {
  title: 'Later Shelf Counter Badge',
  parent: 'laterShelf',
  enabledByDefault: true,
}, function init () {
  const headerUL = findPrimaryHeaderUL();
  if (!headerUL) return function cleanup () {};

  const li = D.createElement('li');
  li.id = 'ao3h-ls-nav-counter';
  const btn = D.createElement('a');
  btn.href = 'javascript:void(0);';
  btn.className = 'ao3h-ls-nav-counter-btn';
  li.appendChild(btn);
  headerUL.appendChild(li);

  const preview = D.createElement('div');
  preview.id = 'ao3h-ls-nav-preview';
  preview.hidden = true;
  li.appendChild(preview);

  function render () {
    const items = loadItems();
    btn.textContent = '📌 ' + items.length;
  }

  function renderPreview () {
    const items = loadItems().slice().sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0)).slice(0, 5);
    preview.innerHTML = '';
    if (!items.length) {
      const empty = D.createElement('div');
      empty.className = 'ao3h-ls-nav-preview-empty';
      empty.textContent = 'Your Later Shelf is empty.';
      preview.appendChild(empty);
    } else {
      const list = D.createElement('ul');
      items.forEach(function (item) {
        const row = D.createElement('li');
        const a = D.createElement('a');
        a.href = 'https://archiveofourown.org/works/' + item.wid;
        a.textContent = item.title || ('Work ' + item.wid);
        row.appendChild(a);
        list.appendChild(row);
      });
      preview.appendChild(list);
    }
    const viewAll = D.createElement('a');
    viewAll.className = 'ao3h-ls-nav-preview-viewall';
    viewAll.href = '#';
    viewAll.textContent = 'View full list →';
    const userMatch = location.pathname.match(/\/users\/([^/]+)/);
    if (userMatch) viewAll.href = '/users/' + userMatch[1] + '/readings?show=to-read';
    preview.appendChild(viewAll);
  }

  function togglePreview (e) {
    e.preventDefault();
    e.stopPropagation();
    if (!preview.hidden) { preview.hidden = true; return; }
    renderPreview();
    preview.hidden = false;
  }

  function onDocClick (e) {
    if (!li.contains(e.target)) preview.hidden = true;
  }

  function onAdded () { render(); }

  btn.addEventListener('click', togglePreview);
  D.addEventListener('click', onDocClick);
  D.addEventListener(EV_MARKED_FOR_LATER, onAdded);

  render();

  return function cleanup () {
    D.removeEventListener('click', onDocClick);
    D.removeEventListener(EV_MARKED_FOR_LATER, onAdded);
    li.remove();
  };
});
