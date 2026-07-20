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
import { escapeHtml } from '../../../../lib/utils/dom.js';
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
import './blockedBookmarks.js';
import { makeCfg } from '../../../../lib/storage/module-settings.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';


/* ═══════════════════════════════════════════════════════════════════════════
   MODULE SETUP
═══════════════════════════════════════════════════════════════════════════ */

css(styles, 'ao3h-bookmarkVault');

const MOD  = 'bookmarkVault';
const W    = getGlobalWindow();

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
  showPersonalRating:           true,
  quickNoteOnWorkPage:          true,
  staleReminderMonths:          0,
  hideBlockedUsersBookmarks:    true,
};

const cfg = makeCfg(MOD, DEFAULTS);


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURES
═══════════════════════════════════════════════════════════════════════════ */

const csvCell = value => `"${String(value ?? '').replace(/"/g, '""')}"`;

export function vaultToCSV (data, notes = {}) {
  const rows = [['workId', 'title', 'visibility', 'bookmarkNote', 'personalNote']];
  for (const [wid, bookmark] of Object.entries(data || {})) {
    rows.push([wid, bookmark?.title || '', bookmark?.pub ? 'public' : 'private', bookmark?.notes || '', notes[wid] || '']);
  }
  return rows.map(row => row.map(csvCell).join(',')).join('\r\n');
}

export function vaultToHTML (data, notes = {}) {
  const rows = Object.entries(data || {}).map(([wid, bookmark]) => `<tr><td><a href="https://archiveofourown.org/works/${escapeHtml(wid)}">${escapeHtml(bookmark?.title || `Work ${wid}`)}</a></td><td>${bookmark?.pub ? 'public' : 'private'}</td><td>${escapeHtml(bookmark?.notes || '')}</td><td>${escapeHtml(notes[wid] || '')}</td></tr>`).join('');
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>AO3 Bookmarks export</title><style>body{font-family:Georgia,serif;max-width:900px;margin:30px auto;padding:0 16px}table{border-collapse:collapse;width:100%}td,th{border:1px solid #ccc;padding:6px 10px;text-align:left}th{background:#f5f5f5}</style></head><body><h1>AO3 Bookmarks (${Object.keys(data || {}).length})</h1><p>Exported ${new Date().toISOString().slice(0, 10)} by AO3 Helper</p><table><tr><th>Work</th><th>Visibility</th><th>Bookmark note</th><th>Personal note</th></tr>${rows}</table></body></html>`;
}

export function findStaleBookmarks (data, lastRead, months, now = Date.now()) {
  const count = parseInt(String(months), 10);
  if (!Number.isFinite(count) || count <= 0) return [];
  const cutoff = new Date(now);
  cutoff.setMonth(cutoff.getMonth() - count);
  return Object.keys(data || {}).filter(wid => !Number.isFinite(lastRead?.[wid]) || lastRead[wid] < cutoff.getTime());
}

export function noteQueryMatch (text, query) {
  const haystack = String(text || '').toLowerCase();
  const value = String(query || '').trim().toLowerCase();
  if (!value) return true;
  if (value.includes('&&')) return value.split('&&').map(item => item.trim()).filter(Boolean).every(item => haystack.includes(item));
  if (value.includes('||')) return value.split('||').map(item => item.trim()).filter(Boolean).some(item => haystack.includes(item));
  return haystack.includes(value);
}

export function isImportantNote (text) { return /^\s*!/.test(String(text || '')); }

const vaultTools = { vaultToCSV, vaultToHTML, findStaleBookmarks, noteQueryMatch, isImportantNote };


/* ═══════════════════════════════════════════════════════════════════════════
   MODULE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(MOD, {
  title:            'Bookmark Vault',
  enabledByDefault: false,
}, async function init () {
  W.AO3H_BookmarkVault = vaultTools;
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

  return () => {
    instances.forEach(i => { try { i.stop(); } catch (_) {} });
    delete W.AO3H_BookmarkVault;
  };
});
