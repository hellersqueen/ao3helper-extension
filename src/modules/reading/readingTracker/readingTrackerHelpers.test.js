import { describe, it, expect } from 'vitest';
import {
  nextVisitCount, groupHistoryByPeriod, sortHistory, pinnedFirst, entriesToCleanUp,
  computeReadingSpeed, progressMilestonesCrossed, donutDashArray, formatUpdatedLabel,
  buildContinueReadingList,
} from './readingTrackerHelpers.js';

describe('readingTrackerHelpers', () => {
  describe('nextVisitCount', () => {
    it('démarre à 1 pour une première visite', () => {
      expect(nextVisitCount(undefined)).toBe(1);
    });

    it('incrémente le compteur existant', () => {
      expect(nextVisitCount({ visitCount: 2 })).toBe(3);
    });

    it('traite une entrée sans compteur comme une première relecture', () => {
      expect(nextVisitCount({})).toBe(2);
    });
  });

  describe('groupHistoryByPeriod', () => {
    it('range les entrées en aujourd’hui / hier / cette semaine / plus ancien', () => {
      const now = new Date('2026-03-15T12:00:00').getTime();
      const history = [
        { id: 'a', lastReadAt: now },
        { id: 'b', lastReadAt: now - 20 * 3600000 }, // hier
        { id: 'c', lastReadAt: now - 4 * 86400000 }, // cette semaine
        { id: 'd', lastReadAt: now - 20 * 86400000 }, // plus ancien
      ];
      const groups = groupHistoryByPeriod(history, now);
      expect(groups.today.map(e => e.id)).toEqual(['a']);
      expect(groups.yesterday.map(e => e.id)).toEqual(['b']);
      expect(groups.thisWeek.map(e => e.id)).toEqual(['c']);
      expect(groups.older.map(e => e.id)).toEqual(['d']);
    });
  });

  describe('sortHistory / pinnedFirst', () => {
    const history = [
      { title: 'Zebra', lastReadAt: 100 },
      { title: 'Apple', lastReadAt: 300 },
      { title: 'Mango', lastReadAt: 200, pinned: true },
    ];

    it('trie par date décroissante par défaut', () => {
      expect(sortHistory(history).map(e => e.title)).toEqual(['Apple', 'Mango', 'Zebra']);
    });

    it('trie par titre alphabétique', () => {
      expect(sortHistory(history, 'title').map(e => e.title)).toEqual(['Apple', 'Mango', 'Zebra']);
    });

    it('remonte les entrées épinglées en premier', () => {
      expect(pinnedFirst(history).map(e => e.title)).toEqual(['Mango', 'Zebra', 'Apple']);
    });
  });

  describe('entriesToCleanUp', () => {
    it('sélectionne les entrées non épinglées plus vieilles que le seuil', () => {
      const now = Date.now();
      const history = [
        { id: '1', lastReadAt: now - 40 * 86400000 },
        { id: '2', lastReadAt: now - 40 * 86400000, pinned: true },
        { id: '3', lastReadAt: now - 2 * 86400000 },
      ];
      expect(entriesToCleanUp(history, 30, now)).toEqual(['1']);
    });
  });

  describe('computeReadingSpeed', () => {
    it('calcule une vitesse moyenne en mots par minute', () => {
      const samples = [{ words: 500, ms: 60000 }, { words: 500, ms: 60000 }];
      expect(computeReadingSpeed(samples)).toBe(500);
    });

    it('ignore les échantillons invalides et retourne null si aucun n’est valide', () => {
      expect(computeReadingSpeed([{ words: 0, ms: 100 }, { words: 5, ms: 0 }])).toBeNull();
    });
  });

  describe('progressMilestonesCrossed', () => {
    it('détecte les paliers franchis', () => {
      expect(progressMilestonesCrossed(20, 30)).toEqual([25]);
      expect(progressMilestonesCrossed(10, 80)).toEqual([25, 50, 75]);
      expect(progressMilestonesCrossed(50, 50)).toEqual([]);
    });
  });

  describe('donutDashArray', () => {
    it('calcule la longueur du trait proportionnellement au pourcentage', () => {
      expect(donutDashArray(50, 100)).toEqual({ dash: 50, gap: 50 });
      expect(donutDashArray(0, 100)).toEqual({ dash: 0, gap: 100 });
      expect(donutDashArray(100, 100)).toEqual({ dash: 100, gap: 0 });
    });
  });

  describe('formatUpdatedLabel', () => {
    it('utilise la fonction relative fournie en mode "relative"', () => {
      const relativeFn = () => '3 days ago';
      expect(formatUpdatedLabel(Date.now(), 'relative', relativeFn)).toBe('3 days ago');
    });

    it('formate une date exacte en mode "exact"', () => {
      const ts = new Date('2026-03-15').getTime();
      expect(formatUpdatedLabel(ts, 'exact', () => '')).toMatch(/Mar/);
    });
  });

  describe('buildContinueReadingList', () => {
    it('ne garde que les œuvres en cours (chapitre connu, pas encore au dernier)', () => {
      const history = [
        { id: '1', chapter: 2, totalChapters: 5, lastReadAt: 200 },
        { id: '2', chapter: 5, totalChapters: 5, lastReadAt: 300 }, // finished
        { id: '3', chapter: null, lastReadAt: 400 }, // never opened a chapter
        { id: '4', chapter: 1, totalChapters: null, lastReadAt: 100 }, // unknown total, still in progress
      ];
      const result = buildContinueReadingList(history, 5);
      expect(result.map(e => e.id)).toEqual(['1', '4']);
    });

    it('respecte la limite et trie par date de dernière lecture', () => {
      const history = Array.from({ length: 10 }, (_, i) => ({ id: String(i), chapter: 1, totalChapters: 5, lastReadAt: i }));
      expect(buildContinueReadingList(history, 3).map(e => e.id)).toEqual(['9', '8', '7']);
    });
  });
});
