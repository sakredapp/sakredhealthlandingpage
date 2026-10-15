/**
 * Build-time render of a page's first screen.
 *
 * scripts/prerender-shell.mjs builds this with Vite in SSR mode and writes the
 * markup into that page's HTML file, so a phone paints the real page (header,
 * headline, copy, images) as soon as the CSS lands instead of waiting for the
 * app's JavaScript. main.tsx then hydrates that markup in place: same DOM,
 * same classes, nothing re-paints.
 *
 * Pages are lazy-loaded chunks, so this waits for every Suspense boundary to
 * resolve (onAllReady) rather than emitting the loading spinner.
 */
import { renderToPipeableStream } from "react-dom/server";
import { Writable } from "node:stream";
import { Router } from "wouter";
import App from "./App";
import { queryClient } from "./lib/queryClient";

/**
 * `snapshots` are the build-time data copies written into this page's HTML
 * (window.__SAKRED_*__). Only those are visible during the render, and the
 * query cache starts empty, so each page renders exactly what its own HTML
 * gives the browser on hydration.
 */
export function render(path: string, snapshots: Record<string, unknown> = {}): Promise<string> {
  queryClient.clear();
  const globals = globalThis as Record<string, unknown>;
  for (const key of Object.keys(globals)) if (key.startsWith("__SAKRED_")) delete globals[key];
  Object.assign(globals, snapshots);
  return new Promise((resolve, reject) => {
    let html = "";
    const sink = new Writable({
      write(chunk, _encoding, done) {
        html += chunk.toString();
        done();
      },
      final(done) {
        resolve(html);
        done();
      },
    });
    const stream = renderToPipeableStream(
      <Router ssrPath={path}>
        <App />
      </Router>,
      {
        onAllReady() {
          stream.pipe(sink);
        },
        onShellError: reject,
        onError(error) {
          reject(error);
        },
      }
    );
    setTimeout(() => {
      stream.abort();
      reject(new Error(`render of ${path} timed out`));
    }, 20000).unref();
  });
}
