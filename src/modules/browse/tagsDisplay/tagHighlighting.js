/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Tags Display › Tag Highlighting

Highlights exact favourite-tag matches with configurable colour presets and
provides a right-click palette for adding, updating, or removing rules.

Notes

- Rules are stored in local storage under `ao3h:tagHighlights`.
- Fandom tags are included, and legacy fandom-highlight rules migrate once.
- Injected AO3 Helper controls are excluded when extracting visible tag text.
- This integration has not yet been tested against the live AO3 site.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { observe, onReady } from '../../../../lib/utils/index.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';

const W = getGlobalWindow();
const findMatchingRule = (...args) => W.AO3H_TagsDisplay.findMatchingRule(...args);
const cfg               = (...args) => W.AO3H_TagsDisplay.cfg(...args);
const loadRules         = (...args) => W.AO3H_TagsDisplay.getHighlightRules(...args);
const saveRules         = (...args) => W.AO3H_TagsDisplay.saveHighlightRules(...args);


/* ═══════════════════════════════════════════════════════════════════════════
   READY-MADE HIGHLIGHT PALETTES
═══════════════════════════════════════════════════════════════════════════ */

export const DEFAULT_PALETTE_NAME = 'default';

export const PALETTES = {
  default: [
    { name: 'Yellow', bg: '#fef9c3', border: '#facc15' },
    { name: 'Green',  bg: '#dcfce7', border: '#4ade80' },
    { name: 'Blue',   bg: '#dbeafe', border: '#60a5fa' },
    { name: 'Pink',   bg: '#fce7f3', border: '#f472b6' },
    { name: 'Purple', bg: '#f3e8ff', border: '#c084fc' },
    { name: 'Orange', bg: '#fff7ed', border: '#fb923c' },
  ],
  pastel: [
    { name: 'Yellow', bg: '#fffbe6', border: '#ffe58f' },
    { name: 'Green',  bg: '#e8f8f0', border: '#95dfb0' },
    { name: 'Blue',   bg: '#e6f4ff', border: '#91caff' },
    { name: 'Pink',   bg: '#fff0f6', border: '#ffadd2' },
    { name: 'Purple', bg: '#f5f0ff', border: '#d3adf7' },
    { name: 'Orange', bg: '#fff3e6', border: '#ffc177' },
  ],
  neon: [
    { name: 'Yellow', bg: '#2b2b00', border: '#faff00' },
    { name: 'Green',  bg: '#00330d', border: '#00ff66' },
    { name: 'Blue',   bg: '#001a33', border: '#00c3ff' },
    { name: 'Pink',   bg: '#330018', border: '#ff2e88' },
    { name: 'Purple', bg: '#22002b', border: '#c400ff' },
    { name: 'Orange', bg: '#331400', border: '#ff8800' },
  ],
  classic: [
    { name: 'Yellow', bg: '#fff9c4', border: '#f9a825' },
    { name: 'Green',  bg: '#c8e6c9', border: '#2e7d32' },
    { name: 'Blue',   bg: '#bbdefb', border: '#1565c0' },
    { name: 'Pink',   bg: '#f8bbd0', border: '#ad1457' },
    { name: 'Purple', bg: '#e1bee7', border: '#6a1b9a' },
    { name: 'Orange', bg: '#ffe0b2', border: '#ef6c00' },
  ],
};

export function getPalette(name) {
  return PALETTES[name] || PALETTES[DEFAULT_PALETTE_NAME];
}


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const NS   = 'ao3h';

const MENU_CLS    = `${NS}-tag-hl-menu`;
const HL_ATTR     = 'data-ao3h-hl-checked';

// ── One-time migration from the retired fandomHighlighting submodule ─────
const LEGACY_FANDOM_KEY      = `${NS}:fandomHighlights`;
const LEGACY_MIGRATION_FLAG  = `${NS}:fandomHighlights:migratedToTagHighlights`;

// Legacy migration always matches against the original/default palette —
// it's reading raw hex values saved before palettes existed, independent
// of whatever palette the user has selected today.
const LEGACY_PRESETS = getPalette('default');


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — LEGACY FANDOM-HIGHLIGHT MIGRATION
═══════════════════════════════════════════════════════════════════════════ */

function nearestPresetIndex(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec((hex || '').trim());
  if (!m) return 0;
  const n = parseInt(m[1], 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  let best = 0, bestDist = Infinity;
  LEGACY_PRESETS.forEach((p, idx) => {
    const pm = /^#?([0-9a-f]{6})$/i.exec(p.bg);
    if (!pm) return;
    const pn = parseInt(pm[1], 16);
    const pr = (pn >> 16) & 255, pg = (pn >> 8) & 255, pb = pn & 255;
    const dist = (r - pr) ** 2 + (g - pg) ** 2 + (b - pb) ** 2;
    if (dist < bestDist) { bestDist = dist; best = idx; }
  });
  return best;
}

function migrateLegacyFandomHighlights(rules) {
  if (localStorage.getItem(LEGACY_MIGRATION_FLAG) === 'true') return rules;
  localStorage.setItem(LEGACY_MIGRATION_FLAG, 'true');
  let legacy;
  try { legacy = JSON.parse(localStorage.getItem(LEGACY_FANDOM_KEY)) || []; } catch { legacy = []; }
  if (!Array.isArray(legacy) || !legacy.length) return rules;

  const existingPatterns = new Set(rules.map(r => r.pattern.toLowerCase()));
  let changed = false;
  legacy.forEach(entry => {
    if (!entry?.name || existingPatterns.has(entry.name.trim().toLowerCase())) return;
    rules.push({ pattern: entry.name.trim(), colorIdx: nearestPresetIndex(entry.color) });
    existingPatterns.add(entry.name.trim().toLowerCase());
    changed = true;
  });
  if (changed) saveRules(rules);
  return rules;
}


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — RULE STORAGE AND TAG-TEXT EXTRACTION
═══════════════════════════════════════════════════════════════════════════ */

// Texte du tag SANS les éléments injectés par d'autres modules — sinon la
// correspondance de motif échoue silencieusement dès qu'un autre module a
// décoré le lien avant nous (ex. hiddenTags.js, qui enveloppe le texte
// original dans .ao3h-tag-txt et ajoute une icône .ao3h-hide-ico à côté).
// hiddenTags.js utilise déjà .ao3h-tag-txt en interne pour retrouver le texte
// d'origine (hiddenTags.js l.184-190) — on réutilise la même convention
// plutôt que de deviner quels éléments sont des wrappers vs des ajouts.
// À défaut de ce wrapper connu, on retire tout élément ao3h-* d'un clone
// (couvre les futurs modules qui ne feraient qu'ajouter, sans envelopper).
function directText(el) {
  const wrap = el.querySelector('.ao3h-tag-txt');
  if (wrap) return (wrap.textContent || '').trim();
  const clone = el.cloneNode(true);
  clone.querySelectorAll('[class*="ao3h-"]').forEach(n => n.remove());
  return (clone.textContent || '').trim();
}

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register('tagHighlighting', {
  title: 'tag highlighting',
  parent: 'tagsDisplay',
  enabledByDefault: true,
}, async function init() {

  if (!cfg('highlightFavoriteTags', true)) return () => {};

  let rules = migrateLegacyFandomHighlights(loadRules());

  // Palette + visual style are global settings (not per-rule) — kept simple
  // so the right-click quick-add menu only ever has to pick a colour.
  const PRESETS = getPalette(cfg('highlightPalette', 'default'));
  const style   = cfg('highlightStyle', 'fill');

  /* ═══════════════════════════════════════════════════════════════════════
     FEATURE — HIGHLIGHT APPLICATION
  ═══════════════════════════════════════════════════════════════════════ */

  function applyStyle(a, preset) {
    if (style === 'bold') {
      a.style.fontWeight = 'bold';
      a.style.color = preset.border;
    } else if (style === 'italic') {
      a.style.fontStyle = 'italic';
      a.style.color = preset.border;
    } else if (style === 'border') {
      a.style.border = `1px solid ${preset.border}`;
      a.style.borderRadius = '3px';
      a.style.padding = '0 3px';
    } else if (style === 'symbol') {
      a.style.color = preset.border;
      const star = document.createElement('span');
      star.className = `${NS}-tag-hl-symbol`;
      star.textContent = '★ ';
      a.prepend(star);
    } else {
      // 'fill' (default): filled background + border, as before.
      a.style.background   = preset.bg;
      a.style.borderColor  = preset.border;
      a.style.borderWidth  = '1px';
      a.style.borderStyle  = 'solid';
      a.style.borderRadius = '3px';
    }
  }

  function scan() {
    if (!rules.length) return;

    document.querySelectorAll('.tags a.tag, ul.tags a, h5.fandoms a.tag, .fandoms a.tag, ul.fandom a.tag').forEach(a => {
      if (a.hasAttribute(HL_ATTR)) return;

      const text = directText(a);
      const rule = findMatchingRule(text, rules);
      if (!rule) return; // pas de règle pour ce tag — pas marqué : d'autres
      // modules (ex. hiddenTags.js) peuvent encore réorganiser ce lien après notre
      // passage ; laisser la porte ouverte à un re-scan plus tard évite de rater
      // durablement une correspondance à cause d'un état transitoire de la mutation.
      a.setAttribute(HL_ATTR, '1');

      const preset = PRESETS[rule.colorIdx ?? 0] || PRESETS[0];
      applyStyle(a, preset);
    });
  }

  function clearAll() {
    document.querySelectorAll(`[${HL_ATTR}]`).forEach(a => {
      a.style.background   = '';
      a.style.borderColor  = '';
      a.style.borderWidth  = '';
      a.style.borderStyle  = '';
      a.style.borderRadius = '';
      a.style.padding      = '';
      a.style.border       = '';
      a.style.fontWeight   = '';
      a.style.fontStyle    = '';
      a.style.color        = '';
      a.querySelector(`.${NS}-tag-hl-symbol`)?.remove();
      a.removeAttribute(HL_ATTR);
    });
  }

  /* ═══════════════════════════════════════════════════════════════════════
     FEATURE — QUICK-ADD COLOUR MENU
  ═══════════════════════════════════════════════════════════════════════ */

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
    const tag = e.target.closest('.tags a.tag, ul.tags a, h5.fandoms a.tag, .fandoms a.tag, ul.fandom a.tag');
    if (!tag) return;
    openMenu(e, directText(tag));
  }

  function onClickOutside(e) {
    if (menu && !menu.contains(e.target)) closeMenu();
  }

  document.addEventListener('contextmenu', onContextMenu);
  document.addEventListener('click', onClickOutside);

  // document.body peut ne pas encore exister quand ce module boote (surtout sur
  // une grosse page) — observe() retombe sur document.documentElement si le
  // root est absent, mais celui-ci peut lui aussi manquer à document-start ;
  // reporter à onReady() évite le crash MutationObserver constaté en test.
  let active = true;
  let mo = null;
  onReady(() => {
    if (!active) return;
    scan();
    mo = observe(document.querySelector('#main') || document.body, {
      childList: true, subtree: true,
    }, scan);
  });

  return () => {
    active = false;
    mo?.disconnect();
    closeMenu();
    clearAll();
    document.removeEventListener('contextmenu', onContextMenu);
    document.removeEventListener('click', onClickOutside);
  };
});
