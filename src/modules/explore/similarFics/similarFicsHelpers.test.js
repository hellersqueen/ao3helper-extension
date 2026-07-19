import { describe, it, expect } from 'vitest';
import {
  getWordRangeForMode, minScoreForStyle, scoreWork, passesLengthFilter,
  buildReasonText, filterDismissed, addDismissed, parseSeriesPartOf,
} from './similarFicsHelpers.js';

describe('getWordRangeForMode', () => {
  it('force une fourchette basse pour "quick"', () => {
    expect(getWordRangeForMode(50_000, 'quick')).toEqual({ from: 0, to: 10_000 });
  });

  it('force une fourchette haute pour "epic"', () => {
    expect(getWordRangeForMode(5_000, 'epic')).toEqual({ from: 100_000, to: null });
  });

  it('décale la fourchette vers le bas pour "shorter"', () => {
    const { from, to } = getWordRangeForMode(20_000, 'shorter');
    expect(from).toBe(0);
    expect(to).toBeLessThan(20_000);
  });

  it('décale la fourchette vers le haut pour "longer"', () => {
    const { from, to } = getWordRangeForMode(20_000, 'longer');
    expect(from).toBeGreaterThan(20_000);
    expect(to).toBeNull();
  });

  it('garde le comportement historique par bucket pour "similar"', () => {
    expect(getWordRangeForMode(8_000, 'similar')).toEqual({ from: 5_500, to: 10_500 });
  });

  it('renvoie null/null pour un nombre de mots invalide', () => {
    expect(getWordRangeForMode(0, 'similar')).toEqual({ from: null, to: null });
    expect(getWordRangeForMode(null, 'shorter')).toEqual({ from: null, to: null });
  });
});

describe('minScoreForStyle', () => {
  it('exige un score plus élevé pour "close"', () => {
    expect(minScoreForStyle('close')).toBe(80);
  });
  it('tolère un score plus bas pour "variety"', () => {
    expect(minScoreForStyle('variety')).toBe(50);
  });
  it('retombe sur le seuil historique pour "balanced"', () => {
    expect(minScoreForStyle('balanced')).toBe(70);
    expect(minScoreForStyle()).toBe(70);
  });
});

describe('scoreWork', () => {
  const blurb = {
    fandoms: ['Harry Potter'],
    relationships: ['Harry Potter/Draco Malfoy'],
    freeforms: ['Angst', 'Fluff'],
    wordCount: 20_000,
  };

  it('donne plus de poids à un tag de relation partagé qu’à un tag additionnel', () => {
    const withRel = scoreWork(blurb, { relationshipTags: ['Harry Potter/Draco Malfoy'], otherTags: [] });
    const withOther = scoreWork(blurb, { relationshipTags: [], otherTags: ['Angst'] });
    expect(withRel.score).toBeGreaterThan(withOther.score);
  });

  it('ajoute un bonus fandom quand le fandom correspond', () => {
    const { score, reasons } = scoreWork(blurb, { fandomTag: 'Harry Potter', relationshipTags: [], otherTags: [] });
    expect(score).toBe(40);
    expect(reasons).toContain('fandom');
  });

  it('ajoute un bonus de longueur proportionnel à la proximité', () => {
    const close = scoreWork(blurb, { words: 22_000, relationshipTags: [], otherTags: [] });
    const far = scoreWork(blurb, { words: 100_000, relationshipTags: [], otherTags: [] });
    expect(close.score).toBeGreaterThan(far.score);
  });

  it('renvoie relMatchCount pour distinguer les pairings', () => {
    const { relMatchCount } = scoreWork(blurb, { relationshipTags: ['Harry Potter/Draco Malfoy'], otherTags: [] });
    expect(relMatchCount).toBe(1);
  });
});

describe('passesLengthFilter', () => {
  it('exige environ 20% d’écart max en mode "similar"', () => {
    expect(passesLengthFilter({ wordCount: 21_000 }, 20_000, 'similar')).toBe(true);
    expect(passesLengthFilter({ wordCount: 5_000 }, 20_000, 'similar')).toBe(false);
  });

  it('ne filtre rien pour les autres modes', () => {
    expect(passesLengthFilter({ wordCount: 5_000 }, 20_000, 'epic')).toBe(true);
  });
});

describe('buildReasonText', () => {
  it('traduit les raisons brutes en phrases lisibles', () => {
    expect(buildReasonText(['fandom', '2 pairing tags', 'length'])).toBe('same fandom, shares 2 pairing tags, similar length');
  });

  it('gère le singulier', () => {
    expect(buildReasonText(['1 pairing tags'])).toBe('shares a pairing tag');
    expect(buildReasonText(['1 tags'])).toBe('shares 1 tag');
  });

  it('renvoie une chaîne vide sans raison', () => {
    expect(buildReasonText([])).toBe('');
    expect(buildReasonText()).toBe('');
  });
});

describe('filterDismissed / addDismissed', () => {
  it('retire les œuvres écartées', () => {
    const items = [{ workId: '1' }, { workId: '2' }];
    expect(filterDismissed(items, new Set(['1']))).toEqual([{ workId: '2' }]);
  });

  it('ne filtre rien sans ensemble d’exclusions', () => {
    const items = [{ workId: '1' }];
    expect(filterDismissed(items, new Set())).toBe(items);
  });

  it('ajoute et déduplique, plafonné à cap', () => {
    expect(addDismissed(['1', '2'], '1')).toEqual(['1', '2']);
    expect(addDismissed(['1', '2'], '3', 2)).toEqual(['3', '1']);
  });
});

describe('parseSeriesPartOf', () => {
  it('extrait la position dans une série', () => {
    expect(parseSeriesPartOf('Part 3 of 10 in My Series')).toEqual({ part: 3, total: 10 });
  });

  it('renvoie null sans correspondance', () => {
    expect(parseSeriesPartOf('Not a series')).toBeNull();
  });
});
