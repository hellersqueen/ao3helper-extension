import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BackupOperations } from './_backupAndSync.js';

function makeOps(overrides = {}) {
  return new BackupOperations({
    maxBackups: 10,
    getAllData: () => ({ 'ao3h:mod:x:settings': '{"a":1}' }),
    ...overrides,
  });
}

describe('BackupOperations — standard backups', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal('confirm', vi.fn(() => true));
  });

  it('createBackup puis restoreBackup restaure les données dans localStorage', () => {
    const ops = makeOps();
    ops.createBackup();
    localStorage.setItem('ao3h:mod:x:settings', '{"a":2}'); // simulate a change

    expect(ops.restoreBackup(0)).toBe(true);
    expect(localStorage.getItem('ao3h:mod:x:settings')).toBe('{"a":1}');
  });

  it('restoreBackup refuse si l\'utilisateur annule la confirmation', () => {
    vi.stubGlobal('confirm', vi.fn(() => false));
    const ops = makeOps();
    ops.createBackup();
    expect(ops.restoreBackup(0)).toBe(false);
  });

  it('getBackups retourne le tableau interne par référence', () => {
    const ops = makeOps();
    ops.createBackup();
    expect(ops.getBackups()).toBe(ops.backups);
  });
});

describe('BackupOperations — selective backups', () => {
  beforeEach(() => { localStorage.clear(); vi.stubGlobal('confirm', vi.fn(() => true)); });

  it('createSelectiveBackup ne garde que les clés correspondant aux catégories (insensible à la casse)', () => {
    const ops = makeOps({
      getAllData: () => ({ 'ao3h:readingList:x': '1', 'ao3h:filters:y': '2', 'ao3h:other': '3' }),
    });
    const backup = ops.createSelectiveBackup(['READINGLIST']);
    expect(backup.type).toBe('selective');
    expect(backup.data).toEqual({ 'ao3h:readingList:x': '1' });
  });

  it('sans catégorie, garde toutes les données', () => {
    const ops = makeOps({ getAllData: () => ({ a: '1', b: '2' }) });
    expect(ops.createSelectiveBackup([]).data).toEqual({ a: '1', b: '2' });
  });
});

describe('BackupOperations — encrypted backups (AES-GCM/PBKDF2)', () => {
  beforeEach(() => { localStorage.clear(); vi.stubGlobal('confirm', vi.fn(() => true)); });

  it('roundtrip chiffrer → déchiffrer avec le bon mot de passe', async () => {
    const ops = makeOps();
    await ops.createEncryptedBackup('secret');
    localStorage.setItem('ao3h:mod:x:settings', '{"a":2}');

    expect(await ops.restoreEncryptedBackup(0, 'secret')).toBe(true);
    expect(localStorage.getItem('ao3h:mod:x:settings')).toBe('{"a":1}');
  });

  it('échoue avec un mauvais mot de passe', async () => {
    const ops = makeOps();
    await ops.createEncryptedBackup('secret');
    expect(await ops.restoreEncryptedBackup(0, 'wrong')).toBe(false);
  });

  it('createEncryptedBackup exige un mot de passe', async () => {
    const ops = makeOps();
    await expect(ops.createEncryptedBackup()).rejects.toThrow();
  });
});

describe('BackupOperations — compressed backups (gzip)', () => {
  beforeEach(() => { localStorage.clear(); vi.stubGlobal('confirm', vi.fn(() => true)); });

  it('roundtrip compresser → décompresser', async () => {
    const ops = makeOps({ getAllData: () => ({ 'ao3h:x': 'y'.repeat(500) }) });
    await ops.createCompressedBackup();
    localStorage.setItem('ao3h:x', 'changed');

    expect(await ops.restoreCompressedBackup(0)).toBe(true);
    expect(localStorage.getItem('ao3h:x')).toBe('y'.repeat(500));
  });

  it('échoue proprement sur des octets gzip corrompus', async () => {
    const ops = makeOps();
    ops.backups.push({ timestamp: new Date().toISOString(), type: 'compressed', compressed: [1, 2, 3] });
    expect(await ops.restoreCompressedBackup(0)).toBe(false);
  });
});

describe('BackupOperations — incremental backups', () => {
  beforeEach(() => { localStorage.clear(); vi.stubGlobal('confirm', vi.fn(() => true)); });

  it('capture ajouts, modifications et suppressions par rapport au dernier instantané complet', () => {
    /** @type {Record<string, string>} */
    let data = { a: '1', b: '2', c: '3' };
    const ops = makeOps({ getAllData: () => data });
    ops.createBackup(); // base full snapshot

    data = { a: '1', b: '2-modifié', d: '4' };
    const inc = ops.createIncrementalBackup();
    expect(inc.delta).toEqual({ b: '2-modifié', d: '4', c: null });
  });

  it('restoreIncrementalBackup applique le delta (écrit et supprime) sur localStorage', async () => {
    const ops = makeOps();
    ops.backups.push({
      timestamp: new Date().toISOString(),
      type: 'incremental',
      delta: { b: '2', c: null },
    });
    localStorage.setItem('c', '3');

    expect(ops.restoreIncrementalBackup(0)).toBe(true);
    expect(localStorage.getItem('b')).toBe('2');
    expect(localStorage.getItem('c')).toBeNull();
  });
});
