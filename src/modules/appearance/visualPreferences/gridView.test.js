import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GridView } from './gridView.js';

beforeEach(() => {
  document.body.innerHTML = '<ol class="work index"><li class="blurb work"></li></ol>';
});
afterEach(() => {
  document.documentElement.classList.remove('ao3h-grid-view');
  document.body.innerHTML = '';
});

describe('GridView', () => {
  it('ajoute les classes de grille au html et à la liste', () => {
    new GridView().apply(true);
    expect(document.documentElement.classList.contains('ao3h-grid-view')).toBe(true);
    expect(document.querySelector('ol.work.index').classList.contains('ao3h-grid-view-list')).toBe(true);
  });

  it('apply(false) retire les classes', () => {
    const gv = new GridView();
    gv.apply(true);
    gv.apply(false);
    expect(document.documentElement.classList.contains('ao3h-grid-view')).toBe(false);
    expect(document.querySelector('ol.work.index').classList.contains('ao3h-grid-view-list')).toBe(false);
  });
});
