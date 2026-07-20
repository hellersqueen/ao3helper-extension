/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Fic Appreciation › Kudos/Bookmark Finder

Finds works you've kudosed locally that don't show up among your own AO3
bookmarks, so you can catch fics you loved enough to kudos but forgot to
favorite. Only offered on your own bookmarks page (read-only, same-origin
requests against your own account — never another user's).

Notes

- Scans at most MAX_PAGES pages of bookmarks (most recent first, AO3's
  default order) to keep this a bounded, on-demand action rather than an
  unbounded background crawl.
- Kudos records lacking a workId can't happen (they're keyed by workId), but
  entries from before this module existed still compare fine — the diff only
  needs IDs.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { fetchAO3PageText } from '../../../../lib/ao3/requests.js';
import { parseBookmarksPageHTML } from '../../../../lib/ao3/parsers.js';


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const MAX_PAGES = 5;

export class KudosBookmarkFinder {
  /** @param {{ NS, storeGet, helpers: typeof import('./_ficAppreciation.js').ficAppreciationHelpers }} opts */
  constructor ({ NS, storeGet, helpers }) {
    this.NS        = NS;
    this.storeGet  = storeGet;
    this.helpers   = helpers;
    this.SK        = 'ficAppreciation:kudosed';
    this._controller = new AbortController();
  }

  _kudosedIds () { return Object.keys(this.storeGet(this.SK, {})); }

  _currentUsername () {
    return document.querySelector('a.login-toggle, [data-login] .user a, .header.module a[href*="/users/"]')
      ?.getAttribute('href')?.match(/\/users\/([^/]+)/)?.[1] || null;
  }

  isOwnBookmarksPage () {
    const m = location.pathname.match(/^\/users\/([^/]+)\/bookmarks/);
    if (!m) return false;
    const username = this._currentUsername();
    return !!username && m[1].toLowerCase() === username.toLowerCase();
  }

  /* ═══════════════════════════════════════════════════════════════════════
     FEATURE — SCAN AND DIFF
  ═══════════════════════════════════════════════════════════════════════ */

  /** @returns {Promise<{checked: number, missing: string[], truncated: boolean}>} */
  async findMissing () {
    const username = this._currentUsername();
    if (!username) return { checked: 0, missing: [], truncated: false };

    const bookmarkedIds = new Set();
    let hasNext = true;
    let page    = 1;
    while (hasNext && page <= MAX_PAGES) {
      const html = await fetchAO3PageText(`/users/${username}/bookmarks?page=${page}`, { signal: this._controller.signal });
      const parsed = parseBookmarksPageHTML(html);
      parsed.bookmarks.forEach(b => bookmarkedIds.add(b.workId));
      hasNext = parsed.hasNext;
      page++;
    }

    const kudosedIds = this._kudosedIds();
    return { checked: kudosedIds.length, missing: this.helpers.diffNotBookmarked(kudosedIds, [...bookmarkedIds]), truncated: hasNext };
  }

  /* ═══════════════════════════════════════════════════════════════════════
     FEATURE — UI
  ═══════════════════════════════════════════════════════════════════════ */

  injectFinderButton () {
    const { NS } = this;
    if (!this.isOwnBookmarksPage()) return;
    if (document.getElementById(`${NS}-fa-bookmark-finder`)) return;
    const main = document.querySelector('#main');
    if (!main) return;

    const wrap = document.createElement('div');
    wrap.id        = `${NS}-fa-bookmark-finder`;
    wrap.className = `${NS}-fa-bookmark-finder`;
    wrap.innerHTML = `
      <button type="button" class="${NS}-fa-bookmark-finder-btn">🔍 Find kudosed works not bookmarked here</button>
      <div class="${NS}-fa-bookmark-finder-result" hidden></div>
    `;
    const btn    = /** @type {HTMLButtonElement} */ (wrap.querySelector(`.${NS}-fa-bookmark-finder-btn`));
    const result = /** @type {HTMLElement} */ (wrap.querySelector(`.${NS}-fa-bookmark-finder-result`));

    btn?.addEventListener('click', async () => {
      btn.disabled    = true;
      btn.textContent = 'Scanning…';
      try {
        const { checked, missing, truncated } = await this.findMissing();
        result.hidden = false;
        if (!missing.length) {
          result.innerHTML = `<p>All ${checked} kudosed work${checked !== 1 ? 's' : ''} checked are bookmarked here 🎉</p>`;
        } else {
          const items = missing.slice(0, 50)
            .map(id => `<li><a href="/works/${id}" target="_blank" rel="noopener">Work #${id}</a></li>`)
            .join('');
          result.innerHTML = `
            <p>${missing.length} kudosed work${missing.length !== 1 ? 's' : ''} not found${truncated ? ` (checked the first ${MAX_PAGES} pages of bookmarks)` : ''}:</p>
            <ul class="${NS}-fa-bookmark-finder-list">${items}</ul>
          `;
        }
      } catch {
        result.hidden    = false;
        result.innerHTML = '<p>Scan failed — try again later.</p>';
      } finally {
        if (btn.isConnected) {
          btn.disabled    = false;
          btn.textContent = '🔍 Find kudosed works not bookmarked here';
        }
      }
    });

    main.insertBefore(wrap, main.firstChild);
  }

  /* ═══════════════════════════════════════════════════════════════════════
     FEATURE LIFECYCLE
  ═══════════════════════════════════════════════════════════════════════ */

  cleanup () {
    this._controller.abort();
    document.getElementById(`${this.NS}-fa-bookmark-finder`)?.remove();
  }
}
