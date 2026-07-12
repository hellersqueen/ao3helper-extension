/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper — Activity Panel › ReadingStats sub-module
    Pure computation helpers (no storage access):
      - calculateStreak(history)      → number
      - calculateAchievements(stats)  → achievement[]

═══════════════════════════════════════════════════════════════════════════ */

export class ReadingStats {
  /**
   * Counts consecutive days ending today where at least 1 work was read.
   * @param {Array} history — array of { timestamp?, readDate? } objects
   * @returns {number}
   */
  calculateStreak (history) {
    if (!history || history.length === 0) return 0;

    const dates = history
      .map(w => new Date(w.seenAt || w.timestamp || w.readDate).toDateString())
      .filter((d, i, self) => self.indexOf(d) === i);

    dates.sort((a, b) => new Date(b) - new Date(a));

    let streak      = 0;
    let currentDate = new Date();

    for (const dateStr of dates) {
      if (dateStr === currentDate.toDateString()) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }

  /**
   * Returns unlocked achievement badges based on the aggregated stats object.
   * @param {{ totalWorks, totalWords, totalKudos, totalBookmarks,
   *            readingStreak, topFandoms }} stats
   * @returns {Array<{ name, icon, desc }>}
   */
  calculateAchievements (stats) {
    const achievements = [];
    const { totalWorks = 0, totalWords = 0, totalKudos = 0,
            readingStreak = 0, topFandoms = [] } = stats;

    // Works milestones
    if (totalWorks >= 100)  achievements.push({ name: 'Centennial Reader', icon: '📚', desc: 'Read 100+ works' });
    if (totalWorks >= 500)  achievements.push({ name: 'Voracious Reader',  icon: '🔥', desc: 'Read 500+ works' });
    if (totalWorks >= 1000) achievements.push({ name: 'Legendary Reader',  icon: '👑', desc: 'Read 1,000+ works' });

    // Words milestones
    if (totalWords >= 1_000_000)  achievements.push({ name: 'Million Words', icon: '📖', desc: 'Read 1M+ words' });
    if (totalWords >= 10_000_000) achievements.push({ name: 'Epic Journey',  icon: '🌟', desc: 'Read 10M+ words' });

    // Kudos milestones
    if (totalKudos >= 100)  achievements.push({ name: 'Kudos Giver',   icon: '⭐', desc: 'Given 100+ kudos' });
    if (totalKudos >= 1000) achievements.push({ name: 'Star Spreader', icon: '✨', desc: 'Given 1,000+ kudos' });

    // Streak milestones
    if (readingStreak >= 7)   achievements.push({ name: 'Week Warrior',    icon: '🔥', desc: '7-day reading streak' });
    if (readingStreak >= 30)  achievements.push({ name: 'Monthly Marathon', icon: '🏆', desc: '30-day reading streak' });
    if (readingStreak >= 100) achievements.push({ name: 'Century Streak',   icon: '💯', desc: '100-day reading streak' });

    // Fandom exploration
    if (topFandoms.length >= 10) achievements.push({ name: 'Multifandom Explorer', icon: '🗺️', desc: 'Read 10+ fandoms' });
    if (topFandoms.length >= 50) achievements.push({ name: 'Fandom Nomad',         icon: '🌍', desc: 'Read 50+ fandoms' });

    return achievements;
  }
}
