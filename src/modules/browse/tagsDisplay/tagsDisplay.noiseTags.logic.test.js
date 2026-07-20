// @ts-nocheck
import { beforeEach, describe, expect, it } from 'vitest';
import {
  AUTHOR_EXCEPTIONS_KEY, CUSTOM_NOISE_WORDS_KEY, NOISE_PATTERNS,
  REVEALED_CLASS, REVEAL_CHIP_CLASS, createRevealChip, extractBlurbAuthor,
  getAuthorExceptions, getCustomNoiseWords, isExceptedAuthor, isNoiseTag,
  mergeNoisePatterns, normalizeAuthorName, normalizeNoiseText, revealNoiseTag,
  saveAuthorExceptions, saveCustomNoiseWords,
} from './_tagsDisplay.js';

beforeEach(() => localStorage.clear());

describe('noise matching', () => {
  it('normalise le texte avant comparaison', () => {
    expect(normalizeNoiseText('  Pls Be Nice!!  ')).toBe('pls be nice');
    expect(normalizeNoiseText('a   lot   of   space')).toBe('a lot of space');
    expect(normalizeNoiseText(null)).toBe('');
  });

  it('reconnaît les motifs intégrés et personnalisés', () => {
    expect(isNoiseTag('IDK WHAT IM DOING...')).toBe(true);
    expect(isNoiseTag('this is my first fic pls be nice!')).toBe(true);
    expect(isNoiseTag('custom noise phrase', ['custom noise'])).toBe(true);
    expect(isNoiseTag('Enemies to Lovers')).toBe(false);
    expect(isNoiseTag('ab')).toBe(false);
    expect(NOISE_PATTERNS.every(pattern => typeof pattern === 'string')).toBe(true);
  });
});

describe('custom noise words', () => {
  it('fusionne, normalise et déduplique les listes', () => {
    expect(mergeNoisePatterns(['idk'], ['IDK', ' My Phrase ', '', null])).toEqual(['idk', 'my phrase']);
    expect(mergeNoisePatterns(null, undefined)).toEqual([]);
  });

  it('sauvegarde puis relit une liste nettoyée', () => {
    expect(saveCustomNoiseWords([' Foo ', 'foo', 'Bar'])).toEqual(['foo', 'bar']);
    expect(getCustomNoiseWords()).toEqual(['foo', 'bar']);
  });

  it('tolère le stockage corrompu et filtre les valeurs non textuelles', () => {
    localStorage.setItem(CUSTOM_NOISE_WORDS_KEY, '{not json');
    expect(getCustomNoiseWords()).toEqual([]);
    localStorage.setItem(CUSTOM_NOISE_WORDS_KEY, JSON.stringify(['ok', 42, null, 'also ok']));
    expect(getCustomNoiseWords()).toEqual(['ok', 'also ok']);
  });
});

describe('noise tag reveal', () => {
  it('crée un bouton accessible', () => {
    const chip = createRevealChip(document);
    expect(chip.tagName).toBe('BUTTON');
    expect(chip.type).toBe('button');
    expect(chip.className).toBe(REVEAL_CHIP_CLASS);
    expect(chip.textContent).toBe('show hidden tag');
    expect(chip.getAttribute('aria-label')).toBe('Show this tag hidden by the noise filter');
  });

  it('accepte les options du bouton et révèle un élément valide', () => {
    const chip = createRevealChip(document, { className: 'custom', label: 'reveal', preview: 'idk' });
    expect([chip.className, chip.textContent, chip.title]).toEqual(['custom', 'reveal', 'idk']);
    const li = document.createElement('li');
    expect(revealNoiseTag(li)).toBe(true);
    expect(li.classList.contains(REVEALED_CLASS)).toBe(true);
    expect(revealNoiseTag(null)).toBe(false);
  });
});

describe('author exceptions', () => {
  it('normalise, déduplique, sauvegarde puis relit', () => {
    expect(normalizeAuthorName('  PetalsOnParchment  ')).toBe('petalsonparchment');
    expect(saveAuthorExceptions([' Foo ', 'foo', 'Bar'])).toEqual(['foo', 'bar']);
    expect(getAuthorExceptions()).toEqual(['foo', 'bar']);
    expect(isExceptedAuthor('FOO', ['foo', 'bar'])).toBe(true);
    expect(isExceptedAuthor('', ['foo'])).toBe(false);
  });

  it('tolère un stockage corrompu', () => {
    localStorage.setItem(AUTHOR_EXCEPTIONS_KEY, 'not json{');
    expect(getAuthorExceptions()).toEqual([]);
  });

  it('extrait l’auteur d’un blurb', () => {
    const blurb = document.createElement('li');
    blurb.innerHTML = '<a href="/works/1">Title</a> by <a rel="author" href="/users/foo">foo</a>';
    expect(extractBlurbAuthor(blurb)).toBe('foo');
    blurb.innerHTML = '<a href="/works/1">Title</a> by Anonymous';
    expect(extractBlurbAuthor(blurb)).toBe('');
    expect(extractBlurbAuthor(null)).toBe('');
  });
});
