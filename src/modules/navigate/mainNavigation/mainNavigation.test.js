import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

function buildHeader () {
  document.body.innerHTML = `
    <div id="header">
      <ul class="primary navigation">
        <li class="dropdown">
          <a href="/media" class="dropdown-toggle">Fandoms</a>
          <ul class="menu"><li><a href="/media/Books">Books</a></li><li><a href="/media/TV">TV</a></li></ul>
        </li>
        <li><a href="/works">Browse</a></li>
      </ul>
      <div id="greeting"><ul class="user navigation"><li><a href="/users/tester">Hi, tester!</a></li></ul></div>
    </div>
    <div id="main"></div>
  `;
}

// Settings for this module go through GM storage (lib/utils/config.js
// Settings.define), not the ao3h:mod:*:settings localStorage contract —
// stub GM_* with an in-memory store so tests can inject settings.
const gmStore = new Map();
function stubGM () {
  vi.stubGlobal('GM_getValue', (key, d) => gmStore.has(key) ? gmStore.get(key) : d);
  vi.stubGlobal('GM_setValue', (key, v) => { gmStore.set(key, v); });
  vi.stubGlobal('GM_deleteValue', (key) => { gmStore.delete(key); });
}

async function boot (settings = {}) {
  gmStore.set('ao3h:mod:mainNavigation:settings', settings);
  const { setEnabled } = await import('../../../core/lifecycle.js');
  await import('./_mainNavigation.js');
  await setEnabled('mainNavigation', true);
  return { setEnabled };
}

describe('mainNavigation (intégration)', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    gmStore.clear();
    stubGM();
    localStorage.setItem('AO3H:fallback_username', 'tester');
    buildHeader();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('le mode déroulant regroupe les liens rapides sous un seul menu', async () => {
    history.pushState(null, '', '/');
    const { setEnabled } = await boot({
      quickLinksEnabled: true,
      quickLinksDropdown: true,
      quickLink1Label: '⭐ Fav Tag',
      quickLink1Url: '/tags/Fluff/works',
    });
    try {
      const slot = document.querySelector('.ao3h-quick-links');
      expect(slot).not.toBeNull();
      expect(slot.classList.contains('dropdown')).toBe(true);
      expect(slot.querySelector('.dropdown-toggle').textContent).toBe('☆ Quick Links');
      expect(slot.querySelector('ul.menu a').textContent).toBe('⭐ Fav Tag');
    } finally {
      await setEnabled('mainNavigation', false);
    }
  });

  it('mémorise une page de listing puis propose "← Back to search" sur une page de work', async () => {
    history.pushState(null, '', '/tags/Fluff/works?page=3');
    const { setEnabled } = await boot({});
    await setEnabled('mainNavigation', false);

    history.pushState(null, '', '/works/123');
    buildHeader();
    await setEnabled('mainNavigation', true);
    try {
      const link = document.querySelector('.ao3h-back-to-search a');
      expect(link).not.toBeNull();
      expect(link.getAttribute('href')).toBe('/tags/Fluff/works?page=3');
    } finally {
      await setEnabled('mainNavigation', false);
    }
  });

  it('affiche un fil d’Ariane construit depuis l’URL quand le réglage est activé', async () => {
    history.pushState(null, '', '/works/123/chapters/456');
    const { setEnabled } = await boot({ breadcrumbs: true, backToSearch: false });
    try {
      const bar = document.querySelector('.ao3h-breadcrumbs');
      expect(bar).not.toBeNull();
      expect(bar.textContent).toContain('Works');
      expect(bar.textContent).toContain('Work 123');
      expect(bar.textContent).toContain('Chapter');
      expect(bar.querySelector('a[href="/works/123"]')).not.toBeNull();
    } finally {
      await setEnabled('mainNavigation', false);
    }
  });

  it('les flèches du clavier déplacent le focus entre les menus et dans un menu ouvert', async () => {
    history.pushState(null, '', '/');
    const { setEnabled } = await boot({});
    try {
      const items = document.querySelectorAll('#header .primary.navigation > li');
      const fandomsLink = items[0].querySelector(':scope > a');
      fandomsLink.focus();

      fandomsLink.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
      expect(document.activeElement.textContent).toBe('Browse');

      fandomsLink.focus();
      fandomsLink.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      expect(items[0].classList.contains('open')).toBe(true);
      expect(document.activeElement.textContent).toBe('Books');

      document.activeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      expect(items[0].classList.contains('open')).toBe(false);
    } finally {
      await setEnabled('mainNavigation', false);
    }
  });

  it("le lien Historique pointe vers le tableau de bord quand readingDashboard est activé", async () => {
    history.pushState(null, '', '/');
    const { Flags } = await import('../../../../lib/utils/config.js');
    await Flags.set('mod:readingDashboard:enabled', true);
    const { setEnabled } = await boot({ addNavLinks: true });
    try {
      const links = [...document.querySelectorAll('.ao3h-add-nav-links a')];
      const history_ = links.find(a => a.textContent.includes('History'));
      expect(history_.getAttribute('href')).toBe('/users/tester');
    } finally {
      await setEnabled('mainNavigation', false);
      await Flags.set('mod:readingDashboard:enabled', false);
    }
  });
});
