/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Backup & Sync › Automatic Backups

Purpose
    Schedules an initial backup and recurring backups when automatic backups
    are enabled.

Notes
    Backup creation, restoration, and storage are delegated to the injected
    BackupOperations instance. The default interval is 15 minutes when no
    interval is supplied by the coordinator.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

// This submodule has no direct imports.



/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

export class AutoBackup {
  constructor(config = {}) {
    this.config = config;
    this.backupOps = config.backupOps;
    this.backupInterval = null;
  }


  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — BACKUP OPERATIONS
  ═════════════════════════════════════════════════════════════════════════ */

  createBackup() {
    return this.backupOps.createBackup();
  }


  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE LIFECYCLE
  ═════════════════════════════════════════════════════════════════════════ */

  init() {
    if (!this.config.enableAutoBackup) return;

    // Initial backup
    this.createBackup();

    // Periodic backup
    this.backupInterval = setInterval(() => {
      this.createBackup();
    }, this.config.backupInterval || 15 * 60 * 1000);

    console.log('[AutoBackup] Initialized with interval:', this.config.backupInterval);
  }

  cleanup() {
    if (this.backupInterval) {
      clearInterval(this.backupInterval);
      this.backupInterval = null;
    }
  }
}
