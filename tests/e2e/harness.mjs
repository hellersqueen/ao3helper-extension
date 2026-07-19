// tests/e2e/harness.mjs — code commun aux 3 scénarios e2e (menu-boot,
// route-loading, boot-performance) : résolution des chemins du repo,
// lecture du userscript buildé + du shim GM, démarrage groupé du serveur de
// bundles et de Chromium, et un petit compteur de vérifications ✓/✗.
// Les scénarios eux-mêmes restent 3 fichiers séparés — seule la mise en
// place/le nettoyage répétés sont regroupés ici.

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { chromium } from 'playwright';
import { startBundleServer } from './bundle-server.mjs';

export const MODULE_LONG_TASK_BUDGET_MS = 200;

/** Résout dirname/root/dist/gm-shim depuis le `import.meta.url` d'un scénario. */
export function resolveE2EPaths(importMetaUrl) {
  const dirname = path.dirname(fileURLToPath(importMetaUrl));
  const root = path.resolve(dirname, '../..');
  return {
    dirname,
    root,
    distScript: path.join(root, 'dist/ao3-helper.user.js'),
    gmShimPath: path.join(dirname, 'gm-shim.js'),
  };
}

/** Lit le userscript buildé et le shim GM en texte (pour un addInitScript par contenu). */
export function readUserscriptAndShim({ distScript, gmShimPath }) {
  return {
    userscript: readFileSync(distScript, 'utf8'),
    gmShim: readFileSync(gmShimPath, 'utf8'),
  };
}

/** Démarre ensemble le serveur de bundles dist/ et un navigateur Chromium. */
export async function launchWithBundles() {
  const bundles = await startBundleServer();
  const browser = await chromium.launch();
  return {
    bundles,
    browser,
    close: async () => {
      await browser.close();
      await bundles.close();
    },
  };
}

/** Petit compteur de vérifications ✓/✗ partagé par les scénarios. */
export function createChecker() {
  let failures = 0;
  return {
    check(label, condition) {
      if (condition) {
        console.log(`  ✓ ${label}`);
      } else {
        console.error(`  ✗ ${label}`);
        failures++;
      }
    },
    get failures() {
      return failures;
    },
  };
}
