import { describe, it, expect, beforeEach } from 'vitest';
import { blurbOwner } from './blockedBookmarks.js';

beforeEach(() => { document.body.innerHTML = ''; });

function blurbFor(username) {
  const li = document.createElement('li');
  li.className = 'bookmark blurb';
  li.innerHTML = `
    <div class="user module group">
      <h5 class="byline"><a href="/users/${username}/pseuds/${username}">${username}</a></h5>
    </div>`;
  document.body.appendChild(li);
  return li;
}

describe('blurbOwner', () => {
  it('extrait le nom du bookmarkeur en minuscules', () => {
    expect(blurbOwner(blurbFor('SomeUser'))).toBe('someuser');
  });

  it('décode les noms encodés dans l\'URL', () => {
    const li = document.createElement('li');
    li.innerHTML = `<h5 class="byline"><a href="/users/caf%C3%A9/pseuds/x">café</a></h5>`;
    expect(blurbOwner(li)).toBe('café');
  });

  it('retourne null sans lien utilisateur', () => {
    const li = document.createElement('li');
    li.innerHTML = '<div class="user module group"></div>';
    expect(blurbOwner(li)).toBeNull();
  });
});
