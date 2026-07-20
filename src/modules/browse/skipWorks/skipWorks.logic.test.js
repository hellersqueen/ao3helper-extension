// @ts-nocheck
import { describe, it, expect } from 'vitest';
import {
  DISPLAY_STYLES,
  extractWorkMeta,
  findHideButtonAnchor,
  hasStandaloneNote,
  isHideBarRevealTarget,
  resolveDisplayStyle,
} from './_skipWorks.js';

const NS = 'ao3h';

function makeBlurb (html) {
  const li = document.createElement('li');
  li.className = 'blurb';
  li.innerHTML = html;
  return li;
}

function makeHideBar () {
  const bar = document.createElement('div');
  bar.className = `${NS}-m5-hidebar`;
  bar.innerHTML = `
    <div class="left"><span class="label">Hidden:</span><span class="reason-text">crossover</span></div>
    <div class="right">
      <button class="edit-reason">Edit</button><button class="show">Show</button><button class="unhide">Unhide</button>
    </div>
  `;
  document.body.appendChild(bar);
  return bar;
}

function makePlacementBlurb ({ withStats = true, withCut = false } = {}) {
  const li = document.createElement('li');
  const inner = `
    <div class="header"><h4 class="heading"><a href="/works/1">Title</a></h4></div>
    ${withStats ? '<dl class="stats"><dt>Words:</dt><dd>100</dd></dl>' : ''}
  `;
  li.innerHTML = withCut ? `<div class="ao3h-cut">${inner}</div>` : inner;
  document.body.appendChild(li);
  return li;
}

describe('extractWorkMeta', () => {
  it('extrait le titre et l’auteur depuis un blurb standard', () => {
    const blurb = makeBlurb(`
      <div class="header module"><h4 class="heading">
        <a href="/works/80650656">Must Love Dogs</a>
        by <a rel="author" href="/users/petalsonparchment">petalsonparchment</a>
      </h4></div>
    `);
    expect(extractWorkMeta(blurb)).toEqual({ title: 'Must Love Dogs', author: 'petalsonparchment' });
  });

  it('gère le wrapper de hideByTags', () => {
    const blurb = makeBlurb(`
      <div class="ao3h-cut"><div class="header module"><h4 class="heading">
        <a href="/works/123">Some Title</a> by <a rel="author">foo</a>
      </h4></div></div>
    `);
    expect(extractWorkMeta(blurb)).toEqual({ title: 'Some Title', author: 'foo' });
  });

  it('gère une œuvre anonyme, un blurb vide et une entrée invalide', () => {
    const anonymous = makeBlurb('<div class="header"><a href="/works/999">Anonymous Work</a></div>');
    expect(extractWorkMeta(anonymous)).toEqual({ title: 'Anonymous Work', author: '' });
    expect(extractWorkMeta(makeBlurb('<div>no links</div>'))).toEqual({ title: '', author: '' });
    expect(extractWorkMeta(null)).toEqual({ title: '', author: '' });
    expect(extractWorkMeta({})).toEqual({ title: '', author: '' });
  });
});

describe('isHideBarRevealTarget', () => {
  it('accepte la barre et son texte', () => {
    const bar = makeHideBar();
    expect(isHideBarRevealTarget(bar, NS)).toBe(true);
    expect(isHideBarRevealTarget(bar.querySelector('.label'), NS)).toBe(true);
    expect(isHideBarRevealTarget(bar.querySelector('.reason-text'), NS)).toBe(true);
  });

  it('refuse tous les boutons de la barre', () => {
    const bar = makeHideBar();
    expect(isHideBarRevealTarget(bar.querySelector('.show'), NS)).toBe(false);
    expect(isHideBarRevealTarget(bar.querySelector('.edit-reason'), NS)).toBe(false);
    expect(isHideBarRevealTarget(bar.querySelector('.unhide'), NS)).toBe(false);
  });

  it('refuse une cible extérieure ou invalide', () => {
    expect(isHideBarRevealTarget(document.createElement('div'), NS)).toBe(false);
    expect(isHideBarRevealTarget(null, NS)).toBe(false);
    expect(isHideBarRevealTarget(undefined, NS)).toBe(false);
  });
});

describe('resolveDisplayStyle', () => {
  it('résout les quatre modes pris en charge', () => {
    expect(resolveDisplayStyle('block')).toEqual({ content: 'hidden', bar: 'block', showButton: true });
    expect(resolveDisplayStyle('banner')).toEqual({ content: 'hidden', bar: 'banner', showButton: true });
    expect(resolveDisplayStyle('dim')).toEqual({ content: 'dimmed', bar: 'banner', showButton: true });
    expect(resolveDisplayStyle('note')).toEqual({ content: 'visible', bar: 'banner', showButton: false });
  });

  it('retombe sur block pour une valeur inconnue et exclut remove', () => {
    expect(resolveDisplayStyle('nonexistent')).toEqual(DISPLAY_STYLES.block);
    expect(resolveDisplayStyle(undefined)).toEqual(DISPLAY_STYLES.block);
    expect(resolveDisplayStyle(null)).toEqual(DISPLAY_STYLES.block);
    expect(DISPLAY_STYLES.remove).toBeUndefined();
  });
});

describe('findHideButtonAnchor', () => {
  it('place le bouton dans l’en-tête par défaut', () => {
    const anchor = findHideButtonAnchor(makePlacementBlurb(), 'title');
    expect(anchor.mode).toBe('append');
    expect(anchor.el.className).toBe('header');
  });

  it('utilise les statistiques pour la position basse', () => {
    const anchor = findHideButtonAnchor(makePlacementBlurb(), 'bottom');
    expect(anchor.mode).toBe('after');
    expect(anchor.el.tagName).toBe('DL');
  });

  it('cherche dans le wrapper hideByTags', () => {
    const anchor = findHideButtonAnchor(makePlacementBlurb({ withCut: true }), 'bottom');
    expect(anchor.mode).toBe('after');
  });

  it('retombe sur l’en-tête si les statistiques manquent', () => {
    const anchor = findHideButtonAnchor(makePlacementBlurb({ withStats: false }), 'bottom');
    expect(anchor.mode).toBe('append');
  });

  it('retourne null sans ancre ou pour une entrée invalide', () => {
    expect(findHideButtonAnchor(document.createElement('li'), 'title')).toBeNull();
    expect(findHideButtonAnchor(null, 'title')).toBeNull();
    expect(findHideButtonAnchor(undefined, 'title')).toBeNull();
  });
});

describe('hasStandaloneNote', () => {
  it('reconnaît uniquement une note autonome non vide sur une œuvre visible', () => {
    expect(hasStandaloneNote({ isHidden: false, isStandaloneNote: true, reason: 'reread later' })).toBe(true);
    expect(hasStandaloneNote({ isHidden: true, isStandaloneNote: true, reason: 'note' })).toBe(false);
    expect(hasStandaloneNote({ isHidden: false, reason: 'old hide reason' })).toBe(false);
    expect(hasStandaloneNote({ isHidden: false, isStandaloneNote: true, reason: '' })).toBe(false);
    expect(hasStandaloneNote({ isHidden: false, isStandaloneNote: true, reason: '   ' })).toBe(false);
    expect(hasStandaloneNote({ isHidden: false, isStandaloneNote: true })).toBe(false);
    expect(hasStandaloneNote(null)).toBe(false);
    expect(hasStandaloneNote(undefined)).toBe(false);
  });
});
