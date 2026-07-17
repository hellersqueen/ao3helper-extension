// @ts-nocheck — fichier de test, pas typé au même niveau que le code produit.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WhitelistExceptions } from './whitelistExceptions.js';

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

describe('WhitelistExceptions.openManager — comportements existants (asymétriques par rapport à NopeWords)', () => {
  it('affiche le titre "Whitelist Exceptions"', async () => {
    const wl = new WhitelistExceptions({ NS: 'ao3h', Storage: fakeStorage(), UserLS: null, KeyboardNav: {} });
    wl.openManager({ processList: vi.fn(), toast: vi.fn() });
    await flush();
    expect(document.querySelector('.ao3h-mgr h3').textContent).toBe('AO3 Helper — Whitelist Exceptions');
  });

  it('ajouter un tag : N\'appelle PAS processList() (contrairement à NopeWords), et affiche le toast avec la valeur en minuscules', async () => {
    const processList = vi.fn();
    const toast = vi.fn();
    const wl = new WhitelistExceptions({ NS: 'ao3h', Storage: fakeStorage(), UserLS: null, KeyboardNav: {} });
    wl.openManager({ processList, toast });
    await flush();

    const input = document.querySelector('.ao3h-nope-add-input');
    input.value = '  Some Tag  ';
    document.querySelector('.ao3h-nope-add-btn').click();
    await flush(); await flush();

    expect(processList).not.toHaveBeenCalled();
    expect(toast).toHaveBeenCalledWith('Added: "some tag"');
    expect(await wl.getWhitelistTags()).toEqual(['some tag']);
  });

  it('supprimer un tag : appelle processList() si fourni', async () => {
    const Storage = fakeStorage();
    const wl = new WhitelistExceptions({ NS: 'ao3h', Storage, UserLS: null, KeyboardNav: {} });
    await wl.setWhitelistTags(['fluff']);
    const processList = vi.fn().mockResolvedValue();
    wl.openManager({ processList, toast: vi.fn() });
    await flush();

    document.querySelector('.ao3h-ul-del').click();
    document.querySelector('.ao3h-ul-del-confirm').click();
    await flush(); await flush();

    expect(processList).toHaveBeenCalledTimes(1);
    expect(await wl.getWhitelistTags()).toEqual([]);
  });

  it('supprimer un tag sans processList fourni ne lève pas d\'exception', async () => {
    const wl = new WhitelistExceptions({ NS: 'ao3h', Storage: fakeStorage(), UserLS: null, KeyboardNav: {} });
    await wl.setWhitelistTags(['fluff']);
    wl.openManager({ toast: vi.fn() }); // pas de processList
    await flush();

    document.querySelector('.ao3h-ul-del').click();
    expect(() => document.querySelector('.ao3h-ul-del-confirm').click()).not.toThrow();
    await flush();
  });
});
