/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper — Bookmark Vault Coordinator
    Module ID:    bookmarkVault
    Display Name: Bookmark Vault
    Tab:          Library

    Components (class instantiation pattern, imported directly as ES modules):
        StatusIndicators      -- badges, status filter
        RichTextNotes         -- auto-fill, inline editing
        OrganizationTools     -- categories, bulk, pin
        ReadingStatusTracking -- last read, note collapse

    Core children (self-registering, imported for side effects):
        bookmarkNavigation, bookmarkMaintenance, noteManagement,
        noteDisplay, sortingAndFiltering

    Storage keys:
        ao3h:bookmarkVault:data        -- { [workId]: { pub, notes } }
        ao3h:bookmarkVault:inlineNotes -- { [workId]: string }
        ao3h:bookmarkVault:lastRead    -- { [workId]: timestamp }
        ao3h:bookmarkVault:lastExport  -- timestamp (ms)
        ao3h:bookmarkVault:categories  -- [{ id, name, color, workIds[] }]
        ao3h:bookmarkVault:pinned      -- [workId, ...]

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

function cfg (key) {
  try {
    const s = JSON.parse(localStorage.getItem(`ao3h:mod:${MOD}:settings`) || '{}');
    return (key in s) ? s[key] : DEFAULTS[key];
  } catch (_) { return DEFAULTS[key]; }
}

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
