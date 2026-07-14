/* ═══════════════════════════════════════════════════════════════════════════
   STORAGE KEYS - Contrat des clés localStorage lues par plusieurs modules
   Why: certains modules lisent le storage écrit par d'autres (couplage
   silencieux). Si le producteur renomme sa clé ou change son schéma, les
   consommateurs cassent sans erreur — c'est arrivé : similarFics et
   surpriseMe lisaient `ao3h_seen_works_v1`, une clé que personne n'écrit
   (readingTracker écrit `ao3h:rt:history`), donc « exclure les fics déjà
   lues » n'a jamais fonctionné.

   Règle : toute clé lue par un module qui n'en est pas le producteur DOIT
   être déclarée ici, avec son schéma. Le producteur reste le seul écrivain.
═══════════════════════════════════════════════════════════════════════════ */

/**
 * Historique de lecture — producteur : readingTracker (_readingTracker.js)
 * Schéma : Array<{ id: string, title: string, author: string, href: string,
 *                  seenAt: number, lastReadAt: number, chapter: string|null,
 *                  chapterId: string|null, chapterHref: string|null,
 *                  totalChapters: number|null }>
 * Lecteurs connus : notificationCenter, dataCollection (via wrapper
 * `rt:history`), similarFics, surpriseMe (via getHistoryWorkIdSet).
 */
export const KEY_RT_HISTORY = 'ao3h:rt:history';

/**
 * Bookmarks en cache — producteur : bookmarkVault
 * Schéma : Object map workId → métadonnées du bookmark
 * Lecteurs connus : notificationCenter, dataCollection (via `bookmarkVault:data`).
 */
export const KEY_BOOKMARK_VAULT_DATA = 'ao3h:bookmarkVault:data';

/**
 * Étagère « à lire plus tard » — producteur : laterShelf
 * Schéma : Array d'items ; trois formes historiques coexistent :
 * string workId | { id } | { wid } — toujours lire `item.wid || item.id || item`.
 * Lecteurs connus : notificationCenter.
 */
export const KEY_LATER_SHELF_ITEMS = 'ao3h:laterShelf:items';

/**
 * Kudos donnés — producteur : ficAppreciation (kudosTracker)
 * Schéma : Object map workId → { date: string }
 * Lecteurs connus : dataCollection (via `ficAppreciation:kudosed`).
 */
export const KEY_FIC_APPRECIATION_KUDOSED = 'ao3h:ficAppreciation:kudosed';

/**
 * Sessions de lecture — producteur : activityPanel
 * Schéma : Array<{ workId, words, ... }>
 * Lecteurs connus : dataCollection (via `activityPanel:sessions`).
 */
export const KEY_ACTIVITY_PANEL_SESSIONS = 'ao3h:activityPanel:sessions';

/**
 * Retourne l'ensemble des work IDs présents dans l'historique de lecture.
 * Lecteur partagé du schéma KEY_RT_HISTORY — à utiliser au lieu de re-parser
 * l'historique localement (c'est le remplaçant du lecteur de la clé morte
 * `ao3h_seen_works_v1`).
 * @returns {Set<string>} IDs (chaînes) des works vus/lus
 */
export function getHistoryWorkIdSet() {
  try {
    const raw = localStorage.getItem(KEY_RT_HISTORY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr.map((e) => String(e?.id ?? '')).filter(Boolean));
  } catch {
    return new Set();
  }
}
