/* Built-in theme catalog reserved for future Theme Builder integration. */

export const basicThemes = {
  default: {
    id: 'default', name: 'Default', category: 'basic',
    description: 'AO3 standard appearance', builtin: true, css: '',
  },
  dark: {
    id: 'dark', name: 'Dark Mode', category: 'basic',
    description: 'Inverted colors for night reading', builtin: true,
    css: `
      html.ao3h-theme-dark { filter: invert(1) hue-rotate(180deg); }
      html.ao3h-theme-dark img,
      html.ao3h-theme-dark video { filter: invert(1) hue-rotate(180deg); }
    `,
  },
};

export const accessibilityThemes = {
  highContrastDark: {
    id: 'highContrastDark', name: 'High Contrast Dark', category: 'accessibility',
    description: 'Maximum contrast (WCAG AAA) on black', builtin: true,
    css: `
      html.ao3h-theme-high-contrast-dark {
        --ao3h-bg: #000000;
        --ao3h-text: #ffffff;
        --ao3h-link: #00d4ff;
      }
      /* TODO: Complete CSS */
    `,
  },
  highContrastLight: {
    id: 'highContrastLight', name: 'High Contrast Light', category: 'accessibility',
    description: 'Maximum contrast (WCAG AAA) on white', builtin: true,
    css: `/* TODO: Full CSS */`,
  },
  oledBlack: {
    id: 'oledBlack', name: 'OLED Black', category: 'accessibility',
    description: 'Pure black for battery saving on OLED screens', builtin: true,
    css: `/* TODO: Full CSS */`,
  },
};

export const comfortThemes = {
  sepia: {
    id: 'sepia', name: 'Sepia', category: 'comfort',
    description: 'Warm paper-like tones for long reading', builtin: true,
    css: `
      html.ao3h-theme-sepia { filter: sepia(0.3) brightness(1.05); }
      html.ao3h-theme-sepia #chapters { background: #f4f1e8; color: #3a3a3a; }
    `,
  },
  ocean: {
    id: 'ocean', name: 'Ocean (Blue Filter)', category: 'comfort',
    description: 'Soothing blue tones, reduces blue light', builtin: true,
    css: `
      html.ao3h-theme-ocean { filter: hue-rotate(200deg) saturate(0.7); }
      html.ao3h-theme-ocean #main,
      html.ao3h-theme-ocean #chapters { background: #f0f8ff; color: #1e3a5f; }
    `,
  },
  lavender: {
    id: 'lavender', name: 'Lavender Dream', category: 'comfort',
    description: 'Soft lavender tones for sensitive eyes', builtin: true,
    css: `/* TODO: Full CSS */`,
  },
  ember: {
    id: 'ember', name: 'Ember (Warm Dark)', category: 'comfort',
    description: 'Dark mode with warm tones instead of cold', builtin: true,
    css: `/* TODO: Full CSS */`,
  },
};

export const aestheticThemes = {
  glass: {
    id: 'glass', name: 'Glass Effect', category: 'aesthetic',
    description: 'Modern frosted glass with transparency', builtin: true,
    css: `
      html.ao3h-theme-glass #header {
        background: rgba(255, 255, 255, 0.7);
        backdrop-filter: blur(10px);
      }
      /* TODO: Complete CSS */
    `,
  },
  rose: {
    id: 'rose', name: 'Soft Pink/Rose', category: 'aesthetic',
    description: 'Soft feminine cozy ambiance', builtin: true, css: `/* TODO: Full CSS */`,
  },
  forest: {
    id: 'forest', name: 'Forest/Nature', category: 'aesthetic',
    description: 'Calming green nature tones', builtin: true, css: `/* TODO: Full CSS */`,
  },
  parchment: {
    id: 'parchment', name: 'Parchment/Vintage', category: 'aesthetic',
    description: 'Old paper texture for immersion', builtin: true, css: `/* TODO: Full CSS */`,
  },
};

export const developerThemes = {
  monokai: {
    id: 'monokai', name: 'Monokai', category: 'developer',
    description: 'Popular IDE theme palette', builtin: true,
    css: `
      html.ao3h-theme-monokai {
        --ao3h-bg: #272822;
        --ao3h-text: #f8f8f2;
        --ao3h-link: #66d9ef;
      }
      /* TODO: Complete CSS */
    `,
  },
};

export const builtinThemes = {
  ...basicThemes,
  ...accessibilityThemes,
  ...comfortThemes,
  ...aestheticThemes,
  ...developerThemes,
};
