import { makeCfg } from '../../../../lib/storage/module-settings.js';

const MOD = 'activityPanel';

export const NS = 'ao3h';

const DEFAULTS = {
  showTagCloud: true,
  readingAchievements: true,
};

export const cfg = makeCfg(MOD, DEFAULTS, { globalConfig: true });

export const store = {
  get (key) {
    try { const value = localStorage.getItem('ao3h:' + key); return value ? JSON.parse(value) : null; } catch { return null; }
  },
  set (key, value) {
    try { localStorage.setItem('ao3h:' + key, JSON.stringify(value)); } catch { /* unavailable */ }
  },
};
