/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper — Visual Preferences Coordinator

    Module ID: visualPreferences
    Display Name: Visual Preferences
    Tab: Appearance & Tools

    Purpose
        Coordinates visibility, date, header, statistics, hover, preset, and
        chapter-list preferences through one persisted state and public API.

    Submodules
        statsVisibility.js     — Shows or hides individual work statistics.
        datesTimestamps.js     — Controls date visibility and relative dates.
        minimalHeader.js       — Applies the compact header presentation.
        statsDisplayFormat.js  — Formats statistics as icons or text.
        visualPreferences.css  — Reveals hidden information on hover.
        visibilityPresets.js   — Provides reusable preference combinations.
        statsOnChaptersList.js — Controls statistics on chapter listings.

    Notes
        Settings use ao3h:mod:visualPreferences:settings with a legacy fallback
        and one-time migration from older flags. The API is exposed through
        AO3H.visualPreferences and console-compatible window bridges.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register, AO3H } from '../../../core/lifecycle.js';
import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { css } from '../../../../lib/utils/index.js';

import styles from './visualPreferences.css?inline';

import { StatsVisibility } from './statsVisibility.js';
import { DatesTimestamps } from './datesTimestamps.js';
import { MinimalHeader } from './minimalHeader.js';
import { StatsDisplayFormat } from './statsDisplayFormat.js';
import { VisibilityPresets } from './visibilityPresets.js';
import { StatsOnChaptersList } from './statsOnChaptersList.js';
import { LayoutDensity } from './layoutDensity.js';
import { BlurbSectionOrder, DEFAULT_ORDER as DEFAULT_BLURB_ORDER } from './blurbSectionOrder.js';
import { GridView } from './gridView.js';
import { WordOccurrenceCounter } from './wordOccurrenceCounter.js';

/* ═══════════════════════════════════════════════════════════════════════════
   MODULE-SPECIFIC HELPERS
═══════════════════════════════════════════════════════════════════════════ */

export function dateAgeBucket (dateLike, now = Date.now()) {
  const date = dateLike instanceof Date ? dateLike : new Date(dateLike);
  const timestamp = date.getTime();
  if (!Number.isFinite(timestamp)) return null;
  const diffDays = Math.floor((now - timestamp) / 86400000);
  if (diffDays < 1) return 'today';
  if (diffDays < 7) return 'week';
  if (diffDays < 30) return 'month';
  return 'older';
}

function escapeOccurrenceRegex (value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function countOccurrences (text, word) {
  const needle = String(word || '').trim();
  if (!needle) return 0;
  try {
    const pattern = new RegExp(`\\b${escapeOccurrenceRegex(needle)}\\b`, 'gi');
    return (String(text || '').match(pattern) || []).length;
  } catch {
    return 0;
  }
}



/* ═══════════════════════════════════════════════════════════════════════════
   MODULE SETUP
═══════════════════════════════════════════════════════════════════════════ */

// All visual-preference rules now live in one stylesheet.
css(styles, 'ao3h-visualPreferences');

const W    = getGlobalWindow();
const NS   = (AO3H.env && AO3H.env.NS) || 'ao3h';
const MOD  = 'visualPreferences';

const DEFAULTS = {
  hideWordCount:           false,
  hideKudosCount:          false,
  hideCommentsCount:       false,
  hideBookmarksCount:      false,
  hideHits:                false,
  hidePublishedDate:       false,
  hideUpdatedDate:         false,
  hideCompletedDate:       false,
  hideChapterDates:        false,
  minimalHeader:           false,
  hideStatsOnChaptersList: false,
  statsAsIcons:            false,
  statsIconsMode:          'icons',
  relativeDates:           false,
  dateAgeColoring:         false,
  layoutDensity:           'comfortable', // 'compact' | 'comfortable' | 'spacious'
  blurbSectionOrder:       DEFAULT_BLURB_ORDER.join(','),
  gridView:                false,
  wordOccurrenceCounter:   false,
};



/* ═══════════════════════════════════════════════════════════════════════════
   FEATURES
═══════════════════════════════════════════════════════════════════════════ */

class VisualPreferences {
  constructor() {
    this.components = {};
    this.storage = {
      key: `${NS}:mod:visualPreferences:settings`,
      legacyKey: `${NS}:visualPreferences`,
      migrationFlag: `${NS}:visualPreferences:migrated`
    };
    this.state = null;
    this.api = null;
    this.ownsCanonicalApi = false;
  }

  init() {
    this.initComponents();
    this.setup();
    return () => this.cleanup();
  }

  initComponents() {
    console.log(`[${MOD}] ✅ Initializing components`);

    this.components = {
      statsVisibility:      new StatsVisibility(),
      datesTimestamps:      new DatesTimestamps(),
      minimalHeader:        new MinimalHeader(),
      statsDisplayFormat:   new StatsDisplayFormat({ dateAgeBucket }),
      visibilityPresets:    new VisibilityPresets(),
      statsOnChaptersList:  new StatsOnChaptersList(),
      layoutDensity:        new LayoutDensity(),
      blurbSectionOrder:    new BlurbSectionOrder(),
      gridView:             new GridView(),
      wordOccurrenceCounter: new WordOccurrenceCounter({ countOccurrences }),
    };
  }

  getDefaults() {
    return { ...DEFAULTS };
  }

  loadState() {
    try {
      // Try the standard panel settings key first
      let raw = localStorage.getItem(this.storage.key);
      // Fall back to legacy key (migration path for existing users)
      if (!raw) raw = localStorage.getItem(this.storage.legacyKey);
      if (!raw) return this.getDefaults();
      const parsed = JSON.parse(raw);
      return { ...this.getDefaults(), ...parsed };
    } catch (e) {
      console.error(`[${MOD}] Failed to load state:`, e);
      return this.getDefaults();
    }
  }

  saveState(state) {
    try {
      localStorage.setItem(this.storage.key, JSON.stringify(state));
      return true;
    } catch (e) {
      console.error(`[${MOD}] Failed to save state:`, e);
      return false;
    }
  }

  migrateFromOldModules() {
    const migrated = localStorage.getItem(this.storage.migrationFlag);
    if (migrated === 'true') return null;

    console.log(`[${MOD}] Starting migration from old modules...`);

    const Flags = AO3H.flags;
    if (!Flags) {
      localStorage.setItem(this.storage.migrationFlag, 'true');
      return null;
    }

    const migrations = {
      'mod:HideDates:enabled': 'hidePublishedDate',
      'mod:HideWordCount:enabled': 'hideWordCount',
      'mod:HideKudosCount:enabled': 'hideKudosCount',
      'mod:HideCommentsCount:enabled': 'hideCommentsCount',
      'mod:HideBookmarksCount:enabled': 'hideBookmarksCount',
      'mod:HideHits:enabled': 'hideHits',
      'mod:MinimalHeader:enabled': 'minimalHeader',
      'mod:HideStatsOnChaptersList:enabled': 'hideStatsOnChaptersList'
    };

    const newState = this.getDefaults();
    let foundAny = false;

    Object.entries(migrations).forEach(([oldKey, newKey]) => {
      const val = Flags.get(oldKey);
      // Flags.get renvoie null (et non undefined) pour une clé absente — sans le
      // test null, la migration écrivait des null dans la clé de settings au
      // premier boot, court-circuitant le fallback legacy ao3h:visualPreferences.
      if (val !== undefined && val !== null) {
        console.log(`[${MOD}] Migrating ${oldKey} (${val}) -> ${newKey}`);
        newState[newKey] = val;
        foundAny = true;
        try { Flags.remove(oldKey); } catch (e) {}
      }
    });

    if (foundAny) {
      this.saveState(newState);
      localStorage.setItem(this.storage.migrationFlag, 'true');
      return newState;
    }

    localStorage.setItem(this.storage.migrationFlag, 'true');
    return null;
  }

  applyAll(state) {
    this.components.statsVisibility.applyAll(state);
    this.components.datesTimestamps.applyAll(state);
    this.components.minimalHeader.apply(state.minimalHeader);
    this.components.statsDisplayFormat.apply(state);
    this.components.statsOnChaptersList.apply(state.hideStatsOnChaptersList);
    this.components.layoutDensity.apply(state.layoutDensity);
    this.components.blurbSectionOrder.apply(
      String(state.blurbSectionOrder || DEFAULT_BLURB_ORDER.join(',')).split(',').map(s => s.trim()).filter(Boolean)
    );
    this.components.gridView.apply(state.gridView);
    this.components.wordOccurrenceCounter.apply(state.wordOccurrenceCounter);
  }

  setup() {
    console.log(`[${MOD}] ✅ Module init`);

    // Migration
    const migrated = this.migrateFromOldModules();
    if (migrated) {
      console.log(`[${MOD}] Migrated settings from old modules`);
    }

    // Load and apply state
    this.state = this.loadState();
    console.log(`[${MOD}] Loaded state:`, this.state);
    this.applyAll(this.state);

    // Setup API
    this.setupAPI();

    console.log(`[${MOD}] ✅ Ready. Type ao3hVisualPrefs.help() for console commands.`);
  }

  setupAPI() {
    const API = {
      getState: () => this.loadState(),

      setPreference: (key, value) => {
        const defaults = this.getDefaults();
        if (!(key in defaults)) {
          console.warn(`[${MOD}] Invalid preference key: ${key}`);
          return false;
        }

        const state = this.loadState();
        state[key] = value;
        const success = this.saveState(state);

        if (success) {
          this.state = state;
          this.applyAll(state);
        }
        return success;
      },

      setPreferences: (updates) => {
        const state = this.loadState();
        const defaults = this.getDefaults();
        let changed = false;

        Object.entries(updates).forEach(([key, value]) => {
          if (key in defaults) {
            state[key] = value;
            changed = true;
          }
        });

        if (changed) {
          const success = this.saveState(state);
          if (success) {
            this.state = state;
            this.applyAll(state);
          }
          return success;
        }
        return false;
      },

      applyPreset: (presetId) => {
        const preset = this.components.visibilityPresets.apply(presetId);
        if (!preset) {
          console.warn(`[${MOD}] Unknown preset: ${presetId}`);
          return false;
        }

        const mergedState = { ...this.loadState(), ...preset.state };
        const success = this.saveState(mergedState);
        if (success) {
          this.state = mergedState;
          this.applyAll(mergedState);
          console.log(`[${MOD}] Applied preset: ${presetId}`);
        }
        return success;
      },

      getCurrentPreset: () => {
        return this.components.visibilityPresets.findMatchingPreset(this.state);
      },

      getPresets: () => {
        return this.components.visibilityPresets.getPresets();
      },

      reset: () => {
        const defaults = this.getDefaults();
        this.saveState(defaults);
        this.state = defaults;
        this.applyAll(defaults);
        console.log(`[${MOD}] Reset to defaults`);
        return true;
      },

      getKeys: () => Object.keys(this.getDefaults())
    };
    this.api = API;

    // Expose API
    W.AO3H_VisualPreferences = W.AO3H_VisualPreferences || {};
    W.AO3H_VisualPreferences.API = API;

    if (AO3H.visualPreferences === undefined) {
      AO3H.visualPreferences = API;
      this.ownsCanonicalApi = true;
    }

    // Console helper
    W.ao3hVisualPrefs = {
      get: () => API.getState(),
      set: (key, val) => API.setPreference(key, val),
      preset: (id) => API.applyPreset(id),
      reset: () => API.reset(),
      presets: () => API.getPresets(),
      help: () => {
        console.log(`
Visual Preferences Console Helper:
  ao3hVisualPrefs.get()              - Get current state
  ao3hVisualPrefs.set(key, value)    - Set a preference
  ao3hVisualPrefs.preset('biasFree') - Apply preset
  ao3hVisualPrefs.reset()            - Reset to defaults
  ao3hVisualPrefs.presets()          - List all presets

Available presets: showAll, hideAllStats, hideAllDates, biasFree, cleanReader

Example:
  ao3hVisualPrefs.set('hideKudosCount', true)
  ao3hVisualPrefs.preset('biasFree')
        `);
      }
    };
  }

  cleanup() {
    console.log(`[${MOD}] Cleanup`);

    // Reset all components
    Object.values(this.components).forEach(component => {
      if (component.reset) component.reset();
    });

    delete W.ao3hVisualPrefs;
    if (W.AO3H_VisualPreferences) delete W.AO3H_VisualPreferences.API;
    if (this.ownsCanonicalApi && AO3H.visualPreferences === this.api) {
      delete AO3H.visualPreferences;
    }
    this.api = null;
    this.ownsCanonicalApi = false;
  }
}



/* ═══════════════════════════════════════════════════════════════════════════
   MODULE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(
  MOD,
  {
    displayName:      'Visual Preferences',
    tab:              'appearance',
    enabledByDefault: true,
  },
  function init () {
    const manager = new VisualPreferences();
    return manager.init();
  }
);
