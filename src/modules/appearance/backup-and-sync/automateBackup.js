/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Automate Backup Submodule
    Submodule ID: automateBackup
    Display Name: Automate Backup
    Source Module: Backup and Sync

    - Feature: Automatic backup scheduling
      - Option: Periodic automatic backups
      - Option: Configurable backup interval (default: 15 minutes)
      - Option: Background backup creation
      - Option: Enable/disable auto-backup
      - Option: Initial backup on module init
      - Option: setInterval for periodic execution

    - Feature: Backup creation
      - Option: Collect all AO3Helper data
      - Option: Create timestamped snapshot
      - Option: ISO date format timestamps
      - Option: Store in backups array

    - Feature: Backup retention
      - Option: Maximum backup count (default: 10)
      - Option: FIFO queue (oldest removed first)
      - Option: Automatic pruning when limit exceeded
      - Option: Array length management

    - Feature: Backup restoration
      - Option: Restore by backup index
      - Option: Confirmation dialog
      - Option: Overwrite localStorage entries
      - Option: Success/failure notification

    - Feature: Data collection
      - Option: Scan all localStorage keys
      - Option: Filter by namespace (ao3h, AO3H)
      - Option: Exclude auto-backup data
      - Option: Key-value object compilation

    - Feature: Configuration management
      - Option: Storage key: `backupAndSync`
      - Option: Config: enableAutoBackup, backupInterval, maxBackups
      - Option: Callback for backup events
      - Option: Parent notification system

═══════════════════════════════════════════════════════════════════════════ */

/**
 * AutoBackup - Periodic automatic backup scheduler.
 * Delegates the actual backup/restore work to a BackupOperations instance
 * (injected as `config.backupOps`) so the two submodules share one
 * implementation instead of two near-identical copies.
 */
export class AutoBackup {
  constructor(config = {}) {
    this.config = config;
    this.backupOps = config.backupOps;
    this.backupInterval = null;
  }

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

  createBackup() {
    return this.backupOps.createBackup();
  }

  restoreBackup(index = 0) {
    return this.backupOps.restoreBackup(index);
  }

  getBackups() {
    return this.backupOps.getBackups();
  }

  cleanup() {
    if (this.backupInterval) {
      clearInterval(this.backupInterval);
      this.backupInterval = null;
    }
  }
}
