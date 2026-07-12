import { register } from '../../../core/lifecycle.js';

// ── Feature list ────────────────────────────────────────────────────────
// 1. "Back to work" button on the bookmark form page — restores context
//    after navigating to /bookmarks/new or /bookmarks/:id/edit
//    (stores the originating URL in sessionStorage on work page visit)
// 2. "My Bookmark" link in the work actions bar — visible when the work
//    is already in the user's bookmarkVault data cache

const MOD = 'bookmarkNavigation';
const NS  = 'ao3h';

const REFERER_KEY = `${NS}:bookmarkNavReferer`;

const DEFAULTS = {
  showBackButton:       true,
  showViewBookmarkLink: true,
};

function cfg (key) {
  try {
    const s = JSON.parse(localStorage.getItem('ao3h:mod:bookmarkVault:settings') || '{}');
    return (key in s) ? s[key] : DEFAULTS[key];
  } catch (_) { return DEFAULTS[key]; }
}

// ── Feature 1: "Back" button after bookmarking ───────────────────────────

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

// ── Feature 2: "View My Bookmark" link on work pages ────────────────────

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
  li.appendChild(btn);
  actions.appendChild(li);
}

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
