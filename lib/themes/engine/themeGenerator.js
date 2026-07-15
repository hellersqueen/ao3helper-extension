/* ═══════════════════════════════════════════════════════════════════════════
   THEME GENERATOR - Generate CSS from color picker values
═══════════════════════════════════════════════════════════════════════════ */

export class ThemeGenerator {
  static generateCSS(colors) {
    const { bg, text, link, visited, accent, border } = colors;
    
    return `
html.ao3h-theme-custom-xxx {
  --ao3h-bg: ${bg};
  --ao3h-text: ${text};
  --ao3h-link: ${link};
  --ao3h-visited: ${visited || link};
  --ao3h-accent: ${accent || link};
  --ao3h-border: ${border || 'rgba(0,0,0,0.1)'};
}

html.ao3h-theme-custom-xxx body {
  background: var(--ao3h-bg);
  color: var(--ao3h-text);
}

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

html.ao3h-theme-custom-xxx .blurb {
  border-color: var(--ao3h-border);
}
    `.trim();
  }
}
