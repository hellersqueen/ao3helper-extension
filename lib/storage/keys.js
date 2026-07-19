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

import { EV_MARKED_FOR_LATER } from '../utils/event-names.js';

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
 * Schéma : Object map workId → métadonnées du bookmark, dont un champ
 * `.notes` (string, optionnel) rempli par l'éditeur de notes inline.
 * Lecteurs connus : notificationCenter, dataCollection (via `bookmarkVault:data`),
 * readingTimeline (via getBookmarkVaultNote, aperçu de note dans le détail d'une journée).
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
 * Statuts de lecture (to-read/reading/finished/dropped/disliked/on-hold/re-read)
 * — producteur : ficAppreciation (multiStatusTracker)
 * Schéma : Object map workId → { status: string, date: string, note?: string, rereadCount?: number }
 * Lecteurs connus : laterShelf (rappel spécial pour les fics "dropped").
 */
export const KEY_FIC_APPRECIATION_STATUS = 'ao3h:ficAppreciation:status';

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

/**
 * Retourne l'ensemble des work IDs présents dans les favoris (bookmarkVault).
 * Lecteur partagé du schéma KEY_BOOKMARK_VAULT_DATA.
 * @returns {Set<string>}
 */
export function getBookmarkVaultWorkIds() {
  try {
    const raw = localStorage.getItem(KEY_BOOKMARK_VAULT_DATA);
    if (!raw) return new Set();
    const map = JSON.parse(raw);
    if (!map || typeof map !== 'object') return new Set();
    return new Set(Object.keys(map));
  } catch {
    return new Set();
  }
}

/**
 * Retourne la note personnelle enregistrée sur un bookmark (bookmarkVault,
 * champ `.notes` de KEY_BOOKMARK_VAULT_DATA — rempli par l'éditeur de notes
 * inline sur la page des bookmarks). Lecteur partagé, utilisé par
 * readingTimeline pour prévisualiser la note dans le détail d'une journée.
 * @param {string} workId
 * @returns {string} La note, ou chaîne vide si absente
 */
export function getBookmarkVaultNote(workId) {
  try {
    const raw = localStorage.getItem(KEY_BOOKMARK_VAULT_DATA);
    if (!raw) return '';
    const map = JSON.parse(raw);
    if (!map || typeof map !== 'object') return '';
    return map[workId]?.notes || '';
  } catch {
    return '';
  }
}

/**
 * Retourne l'ensemble des work IDs présents dans « à lire plus tard »
 * (laterShelf). Lecteur partagé du schéma KEY_LATER_SHELF_ITEMS — gère les
 * 3 formes historiques d'un item (string workId | { id } | { wid }) en un
 * seul endroit plutôt que dans chaque consommateur.
 * @returns {Set<string>}
 */
export function getLaterShelfWorkIds() {
  try {
    const raw = localStorage.getItem(KEY_LATER_SHELF_ITEMS);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr.map((item) => String(item?.wid ?? item?.id ?? item ?? '')).filter(Boolean));
  } catch {
    return new Set();
  }
}

/**
 * Retourne l'ensemble des work IDs ayant un statut de lecture donné
 * (ficAppreciation). Lecteur partagé du schéma KEY_FIC_APPRECIATION_STATUS.
 * @param {string} status - ex. 'dropped'
 * @returns {Set<string>}
 */
export function getWorkIdsByStatus (status) {
  try {
    const raw = localStorage.getItem(KEY_FIC_APPRECIATION_STATUS);
    if (!raw) return new Set();
    const map = JSON.parse(raw);
    if (!map || typeof map !== 'object') return new Set();
    return new Set(Object.keys(map).filter((id) => map[id]?.status === status));
  } catch {
    return new Set();
  }
}

/**
 * Ajoute un work à « à lire plus tard » (laterShelf) depuis un autre module
 * (ex. surpriseMe). Écrivain partagé du schéma KEY_LATER_SHELF_ITEMS — évite
 * les doublons, même forme `{ wid, title, addedAt }` que laterShelf lui-même.
 * @param {string} workId
 * @param {string} title
 * @returns {boolean} true si ajouté ou déjà présent, false si work invalide
 */
export function addLaterShelfItem(workId, title) {
  if (!workId) return false;
  try {
    const raw = localStorage.getItem(KEY_LATER_SHELF_ITEMS);
    const items = raw ? JSON.parse(raw) : [];
    const list = Array.isArray(items) ? items : [];
    const already = list.some((item) => String(item?.wid ?? item?.id ?? item ?? '') === String(workId));
    if (!already) {
      list.push({ wid: String(workId), title: title || `Work ${workId}`, addedAt: Date.now() });
      localStorage.setItem(KEY_LATER_SHELF_ITEMS, JSON.stringify(list));
      document.dispatchEvent(new CustomEvent(EV_MARKED_FOR_LATER, { detail: { workId: String(workId), title } }));
    }
    return true;
  } catch {
    return false;
  }
}
