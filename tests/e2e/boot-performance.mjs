// Mesure le coût de démarrage du vrai userscript sur une page AO3 locale.
// Ce benchmark est informatif : il ne fixe volontairement aucun seuil CI.

import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { readFileSync } from 'node:fs';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dirname, '../..');
const userscript = readFileSync(path.join(root, 'dist/ao3-helper.user.js'), 'utf8');
const gmShim = readFileSync(path.join(dirname, 'gm-shim.js'), 'utf8');
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
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.addInitScript({ content: `${gmShim}\n${instrumentation}\n${userscript}\nwindow.__AO3H_PERF__.scriptEnd = performance.now();` });

  await page.goto(pathToFileURL(mockPage).href, { waitUntil: 'load' });
  await page.locator('li.ao3h-root').first().waitFor({ state: 'attached', timeout: 10000 });
  await page.waitForTimeout(500);

  const result = await page.evaluate(() => {
    const p = window.__AO3H_PERF__;
    return {
      synchronousScriptMs: p.scriptEnd - p.start,
      domContentLoadedMs: p.domContentLoaded,
      loadMs: p.load,
      menuReadyMs: performance.getEntriesByType('navigation')[0]?.domContentLoadedEventEnd ?? null,
      longTasks: p.longTasks,
    };
  });

  console.log(JSON.stringify(result, null, 2));
  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
