import { describe, it, expect } from 'vitest';
import { LengthDisplay } from './lengthDisplay.js';

function makeInstance(overrides = {}) {
  const cfg = (key) => (key in overrides ? overrides[key] : undefined);
  return new LengthDisplay('ao3h', cfg);
}

describe('getDynamicCategory — 5 paliers avec les seuils par défaut', () => {
  const ld = makeInstance();

  it('Flash Fiction : <= 1000 mots', () => {
    expect(ld.getDynamicCategory(500)).toEqual({ name: 'Flash Fiction', emoji: '🔥', slug: 'flash' });
    expect(ld.getDynamicCategory(1000)).toEqual({ name: 'Flash Fiction', emoji: '🔥', slug: 'flash' });
  });

  it('Short story : entre 1001 et 17500 mots', () => {
    expect(ld.getDynamicCategory(1001)).toEqual({ name: 'Short story', emoji: '⚡', slug: 'short' });
    expect(ld.getDynamicCategory(17500)).toEqual({ name: 'Short story', emoji: '⚡', slug: 'short' });
  });

  it('Novella : entre 17501 et 60000 mots', () => {
    expect(ld.getDynamicCategory(17501)).toEqual({ name: 'Novella', emoji: '📄', slug: 'novella' });
    expect(ld.getDynamicCategory(60000)).toEqual({ name: 'Novella', emoji: '📄', slug: 'novella' });
  });

  it('Novel : entre 60001 et 150000 mots', () => {
    expect(ld.getDynamicCategory(60001)).toEqual({ name: 'Novel', emoji: '📖', slug: 'novel' });
    expect(ld.getDynamicCategory(150000)).toEqual({ name: 'Novel', emoji: '📖', slug: 'novel' });
  });

  it('Epic Novel : > 150000 mots', () => {
    expect(ld.getDynamicCategory(150001)).toEqual({ name: 'Epic Novel', emoji: '📚', slug: 'epic' });
    expect(ld.getDynamicCategory(1000000)).toEqual({ name: 'Epic Novel', emoji: '📚', slug: 'epic' });
  });
});

describe('getDynamicCategory — seuils personnalisés (cfg)', () => {
  it('respecte thresholdFlash et thresholdEpic personnalisés', () => {
    const ld = makeInstance({ thresholdFlash: 500, thresholdEpic: 200000 });
    expect(ld.getDynamicCategory(500).slug).toBe('flash');
    expect(ld.getDynamicCategory(501).slug).toBe('short');
    expect(ld.getDynamicCategory(200000).slug).toBe('novel');
    expect(ld.getDynamicCategory(200001).slug).toBe('epic');
  });
});

describe('buildBadgeHTML — inclut la classe de catégorie correspondante', () => {
  it('Flash Fiction produit la classe ao3h-wl-cat--flash', () => {
    const ld = makeInstance();
    expect(ld.buildBadgeHTML(500)).toContain('ao3h-wl-cat--flash');
    expect(ld.buildBadgeHTML(500)).toContain('Flash Fiction');
  });

  it('Epic Novel produit la classe ao3h-wl-cat--epic', () => {
    const ld = makeInstance();
    expect(ld.buildBadgeHTML(200000)).toContain('ao3h-wl-cat--epic');
    expect(ld.buildBadgeHTML(200000)).toContain('Epic Novel');
  });

  it('showLengthCategory=false masque le label sans casser le reste du badge', () => {
    const ld = makeInstance({ showLengthCategory: false });
    const html = ld.buildBadgeHTML(500);
    expect(html).not.toContain('ao3h-wl-cat--flash');
    expect(html).toContain('ao3h-wl-badge');
  });
});

describe('buildBadgeHTML — pages : mots/page réglable et format d\'affichage', () => {
  it('utilise wordsPerPage pour le calcul', () => {
    const ld = makeInstance({ showPageEquiv: true, wordsPerPage: 100 });
    const html = ld.buildBadgeHTML(1000);
    expect(html).toContain('~10 pg');
  });

  it('retombe sur 275 mots/page par défaut', () => {
    const ld = makeInstance({ showPageEquiv: true });
    expect(ld.buildBadgeHTML(2750)).toContain('~10 pg');
  });

  it('respecte le format "full"', () => {
    const ld = makeInstance({ showPageEquiv: true, wordsPerPage: 100, pageFormat: 'full' });
    expect(ld.buildBadgeHTML(1000)).toContain('~10 pages');
  });
});

describe('getBooks — livres de comparaison personnalisés', () => {
  it('fusionne les livres persos avec la liste intégrée', () => {
    const ld = makeInstance({ customBooks: 'Mon Livre: 55000' });
    const books = ld.getBooks();
    expect(books.length).toBe(19); // 18 intégrés + 1 perso
    expect(books[books.length - 1]).toEqual({ title: 'Mon Livre', words: 55000 });
  });

  it('un livre perso plus proche gagne la comparaison', () => {
    const ld = makeInstance({ customBooks: 'Pile Poil: 55000' });
    expect(ld.findClosestBook(55100).title).toBe('Pile Poil');
  });

  it('sans customBooks, la liste intégrée reste inchangée', () => {
    expect(makeInstance().getBooks().length).toBe(18);
  });
});

describe('applyGradient — dégradé de longueur sur les listes', () => {
  function seedListing(counts) {
    document.body.innerHTML = counts.map(c => `
      <li class="blurb"><dl class="stats"><dd class="words">${c.toLocaleString('en-US')}</dd></dl></li>`).join('');
  }

  it('teinte les compteurs, plus fort pour le plus long', () => {
    seedListing([1000, 100000]);
    const ld = makeInstance({ lengthGradient: true });
    ld.applyGradient();
    const dds = document.querySelectorAll('dd.words');
    expect(dds[0].classList.contains('ao3h-wl-gradient')).toBe(true);
    expect(dds[0].style.backgroundColor).not.toBe(dds[1].style.backgroundColor);
    document.body.innerHTML = '';
  });

  it('inactif quand le réglage est désactivé ou avec moins de 2 fics', () => {
    seedListing([1000, 100000]);
    makeInstance({ lengthGradient: false }).applyGradient();
    expect(document.querySelector('.ao3h-wl-gradient')).toBeNull();

    seedListing([1000]);
    makeInstance({ lengthGradient: true }).applyGradient();
    expect(document.querySelector('.ao3h-wl-gradient')).toBeNull();
    document.body.innerHTML = '';
  });
});

describe('injectAvgChapterLength / injectSeriesTotal', () => {
  it('ajoute "~X w/ch" sur une page multi-chapitres', () => {
    document.body.innerHTML = `
      <dl class="stats"><dd class="words">30,000</dd><dd class="chapters">10/12</dd></dl>`;
    makeInstance({ showAvgChapterLength: true }).injectAvgChapterLength();
    const badge = document.querySelector('.ao3h-wl-avgch');
    expect(badge).not.toBeNull();
    // toLocaleString dépend de la locale du runtime — on normalise les séparateurs
    expect(badge.textContent.replace(/[\s  ,]/g, '')).toContain('3000w/ch');
    document.body.innerHTML = '';
  });

  it('rien sur une fic à chapitre unique ou réglage désactivé', () => {
    document.body.innerHTML = `
      <dl class="stats"><dd class="words">30,000</dd><dd class="chapters">1/1</dd></dl>`;
    makeInstance({ showAvgChapterLength: true }).injectAvgChapterLength();
    expect(document.querySelector('.ao3h-wl-avgch')).toBeNull();
    makeInstance({ showAvgChapterLength: false }).injectAvgChapterLength();
    expect(document.querySelector('.ao3h-wl-avgch')).toBeNull();
    document.body.innerHTML = '';
  });

  it('additionne les mots d\'une page de série', () => {
    document.body.innerHTML = `
      <div id="main"><h2 class="heading">Ma Série</h2>
      <li class="blurb"><dl class="stats"><dd class="words">10,000</dd></dl></li>
      <li class="blurb"><dl class="stats"><dd class="words">25,000</dd></dl></li></div>`;
    makeInstance({}).injectSeriesTotal();
    const banner = document.querySelector('.ao3h-wl-series-total');
    expect(banner).not.toBeNull();
    expect(banner.textContent.replace(/[\s  ,]/g, '')).toContain('35000wordsacross2works');
    document.body.innerHTML = '';
  });
});
