/* ═══════════════════════════════════════════════════════════════════════════
   COMPONENT: persistence.js
   Unified storage management for appearance customizer
═══════════════════════════════════════════════════════════════════════════ */

export function init(namespace, moduleName) {
  const CSS_KEY = `${namespace}-custom-css`;
  const TYPO_KEY = `mod:${moduleName}:typography`;
  const PRESET_KEY = `mod:${moduleName}:preset`;

  return {
    // Custom CSS
    getCustomCSS() {
      return localStorage.getItem(CSS_KEY) || '';
    },

    saveCustomCSS(css) {
      localStorage.setItem(CSS_KEY, css);
    },

    clearCustomCSS() {
      localStorage.removeItem(CSS_KEY);
    },

    // Typography settings
    getTypographySettings() {
      const data = localStorage.getItem(TYPO_KEY);
      return data ? JSON.parse(data) : null;
    },

    saveTypographySettings(settings) {
      localStorage.setItem(TYPO_KEY, JSON.stringify(settings));
    },

    clearTypographySettings() {
      localStorage.removeItem(TYPO_KEY);
    },

    // Current preset
    getCurrentPreset() {
      return localStorage.getItem(PRESET_KEY) || 'default';
    },

    saveCurrentPreset(presetName) {
      localStorage.setItem(PRESET_KEY, presetName);
    },

    // Clear all
    clearAll() {
      this.clearCustomCSS();
      this.clearTypographySettings();
      localStorage.removeItem(PRESET_KEY);
    }
  };
}
