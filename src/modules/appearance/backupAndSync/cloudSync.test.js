import { describe, it, expect } from 'vitest';
import { decideSyncAction, buildConflictMessage } from './cloudSync.js';

describe('decideSyncAction', () => {
  it('skip quand le payload distant est inutilisable', () => {
    expect(decideSyncAction({ remoteTs: NaN, localTs: 0 })).toBe('skip');
    expect(decideSyncAction({ remoteTs: 0, localTs: 0 })).toBe('skip');
    expect(decideSyncAction({ remoteTs: -5, localTs: 0 })).toBe('skip');
  });

  it('skip quand le local est à jour (remote ≤ local)', () => {
    expect(decideSyncAction({ remoteTs: 100, localTs: 100 })).toBe('skip');
    expect(decideSyncAction({ remoteTs: 100, localTs: 200 })).toBe('skip');
  });

  it('restore silencieux au premier sync de l\'appareil (pas d\'historique local)', () => {
    expect(decideSyncAction({ remoteTs: 100, localTs: 0 })).toBe('restore');
    expect(decideSyncAction({ remoteTs: 100, localTs: NaN })).toBe('restore');
  });

  it('ask quand les deux côtés ont un historique et que le distant est plus récent', () => {
    expect(decideSyncAction({ remoteTs: 200, localTs: 100 })).toBe('ask');
  });
});

describe('buildConflictMessage', () => {
  it('mentionne les deux dates et les deux choix', () => {
    const remoteTs = new Date('2026-03-05T10:00:00').getTime();
    const localTs  = new Date('2026-03-01T09:00:00').getTime();
    const msg = buildConflictMessage(remoteTs, localTs);
    expect(msg).toContain(new Date(remoteTs).toLocaleString());
    expect(msg).toContain(new Date(localTs).toLocaleString());
    expect(msg).toContain('OK');
    expect(msg).toContain('Cancel');
  });
});
