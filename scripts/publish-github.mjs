// Publishes the built split userscript bundle (dist/ao3-helper.user.js +
// .modules.js + .panel.js) to the small public distribution repo that
// Tampermonkey installs from and self-updates against. This script never
// touches this repo's own git history — it only pushes to the separate
// target repo's dist/ folder, via a throwaway shallow clone.
//
// Usage:
//   AO3H_ASSET_BASE=https://raw.githubusercontent.com/hellersqueen/ao3helper/main/dist npm run build
//   node scripts/publish-github.mjs          # dry run: clones, copies, commits locally, does NOT push
//   node scripts/publish-github.mjs --push   # also pushes the commit
//
// The dry run intentionally stops before pushing so a first-time (or
// unattended) run can be inspected before anything reaches GitHub.

import { spawnSync } from 'node:child_process';
import { mkdtemp, cp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(root, 'dist');
const loaderPath = path.join(root, 'loader.user.js');

const REPO = process.env.AO3H_PUBLISH_REPO || 'https://github.com/hellersqueen/ao3helper.git';
const BRANCH = process.env.AO3H_PUBLISH_BRANCH || 'main';
const EXPECTED_BASE = (process.env.AO3H_ASSET_BASE
  || 'https://raw.githubusercontent.com/hellersqueen/ao3helper/main/dist').replace(/\/$/, '');
const FILES = ['ao3-helper.user.js', 'ao3-helper.modules.js', 'ao3-helper.panel.js'];

const push = process.argv.includes('--push');

function run(cmd, args, cwd) {
  // No `shell: true`: git is a real executable, and routing an argv array
  // through a shell (esp. cmd.exe on Windows) can re-tokenize an argument
  // like a commit message on its spaces instead of passing it through whole.
  const result = spawnSync(cmd, args, { cwd, stdio: 'inherit' });
  if (result.status !== 0) throw new Error(`${cmd} ${args.join(' ')} failed (exit ${result.status ?? 1})`);
}

async function main() {
  const bootstrapPath = path.join(distDir, 'ao3-helper.user.js');
  const bootstrap = await readFile(bootstrapPath, 'utf8').catch(() => {
    throw new Error('dist/ao3-helper.user.js introuvable — lance "npm run build" avant de publier.');
  });

  // Guard rail: refuse to publish a build that was not produced for this
  // exact target (e.g. a leftover local-dev build pointed at 127.0.0.1).
  const downloadURL = bootstrap.match(/@downloadURL\s+(\S+)/)?.[1];
  const expectedDownloadURL = `${EXPECTED_BASE}/ao3-helper.user.js`;
  if (downloadURL !== expectedDownloadURL) {
    throw new Error(
      `dist/ao3-helper.user.js n'est pas construit pour ${REPO} (${BRANCH}).\n` +
      `  @downloadURL trouvé   : ${downloadURL || '(absent)'}\n` +
      `  @downloadURL attendu  : ${expectedDownloadURL}\n` +
      `Reconstruis d'abord avec :\n  AO3H_ASSET_BASE=${EXPECTED_BASE} npm run build`,
    );
  }
  const version = bootstrap.match(/@version\s+(\S+)/)?.[1] || '0.0.0';

  // The thin loader that Tampermonkey installs from GitHub. We publish it
  // alongside dist/ and rewrite its @version to match the bundle, so bumping
  // the userscript version is enough to break Tampermonkey's @require cache
  // and push the update to everyone who installed via the loader.
  const loaderSource = await readFile(loaderPath, 'utf8').catch(() => {
    throw new Error('loader.user.js introuvable à la racine du dépôt.');
  });
  const loaderPublished = loaderSource.replace(
    /(@version\s+)\S+/,
    `$1${version}`,
  );

  const workdir = await mkdtemp(path.join(tmpdir(), 'ao3helper-publish-'));
  console.log(`Clonage de ${REPO} (${BRANCH}) dans ${workdir}...`);
  try {
    run('git', ['clone', '--depth', '1', '--branch', BRANCH, REPO, workdir]);

    for (const file of FILES) {
      await cp(path.join(distDir, file), path.join(workdir, 'dist', file));
    }
    await writeFile(path.join(workdir, 'loader.user.js'), loaderPublished, 'utf8');

    run('git', ['add', 'dist', 'loader.user.js'], workdir);
    const status = spawnSync('git', ['status', '--porcelain'], { cwd: workdir, encoding: 'utf8' });
    if (!status.stdout.trim()) {
      console.log('Rien à publier : dist/ est déjà identique dans le dépôt cible.');
      await rm(workdir, { recursive: true, force: true });
      return;
    }

    console.log('\nChangements à publier :');
    run('git', ['diff', '--cached', '--stat'], workdir);

    const message = `Publish AO3 Helper userscript ${version}`;
    run('git', ['commit', '-m', message], workdir);

    if (!push) {
      console.log(`\nAperçu prêt dans ${workdir} (commit local créé, PAS envoyé).`);
      console.log(`Relance avec --push pour envoyer vers ${REPO} (${BRANCH}).`);
      return;
    }

    console.log(`\nEnvoi vers ${REPO} (${BRANCH})...`);
    run('git', ['push', 'origin', `HEAD:${BRANCH}`], workdir);
    await rm(workdir, { recursive: true, force: true });
    console.log(`Publié : ${message}`);
  } catch (error) {
    console.error(`\nDossier temporaire conservé pour inspection : ${workdir}`);
    throw error;
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
