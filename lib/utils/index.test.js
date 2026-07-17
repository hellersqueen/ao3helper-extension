import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  $, $$, createElement, debounce, throttle,
  hasHashAnchor, getCurrentPage, getMaxPageFromDOM, buildURLForPage,
  createCache, lsGet, lsSet, lsDel, countWords,
  sessionGet, sessionSet, sessionDel,
  getJQuery, css, isAtTop,
} from './index.js';

function setUrl(path) {
  history.pushState(null, '', path);
}

afterEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  setUrl('/');
  delete window.jQuery;
  delete window.$j;
});

describe('$/$$', () => {
  it('$ retourne le premier élément qui matche', () => {
    document.body.innerHTML = `<div class="a">1</div><div class="a">2</div>`;
    expect($('.a').textContent).toBe('1');
  });

  it('$$ retourne un vrai tableau de tous les éléments', () => {
    document.body.innerHTML = `<div class="a">1</div><div class="a">2</div>`;
    const all = $$('.a');
    expect(Array.isArray(all)).toBe(true);
    expect(all.map(e => e.textContent)).toEqual(['1', '2']);
  });

  it('accepte une racine différente de document', () => {
    document.body.innerHTML = `<div id="root"><span class="x">in</span></div><span class="x">out</span>`;
    const root = document.getElementById('root');
    expect($$('.x', root).length).toBe(1);
  });
});

describe('createElement', () => {
  it('applique className, attributs data- et propriétés directes', () => {
    const el = createElement('a', { className: 'btn', 'data-id': '42', href: '/x' });
    expect(el.tagName).toBe('A');
    expect(el.className).toBe('btn');
    expect(el.getAttribute('data-id')).toBe('42');
    expect(el.getAttribute('href')).toBe('/x');
  });

  it('applique un objet style', () => {
    const el = createElement('div', { style: { color: 'red' } });
    expect(el.style.color).toBe('red');
  });
});

describe('debounce / throttle', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('debounce n\'appelle la fonction qu\'une fois après le délai', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);
    debounced(); debounced(); debounced();
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('throttle limite les appels dans la fenêtre de temps', () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 100);
    throttled(); throttled(); throttled();
    expect(fn).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(100);
    throttled();
    expect(fn).toHaveBeenCalledTimes(2);
  });
});

describe('hasHashAnchor', () => {
  it('détecte une correspondance simple', () => {
    setUrl('/works/1#comments');
    expect(hasHashAnchor('comments')).toBe(true);
    expect(hasHashAnchor('kudos')).toBe(false);
  });

  it('accepte un tableau de motifs', () => {
    setUrl('/works/1#chapter-2');
    expect(hasHashAnchor(['kudos', 'chapter'])).toBe(true);
  });

  it('retourne false sans hash', () => {
    setUrl('/works/1');
    expect(hasHashAnchor('comments')).toBe(false);
  });
});

describe('getCurrentPage / buildURLForPage', () => {
  it('lit ?page=N', () => {
    setUrl('/works?page=3');
    expect(getCurrentPage()).toBe(3);
  });

  it('retombe sur 1 sans paramètre', () => {
    setUrl('/works');
    expect(getCurrentPage()).toBe(1);
  });

  it('retombe sur 1 pour une valeur invalide', () => {
    setUrl('/works?page=abc');
    expect(getCurrentPage()).toBe(1);
  });

  it('buildURLForPage ajoute ?page=N pour N > 1', () => {
    setUrl('/works');
    expect(buildURLForPage(3)).toContain('page=3');
  });

  it('buildURLForPage retire le paramètre pour la page 1', () => {
    setUrl('/works?page=5');
    expect(buildURLForPage(1)).not.toContain('page=');
  });
});

describe('getMaxPageFromDOM', () => {
  it('lit le plus grand numéro de page dans .pagination', () => {
    document.body.innerHTML = `
      <ol class="pagination">
        <li><a href="?page=1">1</a></li>
        <li><span class="current">2</span></li>
        <li><a href="?page=7">7</a></li>
      </ol>
    `;
    expect(getMaxPageFromDOM()).toBe(7);
  });

  it('retombe sur 999 quand un lien "next" existe sans numéros', () => {
    document.body.innerHTML = `<ol class="pagination"><a class="next" rel="next" href="?page=2">Next</a></ol>`;
    expect(getMaxPageFromDOM()).toBe(999);
  });

  it('retombe sur 1 sans pagination du tout', () => {
    document.body.innerHTML = `<div></div>`;
    expect(getMaxPageFromDOM()).toBe(1);
  });
});

describe('createCache', () => {
  it('stocke et relit une valeur', () => {
    const cache = createCache(1000);
    cache.set('k', 'v');
    expect(cache.get('k')).toBe('v');
  });

  it('expire une entrée après le TTL', () => {
    vi.useFakeTimers();
    const cache = createCache(100);
    cache.set('k', 'v');
    vi.advanceTimersByTime(101);
    expect(cache.get('k')).toBeNull();
    vi.useRealTimers();
  });

  it('delete/clear suppriment les entrées', () => {
    const cache = createCache();
    cache.set('a', 1);
    cache.set('b', 2);
    cache.delete('a');
    expect(cache.get('a')).toBeNull();
    cache.clear();
    expect(cache.get('b')).toBeNull();
  });

  it('retourne null pour une clé absente', () => {
    expect(createCache().get('missing')).toBeNull();
  });
});

describe('lsGet / lsSet / lsDel', () => {
  it('écrit puis relit une valeur JSON', () => {
    lsSet('k', { a: 1 });
    expect(lsGet('k')).toEqual({ a: 1 });
  });

  it('retourne la valeur par défaut si la clé est absente', () => {
    expect(lsGet('missing', 'fallback')).toBe('fallback');
  });

  it('retourne la valeur par défaut si le JSON est corrompu', () => {
    localStorage.setItem('bad', '{not json');
    expect(lsGet('bad', 'fallback')).toBe('fallback');
  });

  it('lsDel supprime la clé', () => {
    lsSet('k', 1);
    lsDel('k');
    expect(lsGet('k')).toBeNull();
  });
});

describe('sessionGet / sessionSet / sessionDel', () => {
  it('écrit puis relit une valeur (stockée en string)', () => {
    sessionSet('k', 'v');
    expect(sessionGet('k')).toBe('v');
  });

  it('retourne la valeur par défaut si absente', () => {
    expect(sessionGet('missing', 'fallback')).toBe('fallback');
  });

  it('sessionDel supprime la clé', () => {
    sessionSet('k', 'v');
    sessionDel('k');
    expect(sessionGet('k')).toBeNull();
  });
});

describe('countWords', () => {
  it('compte les mots séparés par des espaces', () => {
    expect(countWords('Hello brave new world')).toBe(4);
  });

  it('ignore les espaces multiples', () => {
    expect(countWords('Hello    world')).toBe(2);
  });

  it('retourne 0 pour un texte vide', () => {
    expect(countWords('')).toBe(0);
    expect(countWords(null)).toBe(0);
    expect(countWords('   ')).toBe(0);
  });

  it('compte les mots avec apostrophes/tirets comme un seul mot', () => {
    expect(countWords("it's a well-known fact")).toBe(4);
  });
});

describe('getJQuery', () => {
  it('retourne window.jQuery si présent', () => {
    window.jQuery = function fakeJQ() {};
    expect(getJQuery()).toBe(window.jQuery);
  });

  it('retourne null si aucune variante n\'est présente', () => {
    expect(getJQuery()).toBeNull();
  });
});

describe('css', () => {
  it('injecte une balise <style> et retourne un handle de suppression', () => {
    const remove = css('body { color: red; }', 'test-key-1');
    const styleEl = document.querySelector('style');
    expect(styleEl).not.toBeNull();
    remove();
  });

  it('est idempotent pour la même clé', () => {
    const before = document.querySelectorAll('style').length;
    css('body{color:blue}', 'test-key-2');
    css('body{color:blue}', 'test-key-2');
    const after = document.querySelectorAll('style').length;
    expect(after).toBe(before + 1);
  });
});

describe('isAtTop', () => {
  it('est vrai quand scrollY est 0', () => {
    expect(isAtTop()).toBe(true);
  });
});
