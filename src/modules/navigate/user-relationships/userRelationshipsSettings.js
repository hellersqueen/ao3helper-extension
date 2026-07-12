export const DEFAULTS = {
  favoritesOnlyFilter: false,
  showPlaceholder: true,
  tempRevealHidden: false,
};

export function getUserRelationshipsSettings () {
  try {
    const saved = JSON.parse(localStorage.getItem('ao3h:mod:userRelationships:settings') || '{}');
    return { ...DEFAULTS, ...(saved && typeof saved === 'object' ? saved : {}) };
  } catch {
    return { ...DEFAULTS };
  }
}
