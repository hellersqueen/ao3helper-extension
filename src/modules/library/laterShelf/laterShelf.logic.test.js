import { describe, it, expect } from 'vitest';
import {
  priorityWeight, isGem, sortEntries, reorderArray, pickRandom,
  estimateReadingMinutes, estimateTotalReadingMinutes, suggestByTimeBudget,
  milestonesCrossed, isStale, detectUpdates, snoozeDate, nextRecurrence,
  peakHourFromSessions, suggestReminderDate, computeConversionStats,
  toCSV, toLinksList,
} from './_laterShelf.js';

describe('priorityWeight', () => {
  it('classe high > normal > low', () => {
    expect(priorityWeight('high')).toBeGreaterThan(priorityWeight('normal'));
    expect(priorityWeight('normal')).toBeGreaterThan(priorityWeight('low'));
  });
  it('traite une priorité manquante comme normal', () => {
    expect(priorityWeight(undefined)).toBe(priorityWeight('normal'));
  });
});

describe('isGem', () => {
  it('détecte un ratio kudos/hits élevé avec une popularité absolue faible', () => {
    expect(isGem({ kudos: 20, hits: 200, bookmarks: 5 })).toBe(true);
  });
  it('rejette un travail trop populaire malgré un bon ratio', () => {
    expect(isGem({ kudos: 5000, hits: 50000, bookmarks: 2000 })).toBe(false);
  });
  it('rejette des données insuffisantes', () => {
    expect(isGem({ kudos: 0, hits: 10, bookmarks: 0 })).toBe(false);
    expect(isGem(null)).toBe(false);
  });
});

describe('sortEntries', () => {
  const entries = [
    { wid: '1', title: 'Bravo', words: 1000, updated: 100, addedAt: 300, order: 2, priority: 'low' },
    { wid: '2', title: 'Alpha', words: 3000, updated: 300, addedAt: 100, order: 0, priority: 'high' },
    { wid: '3', title: 'Charlie', words: 2000, updated: 200, addedAt: 200, order: 1, priority: 'normal' },
  ];

  it('trie par date (plus récent d’abord) par défaut', () => {
    expect(sortEntries(entries, 'date').map(e => e.wid)).toEqual(['1', '3', '2']);
  });
  it('trie par titre alphabétique', () => {
    expect(sortEntries(entries, 'title').map(e => e.wid)).toEqual(['2', '1', '3']);
  });
  it('trie par nombre de mots décroissant', () => {
    expect(sortEntries(entries, 'words').map(e => e.wid)).toEqual(['2', '3', '1']);
  });
  it('trie par priorité décroissante', () => {
    expect(sortEntries(entries, 'priority').map(e => e.wid)).toEqual(['2', '3', '1']);
  });
  it('trie par ordre manuel', () => {
    expect(sortEntries(entries, 'manual').map(e => e.wid)).toEqual(['2', '3', '1']);
  });
  it('trie les pépites cachées en premier', () => {
    const withGems = [
      { wid: 'a', addedAt: 1, stats: { kudos: 1000, hits: 5000, bookmarks: 500 } },
      { wid: 'b', addedAt: 2, stats: { kudos: 20, hits: 200, bookmarks: 5 } },
    ];
    expect(sortEntries(withGems, 'gems').map(e => e.wid)).toEqual(['b', 'a']);
  });
  it('le tri "smart" priorise priorité puis pépites puis ancienneté', () => {
    const mixed = [
      { wid: 'old-normal', addedAt: 1, priority: 'normal' },
      { wid: 'new-high', addedAt: 100, priority: 'high' },
      { wid: 'gem-normal', addedAt: 50, priority: 'normal', stats: { kudos: 20, hits: 200, bookmarks: 5 } },
    ];
    expect(sortEntries(mixed, 'smart').map(e => e.wid)).toEqual(['new-high', 'gem-normal', 'old-normal']);
  });
  it('ne modifie pas le tableau d’origine', () => {
    const copy = [...entries];
    sortEntries(entries, 'title');
    expect(entries).toEqual(copy);
  });
});

describe('reorderArray', () => {
  it('déplace un élément d’un index à un autre', () => {
    expect(reorderArray(['a', 'b', 'c', 'd'], 0, 2)).toEqual(['b', 'c', 'a', 'd']);
    expect(reorderArray(['a', 'b', 'c', 'd'], 3, 0)).toEqual(['d', 'a', 'b', 'c']);
  });
  it('ignore les index hors bornes', () => {
    expect(reorderArray(['a', 'b'], 0, 5)).toEqual(['a', 'b']);
  });
});

describe('pickRandom', () => {
  it('retourne null pour une liste vide', () => {
    expect(pickRandom([])).toBeNull();
  });
  it('utilise le générateur fourni pour un résultat déterministe', () => {
    expect(pickRandom(['a', 'b', 'c'], () => 0.99)).toBe('c');
    expect(pickRandom(['a', 'b', 'c'], () => 0)).toBe('a');
  });
});

describe('reading time', () => {
  it('estime les minutes de lecture à partir du nombre de mots', () => {
    expect(estimateReadingMinutes(500, 250)).toBe(2);
    expect(estimateReadingMinutes(0, 250)).toBe(0);
  });
  it('additionne le temps total de la liste', () => {
    expect(estimateTotalReadingMinutes([{ words: 500 }, { words: 1000 }], 250)).toBe(6);
  });

  it('suggère la fic qui utilise le mieux le temps disponible', () => {
    const items = [{ wid: 'short', words: 250 }, { wid: 'perfect', words: 2000 }, { wid: 'long', words: 10000 }];
    expect(suggestByTimeBudget(items, 10, 250).wid).toBe('perfect');
  });
  it('retombe sur la plus courte si rien ne rentre dans le budget', () => {
    const items = [{ wid: 'long', words: 10000 }, { wid: 'longer', words: 20000 }];
    expect(suggestByTimeBudget(items, 5, 250).wid).toBe('long');
  });
});

describe('milestonesCrossed', () => {
  it('détecte les seuils franchis', () => {
    expect(milestonesCrossed(8, 12)).toEqual([10]);
    expect(milestonesCrossed(50, 50)).toEqual([]);
  });
});

describe('isStale', () => {
  it('signale les fics qui traînent depuis plus que le seuil', () => {
    const now = 1_000_000;
    expect(isStale({ addedAt: now - 40 * 86400000 }, 30, now)).toBe(true);
    expect(isStale({ addedAt: now - 5 * 86400000 }, 30, now)).toBe(false);
  });
});

describe('detectUpdates', () => {
  it('détecte un nouveau chapitre depuis l’ajout', () => {
    expect(detectUpdates({ chaptersAtAdd: 2 }, { chapters: 3 }).hasNewChapter).toBe(true);
    expect(detectUpdates({ chaptersAtAdd: 2 }, { chapters: 2 }).hasNewChapter).toBe(false);
  });
  it('détecte une fic terminée depuis l’ajout', () => {
    expect(detectUpdates({ completeAtAdd: false }, { complete: true }).hasCompleted).toBe(true);
    expect(detectUpdates({ completeAtAdd: true }, { complete: true }).hasCompleted).toBe(false);
  });
});

describe('snoozeDate', () => {
  it('reporte le rappel de N jours à partir de maintenant', () => {
    const now = 1_000_000;
    expect(snoozeDate(now, 3, now)).toBe(now + 3 * 86400000);
  });
  it('reporte à partir du rappel existant s’il est déjà dans le futur', () => {
    const now = 1_000_000;
    const future = now + 10 * 86400000;
    expect(snoozeDate(future, 3, now)).toBe(future + 3 * 86400000);
  });
});

describe('nextRecurrence', () => {
  it('calcule la prochaine occurrence quotidienne/hebdomadaire', () => {
    expect(nextRecurrence(1000, 'daily')).toBe(1000 + 86400000);
    expect(nextRecurrence(1000, 'weekly')).toBe(1000 + 7 * 86400000);
  });
  it('retourne null pour un rappel ponctuel', () => {
    expect(nextRecurrence(1000, undefined)).toBeNull();
  });
});

describe('peakHourFromSessions', () => {
  it('retourne null sans données', () => {
    expect(peakHourFromSessions([])).toBeNull();
  });
  it('trouve l’heure la plus fréquente', () => {
    const sessions = [{ hourOfDay: 20 }, { hourOfDay: 20 }, { hourOfDay: 9 }];
    expect(peakHourFromSessions(sessions)).toBe(20);
  });
});

describe('suggestReminderDate', () => {
  it('utilise l’heure de pointe fournie, le lendemain', () => {
    const now = new Date('2026-01-01T12:00:00').getTime();
    const d = suggestReminderDate(20, now);
    expect(d.getDate()).toBe(2);
    expect(d.getHours()).toBe(20);
  });
  it('retombe sur 19h sans donnée d’habitude', () => {
    const now = new Date('2026-01-01T12:00:00').getTime();
    expect(suggestReminderDate(null, now).getHours()).toBe(19);
  });
});

describe('computeConversionStats', () => {
  it('compte les fics sauvegardées qui ont été lues ou abandonnées', () => {
    const items = [{ wid: '1' }, { wid: '2' }, { wid: '3' }];
    const read = new Set(['1']);
    const dropped = new Set(['2']);
    expect(computeConversionStats(items, read, dropped)).toEqual({
      total: 3, read: 1, dropped: 1, readPercent: 33,
    });
  });
});

describe('export', () => {
  it('génère un CSV avec en-tête et échappement', () => {
    const csv = toCSV([{ wid: '1', title: 'A, "quoted"', addedAt: 0, priority: 'high', note: 'x', group: 'y' }]);
    const lines = csv.split('\n');
    expect(lines[0]).toBe('title,url,addedAt,priority,note,group');
    expect(lines[1]).toContain('"A, ""quoted"""');
    expect(lines[1]).toContain('https://archiveofourown.org/works/1');
  });
  it('génère une liste de liens, un par ligne', () => {
    expect(toLinksList([{ wid: '1' }, { wid: '2' }])).toBe(
      'https://archiveofourown.org/works/1\nhttps://archiveofourown.org/works/2'
    );
  });
});
