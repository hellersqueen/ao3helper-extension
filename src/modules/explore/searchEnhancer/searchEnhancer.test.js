import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

function makeBlurb ({ id, kudos, hits, bookmarks, chapters = '1/1', updated = null, series = null }) {
  return `
    <li class="work blurb group" id="work_${id}">
      <h4 class="heading"><a href="/works/${id}">Work ${id}</a></h4>
      ${series ? `<ul class="series"><li>Part of <a href="/series/${series.id}">${series.label}</a></li></ul>` : ''}
      <p class="datetime">${updated ? `<abbr class="datetime" title="${updated}">${updated}</abbr>` : ''}</p>
      <dl class="stats">
        <dt>Chapters:</dt><dd class="chapters">${chapters}</dd>
        <dt>Kudos:</dt><dd class="kudos">${kudos}</dd>
        <dt>Hits:</dt><dd class="hits">${hits}</dd>
        <dt>Bookmarks:</dt><dd class="bookmarks">${bookmarks}</dd>
      </dl>
    </li>`;
}

function buildSearchResultsPage (blurbsHtml, { query = 'time travel' } = {}) {
  history.pushState(null, '', `/works/search?work_search%5Bquery%5D=${encodeURIComponent(query)}`);
  document.body.innerHTML = `
    <div id="main">
      <h3 class="heading">Works</h3>
      <form id="work-search">
        <input type="text" name="work_search[query]" id="work_search_query" value="${query}">
        <input type="text" name="work_search[fandom_names]" id="work_search_fandom_names" value="Harry Potter">
      </form>
      <ol class="work index group">${blurbsHtml.join('')}</ol>
    </div>
  `;
}

async function boot (settings = {}) {
  localStorage.setItem('ao3h:mod:searchEnhancer:settings', JSON.stringify(settings));
  const { setEnabled } = await import('../../../core/lifecycle.js');
  await import('./_searchEnhancer.js');
  await setEnabled('searchEnhancer', true);
  await setEnabled('relatedSearches', true);
  await setEnabled('searchAutocomplete', true);
  await setEnabled('resultsSorting', true);
  await setEnabled('seriesGrouping', true);
  return { setEnabled };
}

async function teardown (setEnabled) {
  await setEnabled('seriesGrouping', false);
  await setEnabled('resultsSorting', false);
  await setEnabled('searchAutocomplete', false);
  await setEnabled('relatedSearches', false);
  await setEnabled('searchEnhancer', false);
}

describe('searchEnhancer (intégration)', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('propose les nouveaux modes de tri et trie par kudos par chapitre', async () => {
    buildSearchResultsPage([
      makeBlurb({ id: 1, kudos: 100, hits: 1000, bookmarks: 10, chapters: '10/10' }), // 10/chapter
      makeBlurb({ id: 2, kudos: 90, hits: 900, bookmarks: 9, chapters: '1/1' }),       // 90/chapter
    ]);
    const { setEnabled } = await boot();
    try {
      const select = document.querySelector('.ao3h-se-sort-select');
      const values = Array.from(select.options).map(o => o.value);
      expect(values).toEqual(expect.arrayContaining(['kudos_per_chapter', 'recent', 'balanced']));

      select.value = 'kudos_per_chapter';
      document.querySelector('.ao3h-se-sort-apply').click();

      const order = Array.from(document.querySelectorAll('li.work.blurb')).map(b => b.id);
      expect(order).toEqual(['work_2', 'work_1']);
    } finally {
      await teardown(setEnabled);
    }
  });

  it('affiche des modèles de recherche rapide qui conservent les filtres actuels', async () => {
    buildSearchResultsPage([makeBlurb({ id: 1, kudos: 5, hits: 50, bookmarks: 1 })]);
    const { setEnabled } = await boot();
    try {
      const templates = document.querySelectorAll('.ao3h-se-template-pill');
      expect(templates.length).toBeGreaterThan(0);
      const kudosTemplate = Array.from(templates).find(a => a.textContent.includes('Most kudos'));
      const url = new URL(kudosTemplate.href);
      expect(url.searchParams.get('work_search[query]')).toBe('time travel');
      expect(url.searchParams.get('work_search[sort_column]')).toBe('kudos_count');
    } finally {
      await teardown(setEnabled);
    }
  });

  it('affiche une astuce d’affinage quand la recherche ne renvoie aucun résultat', async () => {
    buildSearchResultsPage([]);
    const { setEnabled } = await boot();
    try {
      const tip = document.querySelector('.ao3h-se-tip');
      expect(tip?.textContent).toMatch(/broaden/);
    } finally {
      await teardown(setEnabled);
    }
  });

  it('affiche les statistiques de recherche personnelles quand l’historique est suffisant', async () => {
    localStorage.setItem('ao3h:se:history', JSON.stringify([
      { query: 'fix-it', ts: Date.now(), fandom: 'Harry Potter' },
      { query: 'fix-it', ts: Date.now() - 1000, fandom: 'Harry Potter' },
      { query: 'angst', ts: Date.now() - 2000, fandom: 'Marvel' },
    ]));
    buildSearchResultsPage([makeBlurb({ id: 1, kudos: 5, hits: 50, bookmarks: 1 })]);
    const { setEnabled } = await boot();
    try {
      const insights = document.querySelector('.ao3h-se-related-panel');
      expect(insights.textContent).toContain('fix-it (2×)');
      expect(document.querySelector('.ao3h-se-fandom-bar-label').textContent).toBe('Harry Potter');
    } finally {
      await teardown(setEnabled);
    }
  });

  it('tolère une faute de frappe dans la recherche de l’historique', async () => {
    localStorage.setItem('ao3h:se:history', JSON.stringify([
      { query: 'enemies to lovers', ts: Date.now() },
    ]));
    buildSearchResultsPage([makeBlurb({ id: 1, kudos: 5, hits: 50, bookmarks: 1 })]);
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve([]) })));
    const { setEnabled } = await boot();
    try {
      const input = /** @type {HTMLInputElement} */ (document.getElementById('work_search_query'));
      input.value = 'enemis'; // faute de frappe
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await vi.waitFor(() => {
        expect(document.querySelector(`.ao3h-se-ac-query`)?.textContent).toBe('enemies to lovers');
      });
    } finally {
      await teardown(setEnabled);
    }
  });

  it('fusionne les suggestions de tags AO3 dans le menu déroulant', async () => {
    buildSearchResultsPage([makeBlurb({ id: 1, kudos: 5, hits: 50, bookmarks: 1 })]);
    vi.stubGlobal('fetch', vi.fn((url) => {
      expect(String(url)).toContain('/autocomplete/tag?term=slow');
      return Promise.resolve({ ok: true, json: () => Promise.resolve([{ id: '1', name: 'Slow Burn (45,000)', type: 'Freeform' }]) });
    }));
    const { setEnabled } = await boot();
    try {
      const input = /** @type {HTMLInputElement} */ (document.getElementById('work_search_query'));
      input.value = 'slow';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await vi.waitFor(() => {
        const tagItem = document.querySelector('.ao3h-se-ac-tag-item .ao3h-se-ac-query');
        expect(tagItem?.textContent).toBe('Slow Burn');
      });
    } finally {
      await teardown(setEnabled);
    }
  });

  it('regroupe les séries et trie par historique de lecture réel', async () => {
    localStorage.setItem('ao3h:rt:history', JSON.stringify([{ id: '21' }, { id: '22' }]));
    buildSearchResultsPage([
      makeBlurb({ id: 1, kudos: 1, hits: 10, bookmarks: 1, series: { id: 's1', label: 'Barely Read Series' } }),
      makeBlurb({ id: 2, kudos: 1, hits: 10, bookmarks: 1, series: { id: 's1', label: 'Barely Read Series' } }),
      makeBlurb({ id: 21, kudos: 1, hits: 10, bookmarks: 1, series: { id: 's2', label: 'Fully Read Series' } }),
      makeBlurb({ id: 22, kudos: 1, hits: 10, bookmarks: 1, series: { id: 's2', label: 'Fully Read Series' } }),
    ], { query: 'x' });
    // seriesGrouping only activates on bare /works or /tags/*/works listings,
    // not /works/search — switch the URL for this test accordingly.
    history.pushState(null, '', '/works');
    const { setEnabled } = await boot({ groupSeriesInResults: true, fandomSortMode: 'history' });
    try {
      const groups = document.querySelectorAll('.ao3h-se-series-group');
      expect(groups.length).toBe(2);
      // The series with real reading history (work_21/work_22) sorts first.
      expect(groups[0].querySelector('#work_21')).not.toBeNull();
      expect(groups[1].querySelector('#work_1')).not.toBeNull();
    } finally {
      await teardown(setEnabled);
    }
  });
});
