/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Visibility Presets Submodule
    Submodule ID: visibilityPresets
    Display Name: Visibility Presets
    Parent Module: visualPreferences

    Manages the 5 quick-apply presets:
        - showAll         : Show all metadata (default)
        - hideAllStats    : Hide all statistics and metrics
        - hideAllDates    : Hide all dates and timestamps
        - biasFree        : Hide all influence factors
        - cleanReader     : Minimal header + hidden chapter stats

═══════════════════════════════════════════════════════════════════════════ */

export class VisibilityPresets {
  constructor() {
    this.presets = this.definePresets();
  }

  definePresets() {
    return {
      showAll: {
        name: 'Show All',
        description: 'Show all metadata (default)',
        icon: '👁️',
        state: {
          hideWordCount: false,
          hideKudosCount: false,
          hideCommentsCount: false,
          hideBookmarksCount: false,
          hideHits: false,
          hidePublishedDate: false,
          hideUpdatedDate: false,
          hideCompletedDate: false,
          hideChapterDates: false,
          minimalHeader: false,
          hideStatsOnChaptersList: false
        }
      },
      hideAllStats: {
        name: 'Hide All Stats',
        description: 'Hide all statistics and metrics',
        icon: '📊',
        state: {
          hideWordCount: true,
          hideKudosCount: true,
          hideCommentsCount: true,
          hideBookmarksCount: true,
          hideHits: true,
          hidePublishedDate: false,
          hideUpdatedDate: false,
          hideCompletedDate: false,
          hideChapterDates: false,
          minimalHeader: false,
          hideStatsOnChaptersList: true
        }
      },
      hideAllDates: {
        name: 'Hide All Dates',
        description: 'Hide all dates and timestamps',
        icon: '📅',
        state: {
          hideWordCount: false,
          hideKudosCount: false,
          hideCommentsCount: false,
          hideBookmarksCount: false,
          hideHits: false,
          hidePublishedDate: true,
          hideUpdatedDate: true,
          hideCompletedDate: true,
          hideChapterDates: true,
          minimalHeader: false,
          hideStatsOnChaptersList: false
        }
      },
      biasFree: {
        name: 'Bias-Free Mode',
        description: 'Hide all influence factors for unbiased reading',
        icon: '🎯',
        state: {
          hideWordCount: true,
          hideKudosCount: true,
          hideCommentsCount: true,
          hideBookmarksCount: true,
          hideHits: true,
          hidePublishedDate: true,
          hideUpdatedDate: true,
          hideCompletedDate: true,
          hideChapterDates: true,
          minimalHeader: false,
          hideStatsOnChaptersList: true
        }
      },
      cleanReader: {
        name: 'Clean Reader',
        description: 'Minimal header + hidden stats for distraction-free reading',
        icon: '📖',
        state: {
          hideWordCount: false,
          hideKudosCount: false,
          hideCommentsCount: false,
          hideBookmarksCount: false,
          hideHits: false,
          hidePublishedDate: false,
          hideUpdatedDate: false,
          hideCompletedDate: false,
          hideChapterDates: false,
          minimalHeader: true,
          hideStatsOnChaptersList: true
        }
      }
    };
  }

  // Returns the preset state object for a given presetId, or null if not found.
  apply(presetId) {
    return this.presets[presetId] ?? null;
  }

  getPresets() {
    return Object.entries(this.presets).map(([id, preset]) => ({ id, ...preset }));
  }

  // Returns the id of the first preset that fully matches the given state, or null.
  findMatchingPreset(state) {
    for (const [id, preset] of Object.entries(this.presets)) {
      const matches = Object.entries(preset.state).every(
        ([key, value]) => state[key] === value
      );
      if (matches) return id;
    }
    return null;
  }
}
