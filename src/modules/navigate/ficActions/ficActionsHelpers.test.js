import { describe, it, expect } from 'vitest';
import { getActionIcon, resolveBottomSubscribeContainer, ACTION_ICONS } from './ficActionsHelpers.js';

describe('getActionIcon', () => {
  it('retourne l’icône connue de chaque bouton réordonnable', () => {
    for (const key of Object.keys(ACTION_ICONS)) {
      expect(getActionIcon(key)).toBe(ACTION_ICONS[key]);
    }
  });

  it('retourne un repère neutre pour une clé inconnue', () => {
    expect(getActionIcon('unknown')).toBe('•');
    expect(getActionIcon(undefined)).toBe('•');
  });
});

describe('resolveBottomSubscribeContainer', () => {
  it('retourne null quand la position n’est pas "pageEnd"', () => {
    document.body.innerHTML = '<div id="main"></div>';
    expect(resolveBottomSubscribeContainer(document, 'nearKudos')).toBeNull();
    expect(resolveBottomSubscribeContainer(document, undefined)).toBeNull();
  });

  it('retourne #main quand la position est "pageEnd"', () => {
    document.body.innerHTML = '<div id="main"><p>work</p></div>';
    const container = resolveBottomSubscribeContainer(document, 'pageEnd');
    expect(container).toBe(document.querySelector('#main'));
  });

  it('retourne null si #main est absent même en position "pageEnd"', () => {
    document.body.innerHTML = '<div id="other"></div>';
    expect(resolveBottomSubscribeContainer(document, 'pageEnd')).toBeNull();
  });
});
