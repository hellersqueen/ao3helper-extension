/* ═══════════════════════════════════════════════════════════════════════════
   NOTIFICATIONS - Notifications navigateur (permission + envoi)
   Why: workReminder et notificationCenter re-codaient la même danse des trois
   états de permission ; workReminder pouvait même notifier sans jamais avoir
   demandé la permission. Les quiet-hours et les sons restent chez l'appelant
   (métier notificationCenter).
═══════════════════════════════════════════════════════════════════════════ */

/**
 * L'API Notification est-elle disponible et la permission accordée ?
 * @returns {boolean}
 */
export function canNotify() {
  return typeof Notification !== 'undefined' && Notification.permission === 'granted';
}

/**
 * Demande la permission si nécessaire (ne re-demande jamais après un refus)
 * @returns {Promise<boolean>} True si la permission est accordée
 */
export async function requestNotifyPermission() {
  if (typeof Notification === 'undefined') return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const p = await Notification.requestPermission();
  return p === 'granted';
}

/**
 * Envoie une notification si la permission est accordée (sinon no-op)
 * @param {string} title - Titre de la notification
 * @param {{body?: string, icon?: string, tag?: string}} opts
 * @returns {boolean} True si la notification a été émise
 */
export function sendNotification(title, opts = {}) {
  if (!canNotify()) return false;
  try {
    new Notification(title, opts); // eslint-disable-line no-new
    return true;
  } catch {
    return false;
  }
}
