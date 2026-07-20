import { describe, it, expect } from 'vitest';
import { computeDiversity, computeRereadPercent, computeReaderProfile, computeYearRecap } from './readingDashboard.js';

function work (overrides = {}) {
  return {
    id: '1', title: 'A Work', url: '/works/1',
    fandoms: [], tags: [], completed: false, lastVisited: Date.now(), visitCount: 1,
    ...overrides,
  };
}

describe('computeDiversity', () => {
  it('compte les fandoms/tags distincts (insensible à la casse)', () => {
    const works = [
      work({ fandoms: ['Star Wars'], tags: ['Angst', 'Fluff'] }),
      work({ fandoms: ['star wars', 'Star Trek'], tags: ['angst'] }),
    ];
    expect(computeDiversity(works)).toEqual({ workCount: 2, fandomCount: 2, tagCount: 2 });
  });

  it('vide sans données', () => {
    expect(computeDiversity([])).toEqual({ workCount: 0, fandomCount: 0, tagCount: 0 });
    expect(computeDiversity(undefined)).toEqual({ workCount: 0, fandomCount: 0, tagCount: 0 });
  });

  it('ignore les fandoms/tags vides ou absents', () => {
    const works = [work({ fandoms: undefined, tags: undefined })];
    expect(computeDiversity(works)).toEqual({ workCount: 1, fandomCount: 0, tagCount: 0 });
  });
});

describe('computeRereadPercent', () => {
  it('0 sans données', () => {
    expect(computeRereadPercent([])).toBe(0);
  });

  it('calcule le pourcentage de works avec visitCount > 1', () => {
    const works = [work({ visitCount: 2 }), work({ visitCount: 1 }), work({ visitCount: 3 }), work({ visitCount: 1 })];
    expect(computeRereadPercent(works)).toBe(50);
  });

  it('traite une entrée sans visitCount comme une seule visite', () => {
    const works = [work({ visitCount: undefined }), work({ visitCount: 2 })];
    expect(computeRereadPercent(works)).toBe(50);
  });
});

describe('computeReaderProfile', () => {
  it('retourne null avec moins de 3 œuvres (pas assez de données)', () => {
    expect(computeReaderProfile([work(), work()])).toBeNull();
    expect(computeReaderProfile([])).toBeNull();
  });

  it('« Completionist » quand le taux de complétion est >= 70%', () => {
    const works = [work({ completed: true }), work({ completed: true }), work({ completed: true }), work({ completed: false })];
    const profile = computeReaderProfile(works);
    expect(profile.label).toBe('Completionist');
    expect(profile.detail).toContain('75%');
  });

  it('« Marathon reader » quand plusieurs œuvres sont ouvertes le même jour', () => {
    const sameDay = new Date('2026-01-01T10:00:00').getTime();
    const works = [
      work({ completed: false, lastVisited: sameDay }),
      work({ completed: false, lastVisited: sameDay + 1000 }),
      work({ completed: false, lastVisited: sameDay + 2000 }),
      work({ completed: false, lastVisited: sameDay + 3000 }),
    ];
    const profile = computeReaderProfile(works);
    expect(profile.label).toBe('Marathon reader');
  });

  it('« Casual reader » sinon (faible complétion, visites étalées)', () => {
    const day1 = new Date('2026-01-01T10:00:00').getTime();
    const day2 = new Date('2026-02-01T10:00:00').getTime();
    const day3 = new Date('2026-03-01T10:00:00').getTime();
    const works = [
      work({ completed: false, lastVisited: day1 }),
      work({ completed: false, lastVisited: day2 }),
      work({ completed: false, lastVisited: day3 }),
    ];
    expect(computeReaderProfile(works).label).toBe('Casual reader');
  });
});

describe('computeYearRecap', () => {
  it('filtre les œuvres visitées dans l\'année cible', () => {
    const in2026 = new Date('2026-05-01').getTime();
    const in2025 = new Date('2025-05-01').getTime();
    const works = [
      work({ lastVisited: in2026, completed: true, fandoms: ['Star Wars'], tags: ['Angst'] }),
      work({ lastVisited: in2026, completed: false, fandoms: ['Star Wars'], tags: ['Fluff'] }),
      work({ lastVisited: in2025, completed: true }),
    ];
    const recap = computeYearRecap(works, 2026);
    expect(recap).toEqual({
      year: 2026,
      totalWorks: 2,
      completedCount: 1,
      wipCount: 1,
      topFandom: 'star wars',
      distinctFandoms: 1,
      distinctTags: 2,
    });
  });

  it('année par défaut = année courante', () => {
    const recap = computeYearRecap([], undefined);
    expect(recap.year).toBe(new Date().getFullYear());
  });

  it('zéro résultat proprement quand aucune œuvre ne correspond', () => {
    expect(computeYearRecap([work({ lastVisited: new Date('2020-01-01').getTime() })], 2026)).toEqual({
      year: 2026, totalWorks: 0, completedCount: 0, wipCount: 0, topFandom: null, distinctFandoms: 0, distinctTags: 0,
    });
  });
});
