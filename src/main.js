// AO3 Helper — minimal document-start entry point.
// Feature modules wait for DOMContentLoaded; settings wait for the first click.

// Doit s'exécuter avant tout import() dynamique de chunk (voir le fichier) :
// fiabilise la résolution SystemJS des chunks en mémoire dans le sandbox userscript.
import './core/system-resolve-patch.js';
// NB (étape 312) : lifecycle.js importe désormais lui-même config.js — cet import
// de tête n'est plus porteur d'ordre, conservé pour lisibilité du graphe.
import '../lib/utils/config.js';
import { init } from './core/coordinator.js';
import { initMenu } from '../lib/ui/menu/menu.js';
import { initMenuGrouper } from '../lib/ui/menu/menu-grouper.js';
import { css } from '../lib/utils/index.js';
import { loadRuntimeBundle } from '../lib/utils/runtime-bundles.js';

// Styles communs (Phase 17) — ordre de cascade : variables, base, composants
// communs et menu. Le CSS du panneau suit son entrée paresseuse.
import cssVariables from '../lib/styles/ao3h-variables.css?inline';
import cssBase from '../lib/styles/ao3h-style-base.css?inline';
import cssComponents from '../lib/styles/components.css?inline';
import cssMenu from '../lib/styles/menu.css?inline';

css(cssVariables, 'ao3h-variables');
css(cssBase, 'ao3h-style-base');
css(cssComponents, 'ao3h-components');
css(cssMenu, 'ao3h-menu');

// Étape 315 : bridge window.openAO3HPanel supprimé — menu.js et menu-grouper.js
// importent openAO3HPanel directement depuis panel-index.js.

init();
initMenu();
initMenuGrouper();

async function loadFeatureModules() {
  try {
    performance.mark?.('ao3h:modules:start');
    await loadRuntimeBundle('modules');
    // Registration must finish before module-loader calls Modules.bootAll().
    const { loadModulesCooperatively } = await import('./modules.js');
    await loadModulesCooperatively();
    await import('./core/module-loader.js');
  } catch (error) {
    console.error('[AO3H] Unable to load feature modules', error);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // Leave the DOMContentLoaded dispatch itself free for AO3 and the menu.
    setTimeout(loadFeatureModules, 0);
  }, { once: true });
} else {
  loadFeatureModules();
}
