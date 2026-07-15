/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Fandom Highlighting Submodule
    Submodule ID: fandomHighlighting
    Display Name: Fandom Highlighting
    Parent Module: visualPreferences

    Visually highlights specific fandoms in AO3 listings, allowing users
    to spot their favourite fandoms at a glance.

    Storage: own key  ao3h:fandomHighlights  (JSON array)
    Entry format: { name: "Harry Potter", color: "#ffe4b5" }

    Public API (for console / future panel integration):
        W.AO3H_VisualPreferences_FandomHighlighting.instance
            .setFandoms([{name, color}, ...])
            .getFandoms()
            .clearFandoms()
    (window bridge kept for console access — the class itself is imported
    directly by the coordinator as an ES module)

═══════════════════════════════════════════════════════════════════════════ */

import { getGlobalWindow } from '../../../../lib/utils/globals.js';

const W = getGlobalWindow();

const STORAGE_KEY  = 'ao3h:fandomHighlights';
const ATTR         = 'data-ao3h-fh';            // marks already-highlighted tags
const DEFAULT_COLOR = '#ffe4b5';
const originalBackgrounds = new WeakMap();

// ── Storage helpers ──────────────────────────────────────────────────────

function loadList () {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) { return []; }
}

function saveList (list) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch (_) {}
}

// ── DOM helpers ──────────────────────────────────────────────────────────

// Highlight fandom tags within a given root element
function applyToRoot (root, list) {
  if (!list.length) return;
  const tags = root.querySelectorAll
    ? root.querySelectorAll('h5.fandoms a.tag, .fandoms a.tag, ul.fandom a.tag')
    : [];
  tags.forEach(function (el) {
    if (el.hasAttribute(ATTR)) return;
    const text = (el.textContent || '').trim().toLowerCase();
    const match = list.find(function (entry) {
      return entry.name && text === entry.name.trim().toLowerCase();
    });
    if (!match) return;
    originalBackgrounds.set(el, el.style.background);
    el.setAttribute(ATTR, '1');
    el.classList.add('ao3h-fandom-highlight');
    el.style.background = match.color || DEFAULT_COLOR;
  });
}

// Remove all applied highlights
function removeAll () {
  document.querySelectorAll('[' + ATTR + ']').forEach(function (el) {
    el.removeAttribute(ATTR);
    el.classList.remove('ao3h-fandom-highlight');
    if (originalBackgrounds.has(el)) {
      el.style.background = originalBackgrounds.get(el);
      originalBackgrounds.delete(el);
    }
  });
}

// ── Class ───────────────────────────────────────────────────────────────

export class FandomHighlighting {
  constructor () {
    this._observer = null;
    this._list     = [];
    // Expose instance for console access
    FandomHighlighting.instance = this;
  }

  // Called by coordinator with the shared visualPreferences state.
  // Fandom list is stored separately in its own key.
  apply (/* state */) {
    this._list = loadList();
    removeAll();
    if (!this._list.length) { this._teardownObserver(); return; }
    applyToRoot(document.body || document.documentElement, this._list);
    this._setupObserver();
  }

  reset () {
    this._teardownObserver();
    removeAll();
    this._list = [];
  }

  // ── Public console API ─────────────────────────────────────────────────

  getFandoms () {
    return loadList();
  }

  setFandoms (list) {
    if (!Array.isArray(list)) return;
    saveList(list);
    this.apply();
    return this;
  }

  clearFandoms () {
    saveList([]);
    this.apply();
    return this;
  }

  // ── MutationObserver ───────────────────────────────────────────────────

  _setupObserver () {
    if (this._observer) return;
    const list = this._list;
    this._observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        m.addedNodes.forEach(function (node) {
          if (node.nodeType !== 1) return;
          applyToRoot(node, list);
        });
      });
    });
    this._observer.observe(document.body || document.documentElement, {
      childList: true,
      subtree:   true,
    });
  }

  _teardownObserver () {
    if (this._observer) { this._observer.disconnect(); this._observer = null; }
  }
}

// Window bridge for the documented console API (instance is set in constructor)
W.AO3H_VisualPreferences_FandomHighlighting = FandomHighlighting;
