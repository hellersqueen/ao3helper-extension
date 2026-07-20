import { describe, it, expect } from 'vitest';
import {
  fillTemplateVariables, filterTemplates, draftKeyFor, draftScopeForForm,
  shouldAutoCollapse, parseHighlightRules, matchesCustomHighlight,
  matchesSearch, buildPageJumpUrl,
} from './_commentKit.js';

describe('fillTemplateVariables', () => {
  it('remplace les variables connues', () => {
    expect(fillTemplateVariables('Loved {title} by {author}!', { title: 'My Fic', author: 'someone' }))
      .toBe('Loved My Fic by someone!');
  });

  it('remplace par une chaîne vide quand la variable est absente', () => {
    expect(fillTemplateVariables('Hi {author}', {})).toBe('Hi ');
  });

  it('laisse le texte intact sans placeholder', () => {
    expect(fillTemplateVariables('Great chapter!', { title: 'x' })).toBe('Great chapter!');
  });
});

describe('filterTemplates', () => {
  const templates = ['Loved this!', 'Amazing work!', 'Cannot wait for more'];

  it('filtre par sous-chaîne insensible à la casse', () => {
    expect(filterTemplates(templates, 'amazing')).toEqual(['Amazing work!']);
  });

  it('renvoie tout sans requête', () => {
    expect(filterTemplates(templates, '')).toBe(templates);
  });
});

describe('draftKeyFor / draftScopeForForm', () => {
  it('garde la clé historique pour le scope "top"', () => {
    expect(draftKeyFor('123', 'top')).toBe('ao3h:draft:123');
  });

  it('donne une clé distincte par commentaire pour une réponse', () => {
    expect(draftKeyFor('123', 'comment_456')).toBe('ao3h:draft:123:comment_456');
    expect(draftKeyFor('123', 'comment_456')).not.toBe(draftKeyFor('123', 'top'));
  });

  it('détermine le scope depuis l’id du commentaire parent', () => {
    expect(draftScopeForForm('comment_456')).toBe('comment_456');
    expect(draftScopeForForm(null)).toBe('top');
  });
});

describe('shouldAutoCollapse', () => {
  it('respecte toujours une préférence manuelle', () => {
    expect(shouldAutoCollapse(50, 5, false)).toBe(false);
    expect(shouldAutoCollapse(0, 5, true)).toBe(true);
  });

  it('replie automatiquement au-delà du seuil', () => {
    expect(shouldAutoCollapse(10, 5, undefined)).toBe(true);
    expect(shouldAutoCollapse(3, 5, undefined)).toBe(false);
  });

  it('désactive le repli automatique quand le seuil est à 0', () => {
    expect(shouldAutoCollapse(100, 0, undefined)).toBe(false);
  });
});

describe('parseHighlightRules / matchesCustomHighlight', () => {
  it('découpe et normalise la liste', () => {
    expect(parseHighlightRules(' Alice , BOB, spoiler ')).toEqual(['alice', 'bob', 'spoiler']);
  });

  it('détecte une correspondance par auteur', () => {
    const rules = parseHighlightRules('alice');
    expect(matchesCustomHighlight({ author: 'Alice', text: 'hi' }, rules)).toBe(true);
  });

  it('détecte une correspondance par mot-clé dans le texte', () => {
    const rules = parseHighlightRules('spoiler');
    expect(matchesCustomHighlight({ author: 'bob', text: 'no spoiler here' }, rules)).toBe(true);
  });

  it('ne correspond à rien sans règles', () => {
    expect(matchesCustomHighlight({ author: 'bob', text: 'x' }, [])).toBe(false);
  });
});

describe('matchesSearch', () => {
  it('filtre par sous-chaîne insensible à la casse', () => {
    expect(matchesSearch('Great CHAPTER!', 'chapter')).toBe(true);
    expect(matchesSearch('Great chapter!', 'nope')).toBe(false);
  });

  it('accepte tout sans requête', () => {
    expect(matchesSearch('anything', '')).toBe(true);
  });
});

describe('buildPageJumpUrl', () => {
  it('ajoute le paramètre de page et ancre sur les commentaires', () => {
    const url = buildPageJumpUrl('https://archiveofourown.org/works/1', 3);
    expect(url).toBe('https://archiveofourown.org/works/1?page=3#comments');
  });

  it('retire le paramètre pour la page 1', () => {
    const url = buildPageJumpUrl('https://archiveofourown.org/works/1?page=5', 1);
    expect(url).toBe('https://archiveofourown.org/works/1#comments');
  });
});
