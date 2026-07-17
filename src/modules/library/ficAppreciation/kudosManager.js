/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Fic Appreciation › Kudos Manager

Orchestrates kudos detection, presentation, manual checks, quick actions, and
cross-tab synchronization through the three specialized kudos helpers.

Notes

- The coordinator supplies initialized tracker, display, and tracking instances.
- Listing and work-page workflows remain separate.
- Cleanup cascades to all managed helpers.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

// This orchestration helper has no imports.


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

export class KudosManager {
  constructor ({ NS, storeGet, storeSet, cfg, kudosTracker, kudosDisplay, kudosTracking }) {
    this.NS            = NS;
    this.cfg           = cfg;
    this.kudosTracker  = kudosTracker;
    this.kudosDisplay  = kudosDisplay;
    this.kudosTracking = kudosTracking;
  }

  /* ═══════════════════════════════════════════════════════════════════════
     FEATURE — WORK-PAGE AND LISTING WIRING
  ═══════════════════════════════════════════════════════════════════════ */

  wireWorkPage (workId) {
    const { kudosTracker, kudosDisplay, kudosTracking, cfg } = this;
    kudosDisplay.setLoadingState(true);
    kudosTracker.applyKudosStateOnWorkPage(workId);
    kudosDisplay.setLoadingState(false);
    kudosDisplay.injectKudosBadgeOnWorkPage(workId);
    if (cfg('showManualCheckButton') !== false) {
      kudosTracking.injectManualCheckButton(workId, kudosTracker);
    }
  }

  wireBlurb (blurb, workId) {
    const { kudosTracker, kudosDisplay, cfg } = this;
    kudosTracker.applyKudosBadge(blurb, workId);
    const badge = blurb.querySelector('.' + this.NS + '-fa-badge-kudos');
    if (badge) {
      kudosDisplay.applyTooltip(badge, workId);
      kudosDisplay.applyCustomIcon(badge);
    }
    if (cfg('quickKudosButton') && !kudosTracker.hasGivenKudos(workId)) {
      kudosTracker.injectQuickKudosButton(blurb, workId);
    }
  }

  /* ═══════════════════════════════════════════════════════════════════════
     FEATURE — CROSS-TAB SYNCHRONIZATION
  ═══════════════════════════════════════════════════════════════════════ */

  startTabSync (onKudosChange) {
    this.kudosTracking.startTabSync(onKudosChange);
  }

  /* ═══════════════════════════════════════════════════════════════════════
     FEATURE LIFECYCLE
  ═══════════════════════════════════════════════════════════════════════ */

  cleanup () {
    this.kudosTracker.cleanup();
    this.kudosDisplay.cleanup();
    this.kudosTracking.cleanup();
  }
}
