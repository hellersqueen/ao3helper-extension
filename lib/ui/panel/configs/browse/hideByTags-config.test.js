// @ts-nocheck
import { describe, it, expect } from 'vitest';
import { config, moduleId } from './hideByTags-config.js';

describe('hideByTags-config', () => {
  it('moduleId est "hideByTags"', () => {
    expect(moduleId).toBe('hideByTags');
  });

  it('contient la case "showHiddenCounter" cochée par défaut', () => {
    const el = document.createElement('div');
    el.innerHTML = config;
    const cb = el.querySelector('[data-setting="showHiddenCounter"]');
    expect(cb).not.toBeNull();
    expect(cb.type).toBe('checkbox');
    expect(cb.checked).toBe(true);
  });
});
