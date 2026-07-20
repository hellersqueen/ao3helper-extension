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
import { observe, onReady } from '../../../../lib/utils/index.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { EV_WORK_FINISHED } from '../../../../lib/utils/event-names.js';
import { getWorkAuthor } from '../../../../lib/ao3/work-page.js';

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const MOD  = 'authorPreference';
const NS   = 'ao3h';
const W    = getGlobalWindow();
const cyclePriority = (...args) => W.AO3H_UserRelationships.cyclePriority(...args);
const priorityIcon = (...args) => W.AO3H_UserRelationships.priorityIcon(...args);
const parseTags = (...args) => W.AO3H_UserRelationships.parseTags(...args);
const getUserRelationshipsSettings = (...args) => W.AO3H_UserRelationships.getUserRelationshipsSettings(...args);
// Optional-chained: a stray MutationObserver callback can still fire in the
// brief window after this module's coordinator has already torn down.
const getPrefs = (...args) => W.AO3H_UserRelationships?.getAuthorPrefsMap(...args) ?? {};
const savePrefs = (...args) => W.AO3H_UserRelationships?.saveAuthorPrefsMap(...args);
const getAuthorPrefs = (...args) => W.AO3H_UserRelationships?.getAuthorPrefsFor(...args)
  ?? { hidden: false, favorite: false, readCount: 0, priority: 'normal', tags: [] };

const originalStates = new Map();

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — AUTHOR-PREFERENCE STORAGE
═══════════════════════════════════════════════════════════════════════════ */

function setAuthorPrefs (author, patch) {
  const prefs = getPrefs();
  prefs[author] = { ...getAuthorPrefs(author), ...patch };
  savePrefs(prefs);
}

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — READ-COUNT TRACKING
═══════════════════════════════════════════════════════════════════════════ */

/**
 * ficAppreciation dispatches EV_WORK_FINISHED (soft cross-module dependency,
 * no import of that module's files) whenever a work is marked finished on its
 * own work page — the author is read straight off that same page.
 */
function onWorkFinished () {
  const { name } = getWorkAuthor();
  if (!name) return;
  const current = getAuthorPrefs(name);
  setAuthorPrefs(name, { readCount: (current.readCount || 0) + 1 });
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

  const prioBtn = document.createElement('button');
  prioBtn.textContent = priorityIcon(prefs.priority) || '➖';
  prioBtn.title = `Reading priority: ${prefs.priority} (click to cycle)`;
  prioBtn.className = `${NS}-author-pref-btn`;
  prioBtn.addEventListener('click', e => {
    e.preventDefault();
    const current = getAuthorPrefs(author);
    const next = cyclePriority(current.priority);
    setAuthorPrefs(author, { priority: next });
    prioBtn.textContent = priorityIcon(next) || '➖';
    prioBtn.title = `Reading priority: ${next} (click to cycle)`;
  });

  const readSpan = document.createElement('span');
  readSpan.className = `${NS}-author-pref-read`;
  readSpan.textContent = prefs.readCount > 0 ? `(${prefs.readCount} read)` : '';

  const tagsSpan = document.createElement('span');
  tagsSpan.className = `${NS}-author-pref-tags`;
  (prefs.tags || []).forEach(tag => {
    const pill = document.createElement('span');
    pill.className = `${NS}-author-tag-pill`;
    pill.textContent = tag;
    tagsSpan.appendChild(pill);
  });

  const tagsInput = document.createElement('input');
  tagsInput.type = 'text';
  tagsInput.className = `${NS}-author-pref-tags-input`;
  tagsInput.placeholder = 'Tags…';
  tagsInput.value = (prefs.tags || []).join(', ');
  tagsInput.title = 'Comma-separated tags for this author';
  tagsInput.addEventListener('change', () => {
    const tags = parseTags(tagsInput.value);
    setAuthorPrefs(author, { tags });
    tagsSpan.innerHTML = '';
    tags.forEach(tag => {
      const pill = document.createElement('span');
      pill.className = `${NS}-author-tag-pill`;
      pill.textContent = tag;
      tagsSpan.appendChild(pill);
    });
  });

  wrap.append(hideBtn, favBtn, prioBtn, readSpan, tagsSpan, tagsInput);

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
  W.addEventListener?.(EV_WORK_FINISHED, onWorkFinished);
  onReady(() => {
    if (!active) return;
    processBlurbs();
    observer = observe(document.body, { childList: true, subtree: true }, () => {
      if (active) processBlurbs();
    });
  });

  return () => {
    active = false;
    observer?.disconnect();
    W.removeEventListener?.(EV_WORK_FINISHED, onWorkFinished);
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
