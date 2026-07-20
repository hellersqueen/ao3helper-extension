import { describe, it, expect } from 'vitest';
import {
  commentRate, classifyLevel, isGem, gemMedal, averageRatio, isGemRelativeToPageAverage,
  DEFAULT_GEM_THRESHOLDS,
} from './_ficEngagement.js';

describe('commentRate', () => {
  it('calcule (comments / kudos) × 100', () => {
    expect(commentRate({ comments: 10, kudos: 100 })).toBe(10);
  });

  it('retourne null sans kudos ou sans données de commentaires', () => {
    expect(commentRate({ comments: 10, kudos: 0 })).toBeNull();
    expect(commentRate({ comments: null, kudos: 100 })).toBeNull();
  });
});

describe('classifyLevel', () => {
  const tiers = { high: 20, mid: 8 };
  it('classe high/mid/low selon les seuils', () => {
    expect(classifyLevel(25, tiers)).toBe('high');
    expect(classifyLevel(10, tiers)).toBe('mid');
    expect(classifyLevel(2, tiers)).toBe('low');
  });

  it('retourne null pour une valeur absente', () => {
    expect(classifyLevel(null, tiers)).toBeNull();
  });
});

describe('isGem', () => {
  it('détecte une pépite (ratio élevé, faible popularité, assez de données)', () => {
    expect(isGem({ kudos: 10, hits: 100, bookmarks: 2 })).toBe(true);
  });

  it('rejette un ratio trop bas', () => {
    expect(isGem({ kudos: 2, hits: 100, bookmarks: 1 })).toBe(false);
  });

  it('rejette une œuvre déjà populaire', () => {
    expect(isGem({ kudos: 500, hits: 2000, bookmarks: 200 })).toBe(false);
  });

  it('rejette quand il n’y a pas assez de données (hits/kudos sous le minimum)', () => {
    expect(isGem({ kudos: 3, hits: 20, bookmarks: 0 })).toBe(false);
  });

  it('retourne false sans stats', () => {
    expect(isGem(null)).toBe(false);
  });
});

describe('gemMedal', () => {
  it('retourne null pour une œuvre qui n’est pas une pépite', () => {
    expect(gemMedal({ kudos: 2, hits: 100, bookmarks: 1 })).toBeNull();
  });

  it('retourne "silver" juste au-dessus du seuil de base', () => {
    expect(gemMedal({ kudos: 6, hits: 100, bookmarks: 1 })).toBe('silver'); // ratio 6%
  });

  it('retourne "gold" à 2× le seuil de base', () => {
    expect(gemMedal({ kudos: 11, hits: 100, bookmarks: 1 })).toBe('gold'); // ratio 11%
  });

  it('retourne "diamond" à 3× le seuil de base', () => {
    expect(gemMedal({ kudos: 16, hits: 100, bookmarks: 1 })).toBe('diamond'); // ratio 16%
  });
});

describe('averageRatio', () => {
  it('moyenne les ratios kudos/hits des entrées avec assez de données', () => {
    expect(averageRatio([{ kudos: 10, hits: 100 }, { kudos: 20, hits: 100 }])).toBeCloseTo(0.15);
  });

  it('ignore les entrées sans kudos ou hits', () => {
    expect(averageRatio([{ kudos: 10, hits: 100 }, { kudos: null, hits: 100 }])).toBeCloseTo(0.1);
  });

  it('retourne null pour une liste vide ou sans données exploitables', () => {
    expect(averageRatio([])).toBeNull();
    expect(averageRatio([{ kudos: null, hits: null }])).toBeNull();
  });
});

describe('isGemRelativeToPageAverage', () => {
  it('détecte une œuvre nettement au-dessus de la moyenne de la page', () => {
    // page average 10%, multiplier 1.5 → seuil 15%; cette œuvre est à 20%
    expect(isGemRelativeToPageAverage({ kudos: 20, hits: 100, bookmarks: 1 }, 0.10, 1.5)).toBe(true);
  });

  it('rejette une œuvre proche de la moyenne de la page', () => {
    expect(isGemRelativeToPageAverage({ kudos: 11, hits: 100, bookmarks: 1 }, 0.10, 1.5)).toBe(false);
  });

  it('rejette sans moyenne de page connue', () => {
    expect(isGemRelativeToPageAverage({ kudos: 20, hits: 100, bookmarks: 1 }, null, 1.5)).toBe(false);
  });

  it('respecte toujours le plafond de popularité', () => {
    expect(isGemRelativeToPageAverage({ kudos: 500, hits: 2000, bookmarks: 300 }, 0.10, 1.5)).toBe(false);
  });

  it('accepte des seuils personnalisés', () => {
    const thresholds = { ...DEFAULT_GEM_THRESHOLDS, minHits: 5, minKudos: 1 };
    expect(isGemRelativeToPageAverage({ kudos: 3, hits: 10, bookmarks: 0 }, 0.10, 1.5, thresholds)).toBe(true);
  });
});
