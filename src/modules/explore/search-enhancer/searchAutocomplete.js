/* ═══════════════════════════════════════════════════════════════════════════
AO3 Helper - Search Autocomplete Submodule
    Submodule ID: searchAutocomplete
    Display Name: Search Autocomplete
    Source Module: Search Enhancer

    - Feature: Search history tracking
      - Option: Record every search query
      - Option: Track timestamps
      - Option: Store up to 20 recent searches
      - Option: Save and recall previous searches
      - Option: Store search queries and filters
      - Option: Quick access to past search patterns

    - Feature: Autocomplete dropdown
      - Option: Show on search box focus
      - Option: Display 10 most recent searches
      - Option: One-click to re-run query

    - Feature: Search history management
      - Option: Remove duplicates automatically
      - Option: Clear history
      - Option: Persistent storage across sessions
      - Option: Perfect for complex multi-tag searches
      - Option: Search history management interface

    - Feature: Quick search icons on hover
      - Option: Quick search icon appears on hover over tags and author names
      - Option: Show icon on tags
      - Option: Show icon on author names
      - Option: Opacity transition on hover for smooth UX
      - Option: Open search in new tab (Ctrl+click behavior)

    - Feature: One-click tag exploration
      - Option: Click icon to instantly search for that tag or author
      - Option: One-click tag exploration without navigating away first
      - Option: Works on: tag pages, work blurbs, author bylines

═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { escapeHtml } from '../../../../lib/utils/dom.js';

const NS   = 'ao3h';
const MOD  = 'searchAutocomplete';
const LOG  = `[AO3H][${MOD}]`;

// ── Config & defaults ─────────────────────────────────────────────────────
// Settings are shared across all searchEnhancer children and saved by the
// panel under the parent module id (Explore-configs/searchEnhancer-config.js).
const DEFAULTS = {
  searchHistory:   true,
  tagAutocomplete: true,
};
function readCfg () {
  try {
    const raw = localStorage.getItem('ao3h:mod:searchEnhancer:settings');
    if (raw) { const saved = JSON.parse(raw); return Object.assign({}, DEFAULTS, saved); }
  } catch (_) { /* */ }
  return Object.assign({}, DEFAULTS);
}

// ── Storage helpers ───────────────────────────────────────────────────────
function lsGet (key) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch { return null; }
}
function lsSet (key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

// ── Search history (max 25, deduped) ──────────────────────────────────────
const HIST_KEY = `${NS}:se:history`;
const HIST_MAX = 25;

function historyLoad () { return lsGet(HIST_KEY) || []; }
function historySave (list) { lsSet(HIST_KEY, list); }

function historyPush (query) {
  if (!query?.trim()) return;
  const q = query.trim();
  let list = historyLoad().filter(e => e.query !== q);
  list.unshift({ query: q, ts: Date.now() });
  if (list.length > HIST_MAX) list = list.slice(0, HIST_MAX);
  historySave(list);
}

function historyClear () { historySave([]); }

function formatTs (ts) {
  const diff = Date.now() - ts;
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

// ── Dropdown state (reassigned each init() to avoid stale state on re-enable) ──
let dropdown     = null;
let activeIdx    = -1;
let debounceTimer = null;
const DEBOUNCE_MS = 300;

function closeDropdown () {
  dropdown?.remove();
  dropdown = null;
  activeIdx = -1;
}

function buildDropdownItems (items) {
  return items.map((item, i) => `
    <div class="${NS}-se-ac-item" data-idx="${i}" data-query="${escapeHtml(item.query)}">
      <span class="${NS}-se-ac-icon">🕐</span>
      <span class="${NS}-se-ac-query">${escapeHtml(item.query)}</span>
      <span class="${NS}-se-ac-ts">${formatTs(item.ts)}</span>
    </div>`).join('') +
    `<div class="${NS}-se-ac-clear" data-action="clear">Clear history</div>`;
}

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
    const item = e.target.closest(`.${NS}-se-ac-item`);
    if (item) {
      input.value = item.dataset.query;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      closeDropdown();
      return;
    }
    if (e.target.dataset.action === 'clear') {
      historyClear();
      closeDropdown();
    }
  });
}

function filterHistory (query, list) {
  const q = query.toLowerCase();
  return q.length >= 2
    ? list.filter(e => e.query.toLowerCase().includes(q))
    : list.slice(0, 10);
}

// ── Keyboard navigation ───────────────────────────────────────────────────
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
    input.value = items[activeIdx].dataset.query;
    closeDropdown();
    return;
  } else if (e.key === 'Escape') {
    closeDropdown(); return;
  } else { return; }

  items.forEach((el, i) => el.classList.toggle(`${NS}-se-ac-active`, i === activeIdx));
}

// ── Attach to a search input ──────────────────────────────────────────────
function attachToInput (input, cfg, cleanup_fns) {
  const onInput = () => {
    clearTimeout(debounceTimer);
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

// ── Quick search icons on hover ───────────────────────────────────────────
const ICON_CLS  = `${NS}-se-qs-icon`;

function buildSearchUrl (href) {
  // Tag links: /tags/Tag%20Name/works  → keep as-is (already a valid listing)
  // Author links: /users/AuthorName → /users/AuthorName/works
  if (/^\/users\/[^/]+\/?$/.test(new URL(href, location.origin).pathname)) {
    return href.replace(/\/?$/, '/works');
  }
  return href;
}

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

function processBlurb (blurb) {
  // Tag links inside .tags lists
  blurb.querySelectorAll('.tags a[href*="/tags/"]').forEach(a => attachQuickIcon(a));
  // Author links
  blurb.querySelectorAll('a[href*="/users/"]').forEach(a => attachQuickIcon(a));
}

function setupQuickIcons () {
  document.querySelectorAll('li.work.blurb, li.bookmark.blurb').forEach(b => processBlurb(b));

  const observer = new MutationObserver(mutations => {
    mutations.forEach(m => m.addedNodes.forEach(node => {
      if (node.nodeType !== 1) return;
      if (node.matches?.('li.work.blurb, li.bookmark.blurb')) processBlurb(node);
      else node.querySelectorAll?.('li.work.blurb, li.bookmark.blurb').forEach(b => processBlurb(b));
    }));
  });
  observer.observe(document.body, { childList: true, subtree: true });
  return observer;
}

// ── Module registration ───────────────────────────────────────────────────
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

    const cleanup_fns = [];
    let observer = null;

    // Autocomplete / history dropdown
    if (cfg.searchHistory || cfg.tagAutocomplete) {
      document.querySelectorAll(
        'input[type="text"][name*="query"], input#work_search_query, input[name="query"]'
      ).forEach(inp => attachToInput(inp, cfg, cleanup_fns));

      const onDocClick = e => { if (!dropdown?.contains(e.target)) closeDropdown(); };
      document.addEventListener('click', onDocClick);
      cleanup_fns.push(() => document.removeEventListener('click', onDocClick));
    }

    // Quick search icons on hover
    observer = setupQuickIcons();

    return function cleanup () {
      closeDropdown();
      clearTimeout(debounceTimer);
      cleanup_fns.forEach(fn => fn());
      observer?.disconnect();
      document.querySelectorAll(`.${ICON_CLS}`).forEach(el => el.remove());
      console.log(LOG, 'cleanup');
    };
  }
);
