// AO3 Helper — Vite entry point
// Phase 6: Core connected. Modules and panel will be added in subsequent phases.

// NB (étape 312) : lifecycle.js importe désormais lui-même config.js — cet import
// de tête n'est plus porteur d'ordre, conservé pour lisibilité du graphe.
import '../lib/utils/config.js';
import { init } from './core/coordinator.js';
import './modules.js';
// Appelle Modules.bootAll() (via Bus 'core:ready' ou son propre fallback setTimeout
// si le core est déjà prêt) — sans cet import, aucun module enabledByDefault:true ne
// démarre automatiquement côté Vite (bug découvert et corrigé à l'Étape 225 en
// vérifiant hideByTags : le module s'enregistrait mais restait _booted:false).
import './core/module-loader.js';
import { initMenu } from '../lib/ui/menu/menu.js';
import { initMenuGrouper } from '../lib/ui/menu/menu-grouper.js';
import { css } from '../lib/utils/index.js';
// Étape 398 : enregistre le module WelcomeGuide (import pour effet de bord —
// jamais importé nulle part avant cette étape malgré l'étape 172 marquée terminée).
import '../lib/ui/panel/welcome-guide.js';

// Styles communs (Phase 17) — ordre de cascade : variables, base, composants
// communs, menu, panel. Chargés une seule fois via l'aide idempotente `css()`.
import cssVariables from '../lib/styles/ao3h-variables.css?inline';
import cssBase from '../lib/styles/ao3h-style-base.css?inline';
import cssDialog from '../lib/styles/dialog.css?inline';
import cssIconButton from '../lib/styles/icon-button.css?inline';
import cssCollapseChevron from '../lib/styles/collapse-chevron.css?inline';
import cssToggleSwitch from '../lib/styles/toggle-switch.css?inline';
import cssMenu from '../lib/styles/menu.css?inline';
import cssPanel from '../lib/styles/panel.css?inline';

css(cssVariables, 'ao3h-variables');
css(cssBase, 'ao3h-style-base');
css(cssDialog, 'ao3h-dialog');
css(cssIconButton, 'ao3h-icon-button');
css(cssCollapseChevron, 'ao3h-collapse-chevron');
css(cssToggleSwitch, 'ao3h-toggle-switch');
css(cssMenu, 'ao3h-menu');
css(cssPanel, 'ao3h-panel');

// Étape 315 : bridge window.openAO3HPanel supprimé — menu.js et menu-grouper.js
// importent openAO3HPanel directement depuis panel-index.js.

init();
initMenu();
initMenuGrouper();
