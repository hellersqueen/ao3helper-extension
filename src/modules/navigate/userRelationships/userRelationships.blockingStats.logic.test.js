import { describe, it, expect, beforeEach } from 'vitest';
import { bumpHiddenStat, getHiddenStats } from './_userRelationships.js';

describe('blockingStats', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('démarre à zéro sans données', () => {
    expect(getHiddenStats()).toEqual({ works: 0, comments: 0 });
  });

  it('incrémente le compteur demandé sans affecter l’autre', () => {
    bumpHiddenStat('works');
    bumpHiddenStat('works');
    bumpHiddenStat('comments');
    expect(getHiddenStats()).toEqual({ works: 2, comments: 1 });
  });

  it('persiste entre les appels (localStorage)', () => {
    bumpHiddenStat('works');
    expect(getHiddenStats().works).toBe(1);
    bumpHiddenStat('works');
    expect(getHiddenStats().works).toBe(2);
  });
});
