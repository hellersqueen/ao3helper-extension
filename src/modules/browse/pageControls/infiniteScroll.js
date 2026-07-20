/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Page Controls › Infinite Scroll

Loads the next listing page automatically when the reader approaches the
bottom of the list, appending its works to the current page.

Notes
    Pages are fetched same-origin with a small delay between loads to stay
    gentle with AO3. Pagination blocks are hidden while the feature is
    active (they come back on teardown). A status line shows loading state
    and the last loaded page.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const LIST_SELECTOR =
  'ol.work.index, ul.bookmark.index, ol.reading.work.index, ol.index.group, ul.index.group';

/**
 * Extracts the listing items (work/bookmark blurbs) from a fetched page.
 * Exported for tests.
 * @param {Document} doc — parsed HTML of a listing page
 * @returns {Element[]}
 */
export function extractBlurbs (doc) {
  const list = doc.querySelector(LIST_SELECTOR);
  if (!list) return [];
  return [...list.querySelectorAll(':scope > li.blurb')];
}


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

export class InfiniteScroll {
  constructor (opts = {}) {
    this._opts      = opts;
    this._list      = null;
    this._sentinel  = null;
    this._status    = null;
    this._observer  = null;
    this._loading   = false;
    this._nextPage  = 1;
    this._maxPage   = 1;
    this._active    = true;
    this._hiddenEls = [];
    this._controllers = new Set();
  }

  setup () {
    const pageHelpers = this._opts.pageHelpers;
    if (!pageHelpers) return;
    this._list = document.querySelector(LIST_SELECTOR);
    this._maxPage  = pageHelpers.getMaxPage();
    this._nextPage = pageHelpers.getCurrentPage() + 1;
    if (!this._list || this._maxPage <= 1 || this._nextPage > this._maxPage) return;

    // Hide pagination while infinite scroll drives the navigation
    document.querySelectorAll('ol.pagination, ul.pagination, .pagination').forEach(pg => {
      if (pg instanceof HTMLElement && pg.style.display !== 'none') {
        this._hiddenEls.push(pg);
        pg.style.display = 'none';
      }
    });

    this._status = document.createElement('div');
    this._status.className = 'ao3h-pc-infinite-status';
    this._list.insertAdjacentElement('afterend', this._status);
    this._updateStatus();

    this._sentinel = document.createElement('div');
    this._sentinel.className = 'ao3h-pc-infinite-sentinel';
    this._status.insertAdjacentElement('afterend', this._sentinel);

    this._observer = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) this._loadNext();
    }, { rootMargin: '600px 0px' });
    this._observer.observe(this._sentinel);
  }

  _updateStatus (text) {
    if (!this._status) return;
    if (text) { this._status.textContent = text; return; }
    this._status.textContent = this._nextPage > this._maxPage
      ? `— end of results (${this._maxPage} pages) —`
      : `Page ${this._nextPage - 1} / ${this._maxPage} — scroll for more`;
  }

  async _loadNext () {
    if (this._loading || !this._active || this._nextPage > this._maxPage) return;
    this._loading = true;
    this._updateStatus(`Loading page ${this._nextPage}…`);

    const controller = new AbortController();
    this._controllers.add(controller);
    try {
      const res = await fetch(this._opts.pageHelpers.buildPageURL(this._nextPage), { signal: controller.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
      if (!this._active) return;

      const blurbs = extractBlurbs(doc);
      blurbs.forEach(b => this._list.appendChild(document.importNode(b, true)));

      this._nextPage += 1;
      this._updateStatus();
      if (this._nextPage > this._maxPage) this._observer?.disconnect();
    } catch (err) {
      if (err?.name !== 'AbortError' && this._active) {
        this._updateStatus(`Could not load page ${this._nextPage} — scroll to retry`);
      }
    } finally {
      this._controllers.delete(controller);
      this._loading = false;
    }
  }

  teardown () {
    this._active = false;
    this._controllers.forEach(c => c.abort());
    this._controllers.clear();
    this._observer?.disconnect();
    this._observer = null;
    this._sentinel?.remove();
    this._status?.remove();
    this._hiddenEls.forEach(el => { el.style.display = ''; });
    this._hiddenEls = [];
  }
}
