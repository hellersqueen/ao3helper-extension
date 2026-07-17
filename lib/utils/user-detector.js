/* ═══════════════════════════════════════════════════════════════════════════
   USER DETECTOR - Détection du username AO3 de l'utilisateur connecté
   Why: réutilisable par bookmarkStatus, markForLaterStatus et autres modules
═══════════════════════════════════════════════════════════════════════════ */

/**
 * Détecte le username AO3 de l'utilisateur connecté
 * Essaie plusieurs méthodes dans l'ordre :
 * 1. Username manuel enregistré dans localStorage (fallback)
 * 2. Extraction depuis le DOM (lien user dans header)
 * 3. Récupération depuis les clés de cache existantes
 * 
 * @param {{fallbackKey?: string, cachePrefix?: string|null}} [options] - Options de configuration
 * @returns {string|null} Username AO3 ou null si non trouvé
 */
export function detectUser({ fallbackKey = 'AO3H:fallback_username', cachePrefix = null } = {}) {
  // 1. Vérifier si un username manuel est enregistré
  const manualUser = localStorage.getItem(fallbackKey);
  if (manualUser) {
    console.log('[AO3H][user-detector] ✓ Using manual username:', manualUser);
    return manualUser;
  }

  // 2. Extraire depuis le DOM (header de navigation AO3)
  const link = document.querySelector('a[href^="/users/"]');
  const match = link?.getAttribute('href')?.match(/^\/users\/([^\/?#]+)/);
  if (match && match[1]) {
    console.log('[AO3H][user-detector] ✓ Username detected from DOM:', match[1]);
    return match[1];
  }

  // 3. Récupérer depuis les clés de cache existantes (si un préfixe est fourni)
  if (cachePrefix) {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(cachePrefix)) {
        // Pattern: prefix:username:...
        const userMatch = key.match(new RegExp(`^${cachePrefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}:([^:]+):`));
        if (userMatch?.[1]) {
          console.log('[AO3H][user-detector] ✓ Username recovered from cache keys:', userMatch[1]);
          return userMatch[1];
        }
      }
    }
  }

  // 4. Échec - aucune méthode n'a fonctionné
  console.warn('[AO3H][user-detector] ⚠️ Could not detect username automatically');
  console.info(`[AO3H][user-detector] → To set manually: localStorage.setItem('${fallbackKey}', 'YourAO3Username')`);
  return null;
}

/**
 * Vérifie si un utilisateur est connecté sur AO3
 * @returns {boolean} True si connecté, false sinon
 */
export function isUserLoggedIn() {
  // Vérifier la présence du lien de profil utilisateur dans le header
  return !!document.querySelector('a[href^="/users/"]');
}

/**
 * Extrait le username depuis une URL AO3
 * @param {string} url - URL à parser
 * @returns {string|null} Username ou null
 */
export function extractUsernameFromUrl(url) {
  if (!url) return null;
  const match = String(url).match(/\/users\/([^\/?#]+)/);
  return match ? match[1] : null;
}

// Étape 318 : pose AO3H_Common.{detectUser,isUserLoggedIn,extractUsernameFromUrl}
// supprimée — tous les lecteurs Vite sont convertis en imports (user.js à l'étape 314,
// skipWorks-config à la 316, readingDashboard à la 318). Le bundler legacy (supprimé en Phase 27)
// auto-exposait ces fonctions top-level sur AO3H_Common (la pose manuelle était redondante).

