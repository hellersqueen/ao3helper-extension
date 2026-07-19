import { describe, it, expect } from 'vitest';
import {
  groupCounts, topEntries, computeRatingStats, ratingByMonth, appendRatingHistory,
  combinedCategoryScore, halfStarValue, hourOfDayHistogram, peakHours,
  milestonesCrossed, nextRereadCount, filterKudosHistory, sortKudosHistoryByDate,
  diffNotBookmarked,
} from './ficAppreciationHelpers.js';

describe('ficAppreciationHelpers', () => {
  describe('groupCounts / topEntries', () => {
    it('compte les occurrences par fandom et trie par fréquence', () => {
      const records = [
        { fandoms: ['A', 'B'] },
        { fandoms: ['A'] },
        { fandoms: ['C'] },
      ];
      const counts = groupCounts(records, r => r.fandoms);
      expect(counts).toEqual({ A: 2, B: 1, C: 1 });
      expect(topEntries(counts, 2)).toEqual([{ key: 'A', count: 2 }, { key: 'B', count: 1 }]);
    });

    it('ignore les clés vides ou absentes', () => {
      const counts = groupCounts([{ author: '' }, { author: null }, {}], r => [r.author]);
      expect(counts).toEqual({});
    });
  });

  describe('computeRatingStats', () => {
    it('calcule le total, la moyenne et la répartition', () => {
      const map = { 1: { stars: 5 }, 2: { stars: 3 }, 3: { stars: 5 } };
      expect(computeRatingStats(map)).toEqual({
        total: 3, average: 4.33, distribution: { 1: 0, 2: 0, 3: 1, 4: 0, 5: 2 },
      });
    });

    it('retourne des valeurs à zéro sans notes', () => {
      expect(computeRatingStats({})).toEqual({ total: 0, average: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } });
    });
  });

  describe('ratingByMonth', () => {
    it('regroupe la moyenne par mois, triée chronologiquement', () => {
      const map = {
        a: { stars: 4, date: '2025-01-10' },
        b: { stars: 2, date: '2025-01-20' },
        c: { stars: 5, date: '2024-12-01' },
      };
      expect(ratingByMonth(map)).toEqual({ '2024-12': 5, '2025-01': 3 });
    });
  });

  describe('appendRatingHistory', () => {
    it('archive l’ancienne note quand elle change', () => {
      const prev = { stars: 3, date: '2025-01-01', history: [] };
      expect(appendRatingHistory(prev, 5)).toEqual([{ stars: 3, date: '2025-01-01' }]);
    });

    it('ne rajoute rien si la note ne change pas', () => {
      const prev = { stars: 3, date: '2025-01-01', history: [{ stars: 2, date: '2024-12-01' }] };
      expect(appendRatingHistory(prev, 3)).toEqual([{ stars: 2, date: '2024-12-01' }]);
    });

    it('plafonne l’historique à `cap` entrées', () => {
      const history = Array.from({ length: 10 }, (_, i) => ({ stars: i, date: `d${i}` }));
      const prev = { stars: 9, date: 'd9', history };
      const result = appendRatingHistory(prev, 4, 10);
      expect(result.length).toBe(10);
      expect(result[result.length - 1]).toEqual({ stars: 9, date: 'd9' });
    });
  });

  describe('combinedCategoryScore', () => {
    it('moyenne les catégories renseignées', () => {
      expect(combinedCategoryScore({ plot: 4, characters: 5, writing: 3 })).toBe(4);
    });

    it('retourne null sans catégories', () => {
      expect(combinedCategoryScore(undefined)).toBeNull();
      expect(combinedCategoryScore({})).toBeNull();
    });
  });

  describe('halfStarValue', () => {
    it('retourne une demi-étoile si le clic est sur la moitié gauche et que c’est activé', () => {
      expect(halfStarValue(2, 20, 3, true)).toBe(2.5);
      expect(halfStarValue(15, 20, 3, true)).toBe(3);
    });

    it('ignore les demi-étoiles si désactivé', () => {
      expect(halfStarValue(2, 20, 3, false)).toBe(3);
    });
  });

  describe('hourOfDayHistogram / peakHours', () => {
    it('construit un histogramme sur 24h en ignorant les entrées sans timestamp', () => {
      const ts9  = new Date('2025-06-01T09:30:00').getTime();
      const ts9b = new Date('2025-06-02T09:15:00').getTime();
      const ts21 = new Date('2025-06-01T21:00:00').getTime();
      const { hist, counted } = hourOfDayHistogram([{ ts: ts9 }, { ts: ts9b }, { ts: ts21 }, {}]);
      expect(counted).toBe(3);
      expect(hist[9]).toBe(2);
      expect(hist[21]).toBe(1);
      expect(peakHours(hist, 1)).toEqual([{ hour: 9, count: 2 }]);
    });
  });

  describe('milestonesCrossed', () => {
    it('détecte les paliers franchis entre deux totaux', () => {
      expect(milestonesCrossed(48, 51)).toEqual([50]);
      expect(milestonesCrossed(9, 30)).toEqual([10, 25]);
      expect(milestonesCrossed(50, 50)).toEqual([]);
    });
  });

  describe('nextRereadCount', () => {
    it('incrémente le compteur existant', () => {
      expect(nextRereadCount({ rereadCount: 2 })).toBe(3);
      expect(nextRereadCount(undefined)).toBe(1);
    });
  });

  describe('filterKudosHistory / sortKudosHistoryByDate', () => {
    const entries = [
      { workId: '1', title: 'Moonlight Sonata', author: 'alice', fandoms: ['Star Wars'], date: '2025-01-01' },
      { workId: '2', title: 'Sunrise', author: 'bob', fandoms: ['Star Trek'], date: '2025-03-01' },
    ];

    it('filtre par titre, auteur ou fandom (insensible à la casse)', () => {
      expect(filterKudosHistory(entries, 'moon')).toEqual([entries[0]]);
      expect(filterKudosHistory(entries, 'BOB')).toEqual([entries[1]]);
      expect(filterKudosHistory(entries, 'star trek')).toEqual([entries[1]]);
      expect(filterKudosHistory(entries, '')).toEqual(entries);
    });

    it('trie par date, la plus récente en premier par défaut', () => {
      expect(sortKudosHistoryByDate(entries).map(e => e.workId)).toEqual(['2', '1']);
      expect(sortKudosHistoryByDate(entries, 'asc').map(e => e.workId)).toEqual(['1', '2']);
    });
  });

  describe('diffNotBookmarked', () => {
    it('retourne les works kudosés absents des favoris', () => {
      expect(diffNotBookmarked(['1', '2', '3'], ['2'])).toEqual(['1', '3']);
    });
  });
});
