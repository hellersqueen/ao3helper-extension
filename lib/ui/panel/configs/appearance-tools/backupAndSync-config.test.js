import { describe, it, expect, beforeEach, vi } from 'vitest';
import { config, wireConfigArea, moduleId } from './backupAndSync-config.js';

const BAS_KEY = 'ao3h:backupAndSync:backups';

function buildContainer() {
  const el = document.createElement('div');
  el.innerHTML = config;
  document.body.appendChild(el);
  return el;
}

function flush() {
  return new Promise((r) => setTimeout(r, 160));
}

beforeEach(() => {
  document.body.innerHTML = '';
  localStorage.clear();
  window.confirm = vi.fn().mockReturnValue(true);
  window.alert = vi.fn();
});

describe('moduleId', () => {
  it('est "backupAndSync"', () => {
    expect(moduleId).toBe('backupAndSync');
  });
});

describe('wireConfigArea — état initial', () => {
  it('affiche "No backups yet" sans données', () => {
    const c = buildContainer();
    wireConfigArea(c);
    expect(c.querySelector('.ao3h-bas-empty').textContent).toContain('No backups yet');
  });
});

describe('wireConfigArea — bouton "Backup Now"', () => {
  it('crée une sauvegarde contenant les clés ao3h: existantes et l\'ajoute à la liste', () => {
    localStorage.setItem('ao3h:mod:hideByTags:settings', '{"enabled":true}');
    localStorage.setItem('unrelated:key', 'should not be included');
    const c = buildContainer();
    wireConfigArea(c);

    c.querySelector('[data-action="backup-now"]').click();

    const stored = JSON.parse(localStorage.getItem(BAS_KEY));
    expect(stored.length).toBe(1);
    expect(stored[0].data['ao3h:mod:hideByTags:settings']).toBe('{"enabled":true}');
    expect(stored[0].data['unrelated:key']).toBeUndefined();
    expect(c.querySelectorAll('.ao3h-bas-row').length).toBe(1);
  });

  it('respecte maxBackups (élague les plus anciennes)', () => {
    const c = buildContainer();
    c.querySelector('[data-setting="maxBackups"]').value = '2';
    wireConfigArea(c);

    const btn = c.querySelector('[data-action="backup-now"]');
    btn.click(); btn.click(); btn.click();

    expect(JSON.parse(localStorage.getItem(BAS_KEY)).length).toBe(2);
  });
});

describe('wireConfigArea — recherche', () => {
  it('filtre les sauvegardes par date affichée', async () => {
    // Dérivé de toLocaleString() plutôt qu'une année codée en dur : le
    // fuseau/la locale du runtime peut décaler la date affichée (ex: UTC
    // minuit peut s'afficher la veille en heure locale).
    const oldTs = new Date('2020-01-01T00:00:00Z').getTime();
    const recentTs = Date.now();
    localStorage.setItem(BAS_KEY, JSON.stringify([
      { timestamp: new Date(recentTs).toISOString(), data: { a: '1' } },
      { timestamp: new Date(oldTs).toISOString(), data: { b: '2' } },
    ]));
    const c = buildContainer();
    wireConfigArea(c);
    expect(c.querySelectorAll('.ao3h-bas-row').length).toBe(2);

    const needle = new Date(oldTs).toLocaleString().slice(0, 6);
    const search = c.querySelector('#ao3h-bas-search');
    search.value = needle;
    search.dispatchEvent(new Event('input'));
    await flush();

    expect(c.querySelectorAll('.ao3h-bas-row').length).toBe(1);
  });
});

describe('wireConfigArea — restaurer', () => {
  it('demande confirmation puis réécrit les clés depuis la sauvegarde', () => {
    localStorage.setItem(BAS_KEY, JSON.stringify([
      { timestamp: new Date().toISOString(), data: { 'ao3h:x': 'restored-value' } },
    ]));
    const c = buildContainer();
    wireConfigArea(c);

    c.querySelector('.ao3h-bas-row-actions button').click(); // Restore = 1er bouton

    expect(window.confirm).toHaveBeenCalled();
    expect(localStorage.getItem('ao3h:x')).toBe('restored-value');
  });

  it('n\'écrit rien si la confirmation est refusée', () => {
    window.confirm.mockReturnValue(false);
    localStorage.setItem(BAS_KEY, JSON.stringify([
      { timestamp: new Date().toISOString(), data: { 'ao3h:x': 'restored-value' } },
    ]));
    const c = buildContainer();
    wireConfigArea(c);

    c.querySelector('.ao3h-bas-row-actions button').click();

    expect(localStorage.getItem('ao3h:x')).toBeNull();
  });
});

describe('wireConfigArea — supprimer une sauvegarde', () => {
  it('retire uniquement la sauvegarde ciblée', () => {
    localStorage.setItem(BAS_KEY, JSON.stringify([
      { timestamp: new Date(2000).toISOString(), data: { a: '1' } },
      { timestamp: new Date(1000).toISOString(), data: { b: '2' } },
    ]));
    const c = buildContainer();
    wireConfigArea(c);

    const rows = c.querySelectorAll('.ao3h-bas-row');
    rows[0].querySelectorAll('.ao3h-bas-row-actions button')[1].click(); // 🗑️ = 2e bouton

    const remaining = JSON.parse(localStorage.getItem(BAS_KEY));
    expect(remaining.length).toBe(1);
    expect(remaining[0].data.b).toBe('2');
  });
});

describe('wireConfigArea — Clear All', () => {
  it('vide toutes les sauvegardes après confirmation', () => {
    localStorage.setItem(BAS_KEY, JSON.stringify([
      { timestamp: new Date().toISOString(), data: { a: '1' } },
    ]));
    const c = buildContainer();
    wireConfigArea(c);

    c.querySelector('[data-action="clear-all-backups"]').click();

    expect(JSON.parse(localStorage.getItem(BAS_KEY))).toEqual([]);
    expect(c.querySelector('.ao3h-bas-empty')).not.toBeNull();
  });

  it('ne fait rien (pas de confirm) si la liste est déjà vide', () => {
    const c = buildContainer();
    wireConfigArea(c);
    c.querySelector('[data-action="clear-all-backups"]').click();
    expect(window.confirm).not.toHaveBeenCalled();
  });
});

describe('wireConfigArea — export', () => {
  it('alerte si aucune sauvegarde à exporter', () => {
    const c = buildContainer();
    wireConfigArea(c);
    c.querySelector('[data-action="export-backup"]').click();
    expect(window.alert).toHaveBeenCalledWith('No backups to export yet.');
  });

  it('ne lève pas d\'exception avec des sauvegardes existantes', () => {
    localStorage.setItem(BAS_KEY, JSON.stringify([{ timestamp: new Date().toISOString(), data: {} }]));
    const c = buildContainer();
    wireConfigArea(c);
    expect(() => c.querySelector('[data-action="export-backup"]').click()).not.toThrow();
    expect(window.alert).not.toHaveBeenCalled();
  });
});

describe('wireConfigArea — double câblage', () => {
  it('n\'attache pas les listeners deux fois (dataset.wired)', () => {
    const c = buildContainer();
    wireConfigArea(c);
    wireConfigArea(c); // 2e appel, ex: réouverture du panneau

    c.querySelector('[data-action="backup-now"]').click();
    expect(JSON.parse(localStorage.getItem(BAS_KEY)).length).toBe(1);
  });
});
