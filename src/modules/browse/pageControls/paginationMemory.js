/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Page Controls › Pagination Memory

Remembers which pages of a listing were visited recently, so the widget can
offer "resume where you left off" and quick links to recently seen pages.

Notes
    A listing is identified by its path plus its filter parameters — the
    `page` parameter itself is excluded so every page of one search shares
    one memory entry. Entries are capped (pages per listing and listings
    overall, oldest listing dropped first).

═══════════════════════════════════════════════════════════════════════════ */

export const MEMORY_KEY = 'ao3h:pc:recentPages';
export const MAX_PAGES_PER_LISTING = 5;
export const MAX_LISTINGS = 30;

/** Stable identity of a listing: path + sorted filters, without `page`. */
export function listingKey (href) {
  try {
    const url = new URL(href, 'https://archiveofourown.org');
    const params = [...url.searchParams.entries()]
      .filter(([k]) => k !== 'page')
      .sort(([a], [b]) => a.localeCompare(b));
    const qs = params.map(([k, v]) => `${k}=${v}`).join('&');
    return url.pathname + (qs ? `?${qs}` : '');
  } catch {
    return String(href);
  }
}

function _load (storage) {
  try {
    const data = JSON.parse(storage.getItem(MEMORY_KEY) || '{}');
    return data && typeof data === 'object' && !Array.isArray(data) ? data : {};
  } catch { return {}; }
}

function _save (storage, data) {
  try { storage.setItem(MEMORY_KEY, JSON.stringify(data)); } catch {}
}

/** Records a visit to `page` of the listing `key`. */
export function recordVisit (key, page, storage = localStorage) {
  if (!Number.isFinite(page) || page < 1) return;
  const data  = _load(storage);
  const entry = data[key] || { pages: [], at: 0 };

  entry.pages = [page, ...entry.pages.filter(p => p !== page)].slice(0, MAX_PAGES_PER_LISTING);
  entry.at    = Date.now();
  data[key]   = entry;

  // Cap the number of remembered listings — drop the least recently visited
  const keys = Object.keys(data);
  if (keys.length > MAX_LISTINGS) {
    keys.sort((a, b) => (data[a].at || 0) - (data[b].at || 0));
    for (const stale of keys.slice(0, keys.length - MAX_LISTINGS)) delete data[stale];
  }
  _save(storage, data);
}

/** Recently visited pages of a listing, most recent first. */
export function getRecentPages (key, storage = localStorage) {
  const entry = _load(storage)[key];
  return Array.isArray(entry?.pages) ? entry.pages.filter(p => Number.isFinite(p) && p >= 1) : [];
}

/** The page to offer as "resume" — the most recent visit, or null. */
export function getLastPage (key, storage = localStorage) {
  return getRecentPages(key, storage)[0] ?? null;
}
