/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Search Enhancer › Search Autocomplete

Tracks recent searches, presents keyboard-accessible history suggestions, and
adds quick-search controls beside listing tags and author links.

Notes

- Search history is deduplicated and capped at 25 entries.
- Remote AO3 tag autocomplete remains a documented future implementation.
- Modifier activation opens quick searches in a new tab.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { escapeHtml } from '../../../../lib/utils/dom.js';
import { loadModuleSettings } from '../../../../lib/storage/module-settings.js';
import { lsGet, lsSet, onReady, observe } from '../../../../lib/utils/index.js';


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const NS   = 'ao3h';
const MOD  = 'searchAutocomplete';
const LOG  = `[AO3H][${MOD}]`;

// Settings are shared across all searchEnhancer children and saved by the
// panel under the parent module id (explore/searchEnhancer-config.js).
const DEFAULTS = {
  searchHistory:   true,
  tagAutocomplete: true,
};
function readCfg () {
  return loadModuleSettings('searchEnhancer', DEFAULTS);
}


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — SEARCH HISTORY AND AUTOCOMPLETE
═══════════════════════════════════════════════════════════════════════════ */

const HIST_KEY = `${NS}:se:history`;
const HIST_MAX = 25;

/** @typedef {{ query: string, ts: number }} HistoryItem */
/** @typedef {{ searchHistory: boolean, tagAutocomplete: boolean }} SearchAutocompleteConfig */

/** @returns {HistoryItem[]} */
function historyLoad () { return lsGet(HIST_KEY) || []; }
/** @param {HistoryItem[]} list */
function historySave (list) { lsSet(HIST_KEY, list); }

/** @param {string} query */
function historyPush (query) {
  if (!query?.trim()) return;
  const q = query.trim();
  let list = historyLoad().filter(e => e.query !== q);
  list.unshift({ query: q, ts: Date.now() });
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

function closeDropdown () {
  dropdown?.remove();
  dropdown = null;
  activeIdx = -1;
}

/** @param {HistoryItem[]} items */
function buildDropdownItems (items) {
  return items.map((item, i) => `
    <div class="${NS}-se-ac-item" data-idx="${i}" data-query="${escapeHtml(item.query)}">
      <span class="${NS}-se-ac-icon">🕐</span>
      <span class="${NS}-se-ac-query">${escapeHtml(item.query)}</span>
      <span class="${NS}-se-ac-ts">${formatTs(item.ts)}</span>
    </div>`).join('') +
    `<div class="${NS}-se-ac-clear" data-action="clear">Clear history</div>`;
}

/** @param {HTMLInputElement} input @param {HistoryItem[]} items */
function showDropdown (input, items) {
  closeDropdown();
  if (!items.length) return;

  dropdown = document.createElement('div');
  dropdown.className = `${NS}-se-autocomplete`;
  dropdown.innerHTML = buildDropdownItems(items);

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

/** @param {string} query @param {HistoryItem[]} list */
function filterHistory (query, list) {
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
    debounceTimer = setTimeout(() => {
      const val = input.value;

      // History-based suggestions
      if (cfg.searchHistory) {
        const history = historyLoad();
        const filtered = filterHistory(val, history);
        if (filtered.length) { showDropdown(input, filtered); return; }
      }

      // Tag autocomplete via AO3 endpoint (stub — pending implementation)
      // When cfg.tagAutocomplete is true and val.length >= 2, this would
      // call AO3's /autocomplete/tag?term=... and merge results into dropdown.
      // Deferred: requires GM_xmlhttpRequest + response parsing.
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
    if (input.value.trim()) historyPush(input.value.trim());
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
    dropdown     = null;
    activeIdx    = -1;
    debounceTimer = null;

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
