import { describe, it, expect, beforeEach, vi } from 'vitest';
import { config, wireConfigArea, moduleId } from './backupAndSync-config.js';
import { BackupOperations } from '../../../../../src/modules/appearance/backupAndSync/_backupAndSync.js';

const BAS_KEY = 'ao3h:backupAndSync:backups';

// Installs a real BackupOperations instance (the same class the live module
// uses) behind window.AO3H.backupAndSync, seeded from whatever the test has
// already put in localStorage. Create/restore now delegate to this instead
// of duplicating the encryption/compression/delta logic in the panel.
function installBackupAndSyncAPI({ maxBackups = 50 } = {}) {
  const ops = new BackupOperations({
    maxBackups,
    backups: JSON.parse(localStorage.getItem(BAS_KEY) || '[]'),
    getAllData: () => {
      const data = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('ao3h') || key.includes('AO3H')) && key !== BAS_KEY) {
          data[key] = localStorage.getItem(key);
        }
      }
      return data;
    },
    onBackupCreated: (backups) => {
      try { localStorage.setItem(BAS_KEY, JSON.stringify(backups)); } catch {}
    },
  });
  window.AO3H = {
    ...(window.AO3H || {}),
    backupAndSync: {
      createBackup:             () => ops.createBackup(),
      getBackups:               () => ops.getBackups(),
      restoreBackup:            (i) => ops.restoreBackup(i),
      createSelectiveBackup:    (categories) => ops.createSelectiveBackup(categories),
      createEncryptedBackup:    (password) => ops.createEncryptedBackup(password),
      restoreEncryptedBackup:   (i, password) => ops.restoreEncryptedBackup(i, password),
      createCompressedBackup:   () => ops.createCompressedBackup(),
      restoreCompressedBackup:  (i) => ops.restoreCompressedBackup(i),
      createIncrementalBackup:  () => ops.createIncrementalBackup(),
      restoreIncrementalBackup: (i) => ops.restoreIncrementalBackup(i),
    },
  };
  return ops;
}

function buildContainer(apiOpts) {
  installBackupAndSyncAPI(apiOpts);
  const el = document.createElement('div');
  el.innerHTML = config;
  document.body.appendChild(el);
  return el;
}

function flush() {
  return new Promise((r) => setTimeout(r, 160));
}

// Laisse les handlers async (Backup Now, Restore) terminer leur microtâche.
function tick() {
  return new Promise((r) => setTimeout(r, 0));
}

beforeEach(() => {
  document.body.innerHTML = '';
  localStorage.clear();
  delete window.AO3H;
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

describe('wireConfigArea — module Backup & Sync désactivé', () => {
  it('"Backup Now" alerte et ne crée rien', async () => {
    // Pas d'appel à buildContainer() ici : window.AO3H reste absent.
    const el = document.createElement('div');
    el.innerHTML = config;
    document.body.appendChild(el);
    wireConfigArea(el);

    el.querySelector('[data-action="backup-now"]').click();
    await tick();

    expect(window.alert).toHaveBeenCalledWith('Enable the Backup & Sync module to create backups.');
    expect(localStorage.getItem(BAS_KEY)).toBeNull();
  });

  it('la liste reste consultable (lecture directe de localStorage)', () => {
    localStorage.setItem(BAS_KEY, JSON.stringify([
      { timestamp: new Date().toISOString(), data: { a: '1' } },
    ]));
    const el = document.createElement('div');
    el.innerHTML = config;
    document.body.appendChild(el);
    wireConfigArea(el);

    expect(el.querySelectorAll('.ao3h-bas-row').length).toBe(1);
  });

  it('"Restore" alerte et ne modifie rien', async () => {
    localStorage.setItem(BAS_KEY, JSON.stringify([
      { timestamp: new Date().toISOString(), data: { 'ao3h:x': 'value' } },
    ]));
    const el = document.createElement('div');
    el.innerHTML = config;
    document.body.appendChild(el);
    wireConfigArea(el);

    el.querySelector('.ao3h-bas-row-actions button').click();
    await tick();

    expect(window.alert).toHaveBeenCalledWith('Enable the Backup & Sync module to restore backups.');
    expect(localStorage.getItem('ao3h:x')).toBeNull();
  });
});

describe('wireConfigArea — bouton "Backup Now"', () => {
  it('crée une sauvegarde contenant les clés ao3h: existantes et l\'ajoute à la liste', async () => {
    localStorage.setItem('ao3h:mod:hideByTags:settings', '{"enabled":true}');
    localStorage.setItem('unrelated:key', 'should not be included');
    const c = buildContainer();
    wireConfigArea(c);

    c.querySelector('[data-action="backup-now"]').click();
    await tick();

    const stored = JSON.parse(localStorage.getItem(BAS_KEY));
    expect(stored.length).toBe(1);
    expect(stored[0].data['ao3h:mod:hideByTags:settings']).toBe('{"enabled":true}');
    expect(stored[0].data['unrelated:key']).toBeUndefined();
    expect(c.querySelectorAll('.ao3h-bas-row').length).toBe(1);
  });

  it('respecte maxBackups du module (élague les plus anciennes)', async () => {
    const c = buildContainer({ maxBackups: 2 });
    wireConfigArea(c);

    const btn = c.querySelector('[data-action="backup-now"]');
    btn.click(); await tick();
    btn.click(); await tick();
    btn.click(); await tick();

    expect(JSON.parse(localStorage.getItem(BAS_KEY)).length).toBe(2);
  });
});

describe('wireConfigArea — modes de sauvegarde', () => {
  it('le HTML contient le sélecteur de mode et le champ catégories', () => {
    const c = buildContainer();
    const mode = c.querySelector('#ao3h-bas-mode');
    expect(mode).not.toBeNull();
    const values = [...mode.querySelectorAll('option')].map(o => o.value);
    expect(values).toEqual(['standard', 'compressed', 'encrypted', 'incremental']);
    expect(c.querySelector('#ao3h-bas-categories')).not.toBeNull();
  });

  it('mode compressé : crée une sauvegarde gzip restaurable', async () => {
    localStorage.setItem('ao3h:x', 'valeur-compressée');
    const c = buildContainer();
    wireConfigArea(c);
    c.querySelector('#ao3h-bas-mode').value = 'compressed';

    c.querySelector('[data-action="backup-now"]').click();
    await vi.waitFor(() => {
      expect(JSON.parse(localStorage.getItem(BAS_KEY) || '[]').length).toBe(1);
    });

    const stored = JSON.parse(localStorage.getItem(BAS_KEY));
    expect(stored[0].type).toBe('compressed');
    expect(Array.isArray(stored[0].compressed)).toBe(true);

    // Restore : décompresse et réécrit les clés
    localStorage.removeItem('ao3h:x');
    await vi.waitFor(() => expect(c.querySelector('.ao3h-bas-row')).not.toBeNull());
    c.querySelector('.ao3h-bas-row-actions button').click();
    await vi.waitFor(() => expect(localStorage.getItem('ao3h:x')).toBe('valeur-compressée'));
  });

  it('mode chiffré : mot de passe demandé, sauvegarde chiffrée puis restaurable', async () => {
    window.prompt = vi.fn().mockReturnValue('mon-mdp');
    localStorage.setItem('ao3h:x', 'secret-value');
    const c = buildContainer();
    wireConfigArea(c);
    c.querySelector('#ao3h-bas-mode').value = 'encrypted';

    c.querySelector('[data-action="backup-now"]').click();
    await vi.waitFor(() => {
      expect(JSON.parse(localStorage.getItem(BAS_KEY) || '[]').length).toBe(1);
    });

    const stored = JSON.parse(localStorage.getItem(BAS_KEY));
    expect(stored[0].type).toBe('encrypted');
    expect(stored[0].data).toBeUndefined(); // rien en clair
    expect(Array.isArray(stored[0].ciphertext)).toBe(true);

    localStorage.removeItem('ao3h:x');
    await vi.waitFor(() => expect(c.querySelector('.ao3h-bas-row')).not.toBeNull());
    c.querySelector('.ao3h-bas-row-actions button').click(); // Restore → prompt du mdp
    await vi.waitFor(() => expect(localStorage.getItem('ao3h:x')).toBe('secret-value'));
  });

  it('mode chiffré : mauvais mot de passe à la restauration alerte et n\'écrit rien', async () => {
    window.prompt = vi.fn().mockReturnValue('mon-mdp');
    localStorage.setItem('ao3h:x', 'secret-value');
    const c = buildContainer();
    wireConfigArea(c);
    c.querySelector('#ao3h-bas-mode').value = 'encrypted';

    c.querySelector('[data-action="backup-now"]').click();
    await vi.waitFor(() => {
      expect(JSON.parse(localStorage.getItem(BAS_KEY) || '[]').length).toBe(1);
    });

    localStorage.removeItem('ao3h:x');
    window.prompt = vi.fn().mockReturnValue('mauvais-mdp');
    await vi.waitFor(() => expect(c.querySelector('.ao3h-bas-row')).not.toBeNull());
    c.querySelector('.ao3h-bas-row-actions button').click();
    await vi.waitFor(() => expect(window.alert).toHaveBeenCalledWith('Decryption failed — wrong password or corrupt backup.'));
    expect(localStorage.getItem('ao3h:x')).toBeNull();
  });

  it('mode chiffré : annuler le mot de passe ne crée rien', async () => {
    window.prompt = vi.fn().mockReturnValue(null);
    const c = buildContainer();
    wireConfigArea(c);
    c.querySelector('#ao3h-bas-mode').value = 'encrypted';

    c.querySelector('[data-action="backup-now"]').click();
    await flush();

    expect(localStorage.getItem(BAS_KEY)).toBeNull();
  });

  it('mode incrémental : ne stocke que le delta depuis le dernier instantané complet', async () => {
    localStorage.setItem('ao3h:stable', 'same');
    localStorage.setItem(BAS_KEY, JSON.stringify([
      { timestamp: new Date().toISOString(), data: { 'ao3h:stable': 'same', 'ao3h:old': 'gone' } },
    ]));
    localStorage.setItem('ao3h:new', 'added');
    const c = buildContainer();
    wireConfigArea(c);
    c.querySelector('#ao3h-bas-mode').value = 'incremental';

    c.querySelector('[data-action="backup-now"]').click();
    await tick();

    const stored = JSON.parse(localStorage.getItem(BAS_KEY));
    expect(stored[0].type).toBe('incremental');
    expect(stored[0].delta['ao3h:new']).toBe('added');
    expect(stored[0].delta['ao3h:old']).toBeNull();   // suppression capturée
    expect(stored[0].delta['ao3h:stable']).toBeUndefined(); // inchangé = absent
  });

  it('mode incrémental : restaurer applique le delta (écrit et supprime)', async () => {
    localStorage.setItem(BAS_KEY, JSON.stringify([
      { timestamp: new Date().toISOString(), type: 'incremental', delta: { 'ao3h:x': 'from-delta', 'ao3h:old': null } },
    ]));
    localStorage.setItem('ao3h:old', 'should-be-removed');
    const c = buildContainer();
    wireConfigArea(c);

    c.querySelector('.ao3h-bas-row-actions button').click();
    await tick();

    expect(localStorage.getItem('ao3h:x')).toBe('from-delta');
    expect(localStorage.getItem('ao3h:old')).toBeNull();
  });

  it('catégories renseignées : la sauvegarde devient sélective et ne garde que les clés correspondantes', async () => {
    localStorage.setItem('ao3h:readingList:a', '1');
    localStorage.setItem('ao3h:filters:b', '2');
    const c = buildContainer();
    wireConfigArea(c);
    c.querySelector('#ao3h-bas-categories').value = 'readingList';

    c.querySelector('[data-action="backup-now"]').click();
    await tick();

    const stored = JSON.parse(localStorage.getItem(BAS_KEY));
    expect(stored[0].type).toBe('selective');
    expect(stored[0].categories).toEqual(['readingList']);
    expect(stored[0].data['ao3h:readingList:a']).toBe('1');
    expect(stored[0].data['ao3h:filters:b']).toBeUndefined();
  });
});

describe('wireConfigArea — état d\'intégrité des sauvegardes', () => {
  it('affiche ✓ pour une sauvegarde valide et ⚠️ pour une corrompue', () => {
    localStorage.setItem(BAS_KEY, JSON.stringify([
      { timestamp: new Date().toISOString(), data: { a: '1' } },
      { timestamp: new Date().toISOString(), data: { a: 42 } }, // valeurs non-string = corrompu
    ]));
    const c = buildContainer();
    wireConfigArea(c);

    const statuses = c.querySelectorAll('.ao3h-bas-row-status');
    expect(statuses.length).toBe(2);
    expect(statuses[0].textContent).toBe('✓');
    expect(statuses[1].textContent).toBe('⚠️');
    expect(statuses[1].classList.contains('ao3h-bas-row-status--bad')).toBe(true);
  });

  it('refuse de restaurer une sauvegarde corrompue (alerte, rien d\'écrit)', async () => {
    localStorage.setItem(BAS_KEY, JSON.stringify([
      { timestamp: new Date().toISOString(), data: { 'ao3h:x': 42 } },
    ]));
    const c = buildContainer();
    wireConfigArea(c);

    c.querySelector('.ao3h-bas-row-actions button').click();
    await tick();

    expect(window.alert).toHaveBeenCalled();
    expect(localStorage.getItem('ao3h:x')).toBeNull();
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

  it('filtre aussi par contenu (noms de clés dans la sauvegarde)', async () => {
    localStorage.setItem(BAS_KEY, JSON.stringify([
      { timestamp: new Date().toISOString(), data: { 'ao3h:mod:hideByTags:settings': '{}' } },
      { timestamp: new Date().toISOString(), data: { 'ao3h:readingList': '[]' } },
    ]));
    const c = buildContainer();
    wireConfigArea(c);

    const search = c.querySelector('#ao3h-bas-search');
    search.value = 'hidebytags';
    search.dispatchEvent(new Event('input'));
    await flush();

    expect(c.querySelectorAll('.ao3h-bas-row').length).toBe(1);
  });
});

describe('wireConfigArea — restaurer', () => {
  it('demande confirmation puis réécrit les clés depuis la sauvegarde', async () => {
    localStorage.setItem(BAS_KEY, JSON.stringify([
      { timestamp: new Date().toISOString(), data: { 'ao3h:x': 'restored-value' } },
    ]));
    const c = buildContainer();
    wireConfigArea(c);

    c.querySelector('.ao3h-bas-row-actions button').click(); // Restore = 1er bouton
    await tick();

    expect(window.confirm).toHaveBeenCalled();
    expect(localStorage.getItem('ao3h:x')).toBe('restored-value');
  });

  it('n\'écrit rien si la confirmation est refusée', async () => {
    window.confirm.mockReturnValue(false);
    localStorage.setItem(BAS_KEY, JSON.stringify([
      { timestamp: new Date().toISOString(), data: { 'ao3h:x': 'restored-value' } },
    ]));
    const c = buildContainer();
    wireConfigArea(c);

    c.querySelector('.ao3h-bas-row-actions button').click();
    await tick();

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

  it('reste cohérent avec une restauration suivante (index aligné avec le module)', async () => {
    localStorage.setItem(BAS_KEY, JSON.stringify([
      { timestamp: new Date(3000).toISOString(), data: { a: '1' } },
      { timestamp: new Date(2000).toISOString(), data: { b: '2' } },
      { timestamp: new Date(1000).toISOString(), data: { 'ao3h:c': '3' } },
    ]));
    const c = buildContainer();
    wireConfigArea(c);

    // Supprime la première ligne (la plus récente), puis restaure ce qui est
    // maintenant la 2e ligne affichée — doit bien restaurer la sauvegarde "c",
    // pas "b", même si le module garde son propre tableau en mémoire.
    const rows = () => c.querySelectorAll('.ao3h-bas-row');
    rows()[0].querySelectorAll('.ao3h-bas-row-actions button')[1].click(); // supprime "a"
    rows()[1].querySelectorAll('.ao3h-bas-row-actions button')[0].click(); // restaure "c"
    await tick();

    expect(localStorage.getItem('ao3h:c')).toBe('3');
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
  it('n\'attache pas les listeners deux fois (dataset.wired)', async () => {
    const c = buildContainer();
    wireConfigArea(c);
    wireConfigArea(c); // 2e appel, ex: réouverture du panneau

    c.querySelector('[data-action="backup-now"]').click();
    await tick();
    expect(JSON.parse(localStorage.getItem(BAS_KEY)).length).toBe(1);
  });
});
