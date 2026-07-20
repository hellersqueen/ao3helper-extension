import { describe, it, expect } from 'vitest';
import {
  parseChapterProgress,
  avgChapterWords,
  remainingWordsAfterChapter,
  canFinishBy,
  gradientColor,
  parseCustomBooks,
  formatPages,
} from './_workLength.js';

describe('parseChapterProgress', () => {
  it('parse "3/10" et "5/?"', () => {
    expect(parseChapterProgress('3/10')).toEqual({ published: 3, total: 10 });
    expect(parseChapterProgress(' 5/? ')).toEqual({ published: 5, total: null });
  });

  it('retourne null pour les formats inattendus', () => {
    expect(parseChapterProgress('')).toBeNull();
    expect(parseChapterProgress('beaucoup')).toBeNull();
    expect(parseChapterProgress(null)).toBeNull();
  });
});

describe('avgChapterWords', () => {
  it('moyenne arrondie par chapitre publié', () => {
    expect(avgChapterWords(30000, 10)).toBe(3000);
    expect(avgChapterWords(1000, 3)).toBe(333);
  });

  it('null pour les entrées invalides', () => {
    expect(avgChapterWords(NaN, 3)).toBeNull();
    expect(avgChapterWords(1000, 0)).toBeNull();
  });
});

describe('remainingWordsAfterChapter', () => {
  it('proportion des chapitres restants (chapitres homogènes)', () => {
    expect(remainingWordsAfterChapter(10000, 3, 10)).toBe(7000);
    expect(remainingWordsAfterChapter(10000, 10, 10)).toBe(0);
  });

  it('null hors plage', () => {
    expect(remainingWordsAfterChapter(10000, 0, 10)).toBeNull();
    expect(remainingWordsAfterChapter(10000, 11, 10)).toBeNull();
    expect(remainingWordsAfterChapter(NaN, 1, 10)).toBeNull();
  });
});

describe('canFinishBy', () => {
  const now = new Date('2026-07-17T21:00:00');

  it('yes quand le temps de lecture tient avant l\'heure cible', () => {
    expect(canFinishBy(60, '23:00', now)).toBe('yes');   // 120 min dispo
  });

  it('maybe quand ça dépasse d\'au plus 20%', () => {
    expect(canFinishBy(130, '23:00', now)).toBe('maybe'); // 120 min dispo, ≤144
  });

  it('no quand c\'est vraiment trop long', () => {
    expect(canFinishBy(200, '23:00', now)).toBe('no');
  });

  it('une heure déjà passée vise le lendemain', () => {
    expect(canFinishBy(60, '20:00', now)).toBe('yes'); // 23h de marge
  });

  it('null pour une heure invalide', () => {
    expect(canFinishBy(60, '', now)).toBeNull();
    expect(canFinishBy(60, '25:99', now)).toBeNull();
    expect(canFinishBy(60, 'bientôt', now)).toBeNull();
  });
});

describe('gradientColor', () => {
  it('teinte faible pour le plus court, forte pour le plus long', () => {
    const short = gradientColor(1000, 1000, 100000);
    const long  = gradientColor(100000, 1000, 100000);
    expect(short).toContain('0.060');
    expect(long).toContain('0.360');
  });

  it('reste borné même hors plage et gère min == max', () => {
    expect(gradientColor(50, 1000, 100000)).toContain('0.060');
    expect(gradientColor(5000, 5000, 5000)).toContain('0.060');
  });
});

describe('parseCustomBooks', () => {
  it('parse une ligne par livre, avec ":" ou "=" et virgules dans le nombre', () => {
    const books = parseCustomBooks('Mon Pavé Préféré: 250,000\nAutre = 50000');
    expect(books).toEqual([
      { title: 'Mon Pavé Préféré', words: 250000 },
      { title: 'Autre', words: 50000 },
    ]);
  });

  it('ignore les lignes invalides et les valeurs nulles', () => {
    expect(parseCustomBooks('pas de nombre\nOk: 0\nBien: 100')).toEqual([{ title: 'Bien', words: 100 }]);
    expect(parseCustomBooks('')).toEqual([]);
    expect(parseCustomBooks(null)).toEqual([]);
  });
});

describe('formatPages', () => {
  it('compact et complet', () => {
    expect(formatPages(123)).toBe('~123 pg');
    expect(formatPages(123, 'compact')).toBe('~123 pg');
    expect(formatPages(123, 'full')).toBe('~123 pages');
  });
});
