import { describe, it, expect } from 'vitest';
import {
  parseChapterOptions, filterChapters, buildChapterStates,
  firstUnreadChapter, addRecentEntry, buildBreadcrumbText, prependChapterToTitle,
} from './_chapterNavigation.js';

describe('parseChapterOptions', () => {
  it('extrait le numéro et le titre du format AO3 "N. Titre"', () => {
    const opts = [
      { value: '111', text: '1. The Beginning', selected: true },
      { value: '222', text: '2. The Middle' },
    ];
    expect(parseChapterOptions(opts)).toEqual([
      { id: '111', num: 1, title: 'The Beginning', selected: true },
      { id: '222', num: 2, title: 'The Middle', selected: false },
    ]);
  });

  it('gère les chapitres sans titre ("N.")', () => {
    expect(parseChapterOptions([{ value: '1', text: '3.' }]))
      .toEqual([{ id: '1', num: 3, title: '', selected: false }]);
  });

  it('retombe sur l’index quand le texte ne suit pas le format attendu', () => {
    expect(parseChapterOptions([{ value: 'x', text: 'weird' }]))
      .toEqual([{ id: 'x', num: 1, title: '', selected: false }]);
  });

  it('renvoie un tableau vide pour une entrée invalide', () => {
    expect(parseChapterOptions(null)).toEqual([]);
  });
});

describe('filterChapters', () => {
  const chapters = [
    { num: 1, title: 'The Beginning' },
    { num: 2, title: 'A Turning Point' },
    { num: 12, title: 'The End' },
  ];

  it('filtre par numéro', () => {
    expect(filterChapters(chapters, '12')).toEqual([{ num: 12, title: 'The End' }]);
  });

  it('filtre par titre, insensible à la casse', () => {
    expect(filterChapters(chapters, 'turning')).toEqual([{ num: 2, title: 'A Turning Point' }]);
  });

  it('renvoie tout quand la requête est vide', () => {
    expect(filterChapters(chapters, '  ')).toBe(chapters);
  });
});

describe('buildChapterStates', () => {
  const chapters = [{ id: 'a', num: 1 }, { id: 'b', num: 2 }, { id: 'c', num: 3 }];

  it('marque le chapitre courant, les chapitres lus, et les non lus', () => {
    const out = buildChapterStates(chapters, { currentId: 'b', lastReadNum: 2 });
    expect(out.map(c => c.state)).toEqual(['read', 'current', 'unread']);
  });

  it('marque tout comme non lu sans progression connue', () => {
    const out = buildChapterStates(chapters, {});
    expect(out.map(c => c.state)).toEqual(['unread', 'unread', 'unread']);
  });
});

describe('firstUnreadChapter', () => {
  const chapters = [{ num: 1 }, { num: 2 }, { num: 3 }];

  it('renvoie le premier chapitre sans progression connue', () => {
    expect(firstUnreadChapter(chapters, null)).toEqual({ num: 1 });
  });

  it('renvoie le chapitre suivant le dernier lu', () => {
    expect(firstUnreadChapter(chapters, 1)).toEqual({ num: 2 });
  });

  it('retombe sur le dernier chapitre quand tout est déjà lu', () => {
    expect(firstUnreadChapter(chapters, 5)).toEqual({ num: 3 });
  });

  it('renvoie null pour une liste vide', () => {
    expect(firstUnreadChapter([], null)).toBeNull();
  });
});

describe('addRecentEntry', () => {
  it('place la nouvelle entrée en tête et déduplique par id', () => {
    const list = [{ id: 'b' }, { id: 'a' }];
    expect(addRecentEntry(list, { id: 'a' })).toEqual([{ id: 'a' }, { id: 'b' }]);
  });

  it('plafonne la liste à `cap` entrées', () => {
    const list = [{ id: '1' }, { id: '2' }, { id: '3' }];
    expect(addRecentEntry(list, { id: 'new' }, 3)).toEqual([{ id: 'new' }, { id: '1' }, { id: '2' }]);
  });
});

describe('buildBreadcrumbText', () => {
  it('inclut le titre du chapitre quand il existe', () => {
    expect(buildBreadcrumbText('My Fic', 5, 'The Reveal')).toBe('My Fic > Chapter 5 > The Reveal');
  });

  it('omet le titre du chapitre quand il est vide', () => {
    expect(buildBreadcrumbText('My Fic', 5, '')).toBe('My Fic > Chapter 5');
  });
});

describe('prependChapterToTitle', () => {
  it('inclut le total quand il est connu', () => {
    expect(prependChapterToTitle('My Fic', 5, 12)).toBe('Ch. 5/12 · My Fic');
  });

  it('omet le total quand il est inconnu', () => {
    expect(prependChapterToTitle('My Fic', 5, null)).toBe('Ch. 5 · My Fic');
  });
});
