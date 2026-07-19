import { describe, it, expect } from 'vitest';
import {
  parseAO3Date, isWithinDateRange, looksAbandoned,
  nextThreeState, shouldHideForThreeState,
  kudosRatio, belowRatioThreshold,
  belowTagThreshold, summaryTooShort,
  isSeriesFullyRead, mergePresetFilters,
  addSearchHistoryEntry, incrementUsage, topUsage,
} from './filterManagerHelpers.js';

describe('filterManagerHelpers', () => {
  describe('parseAO3Date', () => {
    it('parse le format de date AO3 "15 Jan 2024"', () => {
      const d = parseAO3Date('15 Jan 2024');
      expect(d.getFullYear()).toBe(2024);
      expect(d.getMonth()).toBe(0);
      expect(d.getDate()).toBe(15);
    });

    it('retourne null pour un texte invalide ou vide', () => {
      expect(parseAO3Date('')).toBeNull();
      expect(parseAO3Date('not a date')).toBeNull();
    });
  });

  describe('isWithinDateRange', () => {
    it('reconnaît une date du jour même', () => {
      expect(isWithinDateRange(new Date(), 'today')).toBe(true);
    });

    it('reconnaît une date vieille de 3 jours comme dans la semaine mais pas "today"', () => {
      const d = new Date(Date.now() - 3 * 86400000);
      expect(isWithinDateRange(d, 'today')).toBe(false);
      expect(isWithinDateRange(d, 'week')).toBe(true);
    });

    it('rejette une date de plus d’un mois', () => {
      const d = new Date(Date.now() - 60 * 86400000);
      expect(isWithinDateRange(d, 'month')).toBe(false);
    });

    it('retourne false sans date', () => {
      expect(isWithinDateRange(null, 'week')).toBe(false);
    });
  });

  describe('looksAbandoned', () => {
    it('détecte un WIP jamais mis à jour depuis plus d’un an', () => {
      const old = new Date(Date.now() - 400 * 86400000);
      expect(looksAbandoned(old, false)).toBe(true);
    });

    it('ignore une œuvre complète, même vieille', () => {
      const old = new Date(Date.now() - 400 * 86400000);
      expect(looksAbandoned(old, true)).toBe(false);
    });

    it('ignore un WIP récent', () => {
      const recent = new Date(Date.now() - 5 * 86400000);
      expect(looksAbandoned(recent, false)).toBe(false);
    });
  });

  describe('nextThreeState / shouldHideForThreeState', () => {
    it('boucle all → only → hide → all', () => {
      expect(nextThreeState('all')).toBe('only');
      expect(nextThreeState('only')).toBe('hide');
      expect(nextThreeState('hide')).toBe('all');
    });

    it('cache les non-correspondances en mode "only", et les correspondances en mode "hide"', () => {
      expect(shouldHideForThreeState('only', true)).toBe(false);
      expect(shouldHideForThreeState('only', false)).toBe(true);
      expect(shouldHideForThreeState('hide', true)).toBe(true);
      expect(shouldHideForThreeState('hide', false)).toBe(false);
      expect(shouldHideForThreeState('all', true)).toBe(false);
    });
  });

  describe('kudosRatio / belowRatioThreshold', () => {
    it('calcule un ratio kudos/vues en pourcentage', () => {
      expect(kudosRatio(50, 1000)).toBe(5);
    });

    it('retourne null sans nombre de vues connu', () => {
      expect(kudosRatio(50, 0)).toBeNull();
      expect(kudosRatio(50, null)).toBeNull();
    });

    it('détecte un ratio sous le seuil', () => {
      expect(belowRatioThreshold(2, 5)).toBe(true);
      expect(belowRatioThreshold(10, 5)).toBe(false);
      expect(belowRatioThreshold(null, 5)).toBe(false);
    });
  });

  describe('belowTagThreshold / summaryTooShort', () => {
    it('détecte un nombre de tags sous le seuil', () => {
      expect(belowTagThreshold(2, 5)).toBe(true);
      expect(belowTagThreshold(5, 5)).toBe(false);
      expect(belowTagThreshold(2, 0)).toBe(false);
    });

    it('détecte un résumé absent ou trop court', () => {
      expect(summaryTooShort('', 0)).toBe(true);
      expect(summaryTooShort('hi', 10)).toBe(true);
      expect(summaryTooShort('a much longer summary here', 10)).toBe(false);
    });
  });

  describe('isSeriesFullyRead', () => {
    it('vrai seulement si tous les works de la série sont lus', () => {
      expect(isSeriesFullyRead(['1', '2', '3'], new Set(['1', '2', '3']))).toBe(true);
      expect(isSeriesFullyRead(['1', '2', '3'], new Set(['1', '2']))).toBe(false);
      expect(isSeriesFullyRead([], new Set(['1']))).toBe(false);
    });
  });

  describe('mergePresetFilters', () => {
    it('unionne les champs multi-tags plutôt que d’écraser', () => {
      const a = { filters: { 'work_search[other_tag_names]': 'Fluff, Angst' } };
      const b = { filters: { 'work_search[other_tag_names]': 'Angst, Hurt/Comfort' } };
      const merged = mergePresetFilters(a, b, new Set(['work_search[other_tag_names]']));
      expect(merged['work_search[other_tag_names]']).toBe('Fluff, Angst, Hurt/Comfort');
    });

    it('b gagne sur les champs simples en conflit', () => {
      const a = { filters: { 'work_search[sort_column]': 'kudos_count' } };
      const b = { filters: { 'work_search[sort_column]': 'hit_count' } };
      expect(mergePresetFilters(a, b, new Set())['work_search[sort_column]']).toBe('hit_count');
    });

    it('conserve un champ de a absent de b', () => {
      const a = { filters: { 'work_search[complete]': '1' } };
      const b = { filters: {} };
      expect(mergePresetFilters(a, b, new Set())['work_search[complete]']).toBe('1');
    });
  });

  describe('addSearchHistoryEntry', () => {
    it('ajoute en tête et plafonne la liste', () => {
      const history = Array.from({ length: 20 }, (_, i) => ({ ts: i }));
      const result = addSearchHistoryEntry(history, { ts: 999 }, 20);
      expect(result.length).toBe(20);
      expect(result[0]).toEqual({ ts: 999 });
    });
  });

  describe('incrementUsage / topUsage', () => {
    it('incrémente et trie par usage décroissant', () => {
      let stats = {};
      stats = incrementUsage(stats, 'oneshot');
      stats = incrementUsage(stats, 'oneshot');
      stats = incrementUsage(stats, 'crossover');
      expect(topUsage(stats, 2)).toEqual([{ key: 'oneshot', count: 2 }, { key: 'crossover', count: 1 }]);
    });
  });
});
