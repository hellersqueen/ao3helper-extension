/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper — Bookmark Vault Coordinator

    Module ID: bookmarkVault
    Display Name: Bookmark Vault
    Tab: Library

    Purpose

    Coordinates bookmark status, notes, organization, navigation, maintenance,
    and sorting tools across AO3 bookmark pages.

    Submodules

    - StatusIndicators and ReadingStatusTracking: bookmark-state presentation
    - RichTextNotes and OrganizationTools: notes, categories, bulk actions, pins
    - Self-registering navigation, maintenance, note, and sorting helpers

    Notes

    - Class-based components receive the shared configuration accessor.
    - A component boot failure is isolated and does not stop remaining features.
    - Cleanup stops every successfully initialized class instance.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { css } from '../../../../lib/utils/index.js';
import styles from './bookmarkVault.css?inline';

import { StatusIndicators } from './bookmarkStatus/statusIndicators.js';
import { RichTextNotes } from './richTextNotes.js';
import { OrganizationTools } from './organizationTools.js';
import { ReadingStatusTracking } from './bookmarkStatus/readingStatusTracking.js';
import './bookmarkNavigation.js';
import './bookmarkMaintenance.js';
import './noteManagement.js';
import './noteDisplay.js';
import './sortingAndFiltering.js';
import { makeCfg } from '../../../../lib/storage/module-settings.js';


/* ═══════════════════════════════════════════════════════════════════════════
   MODULE SETUP
═══════════════════════════════════════════════════════════════════════════ */

css(styles, 'ao3h-bookmarkVault');

const MOD  = 'bookmarkVault';

const DEFAULTS = {
  showPublicPrivateBadge:       true,
  showNoteIcon:                 true,
  showLastReadDate:             false,
  bookmarkStatusFilterEnabled:  false,
  bookmarkStatusFilterDefault:  'all',
  showStatusFilterCount:        false,
  inlineNoteEditing:            true,
  autoFillBookmarkForm:         true,
  createCategories:             true,
  showCategoryLabels:           true,
  filterByCategory:             true,
  hideDeletedWorks:             false,
  pinBookmarks:                 false,
  bulkSelection:                true,
  privateByDefault:             false,
  assignToCategories:           true,
  defaultSort:                  'date',
  autoTagFandom:                false,
  autoTagRating:                false,
  showAnalyticsDashboard:       false,
  showBackButton:               true,
  showViewBookmarkLink:         true,
  showCompletionBadge:          false,
  showProgressRing:             false,
};

const cfg = makeCfg(MOD, DEFAULTS);


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURES
═══════════════════════════════════════════════════════════════════════════ */

// Class components are booted independently during module initialization.


/* ═══════════════════════════════════════════════════════════════════════════
   MODULE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(MOD, {
  title:            'Bookmark Vault',
  enabledByDefault: false,
}, async function init () {
  const instances = [];

  function tryBoot (Cls) {
    let inst = null;
    try {
      inst = new Cls(cfg);
      inst.boot();
      return inst;
    } catch (e) {
      try { inst?.stop?.(); } catch (_) {}
      console.error(`[AO3H][${MOD}]`, `Failed to boot ${Cls.name}:`, e);
      return null;
    }
  }

  for (const Cls of [StatusIndicators, RichTextNotes, OrganizationTools, ReadingStatusTracking]) {
    const inst = tryBoot(Cls);
    if (inst) instances.push(inst);
  }

  return () => instances.forEach(i => { try { i.stop(); } catch (_) {} });
});
