import { describe, it, expect } from 'vitest';
import {
  levenshtein, fuzzyFilterHistory, topSearches, trendingSearches,
  fandomBarData, extractFandomFromContext, buildRefinementTip,
  QUICK_TEMPLATES, buildTemplateUrl,
} from './_searchEnhancer.js';

describe('levenshtein', () => {
  it('vaut 0 pour des chaînes identiques', () => {
    expect(levenshtein('slowburn', 'slowburn')).toBe(0);
  });

  it('détecte une faute de frappe à une lettre', () => {
    expect(levenshtein('slowburn', 'slowbrun')).toBeLessThanOrEqual(2);
    expect(levenshtein('fixit', 'fixti')).toBe(2);
    expect(levenshtein('angst', 'angts')).toBe(2);
  });

  it('gère les chaînes vides', () => {
    expect(levenshtein('', 'abc')).toBe(3);
    expect(levenshtein('abc', '')).toBe(3);
  });
});

describe('fuzzyFilterHistory', () => {
  const list = [
    { query: 'time travel fix-it' },
    { query: 'enemies to lovers' },
    { query: 'slow burn' },
  ];

  it('privilégie la correspondance exacte par sous-chaîne', () => {
    expect(fuzzyFilterHistory(list, 'slow')).toEqual([{ query: 'slow burn' }]);
  });

  it('tolère une faute de frappe quand rien ne correspond exactement', () => {
    const result = fuzzyFilterHistory(list, 'enemis');
    expect(result).toEqual([{ query: 'enemies to lovers' }]);
  });

  it('renvoie les 10 plus récentes pour une requête trop courte', () => {
    expect(fuzzyFilterHistory(list, 'a')).toEqual(list);
  });

  it('renvoie un tableau vide si rien n’est assez proche', () => {
    expect(fuzzyFilterHistory(list, 'zzzzz')).toEqual([]);
  });
});

describe('topSearches', () => {
  it('classe les requêtes répétées par fréquence', () => {
    const history = [
      { query: 'Slow Burn' }, { query: 'slow burn' }, { query: 'Fix-It' },
      { query: 'slow burn' }, { query: 'Angst' },
    ];
    expect(topSearches(history)).toEqual([{ query: 'slow burn', count: 3 }]);
  });

  it('ignore les requêtes jamais répétées', () => {
    expect(topSearches([{ query: 'once' }])).toEqual([]);
  });
});

describe('trendingSearches', () => {
  it('détecte une requête plus fréquente dans la moitié récente', () => {
    // newest-first: 4 récentes puis 4 anciennes
    const history = [
      { query: 'fix-it' }, { query: 'fix-it' }, { query: 'angst' }, { query: 'fix-it' },
      { query: 'slow burn' }, { query: 'slow burn' }, { query: 'fix-it' }, { query: 'hurt/comfort' },
    ];
    expect(trendingSearches(history)).toContain('fix-it');
  });

  it('renvoie un tableau vide avec trop peu d’historique', () => {
    expect(trendingSearches([{ query: 'a' }, { query: 'b' }])).toEqual([]);
  });
});

describe('fandomBarData', () => {
  it('calcule des barres proportionnelles au fandom le plus recherché', () => {
    const history = [
      { fandom: 'Harry Potter' }, { fandom: 'Harry Potter' },
      { fandom: 'Marvel' }, { fandom: null }, {},
    ];
    expect(fandomBarData(history)).toEqual([
      { fandom: 'Harry Potter', count: 2, pct: 100 },
      { fandom: 'Marvel', count: 1, pct: 50 },
    ]);
  });
});

describe('extractFandomFromContext', () => {
  it('lit le fandom depuis une page /tags/{fandom}/works', () => {
    expect(extractFandomFromContext({ pathname: '/tags/Harry%20Potter/works' })).toBe('Harry Potter');
  });

  it('lit le premier fandom du champ de recherche sinon', () => {
    expect(extractFandomFromContext({ pathname: '/works/search', fandomFieldValue: 'Marvel, DC Comics' })).toBe('Marvel');
  });

  it('renvoie null si rien n’est disponible', () => {
    expect(extractFandomFromContext({ pathname: '/works/search' })).toBeNull();
  });
});

describe('buildRefinementTip', () => {
  it('suggère d’élargir la recherche sans résultat', () => {
    expect(buildRefinementTip(0)).toMatch(/broaden/);
  });

  it('suggère d’affiner la recherche avec beaucoup de résultats', () => {
    expect(buildRefinementTip(20)).toMatch(/narrow/);
  });

  it('ne dit rien pour un nombre de résultats intermédiaire', () => {
    expect(buildRefinementTip(5)).toBeNull();
  });
});

describe('QUICK_TEMPLATES / buildTemplateUrl', () => {
  it('applique les paramètres du modèle sans perdre les filtres existants', () => {
    const url = buildTemplateUrl('https://archiveofourown.org/works?work_search%5Bfandom_names%5D=Marvel', QUICK_TEMPLATES[0].params);
    const u = new URL(url);
    expect(u.searchParams.get('work_search[fandom_names]')).toBe('Marvel');
    expect(u.searchParams.get('work_search[sort_column]')).toBe('kudos_count');
    expect(u.searchParams.get('work_search[sort_direction]')).toBe('desc');
  });

  it('remplace une valeur déjà présente pour la même clé', () => {
    const url = buildTemplateUrl('https://archiveofourown.org/works?work_search%5Bcomplete%5D=F', QUICK_TEMPLATES[2].params);
    expect(new URL(url).searchParams.get('work_search[complete]')).toBe('T');
  });
});
