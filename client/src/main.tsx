import { useEffect } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App";
import { endShellHydration } from "./components/motion";
import "./index.css";

const root = document.getElementById("root")!;

/**
 * dist/index.html carries the homepage's first screen prerendered at build
 * time (scripts/prerender-home.mjs, marked data-shell). When the visitor is on
 * that page, adopt the markup in place instead of re-creating it, so nothing
 * re-paints. Every other page, and any build without the shell, renders as
 * before.
 */
function Hydrated() {
  useEffect(() => endShellHydration(), []);
  return <App />;
}

if (root.hasAttribute("data-shell") && window.location.pathname === "/") {
  hydrateRoot(root, <Hydrated />);
} else {
  endShellHydration();
  createRoot(root).render(<App />);
}
