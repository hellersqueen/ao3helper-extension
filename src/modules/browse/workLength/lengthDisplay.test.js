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
