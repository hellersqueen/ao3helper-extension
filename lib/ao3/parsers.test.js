import { describe, it, expect, afterEach } from 'vitest';
import {
  extractWorkIdFromHref,
  extractWorkIdFromBlurb,
  parseWorkIds,
  isWorksLikePath,
  isListRoute,
  isWorkRoute,
  isChapterRoute,
  isSearchRoute,
  isTagWorksRoute,
  isBookmarksRoute,
  isWorkPage,
  isListingPage,
  findPrevNextLinks,
  findFilterForm,
  findMarkForLaterForms,
  isWorkMarkedForLater,
  getChapterStats,
  parseChapterCount,
  getBlurbAuthor,
  getBlurbMeta,
  findBlurbInsertPoint,
  findBlurbContainer,
  hasExistingMarkForLater,
  createScopeKey,
  urlHasParams,
  stripUrlParams,
  createWorkUrls,
  findAllBlurbs,
  getWorkIdFromMarkForLaterForm,
  getWorkIdFromUnmarkForLaterForm,
  getWorkIdFromMarkAsReadForm,
  parseReadingsPageHTML,
  parseBookmarksPageHTML,
} from './parsers.js';

function setPath(path) {
  history.pushState(null, '', path);
}

afterEach(() => {
  setPath('/');
});

describe('extractWorkIdFromHref', () => {
  it('extrait un ID depuis un href simple', () => {
    expect(extractWorkIdFromHref('/works/12345')).toBe('12345');
  });

  it('extrait un ID avec un slash final', () => {
    expect(extractWorkIdFromHref('/works/12345/')).toBe('12345');
  });

  it('extrait un ID avec un sous-chemin chapitre', () => {
    expect(extractWorkIdFromHref('/works/12345/chapters/678')).toBe('12345');
  });

  it('extrait un ID avec query string', () => {
    expect(extractWorkIdFromHref('/works/12345?view_full_work=true')).toBe('12345');
  });

  it('retourne null pour un href sans work id', () => {
    expect(extractWorkIdFromHref('/users/someone/pseuds/someone')).toBeNull();
  });

  it('retourne null pour une entrée vide', () => {
    expect(extractWorkIdFromHref('')).toBeNull();
    expect(extractWorkIdFromHref(null)).toBeNull();
  });
});

describe('extractWorkIdFromBlurb', () => {
  it('priorise l\'attribut id="work_12345" du blurb', () => {
    const blurb = document.createElement('li');
    blurb.id = 'work_555';
    blurb.innerHTML = `<a href="/works/999">Titre</a>`;
    expect(extractWorkIdFromBlurb(blurb)).toBe('555');
  });

  it('retombe sur le lien du heading', () => {
    const blurb = document.createElement('li');
    blurb.innerHTML = `<div class="header"><h4 class="heading"><a href="/works/42">Titre</a></h4></div>`;
    expect(extractWorkIdFromBlurb(blurb)).toBe('42');
  });

  it('retombe sur n\'importe quel lien work en dernier recours', () => {
    const blurb = document.createElement('li');
    blurb.innerHTML = `<span><a href="/works/77">lien perdu</a></span>`;
    expect(extractWorkIdFromBlurb(blurb)).toBe('77');
  });

  it('retourne null sans lien work', () => {
    const blurb = document.createElement('li');
    blurb.innerHTML = `<a href="/users/alice">Alice</a>`;
    expect(extractWorkIdFromBlurb(blurb)).toBeNull();
  });

  it('retourne null pour un blurb absent', () => {
    expect(extractWorkIdFromBlurb(null)).toBeNull();
  });
});

describe('parseWorkIds', () => {
  it('parse workId seul', () => {
    expect(parseWorkIds({ pathname: '/works/123', search: '' })).toEqual({
      workId: '123', chapterId: null, isFull: false,
    });
  });

  it('parse workId + chapterId', () => {
    expect(parseWorkIds({ pathname: '/works/123/chapters/456', search: '' })).toEqual({
      workId: '123', chapterId: '456', isFull: false,
    });
  });

  it('détecte view_full_work=true', () => {
    expect(parseWorkIds({ pathname: '/works/123', search: '?view_full_work=true' })).toEqual({
      workId: '123', chapterId: null, isFull: true,
    });
  });

  it('retourne null hors page de work', () => {
    expect(parseWorkIds({ pathname: '/users/alice', search: '' })).toBeNull();
  });
});

describe('gardes de route (isWorkRoute / isChapterRoute / isWorksLikePath / isTagWorksRoute / isBookmarksRoute)', () => {
  it('isWorkRoute reconnaît une page de work simple et avec chapitre', () => {
    expect(isWorkRoute('/works/123')).toBe(true);
    expect(isWorkRoute('/works/123/chapters/4')).toBe(true);
    expect(isWorkRoute('/works/123?view_full_work=true')).toBe(true);
    expect(isWorkRoute('/users/alice')).toBe(false);
  });

  it('isChapterRoute exige un ID de chapitre', () => {
    expect(isChapterRoute('/works/123/chapters/456')).toBe(true);
    expect(isChapterRoute('/works/123')).toBe(false);
  });

  it('isWorksLikePath reconnaît /works et /tags/x/works', () => {
    expect(isWorksLikePath('/works')).toBe(true);
    expect(isWorksLikePath('/works/')).toBe(true);
    expect(isWorksLikePath('/tags/Some%20Tag/works')).toBe(true);
    expect(isWorksLikePath('/works/123')).toBe(false);
  });

  it('isTagWorksRoute reconnaît uniquement /tags/x/works', () => {
    expect(isTagWorksRoute('/tags/Angst/works')).toBe(true);
    expect(isTagWorksRoute('/tags/Angst/works/123')).toBe(false);
  });

  it('isBookmarksRoute reconnaît les pages bookmarks d\'un user', () => {
    expect(isBookmarksRoute('/users/alice/bookmarks')).toBe(true);
    expect(isBookmarksRoute('/works/123')).toBe(false);
  });

  it('isWorkPage reconnaît toute page /works/<id>...', () => {
    expect(isWorkPage('/works/123')).toBe(true);
    expect(isWorkPage('/works/123/chapters/4')).toBe(true);
    expect(isWorkPage('/works')).toBe(false);
  });
});

describe('isListingPage — définition unique de "page de listing" (corrige les 4 gardes trop permissives)', () => {
  it('reconnaît une page de work individuel comme NON listing', () => {
    expect(isListingPage('/works/123')).toBe(false);
    expect(isListingPage('/works/123/chapters/4')).toBe(false);
  });

  it('reconnaît /works, /works/search, /tags/x/works, /bookmarks comme listing', () => {
    expect(isListingPage('/works')).toBe(true);
    expect(isListingPage('/works/search')).toBe(true);
    expect(isListingPage('/tags/Angst/works')).toBe(true);
    expect(isListingPage('/bookmarks')).toBe(true);
  });

  it('reconnaît les pages user (works/bookmarks/readings/pseuds) comme listing', () => {
    expect(isListingPage('/users/alice/works')).toBe(true);
    expect(isListingPage('/users/alice/bookmarks')).toBe(true);
    expect(isListingPage('/users/alice/readings')).toBe(true);
    expect(isListingPage('/users/alice/pseuds/alice/works')).toBe(true);
  });

  it('reconnaît les works d\'une collection comme listing', () => {
    expect(isListingPage('/collections/SomeCollection/works')).toBe(true);
  });

  it('rejette un pathname vide', () => {
    expect(isListingPage('')).toBe(false);
  });
});

describe('isListRoute / isSearchRoute (dépendent de location globale)', () => {
  it('isListRoute est faux sur une page de work individuel', () => {
    setPath('/works/123');
    document.body.innerHTML = `<li class="blurb work"></li>`;
    expect(isListRoute(document)).toBe(false);
  });

  it('isListRoute est faux sur la page kudos-history', () => {
    setPath('/users/alice/kudos-history');
    document.body.innerHTML = `<li class="blurb work"></li>`;
    expect(isListRoute(document)).toBe(false);
  });

  it('isListRoute est vrai avec des blurbs présents ailleurs', () => {
    setPath('/works');
    document.body.innerHTML = `<li class="blurb work"></li>`;
    expect(isListRoute(document)).toBe(true);
  });

  it('isListRoute est faux sans blurb présent', () => {
    setPath('/works');
    document.body.innerHTML = `<div>rien ici</div>`;
    expect(isListRoute(document)).toBe(false);
  });

  it('isSearchRoute reconnaît /works et le paramètre work_search[query]', () => {
    expect(isSearchRoute('/works')).toBe(true);
    setPath('/works/search?work_search%5Bquery%5D=angst');
    expect(isSearchRoute('/works/search')).toBe(true);
  });
});

describe('findPrevNextLinks', () => {
  it('trouve les liens rel=prev/next', () => {
    document.body.innerHTML = `
      <a rel="prev" href="/works/1/chapters/1">prev</a>
      <a rel="next" href="/works/1/chapters/3">next</a>
    `;
    const { prev, next } = findPrevNextLinks(document);
    expect(prev.getAttribute('href')).toBe('/works/1/chapters/1');
    expect(next.getAttribute('href')).toBe('/works/1/chapters/3');
  });

  it('retombe sur .chapter.previous / .chapter.next si rel absent', () => {
    document.body.innerHTML = `
      <li class="chapter previous"><a href="/works/1/chapters/1">prev</a></li>
      <li class="chapter next"><a href="/works/1/chapters/3">next</a></li>
    `;
    const { prev, next } = findPrevNextLinks(document);
    expect(prev.getAttribute('href')).toBe('/works/1/chapters/1');
    expect(next.getAttribute('href')).toBe('/works/1/chapters/3');
  });

  it('retourne null quand rien n\'est trouvé', () => {
    document.body.innerHTML = `<div></div>`;
    expect(findPrevNextLinks(document)).toEqual({ prev: null, next: null });
  });
});

describe('findFilterForm', () => {
  it('trouve le formulaire via #work-filters form', () => {
    document.body.innerHTML = `<div id="work-filters"><form id="f1"></form></div>`;
    expect(findFilterForm(document).id).toBe('f1');
  });

  it('retombe sur un formulaire ciblant /works', () => {
    document.body.innerHTML = `<form action="/works" id="f2"></form>`;
    expect(findFilterForm(document).id).toBe('f2');
  });

  it('retourne null sans formulaire pertinent', () => {
    document.body.innerHTML = `<form action="/comments" id="f3"></form>`;
    expect(findFilterForm(document)).toBeNull();
  });
});

describe('findMarkForLaterForms / hasExistingMarkForLater', () => {
  it('trouve le formulaire mark et unmark', () => {
    const blurb = document.createElement('li');
    blurb.innerHTML = `
      <form class="button_to" action="/works/1/mark_for_later"></form>
    `;
    const { markForm, unmarkForm } = findMarkForLaterForms(blurb);
    expect(markForm).not.toBeNull();
    expect(unmarkForm).toBeNull();
    expect(hasExistingMarkForLater(blurb)).toBe(true);
  });

  it('gère l\'absence de blurb', () => {
    expect(findMarkForLaterForms(null)).toEqual({ markForm: null, unmarkForm: null });
    expect(hasExistingMarkForLater(null)).toBe(false);
  });
});

describe('isWorkMarkedForLater', () => {
  it('détecte via un endpoint unmark', () => {
    expect(isWorkMarkedForLater('<a href="/works/1/unmark_for_later">Unmark</a>')).toBe(true);
  });

  it('détecte via le texte "already marked"', () => {
    expect(isWorkMarkedForLater('Already marked as read')).toBe(true);
  });

  it('retourne false sans indice', () => {
    expect(isWorkMarkedForLater('<a href="/works/1/mark_for_later">Mark</a>')).toBe(false);
  });

  it('retourne false pour une entrée vide', () => {
    expect(isWorkMarkedForLater('')).toBe(false);
  });
});

describe('getChapterStats', () => {
  it('lit dd.chapters (« 3/10 »)', () => {
    document.body.innerHTML = `<dl class="work meta"><dd class="chapters">3/10</dd></dl>`;
    expect(getChapterStats(document)).toEqual({ chapterIndex: 3, chapterTotal: 10 });
  });

  it('traite "?" comme total inconnu → repli sur 1', () => {
    document.body.innerHTML = `<dl class="work meta"><dd class="chapters">5/?</dd></dl>`;
    expect(getChapterStats(document)).toEqual({ chapterIndex: 5, chapterTotal: 1 });
  });

  it('retombe sur le titre "Chapter N of M" si pas de dd.chapters', () => {
    document.body.innerHTML = `<div class="chapter"><div class="title">Chapter 2 of 5</div></div>`;
    expect(getChapterStats(document)).toEqual({ chapterIndex: 2, chapterTotal: 5 });
  });

  it('retourne 1/1 par défaut', () => {
    document.body.innerHTML = `<div></div>`;
    expect(getChapterStats(document)).toEqual({ chapterIndex: 1, chapterTotal: 1 });
  });
});

describe('parseChapterCount (contrairement à getChapterStats, garde total=null si "?")', () => {
  it('parse "3/10"', () => {
    expect(parseChapterCount('3/10')).toEqual({ published: 3, total: 10, isComplete: false, pct: 30 });
  });

  it('parse "1/1" comme complet à 100%', () => {
    expect(parseChapterCount('1/1')).toEqual({ published: 1, total: 1, isComplete: true, pct: 100 });
  });

  it('garde total=null pour "5/?"', () => {
    expect(parseChapterCount('5/?')).toEqual({ published: 5, total: null, isComplete: false, pct: null });
  });

  it('gère les virgules dans les grands nombres', () => {
    expect(parseChapterCount('1,234/2,000')).toEqual({ published: 1234, total: 2000, isComplete: false, pct: 62 });
  });

  it('accepte un nœud DOM en entrée', () => {
    const dd = document.createElement('dd');
    dd.textContent = '2/2';
    expect(parseChapterCount(dd)).toEqual({ published: 2, total: 2, isComplete: true, pct: 100 });
  });

  it('retourne tout null pour un texte non reconnu', () => {
    expect(parseChapterCount('abc')).toEqual({ published: null, total: null, isComplete: false, pct: null });
  });
});

describe('getBlurbAuthor / getBlurbMeta / findAllBlurbs', () => {
  const blurbHTML = `
    <li id="work_100" role="article">
      <div class="header">
        <h4 class="heading">
          <a href="/works/100">Un titre</a>
          <a rel="author" href="/users/alice/pseuds/alice">alice</a>
        </h4>
      </div>
      <blockquote class="userstuff summary">Un résumé</blockquote>
      <h5 class="fandoms"><a class="tag" href="#">Harry Potter</a></h5>
      <ul class="tags commas">
        <li class="relationships"><a class="tag" href="#">A/B</a></li>
        <li class="freeforms"><a class="tag" href="#">Fluff</a></li>
      </ul>
      <dd class="chapters">1/1</dd>
    </li>
  `;

  it('getBlurbAuthor lit le lien rel=author', () => {
    document.body.innerHTML = blurbHTML;
    const blurb = document.querySelector('li');
    expect(getBlurbAuthor(blurb)).toEqual({ name: 'alice', username: 'alice' });
  });

  it('getBlurbAuthor retourne des null sans lien auteur', () => {
    const blurb = document.createElement('li');
    expect(getBlurbAuthor(blurb)).toEqual({ name: null, username: null });
  });

  it('getBlurbMeta assemble toutes les métadonnées', () => {
    document.body.innerHTML = blurbHTML;
    const blurb = document.querySelector('li');
    const meta = getBlurbMeta(blurb);
    expect(meta.workId).toBe('100');
    expect(meta.title).toBe('Un titre');
    expect(meta.author).toBe('alice');
    expect(meta.authorUsername).toBe('alice');
    expect(meta.summary).toBe('Un résumé');
    expect(meta.fandoms).toEqual(['Harry Potter']);
    expect(meta.relationships).toEqual(['A/B']);
    expect(meta.freeforms).toEqual(['Fluff']);
    expect(meta.chapters).toEqual({ published: 1, total: 1, isComplete: true, pct: 100 });
  });

  it('getBlurbMeta retourne null sans blurb', () => {
    expect(getBlurbMeta(null)).toBeNull();
  });

  it('findAllBlurbs dédoublonne les blurbs qui matchent plusieurs sélecteurs', () => {
    document.body.innerHTML = blurbHTML; // matche à la fois li[role=article] et li.blurb.group potentiellement
    expect(findAllBlurbs(document).length).toBe(1);
  });
});

describe('findBlurbInsertPoint / findBlurbContainer', () => {
  it('insère avant le prochain sibling de .stats en priorité', () => {
    document.body.innerHTML = `<li><div class="stats"></div><div class="after">X</div></li>`;
    const blurb = document.querySelector('li');
    const { beforeNode, container } = findBlurbInsertPoint(blurb);
    expect(beforeNode.className).toBe('after');
    expect(container).toBe(blurb);
  });

  it('retombe sur la fin du blurb sans ancre connue', () => {
    document.body.innerHTML = `<li><span>rien</span></li>`;
    const blurb = document.querySelector('li');
    expect(findBlurbInsertPoint(blurb)).toEqual({ beforeNode: null, container: blurb });
  });

  it('findBlurbContainer priorise .datetime', () => {
    document.body.innerHTML = `<li><div class="datetime"></div><h4 class="heading"></h4></li>`;
    const blurb = document.querySelector('li');
    expect(findBlurbContainer(blurb).className).toBe('datetime');
  });

  it('findBlurbContainer retombe sur le blurb entier', () => {
    document.body.innerHTML = `<li><span>rien</span></li>`;
    const blurb = document.querySelector('li');
    expect(findBlurbContainer(blurb)).toBe(blurb);
  });
});

describe('createScopeKey', () => {
  it('génère une clé pour une page de tag', () => {
    expect(createScopeKey('hide', { pathname: '/tags/Angst/works' })).toBe('hide:tag:Angst');
  });

  it('génère une clé pour /works', () => {
    expect(createScopeKey('hide', { pathname: '/works' })).toBe('hide:works');
  });

  it('retombe sur le pathname brut', () => {
    expect(createScopeKey('hide', { pathname: '/users/alice' })).toBe('hide:/users/alice');
  });

  it('retourne null sans préfixe', () => {
    expect(createScopeKey('', { pathname: '/works' })).toBeNull();
  });
});

describe('urlHasParams / stripUrlParams', () => {
  it('urlHasParams vérifie que tous les paramètres attendus correspondent', () => {
    expect(urlHasParams('https://ao3.org/works?rating=T&sort=kudos', { rating: 'T', sort: 'kudos' })).toBe(true);
    expect(urlHasParams('https://ao3.org/works?rating=T', { rating: 'M' })).toBe(false);
  });

  it('urlHasParams retourne false pour une URL invalide', () => {
    expect(urlHasParams('::::not a url', { a: 'b' })).toBe(false);
  });

  it('stripUrlParams supprime les clés demandées', () => {
    const result = stripUrlParams('https://ao3.org/works?rating=T&sort=kudos', ['rating']);
    expect(result).not.toContain('rating');
    expect(result).toContain('sort=kudos');
  });

  it('stripUrlParams retourne l\'URL telle quelle sans clés à retirer', () => {
    const url = 'https://ao3.org/works?rating=T';
    expect(stripUrlParams(url, [])).toBe(url);
  });
});

describe('createWorkUrls', () => {
  it('construit les 3 URLs à partir d\'un workId', () => {
    expect(createWorkUrls('42')).toEqual({
      work: '/works/42',
      markForLater: '/works/42/mark_for_later',
      unmarkForLater: '/works/42/unmark_for_later',
    });
  });

  it('retourne des null sans workId', () => {
    expect(createWorkUrls(null)).toEqual({ work: null, markForLater: null, unmarkForLater: null });
  });
});

describe('getWorkIdFromMarkForLaterForm / Unmark / MarkAsRead', () => {
  function formWithAction(action) {
    const form = document.createElement('form');
    form.setAttribute('action', action);
    return form;
  }

  it('extrait depuis mark_for_later', () => {
    expect(getWorkIdFromMarkForLaterForm(formWithAction('/works/9/mark_for_later'))).toBe('9');
  });

  it('extrait depuis unmark_for_later', () => {
    expect(getWorkIdFromUnmarkForLaterForm(formWithAction('/works/9/unmark_for_later'))).toBe('9');
  });

  it('extrait depuis mark_as_read', () => {
    expect(getWorkIdFromMarkAsReadForm(formWithAction('/works/9/mark_as_read'))).toBe('9');
  });

  it('retourne null pour un mauvais type de formulaire', () => {
    expect(getWorkIdFromMarkForLaterForm(formWithAction('/works/9/unmark_for_later'))).toBeNull();
  });

  it('retourne null sans formulaire', () => {
    expect(getWorkIdFromMarkForLaterForm(null)).toBeNull();
  });
});

describe('parseReadingsPageHTML', () => {
  it('extrait les work IDs de la liste principale et détecte la page suivante', () => {
    const html = `
      <div id="main">
        <ol class="index group">
          <li class="blurb work" id="work_1"></li>
          <li class="blurb work" id="work_2"></li>
        </ol>
      </div>
      <li class="next"><a href="?page=2">Next</a></li>
    `;
    const { ids, blurbsSeen, hasNext } = parseReadingsPageHTML(html);
    expect(ids).toEqual(new Set(['1', '2']));
    expect(blurbsSeen).toBe(2);
    expect(hasNext).toBe(true);
  });

  it('retourne un résultat vide pour un HTML vide', () => {
    const { ids, blurbsSeen, hasNext } = parseReadingsPageHTML('');
    expect(ids.size).toBe(0);
    expect(blurbsSeen).toBe(0);
    expect(hasNext).toBe(false);
  });
});

describe('parseBookmarksPageHTML', () => {
  it('extrait les bookmarks avec leur statut privé', () => {
    const html = `
      <li class="bookmark blurb" id="work_1"></li>
      <li class="bookmark blurb private" id="work_2"></li>
    `;
    const { bookmarks, blurbsSeen, hasNext } = parseBookmarksPageHTML(html);
    expect(blurbsSeen).toBe(2);
    expect(bookmarks).toEqual([
      { workId: '1', isPrivate: false },
      { workId: '2', isPrivate: true },
    ]);
    expect(hasNext).toBe(false);
  });

  it('retourne un résultat vide sans HTML', () => {
    expect(parseBookmarksPageHTML('')).toEqual({ bookmarks: [], blurbsSeen: 0, hasNext: false });
  });
});
