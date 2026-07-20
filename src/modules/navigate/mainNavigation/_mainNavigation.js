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
import { Settings, Flags } from '../../../../lib/utils/config.js';
import { detectUser } from '../../../../lib/utils/user-detector.js';
import { isListingPage } from '../../../../lib/ao3/parsers.js';
import styles from './mainNavigation.css?inline';

import { AddNavLinks } from './addNavLinks.js';
import { MenuActivation } from './menuActivation.js';
import { QuickLinks } from './quickLinks.js';
import { BackToSearch } from './backToSearch.js';
import { Breadcrumbs } from './breadcrumbs.js';

/* ═══════════════════════════════════════════════════════════════════════════
   MODULE-SPECIFIC HELPERS
═══════════════════════════════════════════════════════════════════════════ */

export function isSearchOrigin (url) {
  if (!url) return false;
  try {
    const parsed = new URL(url, 'https://archiveofourown.org');
    return isListingPage(parsed.pathname);
  } catch {
    return false;
  }
}

function decodeBreadcrumbSegment (segment) {
  try {
    return decodeURIComponent(segment)
      .replace(/\*s\*/g, '/')
      .replace(/\*a\*/g, '&')
      .replace(/\*d\*/g, '.');
  } catch {
    return segment;
  }
}

export function buildBreadcrumbs (pathname) {
  if (!pathname || pathname === '/') return [];
  const parts = pathname.replace(/\/+$/, '').split('/').filter(Boolean);
  if (parts.length < 2) return [];
  const crumbs = [];
  const push = (label, href) => crumbs.push({ label, href });

  switch (parts[0]) {
    case 'works':
      push('Works', '/works');
      if (/^\d+$/.test(parts[1])) {
        push(`Work ${parts[1]}`, `/works/${parts[1]}`);
        if (parts[2] === 'chapters' && /^\d+$/.test(parts[3] || '')) push('Chapter', null);
      } else if (parts[1] === 'search') {
        push('Search', null);
      }
      break;
    case 'tags':
      push('Tags', '/tags');
      push(decodeBreadcrumbSegment(parts[1]), `/tags/${parts[1]}`);
      if (parts[2] === 'works') push('Works', null);
      break;
    case 'users':
      push('Users', null);
      push(decodeBreadcrumbSegment(parts[1]), `/users/${parts[1]}`);
      if (parts[2]) push(parts[2][0].toUpperCase() + parts[2].slice(1), null);
      break;
    case 'series':
      push('Series', null);
      if (/^\d+$/.test(parts[1])) push(`Series ${parts[1]}`, null);
      break;
    case 'collections':
      push('Collections', '/collections');
      push(decodeBreadcrumbSegment(parts[1]), `/collections/${parts[1]}`);
      if (parts[2] === 'works') push('Works', null);
      break;
    default:
      return [];
  }

  if (crumbs.length) {
    crumbs[crumbs.length - 1] = { ...crumbs[crumbs.length - 1], href: null };
  }
  return crumbs;
}

/* ═══════════════════════════════════════════════════════════════════════════
   MODULE SETUP
═══════════════════════════════════════════════════════════════════════════ */

css(styles, 'ao3h-mainNavigation');

const MOD = 'mainNavigation';

const DEFAULTS = {
  addNavLinks:        true,
  quickLinksEnabled:  false,
  quickLinksDropdown: false,
  menuActivation:     'hover',
  backToSearch:       true,
  breadcrumbs:        false,
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

  // History link targets the reading dashboard when that module is enabled
  const dashboardOn = !!Flags.get('mod:readingDashboard:enabled', false);
  const addNavLinksInst = new AddNavLinks(NS, { historyToDashboard: dashboardOn });
  const quickLinksInst = new QuickLinks(NS, cfg);
  const backToSearchInst = new BackToSearch(NS, { isSearchOrigin });
  const breadcrumbsInst = new Breadcrumbs(NS, { buildBreadcrumbs });

  if (headerUL) {
    if (cfg.addNavLinks) {
      addNavLinksInst.inject(headerUL, user);
    }
    if (cfg.quickLinksEnabled) {
      quickLinksInst.inject(headerUL);
    }
  }

  // Applied after injection so the quick-links dropdown (if any) is included
  // in the click-mode and arrow-key handling.
  const menuActivationInst = new MenuActivation(NS);
  menuActivationInst.apply(cfg.menuActivation ?? 'hover');

  if (cfg.backToSearch !== false) backToSearchInst.apply();
  if (cfg.breadcrumbs) breadcrumbsInst.inject();

  return () => {
    addNavLinksInst.reset();
    quickLinksInst.reset();
    menuActivationInst.reset();
    backToSearchInst.reset();
    breadcrumbsInst.reset();
  };
});
