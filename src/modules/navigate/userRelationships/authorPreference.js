/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - User Relationships › Author Preference

Adds per-author hide, favorite, and read-count preferences to listing blurbs.

Notes

- Preferences persist under `authorPreferences:data`.
- Favorite styling updates immediately; visibility changes apply after reload.
- Original blurb display and styling values are restored during cleanup.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getUserRelationshipsSettings } from './userRelationshipsSettings.js';
import { observe, onReady } from '../../../../lib/utils/index.js';

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const MOD  = 'authorPreference';
const NS   = 'ao3h';

const PREFS_KEY = 'authorPreferences:data';
const originalStates = new Map();

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — AUTHOR-PREFERENCE STORAGE
═══════════════════════════════════════════════════════════════════════════ */

function getPrefs () {
  try { return JSON.parse(localStorage.getItem(PREFS_KEY) || '{}'); }
  catch (_) { return {}; }
}

function savePrefs (prefs) {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

function getAuthorPrefs (author) {
  return getPrefs()[author] || { hidden: false, favorite: false, readCount: 0 };
}

function setAuthorPrefs (author, patch) {
  const prefs = getPrefs();
  prefs[author] = { ...getAuthorPrefs(author), ...patch };
  savePrefs(prefs);
}

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — AUTHOR VISIBILITY AND FAVORITE STYLING
═══════════════════════════════════════════════════════════════════════════ */

function getAuthorName (blurb) {
  const link = blurb.querySelector('.authors a[rel="author"]');
  return link ? link.textContent.trim() : null;
}

function applyHiddenState (blurb, author) {
  if (!originalStates.has(blurb)) originalStates.set(blurb, {
    display: blurb.style.display,
    border: blurb.style.border,
    backgroundColor: blurb.style.backgroundColor,
  });
  blurb.style.display = 'none';
  const settings = getUserRelationshipsSettings();
  if (!settings.showPlaceholder) return;
  const ph = document.createElement('p');
  ph.className = `${NS}-hidden-author-blurb`;
  ph.textContent = `[Hidden — author preference: ${author}]`;
  const btn = document.createElement('button');
  btn.textContent = 'Reveal';
  btn.className = `${NS}-reveal-btn`;
  btn.addEventListener('click', () => {
    blurb.style.display = originalStates.get(blurb)?.display ?? '';
    ph.remove();
  });
  if (!settings.tempRevealHidden) btn.remove();
  ph.appendChild(btn);
  blurb.parentNode.insertBefore(ph, blurb);
}

function applyFavoriteStyle (blurb, isFavorite) {
  if (!originalStates.has(blurb)) originalStates.set(blurb, {
    display: blurb.style.display,
    border: blurb.style.border,
    backgroundColor: blurb.style.backgroundColor,
  });
  const original = originalStates.get(blurb);
  blurb.style.border = isFavorite ? '2px solid gold' : original.border;
  blurb.style.backgroundColor = isFavorite ? '#fffef0' : original.backgroundColor;
}

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — LISTING CONTROLS
═══════════════════════════════════════════════════════════════════════════ */

function addControls (blurb) {
  if (blurb.dataset.ao3hPrefControls) return;
  if (blurb.dataset.ao3hBlocked) return;   // already hidden by authorBlocking
  const author = getAuthorName(blurb);
  if (!author) return;
  blurb.dataset.ao3hPrefControls = '1';

  const prefs = getAuthorPrefs(author);

  const wrap = document.createElement('span');
  wrap.className = `${NS}-author-pref-controls`;

  const hideBtn = document.createElement('button');
  hideBtn.textContent = prefs.hidden ? '👁️ Show' : '🙈 Hide';
  hideBtn.className = `${NS}-author-pref-btn`;
  hideBtn.addEventListener('click', e => {
    e.preventDefault();
    const current = getAuthorPrefs(author);
    setAuthorPrefs(author, { hidden: !current.hidden });
    location.reload();
  });

  const favBtn = document.createElement('button');
  favBtn.textContent = prefs.favorite ? '⭐' : '☆';
  favBtn.className = `${NS}-author-pref-btn`;
  favBtn.addEventListener('click', e => {
    e.preventDefault();
    const current = getAuthorPrefs(author);
    const newFav = !current.favorite;
    setAuthorPrefs(author, { favorite: newFav });
    favBtn.textContent = newFav ? '⭐' : '☆';
    applyFavoriteStyle(blurb, newFav);
  });

  const readSpan = document.createElement('span');
  readSpan.className = `${NS}-author-pref-read`;
  readSpan.textContent = prefs.readCount > 0 ? `(${prefs.readCount} read)` : '';

  wrap.append(hideBtn, favBtn, readSpan);

  const authorsEl = blurb.querySelector('.authors');
  if (authorsEl) authorsEl.appendChild(wrap);

  // Apply current state visually
  const settings = getUserRelationshipsSettings();
  if (prefs.hidden || (settings.favoritesOnlyFilter && !prefs.favorite)) applyHiddenState(blurb, author);
  if (prefs.favorite) applyFavoriteStyle(blurb, true);
}

function processBlurbs () {
  document.querySelectorAll('li.work.blurb, li.bookmark.blurb').forEach(addControls);
}

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(MOD, {
  title:            'Author Preference',
  parent:           'userRelationships',
  enabledByDefault: true,
}, async function init () {
  // document.body peut ne pas encore exister quand ce module boote — sans ce
  // report, l'observer plantait (Cannot read properties of null), constaté
  // sur plusieurs modules similaires en test.
  let active = true;
  let observer = null;
  onReady(() => {
    if (!active) return;
    processBlurbs();
    observer = observe(document.body, { childList: true, subtree: true }, processBlurbs);
  });

  return () => {
    active = false;
    observer?.disconnect();
    document.querySelectorAll(`.${NS}-author-pref-controls`).forEach(el => el.remove());
    document.querySelectorAll(`.${NS}-hidden-author-blurb`).forEach(el => el.remove());
    originalStates.forEach((state, blurb) => {
      blurb.style.display = state.display;
      blurb.style.border = state.border;
      blurb.style.backgroundColor = state.backgroundColor;
    });
    originalStates.clear();
    document.querySelectorAll('[data-ao3h-pref-controls]').forEach(blurb => {
      delete (/** @type {HTMLElement} */ (blurb)).dataset.ao3hPrefControls;
    });
  };
});
