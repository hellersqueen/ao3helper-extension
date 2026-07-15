/* ═══════════════════════════════════════════════════════════════════════════
   LIGHT MODE TEMPLATE - Quick start for light custom themes
═══════════════════════════════════════════════════════════════════════════ */

export const lightModeTemplate = {
  name: 'Light Mode Template',
  description: 'Base template for creating light themes',
  css: `
html.ao3h-theme-custom-xxx {
  --ao3h-bg: #ffffff;
  --ao3h-text: #2c2c2c;
  --ao3h-link: #0066cc;
  --ao3h-visited: #551a8b;
  --ao3h-accent: #ff6b6b;
  --ao3h-border: #dddddd;
}

html.ao3h-theme-custom-xxx body {
  background: var(--ao3h-bg);
  color: var(--ao3h-text);
}

/* TODO: Add more selectors */
  `.trim()
};
