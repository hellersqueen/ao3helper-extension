/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Main Navigation Module Coordinator
    Module ID: mainNavigation
    Display Name: Main Navigation
    Tab: Navigate & Interact

    Submodules (imported directly as ES modules):
        ./addNavLinks.js      -- nav links injection (Bookmarks/MFL/History)
        ./quickLinks.js       -- custom quick links
        ./menuActivation.js   -- hover vs click menu mode

    Config keys:
        addNavLinks        -- inject Bookmarks/MFL/History links in header
        quickLinksEnabled  -- custom quick links (URL + label)
        menuActivation     -- 'hover' | 'click'

═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { css } from '../../../../lib/utils/index.js';
import { Settings } from '../../../../lib/utils/config.js';
import { detectUser } from '../../../../lib/utils/user-detector.js';
import styles from './mainNavigation.css?inline';

import { AddNavLinks } from './addNavLinks.js';
import { MenuActivation } from './menuActivation.js';
import { QuickLinks } from './quickLinks.js';

css(styles, 'ao3h-mainNavigation');

const MOD = 'mainNavigation';

// ── Defaults (required for audit tooling) ──────────────────────────
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

// ── Shared helpers ────────────────────────────────────────────────────────

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

// ── Registration ──────────────────────────────────────────────────────────

register(MOD, { title: 'Main Navigation', enabledByDefault: false }, async function init() {
  const NS = 'ao3h';
  let cfg = await Settings.define(MOD, DEFAULTS);
  const migrated = QuickLinks.migrateLegacySettings(cfg);
  if (migrated) cfg = await Settings.set(MOD, migrated);

  if (isKudosPage()) return () => {};

  const headerUL = findPrimaryHeaderUL();
  const user = detectUser() || '';

  // ── Submodules ────────────────────────────────────────────────────────

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

  // ── Cleanup ───────────────────────────────────────────────────────────

  return () => {
    addNavLinksInst.reset();
    quickLinksInst.reset();
    menuActivationInst.reset();
  };
});
