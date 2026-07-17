import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';
import { fileURLToPath, URL } from 'node:url';

const r = (p) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
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
      userscript: {
        name: 'AO3 Helper',
        namespace: 'http://tampermonkey.net/',
        version: '1.1.0',
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
        ],
        connect: ['127.0.0.1', 'localhost'],
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
  },
});
