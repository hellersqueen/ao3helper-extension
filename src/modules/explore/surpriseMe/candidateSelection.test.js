// @ts-nocheck — fichier de test, pas typé au même niveau que le code produit.
import { describe, it, expect } from 'vitest';
import { isCompleteWork, getWordCount, filterEligible, pickRandomSample } from './candidateSelection.js';

function makeBlurb({ chapters, words } = {}) {
  const li = document.createElement('li');
  li.innerHTML = `
    <dl class="stats">
      ${chapters !== undefined ? `<dd class="chapters">${chapters}</dd>` : ''}
      ${words !== undefined ? `<dd class="words">${words}</dd>` : ''}
    </dl>`;
  return li;
}

describe('isCompleteWork', () => {
  it('vrai quand chapitre courant === total ("3/3")', () => {
    expect(isCompleteWork(makeBlurb({ chapters: '3/3' }))).toBe(true);
  });

  it('faux quand incomplet ("2/?")', () => {
    expect(isCompleteWork(makeBlurb({ chapters: '2/?' }))).toBe(false);
  });

  it('faux quand incomplet ("2/5")', () => {
    expect(isCompleteWork(makeBlurb({ chapters: '2/5' }))).toBe(false);
  });

  it('faux sans dd.chapters', () => {
    expect(isCompleteWork(makeBlurb())).toBe(false);
  });
});

describe('getWordCount', () => {
  it('parse un nombre avec virgules de milliers', () => {
    expect(getWordCount(makeBlurb({ words: '12,345' }))).toBe(12345);
  });

  it('retourne 0 sans dd.words ou si non parsable', () => {
    expect(getWordCount(makeBlurb())).toBe(0);
    expect(getWordCount(makeBlurb({ words: 'n/a' }))).toBe(0);
  });
});

describe('filterEligible', () => {
  it('sans options, ne filtre rien', () => {
    const blurbs = [makeBlurb({ chapters: '1/?' }), makeBlurb({ chapters: '3/3' })];
    expect(filterEligible(blurbs)).toEqual(blurbs);
  });

  it('completedOnly ne garde que les œuvres terminées', () => {
    const done = makeBlurb({ chapters: '3/3' });
    const wip = makeBlurb({ chapters: '2/?' });
    expect(filterEligible([done, wip], { completedOnly: true })).toEqual([done]);
  });

  it('minWords exclut les œuvres trop courtes', () => {
    const short = makeBlurb({ words: '500' });
    const long = makeBlurb({ words: '5,000' });
    expect(filterEligible([short, long], { minWords: 1000 })).toEqual([long]);
  });

  it('minWords à 0 ne filtre rien (même sans dd.words)', () => {
    const blurbs = [makeBlurb(), makeBlurb({ words: '10' })];
    expect(filterEligible(blurbs, { minWords: 0 })).toEqual(blurbs);
  });

  it('combine completedOnly et minWords', () => {
    const a = makeBlurb({ chapters: '3/3', words: '100' });
    const b = makeBlurb({ chapters: '3/3', words: '5000' });
    const c = makeBlurb({ chapters: '2/?', words: '5000' });
    expect(filterEligible([a, b, c], { completedOnly: true, minWords: 1000 })).toEqual([b]);
  });
});

describe('pickRandomSample', () => {
  it('retourne n éléments distincts sans dépasser la taille de la liste', () => {
    const list = [1, 2, 3, 4, 5];
    const sample = pickRandomSample(list, 3);
    expect(sample.length).toBe(3);
    expect(new Set(sample).size).toBe(3);
    sample.forEach(x => expect(list).toContain(x));
  });

  it('plafonne à la taille de la liste si n est plus grand', () => {
    const list = [1, 2];
    const sample = pickRandomSample(list, 10);
    expect(sample.length).toBe(2);
    expect(new Set(sample)).toEqual(new Set([1, 2]));
  });

  it('retourne un tableau vide pour n <= 0 ou une liste vide', () => {
    expect(pickRandomSample([1, 2, 3], 0)).toEqual([]);
    expect(pickRandomSample([], 5)).toEqual([]);
  });

  it('ne modifie pas la liste d\'origine', () => {
    const list = [1, 2, 3];
    pickRandomSample(list, 2);
    expect(list).toEqual([1, 2, 3]);
  });
});
