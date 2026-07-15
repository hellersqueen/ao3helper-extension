/* ═══════════════════════════════════════════════════════════════════════════
   DARK MODE TEMPLATE - Quick start for dark custom themes
═══════════════════════════════════════════════════════════════════════════ */

export const darkModeTemplate = {
  name: 'Dark Mode Template',
  description: 'Base template for creating dark themes',
  css: `
html.ao3h-theme-custom-xxx {
  --ao3h-bg: #1e1e1e;
  --ao3h-text: #d4d4d4;
  --ao3h-link: #58a6ff;
  --ao3h-visited: #9d79d6;
  --ao3h-accent: #f78c6c;
  --ao3h-border: #333333;
}

html.ao3h-theme-custom-xxx body,
html.ao3h-theme-custom-xxx #main,
html.ao3h-theme-custom-xxx #chapters {
  background: var(--ao3h-bg);
  color: var(--ao3h-text);
}

html.ao3h-theme-custom-xxx a {
  color: var(--ao3h-link);
}

html.ao3h-theme-custom-xxx a:visited {
  color: var(--ao3h-visited);
}
  `.trim()
};
