/* ═══════════════════════════════════════════════════════════════════════════
   DOM HELPERS - Utilitaires de création d'éléments DOM
   Why: centraliser les patterns de création d'éléments DOM répétitifs
   Note: Anciennement dans state-managers.js (fonctions de storage déplacées vers storage.js)
═══════════════════════════════════════════════════════════════════════════ */

/**
 * Échappe une chaîne pour insertion sûre dans du HTML (texte ou attribut)
 * Version complète : & < > " ' — utilisable aussi dans value="…"
 * @param {*} str - Valeur à échapper (coercée en chaîne)
 * @returns {string} Chaîne échappée
 */
export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Crée un élément avec attributs et contenu
 * @param {string} tagName - Nom du tag
 * @param {Object} attributes - Attributs à définir
 * @param {string} content - Contenu HTML ou texte
 * @returns {Element} Élément créé
 */
export function createElement(tagName, attributes = {}, content = '') {
  const element = document.createElement(tagName);
  
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === 'className') {
      element.className = value;
    } else if (key === 'textContent') {
      element.textContent = value;
    } else if (key === 'innerHTML') {
      element.innerHTML = value;
    } else {
      element.setAttribute(key, value);
    }
  });
  
  if (content && !attributes.textContent && !attributes.innerHTML) {
    element.innerHTML = content;
  }
  
  return element;
}

/**
 * Crée un bouton avec classes et événements
 * @param {Object} options - {className, textContent, innerHTML, onClick, attributes}
 * @returns {HTMLButtonElement} Bouton créé
 */
export function createButton(options = {}) {
  const {
    className = '',
    textContent = '',
    innerHTML = '',
    onClick = null,
    attributes = {}
  } = options;
  
  const button = createElement('button', {
    type: 'button',
    className,
    ...attributes
  });
  
  if (innerHTML) {
    button.innerHTML = innerHTML;
  } else if (textContent) {
    button.textContent = textContent;
  }
  
  if (onClick && typeof onClick === 'function') {
    button.addEventListener('click', onClick, { passive: true });
  }
  
  return button;
}
