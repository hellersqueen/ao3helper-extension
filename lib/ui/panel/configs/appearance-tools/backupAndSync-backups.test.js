import { describe, it, expect, beforeEach } from 'vitest';
import {
  validateBackup,
  deepValidateBackup,
  backupType,
  backupTypeLabel,
  backupKeyCount,
  backupMatchesQuery,
  parseCategories,
  filterByCategories,
  encryptBackupData,
  decryptBackupData,
  compressString,
  decompressBytes,
  buildDelta,
  applyDelta,
} from './backupAndSync-backups.js';

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

describe('chiffrement (AES-GCM/PBKDF2)', () => {
  it('roundtrip chiffrer → déchiffrer avec le bon mot de passe', async () => {
    const data = { 'ao3h:mod:x:settings': '{"a":1}' };
    const fields = await encryptBackupData(data, 'secret');
    const backup = { timestamp: NOW, type: 'encrypted', ...fields };
    expect(validateBackup(backup).valid).toBe(true);
    expect(await decryptBackupData(backup, 'secret')).toEqual(data);
  });

  it('retourne null avec un mauvais mot de passe', async () => {
    const fields = await encryptBackupData({ a: '1' }, 'secret');
    expect(await decryptBackupData({ timestamp: NOW, type: 'encrypted', ...fields }, 'wrong')).toBeNull();
  });
});

describe('compression (gzip)', () => {
  it('roundtrip compresser → décompresser', async () => {
    const json = JSON.stringify({ 'ao3h:x': 'y'.repeat(500) });
    const bytes = await compressString(json);
    expect(bytes.length).toBeLessThan(json.length); // ça compresse vraiment
    expect(await decompressBytes(bytes)).toBe(json);
  });

  it('deepValidateBackup détecte un payload gzip corrompu', async () => {
    const good = { timestamp: NOW, type: 'compressed', compressed: await compressString('{"a":"1"}') };
    expect((await deepValidateBackup(good)).valid).toBe(true);

    const bad = { timestamp: NOW, type: 'compressed', compressed: [1, 2, 3, 4, 5] };
    expect((await deepValidateBackup(bad)).valid).toBe(false);
  });
});

describe('sauvegardes incrémentales', () => {
  it('buildDelta capture ajouts, modifications et suppressions', () => {
    const base    = { a: '1', b: '2', c: '3' };
    const current = { a: '1', b: '2-modifié', d: '4' };
    expect(buildDelta(base, current)).toEqual({ b: '2-modifié', d: '4', c: null });
  });

  it('applyDelta écrit et supprime dans le storage', () => {
    localStorage.clear();
    localStorage.setItem('c', '3');
    applyDelta({ b: '2', c: null });
    expect(localStorage.getItem('b')).toBe('2');
    expect(localStorage.getItem('c')).toBeNull();
  });
});

describe('sauvegardes sélectives', () => {
  it('parseCategories découpe et nettoie la saisie', () => {
    expect(parseCategories(' readingList, filters ,,')).toEqual(['readingList', 'filters']);
    expect(parseCategories('')).toEqual([]);
    expect(parseCategories(null)).toEqual([]);
  });

  it('filterByCategories ne garde que les clés correspondantes (insensible à la casse)', () => {
    const data = { 'ao3h:readingList:x': '1', 'ao3h:filters:y': '2', 'ao3h:other': '3' };
    expect(filterByCategories(data, ['READINGLIST'])).toEqual({ 'ao3h:readingList:x': '1' });
    expect(filterByCategories(data, [])).toEqual(data);
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
