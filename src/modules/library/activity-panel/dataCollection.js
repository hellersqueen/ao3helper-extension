/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper — Activity Panel › DataCollection sub-module
    Reads from localStorage and computes aggregated stats:
    totalWorks, totalWords, totalHours, totalKudos, totalBookmarks,
    topFandoms, topTags, topAuthors, averageWordsPerDay, favoriteRating.
    Also passes _readingHistory through for streak/achievement computation.

═══════════════════════════════════════════════════════════════════════════ */

export class DataCollection {
  /** @param {{ storage: { get(key:string):any } }} opts */
  constructor ({ storage }) {
    this.storage = storage;
  }

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
    const bookmarks      = storage?.get('bookmarkVault:data') || {};
    const sessions       = storage?.get('activityPanel:sessions') || [];

    // Build per-work word count from session history (take max per workId)
    const wordsByWork = {};
    sessions.forEach(s => {
      if (s.workId && s.words > 0) {
        wordsByWork[s.workId] = Math.max(wordsByWork[s.workId] || 0, s.words);
      }
    });

    const totalWorks     = readingHistory.length;
    const totalWords     = Object.values(wordsByWork).reduce((sum, w) => sum + w, 0);
    const totalHours     = Math.round((totalWords / 250) / 60);
    const totalKudos     = Object.keys(kudosHistory).length;
    const totalBookmarks = Object.keys(bookmarks).length;

    // Top Fandoms
    const fandomCounts = {};
    readingHistory.forEach(w => {
      const f = (Array.isArray(w.fandoms) ? w.fandoms[0] : w.fandom) || 'Unknown';
      fandomCounts[f] = (fandomCounts[f] || 0) + 1;
    });
    const topFandoms = Object.entries(fandomCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    // Top Tags
    const tagCounts = {};
    readingHistory.forEach(w => {
      (w.tags || []).forEach(tag => { tagCounts[tag] = (tagCounts[tag] || 0) + 1; });
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
      const daysSinceFirst = Math.max(1, Math.ceil((Date.now() - firstRead) / (1000 * 60 * 60 * 24)));
      averageWordsPerDay   = Math.round(totalWords / daysSinceFirst);
    }

    // Favorite rating
    const ratingCounts = {};
    readingHistory.forEach(w => {
      const r = w.rating || 'Not Rated';
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
}
