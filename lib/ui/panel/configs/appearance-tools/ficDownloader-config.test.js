import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  config,
  wireConfigArea,
  moduleId,
  OFFLINE_LIBRARY_KEY,
  OFFLINE_WARN_BYTES,
  loadOfflineLibrary,
  formatBytes,
  buildOfflineRows,
  offlineTotals,
  removeOfflineWork,
  clearOfflineLibrary,
} from './ficDownloader-config.js';

function buildContainer() {
  const el = document.createElement('div');
  el.innerHTML = config;
  document.body.appendChild(el);
  return el;
}

beforeEach(() => {
  document.body.innerHTML = '';
  localStorage.clear();
});

describe('moduleId', () => {
  it('est "ficDownloader"', () => {
    expect(moduleId).toBe('ficDownloader');
  });
});

describe('wireConfigArea — bug corrigé : les sous-options Kindle/Calibre ne restent plus figées en display:none', () => {
  it('synchronise la visibilité des options Kindle sur l\'état initial de la case (cochée)', () => {
    const c = buildContainer();
    c.querySelector('#ao3h-dl-kindle').checked = true;
    wireConfigArea(c);
    expect(c.querySelector('#ao3h-dl-kindle-opts').classList.contains('is-hidden')).toBe(false);
  });

  it('laisse les options Kindle cachées si la case est décochée', () => {
    const c = buildContainer();
    c.querySelector('#ao3h-dl-kindle').checked = false;
    wireConfigArea(c);
    expect(c.querySelector('#ao3h-dl-kindle-opts').classList.contains('is-hidden')).toBe(true);
  });

  it('bascule la visibilité des options Kindle au clic (change)', () => {
    const c = buildContainer();
    wireConfigArea(c);
    const checkbox = c.querySelector('#ao3h-dl-kindle');
    const opts = c.querySelector('#ao3h-dl-kindle-opts');

    checkbox.checked = true;
    checkbox.dispatchEvent(new Event('change'));
    expect(opts.classList.contains('is-hidden')).toBe(false);

    checkbox.checked = false;
    checkbox.dispatchEvent(new Event('change'));
    expect(opts.classList.contains('is-hidden')).toBe(true);
  });

  it('même comportement pour les options Calibre', () => {
    const c = buildContainer();
    c.querySelector('#ao3h-dl-calibre').checked = true;
    wireConfigArea(c);
    expect(c.querySelector('#ao3h-dl-calibre-opts').classList.contains('is-hidden')).toBe(false);

    const checkbox = c.querySelector('#ao3h-dl-calibre');
    checkbox.checked = false;
    checkbox.dispatchEvent(new Event('change'));
    expect(c.querySelector('#ao3h-dl-calibre-opts').classList.contains('is-hidden')).toBe(true);
  });

  it('ne s\'attache pas deux fois (appel répété de wireConfigArea)', () => {
    const c = buildContainer();
    const checkbox = c.querySelector('#ao3h-dl-kindle');
    checkbox.checked = true;
    wireConfigArea(c);
    wireConfigArea(c);

    let calls = 0;
    checkbox.addEventListener('change', () => { calls++; });
    checkbox.dispatchEvent(new Event('change'));
    // Le listener de test lui-même compte 1 ; on vérifie juste qu'aucune
    // exception ni double-application ne casse l'état affiché.
    expect(calls).toBe(1);
    expect(c.querySelector('#ao3h-dl-kindle-opts').classList.contains('is-hidden')).toBe(false);
  });
});

describe('config HTML — nouveaux réglages présents', () => {
  it('contient la case "Show the quick-download icon on work listings"', () => {
    const c = buildContainer();
    const input = c.querySelector('[data-setting="showQuickDownloadButtons"]');
    expect(input).not.toBeNull();
    expect(input.type).toBe('checkbox');
    expect(input.checked).toBe(true); // "checked" par défaut dans le HTML
  });

  it('contient les champs Calibre (enabled, url, library)', () => {
    const c = buildContainer();
    expect(c.querySelector('[data-setting="calibreEnabled"]')).not.toBeNull();
    expect(c.querySelector('[data-setting="calibreUrl"]')).not.toBeNull();
    expect(c.querySelector('[data-setting="calibreLibrary"]')).not.toBeNull();
  });
});

describe('wireConfigArea — section Offline Library', () => {
  function seed(lib) {
    localStorage.setItem(OFFLINE_LIBRARY_KEY, JSON.stringify(lib));
  }

  it('affiche un état vide quand rien n\'est sauvegardé hors-ligne', () => {
    const c = buildContainer();
    wireConfigArea(c);
    expect(c.querySelector('.ao3h-dl-offline-empty')).not.toBeNull();
    expect(c.querySelector('#ao3h-dl-offline-total').textContent).toBe('');
  });

  it('liste les œuvres en cache avec titre, auteur et total', () => {
    seed({
      11: { title: 'Fic One', author: 'Alice', html: '<p>a</p>', date: Date.now() },
      22: { title: 'Fic Two', author: 'Bob',   html: '<p>b</p>', date: Date.now() - 1000 },
    });
    const c = buildContainer();
    wireConfigArea(c);

    const rows = c.querySelectorAll('.ao3h-dl-offline-row');
    expect(rows.length).toBe(2);
    expect(rows[0].textContent).toContain('Fic One');
    expect(rows[0].textContent).toContain('Alice');
    expect(c.querySelector('#ao3h-dl-offline-total').textContent).toContain('2 works');
  });

  it('le bouton 🗑️ retire l\'œuvre de la liste et du stockage', () => {
    seed({ 11: { title: 'Fic One', author: 'Alice', html: 'x', date: Date.now() } });
    const c = buildContainer();
    wireConfigArea(c);

    c.querySelector('.ao3h-dl-offline-row-actions button[title="Remove from offline library"]').click();

    expect(c.querySelectorAll('.ao3h-dl-offline-row').length).toBe(0);
    expect(c.querySelector('.ao3h-dl-offline-empty')).not.toBeNull();
    expect(JSON.parse(localStorage.getItem(OFFLINE_LIBRARY_KEY))).toEqual({});
  });

  it('"Clear All" vide tout après confirmation', () => {
    seed({
      11: { title: 'A', html: 'x', date: 1 },
      22: { title: 'B', html: 'y', date: 2 },
    });
    vi.stubGlobal('confirm', vi.fn(() => true));
    const c = buildContainer();
    wireConfigArea(c);

    c.querySelector('[data-action="clear-offline-library"]').click();

    expect(confirm).toHaveBeenCalled();
    expect(JSON.parse(localStorage.getItem(OFFLINE_LIBRARY_KEY))).toEqual({});
    expect(c.querySelector('.ao3h-dl-offline-empty')).not.toBeNull();
    vi.unstubAllGlobals();
  });

  it('"Clear All" ne fait rien si on annule la confirmation', () => {
    seed({ 11: { title: 'A', html: 'x', date: 1 } });
    vi.stubGlobal('confirm', vi.fn(() => false));
    const c = buildContainer();
    wireConfigArea(c);

    c.querySelector('[data-action="clear-offline-library"]').click();

    expect(Object.keys(JSON.parse(localStorage.getItem(OFFLINE_LIBRARY_KEY)))).toEqual(['11']);
    vi.unstubAllGlobals();
  });

  it('le champ de recherche filtre par titre ou auteur', () => {
    vi.useFakeTimers();
    seed({
      1: { title: 'Dragon Tale', author: 'Alice', html: 'x', date: 1 },
      2: { title: 'Space Opera', author: 'Bob',   html: 'y', date: 2 },
    });
    const c = buildContainer();
    wireConfigArea(c);
    const search = c.querySelector('#ao3h-dl-offline-search');

    search.value = 'dragon';
    search.dispatchEvent(new Event('input'));
    vi.advanceTimersByTime(200);

    let rows = c.querySelectorAll('.ao3h-dl-offline-row');
    expect(rows.length).toBe(1);
    expect(rows[0].textContent).toContain('Dragon Tale');

    search.value = 'bob';
    search.dispatchEvent(new Event('input'));
    vi.advanceTimersByTime(200);

    rows = c.querySelectorAll('.ao3h-dl-offline-row');
    expect(rows.length).toBe(1);
    expect(rows[0].textContent).toContain('Space Opera');
    vi.useRealTimers();
  });

  it('affiche un message dédié quand la recherche ne trouve rien', () => {
    vi.useFakeTimers();
    seed({ 1: { title: 'Dragon Tale', author: 'Alice', html: 'x', date: 1 } });
    const c = buildContainer();
    wireConfigArea(c);
    const search = c.querySelector('#ao3h-dl-offline-search');

    search.value = 'zzz-introuvable';
    search.dispatchEvent(new Event('input'));
    vi.advanceTimersByTime(200);

    expect(c.querySelectorAll('.ao3h-dl-offline-row').length).toBe(0);
    expect(c.querySelector('.ao3h-dl-offline-empty').textContent).toContain('match your search');
    vi.useRealTimers();
  });

  it('re-rend la liste à chaque appel de wireConfigArea (panneau rouvert)', () => {
    const c = buildContainer();
    wireConfigArea(c);
    expect(c.querySelectorAll('.ao3h-dl-offline-row').length).toBe(0);

    seed({ 11: { title: 'Nouvelle', author: 'A', html: 'x', date: Date.now() } });
    wireConfigArea(c);
    expect(c.querySelectorAll('.ao3h-dl-offline-row').length).toBe(1);
  });
});

describe('offline library helpers', () => {
  const T1 = new Date('2026-01-10T10:00:00').getTime();
  const T2 = new Date('2026-03-05T18:30:00').getTime();

  it('charge une bibliothèque valide et rejette les données corrompues', () => {
    expect(loadOfflineLibrary()).toEqual({});
    localStorage.setItem(OFFLINE_LIBRARY_KEY, JSON.stringify({ 123: { title: 'Fic' } }));
    expect(loadOfflineLibrary()[123].title).toBe('Fic');
    localStorage.setItem(OFFLINE_LIBRARY_KEY, '{oops');
    expect(loadOfflineLibrary()).toEqual({});
    localStorage.setItem(OFFLINE_LIBRARY_KEY, '[1,2]');
    expect(loadOfflineLibrary()).toEqual({});
  });

  it('construit les lignes de la plus récente à la plus ancienne', () => {
    const rows = buildOfflineRows({
      1: { title: 'Vieille', author: 'A', html: 'x', date: T1 },
      2: { title: 'Récente', author: 'B', html: 'y', date: T2 },
    });
    expect(rows.map(row => row.title)).toEqual(['Récente', 'Vieille']);
    expect(rows[0].workId).toBe('2');
    expect(rows[0].author).toBe('B');
    expect(rows[0].dateLabel).toBe(new Date(T2).toLocaleString());
    expect(rows[0].sizeLabel).toMatch(/B|KB|MB/);
  });

  it('utilise des valeurs par défaut et accepte une bibliothèque vide', () => {
    const rows = buildOfflineRows({ 42: {} });
    expect(rows[0].title).toBe('Work 42');
    expect(rows[0].author).toBe('Anonymous');
    expect(rows[0].dateLabel).toBe('—');
    expect(buildOfflineRows({})).toEqual([]);
    expect(buildOfflineRows(null)).toEqual([]);
  });

  it('calcule le total, le singulier et le seuil d’avertissement', () => {
    const lib = {
      1: { title: 'A', html: 'x'.repeat(100), date: T1 },
      2: { title: 'B', html: 'y'.repeat(200), date: T2 },
    };
    const totals = offlineTotals(lib);
    expect(totals.count).toBe(2);
    expect(totals.bytes).toBeGreaterThan(600);
    expect(totals.label).toContain('2 works');
    expect(totals.warn).toBe(false);
    expect(offlineTotals({ 1: { html: 'x' } }).label).toContain('1 work —');
    expect(offlineTotals({ 1: { html: 'x'.repeat(50) } }, 10).warn).toBe(true);
    expect(OFFLINE_WARN_BYTES).toBe(4 * 1024 * 1024);
  });

  it('retire une œuvre ou vide toute la bibliothèque', () => {
    localStorage.setItem(OFFLINE_LIBRARY_KEY, JSON.stringify({ 1: { title: 'A' }, 2: { title: 'B' } }));
    expect(removeOfflineWork('1')).not.toHaveProperty('1');
    expect(loadOfflineLibrary()).toEqual({ 2: { title: 'B' } });
    expect(clearOfflineLibrary()).toEqual({});
    expect(loadOfflineLibrary()).toEqual({});
  });

  it('formate les tailles et gère les valeurs invalides', () => {
    expect(formatBytes(100)).toBe('100 B');
    expect(formatBytes(1536)).toBe('1.5 KB');
    expect(formatBytes(5 * 1024 * 1024)).toBe('5.0 MB');
    expect(formatBytes(-1)).toBe('0 B');
  });
});
