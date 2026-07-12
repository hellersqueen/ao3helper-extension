/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Comment Kit Module Coordinator
    Module ID: commentKit
    Display Name: Comment Kit
    Tab: Navigate & Interact

    Coordinator role:
        Pure coordinator — registers the parent module and scopes shared
        settings. Each submodule self-registers with parent: 'commentKit'
        and is booted/stopped by the lifecycle cascade.

    Submodules:
        commentComposing      — formatting toolbar + templates
        commentNavigation     — jump-to-comments button
        commentHighlighting   — author reply & reply-to-me highlights
        draftManagement       — auto-save drafts + character counter
        threadManagement      — collapse/expand threads + unread tracking
        commentConfiguration  — chapter badge on inbox + guest default

    Settings (panel: Navigate & Interact-configs/commentKit-config.js):
        showFormattingToolbar   [default: true]
        showQuickTemplates      [default: true]
        enableAutoSave          [default: true]
        realtimeCounter         [default: true]
        highlightAuthorReplies  [default: true]
        highlightRepliesToMe    [default: false]
        jumpToCommentsButton    [default: true]
        collapseExpandButtons   [default: true]
        unreadTracking          [default: false]

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

css(styles, 'ao3h-commentKit');

register('commentKit', {
  title:            'Comment Kit',
  enabledByDefault: false,
}, async function init () {
  // Pure coordinator — submodules handle all logic via parent-child lifecycle.
  return () => {};
});
