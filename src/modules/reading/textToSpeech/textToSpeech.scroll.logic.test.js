import { describe, it, expect } from 'vitest';
import { SCROLL_DURATIONS, getScrollDuration, easeInOutQuad, computeScrollY } from './_textToSpeech.js';

describe('getScrollDuration', () => {
  it('associe chaque vitesse à une durée croissante', () => {
    expect(getScrollDuration('fast')).toBeLessThan(getScrollDuration('normal'));
    expect(getScrollDuration('normal')).toBeLessThan(getScrollDuration('slow'));
  });
  it('retombe sur "normal" pour une valeur inconnue', () => {
    expect(getScrollDuration('warp-speed')).toBe(SCROLL_DURATIONS.normal);
    expect(getScrollDuration(undefined)).toBe(SCROLL_DURATIONS.normal);
  });
});

describe('easeInOutQuad', () => {
  it('commence à 0 et termine à 1', () => {
    expect(easeInOutQuad(0)).toBe(0);
    expect(easeInOutQuad(1)).toBe(1);
  });
  it('est symétrique autour du milieu', () => {
    expect(easeInOutQuad(0.5)).toBeCloseTo(0.5);
  });
  it('borne les valeurs hors de [0,1]', () => {
    expect(easeInOutQuad(-1)).toBe(0);
    expect(easeInOutQuad(2)).toBe(1);
  });
});

describe('computeScrollY', () => {
  it('démarre à la position de départ', () => {
    expect(computeScrollY(0, 100, 0, 500)).toBe(0);
  });
  it('atteint la position cible à la fin de la durée', () => {
    expect(computeScrollY(0, 100, 500, 500)).toBe(100);
  });
  it('retourne directement la cible pour une durée nulle', () => {
    expect(computeScrollY(0, 100, 0, 0)).toBe(100);
  });
});
