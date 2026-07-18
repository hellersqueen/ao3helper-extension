import { describe, it, expect } from 'vitest';
import {
  SPEED_PRESETS,
  clampRange,
  clampVolume,
  clampPitch,
  computeFadeFactor,
  nextSleepEnd,
  clampSentenceIndex,
} from './playbackHelpers.js';

describe('SPEED_PRESETS', () => {
  it('définit quatre profils de vitesse ordonnés', () => {
    expect(SPEED_PRESETS.comfortable).toBeLessThan(SPEED_PRESETS.normal);
    expect(SPEED_PRESETS.normal).toBeLessThan(SPEED_PRESETS.fast);
    expect(SPEED_PRESETS.fast).toBeLessThan(SPEED_PRESETS.audiobook);
  });
});

describe('clampRange', () => {
  it('garde une valeur déjà dans les bornes', () => {
    expect(clampRange(0.5, 0, 1, 1)).toBe(0.5);
  });
  it('ramène une valeur trop haute au maximum', () => {
    expect(clampRange(5, 0, 1, 1)).toBe(1);
  });
  it('ramène une valeur trop basse au minimum', () => {
    expect(clampRange(-2, 0, 1, 1)).toBe(0);
  });
  it('retombe sur le fallback si la valeur est invalide', () => {
    expect(clampRange('oops', 0, 1, 0.7)).toBe(0.7);
    expect(clampRange(undefined, 0, 1, 0.7)).toBe(0.7);
  });
});

describe('clampVolume / clampPitch', () => {
  it('clampVolume borne entre 0 et 1', () => {
    expect(clampVolume(2)).toBe(1);
    expect(clampVolume(-1)).toBe(0);
    expect(clampVolume(0.3)).toBe(0.3);
  });
  it('clampPitch borne entre 0 et 2', () => {
    expect(clampPitch(5)).toBe(2);
    expect(clampPitch(-1)).toBe(0);
    expect(clampPitch(1.4)).toBe(1.4);
  });
});

describe('computeFadeFactor', () => {
  it('reste à pleine puissance avant le début du fondu', () => {
    expect(computeFadeFactor(20000, 8000)).toBe(1);
  });
  it('descend linéairement pendant la fenêtre de fondu', () => {
    expect(computeFadeFactor(4000, 8000)).toBe(0.5);
  });
  it('atteint 0 quand le temps restant est écoulé ou négatif', () => {
    expect(computeFadeFactor(0, 8000)).toBe(0);
    expect(computeFadeFactor(-500, 8000)).toBe(0);
  });
  it('ignore le fondu si aucune minuterie active', () => {
    expect(computeFadeFactor(null, 8000)).toBe(1);
    expect(computeFadeFactor(5000, 0)).toBe(1);
  });
});

describe('nextSleepEnd', () => {
  it("prolonge une minuterie encore active à partir de son échéance", () => {
    const now = 1000;
    const currentEnd = now + 60000;
    expect(nextSleepEnd(currentEnd, 5, now)).toBe(currentEnd + 5 * 60000);
  });
  it("repart de maintenant si la minuterie est déjà expirée", () => {
    const now = 100000;
    expect(nextSleepEnd(now - 1000, 5, now)).toBe(now + 5 * 60000);
  });
});

describe('clampSentenceIndex', () => {
  it('borne un index dans la liste', () => {
    expect(clampSentenceIndex(3, 10)).toBe(3);
    expect(clampSentenceIndex(-1, 10)).toBe(0);
    expect(clampSentenceIndex(99, 10)).toBe(9);
  });
  it('retourne 0 si la liste est vide', () => {
    expect(clampSentenceIndex(5, 0)).toBe(0);
  });
});
