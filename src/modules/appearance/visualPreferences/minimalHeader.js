/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Visual Preferences › Minimal Header

Purpose
    Enables or disables AO3's streamlined header presentation.

Notes
    The minimalHeader preference toggles ao3h-minimal-header on the document
    root. Presentation rules are defined in styles/header-cleanup.css.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

// This submodule has no direct imports.



/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

export class MinimalHeader {
  constructor() {
    this.className = 'ao3h-minimal-header';
  }


  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — HEADER PRESENTATION
  ═════════════════════════════════════════════════════════════════════════ */

  apply(enabled) {
    document.documentElement.classList.toggle(this.className, !!enabled);
  }


  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE LIFECYCLE
  ═════════════════════════════════════════════════════════════════════════ */

  reset() {
    document.documentElement.classList.remove(this.className);
  }
}
