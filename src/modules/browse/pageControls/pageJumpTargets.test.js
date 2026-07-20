import { describe, it, expect } from 'vitest';
import { clampPage, normalizeStep, percentPage, randomPage } from './_pageControls.js';

describe('clampPage', () => {
  it('borne dans [1, max]', () => {
    expect(clampPage(5, 10)).toBe(5);
    expect(clampPage(0, 10)).toBe(1);
    expect(clampPage(-3, 10)).toBe(1);
    expect(clampPage(15, 10)).toBe(10);
    expect(clampPage(NaN, 10)).toBe(1);
  });
});

describe('normalizeStep', () => {
  it('accepte les pas raisonnables et retombe sur le défaut sinon', () => {
    expect(normalizeStep(25, 10)).toBe(25);
    expect(normalizeStep('50', 10)).toBe(50);
    expect(normalizeStep(0, 10)).toBe(10);
    expect(normalizeStep(-5, 10)).toBe(10);
    expect(normalizeStep('abc', 10)).toBe(10);
    expect(normalizeStep(99999, 10)).toBe(10);
  });
});

describe('percentPage', () => {
  it('calcule la page à une fraction de la liste', () => {
    expect(percentPage(0.25, 200)).toBe(50);
    expect(percentPage(0.5, 200)).toBe(100);
    expect(percentPage(0.75, 200)).toBe(150);
    expect(percentPage(0.5, 3)).toBe(2);
    expect(percentPage(0.25, 1)).toBe(1);
  });
});

describe('randomPage', () => {
  it('reste dans [1, max]', () => {
    for (let i = 0; i < 50; i++) {
      const p = randomPage(3, 10);
      expect(p).toBeGreaterThanOrEqual(1);
      expect(p).toBeLessThanOrEqual(10);
    }
  });

  it('évite la page courante quand il y a plusieurs pages', () => {
    // rng qui viserait exactement la page courante (3 sur 10)
    expect(randomPage(3, 10, () => 0.25)).not.toBe(3);
    // page courante = max : bascule vers max-1
    expect(randomPage(10, 10, () => 0.999)).toBe(9);
  });

  it('retourne 1 quand il n\'y a qu\'une page', () => {
    expect(randomPage(1, 1)).toBe(1);
  });
});
