/* ──────────────────────────────────────────────────────────────────────────
   MENU GROUPS CONFIGURATION — ES Module

   Source of truth: lib/ui/panel/tab-registry.js
   Do not edit group lists here — edit tab-registry.js instead.

   TODO: Once tab-registry.js is migrated to ES Modules, replace the inline
   GROUPS definition with a direct import and remove the bridge block below:
     import { GROUPS } from '../panel/tab-registry.js';
   ────────────────────────────────────────────────────────────────────────── */

// Static definition — kept in sync with lib/ui/panel/tab-registry.js.
// If tab-registry.js loads first (normal runtime), its value takes precedence
// via window.AO3H_Common.MenuGroups.GROUPS. The bridge below ensures backward
// compatibility for non-migrated consumers that still read from that global.
export const GROUPS = [
  {
    label: 'Filter & Display',
    include: ['hideByTags', 'filterManager', 'skipWorks', 'pageControls', 'ficEngagement', 'workLength', 'tagsDisplay'],
    match: /(hide|tags|filter|manager|skip|works|fic|engagement|work|length|display)/i,
  },
  {
    label: 'Explore',
    include: ['ficPeek', 'similarFics', 'surpriseMe', 'tropeGames', 'searchEnhancer', 'povTracker'],
    match: /(fic|peek|similar|surprise|trope|games|search|enhancer|pov|tracker)/i,
  },
  {
    label: 'Reading',
    include: ['chapterNavigation', 'readingTracker', 'textToSpeech', 'instantFootnotes', 'readingFormatter', 'collapseAuthorNotes', 'wordSwap'],
    match: /(chapter|navigation|reading|tracker|text|speech|footnotes|formatter|collapse|notes|word|swap|fic|actions)/i,
  },
  {
    label: 'Library',
    include: ['bookmarkVault', 'laterShelf', 'ficAppreciation', 'readingDashboard', 'activityPanel', 'readingTimeline', 'notificationCenter', 'fanficBingeMode'],
    match: /(bookmark|vault|later|shelf|fic|appreciation|reading|dashboard|activity|panel|timeline|notification|center|fanfic|binge)/i,
  },
  {
    label: 'Navigate & Interact',
    include: ['mainNavigation', 'keyboardShortcuts', 'userRelationships', 'seriesHelper', 'commentKit', 'ficActions'],
    match: /(main|navigation|keyboard|shortcuts|user|relationships|series|helper|comment|kit|fic|actions)/i,
  },
  {
    label: 'Appearance & Tools',
    include: ['visualPreferences', 'themeBuilder', 'backupAndSync', 'ficDownloader'],
    match: /(visual|preferences|theme|builder|backup|sync|fic|downloader)/i,
  },
];

// Étape 317 : pose window.AO3H_Common.MenuGroups supprimée du source —
// menu-grouper.js importe GROUPS directement ; le bundler legacy
// (supprimé en Phase 27) réinjectait la pose via son shim `invoke`.
