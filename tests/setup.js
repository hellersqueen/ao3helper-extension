import { beforeEach, vi } from 'vitest';

const gmStorage = new Map();

beforeEach(() => {
  gmStorage.clear();

  vi.stubGlobal('GM_getValue', (key, fallback = null) =>
    gmStorage.has(key) ? gmStorage.get(key) : fallback
  );
  vi.stubGlobal('GM_setValue', (key, value) => {
    gmStorage.set(key, value);
  });
  vi.stubGlobal('GM_deleteValue', (key) => {
    gmStorage.delete(key);
  });
  vi.stubGlobal('GM_info', { script: { name: 'AO3 Helper', version: 'test' } });
});
