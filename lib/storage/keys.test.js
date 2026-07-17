import { describe, it, expect, beforeEach } from 'vitest';
import {
  KEY_RT_HISTORY, KEY_BOOKMARK_VAULT_DATA, KEY_LATER_SHELF_ITEMS,
  getHistoryWorkIdSet, getBookmarkVaultWorkIds, getLaterShelfWorkIds,
  addLaterShelfItem, getBookmarkVaultNote,
} from './keys.js';

beforeEach(() => localStorage.clear());

describe('getHistoryWorkIdSet', () => {
  it('lit les IDs depuis KEY_RT_HISTORY (champ .id)', () => {
    localStorage.setItem(KEY_RT_HISTORY, JSON.stringify([{ id: '1' }, { id: '2' }]));
    expect(getHistoryWorkIdSet()).toEqual(new Set(['1', '2']));
  });

  it('retourne un Set vide sans données, ou sur un JSON invalide/non-tableau', () => {
    expect(getHistoryWorkIdSet()).toEqual(new Set());
    localStorage.setItem(KEY_RT_HISTORY, '{not json');
    expect(getHistoryWorkIdSet()).toEqual(new Set());
    localStorage.setItem(KEY_RT_HISTORY, '{"not":"an array"}');
    expect(getHistoryWorkIdSet()).toEqual(new Set());
  });

  it('ignore les entrées sans id', () => {
    localStorage.setItem(KEY_RT_HISTORY, JSON.stringify([{ id: '1' }, { title: 'no id' }]));
    expect(getHistoryWorkIdSet()).toEqual(new Set(['1']));
  });
});

describe('getBookmarkVaultWorkIds', () => {
  it('lit les clés de l\'objet KEY_BOOKMARK_VAULT_DATA', () => {
    localStorage.setItem(KEY_BOOKMARK_VAULT_DATA, JSON.stringify({ '111': {}, '222': {} }));
    expect(getBookmarkVaultWorkIds()).toEqual(new Set(['111', '222']));
  });

  it('retourne un Set vide sans données, ou si ce n\'est pas un objet', () => {
    expect(getBookmarkVaultWorkIds()).toEqual(new Set());
    localStorage.setItem(KEY_BOOKMARK_VAULT_DATA, JSON.stringify([1, 2, 3]));
    // Array.isArray → typeof 'object' donc Object.keys(arr) → indices — attendu.
    expect(getBookmarkVaultWorkIds()).toEqual(new Set(['0', '1', '2']));
    localStorage.setItem(KEY_BOOKMARK_VAULT_DATA, 'null');
    expect(getBookmarkVaultWorkIds()).toEqual(new Set());
  });
});

describe('getBookmarkVaultNote', () => {
  it('lit le champ .notes d\'un bookmark', () => {
    localStorage.setItem(KEY_BOOKMARK_VAULT_DATA, JSON.stringify({ '111': { notes: 'Great fic' } }));
    expect(getBookmarkVaultNote('111')).toBe('Great fic');
  });

  it('chaîne vide sans note, sans données, ou si ce n\'est pas un objet', () => {
    localStorage.setItem(KEY_BOOKMARK_VAULT_DATA, JSON.stringify({ '111': {} }));
    expect(getBookmarkVaultNote('111')).toBe('');
    expect(getBookmarkVaultNote('222')).toBe('');
    expect(getBookmarkVaultNote('111')).toBe('');
    localStorage.removeItem(KEY_BOOKMARK_VAULT_DATA);
    expect(getBookmarkVaultNote('111')).toBe('');
    localStorage.setItem(KEY_BOOKMARK_VAULT_DATA, 'null');
    expect(getBookmarkVaultNote('111')).toBe('');
  });
});

describe('getLaterShelfWorkIds — gère les 3 formes historiques d\'un item', () => {
  it('accepte une string workId directement', () => {
    localStorage.setItem(KEY_LATER_SHELF_ITEMS, JSON.stringify(['100', '200']));
    expect(getLaterShelfWorkIds()).toEqual(new Set(['100', '200']));
  });

  it('accepte { id }', () => {
    localStorage.setItem(KEY_LATER_SHELF_ITEMS, JSON.stringify([{ id: '300' }]));
    expect(getLaterShelfWorkIds()).toEqual(new Set(['300']));
  });

  it('accepte { wid } (priorité sur .id si les deux sont présents)', () => {
    localStorage.setItem(KEY_LATER_SHELF_ITEMS, JSON.stringify([{ wid: '400', id: 'wrong' }]));
    expect(getLaterShelfWorkIds()).toEqual(new Set(['400']));
  });

  it('gère un mélange des 3 formes dans la même liste', () => {
    localStorage.setItem(KEY_LATER_SHELF_ITEMS, JSON.stringify(['1', { id: '2' }, { wid: '3' }]));
    expect(getLaterShelfWorkIds()).toEqual(new Set(['1', '2', '3']));
  });

  it('retourne un Set vide sans données', () => {
    expect(getLaterShelfWorkIds()).toEqual(new Set());
  });
});

describe('addLaterShelfItem — écrivain partagé (surpriseMe → laterShelf)', () => {
  it('ajoute un nouvel item avec wid/title/addedAt', () => {
    expect(addLaterShelfItem('500', 'A Title')).toBe(true);
    const items = JSON.parse(localStorage.getItem(KEY_LATER_SHELF_ITEMS));
    expect(items).toEqual([{ wid: '500', title: 'A Title', addedAt: expect.any(Number) }]);
  });

  it('ne duplique pas un work déjà présent (peu importe la forme)', () => {
    localStorage.setItem(KEY_LATER_SHELF_ITEMS, JSON.stringify([{ id: '500' }]));
    expect(addLaterShelfItem('500', 'A Title')).toBe(true);
    expect(JSON.parse(localStorage.getItem(KEY_LATER_SHELF_ITEMS))).toEqual([{ id: '500' }]);
  });

  it('retourne false sans workId', () => {
    expect(addLaterShelfItem('', 'x')).toBe(false);
    expect(localStorage.getItem(KEY_LATER_SHELF_ITEMS)).toBeNull();
  });

  it('émet EV_MARKED_FOR_LATER seulement quand un item est réellement ajouté', async () => {
    const { EV_MARKED_FOR_LATER } = await import('../utils/event-names.js');
    let received = null;
    const handler = (e) => { received = e.detail; };
    document.addEventListener(EV_MARKED_FOR_LATER, handler);
    try {
      addLaterShelfItem('600', 'Another Title');
      expect(received).toEqual({ workId: '600', title: 'Another Title' });

      received = null;
      addLaterShelfItem('600', 'Another Title'); // déjà présent → pas de nouvel événement
      expect(received).toBeNull();
    } finally {
      document.removeEventListener(EV_MARKED_FOR_LATER, handler);
    }
  });
});
