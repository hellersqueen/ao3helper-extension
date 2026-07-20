import { describe, it, expect } from 'vitest';
import {
  vaultToCSV,
  vaultToHTML,
  findStaleBookmarks,
  noteQueryMatch,
  isImportantNote,
} from './_bookmarkVault.js';

const DATA = {
  '111': { title: 'Fic "One"', pub: true,  notes: 'great, loved it' },
  '222': { title: 'Fic Two',   pub: false, notes: '' },
};

describe('vaultToCSV', () => {
  it('une ligne d\'entête + une ligne par favori, valeurs échappées', () => {
    const csv = vaultToCSV(DATA, { '111': 'perso' });
    const lines = csv.split('\r\n');
    expect(lines.length).toBe(3);
    expect(lines[0]).toContain('"workId"');
    expect(lines[1]).toContain('"Fic ""One"""'); // guillemets doublés
    expect(lines[1]).toContain('"public"');
    expect(lines[1]).toContain('"perso"');
    expect(lines[2]).toContain('"private"');
  });

  it('vide → juste l\'entête', () => {
    expect(vaultToCSV({}).split('\r\n').length).toBe(1);
  });
});

describe('vaultToHTML', () => {
  it('page autonome avec liens vers AO3 et contenu échappé', () => {
    const html = vaultToHTML({ '9': { title: '<b>x</b>', pub: true, notes: 'a & b' } });
    expect(html).toContain('https://archiveofourown.org/works/9');
    expect(html).toContain('&lt;b&gt;x&lt;/b&gt;');
    expect(html).toContain('a &amp; b');
    expect(html).toContain('AO3 Bookmarks (1)');
  });
});

describe('findStaleBookmarks', () => {
  const now = new Date('2026-07-17T12:00:00').getTime();
  const monthsAgo = (n) => {
    const d = new Date(now);
    d.setMonth(d.getMonth() - n);
    return d.getTime();
  };

  it('trouve les favoris jamais ouverts ou ouverts trop anciennement', () => {
    const lastRead = { '111': monthsAgo(7), '222': monthsAgo(1) };
    expect(findStaleBookmarks(DATA, lastRead, 6, now)).toEqual(['111']);
    // '333' n'a jamais été ouvert
    expect(findStaleBookmarks({ ...DATA, '333': { title: 'T' } }, lastRead, 6, now)).toEqual(['111', '333']);
  });

  it('0 ou valeur invalide = désactivé', () => {
    expect(findStaleBookmarks(DATA, {}, 0, now)).toEqual([]);
    expect(findStaleBookmarks(DATA, {}, 'nope', now)).toEqual([]);
  });
});

describe('noteQueryMatch', () => {
  it('sous-chaîne simple, insensible à la casse', () => {
    expect(noteQueryMatch('Loved the Angst here', 'angst')).toBe(true);
    expect(noteQueryMatch('fluff only', 'angst')).toBe(false);
    expect(noteQueryMatch('anything', '')).toBe(true);
  });

  it('&& exige tous les termes', () => {
    expect(noteQueryMatch('angst then fluff', 'angst && fluff')).toBe(true);
    expect(noteQueryMatch('angst only', 'angst && fluff')).toBe(false);
  });

  it('|| accepte n\'importe lequel', () => {
    expect(noteQueryMatch('fluff only', 'angst || fluff')).toBe(true);
    expect(noteQueryMatch('neither', 'angst || fluff')).toBe(false);
  });
});

describe('isImportantNote', () => {
  it('détecte le préfixe "!"', () => {
    expect(isImportantNote('! à relire absolument')).toBe(true);
    expect(isImportantNote('  !important')).toBe(true);
    expect(isImportantNote('note normale !')).toBe(false);
    expect(isImportantNote('')).toBe(false);
  });
});
