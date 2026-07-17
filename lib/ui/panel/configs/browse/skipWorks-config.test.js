import { describe, it, expect } from 'vitest';
import { config, filterHiddenWorks, moduleId } from './skipWorks-config.js';

const WORKS = [
  { workId: '/works/80650656', title: 'Must Love Dogs', author: 'petalsonparchment', reason: 'crossover' },
  { workId: '/works/63031762', title: 'A Dream of Drowning', author: 'GardenSaint', reason: 'unfinished' },
  { workId: '/works/11112222', title: 'Old Import', reason: 'already read' },
];

describe('skipWorks-config', () => {
  it('moduleId est "skipWorks"', () => {
    expect(moduleId).toBe('skipWorks');
  });

  it('contient le réglage displayMode avec "block" coché par défaut', () => {
    const el = document.createElement('div');
    el.innerHTML = config;
    const block = el.querySelector('[data-setting="displayMode"][value="block"]');
    expect(block).not.toBeNull();
    expect(block.checked).toBe(true);
  });

  it('contient la case "confirmBeforeHide", décochée par défaut', () => {
    const el = document.createElement('div');
    el.innerHTML = config;
    const cb = el.querySelector('[data-setting="confirmBeforeHide"]');
    expect(cb).not.toBeNull();
    expect(cb.type).toBe('checkbox');
    expect(cb.checked).toBe(false);
  });

  it('contient la barre de recherche de la liste des œuvres masquées', () => {
    const el = document.createElement('div');
    el.innerHTML = config;
    expect(el.querySelector('#ao3h-skipWorks-search')).not.toBeNull();
  });
});

describe('filterHiddenWorks', () => {
  it('retourne toute la liste quand la requête est vide', () => {
    expect(filterHiddenWorks(WORKS, '')).toEqual(WORKS);
    expect(filterHiddenWorks(WORKS, '   ')).toEqual(WORKS);
    expect(filterHiddenWorks(WORKS)).toEqual(WORKS);
  });

  it('filtre par titre sans tenir compte de la casse', () => {
    expect(filterHiddenWorks(WORKS, 'must love')).toEqual([WORKS[0]]);
    expect(filterHiddenWorks(WORKS, 'MUST LOVE')).toEqual([WORKS[0]]);
  });

  it('filtre par auteur, note et identifiant', () => {
    expect(filterHiddenWorks(WORKS, 'gardensaint')).toEqual([WORKS[1]]);
    expect(filterHiddenWorks(WORKS, 'crossover')).toEqual([WORKS[0]]);
    expect(filterHiddenWorks(WORKS, '/works/63031762')).toEqual([WORKS[1]]);
    expect(filterHiddenWorks(WORKS, '63031762')).toEqual([WORKS[1]]);
  });

  it('gère les entrées historiques sans auteur ainsi que les entrées invalides', () => {
    expect(filterHiddenWorks(WORKS, 'old import')).toEqual([WORKS[2]]);
    expect(filterHiddenWorks(WORKS, 'already read')).toEqual([WORKS[2]]);
    expect(filterHiddenWorks([null, WORKS[0], undefined], 'must love')).toEqual([WORKS[0]]);
  });

  it('retourne un tableau vide sans correspondance ou avec une liste invalide', () => {
    expect(filterHiddenWorks(WORKS, 'nonexistent-xyz')).toEqual([]);
    expect(filterHiddenWorks([], 'x')).toEqual([]);
    expect(filterHiddenWorks(null, 'x')).toEqual([]);
    expect(filterHiddenWorks(undefined, 'x')).toEqual([]);
  });
});
