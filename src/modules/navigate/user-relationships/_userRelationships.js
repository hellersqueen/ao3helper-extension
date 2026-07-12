/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - User Relationships Module Coordinator
    Module ID: userRelationships
    Display Name: User Relationships
    Tab: Navigate & Interact

    Submodules (Tier 2 — self-register with parent: 'userRelationships', discovered
    independently by src/modules.js's import.meta.glob, booted automatically
    by the cascade logic already built into core/lifecycle.js's bootOne()):
        authorBlocking       -- hide work blurbs by blocked authors on listing pages
        authorPreference     -- per-author hide / favourite / read-count controls
        authorTracking       -- author notes badges, follow-list badges, new-work detection
        blockingInterface    -- right-click context menu to block/unblock any username
        blocklistManagement  -- blocklist management panel on profile/preferences pages
        commentHiding        -- hide comments and bookmark notes from blocked users

    This coordinator is a pure parent — it only registers itself so the registry
    can cascade lifecycle to its children. All logic lives in the submodules.

═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { Settings } from '../../../../lib/utils/config.js';
import { css } from '../../../../lib/utils/index.js';
import styles from './userRelationships.css?inline';
import { DEFAULTS } from './userRelationshipsSettings.js';

import './authorBlocking.js';
import './authorPreference.js';
import './authorTracking.js';
import './blockingInterface.js';
import './blocklistManagement.js';
import './commentHiding.js';

css(styles, 'ao3h-userRelationships');

const MOD  = 'userRelationships';

// ── Defaults (required for audit tooling) ──────────────────────────
register(MOD, {
  title:            'User Relationships',
  enabledByDefault: false,
}, async function init () {
  await Settings.define(MOD, DEFAULTS);
  return () => {};
});
