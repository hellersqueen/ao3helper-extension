/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper — Main Navigation Coordinator

    Module ID: mainNavigation
    Display Name: Main Navigation
    Tab: Navigate & Interact

    Purpose

    Coordinates additional AO3 navigation links, user-defined quick links, and
    configurable hover or click activation for header menus.

    Submodules

    - addNavLinks.js: Bookmarks, Marked for Later, and History links
    - quickLinks.js: configurable custom navigation links
    - menuActivation.js: hover- and click-based menu behavior

    Notes

    - The module remains inactive on the Kudos History page.
    - Legacy quick-link data is migrated into current module settings on startup.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { css } from '../../../../lib/utils/index.js';
import { Settings } from '../../../../lib/utils/config.js';
import { detectUser } from '../../../../lib/utils/user-detector.js';
import styles from './mainNavigation.css?inline';

import { AddNavLinks } from './addNavLinks.js';
import { MenuActivation } from './menuActivation.js';
import { QuickLinks } from './quickLinks.js';

/* ═══════════════════════════════════════════════════════════════════════════
   MODULE SETUP
═══════════════════════════════════════════════════════════════════════════ */

css(styles, 'ao3h-mainNavigation');

const MOD = 'mainNavigation';

const DEFAULTS = {
  addNavLinks:       true,
  quickLinksEnabled: false,
  menuActivation:    'hover',
  quickLink1Label: '', quickLink1Url: '',
  quickLink2Label: '', quickLink2Url: '',
  quickLink3Label: '', quickLink3Url: '',
  quickLink4Label: '', quickLink4Url: '',
  quickLink5Label: '', quickLink5Url: '',
};

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURES
═══════════════════════════════════════════════════════════════════════════ */

function isKudosPage() {
  return /\/users\/[^/]+\/kudos-history(?:\/?|$)/.test(location.pathname);
}

function findPrimaryHeaderUL() {
  const selectors = [
    '#header ul.primary.navigation',
    '#header nav ul.primary.navigation',
    '#header ul.primary',
    '#header nav ul',
    'ul.primary.navigation',
  ];
  for (const s of selectors) {
    const el = document.querySelector(s);
    if (el && el.tagName === 'UL' && !el.closest('#ao3h-helper, #ao3h-menu, .ao3h-root')) return el;
  }
  return null;
}

/* ═══════════════════════════════════════════════════════════════════════════
   MODULE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(MOD, { title: 'Main Navigation', enabledByDefault: false }, async function init() {
  const NS = 'ao3h';
  let cfg = await Settings.define(MOD, DEFAULTS);
  const migrated = QuickLinks.migrateLegacySettings(cfg);
  if (migrated) cfg = await Settings.set(MOD, migrated);

  if (isKudosPage()) return () => {};

  const headerUL = findPrimaryHeaderUL();
  const user = detectUser() || '';

  const menuActivationInst = new MenuActivation(NS);
  menuActivationInst.apply(cfg.menuActivation ?? 'hover');

  const addNavLinksInst = new AddNavLinks(NS);
  const quickLinksInst = new QuickLinks(NS, cfg);

  if (headerUL) {
    if (cfg.addNavLinks) {
      addNavLinksInst.inject(headerUL, user);
    }
    if (cfg.quickLinksEnabled) {
      quickLinksInst.inject(headerUL);
    }
  }

  return () => {
    addNavLinksInst.reset();
    quickLinksInst.reset();
    menuActivationInst.reset();
  };
});
