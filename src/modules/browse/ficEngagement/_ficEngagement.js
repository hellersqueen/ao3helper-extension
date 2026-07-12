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
import { css } from '../../../../lib/utils/index.js';
import styles from './ficEngagement.css?inline';

import { EngagementMetrics } from './engagementMetrics.js';
import { HiddenGems } from './hiddenGems.js';

css(styles, 'ao3h-ficEngagement');

const MOD  = 'ficEngagement';

const DEFAULTS = {
  colorCodeMetrics: false,
};

function loadSettings() {
  try { const v = localStorage.getItem(`ao3h:mod:${MOD}:settings`); return v ? JSON.parse(v) : {}; }
  catch { return {}; }
}

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
  hiddenGems.init();

  /* ── Observer ──────────────────────────────────────────────────────── */
  metrics.scan();
  metrics.processWorkPage();
  const mo = new MutationObserver(() => metrics.scan());
  mo.observe(document.querySelector('#main') || document.body, {
    childList: true, subtree: true,
  });

  /* ── Cleanup ──────────────────────────────────────────────────────── */
  return () => {
    mo.disconnect();
    metrics.cleanup();
    hiddenGems.cleanup();
  };
});
