import { describe, it, expect, beforeEach, vi } from 'vitest';

const downloadJSON = vi.fn();
const pickJSONFile = vi.fn();

vi.mock('../../../../utils/json-file.js', () => ({ downloadJSON, pickJSONFile }));

const { config, wireConfigArea, moduleId } = await import('./keyboardShortcuts-config.js');

const SETTINGS_KEY = 'ao3h:mod:keyboardShortcuts:settings';

function buildContainer () {
  const el = document.createElement('div');
  el.innerHTML = config;
  document.body.appendChild(el);
  return el;
}

beforeEach(() => {
  document.body.innerHTML = '';
  localStorage.clear();
  downloadJSON.mockClear();
  pickJSONFile.mockReset();
  window.alert = vi.fn();
});

describe('moduleId', () => {
  it('est "keyboardShortcuts"', () => {
    expect(moduleId).toBe('keyboardShortcuts');
  });
});

describe('wireConfigArea — export', () => {
  it('n’exporte que les clés de raccourcis parmi les réglages sauvegardés', () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({
      kudos: 'Ctrl+Alt+K', allShortcutsDisabled: true, someUnrelatedKey: 'x',
    }));
    const c = buildContainer();
    wireConfigArea(c);

    c.querySelector('[data-action="export-shortcuts"]').click();

    expect(downloadJSON).toHaveBeenCalledTimes(1);
    const [data, filename] = downloadJSON.mock.calls[0];
    expect(data).toEqual({ kudos: 'Ctrl+Alt+K' });
    expect(filename).toMatch(/\.json$/);
  });

  it('exporte un objet vide sans réglages sauvegardés', () => {
    const c = buildContainer();
    wireConfigArea(c);
    c.querySelector('[data-action="export-shortcuts"]').click();
    expect(downloadJSON.mock.calls[0][0]).toEqual({});
  });
});

describe('wireConfigArea — import', () => {
  it('applique les clés reconnues aux champs et les sauvegarde', async () => {
    pickJSONFile.mockResolvedValue({ kudos: 'Ctrl+Alt+K', bogusKey: 'ignored' });
    const c = buildContainer();
    wireConfigArea(c);

    c.querySelector('[data-action="import-shortcuts"]').click();
    await Promise.resolve(); // let the async click handler settle
    await Promise.resolve();

    expect(c.querySelector('[data-setting="kudos"]').value).toBe('Ctrl+Alt+K');
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY));
    expect(saved).toEqual({ kudos: 'Ctrl+Alt+K' });
  });

  it('avertit et ne sauvegarde rien quand aucune clé reconnue n’est trouvée', async () => {
    pickJSONFile.mockResolvedValue({ bogusKey: 'ignored' });
    const c = buildContainer();
    wireConfigArea(c);

    c.querySelector('[data-action="import-shortcuts"]').click();
    await Promise.resolve();
    await Promise.resolve();

    expect(window.alert).toHaveBeenCalled();
    expect(localStorage.getItem(SETTINGS_KEY)).toBeNull();
  });

  it('ne fait rien quand le choix de fichier est annulé', async () => {
    pickJSONFile.mockResolvedValue(null);
    const c = buildContainer();
    wireConfigArea(c);

    c.querySelector('[data-action="import-shortcuts"]').click();
    await Promise.resolve();
    await Promise.resolve();

    expect(window.alert).not.toHaveBeenCalled();
    expect(localStorage.getItem(SETTINGS_KEY)).toBeNull();
  });
});
