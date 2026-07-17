import { describe, it, expect, beforeEach } from 'vitest';
import { createMirroredListStore } from './mirrored-list.js';

function fakeStorage(initial = {}) {
  const data = { ...initial };
  return {
    data,
    async get(key, def) {
      return key in data ? data[key] : def;
    },
    async set(key, val) {
      data[key] = val;
      return val;
    },
  };
}

beforeEach(() => {
  localStorage.clear();
});

describe('createMirroredListStore — validation', () => {
  it('lève une erreur sans key ni Storage', () => {
    expect(() => createMirroredListStore({})).toThrow();
    expect(() => createMirroredListStore({ key: 'x' })).toThrow();
  });
});

describe('createMirroredListStore — get/set de base', () => {
  it('écrit puis relit une liste normalisée (trim + lowercase + dédoublonnage)', async () => {
    const Storage = fakeStorage();
    const store = createMirroredListStore({ key: 'k', Storage });
    await store.set(['  Angst ', 'FLUFF', 'angst']);
    expect(await store.get()).toEqual(['angst', 'fluff']);
  });

  it('add() ajoute sans doublon', async () => {
    const Storage = fakeStorage();
    const store = createMirroredListStore({ key: 'k', Storage });
    await store.add('Hurt/Comfort');
    await store.add('hurt/comfort');
    expect(await store.get()).toEqual(['hurt/comfort']);
  });

  it('remove() retire un élément existant', async () => {
    const Storage = fakeStorage();
    const store = createMirroredListStore({ key: 'k', Storage });
    await store.set(['a', 'b']);
    await store.remove('A');
    expect(await store.get()).toEqual(['b']);
  });

  it('remove() est un no-op sur un élément absent', async () => {
    const Storage = fakeStorage();
    const store = createMirroredListStore({ key: 'k', Storage });
    await store.set(['a']);
    await store.remove('missing');
    expect(await store.get()).toEqual(['a']);
  });
});

describe('createMirroredListStore — miroir localStorage (fallback si liste principale vide)', () => {
  it('utilise le miroir seulement quand Storage est vide', async () => {
    localStorage.setItem('ao3h:k', JSON.stringify(['from-mirror']));
    const Storage = fakeStorage(); // vide
    const store = createMirroredListStore({ key: 'k', Storage });
    expect(await store.get()).toEqual(['from-mirror']);
  });

  it('ignore le miroir quand Storage a déjà des données', async () => {
    localStorage.setItem('ao3h:k', JSON.stringify(['stale-mirror']));
    const Storage = fakeStorage({ k: ['real-data'] });
    const store = createMirroredListStore({ key: 'k', Storage });
    expect(await store.get()).toEqual(['real-data']);
  });

  it('set() écrit aussi dans le miroir', async () => {
    const Storage = fakeStorage();
    const store = createMirroredListStore({ key: 'k', Storage });
    await store.set(['x']);
    expect(JSON.parse(localStorage.getItem('ao3h:k'))).toEqual(['x']);
  });

  it('respecte un NS personnalisé pour le miroir', async () => {
    const Storage = fakeStorage();
    const store = createMirroredListStore({ key: 'k', Storage, NS: 'custom' });
    await store.set(['x']);
    expect(localStorage.getItem('custom:k')).not.toBeNull();
    expect(localStorage.getItem('ao3h:k')).toBeNull();
  });

  it('utilise mirrorKey séparé de key si fourni', async () => {
    const Storage = fakeStorage();
    const store = createMirroredListStore({ key: 'k', Storage, mirrorKey: 'mirror-k' });
    await store.set(['x']);
    expect(localStorage.getItem('ao3h:mirror-k')).not.toBeNull();
    expect(localStorage.getItem('ao3h:k')).toBeNull();
  });

  it('utilise UserLS (getItem/setItem) au lieu de localStorage brut si fourni', async () => {
    const userStore = new Map();
    const UserLS = {
      getItem: (k) => (userStore.has(k) ? userStore.get(k) : null),
      setItem: (k, v) => userStore.set(k, v),
    };
    const Storage = fakeStorage();
    const store = createMirroredListStore({ key: 'k', Storage, UserLS });
    await store.set(['x']);
    expect(userStore.has('k')).toBe(true);
    expect(localStorage.getItem('ao3h:k')).toBeNull();
  });
});

describe('createMirroredListStore — normalizeOnGet (comportement hiddenTags vs nopeWords/whitelist)', () => {
  it('normalizeOnGet=true (défaut) renormalise à chaque lecture, même des données injectées brutes', async () => {
    const Storage = fakeStorage({ k: ['  Mixed-Case  '] });
    const store = createMirroredListStore({ key: 'k', Storage });
    expect(await store.get()).toEqual(['mixed-case']);
  });

  it('normalizeOnGet=false (hiddenTags) renvoie les données telles quelles à la lecture', async () => {
    const Storage = fakeStorage({ k: ['  Mixed-Case  '] });
    const store = createMirroredListStore({ key: 'k', Storage, normalizeOnGet: false });
    expect(await store.get()).toEqual(['  Mixed-Case  ']);
  });

  it('normalizeOnGet=false : set() normalise quand même à l\'écriture', async () => {
    const Storage = fakeStorage();
    const store = createMirroredListStore({ key: 'k', Storage, normalizeOnGet: false });
    await store.set(['  Angst ', 'ANGST']);
    expect(await store.get()).toEqual(['angst']);
  });
});
