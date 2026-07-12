/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Page Controls Module Coordinator
    Module ID: pageControls
    Display Name: Page Controls
    Tab: Browse

    Submodules (imported directly as ES modules):
        ./coreNavigation.js     -- page input + URL nav
        ./worksPerPage.js       -- density selector
        ./enhancedNavigation.js -- ±10 buttons + first/last

    Config keys:
        showPlusMinus10Buttons -- ±10 page buttons (default true)
        worksPerPageEnabled    -- show works-per-page selector (default true)

═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { css } from '../../../../lib/utils/index.js';
import styles from './pageControls.css?inline';

import { CoreNavigation } from './coreNavigation.js';
import { WorksPerPage } from './worksPerPage.js';
import { EnhancedNavigation } from './enhancedNavigation.js';

css(styles, 'ao3h-pageControls');

const MOD  = 'pageControls';
const LOG  = `[AO3H][${MOD}]`;

// ── Defaults ──────────────────────────────────────────────────────────────
const DEFAULTS = {
  showPlusMinus10Buttons : true,
  worksPerPageEnabled    : true,
  worksPerPage           : 20,
  infiniteScrollEnabled  : false,
};

const SK_SETTINGS = `ao3h:mod:${MOD}:settings`;

function lsGet (key) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch { return null; }
}
function cfg (key) {
  const saved = lsGet(SK_SETTINGS) || {};
  return key in saved ? saved[key] : DEFAULTS[key];
}

// ── Route guard ───────────────────────────────────────────────────────────
function isListingPage () {
  return (
    /^\/works$/.test(location.pathname)                                ||
    /^\/tags\/[^/]+\/works/.test(location.pathname)                    ||
    /^\/users\/[^/]+\/(bookmarks|works|history)/.test(location.pathname) ||
    /^\/bookmarks$/.test(location.pathname)                            ||
    /^\/collections\/[^/]+\/works/.test(location.pathname)
  );
}

register(MOD, { title: 'Page Controls', enabledByDefault: false }, init);

async function init() {
  console.log(`${LOG} init`);

  if (!isListingPage()) return () => {};

  const diOpts = { cfg };

  const coreNav  = new CoreNavigation(diOpts);
  const wpp      = cfg('worksPerPageEnabled')
                     ? new WorksPerPage(diOpts)
                     : null;
  const enhanced = new EnhancedNavigation(diOpts);

  coreNav.setup();
  wpp?.setup();
  enhanced.setup();

  return function cleanup () {
    enhanced.teardown();
    wpp?.teardown();
    coreNav.teardown();
  };
}
