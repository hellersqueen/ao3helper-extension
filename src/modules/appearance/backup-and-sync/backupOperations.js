/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Backup Operations Submodule
    Submodule ID: backupOperations
    Display Name: Backup Operations
    Source Module: Backup and Sync

    - Feature: Backup user data and preferences
      - Option: Collect all AO3Helper data from localStorage
      - Option: Namespace filtering (ao3h, AO3H prefixes)
      - Option: Exclude auto-backup data from backups
      - Option: JSON data serialization

    - Feature: Backup history and versioning
      - Option: Timestamped backup snapshots
      - Option: Maximum backup count limit
      - Option: Automatic old backup pruning
      - Option: Point-in-time recovery

    - Feature: Selective backup (choose data to backup)
      - Option: Select specific data categories
      - Option: Module-specific backups
      - Option: Exclude certain data types
      - Option: Custom backup profiles

    - Feature: Restore from backup
      - Option: Restore specific backup by index
      - Option: Confirmation dialog before restore
      - Option: Restore with date/time display
      - Option: Overwrite current data warning

    - Feature: Encrypted backups
      - Option: Password-protected backups
      - Option: AES encryption
      - Option: Encryption key management

    - Feature: Backup compression
      - Option: Compress backup files
      - Option: gzip compression (CompressionStream API)
      - Option: Reduce storage size
      - Option: Faster upload/download

    - Feature: Incremental backups
      - Option: Only backup changed data
      - Option: Delta backups
      - Option: Reduce backup size
      - Option: Faster backup creation

═══════════════════════════════════════════════════════════════════════════ */

// Etape 318 : AO3H importe du core (avant : lecture window.AO3H)
import { AO3H } from '../../../core/lifecycle.js';

import { getGlobalWindow } from '../../../../lib/utils/globals.js';

const W = getGlobalWindow();

/**
 * BackupOperations - Manual backup and restore operations.
 */
export class BackupOperations {
  constructor(config = {}) {
    this.config = config;
    this.backups = config.backups || [];
    this.onBackupCreated = config.onBackupCreated || null;
    this.maxBackups = config.maxBackups || 10;
  }

  createBackup() {
    const data = this.getAllAO3HelperData();
    const backup = {
      timestamp: new Date().toISOString(),
      data: data
    };

    this.backups.unshift(backup);

    if (this.backups.length > this.maxBackups) {
      this.backups.length = this.maxBackups;
    }

    if (this.onBackupCreated) {
      this.onBackupCreated(this.backups);
    }

    console.log(`[BackupOperations] Backup saved (${this.backups.length}/${this.maxBackups})`);
    return backup;
  }

  restoreBackup(index = 0) {
    if (!this.backups[index]) {
      console.error('[BackupOperations] Backup not found at index:', index);
      return false;
    }

    const backup = this.backups[index];

    if (!backup.data || typeof backup.data !== 'object') {
      console.error('[BackupOperations] Backup at index', index, 'has no restorable data.');
      return false;
    }

    const date = new Date(backup.timestamp).toLocaleString();

    if (!confirm(`Restore backup from ${date}?\n\nThis will overwrite current data.`)) {
      return false;
    }

    Object.entries(backup.data).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });

    console.log(`[BackupOperations] Restored backup from ${date}`);
    return true;
  }

  getAllAO3HelperData() {
    const NS = AO3H.env?.NS || 'ao3h';
    const data = {};

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes(NS) || key.includes('AO3H')) && !key.includes(':backupAndSync:backups')) {
        data[key] = localStorage.getItem(key);
      }
    }

    return data;
  }

  getBackups() {
    return this.backups;
  }

  // ── Selective backup ────────────────────────────────────────────────────
  // categories: array of key substring patterns, e.g. ['readingList', 'filters']
  createSelectiveBackup(categories = []) {
    const NS = AO3H.env?.NS || 'ao3h';
    const data = {};

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      const isAO3H = key.includes(NS) || key.includes('AO3H');
      if (!isAO3H || key.includes(':backupAndSync:backups')) continue;

      const matchesCategory = categories.length === 0 ||
        categories.some(cat => key.toLowerCase().includes(cat.toLowerCase()));

      if (matchesCategory) {
        data[key] = localStorage.getItem(key);
      }
    }

    const backup = {
      timestamp: new Date().toISOString(),
      type: 'selective',
      categories,
      data
    };

    this.backups.unshift(backup);
    if (this.backups.length > this.maxBackups) this.backups.length = this.maxBackups;
    if (this.onBackupCreated) this.onBackupCreated(this.backups);

    console.log(`[BackupOperations] Selective backup saved (${Object.keys(data).length} keys, categories: ${categories.join(', ') || 'all'})`);
    return backup;
  }

  // ── Encrypted backups (AES-GCM via Web Crypto API) ──────────────────────
  async _deriveKey(password, salt) {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']
    );
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  async createEncryptedBackup(password) {
    if (!password) throw new Error('[BackupOperations] Password required for encrypted backup.');

    const data = this.getAllAO3HelperData();
    const plaintext = new TextEncoder().encode(JSON.stringify(data));
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv   = crypto.getRandomValues(new Uint8Array(12));
    const key  = await this._deriveKey(password, salt);
    const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext);

    const backup = {
      timestamp: new Date().toISOString(),
      type: 'encrypted',
      salt:       Array.from(salt),
      iv:         Array.from(iv),
      ciphertext: Array.from(new Uint8Array(ciphertext))
    };

    this.backups.unshift(backup);
    if (this.backups.length > this.maxBackups) this.backups.length = this.maxBackups;
    if (this.onBackupCreated) this.onBackupCreated(this.backups);

    console.log('[BackupOperations] Encrypted backup saved.');
    return backup;
  }

  async restoreEncryptedBackup(index = 0, password) {
    const backup = this.backups[index];
    if (!backup || backup.type !== 'encrypted') {
      console.error('[BackupOperations] No encrypted backup at index:', index);
      return false;
    }
    if (!password) throw new Error('[BackupOperations] Password required to restore encrypted backup.');

    const date = new Date(backup.timestamp).toLocaleString();
    if (!confirm(`Restore encrypted backup from ${date}?\n\nThis will overwrite current data.`)) return false;

    try {
      const salt       = new Uint8Array(backup.salt);
      const iv         = new Uint8Array(backup.iv);
      const ciphertext = new Uint8Array(backup.ciphertext);
      const key        = await this._deriveKey(password, salt);
      const plaintext  = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
      const data       = JSON.parse(new TextDecoder().decode(plaintext));

      Object.entries(data).forEach(([k, v]) => localStorage.setItem(k, v));
      console.log(`[BackupOperations] Encrypted backup restored from ${date}`);
      return true;
    } catch {
      console.error('[BackupOperations] Decryption failed — wrong password or corrupt backup.');
      return false;
    }
  }

  // ── Compressed backups (CompressionStream API) ──────────────────────────
  async _compress(str) {
    const stream = new CompressionStream('gzip');
    const writer = stream.writable.getWriter();
    await writer.write(new TextEncoder().encode(str));
    await writer.close();
    const chunks = [];
    const reader = stream.readable.getReader();
    let done, value;
    while ({ done, value } = await reader.read(), !done) chunks.push(value);
    const merged = new Uint8Array(chunks.reduce((acc, c) => acc + c.length, 0));
    let offset = 0;
    for (const chunk of chunks) { merged.set(chunk, offset); offset += chunk.length; }
    return Array.from(merged);
  }

  async _decompress(bytes) {
    const stream = new DecompressionStream('gzip');
    const writer = stream.writable.getWriter();
    await writer.write(new Uint8Array(bytes));
    await writer.close();
    const chunks = [];
    const reader = stream.readable.getReader();
    let done, value;
    while ({ done, value } = await reader.read(), !done) chunks.push(value);
    const merged = new Uint8Array(chunks.reduce((acc, c) => acc + c.length, 0));
    let offset = 0;
    for (const chunk of chunks) { merged.set(chunk, offset); offset += chunk.length; }
    return new TextDecoder().decode(merged);
  }

  async createCompressedBackup() {
    const data = this.getAllAO3HelperData();
    const compressed = await this._compress(JSON.stringify(data));

    const backup = {
      timestamp: new Date().toISOString(),
      type: 'compressed',
      compressed
    };

    this.backups.unshift(backup);
    if (this.backups.length > this.maxBackups) this.backups.length = this.maxBackups;
    if (this.onBackupCreated) this.onBackupCreated(this.backups);

    const ratio = ((1 - compressed.length / JSON.stringify(data).length) * 100).toFixed(1);
    console.log(`[BackupOperations] Compressed backup saved (${ratio}% smaller).`);
    return backup;
  }

  async restoreCompressedBackup(index = 0) {
    const backup = this.backups[index];
    if (!backup || backup.type !== 'compressed') {
      console.error('[BackupOperations] No compressed backup at index:', index);
      return false;
    }

    const date = new Date(backup.timestamp).toLocaleString();
    if (!confirm(`Restore compressed backup from ${date}?\n\nThis will overwrite current data.`)) return false;

    try {
      const json = await this._decompress(backup.compressed);
      const data = JSON.parse(json);
      Object.entries(data).forEach(([k, v]) => localStorage.setItem(k, v));
      console.log(`[BackupOperations] Compressed backup restored from ${date}`);
      return true;
    } catch (err) {
      console.error('[BackupOperations] Decompression failed:', err);
      return false;
    }
  }

  // ── Incremental backups (delta against last backup) ──────────────────────
  createIncrementalBackup() {
    const current = this.getAllAO3HelperData();
    const last = this.backups.find(b => b.data && typeof b.data === 'object') || null;
    const baseData = last?.data || {};

    const delta = {};
    // Added or changed keys
    for (const [key, value] of Object.entries(current)) {
      if (baseData[key] !== value) delta[key] = value;
    }
    // Deleted keys (present in base, absent now)
    for (const key of Object.keys(baseData)) {
      if (!(key in current)) delta[key] = null;
    }

    const backup = {
      timestamp: new Date().toISOString(),
      type: 'incremental',
      baseTimestamp: last?.timestamp || null,
      delta
    };

    this.backups.unshift(backup);
    if (this.backups.length > this.maxBackups) this.backups.length = this.maxBackups;
    if (this.onBackupCreated) this.onBackupCreated(this.backups);

    console.log(`[BackupOperations] Incremental backup saved (${Object.keys(delta).length} changed keys).`);
    return backup;
  }

  restoreIncrementalBackup(index = 0) {
    const backup = this.backups[index];
    if (!backup || backup.type !== 'incremental') {
      console.error('[BackupOperations] No incremental backup at index:', index);
      return false;
    }

    const date = new Date(backup.timestamp).toLocaleString();
    if (!confirm(`Restore incremental backup from ${date}?\n\nThis will apply the stored delta to current data.`)) return false;

    for (const [key, value] of Object.entries(backup.delta)) {
      if (value === null) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, value);
      }
    }

    console.log(`[BackupOperations] Incremental backup applied from ${date}`);
    return true;
  }

  cleanup() {
    // no interval — manual operations only
  }
}
