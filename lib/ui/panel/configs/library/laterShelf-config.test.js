import { describe, it, expect, beforeEach } from 'vitest';
import { config, wireConfigArea, moduleId } from './laterShelf-config.js';

function buildContainer () {
  const el = document.createElement('div');
  el.innerHTML = config;
  document.body.appendChild(el);
  return el;
}

beforeEach(() => {
  document.body.innerHTML = '';
  localStorage.clear();
  window.prompt = () => null;
  window.confirm = () => true;
  window.alert = () => {};
});

describe('moduleId', () => {
  it('est "laterShelf"', () => {
    expect(moduleId).toBe('laterShelf');
  });
});

describe('wireConfigArea — groupes', () => {
  it('liste les groupes avec leur nombre de fics', () => {
    localStorage.setItem('ao3h:laterShelf:items', JSON.stringify([
      { wid: '1', group: 'weekend reading' },
      { wid: '2', group: 'weekend reading' },
      { wid: '3', group: 'short fics' },
      { wid: '4' },
    ]));
    const c = buildContainer();
    wireConfigArea(c);
    const text = c.querySelector('#ao3h-ls-cfg-groups-list').textContent;
    expect(text).toContain('weekend reading (2)');
    expect(text).toContain('short fics (1)');
  });

  it('renomme un groupe sur toutes ses fics', () => {
    localStorage.setItem('ao3h:laterShelf:items', JSON.stringify([
      { wid: '1', group: 'old name' },
      { wid: '2', group: 'old name' },
    ]));
    window.prompt = () => 'new name';
    const c = buildContainer();
    wireConfigArea(c);
    c.querySelector('[data-action="ls-rename-group"]').click();
    const items = JSON.parse(localStorage.getItem('ao3h:laterShelf:items'));
    expect(items.every(i => i.group === 'new name')).toBe(true);
  });

  it('efface un groupe de toutes ses fics sans les retirer de l’étagère', () => {
    localStorage.setItem('ao3h:laterShelf:items', JSON.stringify([{ wid: '1', group: 'temp' }]));
    const c = buildContainer();
    wireConfigArea(c);
    c.querySelector('[data-action="ls-clear-group"]').click();
    const items = JSON.parse(localStorage.getItem('ao3h:laterShelf:items'));
    expect(items).toHaveLength(1);
    expect(items[0].group).toBe('');
  });
});

describe('wireConfigArea — archive', () => {
  it('restaure une fic archivée sur l’étagère', () => {
    localStorage.setItem('ao3h:laterShelf:archive', JSON.stringify([
      { wid: '1', title: 'Removed Fic', addedAt: 100, removedAt: 200 },
    ]));
    localStorage.setItem('ao3h:laterShelf:items', JSON.stringify([]));
    const c = buildContainer();
    wireConfigArea(c);
    c.querySelector('[data-action="ls-restore"]').click();

    const items = JSON.parse(localStorage.getItem('ao3h:laterShelf:items'));
    expect(items.map(i => i.wid)).toEqual(['1']);
    expect(JSON.parse(localStorage.getItem('ao3h:laterShelf:archive'))).toHaveLength(0);
  });

  it('supprime définitivement une entrée d’archive sans la restaurer', () => {
    localStorage.setItem('ao3h:laterShelf:archive', JSON.stringify([{ wid: '1', title: 'Gone' }]));
    localStorage.setItem('ao3h:laterShelf:items', JSON.stringify([]));
    const c = buildContainer();
    wireConfigArea(c);
    c.querySelector('[data-action="ls-forget"]').click();

    expect(JSON.parse(localStorage.getItem('ao3h:laterShelf:archive'))).toHaveLength(0);
    expect(JSON.parse(localStorage.getItem('ao3h:laterShelf:items'))).toHaveLength(0);
  });
});

describe('wireConfigArea — historique des rappels', () => {
  it('affiche les entrées d’historique les plus récentes en premier', () => {
    localStorage.setItem('ao3h:laterShelf:reminders:history', JSON.stringify([
      { wid: '1', title: 'Fic A', action: 'fired', at: 100 },
      { wid: '2', title: 'Fic B', action: 'cancelled', at: 200 },
    ]));
    const c = buildContainer();
    wireConfigArea(c);
    const text = c.querySelector('#ao3h-ls-cfg-reminder-history').textContent;
    expect(text).toContain('Fic A');
    expect(text).toContain('Fic B');
  });
});

describe('wireConfigArea — rappels de reprise', () => {
  it('propose un rappel pour un work en cours qui n’est pas sur l’étagère', () => {
    localStorage.setItem('ao3h:rt:history', JSON.stringify([
      { id: '5', title: 'In Progress Fic', chapter: 2, totalChapters: 5, href: '/works/5' },
    ]));
    localStorage.setItem('ao3h:laterShelf:items', JSON.stringify([]));
    window.prompt = () => '2026-09-01';
    const c = buildContainer();
    wireConfigArea(c);

    const btn = c.querySelector('[data-action="ls-resume-remind"]');
    expect(btn).not.toBeNull();
    btn.click();

    const reminders = JSON.parse(localStorage.getItem('ao3h:laterShelf:reminders'));
    expect(reminders['5'].title).toBe('In Progress Fic');
  });

  it('n’affiche pas un work déjà présent sur l’étagère', () => {
    localStorage.setItem('ao3h:rt:history', JSON.stringify([
      { id: '5', title: 'Already Shelved', chapter: 2, totalChapters: 5 },
    ]));
    localStorage.setItem('ao3h:laterShelf:items', JSON.stringify([{ wid: '5' }]));
    const c = buildContainer();
    wireConfigArea(c);
    expect(c.querySelector('#ao3h-ls-cfg-resume-list').textContent).toContain('Nothing in progress');
  });
});

describe('wireConfigArea — stats', () => {
  it('calcule combien de fics sauvegardées ont été lues ou abandonnées', () => {
    localStorage.setItem('ao3h:laterShelf:items', JSON.stringify([{ wid: '1' }, { wid: '2' }, { wid: '3' }]));
    localStorage.setItem('ao3h:rt:history', JSON.stringify([{ id: '1' }]));
    localStorage.setItem('ao3h:ficAppreciation:status', JSON.stringify({ 2: { status: 'dropped' } }));
    const c = buildContainer();
    wireConfigArea(c);
    const text = c.querySelector('#ao3h-ls-cfg-stats').textContent;
    expect(text).toContain('3 fics currently on the shelf');
    expect(text).toContain('1 of them (33%)');
    expect(text).toContain('1 were marked "dropped"');
  });
});
