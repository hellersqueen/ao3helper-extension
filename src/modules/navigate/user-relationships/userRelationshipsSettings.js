import { loadModuleSettings } from '../../../../lib/storage/module-settings.js';

export const DEFAULTS = {
  favoritesOnlyFilter: false,
  showPlaceholder: true,
  tempRevealHidden: false,
};

export function getUserRelationshipsSettings () {
  return loadModuleSettings('userRelationships', DEFAULTS);
}
