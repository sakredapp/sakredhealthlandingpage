import { startTransition, useEffect } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App";
import { endShellHydration } from "./components/motion";
import "./index.css";

const root = document.getElementById("root")!;

/**
 * Some pages carry their first screen prerendered at build time
 * (scripts/prerender-shell.mjs): the root is marked data-shell="<path>". When
 * the visitor is on that path, adopt the markup in place instead of
 * re-creating it, so nothing re-paints. Every other page, and any build
 * without the shell, renders as before.
 */
function Hydrated() {
  useEffect(() => endShellHydration(), []);
  return <App />;
}

const shellPath = root.getAttribute("data-shell");
const here = window.location.pathname.replace(/\/+$/, "") || "/";
// The shell was rendered without a query string. A query that changes what
// the page shows (/discover?q=..., /blog?category=...) gets a fresh render;
// ad and campaign tags don't change the page, so those still hydrate.
const plainQuery = Array.from(new URLSearchParams(window.location.search).keys()).every((key) =>
  /^(utm_|fbclid$|gclid$|msclkid$|ttclid$|ref$)/.test(key)
);

if (shellPath !== null && (shellPath || "/") === here && plainQuery) {
  // As a transition, React adopts the page in small slices and yields to the
  // browser between them, instead of one long task that holds up a tap.
  startTransition(() => {
    hydrateRoot(root, <Hydrated />);
  });
} else {
  endShellHydration();
  createRoot(root).render(<App />);
}
