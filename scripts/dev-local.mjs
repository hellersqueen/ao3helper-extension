// Dev tout-en-un : sert dist/ en local, construit le userscript découpé (bootstrap
// + modules + panel) pointé vers ce serveur, et reconstruit automatiquement à chaque
// sauvegarde dans src/ ou lib/.
//
// Usage : npm run dev:local
//   1) Laisse cette commande tourner.
//   2) Ouvre UNE FOIS http://127.0.0.1:5195/ao3-helper.user.js pour installer le
//      bootstrap dans Tampermonkey.
//   3) À chaque modif : sauvegarde ton fichier, attends le "✅ Prêt", puis F5 sur AO3.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { watch } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const host = '127.0.0.1';
const port = 5195;
const ASSET_BASE = `http://${host}:${port}`;
const env = { ...process.env, AO3H_ASSET_BASE: ASSET_BASE };

/* ── Serveur statique pour dist/ (jamais mis en cache) ───────────────────── */
const MIME = { '.js': 'application/javascript; charset=utf-8' };
const server = createServer(async (req, res) => {
  const file = path.join(dist, path.normalize(decodeURIComponent(req.url.split('?')[0])));
  if (!file.startsWith(dist)) { res.writeHead(403); res.end(); return; }
  try {
    const body = await readFile(file);
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(file)] || 'application/octet-stream',
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*',
    });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
});
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    // Un serveur (ce script ou `npm run serve:dist`) écoute déjà sur ce port :
    // il sert le même dist/, donc on continue avec build + surveillance seulement.
    console.log(`\n📡 Un serveur écoute déjà sur ${ASSET_BASE}/ — je le réutilise.`);
    console.log(`📥 À installer 1x : ${ASSET_BASE}/ao3-helper.user.js\n`);
  } else {
    throw err;
  }
});
server.listen(port, host, () => {
  console.log(`\n📡 Serveur local  : ${ASSET_BASE}/`);
  console.log(`📥 À installer 1x : ${ASSET_BASE}/ao3-helper.user.js\n`);
});

/* ── Build (vite + découpage), non réentrant ─────────────────────────────── */
let building = false;
let queued = false;
function build(reason) {
  if (building) { queued = true; return; }
  building = true;
  const start = Date.now();
  console.log(`🔨 Build (${reason})…`);
  const vite = spawnSync('npx', ['vite', 'build'], { stdio: 'inherit', env, shell: true, cwd: root });
  if (vite.status === 0) {
    spawnSync('node', ['scripts/split-userscript.mjs'], { stdio: 'inherit', env, shell: true, cwd: root });
    console.log(`✅ Prêt en ${((Date.now() - start) / 1000).toFixed(1)}s — rafraîchis l'onglet AO3 (F5).\n`);
  } else {
    console.log('❌ Build en échec — corrige l\'erreur ci-dessus, la sauvegarde suivante relancera.\n');
  }
  building = false;
  if (queued) { queued = false; build('changements en attente'); }
}

/* ── Surveillance de src/ et lib/ ────────────────────────────────────────── */
let debounce;
function onChange(file) {
  const f = file || '';
  if (!/\.(js|mjs|css)$/.test(f) || /\.test\.js$/.test(f)) return; // ignore tests + non-source
  clearTimeout(debounce);
  debounce = setTimeout(() => build(`modif ${f}`), 300);
}
for (const dir of ['src', 'lib']) {
  watch(path.join(root, dir), { recursive: true }, (_event, file) => onChange(file));
}

console.log('👀 Surveillance de src/ et lib/ activée (Ctrl+C pour arrêter).');
build('initial');
