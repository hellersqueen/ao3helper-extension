// Lightweight panel facade kept in the document-start bundle.
// The actual panel, its configs and its large stylesheet are evaluated only
// when a user asks to open settings for the first time.
import { loadRuntimeBundle } from '../../utils/runtime-bundles.js';

let panelPromise;

function loadPanel() {
  if (!panelPromise) {
    panelPromise = loadRuntimeBundle('panel').then(() => import('./panel-entry.js')).catch((error) => {
      // A transient loading failure must not make the settings button
      // permanently inert: allow a later click to retry.
      panelPromise = undefined;
      throw error;
    });
  }
  return panelPromise;
}

export async function openAO3HPanel(moduleName) {
  try {
    const panel = await loadPanel();
    return panel.openAO3HPanel(moduleName);
  } catch (error) {
    console.error('[AO3H][panel-loader] Unable to load the settings panel', error);
  }
}

export const preloadAO3HPanel = loadPanel;
