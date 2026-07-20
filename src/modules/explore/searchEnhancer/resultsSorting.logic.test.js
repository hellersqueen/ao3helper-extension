import { describe, it, expect } from 'vitest';
import { recencyScore, scoreForMode } from './_searchEnhancer.js';

describe('recencyScore', () => {
  it('vaut 1 pour une œuvre mise à jour aujourd’hui', () => {
    const now = Date.now();
    expect(recencyScore(now, now)).toBe(1);
  });

  it('décroît avec l’ancienneté', () => {
    const now = Date.now();
    const recent = recencyScore(now - 1 * 86400000, now);
    const older   = recencyScore(now - 30 * 86400000, now);
    expect(recent).toBeGreaterThan(older);
  });

  it('vaut 0 quand la date est inconnue', () => {
    expect(recencyScore(null)).toBe(0);
  });
});

describe('scoreForMode', () => {
  const now = Date.now();

  it('calcule le ratio kudos/hits', () => {
    expect(scoreForMode('kudos_ratio', { kudos: 10, hits: 100 })).toBe(0.1);
    expect(scoreForMode('kudos_ratio', { kudos: 10, hits: 0 })).toBe(0);
  });

  it('calcule le taux de sauvegarde bookmarks/kudos', () => {
    expect(scoreForMode('save_rate', { kudos: 20, bookmarks: 5 })).toBe(0.25);
    expect(scoreForMode('save_rate', { kudos: 0, bookmarks: 5 })).toBe(0);
  });

  it('trie par kudos par chapitre', () => {
    expect(scoreForMode('kudos_per_chapter', { kudos: 100, chapters: 4 })).toBe(25);
  });

  it('retombe sur le total de kudos si le nombre de chapitres est inconnu', () => {
    expect(scoreForMode('kudos_per_chapter', { kudos: 100, chapters: 0 })).toBe(100);
  });

  it('trie par activité récente', () => {
    const fresh = scoreForMode('recent', { updatedAt: now }, now);
    const stale = scoreForMode('recent', { updatedAt: now - 60 * 86400000 }, now);
    expect(fresh).toBeGreaterThan(stale);
  });

  it('combine ratio et récence pour le mode équilibré', () => {
    const highRatioOld = scoreForMode('balanced', { kudos: 50, hits: 100, updatedAt: now - 90 * 86400000 }, now);
    const lowRatioFresh = scoreForMode('balanced', { kudos: 1, hits: 100, updatedAt: now }, now);
    const highRatioFresh = scoreForMode('balanced', { kudos: 50, hits: 100, updatedAt: now }, now);
    expect(highRatioFresh).toBeGreaterThan(highRatioOld);
    expect(highRatioFresh).toBeGreaterThan(lowRatioFresh);
  });

  it('renvoie 0 pour un mode inconnu ou "default"', () => {
    expect(scoreForMode('default', { kudos: 10 })).toBe(0);
    expect(scoreForMode('nope', { kudos: 10 })).toBe(0);
  });
});
