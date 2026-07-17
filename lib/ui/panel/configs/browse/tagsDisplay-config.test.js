// @ts-nocheck
import { describe, it, expect, beforeEach } from 'vitest';
import { config, moduleId } from './tagsDisplay-config.js';

const NOISE_WORDS_KEY = 'ao3h:tagsDisplay:customNoiseWords';
const AUTHORS_KEY      = 'ao3h:tagsDisplay:noiseAuthorExceptions';

function mount() {
  const el = document.createElement('div');
  el.innerHTML = config;
  document.body.appendChild(el);
  return el;
}

function openPanel(configArea) {
  document.dispatchEvent(new CustomEvent('ao3h:configOpen', { detail: { moduleId: 'tagsDisplay', configArea } }));
}

function addWordTo(container, word) {
  container.querySelector('.ao3h-tagsDisplay-wordlist-input').value = word;
  container.querySelector('.ao3h-tagsDisplay-wordlist-add').click();
}

describe('tagsDisplay-config', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    localStorage.clear();
  });

  it('moduleId est "tagsDisplay"', () => {
    expect(moduleId).toBe('tagsDisplay');
  });

  it('contient le réglage noiseTagStyle avec "hide" coché par défaut', () => {
    const el = mount();
    const hide = el.querySelector('[data-setting="noiseTagStyle"][value="hide"]');
    expect(hide).not.toBeNull();
    expect(hide.checked).toBe(true);
  });

  it('contient les conteneurs des mots "bruit" et des exceptions d\'auteur', () => {
    const el = mount();
    expect(el.querySelector('#ao3h-tagsDisplay-noisewords-container')).not.toBeNull();
    expect(el.querySelector('#ao3h-tagsDisplay-noiseauthors-container')).not.toBeNull();
  });

  it('contient les boutons import/export des mots "bruit"', () => {
    const el = mount();
    expect(el.querySelector('[data-action="export-noisewords"]')).not.toBeNull();
    expect(el.querySelector('[data-action="import-noisewords"]')).not.toBeNull();
  });

  describe('mots "bruit" personnalisés', () => {
    it('affiche le message vide quand rien n\'existe', () => {
      const el = mount();
      openPanel(el);
      const chips = el.querySelector('#ao3h-tagsDisplay-noisewords-container .ao3h-chip-container');
      expect(chips.children.length).toBe(0);
    });

    it('ajouter un mot l\'affiche en chip et le persiste (trim + minuscule)', () => {
      const el = mount();
      openPanel(el);
      const container = el.querySelector('#ao3h-tagsDisplay-noisewords-container');
      addWordTo(container, '  My Custom Phrase  ');

      const chips = container.querySelectorAll('.ao3h-chip-container .ao3h-chip');
      expect(chips.length).toBe(1);
      expect(chips[0].textContent).toContain('my custom phrase');
      expect(JSON.parse(localStorage.getItem(NOISE_WORDS_KEY))).toEqual(['my custom phrase']);
    });

    it('ne duplique pas un mot déjà présent (insensible à la casse)', () => {
      const el = mount();
      localStorage.setItem(NOISE_WORDS_KEY, JSON.stringify(['idk']));
      openPanel(el);
      addWordTo(el.querySelector('#ao3h-tagsDisplay-noisewords-container'), 'IDK');
      expect(JSON.parse(localStorage.getItem(NOISE_WORDS_KEY))).toEqual(['idk']);
    });

    it('cliquer sur × retire le mot de la liste et du storage', () => {
      const el = mount();
      localStorage.setItem(NOISE_WORDS_KEY, JSON.stringify(['idk', 'pls be nice']));
      openPanel(el);
      const container = el.querySelector('#ao3h-tagsDisplay-noisewords-container');
      container.querySelector('button[data-word="idk"]').click();
      expect(JSON.parse(localStorage.getItem(NOISE_WORDS_KEY))).toEqual(['pls be nice']);
      expect(container.querySelector('button[data-word="idk"]')).toBeNull();
    });

    it('n\'affecte pas la liste des exceptions d\'auteur (conteneurs indépendants)', () => {
      const el = mount();
      openPanel(el);
      addWordTo(el.querySelector('#ao3h-tagsDisplay-noisewords-container'), 'idk');
      expect(localStorage.getItem(AUTHORS_KEY)).toBeNull();
    });
  });

  describe('exceptions d\'auteur', () => {
    it('affiche le message vide quand rien n\'existe', () => {
      const el = mount();
      openPanel(el);
      const chips = el.querySelector('#ao3h-tagsDisplay-noiseauthors-container .ao3h-chip-container');
      expect(chips.children.length).toBe(0);
    });

    it('ajouter un auteur l\'affiche en chip et le persiste', () => {
      const el = mount();
      openPanel(el);
      addWordTo(el.querySelector('#ao3h-tagsDisplay-noiseauthors-container'), 'PetalsOnParchment');
      expect(JSON.parse(localStorage.getItem(AUTHORS_KEY))).toEqual(['petalsonparchment']);
    });

    it('retirer un auteur met à jour le storage', () => {
      const el = mount();
      localStorage.setItem(AUTHORS_KEY, JSON.stringify(['foo', 'bar']));
      openPanel(el);
      const container = el.querySelector('#ao3h-tagsDisplay-noiseauthors-container');
      container.querySelector('button[data-word="foo"]').click();
      expect(JSON.parse(localStorage.getItem(AUTHORS_KEY))).toEqual(['bar']);
    });
  });
});
