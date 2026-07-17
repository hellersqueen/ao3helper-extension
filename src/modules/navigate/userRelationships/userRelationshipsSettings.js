/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - User Relationships › Shared Settings

Defines and loads the settings shared by User Relationships filtering features.

Notes

- Defaults preserve placeholders and disable temporary reveal behavior.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { loadModuleSettings } from '../../../../lib/storage/module-settings.js';

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

export const DEFAULTS = {
  favoritesOnlyFilter: false,
  showPlaceholder: true,
  tempRevealHidden: false,
};

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE — SETTINGS ACCESS
═══════════════════════════════════════════════════════════════════════════ */

export function getUserRelationshipsSettings () {
  return loadModuleSettings('userRelationships', DEFAULTS);
}

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

// This stateless helper requires no lifecycle hooks.
