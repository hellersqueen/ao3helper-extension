import { describe, it, expect, beforeEach } from 'vitest';
import { loadPresets, savePreset, getPreset, deletePreset } from './filterPresets.js';

beforeEach(() => localStorage.clear());

describe('savePreset / getPreset', () => {
  it('enregistre et relit un preset nommé', () => {
    savePreset('Angst only', { fandom: 'Star Wars', ratings: ['Explicit'] });
    expect(getPreset('Angst only')).toEqual({ name: 'Angst only', criteria: { fandom: 'Star Wars', ratings: ['Explicit'] } });
  });

  it('remplace un preset existant du même nom', () => {
    savePreset('Favs', { fandom: 'A' });
    savePreset('Favs', { fandom: 'B' });
    const presets = loadPresets();
    expect(presets.length).toBe(1);
    expect(presets[0].criteria.fandom).toBe('B');
  });

  it('ignore un nom vide', () => {
    savePreset('   ', { fandom: 'A' });
    expect(loadPresets()).toEqual([]);
  });

  it('null pour un preset inconnu', () => {
    expect(getPreset('does not exist')).toBeNull();
  });

  it('plafonne à 20 presets (les plus anciens tombent)', () => {
    for (let i = 0; i < 25; i++) savePreset(`Preset ${i}`, {});
    const presets = loadPresets();
    expect(presets.length).toBe(20);
    expect(presets[0].name).toBe('Preset 5');
    expect(presets[19].name).toBe('Preset 24');
  });
});

describe('deletePreset', () => {
  it('supprime un preset par son nom', () => {
    savePreset('A', {}); savePreset('B', {});
    deletePreset('A');
    expect(loadPresets().map(p => p.name)).toEqual(['B']);
  });
});
