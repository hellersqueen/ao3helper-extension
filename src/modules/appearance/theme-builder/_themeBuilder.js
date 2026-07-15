/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Theme Builder Module Coordinator
    Module ID: themeBuilder
    Display Name: Theme Builder
    Description: Provides advanced theme creation and customization tools with CSS editing, theme management, typography controls, and visual builders.

    Submodules (each independently registered, parent: 'themeBuilder'):
        themeBuilder/customStyling    — CSS editor panel + custom injection
        themeBuilder/themeManagement  — save/apply/import/export themes
        themeBuilder/typographySystem — font presets + size/line-height controls
        themeBuilder/visualBuilder    — color pickers + live preview

    Coordinator role:
        - Re-applies active theme CSS on every page load (before submodules init)
        - Exposes W.AO3H_ThemeBuilder shared helpers (kept as window bridge —
          submodules read it lazily via getShared() at init time; also exported
          as ES bindings below)
        - Injects shared panel CSS

    Storage:
        ao3h:tb:customcss   — user's raw custom CSS string
        ao3h:tb:themes      — [{ id, name, css, createdAt }]
        ao3h:tb:active      — { source: 'custom'|'theme'|'typography'|'visual', css }
        ao3h:tb:typography  — { preset, fontFamily, fontSize, lineHeight, letterSpacing }
        ao3h:tb:visual      — { accentColor, bgColor, textColor, linkColor, fontSize, lineHeight }

    Note: themeBuilder définit ses propres thèmes inline (BUILTIN dans
    themeManagement.js) plutôt que d'utiliser lib/themes/builtin — décision
    Phase 24 réexaminée (shared.md, décision produit theme-builder↔lib/themes) :
    fusionner les deux catalogues de thèmes changerait des thèmes déjà
    sauvegardés par des utilisateurs, jugé trop risqué sans test en direct.
    En revanche, lib/themes/engine/themeValidator.js (contrôle de sécurité
    CSS, jusque-là inutilisé) est maintenant branché dans customStyling.js et
    themeManagement.js sur les points d'entrée de CSS non fiable (import de
    thème JSON notamment).

═══════════════════════════════════════════════════════════════════════════ */

import { register, AO3H } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { css } from '../../../../lib/utils/index.js';
import { makeCfg } from '../../../../lib/storage/module-settings.js';
import styles from './themeBuilder.css?inline';

import './customStyling.js';
import './themeManagement.js';
import './typographySystem.js';
import './visualBuilder.js';

css(styles, 'ao3h-themeBuilder');

const W    = getGlobalWindow();
// Étape 318 : AO3H importé du core/lifecycle (avant : capture window.AO3H).
const NS   = AO3H.env?.NS || 'ao3h';
const MOD  = 'themeBuilder';
const LOG  = `[AO3H][${MOD}]`;
const ACTIVE_SK = `${NS}:tb:active`;
const APPLIED_ID = `${NS}-tb-active-theme`;

// ── Storage helpers (ré-exportés pour les sous-modules et le bridge) ──────
export { lsGet, lsSet } from '../../../../lib/utils/index.js';
import { lsGet, lsSet } from '../../../../lib/utils/index.js';

// ── Panel settings ────────────────────────────────────────────────
const TB_DEFAULTS = {
  mode:          'visual',
  importEnabled: true,
};

export const tbCfg = makeCfg(MOD, TB_DEFAULTS);

// ── Apply / remove active theme ───────────────────────────────────────────
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

export { NS, APPLIED_ID };

// ── Coordinator registration ──────────────────────────────────────────────
register(
  MOD,
  { title: 'Theme Builder', enabledByDefault: false },
  async function init () {
    console.log(LOG, 'coordinator init');
    // ── Public API ──────────────────────────────────────────────────────
    W.AO3H_ThemeBuilder = { lsGet, lsSet, applyCSS, removeCSS, NS, APPLIED_ID, cfg: tbCfg };

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
