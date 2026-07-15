/* ═══════════════════════════════════════════════════════════════════════════
   BASIC THEMES - Default & Dark
═══════════════════════════════════════════════════════════════════════════ */

export const basicThemes = {
  default: {
    id: 'default',
    name: 'Default',
    category: 'basic',
    description: 'AO3 standard appearance',
    builtin: true,
    css: '' // No modifications
  },

  dark: {
    id: 'dark',
    name: 'Dark Mode',
    category: 'basic',
    description: 'Inverted colors for night reading',
    builtin: true,
    css: `
      html.ao3h-theme-dark {
        filter: invert(1) hue-rotate(180deg);
      }
      html.ao3h-theme-dark img,
      html.ao3h-theme-dark video {
        filter: invert(1) hue-rotate(180deg);
      }
    `
  }
};
