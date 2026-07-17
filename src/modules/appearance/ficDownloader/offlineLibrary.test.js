import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  DEFAULT_WARN_BYTES,
  OfflineLibrary,
  crossedWarnThreshold,
  estimateLibrarySize,
  formatBytes,
} from './offlineLibrary.js';

const STORAGE_KEY = 'ao3h:OfflineReading:library';

beforeEach(() => {
  localStorage.clear();
  document.body.innerHTML = '';
});

describe('OfflineLibrary — stockage', () => {
  it('saveWork enregistre l\'œuvre et retourne true', () => {
    const lib = new OfflineLibrary();
    expect(lib.saveWork('123', 'Titre', 'Auteur', '<p>contenu</p>')).toBe(true);
    expect(lib.isCached('123')).toBe(true);
    expect(lib.getWork('123').title).toBe('Titre');
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY))['123'].author).toBe('Auteur');
  });

  it('removeWork retire l\'œuvre', () => {
    const lib = new OfflineLibrary();
    lib.saveWork('123', 'T', 'A', 'html');
    lib.removeWork('123');
    expect(lib.isCached('123')).toBe(false);
  });
});

describe('OfflineLibrary — avertissement de stockage', () => {
  it('affiche un bandeau quand une sauvegarde franchit le seuil', () => {
    const lib = new OfflineLibrary({ warnBytes: 500 });
    lib.saveWork('1', 'Grosse fic', 'A', 'x'.repeat(1000));
    const warn = document.querySelector('.ao3h-offline-storage-warn');
    expect(warn).not.toBeNull();
    expect(warn.textContent).toContain('close to the browser storage limit');
  });

  it('ne ré-affiche pas le bandeau pour les sauvegardes suivantes déjà au-dessus du seuil', () => {
    const lib = new OfflineLibrary({ warnBytes: 500 });
    lib.saveWork('1', 'Grosse', 'A', 'x'.repeat(1000));
    document.querySelector('.ao3h-offline-storage-warn').remove();

    lib.saveWork('2', 'Encore', 'A', 'y'.repeat(100));
    expect(document.querySelector('.ao3h-offline-storage-warn')).toBeNull();
  });

  it('pas de bandeau sous le seuil', () => {
    const lib = new OfflineLibrary(); // seuil par défaut 4 MB
    lib.saveWork('1', 'Petite', 'A', 'court');
    expect(document.querySelector('.ao3h-offline-storage-warn')).toBeNull();
  });

  it('signale un échec d\'écriture (quota plein) et retourne false', () => {
    const lib = new OfflineLibrary();
    const spy = vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new DOMException('quota', 'QuotaExceededError');
    });

    const ok = lib.saveWork('1', 'Fic', 'A', 'html');
    spy.mockRestore();

    expect(ok).toBe(false);
    expect(lib.isCached('1')).toBe(false);
    const warn = document.querySelector('.ao3h-offline-storage-warn');
    expect(warn).not.toBeNull();
    expect(warn.textContent).toContain('storage is full');
  });

  it('le bouton ✕ ferme le bandeau', () => {
    const lib = new OfflineLibrary({ warnBytes: 10 });
    lib.saveWork('1', 'Fic', 'A', 'x'.repeat(50));
    document.querySelector('.ao3h-offline-storage-warn-close').click();
    expect(document.querySelector('.ao3h-offline-storage-warn')).toBeNull();
  });

  it('cleanup retire le bandeau injecté', () => {
    const lib = new OfflineLibrary({ warnBytes: 10 });
    lib.saveWork('1', 'Fic', 'A', 'x'.repeat(50));
    lib.cleanup();
    expect(document.querySelector('.ao3h-offline-storage-warn')).toBeNull();
  });
});

describe('OfflineLibrary — mesure du stockage', () => {
  it('retourne 0 pour une bibliothèque vide ou invalide', () => {
    expect(estimateLibrarySize({})).toBe('{}'.length * 2);
    expect(estimateLibrarySize(null)).toBe(0);
    expect(estimateLibrarySize(undefined)).toBe(0);
    expect(estimateLibrarySize('nope')).toBe(0);
  });

  it('compte 2 octets par unité de code (UTF-16, comme localStorage)', () => {
    const lib = { 1: { title: 'abc' } };
    expect(estimateLibrarySize(lib)).toBe(JSON.stringify(lib).length * 2);
  });

  it('grandit avec le contenu', () => {
    const small = { 1: { html: 'x'.repeat(10) } };
    const big   = { 1: { html: 'x'.repeat(10000) } };
    expect(estimateLibrarySize(big)).toBeGreaterThan(estimateLibrarySize(small));
  });

  it('détecte uniquement le franchissement du seuil', () => {
    expect(crossedWarnThreshold(90, 110, 100)).toBe(true);
    expect(crossedWarnThreshold(90, 100, 100)).toBe(true);
    expect(crossedWarnThreshold(110, 120, 100)).toBe(false);
    expect(crossedWarnThreshold(10, 50, 100)).toBe(false);
  });

  it('utilise par défaut un seuil de 4 MB', () => {
    expect(DEFAULT_WARN_BYTES).toBe(4 * 1024 * 1024);
    expect(crossedWarnThreshold(0, DEFAULT_WARN_BYTES)).toBe(true);
    expect(crossedWarnThreshold(0, DEFAULT_WARN_BYTES - 1)).toBe(false);
  });

  it('formate les tailles en B, KB et MB', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(2048)).toBe('2.0 KB');
    expect(formatBytes(4 * 1024 * 1024)).toBe('4.0 MB');
    expect(formatBytes(-5)).toBe('0 B');
    expect(formatBytes(NaN)).toBe('0 B');
    expect(formatBytes(Infinity)).toBe('0 B');
  });
});
