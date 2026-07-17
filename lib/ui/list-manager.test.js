import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const downloadJSON = vi.fn();
const pickJSONFile  = vi.fn();
vi.mock('../utils/json-file.js', () => ({
  downloadJSON: (...args) => downloadJSON(...args),
  pickJSONFile: (...args) => pickJSONFile(...args),
}));

const { openListManagerDialog } = await import('./list-manager.js');

const NS = 'ao3h';

function flushDebounce() {
  return new Promise((r) => setTimeout(r, 160));
}

beforeEach(() => {
  document.body.innerHTML = '';
  downloadJSON.mockReset();
  pickJSONFile.mockReset();
});

afterEach(() => {
  document.querySelectorAll(`.${NS}-mgr, .${NS}-mgr-backdrop`).forEach((el) => el.remove());
});

describe('openListManagerDialog — structure de base', () => {
  it('insère le backdrop, la boîte et le titre dans le DOM', async () => {
    openListManagerDialog({
      NS, title: 'My List', load: async () => [], onRemove: async () => {},
      exportItems: { filename: 'x.json' }, importItems: async () => {},
    });
    expect(document.querySelector(`.${NS}-mgr-backdrop`)).not.toBeNull();
    expect(document.querySelector(`.${NS}-mgr h3`).textContent).toBe('My List');
  });

  it('verrouille le scroll à l\'ouverture et le déverrouille à la fermeture', async () => {
    const { close } = openListManagerDialog({
      NS, title: 'X', load: async () => [], onRemove: async () => {},
      exportItems: { filename: 'x.json' }, importItems: async () => {},
    });
    expect(document.body.classList.contains(`${NS}-lock`)).toBe(true);
    close();
    expect(document.body.classList.contains(`${NS}-lock`)).toBe(false);
  });

  it('close() retire le backdrop et la boîte du DOM', async () => {
    const { close } = openListManagerDialog({
      NS, title: 'X', load: async () => [], onRemove: async () => {},
      exportItems: { filename: 'x.json' }, importItems: async () => {},
    });
    close();
    expect(document.querySelector(`.${NS}-mgr`)).toBeNull();
    expect(document.querySelector(`.${NS}-mgr-backdrop`)).toBeNull();
  });

  it('cliquer sur le backdrop ferme la modale', async () => {
    openListManagerDialog({
      NS, title: 'X', load: async () => [], onRemove: async () => {},
      exportItems: { filename: 'x.json' }, importItems: async () => {},
    });
    document.querySelector(`.${NS}-mgr-backdrop`).dispatchEvent(new Event('click', { bubbles: true }));
    expect(document.querySelector(`.${NS}-mgr`)).toBeNull();
  });

  it('la touche Échap ferme la modale', async () => {
    openListManagerDialog({
      NS, title: 'X', load: async () => [], onRemove: async () => {},
      exportItems: { filename: 'x.json' }, importItems: async () => {},
    });
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(document.querySelector(`.${NS}-mgr`)).toBeNull();
  });

  it('le bouton × ferme la modale', async () => {
    openListManagerDialog({
      NS, title: 'X', load: async () => [], onRemove: async () => {},
      exportItems: { filename: 'x.json' }, importItems: async () => {},
    });
    document.querySelector(`.${NS}-close-x`).click();
    expect(document.querySelector(`.${NS}-mgr`)).toBeNull();
  });
});

describe('openListManagerDialog — mode plat (nopeWords / whitelistExceptions)', () => {
  it('affiche les items triés alphabétiquement avec le compteur', async () => {
    await openListManagerDialog({
      NS, title: 'Words', load: async () => ['zebra', 'apple', 'mango'],
      onRemove: async () => {}, exportItems: { filename: 'w.json' }, importItems: async () => {},
    }).reload();
    const rows = Array.from(document.querySelectorAll(`.${NS}-ul-row .${NS}-ul-tag`)).map(el => el.textContent);
    expect(rows).toEqual(['apple', 'mango', 'zebra']);
    expect(document.querySelector(`.${NS}-ul-count`).textContent).toBe('3 / 3');
  });

  it('filtre par la recherche (débouncée)', async () => {
    openListManagerDialog({
      NS, title: 'Words', load: async () => ['angst', 'fluff', 'hurt-comfort'],
      onRemove: async () => {}, exportItems: { filename: 'w.json' }, importItems: async () => {},
    });
    const search = document.querySelector(`.${NS}-ul-search`);
    search.value = 'hurt';
    search.dispatchEvent(new Event('input'));
    await flushDebounce();
    const rows = Array.from(document.querySelectorAll(`.${NS}-ul-row .${NS}-ul-tag`)).map(el => el.textContent);
    expect(rows).toEqual(['hurt-comfort']);
    expect(document.querySelector(`.${NS}-ul-count`).textContent).toBe('1 / 3');
  });

  it('supprimer un item exige une confirmation avant d\'appeler onRemove', async () => {
    const onRemove = vi.fn().mockResolvedValue();
    await openListManagerDialog({
      NS, title: 'Words', load: async () => ['angst'],
      onRemove, exportItems: { filename: 'w.json' }, importItems: async () => {},
    }).reload();

    const del = document.querySelector(`.${NS}-ul-del`);
    del.click();
    expect(onRemove).not.toHaveBeenCalled();
    expect(document.querySelector(`.${NS}-ul-del-confirm`)).not.toBeNull();

    document.querySelector(`.${NS}-ul-del-confirm`).click();
    await Promise.resolve();
    expect(onRemove).toHaveBeenCalledWith('angst');
  });

  it('annuler la suppression restaure le bouton 🗑️ sans appeler onRemove', async () => {
    const onRemove = vi.fn();
    await openListManagerDialog({
      NS, title: 'Words', load: async () => ['angst'],
      onRemove, exportItems: { filename: 'w.json' }, importItems: async () => {},
    }).reload();

    document.querySelector(`.${NS}-ul-del`).click();
    document.querySelector(`.${NS}-ul-del-cancel`).click();
    expect(onRemove).not.toHaveBeenCalled();
    expect(document.querySelector(`.${NS}-ul-del`)).not.toBeNull();
    expect(document.querySelector(`.${NS}-ul-del-confirm`)).toBeNull();
  });
});

describe('openListManagerDialog — ligne d\'ajout (add)', () => {
  it('n\'affiche pas de ligne d\'ajout si add n\'est pas fourni (ex: hiddenTags)', async () => {
    openListManagerDialog({
      NS, title: 'Tags', load: async () => [], onRemove: async () => {},
      exportItems: { filename: 'x.json' }, importItems: async () => {},
    });
    expect(document.querySelector(`.${NS}-nope-add-row`)).toBeNull();
  });

  it('appelle add.onAdd avec la valeur brute (trim, sans normalisation forcée)', async () => {
    const onAdd = vi.fn().mockResolvedValue();
    openListManagerDialog({
      NS, title: 'Words', load: async () => [], onRemove: async () => {},
      add: { placeholder: 'Add…', onAdd },
      exportItems: { filename: 'x.json' }, importItems: async () => {},
    });
    const input = document.querySelector(`.${NS}-nope-add-input`);
    input.value = '  Some Word  ';
    document.querySelector(`.${NS}-nope-add-btn`).click();
    await Promise.resolve();
    expect(onAdd).toHaveBeenCalledWith('Some Word');
    expect(input.value).toBe('');
  });

  it('Entrée dans le champ ajoute aussi', async () => {
    const onAdd = vi.fn().mockResolvedValue();
    openListManagerDialog({
      NS, title: 'Words', load: async () => [], onRemove: async () => {},
      add: { placeholder: 'Add…', onAdd },
      exportItems: { filename: 'x.json' }, importItems: async () => {},
    });
    const input = document.querySelector(`.${NS}-nope-add-input`);
    input.value = 'x';
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    await Promise.resolve();
    expect(onAdd).toHaveBeenCalledWith('x');
  });

  it('une valeur vide n\'appelle pas onAdd', async () => {
    const onAdd = vi.fn();
    openListManagerDialog({
      NS, title: 'Words', load: async () => [], onRemove: async () => {},
      add: { placeholder: 'Add…', onAdd },
      exportItems: { filename: 'x.json' }, importItems: async () => {},
    });
    document.querySelector(`.${NS}-nope-add-input`).value = '   ';
    document.querySelector(`.${NS}-nope-add-btn`).click();
    await Promise.resolve();
    expect(onAdd).not.toHaveBeenCalled();
  });
});

describe('openListManagerDialog — mode groupé (hiddenTags)', () => {
  const items = ['angst', 'fluff', 'hurt-comfort'];
  const groups = { angst: 'Heavy', 'hurt-comfort': 'Heavy' }; // fluff → (ungrouped)

  function makeGroupByOpts(collapsedRef) {
    return {
      keyOf: (item) => groups[item] || null,
      getCollapsed: () => collapsedRef.set,
      setCollapsed: (s) => { collapsedRef.set = s; },
    };
  }

  it('groupe les items par clé, avec repli par défaut (ungroupedLabel)', async () => {
    const collapsedRef = { set: new Set() };
    await openListManagerDialog({
      NS, title: 'Tags', load: async () => items, onRemove: async () => {},
      groupBy: makeGroupByOpts(collapsedRef),
      exportItems: { filename: 'x.json' }, importItems: async () => {},
    }).reload();

    const groupNames = Array.from(document.querySelectorAll(`.${NS}-ul-group`)).map(g => g.dataset.gname);
    expect(groupNames.sort()).toEqual(['(ungrouped)', 'Heavy']);

    const heavyGroup = document.querySelector(`.${NS}-ul-group[data-gname="Heavy"]`);
    const rows = Array.from(heavyGroup.querySelectorAll(`.${NS}-ul-tag`)).map(el => el.textContent);
    expect(rows).toEqual(['angst', 'hurt-comfort']);
  });

  it('un groupe replié via getCollapsed() démarre fermé (aria-expanded=false)', async () => {
    const collapsedRef = { set: new Set(['Heavy']) };
    await openListManagerDialog({
      NS, title: 'Tags', load: async () => items, onRemove: async () => {},
      groupBy: makeGroupByOpts(collapsedRef),
      exportItems: { filename: 'x.json' }, importItems: async () => {},
    }).reload();

    const heavyGroup = document.querySelector(`.${NS}-ul-group[data-gname="Heavy"]`);
    expect(heavyGroup.getAttribute('aria-expanded')).toBe('false');
  });

  it('cliquer sur l\'en-tête replie/déplie et persiste via setCollapsed', async () => {
    const collapsedRef = { set: new Set() };
    await openListManagerDialog({
      NS, title: 'Tags', load: async () => items, onRemove: async () => {},
      groupBy: makeGroupByOpts(collapsedRef),
      exportItems: { filename: 'x.json' }, importItems: async () => {},
    }).reload();

    const heavyGroup = document.querySelector(`.${NS}-ul-group[data-gname="Heavy"]`);
    heavyGroup.querySelector(`.${NS}-ul-ghead`).click();
    expect(heavyGroup.getAttribute('aria-expanded')).toBe('false');
    expect(collapsedRef.set.has('Heavy')).toBe(true);
  });

  it('le compteur global reflète le nombre d\'items affichés (filtrés) / total', async () => {
    const collapsedRef = { set: new Set() };
    await openListManagerDialog({
      NS, title: 'Tags', load: async () => items, onRemove: async () => {},
      groupBy: makeGroupByOpts(collapsedRef),
      exportItems: { filename: 'x.json' }, importItems: async () => {},
    }).reload();
    expect(document.querySelector(`.${NS}-ul-count`).textContent).toBe('3 / 3');
  });

  it('la recherche matche aussi le nom du groupe, pas seulement le texte de l\'item', async () => {
    const collapsedRef = { set: new Set() };
    openListManagerDialog({
      NS, title: 'Tags', load: async () => items, onRemove: async () => {},
      groupBy: makeGroupByOpts(collapsedRef),
      exportItems: { filename: 'x.json' }, importItems: async () => {},
    });
    const search = document.querySelector(`.${NS}-ul-search`);
    search.value = 'heavy';
    search.dispatchEvent(new Event('input'));
    await flushDebounce();
    const rows = Array.from(document.querySelectorAll(`.${NS}-ul-tag`)).map(el => el.textContent).sort();
    expect(rows).toEqual(['angst', 'hurt-comfort']);
  });
});

describe('openListManagerDialog — export / import', () => {
  it('le bouton export appelle downloadJSON avec load() et le nom de fichier configuré', async () => {
    const load = vi.fn().mockResolvedValue(['a', 'b']);
    openListManagerDialog({
      NS, title: 'X', load, onRemove: async () => {},
      exportItems: { filename: 'ao3h-things.json' }, importItems: async () => {},
    });
    document.querySelector(`.${NS}-ul-export`).click();
    await Promise.resolve();
    expect(downloadJSON).toHaveBeenCalledWith(['a', 'b'], 'ao3h-things.json');
  });

  it('import valide : appelle importItems puis recharge la liste', async () => {
    pickJSONFile.mockResolvedValue(['x', 'y']);
    const importItems = vi.fn().mockResolvedValue();
    const load = vi.fn().mockResolvedValue([]);
    openListManagerDialog({
      NS, title: 'X', load, onRemove: async () => {},
      exportItems: { filename: 'x.json' }, importItems,
    });
    document.querySelector(`.${NS}-ul-import`).click();
    await Promise.resolve(); await Promise.resolve(); await Promise.resolve();
    expect(importItems).toHaveBeenCalledWith(['x', 'y']);
  });

  it('import annulé (pickJSONFile résout null) ne fait rien', async () => {
    pickJSONFile.mockResolvedValue(null);
    const importItems = vi.fn();
    openListManagerDialog({
      NS, title: 'X', load: async () => [], onRemove: async () => {},
      exportItems: { filename: 'x.json' }, importItems,
    });
    document.querySelector(`.${NS}-ul-import`).click();
    await Promise.resolve(); await Promise.resolve();
    expect(importItems).not.toHaveBeenCalled();
  });

  it('import invalide (importItems lève une erreur) affiche le message via toast', async () => {
    pickJSONFile.mockResolvedValue({ not: 'an array' });
    const importItems = vi.fn().mockRejectedValue(new Error('not a valid tags array'));
    const toast = vi.fn();
    openListManagerDialog({
      NS, title: 'X', load: async () => [], onRemove: async () => {},
      exportItems: { filename: 'x.json' }, importItems, toast,
    });
    document.querySelector(`.${NS}-ul-import`).click();
    await Promise.resolve(); await Promise.resolve(); await Promise.resolve();
    expect(toast).toHaveBeenCalledWith('Invalid JSON: not a valid tags array');
  });

  it('fichier JSON non parsable (pickJSONFile lève) affiche aussi un message via toast', async () => {
    pickJSONFile.mockRejectedValue(new SyntaxError('Unexpected token'));
    const toast = vi.fn();
    const importItems = vi.fn();
    openListManagerDialog({
      NS, title: 'X', load: async () => [], onRemove: async () => {},
      exportItems: { filename: 'x.json' }, importItems, toast,
    });
    document.querySelector(`.${NS}-ul-import`).click();
    await Promise.resolve(); await Promise.resolve();
    expect(importItems).not.toHaveBeenCalled();
    expect(toast).toHaveBeenCalledWith(expect.stringContaining('Invalid JSON'));
  });
});

describe('openListManagerDialog — extraActions (ex: export/import des groupes de hiddenTags)', () => {
  it('affiche un bouton par action fournie et déclenche son onClick', async () => {
    const onClick = vi.fn();
    openListManagerDialog({
      NS, title: 'X', load: async () => [], onRemove: async () => {},
      exportItems: { filename: 'x.json' }, importItems: async () => {},
      extraActions: [{ label: 'Export Groups', title: 'Export groups mapping', onClick }],
    });
    const btn = document.querySelector(`.${NS}-ul-extra-0`);
    expect(btn.textContent).toBe('Export Groups');
    expect(btn.title).toBe('Export groups mapping');
    btn.click();
    expect(onClick).toHaveBeenCalled();
  });
});
