/* ═══════════════════════════════════════════════════════════════════════════
   PANEL CONFIG - Backup And Sync › Backups helpers

   Pure logic behind the "Backups" browser of the panel: backup validation
   (integrity / restorability), content search, and the non-standard backup
   modes (encrypted, compressed, incremental, selective).

   Backup shapes mirror backupOperations.js exactly (duplicated deliberately
   — lib/ui/panel/configs/ does not depend on src/modules/):
   - standard:    { timestamp, data }
   - selective:   { timestamp, type: 'selective', categories, data }
   - encrypted:   { timestamp, type: 'encrypted', salt, iv, ciphertext }
   - compressed:  { timestamp, type: 'compressed', compressed }
   - incremental: { timestamp, type: 'incremental', baseTimestamp, delta }
═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   VALIDATION — structure + restorability checks ("état" of each backup)
═══════════════════════════════════════════════════════════════════════════ */

const _isStringMap = (obj) =>
  !!obj && typeof obj === 'object' && !Array.isArray(obj) &&
  Object.values(obj).every(v => typeof v === 'string');

const _isByteArray = (arr) =>
  Array.isArray(arr) && arr.length > 0 && arr.every(n => Number.isInteger(n) && n >= 0 && n <= 255);

export function backupType (backup) {
  return backup?.type || 'standard';
}

/**
 * Structural integrity check: is this backup well-formed and restorable?
 * (encrypted backups can only be checked structurally — decrypting requires
 * the password; compressed ones can be deep-checked with deepValidateBackup)
 * @returns {{ valid: boolean, type: string, reason?: string }}
 */
export function validateBackup (backup) {
  if (!backup || typeof backup !== 'object') return { valid: false, type: 'unknown', reason: 'not an object' };
  const type = backupType(backup);
  if (!backup.timestamp || Number.isNaN(new Date(backup.timestamp).getTime())) {
    return { valid: false, type, reason: 'invalid timestamp' };
  }

  switch (type) {
    case 'standard':
    case 'selective':
      return _isStringMap(backup.data)
        ? { valid: true, type }
        : { valid: false, type, reason: 'data is not a map of strings' };
    case 'encrypted':
      return _isByteArray(backup.salt) && _isByteArray(backup.iv) && _isByteArray(backup.ciphertext)
        ? { valid: true, type }
        : { valid: false, type, reason: 'missing or corrupt salt/iv/ciphertext' };
    case 'compressed':
      return _isByteArray(backup.compressed)
        ? { valid: true, type }
        : { valid: false, type, reason: 'missing or corrupt compressed bytes' };
    case 'incremental':
      return backup.delta && typeof backup.delta === 'object' && !Array.isArray(backup.delta) &&
             Object.values(backup.delta).every(v => v === null || typeof v === 'string')
        ? { valid: true, type }
        : { valid: false, type, reason: 'delta is not a map of strings/nulls' };
    default:
      return { valid: false, type, reason: `unknown type "${type}"` };
  }
}

/**
 * Deep check for compressed backups: actually gunzips and parses the payload.
 * Other types fall back to the structural check.
 */
export async function deepValidateBackup (backup) {
  const structural = validateBackup(backup);
  if (!structural.valid || structural.type !== 'compressed') return structural;
  try {
    const json = await decompressBytes(backup.compressed);
    const data = JSON.parse(json);
    return _isStringMap(data)
      ? structural
      : { valid: false, type: 'compressed', reason: 'decompressed payload is not a map of strings' };
  } catch {
    return { valid: false, type: 'compressed', reason: 'gunzip failed' };
  }
}

export function backupTypeLabel (type) {
  return {
    standard:    'standard',
    selective:   'selective',
    encrypted:   '🔒 encrypted',
    compressed:  '📦 compressed',
    incremental: '± incremental',
  }[type] || type;
}

/** Key count shown in a row (null when the content is opaque). */
export function backupKeyCount (backup) {
  const type = backupType(backup);
  if (type === 'standard' || type === 'selective') return Object.keys(backup.data || {}).length;
  if (type === 'incremental') return Object.keys(backup.delta || {}).length;
  return null;
}

/* ═══════════════════════════════════════════════════════════════════════════
   SEARCH — by displayed date OR by content (key names inside the backup)
═══════════════════════════════════════════════════════════════════════════ */

export function backupMatchesQuery (backup, query) {
  const q = (query || '').trim().toLowerCase();
  if (!q) return true;
  if (new Date(backup.timestamp).toLocaleString().toLowerCase().includes(q)) return true;
  const keys = Object.keys(backup.data || backup.delta || {});
  if (keys.some(k => k.toLowerCase().includes(q))) return true;
  if (Array.isArray(backup.categories) && backup.categories.some(c => String(c).toLowerCase().includes(q))) return true;
  return false;
}

/* ═══════════════════════════════════════════════════════════════════════════
   SELECTIVE — category filter (substring match on key names)
═══════════════════════════════════════════════════════════════════════════ */

export function parseCategories (input) {
  return String(input || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
}

export function filterByCategories (data, categories) {
  if (!categories?.length) return { ...data };
  const filtered = {};
  for (const [key, value] of Object.entries(data || {})) {
    if (categories.some(cat => key.toLowerCase().includes(cat.toLowerCase()))) filtered[key] = value;
  }
  return filtered;
}

/* ═══════════════════════════════════════════════════════════════════════════
   ENCRYPTED — AES-GCM + PBKDF2 (same parameters as backupOperations.js)
═══════════════════════════════════════════════════════════════════════════ */

async function _deriveKey (password, salt) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/** @returns the { salt, iv, ciphertext } fields of an encrypted backup */
export async function encryptBackupData (data, password) {
  if (!password) throw new Error('Password required');
  const plaintext = new TextEncoder().encode(JSON.stringify(data));
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv   = crypto.getRandomValues(new Uint8Array(12));
  const key  = await _deriveKey(password, salt);
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext);
  return { salt: Array.from(salt), iv: Array.from(iv), ciphertext: Array.from(new Uint8Array(ciphertext)) };
}

/** @returns the decrypted data map, or null on wrong password / corrupt backup */
export async function decryptBackupData (backup, password) {
  try {
    const key = await _deriveKey(password, new Uint8Array(backup.salt));
    const plaintext = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: new Uint8Array(backup.iv) },
      key,
      new Uint8Array(backup.ciphertext)
    );
    return JSON.parse(new TextDecoder().decode(plaintext));
  } catch {
    return null;
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPRESSED — gzip via CompressionStream (same format as backupOperations.js)
═══════════════════════════════════════════════════════════════════════════ */

async function _pumpStream (stream) {
  const chunks = [];
  const reader = stream.getReader();
  let done, value;
  while ({ done, value } = await reader.read(), !done) chunks.push(value);
  const merged = new Uint8Array(chunks.reduce((acc, c) => acc + c.length, 0));
  let offset = 0;
  for (const chunk of chunks) { merged.set(chunk, offset); offset += chunk.length; }
  return merged;
}

export async function compressString (str) {
  const stream = new CompressionStream('gzip');
  const writer = stream.writable.getWriter();
  // Les erreurs remontent déjà côté lecture (_pumpStream) — on neutralise les
  // réjections des promesses d'écriture pour éviter les unhandled rejections.
  writer.write(new TextEncoder().encode(str)).catch(() => {});
  writer.close().catch(() => {});
  return Array.from(await _pumpStream(stream.readable));
}

export async function decompressBytes (bytes) {
  const stream = new DecompressionStream('gzip');
  const writer = stream.writable.getWriter();
  writer.write(new Uint8Array(bytes)).catch(() => {});
  writer.close().catch(() => {});
  return new TextDecoder().decode(await _pumpStream(stream.readable));
}

/* ═══════════════════════════════════════════════════════════════════════════
   INCREMENTAL — delta between the last full snapshot and the current data
═══════════════════════════════════════════════════════════════════════════ */

export function buildDelta (baseData, currentData) {
  const delta = {};
  for (const [key, value] of Object.entries(currentData || {})) {
    if ((baseData || {})[key] !== value) delta[key] = value;
  }
  for (const key of Object.keys(baseData || {})) {
    if (!(key in (currentData || {}))) delta[key] = null;
  }
  return delta;
}

/** Applies a delta to storage: null values delete the key. */
export function applyDelta (delta, storage = localStorage) {
  for (const [key, value] of Object.entries(delta || {})) {
    try {
      if (value === null) storage.removeItem(key);
      else storage.setItem(key, value);
    } catch {}
  }
}
