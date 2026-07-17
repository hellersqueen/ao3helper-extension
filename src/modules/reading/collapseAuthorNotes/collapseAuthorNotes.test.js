import { describe, it, expect } from 'vitest';
import {
  containsWarningText,
  exceedsMinLength,
  matchesKeywords,
} from './collapseAuthorNotes.js';

describe('containsWarningText', () => {
  it('détecte TW/CW et leurs formes longues', () => {
    expect(containsWarningText('TW: spiders')).toBe(true);
    expect(containsWarningText('cw blood')).toBe(true);
    expect(containsWarningText('Trigger Warning inside')).toBe(true);
    expect(containsWarningText('content  warning: x')).toBe(true);
  });

  it('ne matche pas les mots contenant tw/cw', () => {
    expect(containsWarningText('between the lines')).toBe(false);
    expect(containsWarningText('')).toBe(false);
    expect(containsWarningText(null)).toBe(false);
  });
});

describe('matchesKeywords', () => {
  it('accepte une liste séparée par des virgules, sans tenir compte de la casse', () => {
    expect(matchesKeywords('Link to the SEQUEL here', 'sequel, playlist')).toBe(true);
    expect(matchesKeywords('nothing to see', 'sequel, playlist')).toBe(false);
  });

  it('ne trouve rien dans une liste vide ou blanche', () => {
    expect(matchesKeywords('anything', '')).toBe(false);
    expect(matchesKeywords('anything', ' , , ')).toBe(false);
    expect(matchesKeywords('anything', null)).toBe(false);
  });
});

describe('exceedsMinLength', () => {
  it('considère un seuil nul ou invalide comme inconditionnel', () => {
    expect(exceedsMinLength('court', 0)).toBe(true);
    expect(exceedsMinLength('court', -5)).toBe(true);
    expect(exceedsMinLength('court', 'abc')).toBe(true);
  });

  it('applique le seuil à la longueur du texte nettoyé', () => {
    expect(exceedsMinLength('x'.repeat(100), 100)).toBe(true);
    expect(exceedsMinLength('x'.repeat(99), 100)).toBe(false);
    expect(exceedsMinLength('  ' + 'x'.repeat(99) + '  ', 100)).toBe(false);
  });
});
