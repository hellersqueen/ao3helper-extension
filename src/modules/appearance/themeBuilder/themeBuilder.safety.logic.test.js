import { describe, it, expect } from 'vitest';
import {
  findProtectedViolations,
  hexToRgb,
  contrastRatio,
  contrastVerdict,
  COLORBLIND_PALETTES,
  buildElementRule,
} from './_themeBuilder.js';

describe('findProtectedViolations — protection des zones critiques', () => {
  it('bloque display:none sur #workskin et .userstuff', () => {
    expect(findProtectedViolations('#workskin { display: none; }').length).toBe(1);
    expect(findProtectedViolations('.userstuff { visibility: hidden !important; }').length).toBe(1);
  });

  it('bloque les tailles nulles et opacity:0 sur body', () => {
    expect(findProtectedViolations('body { font-size: 0; }').length).toBe(1);
    expect(findProtectedViolations('body { opacity: 0; }').length).toBe(1);
    expect(findProtectedViolations('#main { height: 0px; }').length).toBe(1);
  });

  it('laisse passer les styles inoffensifs sur les zones protégées', () => {
    expect(findProtectedViolations('#workskin { max-width: 900px; color: #333; }')).toEqual([]);
    expect(findProtectedViolations('body { background: #fafafa; }')).toEqual([]);
  });

  it('laisse passer display:none sur les zones non protégées', () => {
    expect(findProtectedViolations('.tags.freeform { display: none; }')).toEqual([]);
    expect(findProtectedViolations('#sidebar { display: none; }')).toEqual([]);
  });

  it('"body" ne matche pas tbody ni une classe contenant body', () => {
    expect(findProtectedViolations('tbody { display: none; }')).toEqual([]);
    expect(findProtectedViolations('.bodyguard { display: none; }')).toEqual([]);
  });

  it('détecte la zone dans un sélecteur descendant et à travers @media', () => {
    expect(findProtectedViolations('#main .userstuff p { display: none; }').length).toBe(1);
    expect(findProtectedViolations('@media (max-width: 600px) { #workskin { display: none; } }').length).toBe(1);
  });

  it('gère le CSS vide ou commenté', () => {
    expect(findProtectedViolations('')).toEqual([]);
    expect(findProtectedViolations('/* #workskin { display:none } */')).toEqual([]);
  });
});

describe('contraste WCAG', () => {
  it('hexToRgb parse #rgb et #rrggbb', () => {
    expect(hexToRgb('#fff')).toEqual([255, 255, 255]);
    expect(hexToRgb('#000000')).toEqual([0, 0, 0]);
    expect(hexToRgb('900')).toEqual([153, 0, 0]);
    expect(hexToRgb('pas-une-couleur')).toBeNull();
  });

  it('noir sur blanc = 21:1, identiques = 1:1', () => {
    expect(contrastRatio('#000', '#fff')).toBeCloseTo(21, 0);
    expect(contrastRatio('#888', '#888')).toBeCloseTo(1, 5);
  });

  it('verdicts AAA / AA / low', () => {
    expect(contrastVerdict(21)).toBe('good');
    expect(contrastVerdict(5)).toBe('ok');
    expect(contrastVerdict(2)).toBe('low');
    expect(contrastVerdict(NaN)).toBeNull();
  });

  it('les palettes daltoniennes fournies sont lisibles (texte/fond ≥ 4.5)', () => {
    COLORBLIND_PALETTES.forEach(p => {
      const ratio = contrastRatio(p.colors.textColor, p.colors.bgColor);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });
  });
});

describe('buildElementRule', () => {
  it('construit une règle couleur/fond', () => {
    const rule = buildElementRule('#sidebar', { textColor: '#fff', bgColor: '#222' });
    expect(rule).toBe('#sidebar { color: #fff !important; background-color: #222 !important; }');
  });

  it('hide produit display:none et ignore les couleurs', () => {
    expect(buildElementRule('.ads', { textColor: '#fff', hide: true })).toBe('.ads { display: none !important; }');
  });

  it('retourne "" sans sélecteur ou sans changement', () => {
    expect(buildElementRule('', { textColor: '#fff' })).toBe('');
    expect(buildElementRule('#x', {})).toBe('');
  });
});
