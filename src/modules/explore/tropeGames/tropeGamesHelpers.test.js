import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  categoryOf, getCategories, filterTropesByCategory, groupStatsByCategory,
  dateKey, monthKey,
  computeWeeklyChallenge, WEEKLY_CHALLENGE_TARGET,
  bucketTropesByMonth, monthlyTrend,
  unexploredTropes,
  bingoProgressPercent,
  freeCenterIndex,
  buildBingoPatterns,
  getSeasonalTheme,
  pickTropeForMood,
  medalIcon,
  horoscopeCameTrue,
} from './tropeGamesHelpers.js';

describe('categoryOf / getCategories / filterTropesByCategory', () => {
  it('classe les tropes connus dans une catégorie', () => {
    expect(categoryOf('Slow Burn')).toBe('Romance');
    expect(categoryOf('Hurt/Comfort')).toBe('Comfort');
  });
  it('retombe sur "Other" pour un trope inconnu', () => {
    expect(categoryOf('Not A Real Trope')).toBe('Other');
  });
  it('liste les catégories triées sans doublon', () => {
    const cats = getCategories(['Slow Burn', 'Hurt/Comfort', 'Enemies to Lovers']);
    expect(cats).toEqual(['Comfort', 'Romance']);
  });
  it('filtre une liste de tropes par catégorie', () => {
    const filtered = filterTropesByCategory(['Slow Burn', 'Hurt/Comfort'], 'Romance');
    expect(filtered).toEqual(['Slow Burn']);
  });
  it('sans catégorie, retourne la liste complète', () => {
    const list = ['Slow Burn', 'Hurt/Comfort'];
    expect(filterTropesByCategory(list, '')).toBe(list);
  });
});

describe('groupStatsByCategory', () => {
  it('additionne les comptes par catégorie', () => {
    const stats = { 'Slow Burn': 3, 'Mutual Pining': 2, 'Hurt/Comfort': 1 };
    expect(groupStatsByCategory(stats)).toEqual({ Romance: 5, Comfort: 1 });
  });
});

describe('dateKey / monthKey', () => {
  it('formate une date en YYYY-MM-DD', () => {
    expect(dateKey(new Date(2026, 6, 5))).toBe('2026-07-05');
  });
  it('extrait le mois d’une clé de date', () => {
    expect(monthKey('2026-07-05')).toBe('2026-07');
    expect(monthKey(null)).toBeNull();
  });
});

describe('computeWeeklyChallenge', () => {
  const now = new Date(2026, 6, 15);
  it('compte les tropes distincts lus dans les 7 derniers jours', () => {
    const seen = [
      { date: '2026-07-14', tropes: ['Slow Burn', 'Fix-It'] },
      { date: '2026-07-10', tropes: ['Fix-It', 'Roommates'] },
      { date: '2026-06-01', tropes: ['Time Travel'] }, // hors fenêtre
    ];
    const result = computeWeeklyChallenge(seen, { now });
    expect(result.distinct).toBe(3);
    expect(result.target).toBe(WEEKLY_CHALLENGE_TARGET);
    expect(result.complete).toBe(false);
  });
  it('est complet une fois la cible atteinte', () => {
    const seen = [{ date: '2026-07-15', tropes: ['A', 'B', 'C', 'D', 'E'] }];
    expect(computeWeeklyChallenge(seen, { now, target: 5 }).complete).toBe(true);
  });
});

describe('bucketTropesByMonth / monthlyTrend', () => {
  it('regroupe les comptes par mois', () => {
    const seen = [
      { date: '2026-07-01', tropes: ['Slow Burn'] },
      { date: '2026-07-05', tropes: ['Slow Burn', 'Fix-It'] },
      { date: '2026-06-20', tropes: ['Fix-It'] },
    ];
    expect(bucketTropesByMonth(seen)).toEqual({
      '2026-07': { 'Slow Burn': 2, 'Fix-It': 1 },
      '2026-06': { 'Fix-It': 1 },
    });
  });
  it('compare le mois courant au précédent et détecte les tropes montants', () => {
    const now = new Date(2026, 6, 20); // juillet
    const seen = [
      { date: '2026-07-01', tropes: ['Slow Burn', 'Slow Burn'] },
      { date: '2026-06-01', tropes: ['Fix-It'] },
    ];
    const trend = monthlyTrend(seen, { now });
    expect(trend.current[0][0]).toBe('Slow Burn');
    expect(trend.previous[0][0]).toBe('Fix-It');
    expect(trend.rising).toContain('Slow Burn');
  });
});

describe('unexploredTropes', () => {
  it('retourne les tropes jamais rencontrés', () => {
    const list = ['Slow Burn', 'Fix-It', 'Roommates'];
    const stats = { 'Slow Burn': 2 };
    expect(unexploredTropes(list, stats)).toEqual(['Fix-It', 'Roommates']);
  });
});

describe('bingoProgressPercent', () => {
  it('calcule le pourcentage en excluant la case FREE', () => {
    const checked = Array(25).fill(false);
    checked[12] = true; // FREE
    checked[0] = true;
    checked[1] = true;
    expect(bingoProgressPercent(checked, 12)).toBe(Math.round((2 / 24) * 100));
  });
  it('retourne 0 sur une carte vide', () => {
    expect(bingoProgressPercent(Array(25).fill(false), 12)).toBe(0);
  });
});

describe('freeCenterIndex', () => {
  it('trouve le centre d’une grille impaire', () => {
    expect(freeCenterIndex(3)).toBe(4);
    expect(freeCenterIndex(5)).toBe(12);
  });
});

describe('buildBingoPatterns', () => {
  it('génère les motifs attendus pour une grille 3×3', () => {
    const p = buildBingoPatterns(3);
    expect(p['Row 1']).toEqual([0, 1, 2]);
    expect(p['Col 1']).toEqual([0, 3, 6]);
    expect(p['Diagonal \\']).toEqual([0, 4, 8]);
    expect(p['Diagonal /']).toEqual([2, 4, 6]);
    expect(p.Corners).toEqual([0, 2, 6, 8]);
    expect(p.Blackout).toHaveLength(9);
  });
  it('génère les motifs attendus pour une grille 5×5 (compatibilité avec l’ancienne carte fixe)', () => {
    const p = buildBingoPatterns(5);
    expect(p['Row 1']).toEqual([0, 1, 2, 3, 4]);
    expect(p['Col 1']).toEqual([0, 5, 10, 15, 20]);
    expect(p['Diagonal \\']).toEqual([0, 6, 12, 18, 24]);
    expect(p['Diagonal /']).toEqual([4, 8, 12, 16, 20]);
    expect(p.Corners).toEqual([0, 4, 20, 24]);
    expect(p.Blackout).toHaveLength(25);
  });
});

describe('getSeasonalTheme', () => {
  it('associe chaque mois à une saison', () => {
    expect(getSeasonalTheme(new Date(2026, 0, 15))).toBe('winter');
    expect(getSeasonalTheme(new Date(2026, 9, 15))).toBe('halloween');
    expect(getSeasonalTheme(new Date(2026, 6, 15))).toBe('summer');
  });
});

describe('pickTropeForMood', () => {
  afterEach(() => vi.restoreAllMocks());
  it('choisit un trope associé à l’humeur, présent dans la liste', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const list = ['Slow Burn', 'Mutual Pining', 'Roommates'];
    expect(pickTropeForMood('romantic', list)).toBe('Slow Burn');
  });
  it('retombe sur la liste complète si aucun trope de l’humeur n’y figure', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const list = ['Roommates'];
    expect(pickTropeForMood('romantic', list)).toBe('Roommates');
  });
});

describe('medalIcon', () => {
  it('retourne une icône pour chaque palier connu', () => {
    expect(medalIcon('gold')).toBe('🥇');
    expect(medalIcon('unknown')).toBe('');
  });
});

describe('horoscopeCameTrue', () => {
  it('est vrai si le trope prédit a été lu ce jour-là', () => {
    const seen = [{ date: '2026-07-15', tropes: ['Slow Burn'] }];
    expect(horoscopeCameTrue(seen, 'Slow Burn', '2026-07-15')).toBe(true);
  });
  it('est faux si un autre trope a été lu ce jour-là', () => {
    const seen = [{ date: '2026-07-15', tropes: ['Fix-It'] }];
    expect(horoscopeCameTrue(seen, 'Slow Burn', '2026-07-15')).toBe(false);
  });
  it('retourne null si rien n’a été lu ce jour-là', () => {
    expect(horoscopeCameTrue([], 'Slow Burn', '2026-07-15')).toBeNull();
  });
});
