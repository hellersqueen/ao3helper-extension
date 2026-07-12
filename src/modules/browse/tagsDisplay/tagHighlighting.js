/* ═══════════════════════════════════════════════════════════════════════════
   AO3 Helper — Tag Highlighting Submodule
   Submodule ID : tagHighlighting
   Parent        : tagsDisplay

   What it does:
     On listing pages, highlights tags the user has marked as "favourites".
     Favourite tags are stored in localStorage as an array of
     { pattern, color } objects.  Colour is one of 6 presets defined
     in the panel config.

   Settings (from tagsDisplay config.js):
     highlightFavoriteTags — master toggle (default true)

   Storage:
     ao3h:tagHighlights — JSON array [{ pattern: "Enemies to Lovers", color: "#fef08a" }, …]

   Quick-add:
     Right-click a tag → small context menu "Highlight this tag" with colour swatches.
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { Flags } from '../../../../lib/utils/config.js';

const NS   = 'ao3h';

const MENU_CLS    = `${NS}-tag-hl-menu`;
const HL_ATTR     = 'data-ao3h-hl-checked';
const STORAGE_KEY = `${NS}:tagHighlights`;

/* ── Colour presets (match panel config swatches) ──────────────────────── */
const PRESETS = [
  { name: 'Yellow', bg: '#fef9c3', border: '#facc15' },
  { name: 'Green',  bg: '#dcfce7', border: '#4ade80' },
  { name: 'Blue',   bg: '#dbeafe', border: '#60a5fa' },
  { name: 'Pink',   bg: '#fce7f3', border: '#f472b6' },
  { name: 'Purple', bg: '#f3e8ff', border: '#c084fc' },
  { name: 'Orange', bg: '#fff7ed', border: '#fb923c' },
];

/* ── Settings reader (via parent module tagsDisplay) ───────────────────── */
function cfg(key, fallback) {
  try { return Flags.get('mod:tagsDisplay:' + key) ?? fallback; } catch { /* */ }
  return fallback;
}

/* ── Persistent store ──────────────────────────────────────────────────── */
function loadRules() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
}
function saveRules(arr) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

/* ── Registration ────────────────────────────────────────────────────────── */

register('tagHighlighting', {
  title: 'tag highlighting',
  parent: 'tagsDisplay',
  enabledByDefault: true,
}, async function init() {

  if (!cfg('highlightFavoriteTags', true)) return () => {};

  let rules = loadRules();

  /* ── Build rule index (lower-cased pattern → preset index) ────────────── */
  function ruleMap() {
    const m = new Map();
    rules.forEach(r => m.set(r.pattern.toLowerCase(), r.colorIdx ?? 0));
    return m;
  }

  /* ── Apply highlights to all tags ─────────────────────────────────────── */
  function scan() {
    const map = ruleMap();
    if (!map.size) return;

    document.querySelectorAll('.tags a.tag, ul.tags a').forEach(a => {
      if (a.hasAttribute(HL_ATTR)) return;
      a.setAttribute(HL_ATTR, '1');

      const text = (a.textContent || '').trim().toLowerCase();
      if (!map.has(text)) return;

      const idx = map.get(text);
      const preset = PRESETS[idx] || PRESETS[0];
      a.style.background  = preset.bg;
      a.style.borderColor = preset.border;
      a.style.borderWidth = '1px';
      a.style.borderStyle = 'solid';
      a.style.borderRadius = '3px';
    });
  }

  /* ── Clear all highlights ─────────────────────────────────────────────── */
  function clearAll() {
    document.querySelectorAll(`[${HL_ATTR}]`).forEach(a => {
      a.style.background  = '';
      a.style.borderColor = '';
      a.style.borderWidth = '';
      a.style.borderStyle = '';
      a.style.borderRadius = '';
      a.removeAttribute(HL_ATTR);
    });
  }

  /* ── Context menu for quick-add ───────────────────────────────────────── */
  let menu = null;

  function closeMenu() {
    if (menu) { menu.remove(); menu = null; }
  }

  function openMenu(e, tagText) {
    e.preventDefault();
    closeMenu();

    menu = document.createElement('div');
    menu.className = MENU_CLS;

    const existing = rules.find(r => r.pattern.toLowerCase() === tagText.toLowerCase());

    PRESETS.forEach((p, idx) => {
      const btn = document.createElement('button');
      btn.style.background = p.bg;
      btn.style.borderColor = p.border;
      btn.title = p.name;
      if (idx === cfg('highlightColor', 0) && !existing) {
        btn.style.outline = '2px solid #333';
      }
      btn.addEventListener('click', () => {
        // Add or update rule
        const cur = rules.find(r => r.pattern.toLowerCase() === tagText.toLowerCase());
        if (cur) { cur.colorIdx = idx; }
        else { rules.push({ pattern: tagText, colorIdx: idx }); }
        saveRules(rules);
        clearAll();
        scan();
        closeMenu();
      });
      menu.appendChild(btn);
    });

    if (existing) {
      const rm = document.createElement('button');
      rm.className = `${NS}-hl-remove`;
      rm.textContent = '✕';
      rm.title = 'Remove highlight';
      rm.addEventListener('click', () => {
        rules = rules.filter(r => r.pattern.toLowerCase() !== tagText.toLowerCase());
        saveRules(rules);
        clearAll();
        scan();
        closeMenu();
      });
      menu.appendChild(rm);
    }

    menu.style.left = e.clientX + 'px';
    menu.style.top  = e.clientY + 'px';
    document.body.appendChild(menu);
  }

  function onContextMenu(e) {
    const tag = e.target.closest('.tags a.tag, ul.tags a');
    if (!tag) return;
    openMenu(e, tag.textContent.trim());
  }

  function onClickOutside(e) {
    if (menu && !menu.contains(e.target)) closeMenu();
  }

  document.addEventListener('contextmenu', onContextMenu);
  document.addEventListener('click', onClickOutside);

  /* ── Observer + initial scan ───────────────────────────────────────────── */
  scan();
  const mo = new MutationObserver(scan);
  mo.observe(document.querySelector('#main') || document.body, {
    childList: true, subtree: true,
  });

  /* ── Cleanup ──────────────────────────────────────────────────────────── */
  return () => {
    mo.disconnect();
    closeMenu();
    clearAll();
    document.removeEventListener('contextmenu', onContextMenu);
    document.removeEventListener('click', onClickOutside);
  };
});
