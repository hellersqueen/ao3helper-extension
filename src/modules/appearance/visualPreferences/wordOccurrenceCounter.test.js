import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { WordOccurrenceCounter } from './wordOccurrenceCounter.js';
import { countOccurrences } from './_visualPreferences.js';

function setWorkPage () {
  Object.defineProperty(window, 'location', {
    value: new URL('https://archiveofourown.org/works/12345'),
    writable: true,
  });
}

beforeEach(() => {
  localStorage.clear();
  document.body.innerHTML = `
    <div id="main">
      <div id="workskin"><div class="userstuff module"><p>Harry saw Harry again.</p></div></div>
      <dl class="stats"></dl>
    </div>`;
  setWorkPage();
});
afterEach(() => { document.body.innerHTML = ''; });

describe('WordOccurrenceCounter', () => {
  it('n\'affiche rien quand désactivé', () => {
    new WordOccurrenceCounter({ countOccurrences }).apply(false);
    expect(document.querySelector('.ao3h-word-occurrence')).toBeNull();
  });

  it('n\'affiche rien hors page de fic', () => {
    Object.defineProperty(window, 'location', {
      value: new URL('https://archiveofourown.org/works'),
      writable: true,
    });
    new WordOccurrenceCounter({ countOccurrences }).apply(true);
    expect(document.querySelector('.ao3h-word-occurrence')).toBeNull();
  });

  it('affiche le widget après dl.stats sur une page de fic', () => {
    new WordOccurrenceCounter({ countOccurrences }).apply(true);
    const widget = document.querySelector('.ao3h-word-occurrence');
    expect(widget).not.toBeNull();
    expect(document.querySelector('dl.stats').nextElementSibling).toBe(widget);
  });

  it('compte les occurrences en tapant dans le champ', () => {
    const woc = new WordOccurrenceCounter({ countOccurrences });
    woc.apply(true);
    const input = document.querySelector('.ao3h-word-occurrence input');
    input.value = 'Harry';
    input.dispatchEvent(new Event('input'));
    expect(document.querySelector('.ao3h-word-occurrence-result').textContent).toBe('2 occurrences');
  });

  it('reset retire le widget', () => {
    const woc = new WordOccurrenceCounter({ countOccurrences });
    woc.apply(true);
    woc.reset();
    expect(document.querySelector('.ao3h-word-occurrence')).toBeNull();
  });
});
