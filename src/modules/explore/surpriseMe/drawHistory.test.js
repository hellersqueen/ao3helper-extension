// @ts-nocheck — fichier de test, pas typé au même niveau que le code produit.
import { describe, it, expect, beforeEach } from 'vitest';
import { KEY_SURPRISE_ME_HISTORY, loadHistory, recordDraw, clearHistory, getRecentDrawIds } from './drawHistory.js';

beforeEach(() => localStorage.clear());

describe('recordDraw / loadHistory', () => {
  it('ajoute une entrée en tête de liste', () => {
    recordDraw({ id: '1', title: 'First', href: '/works/1' });
    recordDraw({ id: '2', title: 'Second', href: '/works/2' });
    const history = loadHistory();
    expect(history.length).toBe(2);
    expect(history[0].id).toBe('2');
    expect(history[1].id).toBe('1');
    expect(history[0].at).toEqual(expect.any(Number));
  });

  it('ignore une entrée sans id', () => {
    recordDraw({ title: 'No id' });
    expect(loadHistory()).toEqual([]);
  });

  it('retombe sur "(untitled)" sans titre', () => {
    recordDraw({ id: '1' });
    expect(loadHistory()[0].title).toBe('(untitled)');
  });

  it('plafonne l\'historique à 50 entrées', () => {
    for (let i = 0; i < 60; i++) recordDraw({ id: String(i), title: `T${i}` });
    const history = loadHistory();
    expect(history.length).toBe(50);
    expect(history[0].id).toBe('59'); // le plus récent en tête
    expect(history[49].id).toBe('10'); // les plus anciens tombent hors fenêtre
  });

  it('retourne [] sur un JSON invalide', () => {
    localStorage.setItem(KEY_SURPRISE_ME_HISTORY, '{not json');
    expect(loadHistory()).toEqual([]);
  });
});

describe('clearHistory', () => {
  it('vide l\'historique', () => {
    recordDraw({ id: '1', title: 'First' });
    clearHistory();
    expect(loadHistory()).toEqual([]);
  });
});

describe('getRecentDrawIds', () => {
  it('retourne les IDs des 20 tirages les plus récents', () => {
    for (let i = 0; i < 25; i++) recordDraw({ id: String(i), title: `T${i}` });
    const recent = getRecentDrawIds();
    expect(recent.size).toBe(20);
    expect(recent.has('24')).toBe(true); // le plus récent
    expect(recent.has('5')).toBe(true);  // 20e plus récent
    expect(recent.has('4')).toBe(false); // hors fenêtre des 20 derniers
  });

  it('ensemble vide sans historique', () => {
    expect(getRecentDrawIds()).toEqual(new Set());
  });
});
