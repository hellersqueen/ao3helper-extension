// Panel Loader Configuration

export const NS = 'ao3h';

// Étape 315 : pose window.AO3H_PanelLoader.NS supprimée du source —
// le bundler legacy la réinjectait via son shim `invoke` (mécanisme supprimé en Phase 27).

console.log('[AO3H][panel-config] ✅ Configuration loaded');
