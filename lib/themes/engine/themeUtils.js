/* Theme generation, parsing, and validation utilities shared by Theme Builder. */

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

export class ThemeParser {
  static extractColors(css) {
    const colors = {};
    const variables = ['bg', 'text', 'link', 'visited', 'accent', 'border'];

    for (const variable of variables) {
      const match = css.match(new RegExp(`--ao3h-${variable}:\\s*([^;]+)`));
      if (match) colors[variable] = match[1].trim();
    }

    return colors;
  }
}

export class ThemeValidator {
  static validate(css) {
    const dangerousPatterns = [
      /<script/i,
      /javascript:/i,
      /@import\s+url\(/i,
      /expression\(/i,
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(css)) throw new Error('CSS contains potentially unsafe content');
    }

    if (css.length > 50000) throw new Error('CSS is too large (max 50KB)');

    if (!css.includes('html.ao3h-theme-custom-')) {
      console.warn('[ThemeValidator] CSS should target html.ao3h-theme-custom-* for proper scoping');
    }

    return true;
  }
}
