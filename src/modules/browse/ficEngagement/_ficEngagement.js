/* ═══════════════════════════════════════════════════════════════════════════
   AO3 Helper — Fic Engagement
   Module ID : ficEngagement
   Tab: Browse

   Submodules (imported directly as ES modules):
     1. engagementMetrics → ./engagementMetrics.js
     2. hiddenGems        → ./hiddenGems.js

   What it does:
     On listing pages, adds engagement metric badges to each work blurb:
       • Kudos ratio   — (kudos / hits) × 100  →  "X.X% ❤️/👁️"
       • Kudos density  — (kudos / words) × 1000 →  "X.X /1Kw"
       • Save rate      — (bookmarks / kudos) × 100 → "X.X% 💾"

   Settings:
     colorCodeMetrics — colour-code badges (green/yellow/red by threshold)

═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { css, observe, onReady } from '../../../../lib/utils/index.js';
import { loadModuleSettings } from '../../../../lib/storage/module-settings.js';
import styles from './ficEngagement.css?inline';

import { EngagementMetrics } from './engagementMetrics.js';
import { HiddenGems } from './hiddenGems.js';

css(styles, 'ao3h-ficEngagement');

const MOD  = 'ficEngagement';

const DEFAULTS = {
  colorCodeMetrics: false,
};

function loadSettings() { return loadModuleSettings(MOD); }

/* ── Registration ───────────────────────────────────────────────────── */

register(MOD, {
  title: 'Fic Engagement',
  enabledByDefault: false,
}, async function init() {

  const saved = loadSettings();
  function cfg(key) { return saved[key] ?? DEFAULTS[key]; }

  /* ── Submodules ───────────────────────────────────────────────────── */
  const metrics = new EngagementMetrics({ colorCode: cfg('colorCodeMetrics') });
  const hiddenGems = new HiddenGems();

  // document.querySelector('#main')/document.body peuvent ne pas encore
  // exister quand ce module boote — sans ce report, l'observer plantait
  // (Cannot read properties of null), constaté sur plusieurs modules
  // similaires en test.
  let active = true;
  let mo = null;
  onReady(() => {
    if (!active) return;
    hiddenGems.init();

    metrics.scan();
    metrics.processWorkPage();
    mo = observe(document.querySelector('#main') || document.body, {
      childList: true, subtree: true,
    }, () => metrics.scan());
  });

  /* ── Cleanup ──────────────────────────────────────────────────────── */
  return () => {
    active = false;
    mo?.disconnect();
    metrics.cleanup();
    hiddenGems.cleanup();
  };
});
