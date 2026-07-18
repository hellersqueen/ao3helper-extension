import { describe, it, expect } from 'vitest';
import { getVoiceLanguages, filterVoicesByLang, formatVoiceLabel } from './voiceHelpers.js';

const voices = [
  { name: 'Alex',   lang: 'en-US', localService: true,  default: true },
  { name: 'Samira', lang: 'fr-FR', localService: true,  default: false },
  { name: 'Aria',   lang: 'en-US', localService: false, default: false },
];

describe('getVoiceLanguages', () => {
  it('retourne la liste triée des langues distinctes', () => {
    expect(getVoiceLanguages(voices)).toEqual(['en-US', 'fr-FR']);
  });
  it('gère une liste vide ou absente', () => {
    expect(getVoiceLanguages([])).toEqual([]);
    expect(getVoiceLanguages(undefined)).toEqual([]);
  });
});

describe('filterVoicesByLang', () => {
  it('filtre les voix sur la langue demandée', () => {
    expect(filterVoicesByLang(voices, 'en-US')).toEqual([voices[0], voices[2]]);
  });
  it('retourne toutes les voix si aucune langue n’est choisie', () => {
    expect(filterVoicesByLang(voices, '')).toBe(voices);
  });
});

describe('formatVoiceLabel', () => {
  it('marque les voix locales et par défaut', () => {
    expect(formatVoiceLabel(voices[0])).toBe('Alex (en-US) — Local · Default');
  });
  it('marque les voix réseau sans le tag par défaut', () => {
    expect(formatVoiceLabel(voices[2])).toBe('Aria (en-US) — Network');
  });
  it('retourne une chaîne vide si aucune voix', () => {
    expect(formatVoiceLabel(null)).toBe('');
  });
});
