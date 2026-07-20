import { describe, it, expect } from 'vitest';
import {
  PRIORITY_LEVELS,
  nextPriority,
  priorityRank,
  priorityIcon,
  pickNextQueueEntry,
  isResumable,
  resumableEntries,
} from './_fanficBingeMode.js';

describe('nextPriority', () => {
  it('cycle low → medium → high → low', () => {
    expect(nextPriority('low')).toBe('medium');
    expect(nextPriority('medium')).toBe('high');
    expect(nextPriority('high')).toBe('low');
  });
  it('traite les anciennes entrées "normal" comme medium', () => {
    expect(nextPriority('normal')).toBe('high');
  });
  it('retombe sur medium pour une valeur inconnue', () => {
    expect(nextPriority(undefined)).toBe('high');
  });
});

describe('priorityRank', () => {
  it('classe les niveaux dans l’ordre croissant', () => {
    expect(priorityRank('low')).toBeLessThan(priorityRank('medium'));
    expect(priorityRank('medium')).toBeLessThan(priorityRank('high'));
  });
  it('traite "normal" comme medium', () => {
    expect(priorityRank('normal')).toBe(priorityRank('medium'));
  });
});

describe('priorityIcon', () => {
  it('retourne une icône distincte par niveau', () => {
    expect(new Set(PRIORITY_LEVELS.map(priorityIcon)).size).toBe(3);
  });
});

describe('pickNextQueueEntry', () => {
  it('choisit l’entrée de plus haute priorité', () => {
    const queue = [
      { id: '1', priority: 'low' },
      { id: '2', priority: 'high' },
      { id: '3', priority: 'medium' },
    ];
    expect(pickNextQueueEntry(queue).id).toBe('2');
  });
  it('en cas d’égalité, garde l’ordre de la file', () => {
    const queue = [
      { id: '1', priority: 'medium' },
      { id: '2', priority: 'medium' },
    ];
    expect(pickNextQueueEntry(queue).id).toBe('1');
  });
  it('retourne null pour une file vide', () => {
    expect(pickNextQueueEntry([])).toBeNull();
    expect(pickNextQueueEntry(undefined)).toBeNull();
  });
});

describe('isResumable', () => {
  it('est vrai quand il reste des chapitres à lire', () => {
    expect(isResumable({ chapter: 2, totalChapters: 5 })).toBe(true);
  });
  it('est faux quand tous les chapitres ont été lus', () => {
    expect(isResumable({ chapter: 5, totalChapters: 5 })).toBe(false);
  });
  it('est vrai quand la complétion est inconnue', () => {
    expect(isResumable({ chapter: 1 })).toBe(true);
    expect(isResumable({})).toBe(true);
  });
  it('est faux pour une entrée absente', () => {
    expect(isResumable(null)).toBe(false);
  });
});

describe('resumableEntries', () => {
  it('filtre puis limite le nombre d’entrées', () => {
    const history = [
      { id: 1, chapter: 5, totalChapters: 5 }, // finished — excluded
      { id: 2, chapter: 1, totalChapters: 3 },
      { id: 3, chapter: 2, totalChapters: 4 },
      { id: 4, chapter: 1, totalChapters: 2 },
    ];
    expect(resumableEntries(history, 2).map(e => e.id)).toEqual([2, 3]);
  });
});
