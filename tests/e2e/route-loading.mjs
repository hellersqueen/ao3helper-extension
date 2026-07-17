// Route matrix for the selective AO3 Helper module loader.
// Each fixture enables both compatible and incompatible modules, then checks
// that only the compatible implementations enter the startup graph.

import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { readFileSync } from 'node:fs';
import { startBundleServer } from './bundle-server.mjs';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dirname, '../..');
const userscript = readFileSync(path.join(root, 'dist/ao3-helper.user.js'), 'utf8');
const gmShim = readFileSync(path.join(dirname, 'gm-shim.js'), 'utf8');
const MODULE_LONG_TASK_BUDGET_MS = 200;

const defaultOff = {
  'mod:hideByTags:enabled': false,
  'mod:skipWorks:enabled': false,
  'mod:seriesHelper:enabled': false,
  'mod:visualPreferences:enabled': false,
};

const scenarios = [
  {
    name: 'work',
    fixture: 'work-complete.html',
    enabled: ['chapterNavigation', 'readingTracker', 'textToSpeech', 'similarFics', 'ficActions'],
    incompatible: ['pageControls'],
  },
  {
    name: 'listing',
    fixture: 'listings.html',
    enabled: ['filterManager', 'searchEnhancer', 'ficPeek', 'tagsDisplay'],
    incompatible: ['textToSpeech'],
  },
  {
    name: 'bookmarks',
    fixture: 'bookmarks.html',
    enabled: ['bookmarkVault', 'laterShelf', 'filterManager'],
    incompatible: ['similarFics'],
  },
  {
    name: 'dashboard',
    fixture: 'dashboard.html',
    enabled: ['activityPanel', 'readingTimeline', 'userRelationships'],
    incompatible: ['skipWorks'],
  },
  {
    name: 'home',
    fixture: 'home.html',
    enabled: ['tropeGames', 'surpriseMe', 'mainNavigation'],
    incompatible: ['tagsDisplay'],
  },
];

let failures = 0;
function check(scenario, label, condition) {
  if (condition) console.log(`  ✓ [${scenario}] ${label}`);
  else {
    console.error(`  ✗ [${scenario}] ${label}`);
    failures++;
  }
}

function subtractBaseline(errors, baseline) {
  const remaining = new Map();
  for (const error of baseline) remaining.set(error, (remaining.get(error) || 0) + 1);
  return errors.filter((error) => {
    const count = remaining.get(error) || 0;
    if (!count) return true;
    remaining.set(error, count - 1);
    return false;
  });
}

async function collectBaselineErrors(browser, fixture) {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(String(error)));
  await page.goto(pathToFileURL(path.join(root, 'ao3-mock', fixture)).href, { waitUntil: 'load' });
  await page.waitForTimeout(100);
  await page.close();
  return errors;
}

async function runScenario(browser, scenario, baselineErrors, assetBase) {
  const page = await browser.newPage();
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(String(error)));

  const flags = { ...defaultOff };
  for (const name of [...scenario.enabled, ...scenario.incompatible]) {
    flags[`mod:${name}:enabled`] = true;
  }

  const instrumentation = `
    window.__AO3H_ROUTE_PERF__ = { longTasks: [] };
    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          window.__AO3H_ROUTE_PERF__.longTasks.push({ start: entry.startTime, duration: entry.duration });
        }
      }).observe({ type: 'longtask', buffered: true });
    } catch {}
  `;

  await page.addInitScript({
    content: `${gmShim}\nwindow.__AO3H_ASSET_BASE__ = ${JSON.stringify(assetBase)};\nGM_setValue('ao3h:flags', ${JSON.stringify(flags)});\n${instrumentation}\n${userscript}`,
  });
  await page.goto(pathToFileURL(path.join(root, 'ao3-mock', scenario.fixture)).href, { waitUntil: 'load' });
  await page.waitForFunction(
    () => performance.getEntriesByName('ao3h:modules:ready', 'mark').length > 0,
    null,
    { timeout: 20000 },
  );
  await page.waitForTimeout(100);

  const result = await page.evaluate(({ enabled, incompatible }) => {
    const api = window.AO3H?.moduleImplementations;
    const mark = (name) => performance.getEntriesByName(name, 'mark')[0]?.startTime ?? null;
    const modulesStart = mark('ao3h:modules:start');
    const longTasks = window.__AO3H_ROUTE_PERF__.longTasks.filter(
      (entry) => modulesStart != null && entry.start + entry.duration >= modulesStart,
    );
    return {
      routeModules: api?.routeModules || [],
      expectedLoaded: enabled.every((name) => api?.isLoaded?.(name) === true),
      incompatibleDeferred: incompatible.every((name) => api?.isLoaded?.(name) === false),
      menuPresent: document.querySelectorAll('li.ao3h-root').length === 1,
      modulesStart,
      modulesReady: mark('ao3h:modules:ready'),
      maxModuleLongTask: Math.max(0, ...longTasks.map((entry) => entry.duration)),
      moduleDurations: performance.getEntriesByType('measure')
        .filter((entry) => entry.name.startsWith('ao3h:module:'))
        .map((entry) => ({ name: entry.name.slice('ao3h:module:'.length), duration: entry.duration })),
    };
  }, { enabled: scenario.enabled, incompatible: scenario.incompatible });

  const exactRouteSet =
    result.routeModules.length === scenario.enabled.length &&
    scenario.enabled.every((name) => result.routeModules.includes(name));

  check(scenario.name, 'charge exactement les modules compatibles activés', exactRouteSet);
  check(scenario.name, 'toutes les implémentations attendues sont évaluées', result.expectedLoaded);
  check(scenario.name, 'les modules incompatibles restent différés', result.incompatibleDeferred);
  check(scenario.name, 'le menu reste disponible', result.menuPresent);
  check(scenario.name, `longue tâche modules ≤ ${MODULE_LONG_TASK_BUDGET_MS} ms (${result.maxModuleLongTask} ms)`, result.maxModuleLongTask <= MODULE_LONG_TASK_BUDGET_MS);
  const unexpectedErrors = subtractBaseline(pageErrors, baselineErrors);
  check(scenario.name, 'aucune nouvelle exception JavaScript non interceptée', unexpectedErrors.length === 0);

  const durations = result.moduleDurations.map(({ name, duration }) => `${name}:${Math.round(duration)}ms`).join(', ');
  console.log(`    modulesReady=${Math.round(result.modulesReady)}ms, moduleLongTask=${Math.round(result.maxModuleLongTask)}ms`);
  console.log(`    ${durations}`);
  if (unexpectedErrors.length) console.error(unexpectedErrors.join('\n'));
  await page.close();
}

async function main() {
  const bundles = await startBundleServer();
  const browser = await chromium.launch();
  try {
    for (const scenario of scenarios) {
      const baselineErrors = await collectBaselineErrors(browser, scenario.fixture);
      await runScenario(browser, scenario, baselineErrors, bundles.baseURL);
    }
  } finally {
    await browser.close();
    await bundles.close();
  }

  if (failures) {
    console.error(`\n${failures} vérification(s) de route échouée(s).`);
    process.exit(1);
  }
  console.log('\nMatrice de routes AO3 validée.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
