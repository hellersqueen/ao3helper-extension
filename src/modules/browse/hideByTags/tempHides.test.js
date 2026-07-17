import { describe, it, expect, beforeEach } from 'vitest';
import {
  TEMP_HIDES_KEY,
  endOfDay,
  addTempHide,
  removeTempHide,
  getActiveTempHides,
} from './tempHides.js';

beforeEach(() => { localStorage.clear(); });

describe('endOfDay', () => {
  it('retourne le dernier instant du jour courant', () => {
    const noon = new Date('2026-07-17T12:00:00').getTime();
    const end  = endOfDay(noon);
    const d    = new Date(end);
    expect(d.getHours()).toBe(23);
    expect(d.getMinutes()).toBe(59);
    expect(d.getDate()).toBe(17);
  });
});

describe('addTempHide / getActiveTempHides', () => {
  it('un tag masqué reste actif le même jour', () => {
    const noon = new Date('2026-07-17T12:00:00').getTime();
    addTempHide('Angst', localStorage, noon);
    expect(getActiveTempHides(localStorage, noon + 60_000)).toEqual(['angst']);
  });

  it('le tag expire le lendemain et est purgé du stockage', () => {
    const noon     = new Date('2026-07-17T12:00:00').getTime();
    const tomorrow = new Date('2026-07-18T08:00:00').getTime();
    addTempHide('Angst', localStorage, noon);

    expect(getActiveTempHides(localStorage, tomorrow)).toEqual([]);
    expect(JSON.parse(localStorage.getItem(TEMP_HIDES_KEY))).toEqual({});
  });

  it('normalise le tag (trim + minuscules) et ignore les tags vides', () => {
    addTempHide('  Hurt/Comfort  ');
    addTempHide('');
    expect(getActiveTempHides()).toEqual(['hurt/comfort']);
  });

  it('removeTempHide retire un masquage avant son expiration', () => {
    addTempHide('angst');
    removeTempHide('angst');
    expect(getActiveTempHides()).toEqual([]);
  });

  it('résiste à un stockage corrompu', () => {
    localStorage.setItem(TEMP_HIDES_KEY, '{oops');
    expect(getActiveTempHides()).toEqual([]);
  });
});
