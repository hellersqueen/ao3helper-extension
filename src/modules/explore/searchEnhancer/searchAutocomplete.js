/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Search Enhancer › Search Autocomplete

Tracks recent searches, presents keyboard-accessible history suggestions, and
adds quick-search controls beside listing tags and author links.

Notes

- Search history is deduplicated and capped at 25 entries.
- The main query field's dropdown merges local history with AO3's own
  `/autocomplete/tag` suggestions (same-origin fetch, silently no-ops offline).
- Modifier activation opens quick searches in a new tab.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { escapeHtml } from '../../../../lib/utils/dom.js';
import { loadModuleSettings } from '../../../../lib/storage/module-settings.js';
import { lsGet, lsSet, onReady, observe } from '../../../../lib/utils/index.js';


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const W    = getGlobalWindow();
const NS   = 'ao3h';
const MOD  = 'searchAutocomplete';
const LOG  = `[AO3H][${MOD}]`;

// Settings are shared across all searchEnhancer children and saved by the
// panel under the parent module id (explore/searchEnhancer-config.js).
const DEFAULTS = {
  searchHistory:        true,
  tagAutocomplete:      true,
  historyTypoTolerance: true,
};
function readCfg () {
  return loadModuleSettings('searchEnhancer', DEFAULTS);
}


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — SEARCH HISTORY AND AUTOCOMPLETE
═══════════════════════════════════════════════════════════════════════════ */

const HIST_KEY = `${NS}:se:history`;
const HIST_MAX = 25;

/** @typedef {{ query: string, ts: number, fandom?: string|null }} HistoryItem */
/** @typedef {{ searchHistory: boolean, tagAutocomplete: boolean, historyTypoTolerance: boolean }} SearchAutocompleteConfig */

/** @returns {HistoryItem[]} */
function historyLoad () { return lsGet(HIST_KEY) || []; }
/** @param {HistoryItem[]} list */
function historySave (list) { lsSet(HIST_KEY, list); }

/** @param {string} query @param {string|null} [fandom] */
function historyPush (query, fandom = null) {
  if (!query?.trim()) return;
  const q = query.trim();
  let list = historyLoad().filter(e => e.query !== q);
  list.unshift({ query: q, ts: Date.now(), fandom: fandom || null });
  if (list.length > HIST_MAX) list = list.slice(0, HIST_MAX);
  historySave(list);
}

function historyClear () { historySave([]); }

/** @param {number} ts */
function formatTs (ts) {
  const diff = Date.now() - ts;
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

// Reassigned during each initialization to avoid stale state on re-enable.
/** @type {HTMLDivElement|null} */
let dropdown     = null;
let activeIdx    = -1;
/** @type {ReturnType<typeof setTimeout>|null} */
let debounceTimer = null;
const DEBOUNCE_MS = 300;
// Guards against an older, slower fetchTagAutocomplete() response landing
// after the user has kept typing and a newer request is already in flight.
let inputRequestId = 0;

function closeDropdown () {
  dropdown?.remove();
  dropdown = null;
  activeIdx = -1;
}

/** @param {HistoryItem[]} items */
function buildHistoryItemsHtml (items) {
  return items.map((item, i) => `
    <div class="${NS}-se-ac-item" data-idx="${i}" data-query="${escapeHtml(item.query)}">
      <span class="${NS}-se-ac-icon">🕐</span>
      <span class="${NS}-se-ac-query">${escapeHtml(item.query)}</span>
      <span class="${NS}-se-ac-ts">${formatTs(item.ts)}</span>
    </div>`).join('');
}

/** @param {{name:string, icon:string}[]} items */
function buildTagItemsHtml (items) {
  return items.map((item, i) => `
    <div class="${NS}-se-ac-item ${NS}-se-ac-tag-item" data-idx="hist-${items.length}-${i}" data-query="${escapeHtml(item.name)}">
      <span class="${NS}-se-ac-icon">${item.icon}</span>
      <span class="${NS}-se-ac-query">${escapeHtml(item.name)}</span>
    </div>`).join('');
}

/**
 * @param {HTMLInputElement} input
 * @param {HistoryItem[]} historyItems
 * @param {{name:string, icon:string}[]} tagItems
 */
function showDropdown (input, historyItems, tagItems = []) {
  closeDropdown();
  if (!historyItems.length && !tagItems.length) return;

  dropdown = document.createElement('div');
  dropdown.className = `${NS}-se-autocomplete`;
  dropdown.innerHTML =
    buildHistoryItemsHtml(historyItems) +
    buildTagItemsHtml(tagItems) +
    (historyItems.length ? `<div class="${NS}-se-ac-clear" data-action="clear">Clear history</div>` : '');

  // Position below input
  const rect = input.getBoundingClientRect();
  dropdown.style.cssText = `top:${rect.bottom + scrollY}px;left:${rect.left + scrollX}px;width:${rect.width}px;position:absolute;`;
  document.body.appendChild(dropdown);

  // Click handlers
  dropdown.addEventListener('click', e => {
    const target = e.target instanceof Element ? e.target : null;
    const item = target?.closest(`.${NS}-se-ac-item`);
    if (item) {
      input.value = item.dataset.query || '';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      closeDropdown();
      return;
    }
    if (target?.closest('[data-action="clear"]')) {
      historyClear();
      closeDropdown();
    }
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — REAL AO3 TAG AUTOCOMPLETE
═══════════════════════════════════════════════════════════════════════════ */

// AO3's own tag suggestions come back as [{ id, name }], with `name` often
// including a usage count like "Angst (28,571)" — stripped before use.
// Some responses also carry a category via `type`/`class` (e.g. "Fandom"),
// used only to pick an icon; missing/unknown categories fall back to 🏷.
const TAG_TYPE_ICON = { fandom: '🌐', character: '👤', relationship: '💞', freeform: '#' };

function cleanTagName (name) {
  return String(name || '').replace(/\s*\(\d[\d,]*\)\s*$/, '').trim();
}

function iconForTagResult (item) {
  const type = String(item?.type || item?.class || '').toLowerCase();
  return TAG_TYPE_ICON[type] || '🏷';
}

/** @param {string} term @returns {Promise<{name:string, icon:string}[]>} */
async function fetchTagAutocomplete (term) {
  try {
    const res = await fetch(`/autocomplete/tag?term=${encodeURIComponent(term)}`, { credentials: 'same-origin' });
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.slice(0, 8).map(item => ({ name: cleanTagName(item.name), icon: iconForTagResult(item) }))
      .filter(item => item.name);
  } catch {
    return []; // offline, blocked, or unexpected response shape — fail silently
  }
}

/** @param {string} query @param {HistoryItem[]} list @param {boolean} typoTolerant */
function filterHistory (query, list, typoTolerant = true) {
  if (typoTolerant) return W.AO3H_SearchEnhancer.fuzzyFilterHistory(list, query);
  const q = query.toLowerCase();
  return q.length >= 2
    ? list.filter(e => e.query.toLowerCase().includes(q))
    : list.slice(0, 10);
}

/** @param {KeyboardEvent} e @param {HTMLInputElement} input */
function handleKey (e, input) {
  if (!dropdown) return;
  const items = dropdown.querySelectorAll(`.${NS}-se-ac-item`);
  if (!items.length) return;

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    activeIdx = Math.min(activeIdx + 1, items.length - 1);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    activeIdx = Math.max(activeIdx - 1, 0);
  } else if (e.key === 'Enter' && activeIdx >= 0) {
    e.preventDefault();
    input.value = items[activeIdx].dataset.query || '';
    closeDropdown();
    return;
  } else if (e.key === 'Escape') {
    closeDropdown(); return;
  } else { return; }

  items.forEach((el, i) => el.classList.toggle(`${NS}-se-ac-active`, i === activeIdx));
}

/**
 * @param {HTMLInputElement} input
 * @param {SearchAutocompleteConfig} cfg
 * @param {Array<() => void>} cleanup_fns
 */
function attachToInput (input, cfg, cleanup_fns) {
  const onInput = () => {
    if (debounceTimer !== null) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      const val = input.value;
      const requestId = ++inputRequestId;

      const historyItems = cfg.searchHistory
        ? filterHistory(val, historyLoad(), cfg.historyTypoTolerance)
        : [];

      // AO3's own canonical tags, merged in alongside history suggestions —
      // this input has no native AO3 autocomplete of its own (unlike the
      // dedicated fandom/character/relationship fields), that's the gap
      // the `tagAutocomplete` setting fills.
      const tagItems = (cfg.tagAutocomplete && val.trim().length >= 2)
        ? await fetchTagAutocomplete(val.trim())
        : [];

      if (requestId !== inputRequestId) return; // stale response, input changed since
      showDropdown(input, historyItems, tagItems);
    }, DEBOUNCE_MS);
  };

  const onKey = e => handleKey(e, input);

  const onFocus = () => {
    if (!cfg.searchHistory || input.value.trim()) return;
    const history = historyLoad().slice(0, 8);
    showDropdown(input, history);
  };

  const onBlur = () => setTimeout(closeDropdown, 150);

  const onFormSubmit = () => {
    if (!input.value.trim()) return;
    const fandomField = input.form?.querySelector(
      'input[name="work_search[fandom_names]"], input[name*="fandom_names"]'
    );
    const fandom = W.AO3H_SearchEnhancer.extractFandomFromContext({
      pathname: location.pathname,
      fandomFieldValue: fandomField?.value,
    });
    historyPush(input.value.trim(), fandom);
  };

  input.addEventListener('input', onInput);
  input.addEventListener('keydown', onKey);
  input.addEventListener('focus', onFocus);
  input.addEventListener('blur', onBlur);
  input.form?.addEventListener('submit', onFormSubmit);

  cleanup_fns.push(() => {
    input.removeEventListener('input', onInput);
    input.removeEventListener('keydown', onKey);
    input.removeEventListener('focus', onFocus);
    input.removeEventListener('blur', onBlur);
    input.form?.removeEventListener('submit', onFormSubmit);
  });
}


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — QUICK TAG AND AUTHOR SEARCH
═══════════════════════════════════════════════════════════════════════════ */

const ICON_CLS  = `${NS}-se-qs-icon`;

/** @param {string} href */
function buildSearchUrl (href) {
  // Tag links: /tags/Tag%20Name/works  → keep as-is (already a valid listing)
  // Author links: /users/AuthorName → /users/AuthorName/works
  if (/^\/users\/[^/]+\/?$/.test(new URL(href, location.origin).pathname)) {
    return href.replace(/\/?$/, '/works');
  }
  return href;
}

/** @param {HTMLAnchorElement} link */
function attachQuickIcon (link) {
  if (link.dataset.seQs) return;          // already processed
  link.dataset.seQs = '1';

  const icon = document.createElement('span');
  icon.className = ICON_CLS;
  icon.title = 'Quick search';
  icon.setAttribute('aria-label', 'Search this tag');
  icon.setAttribute('role', 'button');
  icon.setAttribute('tabindex', '0');
  icon.textContent = '🔍';

  /** @param {MouseEvent|KeyboardEvent} e */
  const activate = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const url = buildSearchUrl(link.href);
    if (e.ctrlKey || e.metaKey || e.shiftKey) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      location.href = url;
    }
  };

  icon.addEventListener('click', activate);
  icon.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') activate(e); });
  link.after(icon);
}

/** @param {Element} blurb */
function processBlurb (blurb) {
  // Tag links inside .tags lists
  const tagLinks = /** @type {NodeListOf<HTMLAnchorElement>} */ (
    blurb.querySelectorAll('.tags a[href*="/tags/"]')
  );
  tagLinks.forEach(a => attachQuickIcon(a));
  // Author links
  const authorLinks = /** @type {NodeListOf<HTMLAnchorElement>} */ (
    blurb.querySelectorAll('a[href*="/users/"]')
  );
  authorLinks.forEach(a => attachQuickIcon(a));
}

function setupQuickIcons () {
  document.querySelectorAll('li.work.blurb, li.bookmark.blurb').forEach(b => processBlurb(b));

  const observer = observe(document.body, { childList: true, subtree: true }, mutations => {
    mutations.forEach(m => m.addedNodes.forEach(node => {
      if (!(node instanceof Element)) return;
      if (node.matches?.('li.work.blurb, li.bookmark.blurb')) processBlurb(node);
      else node.querySelectorAll?.('li.work.blurb, li.bookmark.blurb').forEach(b => processBlurb(b));
    }));
  });
  return observer;
}


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(
  MOD,
  { title: 'Search Autocomplete', parent: 'searchEnhancer', enabledByDefault: true },
  async function init () {
    const cfg = readCfg();
    console.log(LOG, 'init', cfg);

    // Reset per-boot state
    dropdown      = null;
    activeIdx     = -1;
    debounceTimer = null;
    inputRequestId = 0;

    /** @type {Array<() => void>} */
    const cleanup_fns = [];
    /** @type {MutationObserver|null} */
    let observer = null;
    let active = true;

    // document.body peut ne pas encore exister quand ce module boote — sans ce
    // report, l'observer plantait (Cannot read properties of null), constaté
    // sur plusieurs modules similaires en test.
    onReady(() => {
      if (!active) return;

      // Autocomplete / history dropdown
      if (cfg.searchHistory || cfg.tagAutocomplete) {
        const searchInputs = /** @type {NodeListOf<HTMLInputElement>} */ (
          document.querySelectorAll(
            'input[type="text"][name*="query"], input#work_search_query, input[name="query"]'
          )
        );
        searchInputs.forEach(inp => attachToInput(inp, cfg, cleanup_fns));

        /** @param {MouseEvent} e */
        const onDocClick = e => {
          if (!(e.target instanceof Node) || !dropdown?.contains(e.target)) closeDropdown();
        };
        document.addEventListener('click', onDocClick);
        cleanup_fns.push(() => document.removeEventListener('click', onDocClick));
      }

      // Quick search icons on hover
      observer = setupQuickIcons();
    });

    return function cleanup () {
      active = false;
      closeDropdown();
      if (debounceTimer !== null) clearTimeout(debounceTimer);
      debounceTimer = null;
      cleanup_fns.forEach(fn => fn());
      observer?.disconnect();
      document.querySelectorAll(`.${ICON_CLS}`).forEach(el => el.remove());
      console.log(LOG, 'cleanup');
    };
  }
);
