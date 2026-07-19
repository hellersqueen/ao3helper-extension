import { describe, it, expect, beforeEach } from 'vitest';
import { config, wireConfigArea, moduleId } from './readingTracker-config.js';

function buildContainer () {
  const el = document.createElement('div');
  el.innerHTML = config;
  document.body.appendChild(el);
  return el;
}

function seedHistory (entries) {
  localStorage.setItem('ao3h:rt:history', JSON.stringify(entries));
}

beforeEach(() => {
  document.body.innerHTML = '';
  localStorage.clear();
});

describe('moduleId', () => {
  it('est "readingTracker"', () => {
    expect(moduleId).toBe('readingTracker');
  });
});

describe('wireConfigArea — historique navigable', () => {
  it('affiche la liste de l’historique, groupée par période', () => {
    const now = Date.now();
    seedHistory([{ id: '1', title: 'Read Today', lastReadAt: now }]);
    const c = buildContainer();
    wireConfigArea(c);

    const entries = c.querySelectorAll('.ao3h-rt-history-entry');
    expect(entries.length).toBe(1);
    expect(entries[0].textContent).toContain('Read Today');
    expect(c.querySelector('.ao3h-rt-history-group-label').textContent).toBe('Today');
  });

  it('filtre par recherche sur le titre ou l’auteur', () => {
    seedHistory([
      { id: '1', title: 'Moonlight Sonata', author: 'alice', lastReadAt: Date.now() },
      { id: '2', title: 'Sunrise', author: 'bob', lastReadAt: Date.now() },
    ]);
    const c = buildContainer();
    wireConfigArea(c);

    const search = c.querySelector('#ao3h-rt-search');
    search.value = 'moon';
    search.dispatchEvent(new Event('input', { bubbles: true }));

    const entries = c.querySelectorAll('.ao3h-rt-history-entry');
    expect(entries.length).toBe(1);
    expect(entries[0].textContent).toContain('Moonlight Sonata');
  });

  it('épingle une entrée au clic sur l’étoile, et la remonte en premier', () => {
    seedHistory([
      { id: '1', title: 'Old One', lastReadAt: 100 },
      { id: '2', title: 'New One', lastReadAt: 200 },
    ]);
    const c = buildContainer();
    wireConfigArea(c);

    // Group-by-period defaults to checked; disable it to get a single flat, sorted list.
    const groupCb = c.querySelector('#ao3h-rt-group-period');
    groupCb.checked = false;
    groupCb.dispatchEvent(new Event('change', { bubbles: true }));

    const pinBtn = c.querySelector('.ao3h-rt-history-entry[data-id="1"] .ao3h-rt-pin-btn');
    pinBtn.click();

    const saved = JSON.parse(localStorage.getItem('ao3h:rt:history'));
    expect(saved.find(e => e.id === '1').pinned).toBe(true);

    const firstEntry = c.querySelector('.ao3h-rt-history-entry');
    expect(firstEntry.dataset.id).toBe('1');
  });

  it('supprime une entrée au clic sur "✕"', () => {
    seedHistory([{ id: '1', title: 'To Delete', lastReadAt: Date.now() }]);
    const c = buildContainer();
    wireConfigArea(c);

    c.querySelector('.ao3h-rt-delete-btn').click();

    expect(JSON.parse(localStorage.getItem('ao3h:rt:history'))).toHaveLength(0);
    expect(c.querySelectorAll('.ao3h-rt-history-entry')).toHaveLength(0);
  });

  it('nettoie les entrées plus vieilles que N jours, en gardant les épinglées', () => {
    const now = Date.now();
    seedHistory([
      { id: '1', title: 'Ancient', lastReadAt: now - 100 * 86400000 },
      { id: '2', title: 'Ancient but pinned', lastReadAt: now - 100 * 86400000, pinned: true },
      { id: '3', title: 'Recent', lastReadAt: now },
    ]);
    const c = buildContainer();
    wireConfigArea(c);
    window.alert = () => {};

    c.querySelector('#ao3h-rt-cleanup-days').value = '30';
    c.querySelector('[data-action="rt-cleanup"]').click();

    const saved = JSON.parse(localStorage.getItem('ao3h:rt:history'));
    expect(saved.map(e => e.id).sort()).toEqual(['2', '3']);
  });
});

describe('wireConfigArea — exclusions de confidentialité', () => {
  it('ajoute un ID de work ou un fandom à la liste d’exclusion', () => {
    const c = buildContainer();
    wireConfigArea(c);

    const input = c.querySelector('#ao3h-rt-exclude-input');
    input.value = '12345';
    c.querySelector('[data-action="rt-add-exclusion"]').click();

    input.value = 'Some Fandom';
    c.querySelector('[data-action="rt-add-exclusion"]').click();

    const saved = JSON.parse(localStorage.getItem('ao3h:rt:excludedWorks'));
    expect(saved).toEqual(['12345', 'fandom:Some Fandom']);
    expect(c.querySelectorAll('#ao3h-rt-exclusion-list li').length).toBe(2);
  });
});
