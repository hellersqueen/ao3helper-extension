import { describe, it, expect, beforeEach } from 'vitest';
import { DataCollection } from './dataCollection.js';
import { KEY_BOOKMARK_VAULT_DATA } from '../../../../lib/storage/keys.js';

function fakeStorage(data = {}) {
  return { get: (key) => data[key] };
}

beforeEach(() => localStorage.clear());

describe('DataCollection.aggregate — totalBookmarks lu via lib/storage/keys.js', () => {
  it('compte les bookmarks depuis KEY_BOOKMARK_VAULT_DATA (localStorage), pas depuis storage.get', () => {
    localStorage.setItem(KEY_BOOKMARK_VAULT_DATA, JSON.stringify({ '1': {}, '2': {}, '3': {} }));
    // storage.get('bookmarkVault:data') volontairement absent/différent — ne
    // doit plus influencer le résultat, la lecture passe par keys.js.
    const dc = new DataCollection({ storage: fakeStorage({ 'rt:history': [] }) });
    expect(dc.aggregate().totalBookmarks).toBe(3);
  });

  it('retourne 0 sans données de bookmarks', () => {
    const dc = new DataCollection({ storage: fakeStorage({}) });
    expect(dc.aggregate().totalBookmarks).toBe(0);
  });

  it('agrège toujours correctement le reste (fandoms, mots, kudos) via storage.get', () => {
    const storage = fakeStorage({
      'rt:history': [{ id: 'w1', fandoms: ['Harry Potter'], tags: ['Angst'], author: 'alice', rating: 'T', seenAt: Date.now() }],
      'ficAppreciation:kudosed': { w1: { date: '2026-01-01' } },
      'activityPanel:sessions': [{ workId: 'w1', words: 5000 }],
    });
    const dc = new DataCollection({ storage });
    const result = dc.aggregate();
    expect(result.totalWorks).toBe(1);
    expect(result.totalKudos).toBe(1);
    expect(result.totalWords).toBe(5000);
    expect(result.topFandoms[0]).toEqual({ name: 'Harry Potter', count: 1 });
  });

  it('récupère fandoms/tags/rating depuis les sessions quand readingTracker ne les fournit pas (cas réel)', () => {
    // readingTracker's own history entries never carry fandoms/tags/rating —
    // this reproduces the real-world shape (seenTracking.js's recordVisit),
    // where only `id`/`title`/`author`/dates are ever populated.
    const storage = fakeStorage({
      'rt:history': [{ id: 'w1', title: 'A Fic', author: 'alice', seenAt: Date.now() }],
      'activityPanel:sessions': [{ workId: 'w1', words: 5000, fandoms: ['Star Wars'], tags: ['Fluff'], rating: 'General Audiences' }],
    });
    const dc = new DataCollection({ storage });
    const result = dc.aggregate();
    expect(result.topFandoms[0]).toEqual({ name: 'Star Wars', count: 1 });
    expect(result.topTags[0]).toEqual({ name: 'Fluff', count: 1 });
    expect(result.favoriteRating).toBe('General Audiences');
  });
});
