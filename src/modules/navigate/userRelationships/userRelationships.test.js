import { describe, it, expect, beforeEach } from 'vitest';

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
    const { getHiddenStats } = await import('./blockingStats.js');
    await setEnabled('userRelationships', true);
    await setEnabled('authorBlocking', true);

    expect(getHiddenStats().works).toBe(2);

    await setEnabled('authorBlocking', false);
    await setEnabled('userRelationships', false);
  });
});
