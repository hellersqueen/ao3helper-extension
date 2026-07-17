import { describe, it, expect } from 'vitest';
import { parseStatNumber, getBlurbStats, getWorkPageStats } from './work-stats.js';

describe('parseStatNumber', () => {
  it('parse un nombre simple depuis un texte', () => {
    expect(parseStatNumber('123')).toBe(123);
  });

  it('retire les virgules des grands nombres', () => {
    expect(parseStatNumber('1,234')).toBe(1234);
  });

  it('lit le textContent d\'un nœud', () => {
    const dd = document.createElement('dd');
    dd.textContent = '4,567';
    expect(parseStatNumber(dd)).toBe(4567);
  });

  it('retourne null pour une source vide ou illisible', () => {
    expect(parseStatNumber(null)).toBeNull();
    expect(parseStatNumber('')).toBeNull();
    expect(parseStatNumber('abc')).toBeNull();
  });
});

describe('getBlurbStats', () => {
  it('lit toutes les stats présentes dans dl.stats', () => {
    const blurb = document.createElement('li');
    blurb.innerHTML = `
      <dl class="stats">
        <dd class="kudos">42</dd>
        <dd class="hits">1,000</dd>
        <dd class="bookmarks">5</dd>
        <dd class="comments">3</dd>
        <dd class="words">2,345</dd>
      </dl>
    `;
    expect(getBlurbStats(blurb)).toEqual({
      kudos: 42, hits: 1000, bookmarks: 5, comments: 3, words: 2345,
    });
  });

  it('retombe sur dd.<nom> seul si dl.stats est absent', () => {
    const blurb = document.createElement('li');
    blurb.innerHTML = `<dd class="kudos">7</dd>`;
    expect(getBlurbStats(blurb).kudos).toBe(7);
  });

  it('retourne null pour les stats absentes (pas 0)', () => {
    const blurb = document.createElement('li');
    blurb.innerHTML = `<dl class="stats"><dd class="kudos">10</dd></dl>`;
    const stats = getBlurbStats(blurb);
    expect(stats.kudos).toBe(10);
    expect(stats.hits).toBeNull();
    expect(stats.bookmarks).toBeNull();
  });

  it('gère un blurb null sans lever d\'erreur', () => {
    expect(getBlurbStats(null)).toEqual({
      kudos: null, hits: null, bookmarks: null, comments: null, words: null,
    });
  });
});

describe('getWorkPageStats', () => {
  it('lit les stats depuis dl.stats de la page de work', () => {
    document.body.innerHTML = `
      <dl class="stats">
        <dd class="kudos">99</dd>
        <dd class="hits">500</dd>
        <dd class="bookmarks">12</dd>
        <dd class="comments">8</dd>
        <dd class="words">10,000</dd>
      </dl>
    `;
    expect(getWorkPageStats(document)).toEqual({
      kudos: 99, hits: 500, bookmarks: 12, comments: 8, words: 10000,
    });
  });

  it('retourne des null si dl.stats est absent (pas de repli dd seul)', () => {
    document.body.innerHTML = `<div></div>`;
    expect(getWorkPageStats(document)).toEqual({
      kudos: null, hits: null, bookmarks: null, comments: null, words: null,
    });
  });
});
