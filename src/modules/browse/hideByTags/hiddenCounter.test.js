// @ts-nocheck
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { countHiddenBlurbs, renderHiddenCounter } from './_hideByTags.js';

const NS = 'ao3h';

function makeBlurb ({ wrapped = false, dimmed = false } = {}) {
  const li = document.createElement('li');
  if (wrapped) li.classList.add(`${NS}-wrapped`);
  if (dimmed) li.classList.add(`${NS}-dimmed`);
  return li;
}

describe('countHiddenBlurbs', () => {
  it('compte les blurbs repliés (wrapped) et estompés (dimmed)', () => {
    const blurbs = [
      makeBlurb({ wrapped: true }),
      makeBlurb({ dimmed: true }),
      makeBlurb(),
      makeBlurb({ wrapped: true }),
    ];
    expect(countHiddenBlurbs(blurbs, NS)).toBe(3);
  });

  it('retourne 0 si aucun blurb n\'est caché', () => {
    const blurbs = [makeBlurb(), makeBlurb(), makeBlurb()];
    expect(countHiddenBlurbs(blurbs, NS)).toBe(0);
  });

  it('retourne 0 sur une liste vide', () => {
    expect(countHiddenBlurbs([], NS)).toBe(0);
  });

  it('ne compte pas deux fois un blurb à la fois wrapped ET dimmed', () => {
    const blurbs = [makeBlurb({ wrapped: true, dimmed: true })];
    expect(countHiddenBlurbs(blurbs, NS)).toBe(1);
  });
});

describe('renderHiddenCounter', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="main"><h2>heading</h2></div>';
  });

  it('crée le bandeau au-dessus de #main quand count > 0 et enabled', () => {
    const el = renderHiddenCounter({ doc: document, NS, count: 3, enabled: true, el: null });
    expect(el).not.toBeNull();
    expect(el.className).toBe(`${NS}-hbt-counter`);
    expect(el.textContent).toBe('🚫 3 works hidden because of your tag filters');
    expect(document.querySelector('#main').firstElementChild).toBe(el);
  });

  it('utilise le singulier "work" quand count === 1', () => {
    const el = renderHiddenCounter({ doc: document, NS, count: 1, enabled: true, el: null });
    expect(el.textContent).toBe('🚫 1 work hidden because of your tag filters');
  });

  it('ne crée rien quand count === 0', () => {
    const el = renderHiddenCounter({ doc: document, NS, count: 0, enabled: true, el: null });
    expect(el).toBeNull();
    expect(document.querySelector(`.${NS}-hbt-counter`)).toBeNull();
  });

  it('ne crée rien quand enabled === false, même si count > 0', () => {
    const el = renderHiddenCounter({ doc: document, NS, count: 5, enabled: false, el: null });
    expect(el).toBeNull();
    expect(document.querySelector(`.${NS}-hbt-counter`)).toBeNull();
  });

  it('réutilise et met à jour un élément existant plutôt que d\'en créer un nouveau', () => {
    const first = renderHiddenCounter({ doc: document, NS, count: 2, enabled: true, el: null });
    const second = renderHiddenCounter({ doc: document, NS, count: 5, enabled: true, el: first });
    expect(second).toBe(first);
    expect(second.textContent).toBe('🚫 5 works hidden because of your tag filters');
    expect(document.querySelectorAll(`.${NS}-hbt-counter`).length).toBe(1);
  });

  it('retire l\'élément quand count retombe à 0', () => {
    const first = renderHiddenCounter({ doc: document, NS, count: 2, enabled: true, el: null });
    const second = renderHiddenCounter({ doc: document, NS, count: 0, enabled: true, el: first });
    expect(second).toBeNull();
    expect(document.querySelector(`.${NS}-hbt-counter`)).toBeNull();
  });

  it('retire l\'élément quand enabled devient false', () => {
    const first = renderHiddenCounter({ doc: document, NS, count: 4, enabled: true, el: null });
    const second = renderHiddenCounter({ doc: document, NS, count: 4, enabled: false, el: first });
    expect(second).toBeNull();
    expect(document.querySelector(`.${NS}-hbt-counter`)).toBeNull();
  });

  it('recrée l\'élément si celui fourni a été détaché du DOM', () => {
    const first = renderHiddenCounter({ doc: document, NS, count: 2, enabled: true, el: null });
    first.remove();
    const second = renderHiddenCounter({ doc: document, NS, count: 2, enabled: true, el: first });
    expect(second).not.toBe(null);
    expect(second.isConnected).toBe(true);
  });
});

describe('renderHiddenCounter — bouton "↻ Re-scan"', () => {
  it('ajoute le bouton quand onRescan est fourni et le déclenche au clic', () => {
    const onRescan = vi.fn();
    const el = renderHiddenCounter({ doc: document, NS, count: 3, enabled: true, el: null, onRescan });
    const btn = el.querySelector(`.${NS}-hbt-rescan`);
    expect(btn).not.toBeNull();
    btn.click();
    expect(onRescan).toHaveBeenCalledTimes(1);
  });

  it('ne duplique pas le bouton lors des mises à jour successives', () => {
    const onRescan = vi.fn();
    let el = renderHiddenCounter({ doc: document, NS, count: 3, enabled: true, el: null, onRescan });
    el = renderHiddenCounter({ doc: document, NS, count: 5, enabled: true, el, onRescan });
    expect(el.querySelectorAll(`.${NS}-hbt-rescan`).length).toBe(1);
    expect(el.textContent).toContain('5 works hidden');
  });

  it('pas de bouton sans onRescan', () => {
    const el = renderHiddenCounter({ doc: document, NS, count: 2, enabled: true, el: null });
    expect(el.querySelector(`.${NS}-hbt-rescan`)).toBeNull();
  });
});
