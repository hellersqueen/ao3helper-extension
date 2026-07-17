// @ts-nocheck
import { describe, it, expect } from 'vitest';
import { PALETTES, getPalette, DEFAULT_PALETTE_NAME } from './tagHighlighting.js';

describe('PALETTES', () => {
  it('chaque palette a exactement 6 couleurs', () => {
    for (const [name, colors] of Object.entries(PALETTES)) {
      expect(colors.length, `palette "${name}"`).toBe(6);
    }
  });

  it('chaque couleur a un nom, un fond et une bordure', () => {
    for (const colors of Object.values(PALETTES)) {
      for (const c of colors) {
        expect(typeof c.name).toBe('string');
        expect(c.bg).toMatch(/^#[0-9a-f]{6}$/i);
        expect(c.border).toMatch(/^#[0-9a-f]{6}$/i);
      }
    }
  });

  it('les palettes gardent le même ordre de noms de couleur (Yellow/Green/Blue/Pink/Purple/Orange)', () => {
    const expectedNames = ['Yellow', 'Green', 'Blue', 'Pink', 'Purple', 'Orange'];
    for (const colors of Object.values(PALETTES)) {
      expect(colors.map(c => c.name)).toEqual(expectedNames);
    }
  });
});

describe('getPalette', () => {
  it('retourne la palette demandée', () => {
    expect(getPalette('pastel')).toBe(PALETTES.pastel);
  });

  it('retourne la palette par défaut pour un nom inconnu', () => {
    expect(getPalette('nonexistent')).toBe(PALETTES[DEFAULT_PALETTE_NAME]);
    expect(getPalette(undefined)).toBe(PALETTES[DEFAULT_PALETTE_NAME]);
  });
});
