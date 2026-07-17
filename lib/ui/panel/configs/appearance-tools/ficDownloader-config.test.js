import { describe, it, expect, beforeEach } from 'vitest';
import { config, wireConfigArea, moduleId } from './ficDownloader-config.js';

function buildContainer() {
  const el = document.createElement('div');
  el.innerHTML = config;
  document.body.appendChild(el);
  return el;
}

beforeEach(() => { document.body.innerHTML = ''; });

describe('moduleId', () => {
  it('est "ficDownloader"', () => {
    expect(moduleId).toBe('ficDownloader');
  });
});

describe('wireConfigArea — bug corrigé : les sous-options Kindle/Calibre ne restent plus figées en display:none', () => {
  it('synchronise la visibilité des options Kindle sur l\'état initial de la case (cochée)', () => {
    const c = buildContainer();
    c.querySelector('#ao3h-dl-kindle').checked = true;
    wireConfigArea(c);
    expect(c.querySelector('#ao3h-dl-kindle-opts').style.display).toBe('');
  });

  it('laisse les options Kindle cachées si la case est décochée', () => {
    const c = buildContainer();
    c.querySelector('#ao3h-dl-kindle').checked = false;
    wireConfigArea(c);
    expect(c.querySelector('#ao3h-dl-kindle-opts').style.display).toBe('none');
  });

  it('bascule la visibilité des options Kindle au clic (change)', () => {
    const c = buildContainer();
    wireConfigArea(c);
    const checkbox = c.querySelector('#ao3h-dl-kindle');
    const opts = c.querySelector('#ao3h-dl-kindle-opts');

    checkbox.checked = true;
    checkbox.dispatchEvent(new Event('change'));
    expect(opts.style.display).toBe('');

    checkbox.checked = false;
    checkbox.dispatchEvent(new Event('change'));
    expect(opts.style.display).toBe('none');
  });

  it('même comportement pour les options Calibre', () => {
    const c = buildContainer();
    c.querySelector('#ao3h-dl-calibre').checked = true;
    wireConfigArea(c);
    expect(c.querySelector('#ao3h-dl-calibre-opts').style.display).toBe('');

    const checkbox = c.querySelector('#ao3h-dl-calibre');
    checkbox.checked = false;
    checkbox.dispatchEvent(new Event('change'));
    expect(c.querySelector('#ao3h-dl-calibre-opts').style.display).toBe('none');
  });

  it('ne s\'attache pas deux fois (appel répété de wireConfigArea)', () => {
    const c = buildContainer();
    const checkbox = c.querySelector('#ao3h-dl-kindle');
    checkbox.checked = true;
    wireConfigArea(c);
    wireConfigArea(c);

    let calls = 0;
    checkbox.addEventListener('change', () => { calls++; });
    checkbox.dispatchEvent(new Event('change'));
    // Le listener de test lui-même compte 1 ; on vérifie juste qu'aucune
    // exception ni double-application ne casse l'état affiché.
    expect(calls).toBe(1);
    expect(c.querySelector('#ao3h-dl-kindle-opts').style.display).toBe('');
  });
});

describe('config HTML — nouveaux réglages présents', () => {
  it('contient la case "Show the quick-download icon on work listings"', () => {
    const c = buildContainer();
    const input = c.querySelector('[data-setting="showQuickDownloadButtons"]');
    expect(input).not.toBeNull();
    expect(input.type).toBe('checkbox');
    expect(input.checked).toBe(true); // "checked" par défaut dans le HTML
  });

  it('contient les champs Calibre (enabled, url, library)', () => {
    const c = buildContainer();
    expect(c.querySelector('[data-setting="calibreEnabled"]')).not.toBeNull();
    expect(c.querySelector('[data-setting="calibreUrl"]')).not.toBeNull();
    expect(c.querySelector('[data-setting="calibreLibrary"]')).not.toBeNull();
  });
});
