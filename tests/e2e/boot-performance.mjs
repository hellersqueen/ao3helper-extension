// Mesure le coût de démarrage du vrai userscript sur une page AO3 locale.
// Le coût global dépend du fixture et de la machine. Seules les longues tâches
// créées après le début du chargement des modules ont un budget de régression.

import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { resolveE2EPaths, readUserscriptAndShim, launchWithBundles, MODULE_LONG_TASK_BUDGET_MS } from './harness.mjs';

const e2ePaths = resolveE2EPaths(import.meta.url);
const { root } = e2ePaths;
const { userscript, gmShim } = readUserscriptAndShim(e2ePaths);
const mockPage = path.join(root, 'ao3-mock/bookmarks.html');

const instrumentation = `
  window.__AO3H_PERF__ = { start: performance.now(), longTasks: [] };
  try {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        window.__AO3H_PERF__.longTasks.push({ start: entry.startTime, duration: entry.duration });
      }
    }).observe({ type: 'longtask', buffered: true });
  } catch {}
  document.addEventListener('DOMContentLoaded', () => {
    window.__AO3H_PERF__.domContentLoaded = performance.now();
  }, { once: true });
  window.addEventListener('load', () => {
    window.__AO3H_PERF__.load = performance.now();
  }, { once: true });
`;

async function main() {
  const { bundles, browser, close } = await launchWithBundles();
  const page = await browser.newPage();
  await page.addInitScript({ content: `${gmShim}\nwindow.__AO3H_ASSET_BASE__ = ${JSON.stringify(bundles.baseURL)};\n${instrumentation}\n${userscript}\nwindow.__AO3H_PERF__.scriptEnd = performance.now();` });

  await page.goto(pathToFileURL(mockPage).href, { waitUntil: 'load' });
  await page.locator('li.ao3h-root').first().waitFor({ state: 'attached', timeout: 10000 });
  await page.waitForFunction(
    () => performance.getEntriesByName('ao3h:modules:ready', 'mark').length > 0,
    null,
    { timeout: 20000 },
  );
  await page.waitForTimeout(250);

  const result = await page.evaluate(() => {
    const p = window.__AO3H_PERF__;
    const mark = (name) => performance.getEntriesByName(name, 'mark')[0]?.startTime ?? null;
    const modulesStartMs = mark('ao3h:modules:start');
    const moduleLongTasks = p.longTasks.filter(
      (entry) => modulesStartMs != null && entry.start + entry.duration >= modulesStartMs,
    );
    return {
      synchronousScriptMs: p.scriptEnd - p.start,
      domContentLoadedMs: p.domContentLoaded,
      loadMs: p.load,
      menuReadyMs: performance.getEntriesByType('navigation')[0]?.domContentLoadedEventEnd ?? null,
      modulesStartMs,
      modulesRegisteredMs: mark('ao3h:modules:registered'),
      modulesReadyMs: mark('ao3h:modules:ready'),
      maxLongTaskMs: Math.max(0, ...p.longTasks.map((entry) => entry.duration)),
      maxModuleLongTaskMs: Math.max(0, ...moduleLongTasks.map((entry) => entry.duration)),
      longTasks: p.longTasks,
    };
  });

  console.log(JSON.stringify(result, null, 2));
  await close();

  if (result.maxModuleLongTaskMs > MODULE_LONG_TASK_BUDGET_MS) {
    throw new Error(
      `Module long-task budget exceeded: ${result.maxModuleLongTaskMs}ms > ${MODULE_LONG_TASK_BUDGET_MS}ms`,
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
