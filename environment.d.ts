/// <reference types="vite/client" />

// Ambient declarations for Vite, userscript-manager globals and the
// cross-module values AO3 Helper attaches to `window` at runtime.

declare module '*.css?inline' {
  const css: string;
  export default css;
}

type AO3HElement = HTMLElement & HTMLAnchorElement & HTMLInputElement & HTMLSelectElement & HTMLFormElement;

declare const unsafeWindow: Window & typeof globalThis;
declare const GM_getValue: <T = any>(key: string, defaultValue?: T) => T;
declare const GM_setValue: (key: string, value: unknown) => void;
declare const GM_deleteValue: (name: string) => void;
declare const GM_addStyle: (css: string) => HTMLStyleElement;
declare const GM_info: {
  script?: { downloadURL?: string; updateURL?: string };
};
declare const GM_registerMenuCommand: (
  caption: string,
  onClick: (event: MouseEvent | KeyboardEvent) => void,
  optionsOrAccessKey?: string | Record<string, unknown>
) => string | number;
declare const GM_xmlhttpRequest: (details: Record<string, any>) => any;
declare const __AO3H_BUILD_ASSET_BASE__: string;

interface Window {
  jQuery?: any;
  $j?: any;
  $?: any;
  GM?: any;
  tinyMCE?: any;
  chrome?: any;
  browser?: any;
  JSZip?: any;
  LiveValidation?: any;
  webkitAudioContext?: any;
  ao3mock?: any;
  ao3modal?: any;
  AO3H?: any;
  AO3H_IconButton?: any;
  AO3H_wireHelpButtons?: (...args: any[]) => void;
  initializeTabInteractivity?: (...args: any[]) => void;
  updateScrollIndicators?: (...args: any[]) => void;
  lastMouseX?: number;
  lastMouseY?: number;

  [key: `AO3H_${string}`]: any;
  [key: `ao3h${string}`]: any;
  [key: `__AO3H_${string}`]: any;
}

declare const chrome: any;
declare const browser: any;

interface Element {
  __ao3hOpenGroupOnce?: boolean;
  __ao3hSetOpen?: (open: boolean) => void;
  _ao3hDt?: any;
  _onKey?: (event: KeyboardEvent) => void;
  _src?: string;

  closest<E extends Element = AO3HElement>(selectors: string): E | null;
}

interface ParentNode {
  querySelector<E extends Element = AO3HElement>(selectors: string): E | null;
  querySelectorAll<E extends Element = AO3HElement>(selectors: string): NodeListOf<E>;
}

interface Event {
  readonly detail?: any;
  readonly key?: string;
}
