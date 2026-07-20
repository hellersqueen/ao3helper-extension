// @ts-nocheck
import { describe, it, expect, beforeEach } from 'vitest';
import { buildMirrorKey, saveMirror, loadMirror, mergeWorkLists } from './skipWorks.js';

describe('buildMirrorKey', () => {
  it('inclut le nom d\'utilisateur dans la clé', () => {
    expect(buildMirrorKey('petals')).toBe('ao3h:skipWorks:hiddenWorksMirror:petals');
  });
});

describe('saveMirror / loadMirror', () => {
  beforeEach(() => { localStorage.clear(); });

  it('retourne un tableau vide quand rien n\'est sauvegardé', () => {
    expect(loadMirror('petals')).toEqual([]);
  });

  it('sauvegarde puis relit la même liste', () => {
    const works = [{ workId: '/works/1', reason: 'crossover', isHidden: true }];
    saveMirror('petals', works);
    expect(loadMirror('petals')).toEqual(works);
  });

  it('isole les miroirs de deux utilisateurs différents', () => {
    saveMirror('alice', [{ workId: '/works/1', isHidden: true }]);
    saveMirror('bob', [{ workId: '/works/2', isHidden: true }]);
    expect(loadMirror('alice')).toEqual([{ workId: '/works/1', isHidden: true }]);
    expect(loadMirror('bob')).toEqual([{ workId: '/works/2', isHidden: true }]);
  });

  it('retourne un tableau vide si le JSON stocké est corrompu', () => {
    localStorage.setItem(buildMirrorKey('petals'), '{not json');
    expect(loadMirror('petals')).toEqual([]);
  });
});

describe('mergeWorkLists', () => {
  it('garde la version locale si elle est plus récente', () => {
    const local  = [{ workId: '/works/1', reason: 'local', updatedAt: 200 }];
    const remote = [{ workId: '/works/1', reason: 'remote', updatedAt: 100 }];
    expect(mergeWorkLists(local, remote)).toEqual([{ workId: '/works/1', reason: 'local', updatedAt: 200 }]);
  });

  it('prend la version distante si elle est plus récente', () => {
    const local  = [{ workId: '/works/1', reason: 'local', updatedAt: 100 }];
    const remote = [{ workId: '/works/1', reason: 'remote', updatedAt: 200 }];
    expect(mergeWorkLists(local, remote)).toEqual([{ workId: '/works/1', reason: 'remote', updatedAt: 200 }]);
  });

  it('en cas d\'égalité, garde la version locale', () => {
    const local  = [{ workId: '/works/1', reason: 'local', updatedAt: 100 }];
    const remote = [{ workId: '/works/1', reason: 'remote', updatedAt: 100 }];
    expect(mergeWorkLists(local, remote)).toEqual([{ workId: '/works/1', reason: 'local', updatedAt: 100 }]);
  });

  it('ajoute une entrée distante absente en local', () => {
    const local  = [{ workId: '/works/1', updatedAt: 100 }];
    const remote = [{ workId: '/works/2', updatedAt: 100 }];
    const merged = mergeWorkLists(local, remote);
    expect(merged.map(r => r.workId).sort()).toEqual(['/works/1', '/works/2']);
  });

  it('traite l\'absence de updatedAt comme 0 (le distant avec timestamp gagne)', () => {
    const local  = [{ workId: '/works/1', reason: 'old, no timestamp' }];
    const remote = [{ workId: '/works/1', reason: 'new', updatedAt: 100 }];
    expect(mergeWorkLists(local, remote)).toEqual([{ workId: '/works/1', reason: 'new', updatedAt: 100 }]);
  });

  it('gère des listes vides ou absentes', () => {
    expect(mergeWorkLists([], [])).toEqual([]);
    expect(mergeWorkLists(null, undefined)).toEqual([]);
  });

  it('ignore les entrées sans workId', () => {
    expect(mergeWorkLists([{ workId: '/works/1' }], [{ reason: 'no id' }])).toEqual([{ workId: '/works/1' }]);
  });
});
