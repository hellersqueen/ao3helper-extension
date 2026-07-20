import { describe, it, expect } from 'vitest';
import {
  parseCount,
  sumWords,
  formatReadingTime,
  unavailableParts,
  firstUnreadIndex,
  remainingParts,
  shouldAutoCollapse,
  guessSeriesType,
} from './_seriesHelper.js';

describe('parseCount', () => {
  it('lit les nombres avec séparateurs de milliers', () => {
    expect(parseCount('12,345')).toBe(12345);
    expect(parseCount(' 7 ')).toBe(7);
  });
  it('retourne null pour un texte non numérique', () => {
    expect(parseCount('abc')).toBeNull();
    expect(parseCount('')).toBeNull();
    expect(parseCount(null)).toBeNull();
  });
});

describe('sumWords', () => {
  it('additionne en ignorant les valeurs invalides', () => {
    expect(sumWords([1000, null, 500, NaN])).toBe(1500);
    expect(sumWords([])).toBe(0);
  });
});

describe('formatReadingTime', () => {
  it('affiche en minutes sous une heure', () => {
    expect(formatReadingTime(2500)).toBe('~10 min');
  });
  it('affiche en heures au-delà', () => {
    expect(formatReadingTime(150000)).toBe('~10 h');
    expect(formatReadingTime(160000)).toBe('~10 h 40 min');
  });
  it('retourne null sans mots', () => {
    expect(formatReadingTime(0)).toBeNull();
    expect(formatReadingTime(null)).toBeNull();
  });
});

describe('unavailableParts', () => {
  it('détecte les œuvres annoncées mais absentes de la liste', () => {
    expect(unavailableParts(5, 4)).toBe(1);
    expect(unavailableParts(5, 5)).toBe(0);
  });
  it('ne retourne jamais de valeur négative ni NaN', () => {
    expect(unavailableParts(4, 5)).toBe(0);
    expect(unavailableParts(null, 5)).toBe(0);
  });
});

describe('firstUnreadIndex', () => {
  it('trouve la première œuvre pas encore lue', () => {
    expect(firstUnreadIndex(['1', '2', '3'], ['1'])).toBe(1);
  });
  it('retourne 0 sans historique', () => {
    expect(firstUnreadIndex(['1', '2'], [])).toBe(0);
  });
  it('retourne -1 quand tout est lu', () => {
    expect(firstUnreadIndex(['1', '2'], ['1', '2'])).toBe(-1);
  });
});

describe('remainingParts', () => {
  it('compte les parties restantes', () => {
    expect(remainingParts(3, 5)).toBe(2);
    expect(remainingParts(5, 5)).toBe(0);
  });
  it('retourne null quand la position est inconnue', () => {
    expect(remainingParts(null, 5)).toBeNull();
  });
});

describe('shouldAutoCollapse', () => {
  it('replie automatiquement à partir du seuil', () => {
    expect(shouldAutoCollapse(5, 5, undefined)).toBe(true);
    expect(shouldAutoCollapse(4, 5, undefined)).toBe(false);
  });
  it('un choix manuel a toujours priorité', () => {
    expect(shouldAutoCollapse(10, 5, false)).toBe(false);
    expect(shouldAutoCollapse(2, 5, true)).toBe(true);
  });
  it('seuil 0 = jamais de repli automatique', () => {
    expect(shouldAutoCollapse(50, 0, undefined)).toBe(false);
  });
});

describe('guessSeriesType', () => {
  it('détecte une suite numérotée', () => {
    expect(guessSeriesType(['The Long Road: Part 1', 'The Long Road: Part 2', 'The Long Road: Part 3'])).toBe('seq');
  });
  it('détecte une suite par préfixe commun', () => {
    expect(guessSeriesType(['Roots and Branches I', 'Roots and Branches II'])).toBe('seq');
  });
  it('classe en anthologie des titres sans lien', () => {
    expect(guessSeriesType(['Coffee Shop Morning', 'A Winter Wedding', 'Ghosts of the Opera'])).toBe('anth');
  });
  it("s'abstient avec moins de deux titres", () => {
    expect(guessSeriesType(['Only One'])).toBeNull();
    expect(guessSeriesType([])).toBeNull();
  });
});
