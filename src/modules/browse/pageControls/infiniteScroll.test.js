import { describe, it, expect } from 'vitest';
import { extractBlurbs } from './infiniteScroll.js';

function docFrom(html) {
  return new DOMParser().parseFromString(html, 'text/html');
}

describe('extractBlurbs', () => {
  it('extrait les blurbs d\'une liste d\'œuvres', () => {
    const doc = docFrom(`
      <ol class="work index group">
        <li class="blurb work-1" id="work_1">Fic 1</li>
        <li class="blurb work-2" id="work_2">Fic 2</li>
      </ol>`);
    const blurbs = extractBlurbs(doc);
    expect(blurbs.length).toBe(2);
    expect(blurbs[0].id).toBe('work_1');
  });

  it('extrait les blurbs d\'une liste de bookmarks', () => {
    const doc = docFrom(`
      <ul class="bookmark index group">
        <li class="blurb" id="bookmark_9">B</li>
      </ul>`);
    expect(extractBlurbs(doc).length).toBe(1);
  });

  it('ignore les éléments qui ne sont pas des blurbs directs', () => {
    const doc = docFrom(`
      <ol class="work index group">
        <li class="blurb" id="work_1"><ul><li class="blurb" id="nested">x</li></ul></li>
        <li class="pagination-item">pas un blurb</li>
      </ol>`);
    const blurbs = extractBlurbs(doc);
    expect(blurbs.length).toBe(1);
    expect(blurbs[0].id).toBe('work_1');
  });

  it('retourne [] quand la page n\'a pas de liste', () => {
    expect(extractBlurbs(docFrom('<div>rien</div>'))).toEqual([]);
  });
});
