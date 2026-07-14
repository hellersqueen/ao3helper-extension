/* ═══════════════════════════════════════════════════════════════════════════
   JSON FILE - Export / import de fichiers côté navigateur
   Why: le pattern Blob → createObjectURL → <a download> → revoke, et son
   inverse <input type=file> → text → JSON.parse, était recopié dans ~20
   modules. La validation du contenu importé reste chez l'appelant.
═══════════════════════════════════════════════════════════════════════════ */

/**
 * Télécharge un contenu quelconque sous forme de fichier
 * @param {string|BlobPart} content - Contenu du fichier
 * @param {string} filename - Nom de fichier proposé
 * @param {string} mime - Type MIME (ex: 'application/json', 'text/csv', 'text/html')
 */
export function downloadFile(content, filename, mime = 'application/octet-stream') {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Sérialise et télécharge des données en JSON
 * @param {*} data - Données sérialisables
 * @param {string} filename - Nom de fichier proposé (ex: 'export.json')
 * @param {number} indent - Indentation JSON (défaut: 2)
 */
export function downloadJSON(data, filename, indent = 2) {
  downloadFile(JSON.stringify(data, null, indent), filename, 'application/json');
}

/**
 * Ouvre un sélecteur de fichier et retourne le texte du fichier choisi
 * @param {string} accept - Filtre de types (défaut: '.json,application/json')
 * @returns {Promise<string|null>} Texte du fichier, ou null si annulé
 */
export function pickTextFile(accept = '.json,application/json') {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.addEventListener('change', async () => {
      const file = input.files && input.files[0];
      if (!file) { resolve(null); return; }
      try {
        resolve(await file.text());
      } catch {
        resolve(null);
      }
    });
    input.click();
  });
}

/**
 * Ouvre un sélecteur de fichier et retourne le JSON parsé
 * @param {string} accept - Filtre de types (défaut: '.json,application/json')
 * @returns {Promise<*|null>} Données parsées, ou null si annulé
 * @throws {SyntaxError} Si le fichier choisi n'est pas du JSON valide
 */
export async function pickJSONFile(accept = '.json,application/json') {
  const text = await pickTextFile(accept);
  if (text == null) return null;
  return JSON.parse(text);
}
