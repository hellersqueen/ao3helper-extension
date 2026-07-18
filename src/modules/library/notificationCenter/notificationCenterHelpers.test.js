import { describe, it, expect } from 'vitest';
import {
  bucketLabel, groupByBucket, computePriority, isSnoozed, snoozeUntil,
  periodKey, buildDigest, parseSubscribedWorkIds,
} from './notificationCenterHelpers.js';

const DAY = 24 * 60 * 60 * 1000;
const NOW = new Date('2026-07-17T12:00:00').getTime();

describe('bucketLabel', () => {
  it('classe aujourd’hui, hier, cette semaine et plus ancien', () => {
    expect(bucketLabel(NOW, NOW)).toBe('Today');
    expect(bucketLabel(NOW - DAY, NOW)).toBe('Yesterday');
    expect(bucketLabel(NOW - 5 * DAY, NOW)).toBe('This week');
    expect(bucketLabel(NOW - 30 * DAY, NOW)).toBe('Older');
  });
});

describe('groupByBucket', () => {
  it('regroupe et ordonne les éléments par période, en omettant les groupes vides', () => {
    const items = [
      { wid: '1', ts: NOW },
      { wid: '2', ts: NOW - DAY },
      { wid: '3', ts: NOW - 30 * DAY },
    ];
    const groups = groupByBucket(items, NOW);
    expect(groups.map((g) => g.label)).toEqual(['Today', 'Yesterday', 'Older']);
    expect(groups[0].items).toEqual([items[0]]);
  });
});

describe('computePriority', () => {
  it('est "high" quand l’œuvre vient d’être terminée', () => {
    expect(computePriority({ completedNow: true, delta: 1 })).toBe('high');
  });

  it('est "high" pour un gros saut de chapitres même sans complétion', () => {
    expect(computePriority({ completedNow: false, delta: 3 })).toBe('high');
  });

  it('est "normal" pour une petite mise à jour', () => {
    expect(computePriority({ completedNow: false, delta: 1 })).toBe('normal');
  });
});

describe('isSnoozed / snoozeUntil', () => {
  it('détecte un item encore en sommeil', () => {
    expect(isSnoozed({ snoozedUntil: NOW + 1000 }, NOW)).toBe(true);
  });

  it('détecte un item dont le sommeil est expiré', () => {
    expect(isSnoozed({ snoozedUntil: NOW - 1000 }, NOW)).toBe(false);
  });

  it('n’est pas en sommeil sans snoozedUntil', () => {
    expect(isSnoozed({}, NOW)).toBe(false);
  });

  it('snoozeUntil ajoute le bon nombre d’heures', () => {
    expect(snoozeUntil(24, NOW)).toBe(NOW + 24 * 60 * 60 * 1000);
  });
});

describe('periodKey', () => {
  it('donne la même clé journalière pour deux horodatages du même jour', () => {
    expect(periodKey(NOW, 'daily')).toBe(periodKey(NOW + 3600_000, 'daily'));
  });

  it('donne des clés journalières différentes pour deux jours différents', () => {
    expect(periodKey(NOW, 'daily')).not.toBe(periodKey(NOW + DAY, 'daily'));
  });

  it('donne la même clé hebdomadaire pour deux jours de la même fenêtre de 7 jours', () => {
    expect(periodKey(NOW, 'weekly')).toBe(periodKey(NOW + 2 * DAY, 'weekly'));
  });
});

describe('buildDigest', () => {
  it('retourne null quand le mode n’est pas daily/weekly', () => {
    expect(buildDigest([], 'off')).toBeNull();
    expect(buildDigest([], undefined)).toBeNull();
  });

  it('agrège les mises à jour par jour', () => {
    const items = [
      { wid: '1', ts: NOW, completedNow: false },
      { wid: '1', ts: NOW - 3600_000, completedNow: false },
      { wid: '2', ts: NOW, completedNow: true },
    ];
    const digest = buildDigest(items, 'daily');
    expect(digest).toHaveLength(1);
    expect(digest[0].updateCount).toBe(3);
    expect(digest[0].finishedCount).toBe(1);
    expect(digest[0].workCount).toBe(2);
  });

  it('sépare les jours différents et trie du plus récent au plus ancien', () => {
    const items = [
      { wid: '1', ts: NOW - DAY, completedNow: false },
      { wid: '2', ts: NOW, completedNow: false },
    ];
    const digest = buildDigest(items, 'daily');
    expect(digest).toHaveLength(2);
    expect(digest[0].ts).toBe(NOW);
  });
});

describe('parseSubscribedWorkIds', () => {
  it('extrait les IDs de work depuis une page de listing', () => {
    const html = `
      <ol class="work index group">
        <li id="work_111" class="work blurb group"><h4 class="heading"></h4></li>
        <li id="work_222" class="work blurb group"><h4 class="heading"></h4></li>
      </ol>
    `;
    expect(parseSubscribedWorkIds(html).sort()).toEqual(['111', '222']);
  });

  it('retourne un tableau vide sans blurb', () => {
    expect(parseSubscribedWorkIds('<p>no works here</p>')).toEqual([]);
  });

  it('dédoublonne les IDs répétés', () => {
    const html = `
      <li id="work_111" class="work blurb group"><h4 class="heading"><a href="/works/111">t</a></h4></li>
    `;
    expect(parseSubscribedWorkIds(html)).toEqual(['111']);
  });
});
