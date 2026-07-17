// tests/e2e/menu-boot.mjs — test de fumée bout-en-bout : charge le vrai
// dist/ao3-helper.user.js (celui qu'on distribue) dans un navigateur, sur une
// page ao3-mock/ qui reprend le vrai markup AO3 (blurbs, dl.stats...), et
// vérifie que tout le pipeline de démarrage fonctionne encore :
//   build → boot du coordinateur → chargement des modules → menu inséré.
// N'importe quelle régression de boot (import cassé, exception au chargement,
// module qui plante avant que les autres ne s'enregistrent...) fait échouer
// ce test. Ce n'est pas un test unitaire — pas de mock du DOM, juste une
// vraie page Chromium.
//
// Lancer : npm run build && npm run test:e2e

import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { existsSync } from 'node:fs';
import { startBundleServer } from './bundle-server.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');
const distScript = path.join(repoRoot, 'dist/ao3-helper.user.js');
const gmShim = path.join(__dirname, 'gm-shim.js');
const mockPage = path.join(repoRoot, 'ao3-mock/bookmarks.html');

let failures = 0;
function check(label, condition) {
  if (condition) {
    console.log(`  ✓ ${label}`);
  } else {
    console.error(`  ✗ ${label}`);
    failures++;
  }
}

async function main() {
  if (!existsSync(distScript)) {
    console.error(`dist/ao3-helper.user.js introuvable — lance d'abord "npm run build".`);
    process.exit(1);
  }

  const bundles = await startBundleServer();
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const consoleErrors = [];
  page.on('pageerror', (err) => consoleErrors.push(String(err)));

  await page.addInitScript({ path: gmShim });
  await page.addInitScript({ content: `window.__AO3H_ASSET_BASE__ = ${JSON.stringify(bundles.baseURL)};` });
  await page.addInitScript({ path: distScript });

  console.log('Chargement de la page mock (bookmarks.html) avec AO3 Helper injecté...');
  await page.goto(pathToFileURL(mockPage).href);

  // Le menu (bouton "AO3 Helper") est inséré soit dans la nav AO3, soit en
  // repli dans un bouton flottant — voir createNavigationButton() dans
  // src/core/lifecycle.js. Dans les deux cas l'élément racine est li.ao3h-root.
  const roots = page.locator('li.ao3h-root');
  await roots.first().waitFor({ state: 'attached', timeout: 10000 }).catch(() => {});
  const rootCount = await roots.count();
  check('le bouton du menu AO3 Helper (li.ao3h-root) est présent dans le DOM', rootCount > 0);

  // Invariant à préserver : un seul bouton de menu, jamais deux. (Cette
  // assertion a d'abord semblé attraper un vrai bug de double-création côté
  // src/core/lifecycle.js — après investigation, la vraie cause était un
  // défaut du fixture : ao3-mock/js/ao3-header.js avait un ancien instantané
  // du menu AO3 Helper codé en dur dans son template d'en-tête, en plus du
  // vrai bouton créé par le script. Corrigé dans le fixture, pas dans le
  // produit — voir le commit qui a nettoyé ao3-header.js.)
  check('un seul bouton de menu AO3 Helper est créé (pas de doublon)', rootCount === 1);

  if (rootCount > 0) {
    const toggle = roots.first().locator('.ao3h-navlink');
    check('le menu contient son bouton de bascule (.ao3h-navlink)', await toggle.count() > 0);

    check(
      'le panneau lourd n’est pas créé avant une interaction utilisateur',
      await page.locator('.ao3h-panel-backdrop').count() === 0,
    );
    check(
      'le bundle du panneau n’est pas téléchargé avant une interaction utilisateur',
      !bundles.requests.includes('ao3-helper.panel.js'),
    );

    await toggle.click({ force: true }).catch(() => {});
    const isOpen = await roots.first().evaluate((el) => el.classList.contains('open')).catch(() => false);
    check('cliquer sur le bouton ouvre le menu (classe "open")', isOpen);

    const settingsButton = roots.first().locator('.ao3h-icon-btn[data-module-name]').first();
    await settingsButton.waitFor({ state: 'attached', timeout: 10000 }).catch(() => {});
    // The fixture keeps AO3's dropdown visually hidden; dispatch through the
    // real DOM element so the menu's delegated click handler still runs.
    await settingsButton.evaluate((button) => button.click()).catch(() => {});
    await page.locator('.ao3h-panel-backdrop').waitFor({ state: 'attached', timeout: 5000 }).catch(() => {});
    check(
      'le premier clic sur un réglage charge et affiche le panneau',
      await page.locator('.ao3h-panel-backdrop').count() === 1,
    );
    check(
      'le premier clic télécharge le bundle physique du panneau',
      bundles.requests.includes('ao3-helper.panel.js'),
    );

    await page.waitForFunction(() => !!window.AO3H?.moduleLoader, null, { timeout: 10000 }).catch(() => {});
    const routeModules = await page.evaluate(
      () => window.AO3H?.moduleImplementations?.routeModules || [],
    ).catch(() => []);
    check(
      'la route bookmarks charge seulement ses quatre modules activés par défaut',
      ['hideByTags', 'skipWorks', 'seriesHelper', 'visualPreferences'].every((name) => routeModules.includes(name)) && routeModules.length === 4,
    );
    const filterWasDeferred = await page.evaluate(
      () => window.AO3H?.moduleImplementations?.isLoaded?.('filterManager') === false,
    ).catch(() => false);
    check('un module désactivé compatible reste différé au démarrage', filterWasDeferred);

    await page.evaluate(() => window.AO3H?.modules?.setEnabled?.('filterManager', true)).catch(() => {});
    const filterLoadedOnDemand = await page.evaluate(
      () => window.AO3H?.moduleImplementations?.isLoaded?.('filterManager') === true,
    ).catch(() => false);
    check('activer ce module charge son implémentation à la demande', filterLoadedOnDemand);
  }

  check('aucune exception JS non interceptée pendant le chargement', consoleErrors.length === 0);
  if (consoleErrors.length) {
    console.error('Erreurs JS détectées :\n' + consoleErrors.join('\n'));
  }

  await browser.close();
  await bundles.close();

  if (failures > 0) {
    console.error(`\n${failures} vérification(s) échouée(s).`);
    process.exit(1);
  }
  console.log('\nTout est OK — le script démarre correctement sur une vraie page.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
