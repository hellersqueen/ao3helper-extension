import { describe, it, expect } from 'vitest';
import { computeMilestones, getHeatmapLevel, timeOfDayBucket } from './timelineStats.js';

function daysWithWorks (spec) {
  // spec: { '2026-01-01': 3, '2026-01-02': 1, ... }
  const data = {};
  Object.entries(spec).forEach(([date, count]) => {
    data[date] = Array.from({ length: count }, (_, i) => ({ workId: `${date}-${i}` }));
  });
  return data;
}

describe('computeMilestones', () => {
  it('marque le jour où le cumul atteint 10', () => {
    const data = daysWithWorks({ '2026-01-01': 5, '2026-01-02': 5 });
    const milestones = computeMilestones(data);
    expect(milestones).toEqual({ '2026-01-02': '🏁 10th work read!' });
  });

  it('peut marquer plusieurs seuils le même jour', () => {
    const data = daysWithWorks({ '2026-01-01': 30 }); // passes 10 and 25 the same day
    const milestones = computeMilestones(data);
    expect(milestones['2026-01-01']).toBe('🏁 10th work read! · 🏁 25th work read!');
  });

  it('traite les dates dans l\'ordre chronologique, pas l\'ordre des clés', () => {
    const data = daysWithWorks({ '2026-02-01': 5, '2026-01-01': 5 }); // Jan before Feb
    const milestones = computeMilestones(data);
    expect(milestones).toEqual({ '2026-02-01': '🏁 10th work read!' });
  });

  it('objet vide sans historique ou sans seuil atteint', () => {
    expect(computeMilestones({})).toEqual({});
    expect(computeMilestones(daysWithWorks({ '2026-01-01': 3 }))).toEqual({});
  });
});

describe('getHeatmapLevel', () => {
  it('0 sans lecture', () => {
    expect(getHeatmapLevel(0)).toBe(0);
  });

  it('intensité medium (par défaut) : seuils 1/2/4 inchangés', () => {
    expect(getHeatmapLevel(1)).toBe(1);
    expect(getHeatmapLevel(2)).toBe(2);
    expect(getHeatmapLevel(3)).toBe(3);
    expect(getHeatmapLevel(4)).toBe(3);
    expect(getHeatmapLevel(5)).toBe(4);
  });

  it('intensité low : plus de lectures nécessaires pour chaque teinte', () => {
    expect(getHeatmapLevel(1, 'low')).toBe(1);
    expect(getHeatmapLevel(2, 'low')).toBe(1);
    expect(getHeatmapLevel(3, 'low')).toBe(2);
    expect(getHeatmapLevel(8, 'low')).toBe(3);
    expect(getHeatmapLevel(9, 'low')).toBe(4);
  });

  it('intensité high : teinte maximale atteinte plus vite', () => {
    expect(getHeatmapLevel(1, 'high')).toBe(1);
    expect(getHeatmapLevel(2, 'high')).toBe(3);
    expect(getHeatmapLevel(3, 'high')).toBe(4);
  });

  it('retombe sur medium pour une intensité inconnue', () => {
    expect(getHeatmapLevel(2, 'bogus')).toBe(2);
  });
});

describe('timeOfDayBucket', () => {
  it('classe correctement chaque tranche horaire', () => {
    expect(timeOfDayBucket(new Date('2026-01-01T06:00:00'))).toBe('Morning');
    expect(timeOfDayBucket(new Date('2026-01-01T13:00:00'))).toBe('Afternoon');
    expect(timeOfDayBucket(new Date('2026-01-01T18:00:00'))).toBe('Evening');
    expect(timeOfDayBucket(new Date('2026-01-01T23:00:00'))).toBe('Night');
    expect(timeOfDayBucket(new Date('2026-01-01T02:00:00'))).toBe('Night');
  });
});
