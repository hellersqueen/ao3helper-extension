import { describe, expect, it } from 'vitest';
import { PanelConfigs } from './index.js';

function renderConfig(html) {
  const root = document.createElement('div');
  root.innerHTML = html;
  return root;
}

describe('panel config visual contract', () => {
  const configs = Object.entries(PanelConfigs).filter(([moduleId]) => moduleId !== '_default');

  it('covers every registered module config', () => {
    expect(configs.length).toBeGreaterThan(0);
  });

  it.each(configs)('%s uses the shared section and footer anatomy', (_moduleId, html) => {
    const root = renderConfig(html);
    const topLevelElements = Array.from(root.children);
    const sections = topLevelElements.filter(element =>
      element.classList.contains('ao3h-config-section')
    );
    const footers = topLevelElements.filter(element =>
      element.classList.contains('ao3h-config-footer')
    );

    expect(sections.length).toBeGreaterThan(0);
    expect(footers).toHaveLength(1);
    expect(topLevelElements.at(-1)).toBe(footers[0]);
    expect(footers[0].querySelectorAll('.ao3h-config-reset-btn')).toHaveLength(1);
    expect(footers[0].querySelectorAll('.ao3h-config-save-btn')).toHaveLength(1);

    for (const section of sections) {
      const directTitles = Array.from(section.children).filter(element =>
        element.classList.contains('ao3h-config-section-title')
      );
      expect(directTitles).toHaveLength(1);
      expect(directTitles[0]).toBe(section.firstElementChild);
    }
  });
});
