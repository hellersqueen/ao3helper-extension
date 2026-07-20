import { describe, it, expect } from 'vitest';
import {
  filterSessionsByPeriod, buildTagCloud, dayHourHeatmap, bestReadingSlot, formatSlotLabel,
  detectRereads, detectIntensiveSessions, estimateAbandonPoint, compareByPeriod,
  detectTagTrend, groupByField, quarterlyBreakdown, isNightOwl, regularityScore,
  fandomPercentages, buildRecapText,
} from './_activityPanel.js';

describe('activityPanelHelpers', () => {
  describe('filterSessionsByPeriod', () => {
    const now = Date.now();
    const sessions = [
      { id: 'a', startedAt: now },
      { id: 'b', startedAt: now - 3 * 86400000 },
      { id: 'c', startedAt: now - 40 * 86400000 },
      { id: 'd', startedAt: now - 400 * 86400000 },
    ];

    it('retourne tout pour "all"', () => {
      expect(filterSessionsByPeriod(sessions, 'all')).toHaveLength(4);
    });

    it('filtre sur 7 jours', () => {
      expect(filterSessionsByPeriod(sessions, 'week').map(s => s.id)).toEqual(['a', 'b']);
    });

    it('filtre sur 1 an', () => {
      expect(filterSessionsByPeriod(sessions, 'year').map(s => s.id)).toEqual(['a', 'b', 'c']);
    });
  });

  describe('buildTagCloud', () => {
    it('donne une taille proportionnelle au nombre d’occurrences', () => {
      const cloud = buildTagCloud([{ name: 'Fluff', count: 10 }, { name: 'Angst', count: 1 }], { minSize: 10, maxSize: 30 });
      expect(cloud.find(t => t.name === 'Fluff').size).toBe(30);
      expect(cloud.find(t => t.name === 'Angst').size).toBe(10);
    });

    it('retourne un tableau vide sans tags', () => {
      expect(buildTagCloud([])).toEqual([]);
    });
  });

  describe('dayHourHeatmap / bestReadingSlot / formatSlotLabel', () => {
    it('construit une grille 7×24 et trouve le créneau le plus actif', () => {
      const sunday9am = new Date('2026-01-04T09:00:00'); // a Sunday
      const sessions = [
        { startedAt: sunday9am.getTime() },
        { startedAt: sunday9am.getTime() },
        { startedAt: new Date('2026-01-05T14:00:00').getTime() }, // Monday
      ];
      const grid = dayHourHeatmap(sessions);
      expect(grid[0][9]).toBe(2);
      const slot = bestReadingSlot(grid);
      expect(slot).toEqual({ day: 0, hour: 9, count: 2 });
      expect(formatSlotLabel(slot)).toBe('Sundays around 09:00');
    });

    it('retourne null sans données', () => {
      expect(bestReadingSlot(dayHourHeatmap([]))).toBeNull();
    });
  });

  describe('detectRereads', () => {
    it('ne garde que les works visités plus d’une fois', () => {
      const sessions = [
        { workId: '1', title: 'A' }, { workId: '1', title: 'A' },
        { workId: '2', title: 'B' },
      ];
      expect(detectRereads(sessions)).toEqual([{ workId: '1', title: 'A', count: 2 }]);
    });
  });

  describe('detectIntensiveSessions', () => {
    it('retient les sessions avec un nombre de pages bien au-dessus de la moyenne', () => {
      const sessions = [{ pageViews: 1 }, { pageViews: 1 }, { pageViews: 10 }];
      expect(detectIntensiveSessions(sessions, 2)).toEqual([{ pageViews: 10 }]);
    });
  });

  describe('estimateAbandonPoint', () => {
    it('moyenne les pages vues sur les works jamais marqués terminés', () => {
      const sessions = [{ workId: '1', pageViews: 4 }, { workId: '2', pageViews: 2 }, { workId: '3', pageViews: 100 }];
      const isFinished = (id) => id === '3';
      expect(estimateAbandonPoint(sessions, isFinished)).toBe(3);
    });

    it('retourne null sans données pertinentes', () => {
      expect(estimateAbandonPoint([], () => false)).toBeNull();
    });
  });

  describe('compareByPeriod', () => {
    it('compare ce mois-ci au mois précédent', () => {
      const now = new Date('2026-03-15T12:00:00');
      const sessions = [
        { startedAt: new Date('2026-03-10T00:00:00').getTime(), workId: '1', words: 1000 },
        { startedAt: new Date('2026-02-10T00:00:00').getTime(), workId: '2', words: 500 },
      ];
      const { current, previous, deltaPct } = compareByPeriod(sessions, 'month', now);
      expect(current).toEqual({ works: 1, words: 1000 });
      expect(previous).toEqual({ works: 1, words: 500 });
      expect(deltaPct).toBe(0);
    });
  });

  describe('detectTagTrend', () => {
    it('détecte un tag lu plus souvent récemment qu’avant', () => {
      const now = Date.now();
      const sessions = [
        { startedAt: now - 1 * 86400000, tags: ['Hurt/Comfort'] },
        { startedAt: now - 2 * 86400000, tags: ['Hurt/Comfort'] },
        { startedAt: now - 45 * 86400000, tags: ['Hurt/Comfort'] },
      ];
      const trend = detectTagTrend(sessions, 30, now);
      expect(trend[0]).toEqual({ tag: 'Hurt/Comfort', count: 2, priorCount: 1 });
    });
  });

  describe('groupByField / quarterlyBreakdown', () => {
    it('regroupe par champ donné, trié par fréquence', () => {
      const sessions = [{ rating: 'Teen' }, { rating: 'Teen' }, { rating: 'General' }];
      expect(groupByField(sessions, 'rating')).toEqual([{ name: 'Teen', count: 2 }, { name: 'General', count: 1 }]);
    });

    it('regroupe par trimestre chronologiquement', () => {
      const sessions = [
        { startedAt: new Date('2026-01-15').getTime() },
        { startedAt: new Date('2026-05-15').getTime() },
        { startedAt: new Date('2026-02-15').getTime() },
      ];
      expect(quarterlyBreakdown(sessions)).toEqual([
        { label: '2026 Q1', count: 2 },
        { label: '2026 Q2', count: 1 },
      ]);
    });
  });

  describe('isNightOwl / regularityScore', () => {
    it('détecte un profil nocturne quand la majorité des sessions sont la nuit', () => {
      const byHour = Array(24).fill(0);
      byHour[1] = 5; byHour[14] = 2;
      expect(isNightOwl(byHour)).toBe(true);
    });

    it('calcule un score de régularité basé sur les jours actifs', () => {
      const day = 86400000;
      const base = new Date('2026-01-01').getTime();
      const sessions = [{ startedAt: base }, { startedAt: base + day }, { startedAt: base + 3 * day }];
      // Active on day 0, 1, 3 → span of 4 days, 3 active → 75%
      expect(regularityScore(sessions)).toBe(75);
    });
  });

  describe('fandomPercentages / buildRecapText', () => {
    it('calcule un pourcentage par fandom', () => {
      expect(fandomPercentages([{ name: 'HP', count: 5 }], 20)).toEqual([{ name: 'HP', count: 5, pct: 25 }]);
    });

    it('formate un texte de récapitulatif', () => {
      expect(buildRecapText('October 2026', { works: 5, words: 12000 })).toBe(
        'Your October 2026 on AO3: 5 works, 12,000 words read.'
      );
    });
  });
});
