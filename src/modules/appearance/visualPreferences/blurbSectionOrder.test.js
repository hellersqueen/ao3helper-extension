// @ts-nocheck — fichier de test, pas typé au même niveau que le code produit.
import { describe, it, expect, beforeEach } from 'vitest';
import { identifySection, computeChildOrder, DEFAULT_ORDER, BlurbSectionOrder } from './blurbSectionOrder.js';

function makeBlurbChildren () {
  const header = document.createElement('div');
  header.className = 'header module';

  const tagsHeading = document.createElement('h6');
  tagsHeading.className = 'landmark heading';
  const tags = document.createElement('ul');
  tags.className = 'tags commas';

  const summaryHeading = document.createElement('h6');
  summaryHeading.className = 'landmark heading';
  const summary = document.createElement('blockquote');
  summary.className = 'userstuff summary';

  const statsHeading = document.createElement('h6');
  statsHeading.className = 'landmark heading';
  const stats = document.createElement('dl');
  stats.className = 'stats';

  return [header, tagsHeading, tags, summaryHeading, summary, statsHeading, stats];
}

describe('identifySection', () => {
  it('reconnaît chaque section par sa classe', () => {
    const [header, , tags, , summary, , stats] = makeBlurbChildren();
    expect(identifySection(header)).toBe('header');
    expect(identifySection(tags)).toBe('tags');
    expect(identifySection(summary)).toBe('summary');
    expect(identifySection(stats)).toBe('stats');
  });

  it('retourne null pour un h6.landmark (résolu via le voisin suivant) ou un élément inconnu', () => {
    const [, tagsHeading] = makeBlurbChildren();
    expect(identifySection(tagsHeading)).toBeNull();
    expect(identifySection(document.createElement('span'))).toBeNull();
    expect(identifySection(null)).toBeNull();
  });
});

describe('computeChildOrder', () => {
  it('conserve l\'ordre par défaut (header, tags, summary, stats)', () => {
    const children = makeBlurbChildren();
    const order = computeChildOrder(children, DEFAULT_ORDER);
    expect(order.get(children[0])).toBe(0); // header
    expect(order.get(children[1])).toBe(1); // tagsHeading → suit tags
    expect(order.get(children[2])).toBe(1); // tags
    expect(order.get(children[3])).toBe(2); // summaryHeading
    expect(order.get(children[4])).toBe(2); // summary
    expect(order.get(children[5])).toBe(3); // statsHeading
    expect(order.get(children[6])).toBe(3); // stats
  });

  it('applique un ordre personnalisé : stats en premier, header en dernier', () => {
    const children = makeBlurbChildren();
    const order = computeChildOrder(children, ['stats', 'summary', 'tags', 'header']);
    expect(order.get(children[6])).toBe(0); // stats
    expect(order.get(children[5])).toBe(0); // statsHeading (même index que son contenu)
    expect(order.get(children[0])).toBe(3); // header en dernier
  });

  it('une heading gardienne sans section suivante reconnue va en fin', () => {
    const orphanHeading = document.createElement('h6');
    orphanHeading.className = 'landmark heading';
    const order = computeChildOrder([orphanHeading], DEFAULT_ORDER);
    expect(order.get(orphanHeading)).toBe(DEFAULT_ORDER.length);
  });
});

describe('BlurbSectionOrder — application DOM', () => {
  beforeEach(() => { document.body.innerHTML = ''; });

  function seedBlurb () {
    const li = document.createElement('li');
    li.className = 'blurb work';
    makeBlurbChildren().forEach(c => li.appendChild(c));
    document.getElementById('main')?.appendChild(li) || document.body.appendChild(li);
    return li;
  }

  it('n\'applique rien pour l\'ordre par défaut (pas de style.order posé)', () => {
    const li = seedBlurb();
    new BlurbSectionOrder().apply(DEFAULT_ORDER);
    expect(li.classList.contains('ao3h-blurb-reordered')).toBe(false);
    expect(li.children[0].style.order).toBe('');
  });

  it('pose style.order sur chaque enfant pour un ordre personnalisé', () => {
    const li = seedBlurb();
    const bso = new BlurbSectionOrder();
    bso.apply(['stats', 'tags', 'summary', 'header']);
    expect(li.classList.contains('ao3h-blurb-reordered')).toBe(true);
    expect(li.children[0].style.order).toBe('3'); // header
    expect(li.children[6].style.order).toBe('0'); // stats
    bso.reset();
    expect(li.classList.contains('ao3h-blurb-reordered')).toBe(false);
    expect(li.children[0].style.order).toBe('');
  });
});
