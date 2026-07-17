// @ts-nocheck
import { describe, it, expect } from 'vitest';
import {
  CATEGORY_SETTINGS,
  enabledCompactCategories,
  isCompactToggleShortcut,
} from './compactModeTags.js';

describe('enabledCompactCategories', () => {
  it('retourne toutes les catégories quand tout est activé (défaut)', () => {
    const getSetting = (key, fallback) => fallback;
    expect(enabledCompactCategories(getSetting).sort()).toEqual(
      Object.keys(CATEGORY_SETTINGS).sort()
    );
  });

  it('exclut une catégorie désactivée', () => {
    const getSetting = (key) => key !== 'compactCatRelationships';
    expect(enabledCompactCategories(getSetting)).not.toContain('relationships');
    expect(enabledCompactCategories(getSetting)).toContain('characters');
  });

  it('retourne un tableau vide si tout est désactivé', () => {
    const getSetting = () => false;
    expect(enabledCompactCategories(getSetting)).toEqual([]);
  });

  it('utilise le bon nom de réglage pour chaque catégorie', () => {
    const seen = [];
    const getSetting = (key) => { seen.push(key); return true; };
    enabledCompactCategories(getSetting);
    expect(seen.sort()).toEqual(Object.values(CATEGORY_SETTINGS).sort());
  });
});

function makeEvent(overrides = {}) {
  return {
    key: 't',
    altKey: true,
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
    target: document.createElement('body'),
    ...overrides,
  };
}

describe('isCompactToggleShortcut', () => {
  it('accepte Alt+T', () => {
    expect(isCompactToggleShortcut(makeEvent())).toBe(true);
  });

  it('accepte Alt+t majuscule aussi', () => {
    expect(isCompactToggleShortcut(makeEvent({ key: 'T' }))).toBe(true);
  });

  it('refuse sans Alt', () => {
    expect(isCompactToggleShortcut(makeEvent({ altKey: false }))).toBe(false);
  });

  it('refuse avec Ctrl, Shift ou Meta en plus', () => {
    expect(isCompactToggleShortcut(makeEvent({ ctrlKey: true }))).toBe(false);
    expect(isCompactToggleShortcut(makeEvent({ shiftKey: true }))).toBe(false);
    expect(isCompactToggleShortcut(makeEvent({ metaKey: true }))).toBe(false);
  });

  it('refuse une autre touche', () => {
    expect(isCompactToggleShortcut(makeEvent({ key: 'a' }))).toBe(false);
  });

  it('refuse quand le focus est dans un champ de saisie', () => {
    const input = document.createElement('input');
    expect(isCompactToggleShortcut(makeEvent({ target: input }))).toBe(false);
    const textarea = document.createElement('textarea');
    expect(isCompactToggleShortcut(makeEvent({ target: textarea }))).toBe(false);
  });

  it('refuse quand le focus est sur un élément contentEditable', () => {
    const div = document.createElement('div');
    Object.defineProperty(div, 'isContentEditable', { value: true });
    expect(isCompactToggleShortcut(makeEvent({ target: div }))).toBe(false);
  });

  it('refuse un événement null/undefined', () => {
    expect(isCompactToggleShortcut(null)).toBe(false);
    expect(isCompactToggleShortcut(undefined)).toBe(false);
  });
});
