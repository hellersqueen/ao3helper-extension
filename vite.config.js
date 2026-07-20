import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';
import { fileURLToPath, URL } from 'node:url';

const r = (p) => fileURLToPath(new URL(p, import.meta.url));
const assetBase = String(process.env.AO3H_ASSET_BASE || '').replace(/\/$/, '');
const assetHost = (() => { try { return assetBase ? new URL(assetBase).hostname : null; } catch { return null; } })();

export default defineConfig({
  define: {
    __AO3H_BUILD_ASSET_BASE__: JSON.stringify(assetBase),
  },
  resolve: {
    alias: {
      '@core': r('./src/core'),
      '@modules': r('./src/modules'),
      // @lib, @ui and @styles point at the root lib/ directory, not src/lib/:
      // the CSS/JS living source stayed at its pre-migration location by design
      // (see CLAUDE.md), src/lib/ only holds the still-empty target subfolders.
      '@lib': r('./lib'),
      '@ui': r('./lib/ui'),
      '@styles': r('./lib/styles'),
    },
  },
  plugins: [
    monkey({
      entry: 'src/main.js',
      build: {
        // Dynamic imports are the boot-performance boundary. Inline the tiny
        // loader so the generated userscript also works when injected directly
        // (and does not depend on a CDN @require at document-start).
        systemjs: 'inline',
      },
      userscript: {
        name: 'AO3 Helper',
        namespace: 'http://tampermonkey.net/',
        version: '1.2.0',
        description: 'Enhanced AO3 experience with modern UI and features',
        author: 'You',
        match: ['https://archiveofourown.org/*'],
        icon: 'https://www.google.com/s2/favicons?sz=64&domain=archiveofourown.org',
        grant: [
          'GM_xmlhttpRequest',
          'GM_addStyle',
          'GM_getValue',
          'GM_setValue',
          'GM_deleteValue',
          'GM_info',
        ],
        connect: ['127.0.0.1', 'localhost', ...(assetHost ? [assetHost] : [])],
        'run-at': 'document-start',
        noframes: true,
      },
    }),
  ],
  build: {
    target: 'es2015',
    minify: 'oxc',
    emptyOutDir: false,
  },
  test: {
    environment: 'happy-dom',
    include: ['lib/**/*.test.js', 'src/**/*.test.js'],
    setupFiles: [r('./tests/setup.js')],
    // DOM-heavy integration tests contend for the same CPU when Vitest uses
    // every available core, which caused unrelated 5-second timeouts.
    maxWorkers: 4,
  },
});
