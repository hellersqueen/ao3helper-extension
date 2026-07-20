import { describe, it, expect } from 'vitest';
import { countOccurrences } from './_visualPreferences.js';

describe('countOccurrences', () => {
  it('compte les occurrences en mot entier, insensible à la casse', () => {
    expect(countOccurrences('Harry saw harry run. HARRY!', 'harry')).toBe(3);
  });

  it('ne compte pas les correspondances partielles', () => {
    expect(countOccurrences('Harrison met Harry', 'Harry')).toBe(1);
  });

  it('gère les phrases multi-mots comme une chaîne littérale', () => {
    expect(countOccurrences('Harry Potter and Harry Potter again', 'Harry Potter')).toBe(2);
    expect(countOccurrences('Harry and Potter separately', 'Harry Potter')).toBe(0);
  });

  it('retourne 0 pour un mot vide ou un texte vide', () => {
    expect(countOccurrences('some text', '')).toBe(0);
    expect(countOccurrences('', 'word')).toBe(0);
    expect(countOccurrences('', '')).toBe(0);
  });

  it('échappe les caractères spéciaux regex dans le mot cherché', () => {
    expect(countOccurrences('a well-known fact and a well-known fic', 'well-known')).toBe(2);
    // sans échappement, "." dans le motif matcherait n'importe quel caractère
    expect(countOccurrences('a.b then axb then a.b', 'a.b')).toBe(2);
  });

  it('ne plante pas et retourne 0 sur une entrée non exploitable', () => {
    expect(countOccurrences(null, 'x')).toBe(0);
    expect(countOccurrences('text', null)).toBe(0);
  });
});
