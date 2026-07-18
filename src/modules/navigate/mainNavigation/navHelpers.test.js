import { describe, it, expect } from 'vitest';
import { isSearchOrigin, buildBreadcrumbs } from './navHelpers.js';

describe('isSearchOrigin', () => {
  it('accepte les pages de listing et de recherche', () => {
    expect(isSearchOrigin('/works?work_search%5Bquery%5D=fluff')).toBe(true);
    expect(isSearchOrigin('/works/search?work_search%5Bquery%5D=x')).toBe(true);
    expect(isSearchOrigin('/tags/Fluff/works')).toBe(true);
    expect(isSearchOrigin('/users/someone/bookmarks')).toBe(true);
  });
  it('refuse les pages de work individuel et les autres pages', () => {
    expect(isSearchOrigin('/works/12345')).toBe(false);
    expect(isSearchOrigin('/')).toBe(false);
    expect(isSearchOrigin('')).toBe(false);
    expect(isSearchOrigin(null)).toBe(false);
  });
});

describe('buildBreadcrumbs', () => {
  it('décompose une page de chapitre de work', () => {
    expect(buildBreadcrumbs('/works/123/chapters/456')).toEqual([
      { label: 'Works', href: '/works' },
      { label: 'Work 123', href: '/works/123' },
      { label: 'Chapter', href: null },
    ]);
  });
  it('décompose une page de works de tag en décodant le nom', () => {
    expect(buildBreadcrumbs('/tags/Hurt*s*Comfort/works')).toEqual([
      { label: 'Tags', href: '/tags' },
      { label: 'Hurt/Comfort', href: '/tags/Hurt*s*Comfort' },
      { label: 'Works', href: null },
    ]);
  });
  it('décompose une page utilisateur avec sous-section', () => {
    expect(buildBreadcrumbs('/users/someone/bookmarks')).toEqual([
      { label: 'Users', href: null },
      { label: 'someone', href: '/users/someone' },
      { label: 'Bookmarks', href: null },
    ]);
  });
  it('la page actuelle ne pointe jamais vers elle-même', () => {
    const crumbs = buildBreadcrumbs('/works/123');
    expect(crumbs[crumbs.length - 1].href).toBeNull();
  });
  it('retourne une liste vide pour la racine ou les chemins inconnus', () => {
    expect(buildBreadcrumbs('/')).toEqual([]);
    expect(buildBreadcrumbs('/media')).toEqual([]);
    expect(buildBreadcrumbs('')).toEqual([]);
  });
});
