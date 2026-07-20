import { describe, it, expect } from 'vitest';
import {
  parseCombo, comboToString, matchesEvent, detectConflicts,
  categoryFor, groupByCategory, actionLabel, clampPageJump,
} from './keyboardShortcuts.js';

describe('parseCombo / comboToString', () => {
  it('parse les modificateurs et la touche finale', () => {
    expect(parseCombo('Ctrl+Shift+K')).toEqual({ ctrl: true, shift: true, alt: false, key: 'K' });
    expect(parseCombo('?')).toEqual({ ctrl: false, shift: false, alt: false, key: '?' });
  });

  it('comboToString est l’inverse de parseCombo', () => {
    expect(comboToString(parseCombo('Ctrl+Shift+K'))).toBe('Ctrl+Shift+K');
    expect(comboToString(parseCombo('Shift+ArrowLeft'))).toBe('Shift+ArrowLeft');
  });
});

describe('matchesEvent', () => {
  it('reconnaît une combinaison avec modificateurs', () => {
    const combo = parseCombo('Ctrl+Shift+K');
    expect(matchesEvent(combo, { key: 'K', ctrlKey: true, shiftKey: true, altKey: false })).toBe(true);
    expect(matchesEvent(combo, { key: 'K', ctrlKey: false, shiftKey: true, altKey: false })).toBe(false);
  });

  it('accepte l’événement transformé pour un caractère imprimable sans Shift déclaré', () => {
    const combo = parseCombo('?');
    expect(matchesEvent(combo, { key: '?', ctrlKey: false, shiftKey: true, altKey: false })).toBe(true);
  });

  it('rejette une touche différente', () => {
    const combo = parseCombo('Ctrl+Home');
    expect(matchesEvent(combo, { key: 'End', ctrlKey: true, shiftKey: false, altKey: false })).toBe(false);
  });
});

describe('detectConflicts', () => {
  it('ne signale rien quand toutes les combinaisons sont uniques', () => {
    const { conflicting, groups } = detectConflicts({ a: 'Ctrl+A', b: 'Ctrl+B' });
    expect(conflicting.size).toBe(0);
    expect(groups).toEqual([]);
  });

  it('signale les actions qui partagent une combinaison', () => {
    const { conflicting, groups } = detectConflicts({ a: 'Ctrl+K', b: 'Ctrl+K', c: 'Ctrl+C' });
    expect(conflicting.has('a')).toBe(true);
    expect(conflicting.has('b')).toBe(true);
    expect(conflicting.has('c')).toBe(false);
    expect(groups).toEqual([{ key: 'Ctrl+K', actions: ['a', 'b'] }]);
  });
});

describe('categoryFor / groupByCategory', () => {
  const categories = { Nav: ['prevPage', 'nextPage'], Actions: ['kudos'] };

  it('retrouve la catégorie déclarée', () => {
    expect(categoryFor('prevPage', categories)).toBe('Nav');
    expect(categoryFor('kudos', categories)).toBe('Actions');
  });

  it('retombe sur "Other" pour une action non catégorisée (ex: raccourci externe)', () => {
    expect(categoryFor('someModule:0', categories)).toBe('Other');
  });

  it('groupByCategory répartit les entrées par catégorie', () => {
    const grouped = groupByCategory({ prevPage: 'Shift+ArrowLeft', kudos: 'Ctrl+Shift+K' }, categories);
    expect(grouped.Nav).toEqual([['prevPage', 'Shift+ArrowLeft']]);
    expect(grouped.Actions).toEqual([['kudos', 'Ctrl+Shift+K']]);
  });
});

describe('actionLabel', () => {
  it('utilise le libellé configuré quand il existe', () => {
    expect(actionLabel('kudos', { kudos: '❤️ Leave kudos' })).toBe('❤️ Leave kudos');
  });

  it('humanise une action sans libellé configuré', () => {
    expect(actionLabel('someModule:0', {})).toBe('some Module:0');
    expect(actionLabel('jumpForwardPages', {})).toBe('jump Forward Pages');
  });
});

describe('clampPageJump', () => {
  it('avance dans les bornes', () => {
    expect(clampPageJump(3, 5, 20)).toBe(8);
  });

  it('plafonne au maximum', () => {
    expect(clampPageJump(18, 5, 20)).toBe(20);
  });

  it('plafonne au minimum (page 1)', () => {
    expect(clampPageJump(3, -5, 20)).toBe(1);
  });

  it('retourne null quand le mouvement ne change rien (déjà à la borne)', () => {
    expect(clampPageJump(20, 5, 20)).toBeNull();
    expect(clampPageJump(1, -5, 20)).toBeNull();
  });
});
