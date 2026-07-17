// Route-aware feature implementation loader. The lightweight registry keeps
// every module visible; implementations load only when useful or enabled.
import './core/module-registry.js';
import { AO3H } from './core/lifecycle.js';
import { Flags } from '../lib/utils/config.js';

async function loadTagsDisplay() {
  const children = [
    () => import('./modules/browse/tagsDisplay/archiveWarningsDisplay.js'),
    () => import('./modules/browse/tagsDisplay/autoHideNoiseTags.js'),
    () => import('./modules/browse/tagsDisplay/compactModeTags.js'),
    () => import('./modules/browse/tagsDisplay/tagHighlighting.js'),
    () => import('./modules/browse/tagsDisplay/tagsReordering.js'),
    () => import('./modules/browse/tagsDisplay/tagsVisibility.js'),
    () => import('./modules/browse/tagsDisplay/externalTagLinks.js'),
    () => import('./modules/browse/tagsDisplay/tagSeparatorStyle.js'),
    () => import('./modules/browse/tagsDisplay/tagImportancePromotion.js'),
  ];
  for (const load of children) {
    await load();
    await yieldToBrowser();
  }
  return import('./modules/browse/tagsDisplay/_tagsDisplay.js');
}

async function loadActivityPanel() {
  const children = [
    () => import('./modules/library/activityPanel/fandomBreakdown.js'),
    () => import('./modules/library/activityPanel/habitsAnalysis.js'),
    () => import('./modules/library/activityPanel/patternAnalysis.js'),
    () => import('./modules/library/activityPanel/readingInsights.js'),
    () => import('./modules/library/activityPanel/sessionHistory.js'),
  ];
  for (const load of children) {
    await load();
    await yieldToBrowser();
  }
  return import('./modules/library/activityPanel/_activityPanel.js');
}

async function loadUserRelationships() {
  const children = [
    () => import('./modules/navigate/userRelationships/authorBlocking.js'),
    () => import('./modules/navigate/userRelationships/authorPreference.js'),
    () => import('./modules/navigate/userRelationships/authorTracking.js'),
    () => import('./modules/navigate/userRelationships/blockingInterface.js'),
    () => import('./modules/navigate/userRelationships/blocklistManagement.js'),
    () => import('./modules/navigate/userRelationships/commentHiding.js'),
  ];
  for (const load of children) {
    await load();
    await yieldToBrowser();
  }
  return import('./modules/navigate/userRelationships/_userRelationships.js');
}

async function loadTextToSpeech() {
  const children = [
    () => import('./modules/reading/textToSpeech/speechEngine.js'),
    () => import('./modules/reading/textToSpeech/playbackControls.js'),
    () => import('./modules/reading/textToSpeech/visualFeedback.js'),
    () => import('./modules/reading/textToSpeech/contentFiltering.js'),
    () => import('./modules/reading/textToSpeech/pronunciationManager.js'),
  ];
  for (const load of children) {
    await load();
    await yieldToBrowser();
  }
  return import('./modules/reading/textToSpeech/_textToSpeech.js');
}

async function loadSearchEnhancer() {
  const children = [
    () => import('./modules/explore/searchEnhancer/relatedSearches.js'),
    () => import('./modules/explore/searchEnhancer/searchAutocomplete.js'),
    () => import('./modules/explore/searchEnhancer/resultsSorting.js'),
    () => import('./modules/explore/searchEnhancer/seriesGrouping.js'),
  ];
  for (const load of children) {
    await load();
    await yieldToBrowser();
  }
  return import('./modules/explore/searchEnhancer/_searchEnhancer.js');
}

async function loadTropeGames() {
  const children = [
    () => import('./modules/explore/tropeGames/tropeAchievements.js'),
    () => import('./modules/explore/tropeGames/tropeBingoPatterns.js'),
    () => import('./modules/explore/tropeGames/tropeHoroscope.js'),
    () => import('./modules/explore/tropeGames/tropeRoulette.js'),
    () => import('./modules/explore/tropeGames/tropeStatistics.js'),
  ];
  for (const load of children) {
    await load();
    await yieldToBrowser();
  }
  return import('./modules/explore/tropeGames/_tropeGames.js');
}

async function loadBookmarkVault() {
  const children = [
    () => import('./modules/library/bookmarkVault/bookmarkStatus/statusIndicators.js'),
    () => import('./modules/library/bookmarkVault/richTextNotes.js'),
    () => import('./modules/library/bookmarkVault/organizationTools.js'),
    () => import('./modules/library/bookmarkVault/bookmarkStatus/readingStatusTracking.js'),
    () => import('./modules/library/bookmarkVault/bookmarkNavigation.js'),
    () => import('./modules/library/bookmarkVault/bookmarkMaintenance.js'),
    () => import('./modules/library/bookmarkVault/noteManagement.js'),
    () => import('./modules/library/bookmarkVault/noteDisplay.js'),
    () => import('./modules/library/bookmarkVault/sortingAndFiltering.js'),
  ];
  for (const load of children) {
    await load();
    await yieldToBrowser();
  }
  return import('./modules/library/bookmarkVault/_bookmarkVault.js');
}

const FEATURES = {
  hideByTags:          { load: () => import('./modules/browse/hideByTags/_hideByTags.js'), routes: ['listing'] },
  filterManager:       { load: () => import('./modules/browse/filterManager/_filterManager.js'), routes: ['listing'] },
  skipWorks:           { load: () => import('./modules/browse/skipWorks/_skipWorks.js'), routes: ['listing'] },
  pageControls:        { load: () => import('./modules/browse/pageControls/_pageControls.js'), routes: ['listing'] },
  ficEngagement:       { load: () => import('./modules/browse/ficEngagement/_ficEngagement.js'), routes: ['work', 'listing'] },
  workLength:          { load: () => import('./modules/browse/workLength/_workLength.js'), routes: ['work', 'listing'] },
  tagsDisplay:         { load: loadTagsDisplay, routes: ['work', 'listing'] },
  ficPeek:             { load: () => import('./modules/explore/ficPeek/ficPeek.js'), routes: ['listing'] },
  similarFics:         { load: () => import('./modules/explore/similarFics/similarFics.js'), routes: ['work'] },
  surpriseMe:          { load: () => import('./modules/explore/surpriseMe/surpriseMe.js'), routes: ['home', 'listing', 'search'] },
  tropeGames:          { load: loadTropeGames, routes: ['home', 'work'] },
  searchEnhancer:      { load: loadSearchEnhancer, routes: ['listing', 'search'] },
  povTracker:          { load: () => import('./modules/explore/povTracker/_povTracker.js'), routes: ['work', 'listing'] },
  chapterNavigation:   { load: () => import('./modules/reading/chapterNavigation/_chapterNavigation.js'), routes: ['work', 'listing'] },
  readingTracker:      { load: () => import('./modules/reading/readingTracker/_readingTracker.js'), routes: ['work', 'listing', 'readings'] },
  textToSpeech:        { load: loadTextToSpeech, routes: ['work'] },
  instantFootnotes:    { load: () => import('./modules/reading/instantFootnotes/instantFootnotes.js'), routes: ['work'] },
  readingFormatter:    { load: () => import('./modules/reading/readingFormatter/_readingFormatter.js'), routes: ['work'] },
  collapseAuthorNotes: { load: () => import('./modules/reading/collapseAuthorNotes/collapseAuthorNotes.js'), routes: ['work'] },
  wordSwap:            { load: () => import('./modules/reading/wordSwap/wordSwap.js'), routes: ['work'] },
  bookmarkVault:       { load: loadBookmarkVault, routes: ['work', 'bookmarks'] },
  laterShelf:          { load: () => import('./modules/library/laterShelf/_laterShelf.js'), routes: ['work', 'listing', 'readings'] },
  ficAppreciation:     { load: () => import('./modules/library/ficAppreciation/_ficAppreciation.js'), routes: ['work', 'listing'] },
  readingDashboard:    { load: () => import('./modules/library/readingDashboard/readingDashboard.js'), routes: ['work', 'dashboard'] },
  activityPanel:       { load: loadActivityPanel, routes: ['work', 'dashboard'] },
  readingTimeline:     { load: () => import('./modules/library/readingTimeline/_readingTimeline.js'), routes: ['dashboard', 'readings'] },
  notificationCenter:  { load: () => import('./modules/library/notificationCenter/notificationCenter.js'), routes: ['all'] },
  fanficBingeMode:     { load: () => import('./modules/library/fanficBingeMode/_fanficBingeMode.js'), routes: ['home', 'work', 'listing'] },
  mainNavigation:      { load: () => import('./modules/navigate/mainNavigation/_mainNavigation.js'), routes: ['all'] },
  keyboardShortcuts:   { load: () => import('./modules/navigate/keyboardShortcuts/keyboardShortcuts.js'), routes: ['all'] },
  userRelationships:   { load: loadUserRelationships, routes: ['work', 'listing', 'dashboard'] },
  seriesHelper:        { load: () => import('./modules/navigate/seriesHelper/_seriesHelper.js'), routes: ['work', 'listing'] },
  commentKit:          { load: () => import('./modules/navigate/commentKit/_commentKit.js'), routes: ['work'] },
  ficActions:          { load: () => import('./modules/navigate/ficActions/ficActions.js'), routes: ['work'] },
  visualPreferences:   { load: () => import('./modules/appearance/visualPreferences/_visualPreferences.js'), routes: ['all'] },
  themeBuilder:        { load: () => import('./modules/appearance/themeBuilder/_themeBuilder.js'), routes: ['all'] },
  backupAndSync:       { load: () => import('./modules/appearance/backupAndSync/_backupAndSync.js'), routes: ['all'] },
  ficDownloader:       { load: () => import('./modules/appearance/ficDownloader/_ficDownloader.js'), routes: ['work', 'listing'] },
};

const DEFAULT_ENABLED = new Set(['hideByTags', 'skipWorks', 'seriesHelper', 'visualPreferences']);
const loading = new Map();
const loaded = new Set();

function currentRoute(pathname = location.pathname) {
  const routes = new Set();
  const fixture = pathname.match(/\/ao3-mock\/([^/]+)\.html$/)?.[1] || '';
  if (pathname === '/' || pathname === '/home' || fixture === 'home') routes.add('home');
  if (/^\/works\/\d+/.test(pathname) || /^work(?:-|$)/.test(fixture)) routes.add('work');
  if (/\/bookmarks(?:\/|$)/.test(pathname) || fixture === 'bookmarks') routes.add('bookmarks');
  if (/^\/users\/[^/]+\/(?:dashboard|profile|stats)/.test(pathname) || fixture === 'dashboard') routes.add('dashboard');
  if (/^\/users\/[^/]+\/readings/.test(pathname) || fixture === 'history') routes.add('readings');
  if (/^\/works\/search|^\/search/.test(pathname)) routes.add('search');
  if (/^\/works(?:\/|$)/.test(pathname) || /^\/tags\/.*\/works/.test(pathname) ||
      /\/bookmarks(?:\/|$)/.test(pathname) || /^\/users\/[^/]+\/(?:works|history)/.test(pathname) ||
      /^\/collections\/[^/]+\/works/.test(pathname) ||
      ['bookmarks', 'listings', 'search-results', 'tag-results'].includes(fixture)) routes.add('listing');
  return routes;
}

function isEnabled(name) {
  const canonical = `mod:${name}:enabled`;
  const alternate = `mod:${name.toLowerCase().replace(/[^a-z0-9]+/g, '')}:enabled`;
  return !!Flags.get(canonical, DEFAULT_ENABLED.has(name)) || !!Flags.get(alternate, false);
}

function matchesCurrentRoute(feature, routes) {
  return feature.routes.includes('all') || feature.routes.some((route) => routes.has(route));
}

function yieldToBrowser() {
  if (globalThis.requestIdleCallback) return new Promise((resolve) => requestIdleCallback(resolve, { timeout: 100 }));
  return new Promise((resolve) => setTimeout(resolve, 0));
}

export function ensureModuleLoaded(name) {
  if (loaded.has(name)) return Promise.resolve(true);
  if (loading.has(name)) return loading.get(name);
  const feature = FEATURES[name];
  if (!feature) return Promise.resolve(false);
  const promise = feature.load().then(() => {
    loaded.add(name);
    loading.delete(name);
    return true;
  }, (error) => {
    loading.delete(name);
    throw error;
  });
  loading.set(name, promise);
  return promise;
}

const implementationAPI = {
  ensureLoaded: ensureModuleLoaded,
  isLoaded: (name) => loaded.has(name),
  routeModules: [],
};
AO3H.moduleImplementations = implementationAPI;

export async function loadModulesCooperatively() {
  const routes = currentRoute();
  const names = Object.keys(FEATURES).filter((name) => isEnabled(name) && matchesCurrentRoute(FEATURES[name], routes));
  implementationAPI.routeModules = names.slice();
  for (const name of names) {
    performance.mark?.(`ao3h:module:${name}:start`);
    await ensureModuleLoaded(name);
    performance.mark?.(`ao3h:module:${name}:end`);
    try {
      performance.measure?.(`ao3h:module:${name}`, `ao3h:module:${name}:start`, `ao3h:module:${name}:end`);
    } catch { /* performance marks are diagnostic only */ }
    await yieldToBrowser();
  }
  performance.mark?.('ao3h:modules:registered');
  return names.length;
}
