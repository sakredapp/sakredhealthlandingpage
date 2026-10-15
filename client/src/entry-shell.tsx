/**
 * Build-time render of the homepage's first screen.
 *
 * scripts/prerender-home.mjs builds this with Vite in SSR mode and writes the
 * markup into dist/index.html, so a phone paints the real hero (header, copy,
 * search, atlas) as soon as the CSS lands instead of waiting for the app's
 * JavaScript. main.tsx then hydrates that markup in place: same DOM, same
 * classes, nothing re-paints.
 *
 * Only "/" is rendered this way. Every other route keeps the plain SPA
 * template (dist/spa.html).
 */
import { renderToString } from "react-dom/server";
import { Router } from "wouter";
import App from "./App";

export function render(path: string): string {
  return renderToString(
    <Router ssrPath={path}>
      <App />
    </Router>
  );
}
