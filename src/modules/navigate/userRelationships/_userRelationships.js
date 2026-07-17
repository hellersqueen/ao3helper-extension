/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper — User Relationships Coordinator

    Module ID: userRelationships
    Display Name: User Relationships
    Tab: Navigate & Interact

    Purpose

    Coordinates author preferences, tracking, blocking, blocklist management,
    and the filtering of works, comments, and bookmark notes.

    Submodules

    - authorBlocking.js: hides listing blurbs from blocked authors
    - authorPreference.js: per-author visibility and favorite controls
    - authorTracking.js: followed-author notes and new-work detection
    - blockingInterface.js: contextual block and unblock actions
    - blocklistManagement.js: blocklist editing interface
    - commentHiding.js: filters blocked-user comments and bookmark notes

    Notes

    - Shared defaults are defined before child modules start.
    - Runtime feature behavior is delegated entirely to the submodules.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
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

/* ═══════════════════════════════════════════════════════════════════════════
   MODULE SETUP
═══════════════════════════════════════════════════════════════════════════ */

css(styles, 'ao3h-userRelationships');

const MOD  = 'userRelationships';

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURES
═══════════════════════════════════════════════════════════════════════════ */

// Feature implementations are provided by the registered child modules.

/* ═══════════════════════════════════════════════════════════════════════════
   MODULE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register(MOD, {
  title:            'User Relationships',
  enabledByDefault: false,
}, async function init () {
  await Settings.define(MOD, DEFAULTS);
  return () => {};
});
