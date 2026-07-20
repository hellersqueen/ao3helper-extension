/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper — Theme Builder Coordinator

    Module ID: themeBuilder
    Display Name: Theme Builder
    Tab: Appearance & Tools

    Purpose
        Coordinates theme creation tools, exposes their shared storage and CSS
        helpers, and restores the active theme on each page load.

    Submodules
        customStyling.js    — Edits, validates, and injects custom CSS.
        themeManagement.js  — Saves, applies, imports, and exports themes.
        typographySystem.js — Manages font and text-spacing controls.
        visualBuilder.js    — Builds themes with visual controls and preview.

    Notes
        Submodules register independently through side-effect imports. Shared
        helpers remain available through window.AO3H_ThemeBuilder for lazy
        access. Built-in themes stay local to themeManagement.js to preserve
        compatibility with themes already saved by users.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register, AO3H } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { css, lsGet, lsSet } from '../../../../lib/utils/index.js';
import { makeCfg } from '../../../../lib/storage/module-settings.js';
import styles from './themeBuilder.css?inline';

import './customStyling.js';
import './themeManagement.js';
import './typographySystem.js';
import './visualBuilder.js';



/* ═══════════════════════════════════════════════════════════════════════════
   MODULE SETUP
═══════════════════════════════════════════════════════════════════════════ */

css(styles, 'ao3h-themeBuilder');

const W    = getGlobalWindow();
const NS   = AO3H.env?.NS || 'ao3h';
const MOD  = 'themeBuilder';
const LOG  = `[AO3H][${MOD}]`;
const ACTIVE_SK = `${NS}:tb:active`;
const APPLIED_ID = `${NS}-tb-active-theme`;
const THEMES_SK = `${NS}:tb:themes`;

export { lsGet, lsSet };

const TB_DEFAULTS = {
  mode:          'visual',
  importEnabled: true,
};

export const tbCfg = makeCfg(MOD, TB_DEFAULTS);



/* ═══════════════════════════════════════════════════════════════════════════
   FEATURES
═══════════════════════════════════════════════════════════════════════════ */

export function applyCSS (cssText, source) {
  let el = document.getElementById(APPLIED_ID);
  if (!el) {
    el = document.createElement('style');
    el.id = APPLIED_ID;
    document.head.appendChild(el);
  }
  el.textContent = cssText || '';
  if (cssText) lsSet(ACTIVE_SK, { source: source || 'manual', css: cssText });
}

export function removeCSS () {
  document.getElementById(APPLIED_ID)?.remove();
  lsSet(ACTIVE_SK, null);
}

// Propriétaire du format des thèmes utilisateur (clé THEMES_SK) — customStyling
// et themeManagement passent tous deux par ici pour créer un thème, plutôt que
// de réimplémenter chacun leur propre sérialisation.
export function saveNewTheme (name, css, { author = '', description = '' } = {}) {
  const themes = lsGet(THEMES_SK) || [];
  const theme = { id: `t${Date.now()}`, name, author, description, css, createdAt: new Date().toISOString() };
  themes.push(theme);
  lsSet(THEMES_SK, themes);
  return theme;
}

export const PROTECTED_ZONES = ['#workskin', '.userstuff', '#chapters', 'body', 'html', '#main'];
const HIDING_DECL_RE = /(display\s*:\s*none|visibility\s*:\s*hidden|opacity\s*:\s*0(?:\.0+)?\s*(?:!|;|$)|font-size\s*:\s*0|height\s*:\s*0(?:px|em|rem|%)?\s*(?:!|;|$)|width\s*:\s*0(?:px|em|rem|%)?\s*(?:!|;|$)|transform\s*:[^;]*scale\s*\(\s*0)/i;

export function findProtectedViolations (cssText) {
  const violations = [];
  const rules = /([^{}]+)\{([^{}]*)\}/g;
  const text = String(cssText || '').replace(/\/\*[^]*?\*\//g, '');
  let match;
  while ((match = rules.exec(text)) !== null) {
    const selector = match[1].trim().split('\n').pop().trim();
    if (!HIDING_DECL_RE.test(match[2])) continue;
    const zone = PROTECTED_ZONES.find(item => {
      const escaped = item.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(`(^|[\\s,>+~])${escaped}(?![\\w-])`).test(` ${selector}`);
    });
    if (zone) violations.push(`Rule "${selector.slice(0, 50)}" would hide the protected zone ${zone} (display:none / visibility / zero size).`);
  }
  return violations;
}

export function hexToRgb (hex) {
  const value = String(hex || '').trim().replace(/^#/, '');
  if (/^[0-9a-f]{3}$/i.test(value)) return [...value].map(char => parseInt(char + char, 16));
  if (/^[0-9a-f]{6}$/i.test(value)) return [0, 2, 4].map(index => parseInt(value.slice(index, index + 2), 16));
  return null;
}

function channelLuminance (value) {
  const channel = value / 255;
  return channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
}

export function contrastRatio (hexA, hexB) {
  const a = hexToRgb(hexA); const b = hexToRgb(hexB);
  if (!a || !b) return null;
  const luminance = rgb => 0.2126 * channelLuminance(rgb[0]) + 0.7152 * channelLuminance(rgb[1]) + 0.0722 * channelLuminance(rgb[2]);
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (high + 0.05) / (low + 0.05);
}

export function contrastVerdict (ratio) {
  if (!Number.isFinite(ratio)) return null;
  return ratio >= 7 ? 'good' : ratio >= 4.5 ? 'ok' : 'low';
}

export const COLORBLIND_PALETTES = [
  { id: 'cb-light', label: '♿ Colorblind-safe (light)', colors: { accentColor: '#d55e00', bgColor: '#ffffff', textColor: '#1a1a1a', linkColor: '#0072b2', headerBg: '#1a1a1a' } },
  { id: 'cb-dark', label: '♿ Colorblind-safe (dark)', colors: { accentColor: '#e69f00', bgColor: '#1b1b1b', textColor: '#f0f0f0', linkColor: '#56b4e9', headerBg: '#000000' } },
];

export function buildElementRule (selector, { textColor = '', bgColor = '', hide = false } = {}) {
  const cleaned = String(selector || '').trim();
  if (!cleaned) return '';
  const declarations = [];
  if (hide) declarations.push('display: none !important;');
  else {
    if (textColor) declarations.push(`color: ${textColor} !important;`);
    if (bgColor) declarations.push(`background-color: ${bgColor} !important;`);
  }
  return declarations.length ? `${cleaned} { ${declarations.join(' ')} }` : '';
}

const themeSafety = {
  PROTECTED_ZONES, findProtectedViolations, hexToRgb, contrastRatio,
  contrastVerdict, COLORBLIND_PALETTES, buildElementRule,
};

export { NS, APPLIED_ID };



/* ═══════════════════════════════════════════════════════════════════════════
   MODULE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(
  MOD,
  { title: 'Theme Builder', enabledByDefault: false },
  async function init () {
    console.log(LOG, 'coordinator init');
    // ── Public API ──────────────────────────────────────────────────────
    W.AO3H_ThemeBuilder = { lsGet, lsSet, applyCSS, removeCSS, saveNewTheme, NS, APPLIED_ID, cfg: tbCfg, ...themeSafety };

    // Re-apply any previously saved active theme
    const active = lsGet(ACTIVE_SK);
    if (active?.css) {
      applyCSS(active.css, active.source);
      console.log(LOG, 'Restored active theme from', active.source);
    }

    return function cleanup () {
      document.getElementById(APPLIED_ID)?.remove();
      delete W.AO3H_ThemeBuilder;
      console.log(LOG, 'coordinator cleanup');
    };
  }
);
