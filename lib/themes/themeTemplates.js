/* Starter templates reserved for future Theme Builder theme creation. */

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
  `.trim(),
};

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

html.ao3h-theme-custom-xxx a { color: var(--ao3h-link); }
html.ao3h-theme-custom-xxx a:visited { color: var(--ao3h-visited); }
  `.trim(),
};

export const colorfulTemplate = {
  name: 'Colorful Template',
  description: 'Vibrant colors for a cheerful experience',
  css: `
html.ao3h-theme-custom-xxx {
  --ao3h-bg: #fff8f0;
  --ao3h-text: #333333;
  --ao3h-link: #ff6b9d;
  --ao3h-accent: #ffd93d;
}

/* TODO: Add colorful styles */
  `.trim(),
};

export const themeTemplates = {
  light: lightModeTemplate,
  dark: darkModeTemplate,
  colorful: colorfulTemplate,
};
