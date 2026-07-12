import { getGlobalWindow } from '../../../../lib/utils/globals.js';

const W = getGlobalWindow();
const MOD = 'activityPanel';

export const NS = 'ao3h';

const DEFAULTS = {
  showTagCloud: true,
  readingAchievements: true,
};

export function cfg (key, fallback) {
  try {
    const saved = JSON.parse(localStorage.getItem(`ao3h:mod:${MOD}:settings`) || '{}');
    if (key in saved) return saved[key];
  } catch { /* malformed settings fall through */ }
  const configured = W.AO3H_Config?.[MOD]?.defaults?.[key];
  return configured !== undefined ? configured : (key in DEFAULTS ? DEFAULTS[key] : fallback);
}

export const store = {
  get (key) {
    try { const value = localStorage.getItem('ao3h:' + key); return value ? JSON.parse(value) : null; } catch { return null; }
  },
  set (key, value) {
    try { localStorage.setItem('ao3h:' + key, JSON.stringify(value)); } catch { /* unavailable */ }
  },
};
