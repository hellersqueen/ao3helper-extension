/* ═══════════════════════════════════════════════════════════════════════════
   AESTHETIC THEMES - Glass, Rose, Forest, Parchment
═══════════════════════════════════════════════════════════════════════════ */

export const aestheticThemes = {
  glass: {
    id: 'glass',
    name: 'Glass Effect',
    category: 'aesthetic',
    description: 'Modern frosted glass with transparency',
    builtin: true,
    css: `
      html.ao3h-theme-glass #header {
        background: rgba(255, 255, 255, 0.7);
        backdrop-filter: blur(10px);
      }
      /* TODO: Complete CSS */
    `
  },

  rose: {
    id: 'rose',
    name: 'Soft Pink/Rose',
    category: 'aesthetic',
    description: 'Soft feminine cozy ambiance',
    builtin: true,
    css: `/* TODO: Full CSS */`
  },

  forest: {
    id: 'forest',
    name: 'Forest/Nature',
    category: 'aesthetic',
    description: 'Calming green nature tones',
    builtin: true,
    css: `/* TODO: Full CSS */`
  },

  parchment: {
    id: 'parchment',
    name: 'Parchment/Vintage',
    category: 'aesthetic',
    description: 'Old paper texture for immersion',
    builtin: true,
    css: `/* TODO: Full CSS */`
  }
};
