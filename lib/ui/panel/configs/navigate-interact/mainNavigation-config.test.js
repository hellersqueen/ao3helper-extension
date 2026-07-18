import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { config, wireConfigArea } from './mainNavigation-config.js';

function buildArea () {
  const container = document.createElement('div');
  container.innerHTML = config;
  document.body.appendChild(container);
  return container;
}

describe('mainNavigation-config — recherche de fandom/pairing', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('une recherche remplit le premier emplacement de lien vide avec le tag choisi', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve([{ id: '1', name: 'Hurt/Comfort' }]),
    })));
    const container = buildArea();
    wireConfigArea(container);

    const termInput = container.querySelector('#ao3h-mn-ac-term');
    termInput.value = 'hurt';
    container.querySelector('[data-action="search-tag"]').click();
    await vi.waitFor(() => {
      if (!container.querySelector('#ao3h-mn-ac-results button')) throw new Error('pending');
    });

    container.querySelector('#ao3h-mn-ac-results button').click();

    expect(container.querySelector('[data-setting="quickLink1Label"]').value).toBe('Hurt/Comfort');
    expect(container.querySelector('[data-setting="quickLink1Url"]').value)
      .toBe(`/tags/${encodeURIComponent('Hurt*s*Comfort')}/works`);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/autocomplete/fandom?term=hurt',
      expect.objectContaining({ headers: { Accept: 'application/json' } })
    );
  });

  it('la recherche saute les emplacements déjà remplis', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve([{ id: '2', name: 'Fluff' }]),
    })));
    const container = buildArea();
    wireConfigArea(container);
    container.querySelector('[data-setting="quickLink1Label"]').value = 'Taken';
    container.querySelector('[data-setting="quickLink1Url"]').value = '/tags/Taken/works';

    const termInput = container.querySelector('#ao3h-mn-ac-term');
    termInput.value = 'fluff';
    container.querySelector('[data-action="search-tag"]').click();
    await vi.waitFor(() => {
      if (!container.querySelector('#ao3h-mn-ac-results button')) throw new Error('pending');
    });
    container.querySelector('#ao3h-mn-ac-results button').click();

    expect(container.querySelector('[data-setting="quickLink1Label"]').value).toBe('Taken');
    expect(container.querySelector('[data-setting="quickLink2Label"]').value).toBe('Fluff');
  });

  it('affiche un message quand la recherche échoue', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('network'))));
    const container = buildArea();
    wireConfigArea(container);

    container.querySelector('#ao3h-mn-ac-term').value = 'x';
    container.querySelector('[data-action="search-tag"]').click();
    await vi.waitFor(() => {
      const text = container.querySelector('#ao3h-mn-ac-results').textContent;
      if (!text.includes('failed')) throw new Error('pending');
    });
  });
});
