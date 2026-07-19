import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

function blurb ({ id, title = `Work ${id}`, chapters = '1/1', fandoms = ['Harry Potter'], subscribed = false }) {
  return `
    <li class="work blurb group" id="work_${id}">
      <h4 class="heading"><a href="/works/${id}">${title}</a></h4>
      <h6 class="fandoms heading">${fandoms.map(f => `<a class="tag">${f}</a>`).join('')}</h6>
      <ul class="tags">
        ${subscribed ? `<li><a data-method="delete" href="/subscriptions/99">Unsubscribe</a></li>` : ''}
      </ul>
      <div class="stats">
        <dd class="chapters">${chapters}</dd>
        <dd class="kudos">10</dd>
        <dd class="hits">1000</dd>
      </div>
    </li>`;
}

function buildListingPage (blurbsHtml) {
  history.pushState(null, '', '/works');
  document.body.innerHTML = `
    <div id="main">
      <form id="work-filters" action="/works">
        <fieldset>
          <dl>
            <dt class="sort"></dt>
            <dd class="sort"></dd>
          </dl>
        </fieldset>
        <input type="text" name="work_search[other_tag_names]" value="">
        <input type="submit" value="Sort and Filter">
      </form>
      <ol class="work index group">${blurbsHtml}</ol>
    </div>
  `;
}

async function boot (settings = {}) {
  localStorage.setItem('ao3h:mod:filterManager:settings', JSON.stringify(settings));
  const { setEnabled } = await import('../../../core/lifecycle.js');
  await import('./_filterManager.js');
  await setEnabled('filterManager', true);
  return { setEnabled };
}

async function teardown (setEnabled) {
  await setEnabled('filterManager', false);
}

describe('filterManager (intégration)', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // Must run first: _filterManager.js reads location.search into a module-level
  // const at import time (once, ever, per test-file run — dynamic imports are
  // cached), so this is the only test able to see a query string.
  it('ferme définitivement la bannière d’exclusion d’avertissement via "Don\'t show again"', async () => {
    buildListingPage(blurb({ id: 1 }));
    const qs = new URLSearchParams();
    qs.append('work_search[excluded_tag_names][]', 'Major Character Death');
    history.pushState(null, '', `/works?${qs.toString()}`);
    let { setEnabled } = await boot({ warnExcludedWarning: true });
    try {
      const banner = document.getElementById('ao3h-fm-warning-banner');
      expect(banner).not.toBeNull();
      banner.querySelector('.ao3h-fm-warn-dismiss-forever').click();
      expect(localStorage.getItem('ao3h:filterManager:warningBannerDismissed')).toBe('true');
    } finally {
      await teardown(setEnabled);
    }

    ({ setEnabled } = await boot({ warnExcludedWarning: true }));
    try {
      expect(document.getElementById('ao3h-fm-warning-banner')).toBeNull();
    } finally {
      await teardown(setEnabled);
    }
  });

  it('fait cycler le filtre one-shot sur trois états (tout / seulement / cacher)', async () => {
    buildListingPage(blurb({ id: 1, chapters: '1/1' }) + blurb({ id: 2, chapters: '3/5' }));
    const { setEnabled } = await boot();
    try {
      const btn = document.querySelector('.ao3h-fm-quick-btn');
      expect(btn.textContent).toContain('All');

      btn.click();
      expect(btn.textContent).toContain('Only');
      expect(document.documentElement.classList.contains('ao3h-fm-oneshot-only')).toBe(true);

      btn.click();
      expect(btn.textContent).toContain('Hide');
      expect(document.documentElement.classList.contains('ao3h-fm-oneshot-only')).toBe(false);
      expect(document.documentElement.classList.contains('ao3h-fm-oneshot-hide')).toBe(true);

      btn.click();
      expect(btn.textContent).toContain('All');
      expect(document.documentElement.classList.contains('ao3h-fm-oneshot-hide')).toBe(false);
    } finally {
      await teardown(setEnabled);
    }
  });

  it('cache une œuvre individuellement au clic sur "✕", et retient ce choix après réactivation', async () => {
    buildListingPage(blurb({ id: 10 }));
    let boot1 = await boot();
    try {
      const hideBtn = document.querySelector('.ao3h-fm-hide-btn');
      expect(hideBtn).not.toBeNull();
      hideBtn.click();
      expect(document.getElementById('work_10').dataset.fmManualHidden).toBe('1');
      expect(JSON.parse(localStorage.getItem('ao3h:filterManager:manualHidden'))).toContain('10');
    } finally {
      await teardown(boot1.setEnabled);
    }

    buildListingPage(blurb({ id: 10 }));
    boot1 = await boot();
    try {
      expect(document.getElementById('work_10').dataset.fmManualHidden).toBe('1');
    } finally {
      await teardown(boot1.setEnabled);
    }
  });

  it('renomme un preset existant', async () => {
    localStorage.setItem('ao3h:filterManager:presets', JSON.stringify([
      { id: 'p1', name: 'Old Name', starred: false, fandom: null, createdAt: 1, filters: {} },
    ]));
    buildListingPage(blurb({ id: 1 }));
    vi.stubGlobal('prompt', vi.fn(() => 'New Name'));
    const { setEnabled } = await boot();
    try {
      document.querySelector('.ao3h-preset-current').click();
      document.querySelector('.ao3h-preset-rename').click();
      expect(JSON.parse(localStorage.getItem('ao3h:filterManager:presets'))[0].name).toBe('New Name');
    } finally {
      await teardown(setEnabled);
    }
  });

  it('fusionne deux presets en unissant leurs tags multi-valeurs', async () => {
    localStorage.setItem('ao3h:filterManager:presets', JSON.stringify([
      { id: 'a', name: 'Fluffy', starred: false, fandom: null, createdAt: 1, filters: { 'work_search[other_tag_names]': 'Fluff' } },
      { id: 'b', name: 'Angsty', starred: false, fandom: null, createdAt: 2, filters: { 'work_search[other_tag_names]': 'Angst' } },
    ]));
    buildListingPage(blurb({ id: 1 }));
    const prompts = ['Fluffy', 'Angsty'];
    vi.stubGlobal('prompt', vi.fn(() => prompts.shift()));
    const { setEnabled } = await boot();
    try {
      document.querySelector('.ao3h-preset-current').click();
      document.querySelector('.ao3h-preset-merge').click();
      const presets = JSON.parse(localStorage.getItem('ao3h:filterManager:presets'));
      const merged = presets.find(p => p.name === 'Fluffy + Angsty');
      expect(merged).toBeDefined();
      expect(merged.filters['work_search[other_tag_names]']).toBe('Fluff, Angst');
    } finally {
      await teardown(setEnabled);
    }
  });

  it('capture automatiquement une recherche dans l’historique récent, et la restaure au clic', async () => {
    buildListingPage(blurb({ id: 1 }));
    const { setEnabled } = await boot({ searchHistoryEnabled: true });
    try {
      const input = document.querySelector('[name="work_search[other_tag_names]"]');
      input.value = 'Hurt/Comfort';
      document.getElementById('work-filters').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

      const history = JSON.parse(localStorage.getItem('ao3h:filterManager:searchHistory'));
      expect(history[0].filters['work_search[other_tag_names]']).toBe('Hurt/Comfort');

      input.value = '';
      document.querySelector('.ao3h-preset-recent').click();
      document.querySelector('.ao3h-recent-dropdown .ao3h-preset-item').click();
      expect(input.value).toBe('Hurt/Comfort');
    } finally {
      await teardown(setEnabled);
    }
  });

  it('corrige les dépendances mortes : hideKudosed/hideBookmarked/hideMFL utilisent les vraies APIs', async () => {
    buildListingPage(
      blurb({ id: 21 }) + blurb({ id: 22 }) + blurb({ id: 23 }) + blurb({ id: 24 })
    );
    window.AO3H = window.AO3H || {};
    window.AO3H.ficAppreciation = { hasGivenKudos: (id) => id === '21' };
    localStorage.setItem('ao3h:bookmarkVault:data', JSON.stringify({ 22: {} }));
    window.AO3H_LaterShelf = { loadItems: () => [{ wid: '23', title: 'x', addedAt: 1 }] };

    const { setEnabled } = await boot({ hideKudosed: true, hideBookmarked: true, hideMFL: true });
    try {
      expect(document.getElementById('work_21').classList.contains('ao3h-fm-history-hidden')).toBe(true);
      expect(document.getElementById('work_22').classList.contains('ao3h-fm-history-hidden')).toBe(true);
      expect(document.getElementById('work_23').classList.contains('ao3h-fm-history-hidden')).toBe(true);
      expect(document.getElementById('work_24').classList.contains('ao3h-fm-history-hidden')).toBe(false);
    } finally {
      await teardown(setEnabled);
      delete window.AO3H.ficAppreciation;
      delete window.AO3H_LaterShelf;
    }
  });

  it('atténue au lieu de cacher quand historyFilterMode vaut "dim", et permet un aperçu par catégorie', async () => {
    buildListingPage(blurb({ id: 30 }));
    window.AO3H = window.AO3H || {};
    window.AO3H.ficAppreciation = { hasGivenKudos: () => true };
    const { setEnabled } = await boot({ hideKudosed: true, historyFilterMode: 'dim' });
    try {
      const el = document.getElementById('work_30');
      expect(el.classList.contains('ao3h-fm-history-dimmed')).toBe(true);
      expect(el.classList.contains('ao3h-fm-history-hidden')).toBe(false);

      const peekBtn = document.querySelector('.ao3h-fm-peek-btn');
      expect(peekBtn).not.toBeNull();
      peekBtn.click();
      expect(document.documentElement.classList.contains('ao3h-fm-peek-kudosed')).toBe(true);
    } finally {
      await teardown(setEnabled);
      delete window.AO3H.ficAppreciation;
    }
  });

});
