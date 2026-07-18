import { describe, it, expect, beforeEach } from 'vitest';
import { HiddenGems } from './hiddenGems.js';

function buildListing (works) {
  document.body.innerHTML = `<div id="main"><ol class="work index group">${
    works.map(({ id, kudos, hits, bookmarks }) => `
      <li class="work blurb group" id="work_${id}">
        <h4 class="heading"></h4>
        <dl class="stats">
          <dd class="kudos">${kudos}</dd>
          <dd class="hits">${hits}</dd>
          <dd class="bookmarks">${bookmarks}</dd>
        </dl>
      </li>`).join('')
  }</ol></div>`;
}

describe('HiddenGems', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('détecte une pépite avec les seuils par défaut et affiche un badge médaille', () => {
    buildListing([{ id: 1, kudos: 16, hits: 100, bookmarks: 2 }]); // ratio 16% → diamond (3x 5%)
    const gems = new HiddenGems();
    gems.init();
    const badge = document.querySelector('.ao3h-gem-badge');
    expect(badge).not.toBeNull();
    expect(badge.classList.contains('ao3h-gem-badge-diamond')).toBe(true);
    expect(badge.textContent).toContain('💎');
    gems.cleanup();
  });

  it('respecte des seuils personnalisés', () => {
    buildListing([{ id: 1, kudos: 3, hits: 40, bookmarks: 1 }]); // ne passerait pas les seuils par défaut (minHits 50)
    const gems = new HiddenGems({ thresholds: { minHits: 20, minKudos: 2 } });
    gems.init();
    expect(document.querySelector('.ao3h-gem-badge')).not.toBeNull();
    gems.cleanup();
  });

  it('ne détecte rien via la moyenne de page quand compareToPageAverage est désactivé', () => {
    buildListing([
      { id: 1, kudos: 6, hits: 200, bookmarks: 1 }, // ratio 3% — sous le seuil fixe (5%), mais relativement élevé
      { id: 2, kudos: 4, hits: 200, bookmarks: 1 }, // ratio 2% — tire la moyenne de page vers le bas, pas assez de kudos pour être éligible
    ]);
    const gems = new HiddenGems();
    gems.init();
    expect(document.querySelectorAll('.ao3h-gem-badge').length).toBe(0);
    gems.cleanup();
  });

  it('détecte une pépite relative à la moyenne de la page quand compareToPageAverage est activé', () => {
    buildListing([
      { id: 1, kudos: 40, hits: 1000, bookmarks: 5 },  // ratio 4% — sous le seuil fixe (5%) donc pas gem par défaut
      { id: 2, kudos: 10, hits: 1000, bookmarks: 2 },  // ratio 1% — tire la moyenne de page vers le bas
    ]);
    const gems = new HiddenGems({ compareToPageAverage: true });
    gems.init();
    const badge = document.querySelector('#work_1 .ao3h-gem-badge');
    expect(badge).not.toBeNull();
    expect(badge.title).toContain('page average');
    gems.cleanup();
  });

  it('cleanup retire les badges et classes injectés', () => {
    buildListing([{ id: 1, kudos: 16, hits: 100, bookmarks: 2 }]);
    const gems = new HiddenGems();
    gems.init();
    expect(document.querySelector('.ao3h-gem-badge')).not.toBeNull();
    gems.cleanup();
    expect(document.querySelector('.ao3h-gem-badge')).toBeNull();
    expect(document.querySelector('.ao3h-gem-blurb')).toBeNull();
  });
});
