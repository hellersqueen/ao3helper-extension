import { describe, it, expect, vi } from 'vitest';
import {
  pickChapterIndex, buildCacheKey, isCacheEntryFresh, truncateFullChapterText, MAX_FULL_CHAPTER_CHARS,
} from './ficPeekExcerpt.js';

describe('pickChapterIndex', () => {
  it('retourne toujours 0 pour "first"', () => {
    expect(pickChapterIndex(5, 'first')).toBe(0);
    expect(pickChapterIndex(1, 'first')).toBe(0);
  });

  it('retourne le dernier index pour "last"', () => {
    expect(pickChapterIndex(5, 'last')).toBe(4);
    expect(pickChapterIndex(1, 'last')).toBe(0);
  });

  it('retourne un index dans les bornes pour "random"', () => {
    const spy = vi.spyOn(Math, 'random').mockReturnValue(0.999);
    expect(pickChapterIndex(5, 'random')).toBe(4);
    spy.mockReturnValue(0);
    expect(pickChapterIndex(5, 'random')).toBe(0);
    spy.mockRestore();
  });

  it('retourne 0 pour un compte invalide, quel que soit le mode', () => {
    expect(pickChapterIndex(0, 'last')).toBe(0);
    expect(pickChapterIndex(NaN, 'random')).toBe(0);
    expect(pickChapterIndex(-1, 'first')).toBe(0);
  });
});

describe('buildCacheKey', () => {
  it('inclut le nombre de mots seulement en mode "custom"', () => {
    expect(buildCacheKey('u', { chapterMode: 'first', excerptMode: 'paragraph' }))
      .toBe('u::first::paragraph::');
    expect(buildCacheKey('u', { chapterMode: 'first', excerptMode: 'custom', excerptCustomWords: 150 }))
      .toBe('u::first::custom::150');
  });

  it('des réglages différents produisent des clés différentes', () => {
    const a = buildCacheKey('u', { chapterMode: 'first', excerptMode: 'paragraph' });
    const b = buildCacheKey('u', { chapterMode: 'last', excerptMode: 'paragraph' });
    expect(a).not.toBe(b);
  });
});

describe('isCacheEntryFresh', () => {
  it('n’expire jamais quand ttlHours vaut 0', () => {
    expect(isCacheEntryFresh(Date.now() - 1e12, 0)).toBe(true);
  });

  it('est fraîche dans la fenêtre TTL', () => {
    expect(isCacheEntryFresh(Date.now() - 1000, 1)).toBe(true);
  });

  it('est périmée au-delà de la fenêtre TTL', () => {
    expect(isCacheEntryFresh(Date.now() - 2 * 3600 * 1000, 1)).toBe(false);
  });

  it('retourne false pour un timestamp invalide', () => {
    expect(isCacheEntryFresh(NaN, 1)).toBe(false);
  });
});

describe('truncateFullChapterText', () => {
  it('laisse un texte court inchangé', () => {
    expect(truncateFullChapterText('hello')).toBe('hello');
  });

  it('tronque un texte trop long avec un marqueur', () => {
    const long = 'a'.repeat(MAX_FULL_CHAPTER_CHARS + 500);
    const result = truncateFullChapterText(long);
    expect(result.length).toBe(MAX_FULL_CHAPTER_CHARS + 1);
    expect(result.endsWith('…')).toBe(true);
  });
});
