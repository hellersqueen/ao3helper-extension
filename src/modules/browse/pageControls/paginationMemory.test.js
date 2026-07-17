import { describe, it, expect, beforeEach } from 'vitest';
import {
  MEMORY_KEY,
  MAX_PAGES_PER_LISTING,
  MAX_LISTINGS,
  listingKey,
  recordVisit,
  getRecentPages,
  getLastPage,
} from './paginationMemory.js';

beforeEach(() => { localStorage.clear(); });

describe('listingKey', () => {
  it('identifie une liste par chemin + filtres, sans le paramètre page', () => {
    const a = listingKey('https://archiveofourown.org/tags/Fluff/works?page=3&sort=kudos');
    const b = listingKey('https://archiveofourown.org/tags/Fluff/works?sort=kudos&page=7');
    expect(a).toBe(b);
    expect(a).toBe('/tags/Fluff/works?sort=kudos');
  });

  it('distingue des filtres différents', () => {
    expect(listingKey('/works?query=a')).not.toBe(listingKey('/works?query=b'));
  });

  it('trie les paramètres pour une clé stable', () => {
    expect(listingKey('/works?b=2&a=1')).toBe(listingKey('/works?a=1&b=2'));
  });
});

describe('recordVisit / getRecentPages / getLastPage', () => {
  const KEY = '/tags/Fluff/works';

  it('mémorise les pages visitées, la plus récente en premier, sans doublon', () => {
    recordVisit(KEY, 1);
    recordVisit(KEY, 5);
    recordVisit(KEY, 9);
    recordVisit(KEY, 5); // re-visite → remonte en tête
    expect(getRecentPages(KEY)).toEqual([5, 9, 1]);
    expect(getLastPage(KEY)).toBe(5);
  });

  it('plafonne le nombre de pages par liste', () => {
    for (let p = 1; p <= 10; p++) recordVisit(KEY, p);
    expect(getRecentPages(KEY).length).toBe(MAX_PAGES_PER_LISTING);
    expect(getLastPage(KEY)).toBe(10);
  });

  it('plafonne le nombre de listes mémorisées (les plus anciennes sautent)', () => {
    for (let i = 0; i < MAX_LISTINGS + 5; i++) recordVisit(`/works?q=${i}`, 2);
    const stored = JSON.parse(localStorage.getItem(MEMORY_KEY));
    expect(Object.keys(stored).length).toBe(MAX_LISTINGS);
    expect(stored['/works?q=0']).toBeUndefined(); // la toute première a été évincée
  });

  it('ignore les numéros de page invalides', () => {
    recordVisit(KEY, NaN);
    recordVisit(KEY, 0);
    expect(getRecentPages(KEY)).toEqual([]);
    expect(getLastPage(KEY)).toBeNull();
  });

  it('résiste à un stockage corrompu', () => {
    localStorage.setItem(MEMORY_KEY, '{oops');
    expect(getRecentPages(KEY)).toEqual([]);
    recordVisit(KEY, 3); // réécrit proprement
    expect(getRecentPages(KEY)).toEqual([3]);
  });
});
