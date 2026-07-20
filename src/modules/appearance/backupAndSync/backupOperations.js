/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Backup & Sync › Backup Operations

Purpose
    Collects AO3 Helper data and provides standard, selective, encrypted,
    compressed, and incremental backup and restore operations.

Notes
    Backup history is shared with the coordinator by reference. New snapshots
    are prepended and pruned to the configured maximum. The backup history
    itself is excluded when collecting AO3 Helper localStorage data.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { getGlobalWindow } from '../../../../lib/utils/globals.js';



/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const W = getGlobalWindow();

export class BackupOperations {
  constructor(config = {}) {
    this.config = config;
    this.backups = config.backups || [];
    this.onBackupCreated = config.onBackupCreated || null;
    this.maxBackups = config.maxBackups || 10;
    // Injected by the coordinator — scans localStorage for AO3 Helper data.
    // Shared with ImportExportLists/CloudSync so the scan exists once.
    this.getAllData = config.getAllData || (() => ({}));
  }


  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — STANDARD BACKUPS
  ═════════════════════════════════════════════════════════════════════════ */

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
    return this.getAllData();
  }

  getBackups() {
    return this.backups;
  }


  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — SELECTIVE BACKUPS
  ═════════════════════════════════════════════════════════════════════════ */

  // categories: array of key substring patterns, e.g. ['readingList', 'filters']
  createSelectiveBackup(categories = []) {
    const all = this.getAllData();
    const data = categories.length === 0
      ? all
      : Object.fromEntries(Object.entries(all).filter(([key]) =>
          categories.some(cat => key.toLowerCase().includes(cat.toLowerCase()))
        ));

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


  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — ENCRYPTED BACKUPS
  ═════════════════════════════════════════════════════════════════════════ */

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


  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — COMPRESSED BACKUPS
  ═════════════════════════════════════════════════════════════════════════ */

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


  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE — INCREMENTAL BACKUPS
  ═════════════════════════════════════════════════════════════════════════ */

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


  /* ═════════════════════════════════════════════════════════════════════════
     FEATURE LIFECYCLE
  ═════════════════════════════════════════════════════════════════════════ */

  cleanup() {
    // no interval — manual operations only
  }
}
