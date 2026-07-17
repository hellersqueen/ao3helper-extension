import { describe, it, expect, afterEach } from 'vitest';
import { LayoutDensity } from './layoutDensity.js';

afterEach(() => {
  document.documentElement.className = '';
});

describe('LayoutDensity', () => {
  it('ajoute la classe compact ou spacious', () => {
    const ld = new LayoutDensity();
    ld.apply('compact');
    expect(document.documentElement.classList.contains('ao3h-density-compact')).toBe(true);

    ld.apply('spacious');
    expect(document.documentElement.classList.contains('ao3h-density-compact')).toBe(false);
    expect(document.documentElement.classList.contains('ao3h-density-spacious')).toBe(true);
  });

  it('"comfortable" ne pose aucune classe (c\'est le style natif AO3)', () => {
    const ld = new LayoutDensity();
    ld.apply('comfortable');
    expect(document.documentElement.className).toBe('');
  });

  it('reset retire toutes les classes de densité', () => {
    const ld = new LayoutDensity();
    ld.apply('compact');
    ld.reset();
    expect(document.documentElement.className).toBe('');
  });
});
