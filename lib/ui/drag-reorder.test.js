import { describe, it, expect } from 'vitest';
import { makeListReorderable, applySavedOrder } from './drag-reorder.js';

function buildList(classNames) {
  document.body.innerHTML = `<ul>${classNames.map((c, i) => `<li class="${c}">item ${i}</li>`).join('')}</ul>`;
  return document.querySelector('ul');
}

describe('makeListReorderable — filter (ex: ficActions ne rend draggable que les boutons ciblés)', () => {
  it('ne rend draggable que les items qui passent le filtre', () => {
    const ul = buildList(['bookmark', 'kudos', 'mark', 'hit-count', 'subscribe']);
    const getItemKey = (li) => (['bookmark', 'mark', 'subscribe'].includes(li.className) ? li.className : null);
    makeListReorderable(ul, { getItemKey, filter: (li) => !!getItemKey(li) });

    const items = Array.from(ul.querySelectorAll('li'));
    const draggable = items.filter((li) => li.getAttribute('draggable') === 'true').map((li) => li.className);
    expect(draggable.sort()).toEqual(['bookmark', 'mark', 'subscribe']);

    // Les items non ciblés ne reçoivent ni attribut draggable ni poignée
    const untouched = items.filter((li) => ['kudos', 'hit-count'].includes(li.className));
    untouched.forEach((li) => {
      expect(li.hasAttribute('draggable')).toBe(false);
      expect(li.querySelector('.ao3h-drag-handle')).toBeNull();
    });
  });

  it('ajoute une poignée de drag uniquement aux items filtrés', () => {
    const ul = buildList(['bookmark', 'kudos', 'mark']);
    const getItemKey = (li) => (li.className === 'kudos' ? null : li.className);
    makeListReorderable(ul, { getItemKey, filter: (li) => !!getItemKey(li) });

    expect(ul.querySelectorAll('.ao3h-drag-handle').length).toBe(2);
  });

  it('ne fait rien si moins de 2 items passent le filtre (rien à réordonner)', () => {
    const ul = buildList(['bookmark', 'kudos', 'kudos']);
    const getItemKey = (li) => (li.className === 'bookmark' ? 'bookmark' : null);
    const cleanup = makeListReorderable(ul, { getItemKey, filter: (li) => !!getItemKey(li) });
    expect(ul.querySelector('[draggable="true"]')).toBeNull();
    expect(typeof cleanup).toBe('function');
  });

  it('sans filtre, tous les items (avec getItemKey truthy) sont draggables', () => {
    const ul = buildList(['a', 'b', 'c']);
    makeListReorderable(ul, { getItemKey: (li) => li.className });
    expect(ul.querySelectorAll('[draggable="true"]').length).toBe(3);
  });

  it('cleanup() retire attributs, poignées et classes', () => {
    const ul = buildList(['a', 'b']);
    const cleanup = makeListReorderable(ul, { getItemKey: (li) => li.className });
    cleanup();
    expect(ul.querySelectorAll('[draggable]').length).toBe(0);
    expect(ul.querySelectorAll('.ao3h-drag-handle').length).toBe(0);
  });
});

describe('applySavedOrder', () => {
  it('réordonne selon les clés sauvegardées', () => {
    const ul = buildList(['a', 'b', 'c']);
    applySavedOrder(ul, ['c', 'a', 'b'], (li) => li.className);
    const order = Array.from(ul.querySelectorAll('li')).map((li) => li.className);
    expect(order).toEqual(['c', 'a', 'b']);
  });

  it('pousse à la fin les items absents de savedOrder, dans leur ordre courant', () => {
    const ul = buildList(['a', 'b', 'c']);
    applySavedOrder(ul, ['b'], (li) => li.className);
    const order = Array.from(ul.querySelectorAll('li')).map((li) => li.className);
    expect(order).toEqual(['b', 'a', 'c']);
  });

  it('ne fait rien sans ordre sauvegardé', () => {
    const ul = buildList(['a', 'b']);
    applySavedOrder(ul, null, (li) => li.className);
    expect(Array.from(ul.querySelectorAll('li')).map((li) => li.className)).toEqual(['a', 'b']);
  });
});

describe('resetToOriginal() — bouton "Reset order"', () => {
  it('remet la liste dans l\'ordre constaté au moment de makeListReorderable', () => {
    const ul = buildList(['a', 'b', 'c']);
    const getItemKey = (li) => li.className;
    const cleanup = makeListReorderable(ul, { getItemKey });

    // Simule un réordonnancement manuel (ex: après un drag)
    applySavedOrder(ul, ['c', 'b', 'a'], getItemKey);
    expect(Array.from(ul.querySelectorAll('li')).map((li) => li.className)).toEqual(['c', 'b', 'a']);

    cleanup.resetToOriginal();
    expect(Array.from(ul.querySelectorAll('li')).map((li) => li.className)).toEqual(['a', 'b', 'c']);
  });

  it('notifie onOrderChanged après un reset', () => {
    const ul = buildList(['a', 'b']);
    const getItemKey = (li) => li.className;
    let lastOrder = null;
    const cleanup = makeListReorderable(ul, { getItemKey, onOrderChanged: (o) => { lastOrder = o; } });
    applySavedOrder(ul, ['b', 'a'], getItemKey);
    cleanup.resetToOriginal();
    expect(lastOrder).toEqual(['a', 'b']);
  });
});
