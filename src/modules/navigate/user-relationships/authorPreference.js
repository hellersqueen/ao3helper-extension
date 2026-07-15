/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Author Preference Submodule
    Submodule ID: authorPreference
    Parent: userRelationships
    Display Name: Author Preference

    - Feature: Per-author preferences
      - Option: Store preferences per author
      - Option: Storage key: `authorPreferences:data`
      - Option: JSON object: { author: { hidden, favorite, readCount } }
      - Option: Default values: { hidden: false, favorite: false, readCount: 0 }

    - Feature: Hide/show author works
      - Option: Toggle author visibility
      - Option: Hide button: "🙈 Hide" / "👁️ Show"
      - Option: Preference persistence across pages
      - Option: Page reload after toggle to apply hiding immediately

    - Feature: Favorite authors
      - Option: Mark authors as favorites
      - Option: Toggle button: "☆" / "⭐"
      - Option: Visual favorite indicator (gold border + background on blurb)
      - Option: No page reload needed — updates in place

    - Feature: Reading statistics
      - Option: Display "(X read)" counter beside author name
      - Option: Read count sourced from stored preferences

    - Feature: Author controls in listings
      - Option: Add control buttons to work blurbs on listing pages
      - Option: Inject controls beside author name (.authors)
      - Option: Hide/Show toggle button
      - Option: Favorite toggle button
      - Option: Read count display

    - Feature: Hidden work placeholders
      - Option: Hide blurb and show "[Hidden — author preference]" message
      - Option: Temporary reveal option when showPlaceholder is enabled

═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getUserRelationshipsSettings } from './userRelationshipsSettings.js';
import { observe } from '../../../../lib/utils/index.js';

const MOD  = 'authorPreference';
const NS   = 'ao3h';

const PREFS_KEY = 'authorPreferences:data';
const originalStates = new Map();

// ── Storage helpers ──────────────────────────────────────────────────────

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

// ── DOM helpers ──────────────────────────────────────────────────────────

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

// ── Controls injection ───────────────────────────────────────────────────

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

// ── Module registration ──────────────────────────────────────────────────

register(MOD, {
  title:            'Author Preference',
  parent:           'userRelationships',
  enabledByDefault: true,
}, async function init () {
  processBlurbs();

  const observer = observe(document.body, { childList: true, subtree: true }, processBlurbs);

  return () => {
    observer.disconnect();
    document.querySelectorAll(`.${NS}-author-pref-controls`).forEach(el => el.remove());
    document.querySelectorAll(`.${NS}-hidden-author-blurb`).forEach(el => el.remove());
    originalStates.forEach((state, blurb) => {
      blurb.style.display = state.display;
      blurb.style.border = state.border;
      blurb.style.backgroundColor = state.backgroundColor;
    });
    originalStates.clear();
    document.querySelectorAll('[data-ao3h-pref-controls]').forEach(blurb => {
      delete blurb.dataset.ao3hPrefControls;
    });
  };
});
