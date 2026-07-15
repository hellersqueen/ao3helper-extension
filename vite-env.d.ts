// Vite's `?inline` query returns the CSS file content as a plain string
// (see https://vite.dev/guide/features.html#css) — tsc has no built-in knowledge
// of this import suffix, so declare it here to stop false-positive TS2307 errors.
declare module '*.css?inline' {
  const css: string;
  export default css;
}
