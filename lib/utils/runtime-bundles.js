// Physical runtime bundle loader. The build extracts System.register chunks
// from the userscript bootstrap into stable sibling assets.

const FILES = {
  modules: 'ao3-helper.modules.js',
  panel: 'ao3-helper.panel.js',
};
const pending = new Map();
const loaded = new Set();

function configuredBaseURL() {
  const explicit = globalThis.__AO3H_ASSET_BASE__;
  if (explicit) return String(explicit).replace(/\/$/, '');

  const built = typeof __AO3H_BUILD_ASSET_BASE__ !== 'undefined'
    ? __AO3H_BUILD_ASSET_BASE__
    : '';
  if (built) return String(built).replace(/\/$/, '');

  try {
    const scriptURL = GM_info?.script?.downloadURL || GM_info?.script?.updateURL;
    if (scriptURL) return new URL('.', scriptURL).href.replace(/\/$/, '');
  } catch { /* GM_info is optional in direct-injection tests */ }

  throw new Error(
    'AO3 Helper asset base is not configured. Set AO3H_ASSET_BASE at build time or install from a release URL.',
  );
}

function requestText(url) {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: 'GET',
      url,
      onload(response) {
        if (response.status >= 200 && response.status < 300) resolve(response.responseText);
        else reject(new Error(`Bundle request failed (${response.status}): ${url}`));
      },
      onerror(error) {
        reject(error instanceof Error ? error : new Error(`Bundle request failed: ${url}`));
      },
      ontimeout() {
        reject(new Error(`Bundle request timed out: ${url}`));
      },
    });
  });
}

const REGISTRATION_BUDGET_MS = 12;

const now = () => globalThis.performance?.now?.() ?? Date.now();
const yieldToMainThread = () => new Promise((resolve) => setTimeout(resolve, 0));

async function registerSystemModules(code, name) {
  const starts = [...code.matchAll(/^System\.register\(/gm)].map((match) => match.index);
  if (!starts.length) {
    throw new Error(`Invalid AO3 Helper ${name} bundle`);
  }

  let sliceStart = now();
  for (let index = 0; index < starts.length; index += 1) {
    const start = index === 0 ? 0 : starts[index];
    const end = starts[index + 1] ?? code.length;
    // Tampermonkey's sandbox doesn't reliably expose the inline SystemJS
    // runtime to indirect eval's ambient global scope — bind it explicitly
    // instead of relying on the bare `System` identifier resolving there.
    const chunk = `${code.slice(start, end)}\n//# sourceURL=ao3-helper.${name}.${index}.js`;
    new Function('System', chunk)(globalThis.System);
    if (index + 1 < starts.length && now() - sliceStart >= REGISTRATION_BUDGET_MS) {
      await yieldToMainThread();
      sliceStart = now();
    }
  }
}

export function loadRuntimeBundle(name) {
  // The installable single-file build already contains every System.register
  // chunk. Its small prelude sets this flag so no companion asset is fetched.
  if (globalThis.__AO3H_INLINE_BUNDLES__) return Promise.resolve();
  if (loaded.has(name)) return Promise.resolve();
  if (pending.has(name)) return pending.get(name);
  const file = FILES[name];
  if (!file) return Promise.reject(new Error(`Unknown AO3 Helper runtime bundle: ${name}`));

  const promise = requestText(`${configuredBaseURL()}/${file}`)
    .then((code) => registerSystemModules(code, name))
    .then(() => {
      loaded.add(name);
      pending.delete(name);
    }, (error) => {
      pending.delete(name);
      throw error;
    });
  pending.set(name, promise);
  return promise;
}
