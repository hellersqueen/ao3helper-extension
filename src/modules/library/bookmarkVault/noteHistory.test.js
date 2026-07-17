import { describe, it, expect, beforeEach } from 'vitest';
import { NOTE_HISTORY_KEY, MAX_VERSIONS, pushNoteVersion, getNoteVersions } from './richTextNotes.js';

beforeEach(() => { localStorage.clear(); });

describe('pushNoteVersion / getNoteVersions', () => {
  it('empile les versions, la plus récente en premier', () => {
    pushNoteVersion('1', 'première', localStorage, 100);
    pushNoteVersion('1', 'deuxième', localStorage, 200);
    const versions = getNoteVersions('1');
    expect(versions.map(v => v.text)).toEqual(['deuxième', 'première']);
    expect(versions[0].at).toBe(200);
  });

  it('ignore les valeurs vides et les doublons immédiats', () => {
    pushNoteVersion('1', '');
    pushNoteVersion('1', '   ');
    expect(getNoteVersions('1')).toEqual([]);
    pushNoteVersion('1', 'même', localStorage, 1);
    pushNoteVersion('1', 'même', localStorage, 2);
    expect(getNoteVersions('1').length).toBe(1);
  });

  it('plafonne à MAX_VERSIONS', () => {
    for (let i = 0; i < MAX_VERSIONS + 3; i++) pushNoteVersion('1', `v${i}`, localStorage, i);
    const versions = getNoteVersions('1');
    expect(versions.length).toBe(MAX_VERSIONS);
    expect(versions[0].text).toBe(`v${MAX_VERSIONS + 2}`);
  });

  it('résiste à un stockage corrompu', () => {
    localStorage.setItem(NOTE_HISTORY_KEY, '{oops');
    expect(getNoteVersions('1')).toEqual([]);
    pushNoteVersion('1', 'ok');
    expect(getNoteVersions('1').length).toBe(1);
  });
});
