import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { relativeDate, daysAgo, formatDate } from './format-date.js';

const DAY_MS = 86400000;

describe('relativeDate', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-16T12:00:00Z'));
  });
  afterEach(() => vi.useRealTimers());

  it('retourne null sans timestamp', () => {
    expect(relativeDate(null)).toBeNull();
    expect(relativeDate(0)).toBeNull();
  });

  it('retourne "today" pour aujourd\'hui', () => {
    expect(relativeDate(Date.now())).toBe('today');
  });

  it('retourne "yesterday" pour hier', () => {
    expect(relativeDate(Date.now() - DAY_MS)).toBe('yesterday');
  });

  it('retourne "N days ago" en dessous de 30 jours', () => {
    expect(relativeDate(Date.now() - 5 * DAY_MS)).toBe('5 days ago');
    expect(relativeDate(Date.now() - 29 * DAY_MS)).toBe('29 days ago');
  });

  it('retourne "N months ago" entre 30 et 365 jours, avec accord singulier/pluriel', () => {
    expect(relativeDate(Date.now() - 30 * DAY_MS)).toBe('1 month ago');
    expect(relativeDate(Date.now() - 60 * DAY_MS)).toBe('2 months ago');
    expect(relativeDate(Date.now() - 200 * DAY_MS)).toBe('7 months ago');
  });

  it('retourne "N years ago" au-delà de 365 jours, avec accord singulier/pluriel', () => {
    expect(relativeDate(Date.now() - 365 * DAY_MS)).toBe('1 year ago');
    expect(relativeDate(Date.now() - 800 * DAY_MS)).toBe('2 years ago');
  });

  it('accepte une Date en plus d\'un timestamp', () => {
    expect(relativeDate(new Date(Date.now() - DAY_MS))).toBe('yesterday');
  });

  it('mode court ("Nd ago") ignore le seuil mois/années', () => {
    expect(relativeDate(Date.now() - 5 * DAY_MS, { short: true })).toBe('5d ago');
    expect(relativeDate(Date.now() - 400 * DAY_MS, { short: true })).toBe('400d ago');
  });
});

describe('daysAgo', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-16T12:00:00Z'));
  });
  afterEach(() => vi.useRealTimers());

  it('retourne le nombre de jours entiers écoulés', () => {
    expect(daysAgo(Date.now() - 3 * DAY_MS)).toBe(3);
  });

  it('retourne null sans timestamp', () => {
    expect(daysAgo(null)).toBeNull();
  });
});

describe('formatDate', () => {
  it('format long (défaut)', () => {
    expect(formatDate('2026-01-15')).toBe('January 15, 2026');
  });

  it('format court (en-CA, YYYY-MM-DD)', () => {
    expect(formatDate('2026-01-15', 'short')).toBe('2026-01-15');
  });

  it('ancre les dates YYYY-MM-DD à minuit local (pas de décalage UTC)', () => {
    // Sans l'ancrage T00:00:00, `new Date('2026-01-15')` est interprété en
    // UTC et peut reculer d'un jour dans un fuseau à l'ouest de UTC.
    expect(formatDate('2026-01-15')).toContain('15');
  });

  it('format relative délègue à relativeDate', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-16T12:00:00Z'));
    expect(formatDate(Date.now() - DAY_MS, 'relative')).toBe('yesterday');
    vi.useRealTimers();
  });

  it('retourne l\'entrée telle quelle si le parsing échoue', () => {
    expect(formatDate(undefined)).toBe('Invalid Date');
  });
});
