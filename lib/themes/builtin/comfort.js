/* ═══════════════════════════════════════════════════════════════════════════
   READING COMFORT THEMES - Sepia, Ocean, Lavender, Ember
═══════════════════════════════════════════════════════════════════════════ */

export const comfortThemes = {
  sepia: {
    id: 'sepia',
    name: 'Sepia',
    category: 'comfort',
    description: 'Warm paper-like tones for long reading',
    builtin: true,
    css: `
      html.ao3h-theme-sepia {
        filter: sepia(0.3) brightness(1.05);
      }
      html.ao3h-theme-sepia #chapters {
        background: #f4f1e8;
        color: #3a3a3a;
      }
    `
  },

  ocean: {
    id: 'ocean',
    name: 'Ocean (Blue Filter)',
    category: 'comfort',
    description: 'Soothing blue tones, reduces blue light',
    builtin: true,
    css: `
      html.ao3h-theme-ocean {
        filter: hue-rotate(200deg) saturate(0.7);
      }
      html.ao3h-theme-ocean #main,
      html.ao3h-theme-ocean #chapters {
        background: #f0f8ff;
        color: #1e3a5f;
      }
    `
  },

  lavender: {
    id: 'lavender',
    name: 'Lavender Dream',
    category: 'comfort',
    description: 'Soft lavender tones for sensitive eyes',
    builtin: true,
    css: `/* TODO: Full CSS */`
  },

  ember: {
    id: 'ember',
    name: 'Ember (Warm Dark)',
    category: 'comfort',
    description: 'Dark mode with warm tones instead of cold',
    builtin: true,
    css: `/* TODO: Full CSS */`
  }
};
