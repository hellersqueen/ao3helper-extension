/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Fic Appreciation › Kudos History Page

Renders the virtual `/users/<you>/kudos-history` route — a URL AO3 doesn't
serve natively — as a full page listing every locally-tracked kudosed work,
searchable by title/author/fandom. Also injects the two entry points: a link
in AO3's top navigation (every page) and a "Kudos (N)" entry in the Dashboard
sidebar, right after "History" (your own `/users/<you>` page only).

Notes

- The list reuses AO3's own listing markup/classes (`work index group`,
  `work blurb`, `header module`...) so the page inherits AO3's real
  stylesheet instead of a bespoke look.
- `render()` never deletes `#main`'s original content — it hides and later
  restores it, so `cleanupPage()` can put the page back exactly as it was.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { detectUser } from '../../../../lib/utils/user-detector.js';
import { formatDate } from '../../../../lib/utils/format-date.js';


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const NAV_SELECTORS = [
  '#header ul.primary.navigation',
  '#header nav ul.primary.navigation',
  '#header ul.primary',
  '#header nav ul',
  'ul.primary.navigation',
];

const MAX_RENDERED = 300;

export class KudosHistoryPage {
  /**
   * @param {{ NS: string, cfg: (key: string) => any, kef: {
   *   getHistory: (opts?: {query?: string, order?: string}) => Array<{workId: string, date?: string, title?: string, author?: string, fandoms?: string[]}>,
   *   getStats: () => { total: number },
   * } }} opts
   */
  constructor ({ NS, cfg, kef }) {
    this.NS  = NS;
    this.cfg = cfg;
    this.kef = kef;
    this._container = null;
    this._hiddenMainChildren = [];
    this._searchTimer = null;
  }

  /* ═══════════════════════════════════════════════════════════════════════
     FEATURE — ENTRY POINTS (top nav link + dashboard sidebar link)
  ═══════════════════════════════════════════════════════════════════════ */

  _findNavUL () {
    for (const selector of NAV_SELECTORS) {
      const el = document.querySelector(selector);
      if (el && !el.closest('#ao3h-helper, #ao3h-menu, .ao3h-root')) return el;
    }
    return null;
  }

  /** Site-wide link in AO3's own top navigation bar. */
  injectNavLink () {
    const { NS } = this;
    if (document.querySelector(`.${NS}-fa-kudos-nav-link`)) return;
    const username = detectUser();
    if (!username) return;
    const ul = this._findNavUL();
    if (!ul) return;

    const li = document.createElement('li');
    li.className = `${NS}-fa-kudos-nav-link`;
    const a = document.createElement('a');
    a.href = `/users/${encodeURIComponent(username)}/kudos-history`;
    a.textContent = 'Kudos History';
    li.appendChild(a);
    ul.appendChild(li);
  }

  /** "Kudos (N)" entry in AO3's real Dashboard sidebar, next to "History". */
  injectDashboardLink () {
    const { NS } = this;
    if (document.querySelector(`.${NS}-fa-kudos-dashboard-link`)) return;
    const username = detectUser();
    if (!username) return;

    const historyItem = document.querySelector('#dashboard a[href*="/readings"]')?.closest('li');
    if (!historyItem) return;

    const li = document.createElement('li');
    li.className = `${NS}-fa-kudos-dashboard-link`;
    const a = document.createElement('a');
    a.href = `/users/${encodeURIComponent(username)}/kudos-history`;
    a.textContent = `Kudos (${this.kef.getStats().total})`;
    li.appendChild(a);
    historyItem.after(li);
  }

  removeLinks () {
    const { NS } = this;
    document.querySelector(`.${NS}-fa-kudos-nav-link`)?.remove();
    document.querySelector(`.${NS}-fa-kudos-dashboard-link`)?.remove();
  }

  /* ═══════════════════════════════════════════════════════════════════════
     FEATURE — PAGE RENDER
  ═══════════════════════════════════════════════════════════════════════ */

  /** Build one list entry using AO3's own work-blurb markup/classes. */
  _buildEntry (entry) {
    const { NS } = this;
    const li = document.createElement('li');
    li.id = `${NS}-fa-kudos-${entry.workId}`;
    li.className = 'work blurb group';
    li.dataset.workid = entry.workId;

    const header = document.createElement('div');
    header.className = 'header module';

    const h4 = document.createElement('h4');
    h4.className = 'heading';
    const titleLink = document.createElement('a');
    titleLink.href = `/works/${entry.workId}`;
    titleLink.textContent = entry.title || `Work #${entry.workId}`;
    h4.appendChild(titleLink);
    if (entry.author) {
      h4.appendChild(document.createTextNode(' by '));
      h4.appendChild(document.createTextNode(entry.author));
    }
    header.appendChild(h4);

    if (entry.fandoms?.length) {
      const h5 = document.createElement('h5');
      h5.className = 'fandoms heading';
      const label = document.createElement('span');
      label.className = 'landmark';
      label.textContent = 'Fandoms:';
      h5.appendChild(label);
      h5.appendChild(document.createTextNode(' ' + entry.fandoms.join(', ')));
      header.appendChild(h5);
    }

    if (entry.date) {
      const dateEl = document.createElement('p');
      dateEl.className = 'datetime';
      dateEl.textContent = formatDate(entry.date, this.cfg('tooltipDateFormat') || 'long');
      header.appendChild(dateEl);
    }

    li.appendChild(header);
    return li;
  }

  _renderList (query) {
    const { NS } = this;
    const listEl  = this._container?.querySelector(`.${NS}-fa-kudos-list`);
    const countEl = this._container?.querySelector(`.${NS}-fa-kudos-count`);
    if (!listEl) return;

    const entries = this.kef.getHistory({ query, order: 'desc' });
    listEl.textContent = '';

    if (!entries.length) {
      const empty = document.createElement('p');
      empty.className = `${NS}-fa-kudos-empty`;
      empty.textContent = query
        ? 'No kudosed works match your search.'
        : "You haven't kudosed anything yet.";
      listEl.appendChild(empty);
      if (countEl) countEl.textContent = '';
      return;
    }

    const shown = entries.slice(0, MAX_RENDERED);
    const frag  = document.createDocumentFragment();
    for (const entry of shown) frag.appendChild(this._buildEntry(entry));
    listEl.appendChild(frag);

    if (countEl) {
      countEl.textContent = entries.length > MAX_RENDERED
        ? `Showing ${MAX_RENDERED} of ${entries.length} — refine your search to see more`
        : `${entries.length} kudosed work${entries.length === 1 ? '' : 's'}`;
    }
  }

  /** Render the page into #main, hiding (not deleting) whatever was there. */
  render () {
    const { NS } = this;
    const root = document.querySelector('#main') || document.body;
    if (!root || this._container) return;

    document.title = 'My Kudos — AO3';

    this._hiddenMainChildren = Array.from(root.children);
    this._hiddenMainChildren.forEach(el => { el.style.display = 'none'; });

    const container = document.createElement('div');
    container.className = `${NS}-fa-kudos-page`;

    const h2 = document.createElement('h2');
    h2.className = 'heading';
    h2.textContent = 'My Kudos';
    container.appendChild(h2);

    const searchWrap = document.createElement('p');
    searchWrap.className = `${NS}-fa-kudos-search`;
    const searchInput = document.createElement('input');
    searchInput.type = 'search';
    searchInput.placeholder = 'Search by title, author, or fandom…';
    searchWrap.appendChild(searchInput);
    const countEl = document.createElement('span');
    countEl.className = `${NS}-fa-kudos-count`;
    searchWrap.appendChild(countEl);
    container.appendChild(searchWrap);

    const listEl = document.createElement('ol');
    listEl.className = `${NS}-fa-kudos-list work index group`;
    container.appendChild(listEl);

    searchInput.addEventListener('input', () => {
      clearTimeout(this._searchTimer);
      this._searchTimer = setTimeout(() => this._renderList(searchInput.value), 150);
    });

    root.insertBefore(container, root.firstChild);
    this._container = container;
    this._renderList('');
  }

  /* ═══════════════════════════════════════════════════════════════════════
     FEATURE LIFECYCLE
  ═══════════════════════════════════════════════════════════════════════ */

  cleanupPage () {
    clearTimeout(this._searchTimer);
    this._searchTimer = null;
    this._container?.remove();
    this._container = null;
    this._hiddenMainChildren.forEach(el => { el.style.display = ''; });
    this._hiddenMainChildren = [];
  }
}
