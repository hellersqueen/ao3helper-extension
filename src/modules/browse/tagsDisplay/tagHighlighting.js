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

   Fusionné avec l'ex-fandomHighlighting (appearance/visual-preferences) —
   shared.md, décision produit K4 : les deux modules surlignaient des tags
   favoris par correspondance de texte, avec deux stockages et deux UX
   (fandomHighlighting était console-only, sans entrée dans le panneau).
   Le sélecteur couvre désormais aussi les tags de fandom, et les entrées de
   l'ancienne clé ao3h:fandomHighlights sont importées une seule fois vers
   ao3h:tagHighlights au premier démarrage après mise à jour.
   ⚠️ Non testé en conditions réelles sur AO3.
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { Flags } from '../../../../lib/utils/config.js';
import { observe, onReady } from '../../../../lib/utils/index.js';

const NS   = 'ao3h';

const MENU_CLS    = `${NS}-tag-hl-menu`;
const HL_ATTR     = 'data-ao3h-hl-checked';
const STORAGE_KEY = `${NS}:tagHighlights`;

// ── One-time migration from the retired fandomHighlighting submodule ─────
const LEGACY_FANDOM_KEY      = `${NS}:fandomHighlights`;
const LEGACY_MIGRATION_FLAG  = `${NS}:fandomHighlights:migratedToTagHighlights`;

function nearestPresetIndex(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec((hex || '').trim());
  if (!m) return 0;
  const n = parseInt(m[1], 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  let best = 0, bestDist = Infinity;
  PRESETS.forEach((p, idx) => {
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

/* ── Colour presets (match panel config swatches) ──────────────────────── */
const PRESETS = [
  { name: 'Yellow', bg: '#fef9c3', border: '#facc15' },
  { name: 'Green',  bg: '#dcfce7', border: '#4ade80' },
  { name: 'Blue',   bg: '#dbeafe', border: '#60a5fa' },
  { name: 'Pink',   bg: '#fce7f3', border: '#f472b6' },
  { name: 'Purple', bg: '#f3e8ff', border: '#c084fc' },
  { name: 'Orange', bg: '#fff7ed', border: '#fb923c' },
];

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

  let rules = migrateLegacyFandomHighlights(loadRules());

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

    document.querySelectorAll('.tags a.tag, ul.tags a, h5.fandoms a.tag, .fandoms a.tag, ul.fandom a.tag').forEach(a => {
      if (a.hasAttribute(HL_ATTR)) return;

      const text = directText(a).toLowerCase();
      if (!map.has(text)) return; // pas de règle pour ce tag — pas marqué : d'autres
      // modules (ex. hiddenTags.js) peuvent encore réorganiser ce lien après notre
      // passage ; laisser la porte ouverte à un re-scan plus tard évite de rater
      // durablement une correspondance à cause d'un état transitoire de la mutation.
      a.setAttribute(HL_ATTR, '1');

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
    const tag = e.target.closest('.tags a.tag, ul.tags a, h5.fandoms a.tag, .fandoms a.tag, ul.fandom a.tag');
    if (!tag) return;
    openMenu(e, directText(tag));
  }

  function onClickOutside(e) {
    if (menu && !menu.contains(e.target)) closeMenu();
  }

  document.addEventListener('contextmenu', onContextMenu);
  document.addEventListener('click', onClickOutside);

  /* ── Observer + initial scan ───────────────────────────────────────────── */
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

  /* ── Cleanup ──────────────────────────────────────────────────────────── */
  return () => {
    active = false;
    mo?.disconnect();
    closeMenu();
    clearAll();
    document.removeEventListener('contextmenu', onContextMenu);
    document.removeEventListener('click', onClickOutside);
  };
});
