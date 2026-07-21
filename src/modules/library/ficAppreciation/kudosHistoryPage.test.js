import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { KudosHistoryPage } from './kudosHistoryPage.js';

function makeKef (entries = []) {
  return {
    getHistory: vi.fn(({ query = '' } = {}) => {
      const q = query.trim().toLowerCase();
      if (!q) return entries;
      return entries.filter(e =>
        (e.title || '').toLowerCase().includes(q) ||
        (e.author || '').toLowerCase().includes(q) ||
        (e.fandoms || []).some(f => f.toLowerCase().includes(q))
      );
    }),
    getStats: vi.fn(() => ({ total: entries.length })),
  };
}

function makePage (entries = [], cfg = () => undefined) {
  return new KudosHistoryPage({ NS: 'ao3h', cfg, kef: makeKef(entries) });
}

describe('KudosHistoryPage — points d\'entrée (liens)', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('injectNavLink() ajoute un lien dans la nav AO3, idempotent', () => {
    document.body.innerHTML = `
      <div id="header"><ul class="primary navigation"></ul></div>
      <a href="/users/testuser">testuser</a>
    `;
    const page = makePage();
    page.injectNavLink();
    page.injectNavLink();

    const links = document.querySelectorAll('.ao3h-fa-kudos-nav-link');
    expect(links.length).toBe(1);
    expect(links[0].querySelector('a').href).toContain('/users/testuser/kudos-history');
  });

  it('injectNavLink() ne fait rien sans utilisateur connecté', () => {
    document.body.innerHTML = `<div id="header"><ul class="primary navigation"></ul></div>`;
    makePage().injectNavLink();
    expect(document.querySelector('.ao3h-fa-kudos-nav-link')).toBeNull();
  });

  it('injectDashboardLink() insère "Kudos (N)" juste après "History" dans la sidebar Dashboard', () => {
    document.body.innerHTML = `
      <a href="/users/testuser">testuser</a>
      <div id="dashboard" class="region own">
        <ul class="navigation actions">
          <li><a href="/users/testuser/inbox">Inbox (6)</a></li>
          <li><a href="/users/testuser/readings">History</a></li>
          <li><a href="/users/testuser/subscriptions">Subscriptions</a></li>
        </ul>
      </div>
    `;
    const page = makePage([{ workId: '1' }, { workId: '2' }, { workId: '3' }]);
    page.injectDashboardLink();

    const historyLi = document.querySelector('a[href*="/readings"]').closest('li');
    const inserted  = historyLi.nextElementSibling;
    expect(inserted.className).toBe('ao3h-fa-kudos-dashboard-link');
    expect(inserted.textContent).toBe('Kudos (3)');
    expect(inserted.querySelector('a').href).toContain('/users/testuser/kudos-history');
  });

  it('injectDashboardLink() ne fait rien si la sidebar Dashboard est absente (autre page)', () => {
    document.body.innerHTML = `<a href="/users/testuser">testuser</a><div id="main"></div>`;
    makePage().injectDashboardLink();
    expect(document.querySelector('.ao3h-fa-kudos-dashboard-link')).toBeNull();
  });

  it('removeLinks() retire les deux liens', () => {
    document.body.innerHTML = `
      <a href="/users/testuser">testuser</a>
      <div id="header"><ul class="primary navigation"></ul></div>
      <div id="dashboard" class="region own">
        <ul class="navigation actions"><li><a href="/users/testuser/readings">History</a></li></ul>
      </div>
    `;
    const page = makePage();
    page.injectNavLink();
    page.injectDashboardLink();
    page.removeLinks();

    expect(document.querySelector('.ao3h-fa-kudos-nav-link')).toBeNull();
    expect(document.querySelector('.ao3h-fa-kudos-dashboard-link')).toBeNull();
  });
});

describe('KudosHistoryPage — rendu de la page', () => {
  beforeEach(() => {
    document.body.innerHTML = `<div id="main"><p id="original">404 Not Found</p></div>`;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('construit la liste depuis kef.getHistory(), avec les classes AO3 natives', () => {
    const page = makePage([
      { workId: '10', title: 'Fic One', author: 'alice', date: '2025-01-01', fandoms: ['Harry Potter'] },
      { workId: '11', title: 'Fic Two', author: 'bob', date: '2025-02-01' },
    ]);
    page.render();

    const entries = document.querySelectorAll('.ao3h-fa-kudos-list li.work.blurb.group');
    expect(entries.length).toBe(2);
    expect(entries[0].querySelector('a').getAttribute('href')).toBe('/works/10');
    expect(entries[0].textContent).toContain('Fic One');
    expect(entries[0].textContent).toContain('alice');
    expect(entries[0].querySelector('.fandoms')?.textContent).toContain('Harry Potter');
    expect(document.querySelector('.ao3h-fa-kudos-count').textContent).toContain('2 kudosed works');
  });

  it('masque (sans le supprimer) le contenu original de #main', () => {
    const page = makePage();
    page.render();
    expect(document.getElementById('original').style.display).toBe('none');
    expect(document.getElementById('original').isConnected).toBe(true);
  });

  it('affiche un état vide quand aucune fic kudosée', () => {
    makePage([]).render();
    const empty = document.querySelector('.ao3h-fa-kudos-empty');
    expect(empty?.textContent).toContain("haven't kudosed anything yet");
  });

  it('la recherche (debounced) filtre la liste via kef.getHistory({query})', async () => {
    vi.useFakeTimers();
    const page = makePage([
      { workId: '1', title: 'Alpha', author: 'a' },
      { workId: '2', title: 'Beta', author: 'b' },
    ]);
    page.render();

    const input = document.querySelector('.ao3h-fa-kudos-search input');
    input.value = 'Alpha';
    input.dispatchEvent(new Event('input'));
    await vi.advanceTimersByTimeAsync(200);

    const entries = document.querySelectorAll('.ao3h-fa-kudos-list li.work.blurb.group');
    expect(entries.length).toBe(1);
    expect(entries[0].textContent).toContain('Alpha');
  });

  it('coupe l\'affichage à 300 entrées avec un message plutôt que tout injecter', () => {
    const many = Array.from({ length: 301 }, (_, i) => ({ workId: String(i), title: `Fic ${i}`, author: 'x' }));
    makePage(many).render();

    expect(document.querySelectorAll('.ao3h-fa-kudos-list li.work.blurb.group').length).toBe(300);
    expect(document.querySelector('.ao3h-fa-kudos-count').textContent).toContain('Showing 300 of 301');
  });

  it('cleanupPage() retire le conteneur et restaure le contenu original', () => {
    const page = makePage();
    page.render();
    page.cleanupPage();

    expect(document.querySelector('.ao3h-fa-kudos-page')).toBeNull();
    expect(document.getElementById('original').style.display).toBe('');
  });
});
