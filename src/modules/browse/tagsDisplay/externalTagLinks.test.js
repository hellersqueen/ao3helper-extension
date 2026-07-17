// @ts-nocheck
import { describe, it, expect } from 'vitest';
import { buildFanloreSearchUrl, buildTvTropesSearchUrl } from './externalTagLinks.js';

describe('buildFanloreSearchUrl', () => {
  it('construit une URL de recherche Fanlore encodée', () => {
    expect(buildFanloreSearchUrl('Enemies to Lovers')).toBe(
      'https://fanlore.org/index.php?search=Enemies%20to%20Lovers'
    );
  });

  it('encode les caractères spéciaux (espaces, esperluette, slash)', () => {
    expect(buildFanloreSearchUrl('Fix-It & Angst/Comfort')).toBe(
      'https://fanlore.org/index.php?search=Fix-It%20%26%20Angst%2FComfort'
    );
  });
});

describe('buildTvTropesSearchUrl', () => {
  it('construit une URL de recherche TV Tropes encodée', () => {
    expect(buildTvTropesSearchUrl('Enemies to Lovers')).toBe(
      'https://tvtropes.org/pmwiki/results_search.php?q=Enemies%20to%20Lovers'
    );
  });
});
