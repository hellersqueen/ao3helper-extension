/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper — Comment Kit Coordinator

    Module ID: commentKit
    Display Name: Comment Kit
    Tab: Navigate & Interact

    Purpose

    Coordinates comment composition, navigation, highlighting, drafts, thread
    controls, and shared comment settings.

    Submodules

    - commentComposing.js: formatting tools, templates, and previews
    - commentNavigation.js: comment-section navigation
    - commentHighlighting.js: author and reply-to-me highlighting
    - draftManagement.js: draft persistence and comment counters
    - threadManagement.js: thread collapsing and unread tracking
    - commentConfiguration.js: inbox chapter badges and guest-comment defaults

    Notes

    - Submodules self-register under `commentKit` and share its settings scope.
    - The coordinator itself owns no runtime feature state.

═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../../../core/lifecycle.js';
import { css } from '../../../../lib/utils/index.js';
import styles from './commentKit.css?inline';

import './commentComposing.js';
import './commentNavigation.js';
import './commentHighlighting.js';
import './draftManagement.js';
import './threadManagement.js';
import './commentConfiguration.js';

/* ═══════════════════════════════════════════════════════════════════════════
   MODULE SETUP
═══════════════════════════════════════════════════════════════════════════ */

css(styles, 'ao3h-commentKit');

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURES
═══════════════════════════════════════════════════════════════════════════ */

// Feature behavior is implemented by the registered child modules.

/* ═══════════════════════════════════════════════════════════════════════════
   MODULE LIFECYCLE
═══════════════════════════════════════════════════════════════════════════ */

register('commentKit', {
  title:            'Comment Kit',
  enabledByDefault: false,
}, async function init () {
  // Pure coordinator — submodules handle all logic via parent-child lifecycle.
  return () => {};
});
