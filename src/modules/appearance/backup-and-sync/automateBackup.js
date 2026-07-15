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
 */
export class AutoBackup {
  constructor(config = {}) {
    this.config = config;
    this.backups = config.backups || [];
    this.onBackupCreated = config.onBackupCreated || null;
    this.onRestoreComplete = config.onRestoreComplete || null;
    this.getAllData = config.getAllData || null;
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
    const data = this.getAllData ? this.getAllData() : {};
    const backup = {
      timestamp: new Date().toISOString(),
      data: data
    };

    this.backups.unshift(backup);

    // Keep only max backups
    const maxBackups = this.config.maxBackups || 10;
    if (this.backups.length > maxBackups) {
      this.backups.length = maxBackups;
    }

    // Notify parent
    if (this.onBackupCreated) {
      this.onBackupCreated(this.backups);
    }

    console.log(`[AutoBackup] Backup saved (${this.backups.length}/${maxBackups})`);
  }

  restoreBackup(index = 0) {
    if (!this.backups[index]) {
      console.error('[AutoBackup] Backup not found at index:', index);
      if (this.onRestoreComplete) this.onRestoreComplete({ success: false, reason: 'not-found', index });
      return false;
    }

    const backup = this.backups[index];

    if (!backup.data || typeof backup.data !== 'object') {
      console.error('[AutoBackup] Backup at index', index, 'has no restorable data.');
      if (this.onRestoreComplete) this.onRestoreComplete({ success: false, reason: 'no-data', index });
      return false;
    }

    const date = new Date(backup.timestamp).toLocaleString();

    if (!confirm(`Restore backup from ${date}?\n\nThis will overwrite current data.`)) {
      if (this.onRestoreComplete) this.onRestoreComplete({ success: false, reason: 'cancelled', index });
      return false;
    }

    Object.entries(backup.data).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });

    console.log(`[AutoBackup] Backup restored from ${date}`);
    if (this.onRestoreComplete) this.onRestoreComplete({ success: true, index, timestamp: backup.timestamp });
    return true;
  }

  getBackups() {
    return this.backups;
  }

  cleanup() {
    if (this.backupInterval) {
      clearInterval(this.backupInterval);
      this.backupInterval = null;
    }
  }
}
