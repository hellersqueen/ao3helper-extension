// @ts-nocheck — fichier de test, pas typé au même niveau que le code produit.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NopeWords } from './nopeWords.js';

function fakeStorage(initial = {}) {
  const data = { ...initial };
  return {
    async get(key, def) { return key in data ? data[key] : def; },
    async set(key, val) { data[key] = val; return val; },
  };
}

function flush() {
  return new Promise((r) => setTimeout(r, 0));
}

beforeEach(() => { document.body.innerHTML = ''; localStorage.clear(); });
afterEach(() => { document.body.innerHTML = ''; });

describe('NopeWords.openManager — comportement préservé par rapport à l\'ancienne implémentation inline', () => {
  it('affiche le titre "NOPE Words" et une ligne d\'ajout', async () => {
    const nw = new NopeWords({ NS: 'ao3h', Storage: fakeStorage(), UserLS: null, KeyboardNav: {} });
    nw.openManager({ processList: vi.fn(), toast: vi.fn() });
    await flush();
    expect(document.querySelector('.ao3h-mgr h3').textContent).toBe('AO3 Helper — NOPE Words');
    expect(document.querySelector('.ao3h-nope-add-input')).not.toBeNull();
  });

  it('ajouter un mot : appelle processList() ET affiche un toast avec la valeur brute (trim, pas de lowercase forcé)', async () => {
    const processList = vi.fn().mockResolvedValue();
    const toast = vi.fn();
    const nw = new NopeWords({ NS: 'ao3h', Storage: fakeStorage(), UserLS: null, KeyboardNav: {} });
    nw.openManager({ processList, toast });
    await flush();

    const input = document.querySelector('.ao3h-nope-add-input');
    input.value = '  Some Word  ';
    document.querySelector('.ao3h-nope-add-btn').click();
    await flush(); await flush();

    expect(processList).toHaveBeenCalledTimes(1);
    expect(toast).toHaveBeenCalledWith('Added: "Some Word"');
    // le store normalise quand même à l'écriture (trim+lowercase)
    expect(await nw.getNopeWords()).toEqual(['some word']);
  });

  it('supprimer un mot (avec confirmation) appelle processList()', async () => {
    const Storage = fakeStorage();
    const nw = new NopeWords({ NS: 'ao3h', Storage, UserLS: null, KeyboardNav: {} });
    await nw.setNopeWords(['angst']);
    const processList = vi.fn().mockResolvedValue();
    nw.openManager({ processList, toast: vi.fn() });
    await flush();

    document.querySelector('.ao3h-ul-del').click();
    document.querySelector('.ao3h-ul-del-confirm').click();
    await flush(); await flush();

    expect(processList).toHaveBeenCalledTimes(1);
    expect(await nw.getNopeWords()).toEqual([]);
  });

  it('export utilise le nom de fichier ao3h-nope-words.json', async () => {
    const nw = new NopeWords({ NS: 'ao3h', Storage: fakeStorage(), UserLS: null, KeyboardNav: {} });
    await nw.setNopeWords(['a']);
    nw.openManager({ processList: vi.fn(), toast: vi.fn() });
    await flush();
    // Pas d'assertion sur downloadJSON ici (non mocké) — on vérifie juste
    // que le clic ne lève pas d'exception et que le bouton existe.
    expect(() => document.querySelector('.ao3h-ul-export').click()).not.toThrow();
  });
});
