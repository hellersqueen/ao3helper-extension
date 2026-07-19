import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

function setMeta () {
  const meta = document.createElement('meta');
  meta.name    = 'csrf-token';
  meta.content = 'test-token';
  document.head.appendChild(meta);
}

function buildWorkPage (workId = '42') {
  history.pushState(null, '', `/works/${workId}`);
  setMeta();
  document.body.innerHTML = `
    <div class="header module"><a href="/users/testuser">testuser</a></div>
    <div id="main">
      <div id="feedback">
        <ul class="actions"></ul>
        <div id="kudos"><form id="new_kudo" action="/works/${workId}/kudos"><input type="submit" value="Kudos"></form></div>
      </div>
      <h2 class="title heading">My Fic</h2>
      <h3 class="byline heading"><a rel="author" href="/users/ficAuthor/pseuds/ficAuthor">ficAuthor</a></h3>
      <dd class="fandom tags"><a class="tag">Harry Potter</a></dd>
      <dl class="stats"><dd class="kudos">10</dd><dd class="hits">100</dd></dl>
    </div>
  `;
}

function bookmarkBlurb (workId, title) {
  return `<li class="bookmark blurb"><h4 class="heading"><a href="/works/${workId}">${title}</a></h4></li>`;
}

async function boot (settings = {}) {
  localStorage.setItem('ao3h:mod:ficAppreciation:settings', JSON.stringify(settings));
  const { setEnabled } = await import('../../../core/lifecycle.js');
  await import('./_ficAppreciation.js');
  await setEnabled('ficAppreciation', true);
  return { setEnabled };
}

async function teardown (setEnabled) {
  await setEnabled('ficAppreciation', false);
}

describe('ficAppreciation (intégration)', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = '';
    document.head.querySelectorAll('meta[name="csrf-token"]').forEach(el => el.remove());
    delete window.AO3H_Config;
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete window.AO3H_Config;
  });

  it('affiche un rappel de kudos pour une fic terminée jamais kudosée, et le retire au clic', async () => {
    buildWorkPage('42');
    localStorage.setItem('ao3h:ficAppreciation:finished', JSON.stringify({ 42: { date: '2025-01-01' } }));
    window.AO3H_Config = { ficAppreciation: { defaults: { kudosReminder: true } } };
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: true, redirected: false })));

    const { setEnabled } = await boot();
    try {
      const banner = document.getElementById('ao3h-fa-kudos-reminder');
      expect(banner).not.toBeNull();

      banner.querySelector('.ao3h-fa-kudos-reminder-btn').click();
      await vi.waitFor(() => {
        expect(document.getElementById('ao3h-fa-kudos-reminder')).toBeNull();
      });
      expect(JSON.parse(localStorage.getItem('ao3h:ficAppreciation:kudosed'))['42']).toBeDefined();
    } finally {
      await teardown(setEnabled);
    }
  });

  it('permet une note en demi-étoile quand halfStars est activé, et la retrouve dans les stats', async () => {
    buildWorkPage('43');
    window.AO3H_Config = { ficAppreciation: { defaults: { halfStars: true } } };
    const { setEnabled } = await boot();
    try {
      const widget = document.getElementById('ao3h-fa-star-widget');
      const thirdStar = widget.querySelectorAll('.ao3h-fa-star')[2];
      vi.spyOn(thirdStar, 'getBoundingClientRect').mockReturnValue(
        /** @type {DOMRect} */ ({ left: 0, width: 20, top: 0, height: 20, right: 20, bottom: 20, x: 0, y: 0, toJSON: () => ({}) })
      );
      thirdStar.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 2 }));

      expect(JSON.parse(localStorage.getItem('ao3h:ficAppreciation:ratings'))['43'].stars).toBe(2.5);
      expect(thirdStar.classList.contains('ao3h-fa-star-half')).toBe(true);
    } finally {
      await teardown(setEnabled);
    }
  });

  it('regroupe les statistiques de kudos par fandom et par auteur', async () => {
    history.pushState(null, '', '/works');
    document.body.innerHTML = '<div id="main"></div>';
    localStorage.setItem('ao3h:ficAppreciation:kudosed', JSON.stringify({
      1: { date: '2025-01-01', fandoms: ['Harry Potter'], author: 'alice' },
      2: { date: '2025-01-05', fandoms: ['Harry Potter'], author: 'bob' },
      3: { date: '2025-02-01', fandoms: ['Star Wars'], author: 'alice' },
    }));
    const { setEnabled } = await boot();
    try {
      const stats = window.AO3H.ficAppreciation.getKudosStats();
      expect(stats.byFandom[0]).toEqual({ key: 'Harry Potter', count: 2 });
      expect(stats.byAuthor.find(a => a.key === 'alice').count).toBe(2);
    } finally {
      await teardown(setEnabled);
    }
  });

  it('affiche un toast de célébration au 10e work marqué terminé', async () => {
    history.pushState(null, '', '/works');
    document.body.innerHTML = '<div id="main"></div>';
    const { setEnabled } = await boot();
    try {
      for (let i = 1; i <= 10; i++) {
        window.AO3H.ficAppreciation.markFinished(String(i));
      }
      const toast = document.querySelector('.ao3h-toast');
      expect(toast?.textContent).toContain('10');
    } finally {
      await teardown(setEnabled);
    }
  });

  it('compte les relectures et affiche un pourcentage de progression au lieu du statut plat', async () => {
    history.pushState(null, '', '/works');
    document.body.innerHTML = `
      <div id="main">
        <ol class="index group">
          <li class="work blurb group" id="work_55">
            <h4 class="heading"><a href="/works/55">A Fic</a></h4>
            <div class="stats"></div>
          </li>
        </ol>
      </div>
    `;
    window.AO3H_ReadingTracker = { getProgress: () => ({ progress: 42 }) };
    const { setEnabled } = await boot();
    try {
      const blurb = document.getElementById('work_55');
      const sel = blurb.querySelector('.ao3h-fa-status-select');
      sel.value = 'reading';
      sel.dispatchEvent(new Event('change'));

      const badge = blurb.querySelector('.ao3h-fa-badge-status');
      expect(badge.textContent).toContain('42%');

      sel.value = 're-read';
      sel.dispatchEvent(new Event('change'));
      sel.value = 're-read';
      sel.dispatchEvent(new Event('change'));

      expect(JSON.parse(localStorage.getItem('ao3h:ficAppreciation:status'))['55'].rereadCount).toBe(2);
    } finally {
      await teardown(setEnabled);
      delete window.AO3H_ReadingTracker;
    }
  });

  it('trouve, sur sa propre page Bookmarks, les works kudosés absents des favoris', async () => {
    history.pushState(null, '', '/users/testuser/bookmarks');
    document.head.innerHTML = '';
    setMeta();
    document.body.innerHTML = `
      <div class="header module"><a href="/users/testuser">testuser</a></div>
      <div id="main">
        <ol class="bookmark index group">${bookmarkBlurb(60, 'Bookmarked Fic')}</ol>
      </div>
    `;
    localStorage.setItem('ao3h:ficAppreciation:kudosed', JSON.stringify({
      60: { date: '2025-01-01' },
      61: { date: '2025-01-02' },
    }));
    const bookmarksHTML = `<html><body><ol class="bookmark index group">${bookmarkBlurb(60, 'Bookmarked Fic')}</ol></body></html>`;
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: true, text: () => Promise.resolve(bookmarksHTML) })));

    const { setEnabled } = await boot();
    try {
      const btn = document.querySelector('.ao3h-fa-bookmark-finder-btn');
      expect(btn).not.toBeNull();
      btn.click();
      await vi.waitFor(() => {
        expect(document.querySelector('.ao3h-fa-bookmark-finder-result').hidden).toBe(false);
      });
      expect(document.querySelector('.ao3h-fa-bookmark-finder-result').textContent).toContain('61');
    } finally {
      await teardown(setEnabled);
    }
  });
});
