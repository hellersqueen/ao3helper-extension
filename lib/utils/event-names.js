/* ═══════════════════════════════════════════════════════════════════════════
   EVENT NAMES - Constantes des événements custom inter-modules
   Why: les modules communiquent par CustomEvent sur document/window avec des
   noms en chaînes dispersées — une typo rompt le couplage en silence. Tout
   événement dont l'émetteur et l'écouteur sont dans des modules différents
   DOIT être déclaré ici et importé des deux côtés.

   Les événements internes à un module (ex: `ao3h:notes-hidden` dans
   hideByTags, `ao3h:blocking-changed` dans user-relationships) restent
   déclarés dans leur module.
═══════════════════════════════════════════════════════════════════════════ */

/**
 * Réglages d'un module sauvegardés depuis le panneau de configuration.
 * detail: { moduleId }
 * Émetteur : lib/ui/panel/panel-tab-system.js
 * Écouteurs : core/coordinator (redémarre le module), hideByTags, skipWorks
 */
export const EV_SETTINGS_CHANGED = 'ao3h:settingsChanged';

/**
 * Demande d'ouverture du manager Hidden Tags.
 * Émetteur : core/coordinator (entrée de menu) · Écouteur : hideByTags
 */
export const EV_OPEN_HIDE_MANAGER = 'ao3h:open-hide-manager';

/**
 * Un work vient d'être ajouté au Later Shelf. detail: { workId, title? }
 * Émetteurs : later-shelf (quickMarkForLaterButton.addToShelf,
 * laterShelfStore.markCurrent), lib/storage/keys.addLaterShelfItem (écrivain
 * partagé utilisé par surpriseMe) · Écouteur : _ficDownloader (auto-sauvegarde
 * offline, gardé par le réglage opt-in autoCacheMFL)
 */
export const EV_MARKED_FOR_LATER = 'ao3h:markedForLater';

/**
 * Broadcasts de ficAppreciation — aucun écouteur connu à ce jour, mais le nom
 * doit rester stable pour les futurs consommateurs. detail: { workId, ... }
 */
export const EV_KUDOS_GIVEN = 'ao3h:kudosGiven';
export const EV_STATUS_CHANGED = 'ao3h:statusChanged';
export const EV_WORK_FINISHED = 'ao3h:workFinished';
