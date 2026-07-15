/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Minimal Header Submodule
    Submodule ID: minimalHeader
    Display Name: Minimal Header
    Parent Module: visualPreferences

    Toggles a streamlined header style on AO3 by adding/removing the
    `ao3h-minimal-header` class on <html>. Visual rules live in
    styles/header-cleanup.css.

    Keys managed:
        - minimalHeader → ao3h-minimal-header

═══════════════════════════════════════════════════════════════════════════ */

export class MinimalHeader {
  constructor() {
    this.className = 'ao3h-minimal-header';
  }

  apply(enabled) {
    document.documentElement.classList.toggle(this.className, !!enabled);
  }

  reset() {
    document.documentElement.classList.remove(this.className);
  }
}
