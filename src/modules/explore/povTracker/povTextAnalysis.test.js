import { describe, it, expect } from 'vitest';
import { countPronouns, classifyByPronounCounts, analyzeChapterText, MIN_ANALYZABLE_CHARS } from './povTextAnalysis.js';

describe('countPronouns', () => {
  it('compte les pronoms de chaque personne, insensible à la casse', () => {
    expect(countPronouns('I went to my house, then I saw myself in the mirror.'))
      .toEqual({ first: 4, second: 0, third: 0 });
    expect(countPronouns('You took your book to yourself.'))
      .toEqual({ first: 0, second: 3, third: 0 });
    expect(countPronouns('She gave her book to him and his friend.'))
      .toEqual({ first: 0, second: 0, third: 4 });
  });

  it('retourne des zéros pour un texte vide ou sans pronom', () => {
    expect(countPronouns('')).toEqual({ first: 0, second: 0, third: 0 });
    expect(countPronouns('The cat sat on the mat.')).toEqual({ first: 0, second: 0, third: 0 });
  });
});

describe('classifyByPronounCounts', () => {
  it('retourne null quand il n’y a aucun pronom', () => {
    expect(classifyByPronounCounts({ first: 0, second: 0, third: 0 })).toBeNull();
  });

  it('détecte une dominante nette avec confiance haute', () => {
    expect(classifyByPronounCounts({ first: 20, second: 0, third: 1 }))
      .toEqual({ pov: 'first', confidence: 'high' });
  });

  it('détecte une dominante faible avec confiance basse', () => {
    expect(classifyByPronounCounts({ first: 7, second: 0, third: 2 }))
      .toEqual({ pov: 'first', confidence: 'low' });
  });

  it('classe "mixed" quand deux personnes sont fortement représentées', () => {
    expect(classifyByPronounCounts({ first: 5, second: 0, third: 5 }))
      .toEqual({ pov: 'mixed', confidence: 'low' });
  });
});

describe('analyzeChapterText', () => {
  it('retourne null sous le seuil minimal de caractères', () => {
    const short = 'I said hi.';
    expect(short.length).toBeLessThan(MIN_ANALYZABLE_CHARS);
    expect(analyzeChapterText(short)).toBeNull();
  });

  it('retourne null pour un texte long mais sans pronom', () => {
    const text = 'The cat sat on the mat. '.repeat(20);
    expect(analyzeChapterText(text)).toBeNull();
  });

  it('analyse un texte long dominé par la première personne', () => {
    const text = 'I walked to my car and thought about my day. '.repeat(20);
    const result = analyzeChapterText(text);
    expect(result.pov).toBe('first');
    expect(result.confidence).toBe('high');
    expect(result.sampleSize).toBeGreaterThan(0);
  });
});
