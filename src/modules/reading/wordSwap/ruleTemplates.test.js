import { describe, it, expect } from 'vitest';
import { characterNameRule, deadnameRule, sensitiveWordRule, RULE_PACKS, packRules } from './ruleTemplates.js';

describe('characterNameRule', () => {
  it('construit une règle regex alternée, mot entier, insensible à la casse', () => {
    const rule = characterNameRule('Zoë, Zoe H., Zoey', 'Zoe');
    expect(rule.regex).toBe(true);
    expect(rule.wholeWord).toBe(true);
    expect(rule.caseSensitive).toBe(false);
    expect(rule.find).toBe('Zoë|Zoe H\\.|Zoey');
    expect(rule.replace).toBe('Zoe');
    expect(rule.category).toBe('names');
  });

  it('null sans variantes ou sans cible', () => {
    expect(characterNameRule('', 'Zoe')).toBeNull();
    expect(characterNameRule('a,b', '')).toBeNull();
  });
});

describe('deadnameRule', () => {
  it('règle mot entier insensible à la casse', () => {
    const rule = deadnameRule('OldName', 'NewName');
    expect(rule.find).toBe('OldName');
    expect(rule.replace).toBe('NewName');
    expect(rule.wholeWord).toBe(true);
    expect(rule.caseSensitive).toBe(false);
  });

  it('null si un des deux noms manque', () => {
    expect(deadnameRule('', 'x')).toBeNull();
    expect(deadnameRule('x', ' ')).toBeNull();
  });
});

describe('sensitiveWordRule', () => {
  it('remplace par le texte choisi, ou ▓▓▓ par défaut', () => {
    expect(sensitiveWordRule('gore', 'ouch').replace).toBe('ouch');
    expect(sensitiveWordRule('gore', '').replace).toBe('▓▓▓');
    expect(sensitiveWordRule('')).toBeNull();
  });
});

describe('packRules', () => {
  it('chaque pack produit une règle par paire, avec catégorie', () => {
    RULE_PACKS.forEach(pack => {
      const rules = packRules(pack.id);
      expect(rules.length).toBe(pack.pairs.length);
      rules.forEach(r => {
        expect(r.find).toBeTruthy();
        expect(r.replace).toBeTruthy();
        expect(r.category).toBe(pack.category);
        expect(r.wholeWord).toBe(true);
      });
    });
  });

  it('us-to-uk est l\'inverse de uk-to-us', () => {
    const ukus = packRules('uk-to-us');
    const usuk = packRules('us-to-uk');
    expect(usuk[0].find).toBe(ukus[0].replace);
    expect(usuk[0].replace).toBe(ukus[0].find);
  });

  it('pack inconnu → []', () => {
    expect(packRules('nope')).toEqual([]);
  });
});
