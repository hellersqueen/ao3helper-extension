import { describe, expect, it, vi } from 'vitest';
import { ThemeGenerator, ThemeParser, ThemeValidator } from './engine/themeUtils.js';
import {
  accessibilityThemes, aestheticThemes, basicThemes, builtinThemes,
  comfortThemes, developerThemes,
} from './builtinThemes.js';
import {
  colorfulTemplate, darkModeTemplate, lightModeTemplate, themeTemplates,
} from './themeTemplates.js';

describe('theme utilities', () => {
  it('génère un CSS que le parseur peut relire', () => {
    const colors = { bg: '#fff', text: '#111', link: '#06c' };
    const css = ThemeGenerator.generateCSS(colors);
    expect(ThemeParser.extractColors(css)).toEqual({
      bg: '#fff', text: '#111', link: '#06c', visited: '#06c',
      accent: '#06c', border: 'rgba(0,0,0,0.1)',
    });
  });

  it('valide le CSS cadré et rejette le contenu dangereux', () => {
    expect(ThemeValidator.validate('html.ao3h-theme-custom-demo { color: red; }')).toBe(true);
    expect(() => ThemeValidator.validate('a { background: javascript:alert(1); }')).toThrow();
  });

  it('avertit lorsqu’un thème personnalisé n’est pas cadré', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    ThemeValidator.validate('body { color: red; }');
    expect(warn).toHaveBeenCalledOnce();
    warn.mockRestore();
  });
});

describe('theme catalogs', () => {
  it('conserve les cinq catégories et leurs quatorze thèmes', () => {
    expect(Object.keys(basicThemes)).toHaveLength(2);
    expect(Object.keys(accessibilityThemes)).toHaveLength(3);
    expect(Object.keys(comfortThemes)).toHaveLength(4);
    expect(Object.keys(aestheticThemes)).toHaveLength(4);
    expect(Object.keys(developerThemes)).toHaveLength(1);
    expect(Object.keys(builtinThemes)).toHaveLength(14);
  });

  it('conserve et agrège les trois modèles', () => {
    expect(themeTemplates).toEqual({
      light: lightModeTemplate,
      dark: darkModeTemplate,
      colorful: colorfulTemplate,
    });
    expect(Object.values(themeTemplates).every(template => template.css.includes('html.ao3h-theme-custom-xxx'))).toBe(true);
  });
});
