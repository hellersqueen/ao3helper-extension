// @ts-nocheck — fichier de test, pas typé au même niveau que le code produit.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { HiddenTags } from './hiddenTags.js';

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

describe('HiddenTags.openManager — mode groupé', () => {
  it('affiche le titre "Hidden Tags (Groups)" et aucune ligne d\'ajout (contrairement à NopeWords/Whitelist)', async () => {
    const ht = new HiddenTags({ NS: 'ao3h', Storage: fakeStorage(), UserLS: null, KeyboardNav: {} });
    ht.openManager({ processList: vi.fn(), toast: vi.fn() });
    await flush();
    expect(document.querySelector('.ao3h-mgr h3').textContent).toBe('AO3 Helper — Hidden Tags (Groups)');
    expect(document.querySelector('.ao3h-nope-add-row')).toBeNull();
  });

  it('groupe les tags selon getGroupsMap(), avec repli "(ungrouped)" pour les tags sans groupe', async () => {
    const ht = new HiddenTags({ NS: 'ao3h', Storage: fakeStorage(), UserLS: null, KeyboardNav: {} });
    await ht.setHidden(['angst', 'fluff', 'hurt/comfort']);
    await ht.setGroupsMap({ angst: 'Heavy', 'hurt/comfort': 'Heavy' });

    ht.openManager({ processList: vi.fn(), toast: vi.fn() });
    await flush();

    const groupNames = Array.from(document.querySelectorAll('.ao3h-ul-group')).map(g => g.dataset.gname).sort();
    expect(groupNames).toEqual(['(ungrouped)', 'Heavy']);
  });

  it('affiche les boutons d\'export/import de groupes + Clear All en plus des boutons standards', async () => {
    const ht = new HiddenTags({ NS: 'ao3h', Storage: fakeStorage(), UserLS: null, KeyboardNav: {} });
    ht.openManager({ processList: vi.fn(), toast: vi.fn() });
    await flush();
    const labels = Array.from(document.querySelectorAll('.ao3h-ul-actions button')).map(b => b.textContent);
    expect(labels).toEqual(['Export JSON', 'Import JSON', 'Export Groups', 'Import Groups', 'Clear All']);
  });

  it('supprimer un tag retire aussi son assignation de groupe et appelle processList()', async () => {
    const ht = new HiddenTags({ NS: 'ao3h', Storage: fakeStorage(), UserLS: null, KeyboardNav: {} });
    await ht.setHidden(['angst']);
    await ht.setGroupsMap({ angst: 'Heavy' });

    const processList = vi.fn().mockResolvedValue();
    ht.openManager({ processList, toast: vi.fn() });
    await flush();

    document.querySelector('.ao3h-ul-del').click();
    document.querySelector('.ao3h-ul-del-confirm').click();
    await flush(); await flush();

    expect(processList).toHaveBeenCalledTimes(1);
    expect(await ht.getHidden()).toEqual([]);
    expect(await ht.getGroupsMap()).toEqual({});
  });

  it('un groupe replié via getCollapsedSet() démarre fermé', async () => {
    const ht = new HiddenTags({ NS: 'ao3h', Storage: fakeStorage(), UserLS: null, KeyboardNav: {} });
    await ht.setHidden(['angst']);
    await ht.setGroupsMap({ angst: 'Heavy' });
    ht.setCollapsedSet(new Set(['Heavy']));

    ht.openManager({ processList: vi.fn(), toast: vi.fn() });
    await flush();

    const group = document.querySelector('.ao3h-ul-group[data-gname="Heavy"]');
    expect(group.getAttribute('aria-expanded')).toBe('false');
  });

  it('replier un groupe persiste via setCollapsedSet()', async () => {
    const ht = new HiddenTags({ NS: 'ao3h', Storage: fakeStorage(), UserLS: null, KeyboardNav: {} });
    await ht.setHidden(['angst']);
    await ht.setGroupsMap({ angst: 'Heavy' });

    ht.openManager({ processList: vi.fn(), toast: vi.fn() });
    await flush();

    document.querySelector('.ao3h-ul-group[data-gname="Heavy"] .ao3h-ul-ghead').click();
    expect(ht.getCollapsedSet().has('Heavy')).toBe(true);
  });

  it('la recherche filtre par nom de tag OU par nom de groupe', async () => {
    const ht = new HiddenTags({ NS: 'ao3h', Storage: fakeStorage(), UserLS: null, KeyboardNav: {} });
    await ht.setHidden(['angst', 'fluff']);
    await ht.setGroupsMap({ angst: 'Heavy Themes' });

    ht.openManager({ processList: vi.fn(), toast: vi.fn() });
    await flush();

    const search = document.querySelector('.ao3h-ul-search');
    search.value = 'heavy';
    search.dispatchEvent(new Event('input'));
    await new Promise((r) => setTimeout(r, 200));

    const visibleTags = Array.from(document.querySelectorAll('.ao3h-ul-tag')).map(el => el.textContent);
    expect(visibleTags).toEqual(['angst']);
  });
});

describe('HiddenTags.openManager — bouton "Clear All"', () => {
  function findButton(container, label) {
    return Array.from(container.querySelectorAll('.ao3h-ul-actions button')).find(b => b.textContent === label);
  }

  beforeEach(() => { window.confirm = vi.fn(); });

  it('demande confirmation puis vide la liste et les groupes', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const ht = new HiddenTags({ NS: 'ao3h', Storage: fakeStorage(), UserLS: null, KeyboardNav: {} });
    await ht.setHidden(['angst', 'fluff']);
    await ht.setGroupsMap({ angst: 'Heavy' });

    const processList = vi.fn().mockResolvedValue();
    const toast = vi.fn();
    ht.openManager({ processList, toast });
    await flush();

    findButton(document, 'Clear All').click();
    await flush(); await flush();

    expect(confirmSpy).toHaveBeenCalled();
    expect(await ht.getHidden()).toEqual([]);
    expect(await ht.getGroupsMap()).toEqual({});
    expect(processList).toHaveBeenCalledTimes(1);
    expect(toast).toHaveBeenCalledWith('All hidden tags removed');
    expect(document.querySelector('.ao3h-ul-tag')).toBeNull();
  });

  it('n\'efface rien si la confirmation est refusée', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const ht = new HiddenTags({ NS: 'ao3h', Storage: fakeStorage(), UserLS: null, KeyboardNav: {} });
    await ht.setHidden(['angst']);

    ht.openManager({ processList: vi.fn(), toast: vi.fn() });
    await flush();

    findButton(document, 'Clear All').click();
    await flush();

    expect(await ht.getHidden()).toEqual(['angst']);
  });

  it('ne demande pas de confirmation si la liste est déjà vide', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const ht = new HiddenTags({ NS: 'ao3h', Storage: fakeStorage(), UserLS: null, KeyboardNav: {} });

    ht.openManager({ processList: vi.fn(), toast: vi.fn() });
    await flush();

    findButton(document, 'Clear All').click();
    await flush();

    expect(confirmSpy).not.toHaveBeenCalled();
  });
});
