import { describe, it, expect, beforeEach } from 'vitest';
import {
  VERSION_KEY,
  LEGACY_MODULE_RENAMES,
  migrateLegacyModuleSettings,
  runVersionMigrations,
} from './_backupAndSync.js';

beforeEach(() => { localStorage.clear(); });

describe('migrateLegacyModuleSettings', () => {
  it('déplace les réglages d\'un ancien id de module vers le nouveau', () => {
    localStorage.setItem('ao3h:mod:downloadManager:settings', JSON.stringify({ defaultFormat: 'pdf' }));

    const migrated = migrateLegacyModuleSettings(localStorage);

    expect(migrated).toContain('ao3h:mod:downloadManager:settings');
    expect(localStorage.getItem('ao3h:mod:downloadManager:settings')).toBeNull();
    expect(JSON.parse(localStorage.getItem('ao3h:mod:ficDownloader:settings'))).toEqual({ defaultFormat: 'pdf' });
  });

  it('les réglages déjà présents sous le nouvel id gagnent sur les anciens', () => {
    localStorage.setItem('ao3h:mod:downloadManager:settings', JSON.stringify({ defaultFormat: 'pdf', kindleEmail: 'old@kindle.com' }));
    localStorage.setItem('ao3h:mod:ficDownloader:settings', JSON.stringify({ defaultFormat: 'epub' }));

    migrateLegacyModuleSettings(localStorage);

    const merged = JSON.parse(localStorage.getItem('ao3h:mod:ficDownloader:settings'));
    expect(merged.defaultFormat).toBe('epub');          // valeur actuelle conservée
    expect(merged.kindleEmail).toBe('old@kindle.com');  // valeur legacy récupérée
  });

  it('fusionne deux anciens ids pointant vers le même module (laterShelf)', () => {
    localStorage.setItem('ao3h:mod:markedForLaterManager:settings', JSON.stringify({ a: 1 }));
    localStorage.setItem('ao3h:mod:workReminder:settings', JSON.stringify({ b: 2 }));

    migrateLegacyModuleSettings(localStorage);

    const merged = JSON.parse(localStorage.getItem('ao3h:mod:laterShelf:settings'));
    expect(merged).toEqual({ a: 1, b: 2 });
    expect(localStorage.getItem('ao3h:mod:markedForLaterManager:settings')).toBeNull();
    expect(localStorage.getItem('ao3h:mod:workReminder:settings')).toBeNull();
  });

  it('supprime une clé legacy au JSON corrompu sans rien copier', () => {
    localStorage.setItem('ao3h:mod:bookmarkManager:settings', '{oops');

    const migrated = migrateLegacyModuleSettings(localStorage);

    expect(migrated).toContain('ao3h:mod:bookmarkManager:settings');
    expect(localStorage.getItem('ao3h:mod:bookmarkManager:settings')).toBeNull();
    expect(localStorage.getItem('ao3h:mod:bookmarkVault:settings')).toBeNull();
  });

  it('ne touche à rien quand aucune clé legacy n\'existe', () => {
    localStorage.setItem('ao3h:mod:ficDownloader:settings', JSON.stringify({ x: 1 }));
    expect(migrateLegacyModuleSettings(localStorage)).toEqual([]);
    expect(JSON.parse(localStorage.getItem('ao3h:mod:ficDownloader:settings'))).toEqual({ x: 1 });
  });

  it('couvre tous les renommages documentés dans les configs du panneau', () => {
    expect(Object.keys(LEGACY_MODULE_RENAMES).length).toBeGreaterThanOrEqual(10);
  });
});

describe('runVersionMigrations', () => {
  it('exécute les migrations au changement de version et enregistre la version', () => {
    localStorage.setItem(VERSION_KEY, '1.0.0');
    localStorage.setItem('ao3h:mod:paginationManager:settings', JSON.stringify({ p: 1 }));

    const result = runVersionMigrations('1.2.3', localStorage);

    expect(result.ran).toBe(true);
    expect(result.from).toBe('1.0.0');
    expect(result.to).toBe('1.2.3');
    expect(result.migrated).toContain('ao3h:mod:paginationManager:settings');
    expect(localStorage.getItem(VERSION_KEY)).toBe('1.2.3');
    expect(JSON.parse(localStorage.getItem('ao3h:mod:pageControls:settings'))).toEqual({ p: 1 });
  });

  it('s\'exécute aussi au tout premier lancement (aucune version enregistrée)', () => {
    const result = runVersionMigrations('1.2.3', localStorage);
    expect(result.ran).toBe(true);
    expect(result.from).toBeNull();
    expect(localStorage.getItem(VERSION_KEY)).toBe('1.2.3');
  });

  it('ne refait rien quand la version n\'a pas changé', () => {
    runVersionMigrations('1.2.3', localStorage);
    localStorage.setItem('ao3h:mod:downloadManager:settings', JSON.stringify({ y: 2 }));

    const result = runVersionMigrations('1.2.3', localStorage);

    expect(result.ran).toBe(false);
    // La clé legacy n'est pas touchée tant que la version ne change pas
    expect(localStorage.getItem('ao3h:mod:downloadManager:settings')).not.toBeNull();
  });
});
