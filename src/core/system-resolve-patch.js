// SystemJS resolve patch — must run before any dynamic import() of a code-split
// chunk (./modules.js, ./panel-entry.js, …).
//
// In a userscript there is no server to fetch chunks from: every chunk is
// registered in memory under its relative name (e.g. "./modules-HASH.js").
// But SystemJS.resolve() tries URL resolution first, and in the Tampermonkey /
// browser context it resolves those relative names against the document base
// URL — which can be anything already on the page (we observed the jQuery CDN).
// It then tries to network-load that bogus absolute URL and 404s, so no feature
// module ever loads and the menu stays empty.
//
// Fix: if the specifier is already a registered chunk, resolve it to its own
// name (which SystemJS then finds in registerRegistry) instead of a URL. Every
// chunk we import at runtime is registered, so preferring the registry is always
// correct here and never shadows a real network module.
(() => {
  const S = globalThis.System;
  if (!S || S.__ao3hResolvePatched || typeof S.resolve !== 'function') return;

  const originalResolve = S.resolve.bind(S);
  S.resolve = function (id, parentUrl) {
    const registry = S.registerRegistry;
    if (registry && Object.prototype.hasOwnProperty.call(registry, id)) return id;
    return originalResolve(id, parentUrl);
  };
  S.__ao3hResolvePatched = true;
})();
