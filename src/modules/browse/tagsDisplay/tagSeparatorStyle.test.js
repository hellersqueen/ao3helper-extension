// @ts-nocheck
import { describe, it, expect } from 'vitest';
import { buildSeparatorCssValue, DEFAULT_SEPARATOR } from './tagSeparatorStyle.js';

describe('buildSeparatorCssValue', () => {
  it('enveloppe le texte dans des guillemets doubles', () => {
    expect(buildSeparatorCssValue(' | ')).toBe('" | "');
  });

  it('échappe les guillemets doubles présents dans le texte', () => {
    expect(buildSeparatorCssValue('a"b')).toBe('"a\\"b"');
  });

  it('échappe les antislashs présents dans le texte', () => {
    expect(buildSeparatorCssValue('a\\b')).toBe('"a\\\\b"');
  });

  it('gère une chaîne vide (aucun séparateur)', () => {
    expect(buildSeparatorCssValue('')).toBe('""');
  });

  it('gère null/undefined comme une chaîne vide', () => {
    expect(buildSeparatorCssValue(null)).toBe('""');
    expect(buildSeparatorCssValue(undefined)).toBe('""');
  });

  it('DEFAULT_SEPARATOR correspond au séparateur AO3 par défaut', () => {
    expect(DEFAULT_SEPARATOR).toBe(', ');
  });
});
