/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Bookmark Vault › Bookmark Navigation

Preserves navigation context around bookmark forms and adds a direct link from
a work page to the user’s cached bookmark entry.

Notes

- The originating work URL is stored only for the current browser tab.
- Document referrers are accepted only when they share the current origin.
- The bookmark link appears only for works present in Bookmark Vault storage.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { makeCfg } from '../../../../lib/storage/module-settings.js';


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const MOD = 'bookmarkNavigation';
const NS  = 'ao3h';

const REFERER_KEY = `${NS}:bookmarkNavReferer`;

const DEFAULTS = {
  showBackButton:       true,
  showViewBookmarkLink: true,
};

const cfg = makeCfg('bookmarkVault', DEFAULTS);


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — BOOKMARK-FORM RETURN NAVIGATION
═══════════════════════════════════════════════════════════════════════════ */

function injectBackButton () {
  if (!cfg('showBackButton')) return;
  // We're on a bookmark confirmation or bookmark-new page
  if (!/\/bookmarks\/new|\/bookmarks\/\d+\/edit/.test(location.pathname)) return;

  // Prefer our own stored value; validate document.referrer to same origin only
  const stored   = sessionStorage.getItem(REFERER_KEY);
  const referrer = document.referrer;
  const referer  = stored ||
    (referrer && new URL(referrer, location.href).origin === location.origin ? referrer : '');
  if (!referer) return;

  const actions = document.querySelector('#bookmark-form .actions, form.new_bookmark .actions');
  if (!actions || actions.querySelector(`.${NS}-back-btn`)) return;

  const label = referer.includes('/works/') ? 'Back to work' : 'Back';
  const btn   = document.createElement('a');
  btn.href        = referer;
  btn.textContent = `← ${label}`;
  btn.className   = `${NS}-back-btn`;
  actions.appendChild(btn);
}

function storeReferer () {
  // On work pages: remember URL so we can go back after bookmarking
  if (/\/works\/\d+/.test(location.pathname)) {
    sessionStorage.setItem(REFERER_KEY, location.href);
  }
}


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — DIRECT BOOKMARK LINK
═══════════════════════════════════════════════════════════════════════════ */

function injectViewBookmarkLink () {
  if (!cfg('showViewBookmarkLink')) return;
  if (!/\/works\/\d+/.test(location.pathname)) return;

  const workId = (location.pathname.match(/\/works\/([0-9]+)/) || [])[1];
  if (!workId) return;

  const bookmarkData = (() => {
    try { return JSON.parse(localStorage.getItem('ao3h:bookmarkVault:data') || '{}'); }
    catch (_) { return {}; }
  })();

  if (!bookmarkData[workId]) return;

  const actions = document.querySelector('#main ul.actions');
  if (!actions || actions.querySelector(`.${NS}-view-bm`)) return;

  const li  = document.createElement('li');
  const btn = document.createElement('a');
  btn.href        = `/bookmarks?bookmark_search[bookmarkable_id]=${workId}&bookmark_search[bookmarkable_type]=Work`;
  btn.textContent = '🔖 My Bookmark';
  btn.className   = `${NS}-view-bm`;

  // Quick preview on hover: bookmark visibility, note excerpt, personal note
  const bm = bookmarkData[workId];
  const inlineNote = (() => {
    try { return (JSON.parse(localStorage.getItem('ao3h:bookmarkVault:inlineNotes') || '{}'))[workId] || ''; }
    catch (_) { return ''; }
  })();
  const parts = [`${bm.pub ? 'Public' : 'Private'} bookmark`];
  if (bm.notes)    parts.push(`Note: ${String(bm.notes).slice(0, 120)}`);
  if (inlineNote)  parts.push(`Personal: ${inlineNote.slice(0, 120)}`);
  btn.title = parts.join('\n');

  li.appendChild(btn);
  actions.appendChild(li);
}


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(MOD, {
  title:            'Bookmark Navigation',
  parent:           'bookmarkVault',
  enabledByDefault: false,
}, async function init () {
  storeReferer();
  injectBackButton();
  injectViewBookmarkLink();
  return () => {
    document.querySelectorAll(`.${NS}-back-btn, .${NS}-view-bm`).forEach(el => {
      (el.closest('li') ?? el).remove();
    });
  };
});
