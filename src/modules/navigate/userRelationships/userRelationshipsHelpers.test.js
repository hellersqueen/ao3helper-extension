import { describe, it, expect } from 'vitest';
import {
  parseUserHref, accountKey, pseudKey, isBlockedIdentity, describeIdentity,
  cyclePriority, priorityIcon, parseTags, sortByKudosURL, PRIORITY_LEVELS,
} from './userRelationshipsHelpers.js';

describe('parseUserHref', () => {
  it('parse un lien de compte simple', () => {
    expect(parseUserHref('/users/JaneDoe')).toEqual({ username: 'JaneDoe', pseud: null });
  });

  it('parse un lien avec pseudonyme', () => {
    expect(parseUserHref('/users/JaneDoe/pseuds/PenName')).toEqual({ username: 'JaneDoe', pseud: 'PenName' });
  });

  it('parse un lien avec suffixe (works, etc.)', () => {
    expect(parseUserHref('/users/JaneDoe/pseuds/PenName/works')).toEqual({ username: 'JaneDoe', pseud: 'PenName' });
  });

  it('retourne null pour un href sans /users/', () => {
    expect(parseUserHref('/works/123')).toBeNull();
  });
});

describe('accountKey / pseudKey', () => {
  it('normalise en minuscules', () => {
    expect(accountKey('JaneDoe')).toBe('janedoe');
    expect(pseudKey('JaneDoe', 'PenName')).toBe('janedoe/penname');
  });
});

describe('isBlockedIdentity', () => {
  it('bloque via une clé de compte entier', () => {
    const blocked = new Set(['janedoe']);
    expect(isBlockedIdentity(blocked, 'JaneDoe', 'PenName')).toBe(true);
    expect(isBlockedIdentity(blocked, 'JaneDoe', null)).toBe(true);
  });

  it('bloque via une clé de pseudonyme précis, sans affecter les autres pseudos', () => {
    const blocked = new Set(['janedoe/penname']);
    expect(isBlockedIdentity(blocked, 'JaneDoe', 'PenName')).toBe(true);
    expect(isBlockedIdentity(blocked, 'JaneDoe', 'OtherPen')).toBe(false);
    expect(isBlockedIdentity(blocked, 'JaneDoe', null)).toBe(false);
  });

  it('retourne false sans username', () => {
    expect(isBlockedIdentity(new Set(['janedoe']), null, null)).toBe(false);
  });
});

describe('describeIdentity', () => {
  it('affiche juste le nom pour un blocage de compte entier', () => {
    expect(describeIdentity('janedoe')).toBe('janedoe');
  });

  it('affiche le pseudonyme pour un blocage ciblé', () => {
    expect(describeIdentity('janedoe/penname')).toBe('janedoe (pseud: penname)');
  });
});

describe('cyclePriority', () => {
  it('boucle normal → high → low → normal', () => {
    expect(cyclePriority('normal')).toBe('high');
    expect(cyclePriority('high')).toBe('low');
    expect(cyclePriority('low')).toBe('normal');
  });

  it('retombe sur le premier niveau pour une valeur inconnue', () => {
    expect(cyclePriority('bogus')).toBe(PRIORITY_LEVELS[0]);
  });
});

describe('priorityIcon', () => {
  it('retourne une icône pour high/low et rien pour normal', () => {
    expect(priorityIcon('high')).toBe('🔥');
    expect(priorityIcon('low')).toBe('💤');
    expect(priorityIcon('normal')).toBe('');
  });
});

describe('parseTags', () => {
  it('découpe, trim et déduplique (insensible à la casse)', () => {
    expect(parseTags('Slow Burn, fluff , Slow burn,')).toEqual(['Slow Burn', 'fluff']);
  });

  it('retourne un tableau vide pour une entrée vide', () => {
    expect(parseTags('')).toEqual([]);
    expect(parseTags(undefined)).toEqual([]);
  });
});

describe('sortByKudosURL', () => {
  it('ajoute le paramètre de tri AO3 sans en retirer d’autres', () => {
    const url = sortByKudosURL('https://archiveofourown.org/users/JaneDoe/works?page=2');
    expect(url).toContain('page=2');
    expect(url).toContain('work_search%5Bsort_column%5D=kudos_count');
  });
});
