import { describe, expect, it, vi } from 'vitest';
import { Modules, mergeOwnPropertyDescriptors } from './lifecycle.js';

let sequence = 0;

function uniqueModuleName () {
  sequence += 1;
  return `lifecycleConcurrencyTest${sequence}`;
}

describe('module lifecycle transition serialization', () => {
  it('deduplicates overlapping boot requests', async () => {
    const name = uniqueModuleName();
    let releaseInit;
    const initGate = new Promise(resolve => { releaseInit = resolve; });
    const dispose = vi.fn();
    const init = vi.fn(async () => {
      await initGate;
      return dispose;
    });
    Modules.register(name, { enabledByDefault: false }, init);

    const firstBoot = Modules._bootOne(name);
    const secondBoot = Modules._bootOne(name);
    releaseInit();

    await Promise.all([firstBoot, secondBoot]);
    expect(init).toHaveBeenCalledTimes(1);

    await Modules._stopOne(name);
    expect(dispose).toHaveBeenCalledTimes(1);
  });

  it('waits for an in-progress boot before stopping', async () => {
    const name = uniqueModuleName();
    let releaseInit;
    const initGate = new Promise(resolve => { releaseInit = resolve; });
    const dispose = vi.fn();
    Modules.register(name, { enabledByDefault: false }, async () => {
      await initGate;
      return dispose;
    });

    const boot = Modules._bootOne(name);
    const stop = Modules._stopOne(name);
    releaseInit();

    await Promise.all([boot, stop]);
    expect(dispose).toHaveBeenCalledTimes(1);
    expect(Modules._list.get(name)._booted).toBe(false);
  });
});

describe('AO3H namespace merging', () => {
  it('replaces a getter-only property without invoking a setter', () => {
    const target = {};
    Object.defineProperty(target, 'util', {
      configurable: true,
      enumerable: true,
      get: () => ({ source: 'old' }),
    });
    const source = {
      get util() { return { source: 'new' }; },
    };

    expect(() => mergeOwnPropertyDescriptors(target, source)).not.toThrow();
    expect(target.util).toEqual({ source: 'new' });
    expect(Object.getOwnPropertyDescriptor(target, 'util')?.set).toBeUndefined();
  });
});
