import { spawnSync } from 'node:child_process';

const ASSET_BASE = process.env.AO3H_ASSET_BASE || 'http://127.0.0.1:5195';
const env = { ...process.env, AO3H_ASSET_BASE: ASSET_BASE };

for (const args of [['npx', 'vite', 'build'], ['node', 'scripts/split-userscript.mjs']]) {
  const [cmd, ...rest] = args;
  const result = spawnSync(cmd, rest, { stdio: 'inherit', env, shell: true });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log(`\nBuilt against asset base: ${ASSET_BASE}`);
console.log('Reload the AO3 tab to pick up the new modules/panel bundles.');
