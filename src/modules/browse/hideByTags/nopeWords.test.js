// @ts-nocheck — fichier de test, pas typé au même niveau que le code produit.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NopeWords, matchesNopeEntry } from './nopeWords.js';

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

describe('matchesNopeEntry — modes de correspondance avancés', () => {
  it('sous-chaîne simple par défaut', () => {
    expect(matchesNopeEntry('my heart aches', 'art')).toBe(true);
    expect(matchesNopeEntry('my heart aches', 'zzz')).toBe(false);
  });

  it('mots entiers : "art" ne matche plus "heart"', () => {
    expect(matchesNopeEntry('my heart aches', 'art', { wholeWords: true })).toBe(false);
    expect(matchesNopeEntry('modern art gallery', 'art', { wholeWords: true })).toBe(true);
    expect(matchesNopeEntry('art. and more', 'art', { wholeWords: true })).toBe(true);
  });

  it('joker * : "her*t" matche "her heart"', () => {
    expect(matchesNopeEntry('follow her heart', 'her*t')).toBe(true);
    expect(matchesNopeEntry('nothing here', 'xyz*t')).toBe(false);
  });

  it('syntaxe /regex/ (insensible à la casse)', () => {
    expect(matchesNopeEntry('Major Character Death', '/major.+death/')).toBe(true);
    expect(matchesNopeEntry('happy ending', '/major.+death/')).toBe(false);
  });

  it('une regex invalide retombe sur la sous-chaîne sans lever', () => {
    expect(() => matchesNopeEntry('abc', '/[unclosed/')).not.toThrow();
    expect(matchesNopeEntry('abc /[unclosed/ def', '/[unclosed/')).toBe(true);
  });

  it('entrée vide : jamais de match', () => {
    expect(matchesNopeEntry('anything', '')).toBe(false);
  });
});

describe('matchesNope — option wholeWords de bout en bout', () => {
  function blurbWithSummary(text) {
    const li = document.createElement('li');
    li.className = 'blurb';
    li.innerHTML = `<blockquote class="userstuff summary">${text}</blockquote>`;
    document.body.appendChild(li);
    return li;
  }

  it('respecte wholeWords sur le texte du résumé', () => {
    const nw = new NopeWords({ NS: 'ao3h', Storage: fakeStorage(), UserLS: null, KeyboardNav: {} });
    const blurb = blurbWithSummary('her heart was racing');
    const targets = { summaries: true, notes: false, titles: false };

    expect(nw.matchesNope(blurb, ['art'], targets)).toBe('art');
    expect(nw.matchesNope(blurb, ['art'], targets, { wholeWords: true })).toBeNull();
    expect(nw.matchesNope(blurb, ['heart'], targets, { wholeWords: true })).toBe('heart');
  });
});
