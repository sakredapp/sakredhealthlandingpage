/**
 * Resolves on the visitor's first interaction with the page (scroll, wheel,
 * touch, pointer, key) or `ms` after window load, whichever comes first.
 *
 * Used to start work the first screen does not need (the hero map engine, the
 * homepage bands below the fold) without it competing with first paint. A
 * visitor who does anything at all gets it at once; one who just reads gets
 * it a few seconds after the page has finished loading.
 */
export function whenPageSettles(ms: number): { promise: Promise<void>; cancel: () => void } {
  const events = ["scroll", "wheel", "pointerdown", "pointermove", "keydown", "touchstart"];
  let done = false;
  let timer: number | undefined;
  let resolveFn: () => void = () => {};

  const cleanup = () => {
    events.forEach((e) => window.removeEventListener(e, fire, true));
    window.removeEventListener("load", onLoad);
    if (timer !== undefined) window.clearTimeout(timer);
  };
  function fire() {
    if (done) return;
    done = true;
    cleanup();
    resolveFn();
  }
  function onLoad() {
    timer = window.setTimeout(fire, ms);
  }

  const promise = new Promise<void>((resolve) => {
    resolveFn = resolve;
    events.forEach((e) => window.addEventListener(e, fire, { capture: true, passive: true }));
    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad, { once: true });
  });

  return {
    promise,
    cancel: () => {
      done = true;
      cleanup();
    },
  };
}
