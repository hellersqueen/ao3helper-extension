/* ═══════════════════════════════════════════════════════════════════════════
   ACCESSIBILITY THEMES - High Contrast Dark/Light, OLED Black
═══════════════════════════════════════════════════════════════════════════ */

export const accessibilityThemes = {
  highContrastDark: {
    id: 'highContrastDark',
    name: 'High Contrast Dark',
    category: 'accessibility',
    description: 'Maximum contrast (WCAG AAA) on black',
    builtin: true,
    css: `
      html.ao3h-theme-high-contrast-dark {
        --ao3h-bg: #000000;
        --ao3h-text: #ffffff;
        --ao3h-link: #00d4ff;
      }
      /* TODO: Complete CSS */
    `
  },

  highContrastLight: {
    id: 'highContrastLight',
    name: 'High Contrast Light',
    category: 'accessibility',
    description: 'Maximum contrast (WCAG AAA) on white',
    builtin: true,
    css: `/* TODO: Full CSS */`
  },

  oledBlack: {
    id: 'oledBlack',
    name: 'OLED Black',
    category: 'accessibility',
    description: 'Pure black for battery saving on OLED screens',
    builtin: true,
    css: `/* TODO: Full CSS */`
  }
};
