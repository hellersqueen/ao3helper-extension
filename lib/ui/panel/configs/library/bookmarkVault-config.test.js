import { describe, it, expect, beforeEach } from 'vitest';
import { config, wireConfigArea, moduleId } from './bookmarkVault-config.js';

function buildContainer() {
  const el = document.createElement('div');
  el.innerHTML = config;
  document.body.appendChild(el);
  return el;
}

beforeEach(() => { document.body.innerHTML = ''; });

describe('moduleId', () => {
  it('est "bookmarkVault"', () => {
    expect(moduleId).toBe('bookmarkVault');
  });
});

describe('wireConfigArea — bug corrigé : le sous-bloc "Bookmark Status Filter" ne reste plus figé en display:none', () => {
  it('révèle les options si la case est cochée à l\'ouverture du panneau', () => {
    const c = buildContainer();
    c.querySelector('#ao3h-bv-statusFilter').checked = true;
    wireConfigArea(c);
    expect(c.querySelector('#ao3h-bv-statusFilter-opts').classList.contains('is-hidden')).toBe(false);
  });

  it('laisse les options cachées si la case est décochée', () => {
    const c = buildContainer();
    wireConfigArea(c);
    expect(c.querySelector('#ao3h-bv-statusFilter-opts').classList.contains('is-hidden')).toBe(true);
  });

  it('bascule au clic (change)', () => {
    const c = buildContainer();
    wireConfigArea(c);
    const checkbox = c.querySelector('#ao3h-bv-statusFilter');
    const opts = c.querySelector('#ao3h-bv-statusFilter-opts');

    checkbox.checked = true;
    checkbox.dispatchEvent(new Event('change'));
    expect(opts.classList.contains('is-hidden')).toBe(false);

    checkbox.checked = false;
    checkbox.dispatchEvent(new Event('change'));
    expect(opts.classList.contains('is-hidden')).toBe(true);
  });

  it('ne s\'attache pas deux fois', () => {
    const c = buildContainer();
    wireConfigArea(c);
    wireConfigArea(c);
    expect(c.querySelector('#ao3h-bv-statusFilter').dataset.wired).toBe('1');
  });

  it('les 2 réglages du sous-bloc (vue par défaut, compteur) restent atteignables une fois révélés', () => {
    const c = buildContainer();
    c.querySelector('#ao3h-bv-statusFilter').checked = true;
    wireConfigArea(c);
    const opts = c.querySelector('#ao3h-bv-statusFilter-opts');
    expect(opts.querySelector('[data-setting="bookmarkStatusFilterDefault"]')).not.toBeNull();
    expect(opts.querySelector('[data-setting="showStatusFilterCount"]')).not.toBeNull();
  });
});
