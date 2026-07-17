// Ambient declarations for userscript-manager globals (Tampermonkey/Violentmonkey)
// and cross-module globals this project attaches to `window` at runtime.
// tsc has no built-in knowledge of these — declared here to stop false-positive
// TS2304/TS2339 errors without touching runtime code.

export {};

declare global {
  type AO3HElement = HTMLElement & HTMLAnchorElement & HTMLInputElement & HTMLSelectElement & HTMLFormElement;
  const unsafeWindow: Window & typeof globalThis;
  const GM_getValue: <T = any>(key: string, defaultValue?: T) => T;
  const GM_setValue: (key: string, value: unknown) => void;
  const GM_deleteValue: (name: string) => void;
  const GM_addStyle: (css: string) => HTMLStyleElement;
  const GM_registerMenuCommand: (
    caption: string,
    onClick: (event: MouseEvent | KeyboardEvent) => void,
    optionsOrAccessKey?: string | Record<string, unknown>
  ) => string | number;
  const GM_xmlhttpRequest: (details: Record<string, any>) => any;

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

    // Per-module namespacing convention: each feature module attaches
    // itself as window.AO3H_<Name> / window.ao3h<Action> / window.__AO3H_<FLAG>__
    // for cross-module access — see e.g. wordSwap.js's `W.AO3H_WordSwap = {...}`.
    [key: `AO3H_${string}`]: any;
    [key: `ao3h${string}`]: any;
    [key: `__AO3H_${string}`]: any;
  }

  const chrome: any;
  const browser: any;

  // Ad-hoc properties this project attaches to specific elements at runtime.
  interface Element {
    __ao3hOpenGroupOnce?: boolean;
    __ao3hSetOpen?: (open: boolean) => void;
    _ao3hDt?: any;
    _onKey?: (event: KeyboardEvent) => void;
    _src?: string;

    // Feature modules only query HTML pages. Give unqualified selectors the
    // useful HTML default while preserving explicit generic selector types.
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

}
