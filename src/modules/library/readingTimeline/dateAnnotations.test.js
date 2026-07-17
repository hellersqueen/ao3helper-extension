import { describe, it, expect, beforeEach } from 'vitest';
import { loadAnnotations, getAnnotation, setAnnotation, clearAnnotation } from './dateAnnotations.js';

beforeEach(() => localStorage.clear());

describe('setAnnotation / getAnnotation', () => {
  it('enregistre et relit une annotation', () => {
    setAnnotation('2026-01-01', 'Holiday binge-read');
    expect(getAnnotation('2026-01-01')).toBe('Holiday binge-read');
  });

  it('coupe le texte à 140 caractères', () => {
    setAnnotation('2026-01-01', 'x'.repeat(200));
    expect(getAnnotation('2026-01-01').length).toBe(140);
  });

  it('rogne les espaces', () => {
    setAnnotation('2026-01-01', '  hello  ');
    expect(getAnnotation('2026-01-01')).toBe('hello');
  });

  it('ignore sans dateKey', () => {
    setAnnotation('', 'text');
    expect(loadAnnotations()).toEqual({});
  });

  it('un texte vide supprime l\'annotation existante', () => {
    setAnnotation('2026-01-01', 'note');
    setAnnotation('2026-01-01', '   ');
    expect(getAnnotation('2026-01-01')).toBe('');
    expect(loadAnnotations()).toEqual({});
  });
});

describe('clearAnnotation', () => {
  it('supprime une annotation', () => {
    setAnnotation('2026-01-01', 'note');
    clearAnnotation('2026-01-01');
    expect(getAnnotation('2026-01-01')).toBe('');
  });
});

describe('loadAnnotations', () => {
  it('objet vide sans données ou sur JSON invalide', () => {
    expect(loadAnnotations()).toEqual({});
    localStorage.setItem('ao3h:readingTimeline:annotations', '{not json');
    expect(loadAnnotations()).toEqual({});
    localStorage.setItem('ao3h:readingTimeline:annotations', '[1,2,3]');
    expect(loadAnnotations()).toEqual({});
  });
});
