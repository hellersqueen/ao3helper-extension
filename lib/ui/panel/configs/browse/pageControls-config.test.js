import { describe, it, expect } from 'vitest';
import { config, moduleId } from './pageControls-config.js';

describe('pageControls-config', () => {
  it('moduleId est "pageControls"', () => {
    expect(moduleId).toBe('pageControls');
  });

  it('contient la case "Back to Top", cochée par défaut', () => {
    const el = document.createElement('div');
    el.innerHTML = config;
    const input = el.querySelector('[data-setting="showBackToTopButton"]');
    expect(input).not.toBeNull();
    expect(input.type).toBe('checkbox');
    expect(input.checked).toBe(true);
  });
});
