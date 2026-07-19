/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Activity Panel › Data Collection

Aggregates reading, session, kudos, and bookmark storage into the statistics
consumed by Activity Panel views.

Notes

- Session word counts retain the highest observed value per work.
- Reading history is passed through for streak and achievement calculations.
- Top fandom, tag, and author lists are ranked by occurrence count.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { getBookmarkVaultWorkIds } from '../../../../lib/storage/keys.js';


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

export class DataCollection {
  /** @param {{ storage: { get(key:string):any } }} opts */
  constructor ({ storage }) {
    this.storage = storage;
  }


  /* ═══════════════════════════════════════════════════════════════════════
     FEATURE — READING ACTIVITY AGGREGATION
  ═══════════════════════════════════════════════════════════════════════ */

  /**
   * Reads all relevant localStorage buckets and returns a plain stats object.
   * @returns {{ totalWorks, totalWords, totalHours, totalKudos, totalBookmarks,
   *             topFandoms, topTags, topAuthors, averageWordsPerDay, favoriteRating,
   *             _readingHistory }}
   */
  aggregate () {
    const storage = this.storage;

    const readingHistory = storage?.get('rt:history') || [];
    const kudosHistory   = storage?.get('ficAppreciation:kudosed') || {};
    const sessions       = storage?.get('activityPanel:sessions') || [];

    // Build per-work word count from session history (take max per workId)
    const wordsByWork = {};
    sessions.forEach(s => {
      if (s.workId && s.words > 0) {
        wordsByWork[s.workId] = Math.max(wordsByWork[s.workId] || 0, s.words);
      }
    });

    // readingTracker's own history entries never carry fandoms/tags/rating —
    // only sessionHistory (this module's own recorder) does. Build a per-work
    // lookup so the aggregation below still works from real-world data instead
    // of silently falling back to "Unknown"/"Not Rated" for everything.
    const sessionMetaByWork = {};
    sessions.forEach(s => {
      if (!s.workId) return;
      const meta = sessionMetaByWork[s.workId] || (sessionMetaByWork[s.workId] = {});
      if (!meta.fandoms && s.fandoms?.length) meta.fandoms = s.fandoms;
      if (!meta.tags && s.tags?.length) meta.tags = s.tags;
      if (!meta.rating && s.rating) meta.rating = s.rating;
    });

    const totalWorks     = readingHistory.length;
    const totalWords     = Object.values(wordsByWork).reduce((sum, w) => sum + w, 0);
    const totalHours     = Math.round((totalWords / 250) / 60);
    const totalKudos     = Object.keys(kudosHistory).length;
    const totalBookmarks = getBookmarkVaultWorkIds().size;

    // Top Fandoms
    const fandomCounts = {};
    readingHistory.forEach(w => {
      const sessFandoms = sessionMetaByWork[w.id]?.fandoms;
      const f = (Array.isArray(w.fandoms) ? w.fandoms[0] : w.fandom) || sessFandoms?.[0] || 'Unknown';
      fandomCounts[f] = (fandomCounts[f] || 0) + 1;
    });
    const topFandoms = Object.entries(fandomCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    // Top Tags
    const tagCounts = {};
    readingHistory.forEach(w => {
      const tags = (w.tags?.length ? w.tags : sessionMetaByWork[w.id]?.tags) || [];
      tags.forEach(tag => { tagCounts[tag] = (tagCounts[tag] || 0) + 1; });
    });
    const topTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([name, count]) => ({ name, count }));

    // Top Authors
    const authorCounts = {};
    readingHistory.forEach(w => {
      const a = w.author || 'Anonymous';
      authorCounts[a] = (authorCounts[a] || 0) + 1;
    });
    const topAuthors = Object.entries(authorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    // Average words per day
    let averageWordsPerDay = 0;
    if (readingHistory.length > 0) {
      const firstRead      = new Date(Math.min(...readingHistory.map(w => w.seenAt || w.timestamp || Date.now())));
      const daysSinceFirst = Math.max(1, Math.ceil((Date.now() - firstRead.getTime()) / (1000 * 60 * 60 * 24)));
      averageWordsPerDay   = Math.round(totalWords / daysSinceFirst);
    }

    // Favorite rating
    const ratingCounts = {};
    readingHistory.forEach(w => {
      const r = w.rating || sessionMetaByWork[w.id]?.rating || 'Not Rated';
      ratingCounts[r] = (ratingCounts[r] || 0) + 1;
    });
    const topRating     = Object.entries(ratingCounts).sort((a, b) => b[1] - a[1])[0];
    const favoriteRating = topRating ? topRating[0] : 'Not Rated';

    return {
      totalWorks, totalWords, totalHours, totalKudos, totalBookmarks,
      topFandoms, topTags, topAuthors, averageWordsPerDay, favoriteRating,
      _readingHistory: readingHistory,
    };
  }


  /* ═══════════════════════════════════════════════════════════════════════
     FEATURE LIFECYCLE
  ═══════════════════════════════════════════════════════════════════════ */

  // Aggregation is stateless; instances require no explicit cleanup.
}
