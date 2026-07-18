import { describe, it, expect } from 'vitest';
import { parsePreferredPovs } from './povPreferences.js';

describe('parsePreferredPovs', () => {
  it('parse une liste séparée par des virgules', () => {
    expect(parsePreferredPovs('first,third')).toEqual(['first', 'third']);
  });

  it('normalise casse et espaces', () => {
    expect(parsePreferredPovs(' First , Third ')).toEqual(['first', 'third']);
  });

  it('ignore les clés inconnues et les segments vides', () => {
    expect(parsePreferredPovs('first,,bogus,third')).toEqual(['first', 'third']);
  });

  it('retourne un tableau vide pour une entrée vide ou nulle', () => {
    expect(parsePreferredPovs('')).toEqual([]);
    expect(parsePreferredPovs(undefined)).toEqual([]);
  });
});
