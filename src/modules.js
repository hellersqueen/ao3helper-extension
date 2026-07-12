// AO3 Helper — Chargement automatique de tous les modules migrés vers src/modules/.
// Vite résout ce glob au build : chaque module ajouté sous src/modules/<category>/
// est découvert et exécuté automatiquement, sans liste manuelle à maintenir.
// Tous les modules sont migrés ici depuis la Phase 25 ; l'ancien système
// (modules/ + bundle legacy) a été supprimé en Phase 27 (étape 331).
import.meta.glob('./modules/**/*.js', { eager: true });
