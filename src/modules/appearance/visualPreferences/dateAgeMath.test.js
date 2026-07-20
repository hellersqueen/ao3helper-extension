import { describe, it, expect } from 'vitest';
import { dateAgeBucket } from './_visualPreferences.js';

const NOW = new Date('2026-07-17T12:00:00').getTime();

describe('dateAgeBucket', () => {
  it('today : moins de 24h', () => {
    expect(dateAgeBucket('2026-07-17T08:00:00', NOW)).toBe('today');
    expect(dateAgeBucket(new Date(NOW - 3600_000), NOW)).toBe('today');
  });

  it('week : entre 1 et 6 jours', () => {
    expect(dateAgeBucket(new Date(NOW - 3 * 86400000), NOW)).toBe('week');
    expect(dateAgeBucket(new Date(NOW - 6 * 86400000), NOW)).toBe('week');
  });

  it('month : entre 7 et 29 jours', () => {
    expect(dateAgeBucket(new Date(NOW - 10 * 86400000), NOW)).toBe('month');
    expect(dateAgeBucket(new Date(NOW - 29 * 86400000), NOW)).toBe('month');
  });

  it('older : 30 jours ou plus', () => {
    expect(dateAgeBucket(new Date(NOW - 30 * 86400000), NOW)).toBe('older');
    expect(dateAgeBucket(new Date(NOW - 365 * 86400000), NOW)).toBe('older');
  });

  it('une date future ou du jour même (décalage horloge) reste "today"', () => {
    expect(dateAgeBucket(new Date(NOW + 3600_000), NOW)).toBe('today');
  });

  it('retourne null pour une date invalide', () => {
    expect(dateAgeBucket('pas une date', NOW)).toBeNull();
    expect(dateAgeBucket('', NOW)).toBeNull();
  });
});
