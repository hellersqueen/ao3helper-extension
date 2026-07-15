/* ═══════════════════════════════════════════════════════════════════════════
   MIRRORED LIST - Liste de chaînes persistée avec miroir localStorage
   Why: hiddenTags, nopeWords et whitelistExceptions implémentaient trois fois
   le même pattern « liste utilisateur durable » : Storage async en principal,
   miroir localStorage par utilisateur (UserLS) utilisé UNIQUEMENT quand la
   liste principale est vide, set normalisant (trim + lowercase + dédoublonnage).

   Les clés de stockage ne changent pas à la bascule — seule la mécanique est
   factorisée.
═══════════════════════════════════════════════════════════════════════════ */

/**
 * Crée un store de liste de chaînes normalisées avec miroir localStorage
 * @param {Object} opts
 * @param {string} opts.key - Clé du Storage principal (ex: 'hideTagsNope')
 * @param {Object} opts.Storage - Interface async { get(key, def), set(key, val) }
 * @param {Object|null} [opts.UserLS] - Storage localStorage user-scopé
 *   (getItem/setItem) ; à défaut, localStorage préfixé `${NS}:`
 * @param {string} [opts.NS] - Namespace du fallback localStorage (défaut: 'ao3h')
 * @param {string} [opts.mirrorKey] - Clé du miroir (défaut: identique à key)
 * @param {boolean} [opts.normalizeOnGet] - Re-normaliser à la lecture
 *   (défaut: true — comportement nopeWords/whitelist ; hiddenTags passait false)
 * @returns {{ get(): Promise<string[]>, set(arr): Promise<string[]>,
 *             add(item): Promise<void>, remove(item): Promise<void> }}
 */
export function createMirroredListStore({
  key,
  Storage,
  UserLS = null,
  NS = 'ao3h',
  mirrorKey = key,
  normalizeOnGet = true,
}) {
  if (!key || !Storage) throw new Error('[mirrored-list] key and Storage are required');

  const norm = (s) => String(s).trim().toLowerCase();

  function mirrorGet(def) {
    try {
      const raw = UserLS
        ? UserLS.getItem(mirrorKey)
        : localStorage.getItem(`${NS}:${mirrorKey}`);
      return JSON.parse(raw || 'null') ?? def;
    } catch { return def; }
  }

  function mirrorSet(value) {
    try {
      const data = JSON.stringify(value);
      if (UserLS) UserLS.setItem(mirrorKey, data);
      else localStorage.setItem(`${NS}:${mirrorKey}`, data);
    } catch { /* quota */ }
  }

  async function get() {
    let list = (await Storage.get(key, [])) || [];
    // Le miroir n'est utilisé QUE si la liste principale est vide
    if (!list.length) {
      const fromLS = mirrorGet([]);
      if (Array.isArray(fromLS) && fromLS.length) list = fromLS;
    }
    return normalizeOnGet
      ? list.map(norm).filter(Boolean)
      : list;
  }

  async function set(arr) {
    const cleaned = Array.from(new Set(arr.map(norm).filter(Boolean)));
    await Storage.set(key, cleaned);
    mirrorSet(cleaned);
    return cleaned;
  }

  async function add(item) {
    const cur = await get();
    const v = norm(item);
    if (v && !cur.includes(v)) {
      cur.push(v);
      await set(cur);
    }
  }

  async function remove(item) {
    const cur = await get();
    const v = norm(item);
    const idx = cur.indexOf(v);
    if (idx >= 0) {
      cur.splice(idx, 1);
      await set(cur);
    }
  }

  return { get, set, add, remove };
}
