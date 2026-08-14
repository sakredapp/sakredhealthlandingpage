/**
 * The Sakred map.
 *
 * One component serves both the homepage hero (scenery: no controls, no
 * labels, slow drift) and /discover (a tool: controls, labels, "search this
 * area"). Keeping them the same component is what makes the pin you see in the
 * hero and the pin you click on /discover feel like the same object.
 *
 * ── Weight ───────────────────────────────────────────────────────────
 *
 * MapLibre and its stylesheet are ~250KB gzipped and are `import()`ed on
 * mount, never at module scope. A page with no map — /blog, /products,
 * /food-chart — must not download a map engine (brief §29), and the homepage
 * must not block first paint on one either: the atlas fallback renders
 * immediately and the live map fades over it when ready.
 *
 * ── Markers ──────────────────────────────────────────────────────────
 *
 * Pins are DOM markers, not a symbol layer. A GL symbol layer would be faster
 * at thousands of points, but at the scale of a curated network it costs the
 * things that matter more: CSS transitions, focusable/keyboard-reachable pins,
 * and a selected state that can share exactly the gold the rest of the site
 * uses.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import type { Map as MapLibreMap, Marker } from "maplibre-gl";
import type { LocationSummary, MapBounds } from "@shared/health-network";
import { buildSakredMapStyle, STYLE_URL_OVERRIDE } from "@/lib/map-style";
import { AtlasCanvas } from "./AtlasCanvas";

export interface SakredMapProps {
  locations: LocationSummary[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  /** [lng, lat]. Defaults to a continental US view. */
  center?: [number, number];
  zoom?: number;
  /** Scenery mode: no drag/scroll, no controls, no labels. */
  interactive?: boolean;
  showControls?: boolean;
  labels?: boolean;
  /** Fired on `moveend` for user-driven moves only — never for `fitBounds`. */
  onViewportChange?: (bounds: MapBounds) => void;
  /** Frame all pins once they arrive. */
  fitToLocations?: boolean;
  className?: string;
  /** Describes the map to screen readers. Required — this is real content. */
  ariaLabel: string;
}

const DEFAULT_CENTER: [number, number] = [-98.5, 39.5];
const DEFAULT_ZOOM = 3.4;

/* ---------------------------------------------------------------- *
 * Marker element
 * ---------------------------------------------------------------- */

/**
 * Builds a pin.
 *
 * A `<button>` rather than a `<div>`: pins are the primary way to select a
 * practice, so they have to be tab-reachable and Enter-activatable. MapLibre
 * is happy to host any element.
 */
function createPinElement(location: LocationSummary, index: number): HTMLButtonElement {
  const el = document.createElement("button");
  el.type = "button";
  el.className = "sakred-pin";
  el.setAttribute("aria-label", `${location.name}, ${location.city}`);
  el.style.setProperty("--pin-delay", `${Math.min(index * 0.07, 0.7)}s`);
  el.innerHTML =
    '<span class="sakred-pin__halo" aria-hidden="true"></span>' +
    '<span class="sakred-pin__dot" aria-hidden="true"></span>';
  return el;
}

/* ---------------------------------------------------------------- *
 * Component
 * ---------------------------------------------------------------- */

export function SakredMap({
  locations,
  selectedId,
  onSelect,
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  interactive = true,
  showControls = true,
  labels = true,
  onViewportChange,
  fitToLocations = false,
  className,
  ariaLabel,
}: SakredMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef(new Map<string, Marker>());
  /** Set while the map moves itself, so programmatic moves don't look like
   *  the user panning and don't trigger "Search this area". */
  const selfMoveRef = useRef(false);
  const onViewportChangeRef = useRef(onViewportChange);
  const onSelectRef = useRef(onSelect);

  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const reduced = useReducedMotion();

  // Keep callbacks fresh without re-running the (expensive) map setup effect.
  useEffect(() => {
    onViewportChangeRef.current = onViewportChange;
    onSelectRef.current = onSelect;
  });

  /* ---- create the map once -------------------------------------- */
  useEffect(() => {
    let cancelled = false;
    const container = containerRef.current;
    if (!container) return;

    (async () => {
      try {
        const [{ default: maplibregl }] = await Promise.all([
          import("maplibre-gl"),
          import("maplibre-gl/dist/maplibre-gl.css"),
        ]);
        if (cancelled || !containerRef.current) return;

        const map = new maplibregl.Map({
          container: containerRef.current,
          style: STYLE_URL_OVERRIDE || buildSakredMapStyle({ labels }),
          center,
          zoom,
          interactive,
          attributionControl: { compact: true },
          // The atlas reads as a drawn map, not a satellite view: no tilt,
          // no rotation, so north is always up and pins never overlap oddly.
          pitchWithRotate: false,
          dragRotate: false,
          touchZoomRotate: interactive,
          // Nothing on this site needs a scroll gesture stolen from the page.
          scrollZoom: interactive,
          fadeDuration: reduced ? 0 : 300,
        });

        map.touchZoomRotate?.disableRotation();
        if (showControls) {
          map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
        }

        map.on("load", () => {
          if (cancelled) return;
          mapRef.current = map;
          setReady(true);

          /**
           * Report the opening viewport so the consumer has a baseline to
           * compare against. Without it the very first pan looks like the
           * first report, gets adopted as the baseline, and silently re-runs
           * the search instead of offering "Search this area".
           */
          const b = map.getBounds();
          onViewportChangeRef.current?.({
            north: b.getNorth(),
            south: b.getSouth(),
            east: b.getEast(),
            west: b.getWest(),
          });
        });

        map.on("error", (event: any) => {
          // Style/tile failures are the common case (offline, blocked host).
          // Surface them as the designed fallback rather than a blank rectangle.
          const message = String(event?.error?.message ?? "");
          if (/style|source|tile|fetch|Failed/i.test(message)) setFailed(true);
        });

        map.on("moveend", () => {
          if (selfMoveRef.current) {
            selfMoveRef.current = false;
            return;
          }
          const b = map.getBounds();
          onViewportChangeRef.current?.({
            north: b.getNorth(),
            south: b.getSouth(),
            east: b.getEast(),
            west: b.getWest(),
          });
        });
      } catch (err) {
        console.error("[SakredMap] failed to initialise:", err);
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
      markersRef.current.forEach((m) => m.remove());
      markersRef.current.clear();
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // Intentionally once: `center`/`zoom`/`labels` are initial state. Later
    // camera changes go through the effects below, which animate instead of
    // tearing the map down and rebuilding it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---- sync markers to `locations` ------------------------------- */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;

    let cancelled = false;
    (async () => {
      const { default: maplibregl } = await import("maplibre-gl");
      if (cancelled || !mapRef.current) return;

      const markers = markersRef.current;
      const wanted = new Set(locations.map((l) => l.id));

      // Collect before deleting: mutating a Map while iterating it is asking
      // for a marker to survive a filter change and float over the wrong city.
      const stale: string[] = [];
      markers.forEach((marker, id) => {
        if (!wanted.has(id)) {
          marker.remove();
          stale.push(id);
        }
      });
      stale.forEach((id) => markers.delete(id));

      locations.forEach((location, index) => {
        if (markers.has(location.id)) return;
        if (!Number.isFinite(location.lat) || !Number.isFinite(location.lng)) return;

        const el = createPinElement(location, index);
        el.addEventListener("click", (event) => {
          event.stopPropagation();
          onSelectRef.current?.(location.id);
        });

        const marker = new maplibregl.Marker({ element: el, anchor: "center" })
          .setLngLat([location.lng, location.lat])
          .addTo(map);
        markers.set(location.id, marker);
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [locations, ready]);

  /* ---- selected state + camera framing --------------------------- */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;

    markersRef.current.forEach((marker, id) => {
      marker.getElement().classList.toggle("is-selected", id === selectedId);
    });

    if (!selectedId) return;
    const target = locations.find((l) => l.id === selectedId);
    if (!target) return;

    selfMoveRef.current = true;
    map.easeTo({
      center: [target.lng, target.lat],
      zoom: Math.max(map.getZoom(), 12.5),
      duration: reduced ? 0 : 700,
      essential: true,
    });
  }, [selectedId, locations, ready, reduced]);

  /* ---- fit to results -------------------------------------------- */
  const fitted = useRef(false);
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || !fitToLocations || fitted.current) return;
    if (locations.length === 0) return;

    fitted.current = true;
    selfMoveRef.current = true;

    if (locations.length === 1) {
      map.easeTo({ center: [locations[0].lng, locations[0].lat], zoom: 12.5, duration: 0 });
      return;
    }

    const lats = locations.map((l) => l.lat);
    const lngs = locations.map((l) => l.lng);
    map.fitBounds(
      [
        [Math.min(...lngs), Math.min(...lats)],
        [Math.max(...lngs), Math.max(...lats)],
      ],
      { padding: 72, maxZoom: 13, duration: reduced ? 0 : 800 }
    );
  }, [locations, ready, fitToLocations, reduced]);

  /** Public-ish escape hatch used by "Search this area". */
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    // Let the page scroll past a scenery map instead of trapping arrow keys.
    if (!interactive) event.stopPropagation();
  }, [interactive]);

  return (
    <div className={`relative ${className ?? ""}`}>
      {/* The designed atlas sits underneath at all times: it is the loading
          state, the offline state, and the backdrop the live map fades over,
          so the area is never an empty rectangle. */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ${
          ready && !failed ? "opacity-0" : "opacity-100"
        }`}
        aria-hidden={ready && !failed}
      >
        <AtlasCanvas className="h-full w-full" />
      </div>

      <div
        ref={containerRef}
        role="application"
        aria-label={ariaLabel}
        onKeyDown={handleKeyDown}
        className={`h-full w-full transition-opacity duration-700 ${
          ready && !failed ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}
