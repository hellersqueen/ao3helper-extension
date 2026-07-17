/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper — Page Controls Coordinator

    Module ID: pageControls
    Display Name: Page Controls
    Tab: Browse

    Purpose

    Adds configurable navigation and result-density controls to AO3 listing
    pages while keeping each control group independently maintainable.

    Submodules

    - coreNavigation.js: page input and URL navigation
    - worksPerPage.js: works-per-page selector
    - enhancedNavigation.js: previous/next jumps and first/last controls

    Notes

    - The coordinator runs only on supported work, bookmark, and history lists.
    - Submodules receive the shared module configuration accessor.
    - Cleanup runs in reverse setup order.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { css } from '../../../../lib/utils/index.js';
import { makeCfg } from '../../../../lib/storage/module-settings.js';
import styles from './pageControls.css?inline';

import { CoreNavigation } from './coreNavigation.js';
import { WorksPerPage } from './worksPerPage.js';
import { EnhancedNavigation } from './enhancedNavigation.js';
import { BackToTop } from './backToTop.js';


/* ═══════════════════════════════════════════════════════════════════════════
   MODULE SETUP
═══════════════════════════════════════════════════════════════════════════ */

css(styles, 'ao3h-pageControls');

const MOD  = 'pageControls';
const LOG  = `[AO3H][${MOD}]`;

const DEFAULTS = {
  showPlusMinus10Buttons : true,
  worksPerPageEnabled    : true,
  worksPerPage           : 20,
  infiniteScrollEnabled  : false,
  showBackToTopButton    : true,
};

const cfg = makeCfg(MOD, DEFAULTS);


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURES
═══════════════════════════════════════════════════════════════════════════ */

function isListingPage () {
  return (
    /^\/works$/.test(location.pathname)                                ||
    /^\/tags\/[^/]+\/works/.test(location.pathname)                    ||
    /^\/users\/[^/]+\/(bookmarks|works|history)/.test(location.pathname) ||
    /^\/bookmarks$/.test(location.pathname)                            ||
    /^\/collections\/[^/]+\/works/.test(location.pathname)
  );
}


/* ═══════════════════════════════════════════════════════════════════════════
   MODULE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

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
  const backToTop = cfg('showBackToTopButton')
                     ? new BackToTop(diOpts)
                     : null;

  coreNav.setup();
  wpp?.setup();
  enhanced.setup();
  backToTop?.setup();

  return function cleanup () {
    backToTop?.teardown();
    enhanced.teardown();
    wpp?.teardown();
    coreNav.teardown();
  };
}
