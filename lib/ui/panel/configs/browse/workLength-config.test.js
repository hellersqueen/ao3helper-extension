import { describe, it, expect } from 'vitest';
import { config, moduleId } from './workLength-config.js';

describe('workLength-config', () => {
  it('moduleId est "workLength"', () => {
    expect(moduleId).toBe('workLength');
  });

  it('contient les 4 seuils de catégorie (flash, short, novella, epic)', () => {
    const el = document.createElement('div');
    el.innerHTML = config;
    expect(el.querySelector('[data-setting="thresholdFlash"]').value).toBe('1000');
    expect(el.querySelector('[data-setting="thresholdShort"]').value).toBe('17500');
    expect(el.querySelector('[data-setting="thresholdNovella"]').value).toBe('60000');
    expect(el.querySelector('[data-setting="thresholdEpic"]').value).toBe('150000');
  });
});
