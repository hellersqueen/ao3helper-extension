// @ts-nocheck — shim d'exécution navigateur, pas de globals GM_* déclarés côté tsc.
// gm-shim.js — reproduit en mémoire les fonctions Tampermonkey (GM_*) dont
// dist/ao3-helper.user.js a besoin, pour pouvoir le charger dans un simple
// navigateur Playwright (aucune extension Tampermonkey n'est installée ici).
// Injecté via page.addInitScript() AVANT le script AO3 Helper lui-même,
// pour reproduire le "run-at: document-start" réel.
(() => {
  const store = new Map();

  window.unsafeWindow = window;

  window.GM_getValue = (key, def) => (store.has(key) ? store.get(key) : def);
  window.GM_setValue = (key, val) => { store.set(key, val); };
  window.GM_deleteValue = (key) => { store.delete(key); };

  // Tampermonkey garantit que document.documentElement existe déjà à
  // "document-start" (voir doc GM). Playwright peut injecter ce script un
  // cran plus tôt (avant même la création de <html>) : on attend ce cas
  // précis pour ne pas fausser le test avec un crash qui n'existe pas côté
  // vrai Tampermonkey.
  window.GM_addStyle = (css) => {
    const style = document.createElement('style');
    style.textContent = css;
    const tryInstall = () => {
      const target = document.head || document.documentElement;
      if (!target) { setTimeout(tryInstall, 0); return; }
      target.appendChild(style);
    };
    tryInstall();
    return style;
  };

  window.GM_registerMenuCommand = () => 0;

  // Aucun module testé ici ne fait de vraie requête réseau au démarrage —
  // ce stub évite juste un crash si l'un d'eux l'appelle quand même.
  window.GM_xmlhttpRequest = (details) => {
    if (details && typeof details.onerror === 'function') {
      details.onerror(new Error('GM_xmlhttpRequest indisponible dans ce test'));
    }
    return { abort() {} };
  };
})();
