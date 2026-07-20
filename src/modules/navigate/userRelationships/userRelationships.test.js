import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EV_WORK_FINISHED } from '../../../../lib/utils/event-names.js';

function buildListing () {
  document.body.innerHTML = `
    <ol class="work index group">
      <li id="work_1" class="work blurb group">
        <h4 class="heading">
          <a href="/works/1">Title A</a>
          <span class="authors"><a rel="author" href="/users/JaneDoe/pseuds/PenOne">PenOne</a></span>
        </h4>
      </li>
      <li id="work_2" class="work blurb group">
        <h4 class="heading">
          <a href="/works/2">Title B</a>
          <span class="authors"><a rel="author" href="/users/JaneDoe/pseuds/PenTwo">PenTwo</a></span>
        </h4>
      </li>
      <li id="work_3" class="work blurb group">
        <h4 class="heading">
          <a href="/works/3">Title C</a>
          <span class="authors"><a rel="author" href="/users/OtherAuthor">OtherAuthor</a></span>
        </h4>
      </li>
    </ol>
  `;
}

describe('userRelationships — blocage par pseudonyme (intégration)', () => {
  beforeEach(() => {
    localStorage.clear();
    buildListing();
  });

  it('bloquer un pseudonyme précis ne masque que les œuvres de ce pseudo', async () => {
    localStorage.setItem('userBlocker:list', JSON.stringify(['janedoe/penone']));

    const { setEnabled } = await import('../../../core/lifecycle.js');
    await import('./_userRelationships.js');
    await setEnabled('userRelationships', true);
    await setEnabled('authorBlocking', true);

    expect(document.getElementById('work_1').style.display).toBe('none'); // PenOne — blocked
    expect(document.getElementById('work_2').style.display).not.toBe('none'); // PenTwo — not blocked
    expect(document.getElementById('work_3').style.display).not.toBe('none'); // OtherAuthor — not blocked

    await setEnabled('authorBlocking', false);
    await setEnabled('userRelationships', false);
  });

  it('bloquer le compte entier masque tous les pseudonymes de ce compte', async () => {
    localStorage.setItem('userBlocker:list', JSON.stringify(['janedoe']));

    const { setEnabled } = await import('../../../core/lifecycle.js');
    await import('./_userRelationships.js');
    await setEnabled('userRelationships', true);
    await setEnabled('authorBlocking', true);

    expect(document.getElementById('work_1').style.display).toBe('none');
    expect(document.getElementById('work_2').style.display).toBe('none');
    expect(document.getElementById('work_3').style.display).not.toBe('none');

    await setEnabled('authorBlocking', false);
    await setEnabled('userRelationships', false);
  });

  it('compte les œuvres masquées dans les statistiques de blocage', async () => {
    localStorage.setItem('userBlocker:list', JSON.stringify(['janedoe']));

    const { setEnabled } = await import('../../../core/lifecycle.js');
    await import('./_userRelationships.js');
    const { getHiddenStats } = await import('./_userRelationships.js');
    await setEnabled('userRelationships', true);
    await setEnabled('authorBlocking', true);

    expect(getHiddenStats().works).toBe(2);

    await setEnabled('authorBlocking', false);
    await setEnabled('userRelationships', false);
  });
});

describe('userRelationships — suivre un auteur et écrire une note (intégration)', () => {
  beforeEach(() => {
    localStorage.clear();
    buildListing();
  });

  it('cliquer sur le bouton Follow suit réellement l’auteur (et le retire au second clic)', async () => {
    const { setEnabled } = await import('../../../core/lifecycle.js');
    await import('./_userRelationships.js');
    await setEnabled('userRelationships', true);
    await setEnabled('authorTracking', true);

    const followBtn = document.querySelector('#work_1 .ao3h-tracking-star');
    expect(followBtn.textContent).toBe('☆');

    followBtn.click();
    expect(followBtn.textContent).toBe('★');
    expect(JSON.parse(localStorage.getItem('authorTracking:followed'))).toContain('penone');

    followBtn.click();
    expect(followBtn.textContent).toBe('☆');
    expect(JSON.parse(localStorage.getItem('authorTracking:followed'))).not.toContain('penone');

    await setEnabled('authorTracking', false);
    await setEnabled('userRelationships', false);
  });

  it('écrire une note via le bouton 📝 la sauvegarde réellement', async () => {
    vi.stubGlobal('prompt', vi.fn(() => 'Ma note personnelle'));

    const { setEnabled } = await import('../../../core/lifecycle.js');
    await import('./_userRelationships.js');
    await setEnabled('userRelationships', true);
    await setEnabled('authorTracking', true);

    const noteBtn = document.querySelector('#work_1 .ao3h-tracking-note-icon');
    expect(noteBtn.textContent).toBe('📝?');

    noteBtn.click();
    expect(noteBtn.textContent).toBe('📝');
    expect(JSON.parse(localStorage.getItem('authorTracking:notes'))).toEqual({ penone: 'Ma note personnelle' });

    await setEnabled('authorTracking', false);
    await setEnabled('userRelationships', false);
    vi.unstubAllGlobals();
  });
});

describe('userRelationships — le compteur "lu" augmente quand une œuvre est marquée terminée (intégration)', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = `
      <h3 class="byline heading"><a rel="author" href="/users/JaneDoe/pseuds/PenOne">PenOne</a></h3>
    `;
  });

  it('dispatcher ao3h:workFinished incrémente readCount pour l’auteur affiché sur la page', async () => {
    const { setEnabled } = await import('../../../core/lifecycle.js');
    await import('./_userRelationships.js');
    await setEnabled('userRelationships', true);
    await setEnabled('authorPreference', true);

    window.dispatchEvent(new CustomEvent(EV_WORK_FINISHED, { detail: { workId: '123' } }));
    expect(JSON.parse(localStorage.getItem('authorPreferences:data')).PenOne.readCount).toBe(1);

    window.dispatchEvent(new CustomEvent(EV_WORK_FINISHED, { detail: { workId: '456' } }));
    expect(JSON.parse(localStorage.getItem('authorPreferences:data')).PenOne.readCount).toBe(2);

    await setEnabled('authorPreference', false);
    await setEnabled('userRelationships', false);
  });
});
