/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Reading Dashboard Module
    Module ID: readingDashboard
    Display Name: Reading Dashboard

    Key Features:
        - Work visit tracking and history storage
        - Dashboard panel on homepage
        - Recent works widget (last 10 opened)
        - WIP tracker widget
        - Top fandoms and tags widgets
        - Quick links section
        - "Continue Reading" widget (reads readingTracker's per-work progress,
          catégorie Reading déjà migrée — soft dep, lecture seule)

    Storage:
        ao3h_dashboard_data_v1 -- { works[], fandomCounts{}, tagCounts{} }
        (particularité préexistante : sans le préfixe `ao3h:` habituel, conservée
        telle quelle pour la continuité des données)

    Note : la configuration (0 option, 5 widgets toujours actifs) est définie par
    lib/ui/panel/configs/Library-configs/readingDashboard-config.js — ce coordinateur
    ne réenregistre plus de config globale legacy (AO3H_Config / Common.Settings.define).

═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
// Etape 318 : detectUser importe (avant : lecture window.AO3H_Common)
import { detectUser } from '../../../../lib/utils/user-detector.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { css } from '../../../../lib/utils/index.js';
import styles from './readingDashboard.css?inline';

css(styles, 'ao3h-readingDashboard');

const W = getGlobalWindow();

const MOD_ID = 'readingDashboard';
const MOD_TITLE = 'reading dashboard';
const LOG_PREFIX = `[AO3H][${MOD_TITLE}]`;

const ROOT_CLASS = 'ao3h-dashboard-enabled';
const PANEL_ID = 'ao3h-dashboard-panel';
const STORAGE_KEY = 'ao3h_dashboard_data_v1';

// How many works we keep in history and how many we show
const MAX_WORKS_STORED = 200;
const MAX_RECENT_WORKS = 10;
const MAX_WIP_WORKS = 10;
const MAX_FANDOMS = 6;
const MAX_TAGS = 8;

function log(...args) {
  console.log(LOG_PREFIX, ...args);
}

// ───────────────────────────────────────────────────────────────
// Storage helpers
// ───────────────────────────────────────────────────────────────

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        works: [],
        fandomCounts: {},
        tagCounts: {},
      };
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return {
        works: [],
        fandomCounts: {},
        tagCounts: {},
      };
    }
    // Ensure basic structure
    parsed.works = Array.isArray(parsed.works) ? parsed.works : [];
    parsed.fandomCounts = parsed.fandomCounts || {};
    parsed.tagCounts = parsed.tagCounts || {};
    return parsed;
  } catch (err) {
    console.warn(`${LOG_PREFIX} Failed to load dashboard data`, err);
    return {
      works: [],
      fandomCounts: {},
      tagCounts: {},
    };
  }
}

function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data || {}));
  } catch (err) {
    console.warn(`${LOG_PREFIX} Failed to save dashboard data`, err);
  }
}

// ───────────────────────────────────────────────────────────────
// Page type detection
// ───────────────────────────────────────────────────────────────

function isWorkPage() {
  const path = W.location.pathname || '';
  return /\/works\/\d+/.test(path) || !!document.querySelector('#workskin');
}

function isHomePage() {
  const path = W.location.pathname || '';
  if (path === '/' || path === '/welcome') return true;
  // Also show on the user's own dashboard page (/users/{username})
  const username = getUsername();
  if (username && path === `/users/${username}`) return true;
  return false;
}

// ───────────────────────────────────────────────────────────────
// Extraction helpers (from a work page)
// ───────────────────────────────────────────────────────────────

function getWorkIdFromLocation() {
  const path = W.location.pathname || '';
  const match = path.match(/\/works\/(\d+)/);
  return match ? match[1] : null;
}

function getWorkTitle() {
  // AO3 usually: #workskin > .preface h2.title or h2.heading
  const el =
    document.querySelector('#workskin .preface h2.title') ||
    document.querySelector('#workskin .preface h2.heading') ||
    document.querySelector('h2.title') ||
    document.querySelector('h2.heading');
  if (!el) return null;
  return (el.textContent || '').trim();
}

function getWorkUrl() {
  return W.location.href;
}

function getWorkFandoms() {
  const result = [];
  const els = document.querySelectorAll('dd.fandom.tags a, dd.fandom a.tag');
  els.forEach((el) => {
    const t = (el.textContent || '').trim();
    if (t) result.push(t);
  });
  return result;
}

function getWorkTags() {
  const result = [];
  const els = document.querySelectorAll(
    'dd.freeform.tags a.tag, dd.freeform.tags li a, dd.additional.tags li a, dd.tags li a, li.relationships a.tag, dd.relationship.tags a'
  );
  els.forEach((el) => {
    const t = (el.textContent || '').trim();
    if (t) result.push(t);
  });
  return result;
}

function getWorkStatusText() {
  const dd = document.querySelector('dl.stats dd.status');
  if (!dd) return null;
  return (dd.textContent || '').trim();
}

function isWorkComplete(statusText) {
  if (!statusText) return false;
  const norm = statusText.toLowerCase();
  return norm.includes('complete');
}

// ───────────────────────────────────────────────────────────────
// Data updating when visiting a work
// ───────────────────────────────────────────────────────────────

function updateDataFromCurrentWork(data) {
  if (!isWorkPage()) return data;

  const workId = getWorkIdFromLocation();
  if (!workId) return data;

  const title = getWorkTitle() || `Work #${workId}`;
  const url = getWorkUrl();
  const fandoms = getWorkFandoms();
  const tags = getWorkTags();
  const statusText = getWorkStatusText();
  const completed = isWorkComplete(statusText);

  const now = Date.now();

  // Update or insert work entry
  let works = data.works || [];
  const existingIndex = works.findIndex((w) => w && w.id === workId);

  const newEntry = {
    id: workId,
    title,
    url,
    fandoms,
    tags,
    completed,
    lastVisited: now,
  };

  if (existingIndex !== -1) {
    works.splice(existingIndex, 1);
  }

  works.unshift(newEntry);

  // Trim list so it does not grow forever
  if (works.length > MAX_WORKS_STORED) {
    works = works.slice(0, MAX_WORKS_STORED);
  }

  data.works = works;

  // Update fandom counts
  const fandomCounts = data.fandomCounts || {};
  (fandoms || []).forEach((f) => {
    const key = f.toLowerCase();
    if (!key) return;
    fandomCounts[key] = (fandomCounts[key] || 0) + 1;
  });
  data.fandomCounts = fandomCounts;

  // Update tag counts
  const tagCounts = data.tagCounts || {};
  (tags || []).forEach((t) => {
    const key = t.toLowerCase();
    if (!key) return;
    tagCounts[key] = (tagCounts[key] || 0) + 1;
  });
  data.tagCounts = tagCounts;

  log('Updated dashboard data from work', workId, title);

  return data;
}

// ───────────────────────────────────────────────────────────────
// Dashboard panel rendering
// ───────────────────────────────────────────────────────────────

function createOrGetPanelContainer() {
  let panel = document.getElementById(PANEL_ID);
  if (panel) return panel;

  panel = document.createElement('section');
  panel.id = PANEL_ID;
  panel.className = 'ao3h-dashboard-panel';

  // Insert into #main if possible
  const main = document.querySelector('#main') || document.body;
  const firstChild = main.firstElementChild;

  if (firstChild) {
    main.insertBefore(panel, firstChild);
  } else {
    main.appendChild(panel);
  }

  return panel;
}

function clearPanel(panel) {
  while (panel.firstChild) {
    panel.removeChild(panel.firstChild);
  }
}

function formatRelativeDate(timestamp) {
  if (!timestamp) return '';
  const now = Date.now();
  const diffMs = now - timestamp;
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months > 1 ? 's' : ''} ago`;
}

function sortCountsDescending(countMap) {
  const entries = Object.entries(countMap || {});
  entries.sort((a, b) => b[1] - a[1]);
  return entries;
}

function buildWorksList(works, max, { title, emptyText }) {
  const section = document.createElement('div');
  section.className = 'ao3h-dashboard-section';

  const h = document.createElement('h3');
  h.className = 'ao3h-dashboard-section-title';
  h.textContent = title;
  section.appendChild(h);

  if (!works || !works.length) {
    const p = document.createElement('p');
    p.className = 'ao3h-dashboard-empty';
    p.textContent = emptyText || 'No data yet.';
    section.appendChild(p);
    return section;
  }

  const list = document.createElement('ul');
  list.className = 'ao3h-dashboard-list';

  works.slice(0, max).forEach((w) => {
    const li = document.createElement('li');

    const a = document.createElement('a');
    a.href = w.url;
    a.textContent = w.title;

    const meta = document.createElement('span');
    meta.className = 'ao3h-dashboard-meta';
    const pieces = [];
    if (w.fandoms && w.fandoms.length) {
      pieces.push(w.fandoms[0]);
    }
    pieces.push(w.completed ? 'Completed' : 'WIP');
    pieces.push(formatRelativeDate(w.lastVisited));
    meta.textContent = pieces.join(' · ');

    li.appendChild(a);
    li.appendChild(meta);
    list.appendChild(li);
  });

  section.appendChild(list);
  return section;
}

function buildCountsList(countEntries, max, { title, emptyText }) {
  const section = document.createElement('div');
  section.className = 'ao3h-dashboard-section';

  const h = document.createElement('h3');
  h.className = 'ao3h-dashboard-section-title';
  h.textContent = title;
  section.appendChild(h);

  if (!countEntries || !countEntries.length) {
    const p = document.createElement('p');
    p.className = 'ao3h-dashboard-empty';
    p.textContent = emptyText || 'No data yet.';
    section.appendChild(p);
    return section;
  }

  const list = document.createElement('ul');
  list.className = 'ao3h-dashboard-list';

  countEntries.slice(0, max).forEach(([key, count]) => {
    const li = document.createElement('li');
    const name = key; // original text is lost, we use lowercase version here.

    const spanName = document.createElement('span');
    spanName.className = 'ao3h-dashboard-label';
    spanName.textContent = name;

    const spanCount = document.createElement('span');
    spanCount.className = 'ao3h-dashboard-count';
    spanCount.textContent = `${count} visit${count > 1 ? 's' : ''}`;

    li.appendChild(spanName);
    li.appendChild(spanCount);

    list.appendChild(li);
  });

  section.appendChild(list);
  return section;
}

function getUsername() {
  const u = detectUser();
  if (u) return u;
  // Fallback: read directly from the AO3 nav
  const link = document.querySelector('a[href^="/users/"]');
  const match = link?.getAttribute('href')?.match(/^\/users\/([^\/?#]+)/);
  return match ? match[1] : null;
}

function buildQuickLinksSection() {
  const section = document.createElement('div');
  section.className = 'ao3h-dashboard-section ao3h-dashboard-quicklinks';

  const h = document.createElement('h3');
  h.className = 'ao3h-dashboard-section-title';
  h.textContent = 'Quick access';
  section.appendChild(h);

  const row = document.createElement('div');
  row.className = 'ao3h-dashboard-quicklinks-row';

  function makeLink(label, href) {
    const a = document.createElement('a');
    a.className = 'ao3h-dashboard-quicklink';
    a.href = href;
    a.textContent = label;
    return a;
  }

  const username = getUsername();
  const userBase = username ? `/users/${username}` : '';

  row.appendChild(makeLink('Bookmarks',       `${userBase}/bookmarks`));
  row.appendChild(makeLink('History',         `${userBase}/readings`));
  row.appendChild(makeLink('Marked for Later',`${userBase}/readings?show=to-read`));
  row.appendChild(makeLink('Subscriptions',   `${userBase}/subscriptions`));

  section.appendChild(row);
  return section;
}

// ── "Continue Reading" widget ──────────────────────────────────────────────

function buildContinueReadingSection(data) {
  let progress;
  try {
    const raw = localStorage.getItem('ao3h:readingTracker:progress');
    if (!raw) return null;
    progress = JSON.parse(raw);
  } catch (_) { return null; }

  if (!progress || typeof progress !== 'object') return null;

  const works = (data && data.works) || [];
  const workMap = {};
  works.forEach(w => { if (w.id) workMap[String(w.id)] = w; });

  // Filter in-progress works (0 < percent < 100) and sort by updatedAt desc
  const inProgress = Object.entries(progress)
    .filter(([, p]) => p && p.percent > 0 && p.percent < 100 && p.chapterHref)
    .sort(([, a], [, b]) => (b.updatedAt || 0) - (a.updatedAt || 0))
    .slice(0, 3)
    .map(([workId, p]) => {
      const match = workMap[workId];
      return {
        title:   match?.title || `Work #${workId}`,
        fandom:  match?.fandoms?.[0] || '',
        href:    p.chapterHref,
        percent: Math.round(p.percent),
        updatedAt: p.updatedAt || 0,
      };
    });

  const section = document.createElement('div');
  section.className = 'ao3h-dashboard-section';

  const h = document.createElement('h3');
  h.className = 'ao3h-dashboard-section-title';
  h.textContent = 'Continue Reading';
  section.appendChild(h);

  if (!inProgress.length) {
    const p = document.createElement('p');
    p.className = 'ao3h-dashboard-empty';
    p.textContent = 'Nothing in progress — start a work to see it here.';
    section.appendChild(p);
    return section;
  }

  const list = document.createElement('ul');
  list.className = 'ao3h-dashboard-list';

  inProgress.forEach(({ title, fandom, href, percent, updatedAt }) => {
    const li = document.createElement('li');

    const a = document.createElement('a');
    a.href = href;
    a.textContent = title;

    const meta = document.createElement('span');
    meta.className = 'ao3h-dashboard-meta';
    const pieces = [];
    if (fandom) pieces.push(fandom);
    pieces.push(`${percent}%`);
    pieces.push(formatRelativeDate(updatedAt));
    meta.textContent = pieces.join(' · ');

    li.appendChild(a);
    li.appendChild(meta);
    list.appendChild(li);
  });

  section.appendChild(list);
  return section;
}

function renderDashboardPanel(data) {
  if (!isHomePage()) return;

  const panel = createOrGetPanelContainer();
  clearPanel(panel);

  const title = document.createElement('h2');
  title.className = 'ao3h-dashboard-title';
  title.textContent = 'AO3 Helper — Your reading dashboard';
  panel.appendChild(title);

  const wrapper = document.createElement('div');
  wrapper.className = 'ao3h-dashboard-grid';

  const works = (data && data.works) || [];

  const sortedWorks = works.slice().sort((a, b) => (b.lastVisited || 0) - (a.lastVisited || 0));
  const recentWorksSection = buildWorksList(sortedWorks, MAX_RECENT_WORKS, {
    title: 'Last opened works',
    emptyText: 'Open a few fics and they will appear here.',
  });

  const wipWorks = sortedWorks.filter((w) => !w.completed);
  const wipSection = buildWorksList(wipWorks, MAX_WIP_WORKS, {
    title: 'Works in progress you visited',
    emptyText: 'Recently visited WIPs will appear here.',
  });

  const fandomCountsSorted = sortCountsDescending(data.fandomCounts || {});
  const fandomSection = buildCountsList(fandomCountsSorted, MAX_FANDOMS, {
    title: 'Your top fandoms',
    emptyText: 'Your fandom history will appear here as you read.',
  });

  const tagCountsSorted = sortCountsDescending(data.tagCounts || {});
  const tagsSection = buildCountsList(tagCountsSorted, MAX_TAGS, {
    title: 'Your top tags',
    emptyText: 'Your favorite tropes will appear here as you read.',
  });

  const quickLinksSection = buildQuickLinksSection();

  // "Continue Reading" widget — inserted first if data available
  const continueSection = buildContinueReadingSection(data);
  if (continueSection) wrapper.appendChild(continueSection);

  wrapper.appendChild(recentWorksSection);
  wrapper.appendChild(wipSection);
  wrapper.appendChild(fandomSection);
  wrapper.appendChild(tagsSection);

  panel.appendChild(wrapper);
  panel.appendChild(quickLinksSection);
}

// ───────────────────────────────────────────────────────────────
// Module lifecycle
// ───────────────────────────────────────────────────────────────

function init(/* context */) {
  log('init');

  const html = document.documentElement;
  html.classList.add(ROOT_CLASS);

  let data = loadData();
  data = updateDataFromCurrentWork(data);
  saveData(data);

  renderDashboardPanel(data);

  return function dispose() {
    log('stopped');
    html.classList.remove(ROOT_CLASS);
    const panel = document.getElementById(PANEL_ID);
    if (panel && panel.parentNode) {
      panel.parentNode.removeChild(panel);
    }
  };
}

register(
  MOD_ID,
  { title: 'Reading Dashboard', enabledByDefault: false },
  init
);

log('ready');
