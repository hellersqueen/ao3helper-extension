// @ts-nocheck
import { describe, expect, it } from 'vitest';
import {
  findMatchingRule, isExcludedCategory, matchesPattern, sortAlphabetical,
  sortByImportance, sortByLength, TAG_CATEGORIES,
} from './tagRules.js';

const getKey = value => value;
const makeLi = className => {
  const li = document.createElement('li');
  li.className = className;
  return li;
};

describe('category filtering', () => {
  it('reconnaît les catégories exclues', () => {
    expect(isExcludedCategory(makeLi('freeforms'), ['freeforms'])).toBe(true);
    expect(isExcludedCategory(makeLi('characters'), ['freeforms'])).toBe(false);
    expect(isExcludedCategory(makeLi('relationships'), ['freeforms', 'relationships'])).toBe(true);
  });

  it('gère les entrées invalides', () => {
    expect(isExcludedCategory(makeLi('freeforms'), [])).toBe(false);
    expect(isExcludedCategory(makeLi('freeforms'), null)).toBe(false);
    expect(isExcludedCategory(null, ['freeforms'])).toBe(false);
    expect(isExcludedCategory({}, ['freeforms'])).toBe(false);
  });

  it('expose les quatre catégories AO3', () => {
    expect(TAG_CATEGORIES).toEqual(['warnings', 'relationships', 'characters', 'freeforms']);
  });
});

describe('sorting', () => {
  it('trie alphabétiquement sans muter la source', () => {
    const source = ['banana', 'Apple', 'cherry'];
    expect(sortAlphabetical(source, getKey)).toEqual(['Apple', 'banana', 'cherry']);
    expect(source).toEqual(['banana', 'Apple', 'cherry']);
  });

  it('trie par longueur dans les deux sens', () => {
    expect(sortByLength(['ccc', 'a', 'bb'], getKey)).toEqual(['a', 'bb', 'ccc']);
    expect(sortByLength(['ccc', 'a', 'bb'], getKey, { longestFirst: true })).toEqual(['ccc', 'bb', 'a']);
  });

  it('place les éléments importants en premier de façon stable', () => {
    const important = value => value === 'b' || value === 'd';
    expect(sortByImportance(['a', 'b', 'c', 'd'], getKey, important)).toEqual(['b', 'd', 'a', 'c']);
    expect(sortByImportance(['a', 'b'], getKey, () => false)).toEqual(['a', 'b']);
    expect(sortByImportance(['a', 'b'], getKey, () => true)).toEqual(['a', 'b']);
  });
});

describe('highlight matching', () => {
  it('gère les correspondances exactes et les wildcards', () => {
    expect(matchesPattern('Enemies to Lovers', 'enemies to lovers')).toBe(true);
    expect(matchesPattern('Alternate Universe - Coffee Shop', 'Alternate Universe -*')).toBe(true);
    expect(matchesPattern('Fix-It Fic', '*Fic')).toBe(true);
    expect(matchesPattern('James/Lily', 'James/*')).toBe(true);
    expect(matchesPattern('Canon Divergence', 'Alternate Universe -*')).toBe(false);
  });

  it('échappe les caractères de regex et rejette les entrées invalides', () => {
    expect(matchesPattern('C++ Enthusiasts', 'C++ Enthusiasts')).toBe(true);
    expect(matchesPattern('C++ Enthusiasts', 'C+ Enthusiasts')).toBe(false);
    expect(matchesPattern(null, 'foo')).toBe(false);
    expect(matchesPattern('foo', null)).toBe(false);
    expect(matchesPattern('foo', '')).toBe(false);
  });

  it('retourne la première règle correspondante', () => {
    const rules = [{ pattern: 'Fluff*' }, { pattern: 'Fluff and Angst' }];
    expect(findMatchingRule('Fluff and Angst', rules)).toBe(rules[0]);
    expect(findMatchingRule('Angst', rules)).toBeNull();
    expect(findMatchingRule('Fluff', null)).toBeNull();
  });
});
