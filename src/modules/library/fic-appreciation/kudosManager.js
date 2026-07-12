/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper — Fic Appreciation › KudosManager helper class
    Orchestrates KudosTracker + KudosDisplay + KudosTracking together.
    Instantiated by the ficAppreciation coordinator.

    - Feature: Work page kudos wiring
      - Detects kudos (KudosTracker), shows loading state (KudosDisplay),
        injects badge after kudos section (KudosDisplay), injects manual
        check button (KudosTracking)

    - Feature: Listing blurbs kudos wiring
      - Applies 🧡 badge (KudosTracker), enriches with tooltip + custom
        icon (KudosDisplay), injects quick-kudos button when configured

    - Feature: Cross-tab sync
      - Starts tab sync (KudosTracking) so badges stay current when kudos
        are recorded in another tab

    - Feature: Cleanup
      - Disconnects all injected elements and listeners

═══════════════════════════════════════════════════════════════════════════ */

export class KudosManager {
  constructor ({ NS, storeGet, storeSet, cfg, kudosTracker, kudosDisplay, kudosTracking }) {
    this.NS            = NS;
    this.cfg           = cfg;
    this.kudosTracker  = kudosTracker;
    this.kudosDisplay  = kudosDisplay;
    this.kudosTracking = kudosTracking;
  }

  // ── Work page ──────────────────────────────────────────────────────────────────

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

  // ── Listing blurbs ────────────────────────────────────────────────────────

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

  // ── Tab sync ──────────────────────────────────────────────────────────────────

  startTabSync (onKudosChange) {
    this.kudosTracking.startTabSync(onKudosChange);
  }

  // ── Cleanup ──────────────────────────────────────────────────────────────────

  cleanup () {
    this.kudosTracker.cleanup();
    this.kudosDisplay.cleanup();
    this.kudosTracking.cleanup();
  }
}
