import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

function blurb ({ id, title, author = 'someAuthor', kudos = 50, words = 20000, fandoms = ['Harry Potter'], relationships = [], freeforms = [] }) {
  return `
    <li class="work blurb group" id="work_${id}">
      <h4 class="heading"><a href="/works/${id}">${title}</a></h4>
      <a rel="author" href="/users/${author}/pseuds/${author}">${author}</a>
      <ul class="fandoms tags"><li>${fandoms.map(f => `<a class="tag">${f}</a>`).join('')}</li></ul>
      <ul class="relationships tags">${relationships.map(r => `<li><a class="tag">${r}</a></li>`).join('')}</ul>
      <ul class="freeforms tags">${freeforms.map(f => `<li><a class="tag">${f}</a></li>`).join('')}</ul>
      <div class="summary"><blockquote>A summary for ${title}.</blockquote></div>
      <dl class="stats"><dd class="kudos">${kudos}</dd><dd class="words">${words}</dd></dl>
    </li>`;
}

function buildWorkPage () {
  history.pushState(null, '', '/works/1');
  document.body.innerHTML = `
    <div id="main">
      <ul class="work navigation actions"></ul>
      <dl class="work meta group">
        <dt>Rating:</dt><dd class="rating">Teen And Up Audiences</dd>
        <dt>Series:</dt><dd class="series"><a href="/series/99">My Series</a> Part 1 of 3 in <a href="/series/99">My Series</a></dd>
      </dl>
      <h3 class="byline heading"><a rel="author" href="/users/originalAuthor/pseuds/originalAuthor">originalAuthor</a></h3>
      <dd class="fandom tags"><li><a class="tag">Harry Potter</a></li></dd>
      <dd class="relationship tags"><li><a class="tag">Harry Potter/Draco Malfoy</a></li></dd>
      <dd class="freeform tags"><li><a class="tag">Angst</a></li><li><a class="tag">Fluff</a></li></dd>
      <dl class="stats"><dd class="words">20000</dd></dl>
    </div>
  `;
}

// The main "/works" search endpoint vs. "/users/{name}/works" (author) must
// be told apart by path, not substring — both contain "/works?".
function isMainWorksSearch (url) {
  try { return new URL(url).pathname === '/works'; } catch { return false; }
}

function mockGM (responses) {
  vi.stubGlobal('GM_xmlhttpRequest', (opts) => {
    let html = '<html><body></body></html>';
    if (opts.url.includes('/series/99')) html = responses.series;
    else if (opts.url.includes('/users/')) html = responses.author;
    else if (isMainWorksSearch(opts.url)) html = responses.main;
    setTimeout(() => opts.onload({ responseText: html }), 0);
    return { abort () {} };
  });
  vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: true, text: () => Promise.resolve('') })));
}

const MAIN_HTML = `<html><body><ol class="work index group">
  ${blurb({ id: 10, title: 'Pairing Match', kudos: 80, words: 21000, fandoms: ['Harry Potter'], relationships: ['Harry Potter/Draco Malfoy'] })}
  ${blurb({ id: 11, title: 'General Match', kudos: 60, words: 19500, fandoms: ['Harry Potter'], freeforms: ['Angst', 'Fluff'] })}
</ol></body></html>`;

const AUTHOR_HTML = `<html><body><ol class="work index group">
  ${blurb({ id: 20, title: 'Another by Original Author', author: 'originalAuthor' })}
</ol></body></html>`;

const SERIES_HTML = `<html><body><ol class="work index group">
  ${blurb({ id: 30, title: 'Part 2 of My Series' })}
</ol></body></html>`;

async function boot (settings = {}) {
  localStorage.setItem('ao3h:mod:similarFics:settings', JSON.stringify(settings));
  const { setEnabled } = await import('../../../core/lifecycle.js');
  await import('./similarFics.js');
  await setEnabled('similarFics', true);
  return { setEnabled };
}

async function teardown (setEnabled) {
  await setEnabled('similarFics', false);
}

describe('similarFics (intégration)', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('affiche les sections Similar Pairings, Similar Stories, More by, et More in series', async () => {
    buildWorkPage();
    mockGM({ series: SERIES_HTML, author: AUTHOR_HTML, main: MAIN_HTML });
    const { setEnabled } = await boot();
    try {
      const btn = document.querySelector('.ao3h-similar-stories-btn');
      expect(btn).not.toBeNull();
      btn.click();
      await vi.waitFor(() => {
        expect(document.querySelectorAll('.ao3h-sf-section').length).toBeGreaterThan(0);
      });
      const titles = Array.from(document.querySelectorAll('.ao3h-sf-section-title')).map(t => t.textContent);
      expect(titles.some(t => t.includes('My Series'))).toBe(true);
      expect(titles).toContain('Similar Pairings');
      expect(titles).toContain('Similar Stories');
      expect(titles.some(t => t.startsWith('More by'))).toBe(true);
    } finally {
      await teardown(setEnabled);
    }
    expect(document.querySelector('.ao3h-similar-stories-btn')).toBeNull();
  });

  it('exclut les œuvres marquées "pas intéressé" et retient ce choix après réouverture', async () => {
    buildWorkPage();
    mockGM({ series: SERIES_HTML, author: AUTHOR_HTML, main: MAIN_HTML });
    const { setEnabled } = await boot({ cacheResults: false });
    try {
      document.querySelector('.ao3h-similar-stories-btn').click();
      await vi.waitFor(() => {
        expect(document.querySelector('.ao3h-sf-work-title')).not.toBeNull();
      });
      const firstCard = document.querySelector('.ao3h-sf-card');
      const titleLink = firstCard.querySelector('.ao3h-sf-work-title');
      const dismissedTitle = titleLink.textContent;
      const dismissedId = titleLink.getAttribute('href').match(/\/works\/(\d+)/)[1];
      firstCard.querySelector('.ao3h-sf-dismiss-btn').click();
      expect(firstCard.isConnected).toBe(false);
      expect(JSON.parse(localStorage.getItem('ao3h:sf:dismissed'))).toContain(dismissedId);
      // Re-open: dismissed work must not reappear.
      const btn = document.querySelector('.ao3h-similar-stories-btn');
      btn.click(); // close
      btn.click(); // reopen
      await vi.waitFor(() => {
        const remainingTitles = Array.from(document.querySelectorAll('.ao3h-sf-work-title')).map(t => t.textContent);
        expect(remainingTitles).not.toContain(dismissedTitle);
      });
    } finally {
      await teardown(setEnabled);
    }
  });

  it('exclut les WIP par défaut (includeWIP désactivé) et le reflète dans la requête envoyée', async () => {
    buildWorkPage();
    let capturedUrl = null;
    vi.stubGlobal('GM_xmlhttpRequest', (opts) => {
      let html = '<html><body></body></html>';
      if (opts.url.includes('/series/99')) html = SERIES_HTML;
      else if (opts.url.includes('/users/')) html = AUTHOR_HTML;
      else if (isMainWorksSearch(opts.url)) { html = MAIN_HTML; capturedUrl = opts.url; }
      setTimeout(() => opts.onload({ responseText: html }), 0);
      return { abort () {} };
    });
    const { setEnabled } = await boot();
    try {
      document.querySelector('.ao3h-similar-stories-btn').click();
      await vi.waitFor(() => expect(capturedUrl).not.toBeNull());
      expect(decodeURIComponent(capturedUrl)).toContain('work_search[complete]=T');
    } finally {
      await teardown(setEnabled);
    }
  });

  it('limite les résultats selon numResults', async () => {
    buildWorkPage();
    const manyBlurbs = Array.from({ length: 8 }, (_, i) =>
      blurb({ id: 100 + i, title: `General ${i}`, kudos: 90 - i, words: 20000, fandoms: ['Harry Potter'], freeforms: ['Angst', 'Fluff'] })
    ).join('');
    mockGM({ series: SERIES_HTML, author: AUTHOR_HTML, main: `<html><body><ol class="work index group">${manyBlurbs}</ol></body></html>` });
    const { setEnabled } = await boot({ numResults: '5' });
    try {
      document.querySelector('.ao3h-similar-stories-btn').click();
      await vi.waitFor(() => {
        expect(document.querySelectorAll('.ao3h-sf-card').length).toBeGreaterThan(0);
      });
      const generalSection = Array.from(document.querySelectorAll('.ao3h-sf-section')).find(s => s.querySelector('.ao3h-sf-section-title').textContent === 'Similar Stories');
      expect(generalSection.querySelectorAll('.ao3h-sf-card').length).toBeLessThanOrEqual(5);
    } finally {
      await teardown(setEnabled);
    }
  });

  it('retire un critère de recherche au clic sur son ✕ et relance la recherche sans lui', async () => {
    buildWorkPage();
    const urls = [];
    vi.stubGlobal('GM_xmlhttpRequest', (opts) => {
      let html = '<html><body></body></html>';
      if (opts.url.includes('/series/99')) html = SERIES_HTML;
      else if (opts.url.includes('/users/')) html = AUTHOR_HTML;
      else if (isMainWorksSearch(opts.url)) { html = MAIN_HTML; urls.push(opts.url); }
      setTimeout(() => opts.onload({ responseText: html }), 0);
      return { abort () {} };
    });
    const { setEnabled } = await boot({ cacheResults: false });
    try {
      document.querySelector('.ao3h-similar-stories-btn').click();
      await vi.waitFor(() => expect(document.querySelector('.ao3h-sf-criteria-chip')).not.toBeNull());
      expect(urls.length).toBe(1);

      const fandomChip = Array.from(document.querySelectorAll('.ao3h-sf-criteria-chip'))
        .find(c => c.textContent.includes('Harry Potter') && !c.textContent.includes('/'));
      fandomChip.querySelector('.ao3h-sf-criteria-remove').click();

      await vi.waitFor(() => expect(urls.length).toBe(2));
      expect(decodeURIComponent(urls[1])).not.toContain('tag_id=Harry+Potter');
    } finally {
      await teardown(setEnabled);
    }
  });
});
