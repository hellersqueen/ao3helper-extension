import { describe, it, expect } from 'vitest';
import { withReadCounts, sortGroupsByReadHistory } from './_searchEnhancer.js';

describe('withReadCounts', () => {
  it('compte les œuvres du groupe présentes dans l’historique', () => {
    const groups = [
      { label: 'A', workIds: ['1', '2', '3'] },
      { label: 'B', workIds: ['4', '5'] },
    ];
    const read = new Set(['2', '3', '4']);
    expect(withReadCounts(groups, read).map(g => g.readCount)).toEqual([2, 1]);
  });

  it('renvoie 0 pour un groupe sans aucune œuvre lue', () => {
    const groups = [{ label: 'A', workIds: ['1'] }];
    expect(withReadCounts(groups, new Set())[0].readCount).toBe(0);
  });
});

describe('sortGroupsByReadHistory', () => {
  it('trie les groupes du plus lu au moins lu', () => {
    const groups = [
      { label: 'Barely read', workIds: ['1', '2', '3', '4'] },
      { label: 'Fully read', workIds: ['5', '6'] },
      { label: 'Never read', workIds: ['7', '8'] },
    ];
    const read = new Set(['1', '5', '6']);
    const sorted = sortGroupsByReadHistory(groups, read);
    expect(sorted.map(g => g.label)).toEqual(['Fully read', 'Barely read', 'Never read']);
  });

  it('conserve l’ordre d’origine en cas d’égalité (tri stable)', () => {
    const groups = [
      { label: 'First', workIds: ['1'] },
      { label: 'Second', workIds: ['2'] },
    ];
    const sorted = sortGroupsByReadHistory(groups, new Set());
    expect(sorted.map(g => g.label)).toEqual(['First', 'Second']);
  });
});
