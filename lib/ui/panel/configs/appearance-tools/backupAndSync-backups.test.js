import { describe, it, expect } from 'vitest';
import {
  validateBackup,
  deepValidateBackup,
  backupType,
  backupTypeLabel,
  backupKeyCount,
  backupMatchesQuery,
  parseCategories,
  decompressBytes,
} from './backupAndSync-backups.js';

// Encryption/compression/incremental roundtrips, and the selective-backup
// category filter, are tested where that logic actually lives now:
// src/modules/appearance/backupAndSync/backupOperations.test.js — this file
// creates/restores backups directly via W.AO3H.backupAndSync instead of
// duplicating the algorithms, so only the read-only UI helpers below
// (validation, search, category-input parsing) are tested here.

async function compressString(str) {
  const stream = new CompressionStream('gzip');
  const writer = stream.writable.getWriter();
  writer.write(new TextEncoder().encode(str)).catch(() => {});
  writer.close().catch(() => {});
  const chunks = [];
  const reader = stream.readable.getReader();
  let done, value;
  while ({ done, value } = await reader.read(), !done) chunks.push(value);
  const merged = new Uint8Array(chunks.reduce((acc, c) => acc + c.length, 0));
  let offset = 0;
  for (const chunk of chunks) { merged.set(chunk, offset); offset += chunk.length; }
  return Array.from(merged);
}

const NOW = new Date().toISOString();

describe('validateBackup', () => {
  it('valide une sauvegarde standard (data = map de strings)', () => {
    expect(validateBackup({ timestamp: NOW, data: { 'ao3h:x': '1' } })).toEqual({ valid: true, type: 'standard' });
  });

  it('valide une sauvegarde sélective', () => {
    expect(validateBackup({ timestamp: NOW, type: 'selective', categories: ['x'], data: {} }).valid).toBe(true);
  });

  it('valide une sauvegarde incrémentale (delta strings/null)', () => {
    expect(validateBackup({ timestamp: NOW, type: 'incremental', delta: { a: '1', b: null } }).valid).toBe(true);
  });

  it('rejette les structures corrompues', () => {
    expect(validateBackup(null).valid).toBe(false);
    expect(validateBackup({ timestamp: 'not-a-date', data: {} }).valid).toBe(false);
    expect(validateBackup({ timestamp: NOW, data: { x: 42 } }).valid).toBe(false);
    expect(validateBackup({ timestamp: NOW, type: 'encrypted', salt: [1], iv: [] , ciphertext: [1] }).valid).toBe(false);
    expect(validateBackup({ timestamp: NOW, type: 'compressed', compressed: 'nope' }).valid).toBe(false);
    expect(validateBackup({ timestamp: NOW, type: 'martian' }).valid).toBe(false);
  });

  it('expose le type et un libellé lisible', () => {
    expect(backupType({ timestamp: NOW, data: {} })).toBe('standard');
    expect(backupTypeLabel('encrypted')).toContain('encrypted');
    expect(backupKeyCount({ timestamp: NOW, data: { a: '1', b: '2' } })).toBe(2);
    expect(backupKeyCount({ timestamp: NOW, type: 'encrypted', salt: [1], iv: [1], ciphertext: [1] })).toBeNull();
  });
});

describe('compression (gzip) — read-only decode used by deepValidateBackup', () => {
  it('deepValidateBackup détecte un payload gzip corrompu', async () => {
    const good = { timestamp: NOW, type: 'compressed', compressed: await compressString('{"a":"1"}') };
    expect((await deepValidateBackup(good)).valid).toBe(true);

    const bad = { timestamp: NOW, type: 'compressed', compressed: [1, 2, 3, 4, 5] };
    expect((await deepValidateBackup(bad)).valid).toBe(false);
  });

  it('decompressBytes décode ce que compressString a produit', async () => {
    const json = JSON.stringify({ 'ao3h:x': 'y'.repeat(500) });
    const bytes = await compressString(json);
    expect(await decompressBytes(bytes)).toBe(json);
  });
});

describe('sauvegardes sélectives — saisie des catégories', () => {
  it('parseCategories découpe et nettoie la saisie', () => {
    expect(parseCategories(' readingList, filters ,,')).toEqual(['readingList', 'filters']);
    expect(parseCategories('')).toEqual([]);
    expect(parseCategories(null)).toEqual([]);
  });
});

describe('backupMatchesQuery — recherche par date ou contenu', () => {
  const backup = {
    timestamp: new Date('2026-03-05T10:00:00').toISOString(),
    data: { 'ao3h:mod:hideByTags:settings': '{}', 'ao3h:readingList': '[]' },
  };

  it('matche tout avec une requête vide', () => {
    expect(backupMatchesQuery(backup, '')).toBe(true);
    expect(backupMatchesQuery(backup, null)).toBe(true);
  });

  it('matche sur la date affichée', () => {
    const needle = new Date(backup.timestamp).toLocaleString().slice(0, 6);
    expect(backupMatchesQuery(backup, needle)).toBe(true);
  });

  it('matche sur les noms de clés à l\'intérieur de la sauvegarde', () => {
    expect(backupMatchesQuery(backup, 'hidebytags')).toBe(true);
    expect(backupMatchesQuery(backup, 'readinglist')).toBe(true);
    expect(backupMatchesQuery(backup, 'zzz-introuvable')).toBe(false);
  });

  it('matche sur le delta des sauvegardes incrémentales et les catégories des sélectives', () => {
    const inc = { timestamp: NOW, type: 'incremental', delta: { 'ao3h:skipWorks:notes': '1' } };
    expect(backupMatchesQuery(inc, 'skipworks')).toBe(true);
    const sel = { timestamp: NOW, type: 'selective', categories: ['filters'], data: {} };
    expect(backupMatchesQuery(sel, 'filters')).toBe(true);
  });
});
