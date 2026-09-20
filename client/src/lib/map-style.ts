/**
 * The Sakred atlas — a MapLibre style built from scratch in the daylight palette.
 *
 * We author the style rather than theming someone else's because the map is
 * the first thing a visitor sees and it has to be the same material as the rest
 * of the page. Off-the-shelf light styles are grey-blue and label-heavy; this
 * one is warm ivory, sheds almost every label, and keeps roads as pale
 * structure rather than as the subject. The subject is the gold pins.
 *
 * ── Tiles ────────────────────────────────────────────────────────────
 *
 * Vector tiles come from OpenFreeMap by default: OpenStreetMap data in the
 * OpenMapTiles schema, free and keyless. Both are overridable, so moving to a
 * paid provider (or self-hosting) is an env change, not a rewrite:
 *
 *   VITE_MAP_STYLE_URL   a complete style JSON URL — bypasses everything here
 *   VITE_MAP_TILES_URL   TileJSON for an OpenMapTiles-schema source
 *   VITE_MAP_GLYPHS_URL  font glyph endpoint, `{fontstack}`/`{range}` templated
 *
 * Attribution is not optional and is not configurable away — OSM's licence
 * requires it, and MapLibre renders it into the corner of the canvas.
 */
import type { StyleSpecification } from "maplibre-gl";

const TILES_URL = import.meta.env.VITE_MAP_TILES_URL || "https://tiles.openfreemap.org/planet";
const GLYPHS_URL =
  import.meta.env.VITE_MAP_GLYPHS_URL ||
  "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf";

/** A complete style JSON, when someone has pointed us at a provider's own. */
export const STYLE_URL_OVERRIDE: string | undefined = import.meta.env.VITE_MAP_STYLE_URL;

export const MAP_ATTRIBUTION =
  '<a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">© OpenStreetMap</a> · <a href="https://openfreemap.org" target="_blank" rel="noopener">OpenFreeMap</a>';

/* ---------------------------------------------------------------- *
 * Palette — the same values as tailwind.config.ts `sakred.*`
 * ---------------------------------------------------------------- */
const C = {
  land: "#F1EEE7",
  landAlt: "#EDE8DE",
  water: "#DADFD9",
  waterEdge: "#CBD2C9",
  green: "#E4E7D9",
  building: "#E7E0D2",
  buildingEdge: "#DED5C4",
  roadMinor: "#FAF7F1",
  roadMain: "#FFFDF9",
  roadTrunk: "#F6EEDE",
  roadCasing: "#E2D7C2",
  boundary: "#D2C8B6",
  label: "#6E655A",
  labelStrong: "#453E34",
  halo: "#FFFDF9",
} as const;

const FONT_REGULAR = ["Noto Sans Regular"];
const FONT_BOLD = ["Noto Sans Bold"];

/**
 * Builds the style.
 *
 * `labels: false` strips every place name — used behind the homepage hero,
 * where the map is scenery and competing type would fight the headline. The
 * /discover map keeps labels, because there it is a tool and you need to know
 * which neighbourhood you are looking at.
 */
export function buildSakredMapStyle({ labels = true }: { labels?: boolean } = {}): StyleSpecification {
  const style: StyleSpecification = {
    version: 8,
    name: "Sakred Atlas",
    glyphs: GLYPHS_URL,
    sources: {
      openmaptiles: { type: "vector", url: TILES_URL, attribution: MAP_ATTRIBUTION },
    },
    layers: [
      { id: "background", type: "background", paint: { "background-color": C.land } },

      {
        id: "landcover",
        type: "fill",
        source: "openmaptiles",
        "source-layer": "landcover",
        paint: { "fill-color": C.green, "fill-opacity": 0.55 },
      },
      {
        id: "landuse",
        type: "fill",
        source: "openmaptiles",
        "source-layer": "landuse",
        paint: { "fill-color": C.landAlt, "fill-opacity": 0.6 },
      },
      {
        id: "park",
        type: "fill",
        source: "openmaptiles",
        "source-layer": "park",
        paint: { "fill-color": C.green, "fill-opacity": 0.75 },
      },

      {
        id: "water",
        type: "fill",
        source: "openmaptiles",
        "source-layer": "water",
        paint: { "fill-color": C.water },
      },
      {
        id: "waterway",
        type: "line",
        source: "openmaptiles",
        "source-layer": "waterway",
        paint: {
          "line-color": C.waterEdge,
          "line-width": ["interpolate", ["linear"], ["zoom"], 8, 0.5, 16, 2.4],
        },
      },

      /**
       * Buildings only appear at z14+. Below that they are a grey smear that
       * makes a city look dirty rather than dense.
       */
      {
        id: "building",
        type: "fill",
        source: "openmaptiles",
        "source-layer": "building",
        minzoom: 14,
        paint: {
          "fill-color": C.building,
          "fill-outline-color": C.buildingEdge,
          "fill-opacity": ["interpolate", ["linear"], ["zoom"], 14, 0, 16, 0.85],
        },
      },

      /* Roads: casing under fill, so junctions read as continuous ribbons
         rather than as overlapping strokes. */
      {
        id: "road-casing",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        filter: ["!in", "class", "path", "track", "ferry"],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": C.roadCasing,
          "line-opacity": 0.55,
          "line-width": [
            "interpolate",
            ["exponential", 1.5],
            ["zoom"],
            6, 1.2,
            12, 3.4,
            16, 11,
            20, 34,
          ],
        },
      },
      {
        id: "road-minor",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        filter: ["in", "class", "minor", "service", "residential"],
        minzoom: 12,
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": C.roadMinor,
          "line-width": ["interpolate", ["exponential", 1.5], ["zoom"], 12, 0.8, 16, 5, 20, 20],
        },
      },
      {
        id: "road-secondary",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        filter: ["in", "class", "secondary", "tertiary"],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": C.roadMain,
          "line-width": ["interpolate", ["exponential", 1.5], ["zoom"], 8, 0.6, 12, 2.2, 16, 7, 20, 24],
        },
      },
      {
        id: "road-primary",
        type: "line",
        source: "openmaptiles",
        "source-layer": "transportation",
        filter: ["in", "class", "primary", "trunk", "motorway"],
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": C.roadTrunk,
          "line-width": ["interpolate", ["exponential", 1.5], ["zoom"], 5, 0.8, 10, 2.6, 14, 6.5, 20, 28],
        },
      },

      {
        id: "boundary-state",
        type: "line",
        source: "openmaptiles",
        "source-layer": "boundary",
        filter: ["<=", "admin_level", 4],
        layout: { "line-join": "round" },
        paint: {
          "line-color": C.boundary,
          "line-dasharray": [3, 2],
          "line-width": ["interpolate", ["linear"], ["zoom"], 3, 0.5, 10, 1.4],
        },
      },
    ],
  };

  if (labels) {
    style.layers.push(
      {
        id: "place-city",
        type: "symbol",
        source: "openmaptiles",
        "source-layer": "place",
        filter: ["in", "class", "city", "town"],
        layout: {
          "text-field": ["get", "name"],
          "text-font": FONT_BOLD,
          "text-size": ["interpolate", ["linear"], ["zoom"], 4, 10, 10, 15],
          "text-letter-spacing": 0.06,
          "text-max-width": 8,
        },
        paint: {
          "text-color": C.labelStrong,
          "text-halo-color": C.halo,
          "text-halo-width": 1.6,
        },
      },
      {
        id: "place-minor",
        type: "symbol",
        source: "openmaptiles",
        "source-layer": "place",
        filter: ["in", "class", "village", "suburb", "neighbourhood"],
        minzoom: 11,
        layout: {
          "text-field": ["get", "name"],
          "text-font": FONT_REGULAR,
          "text-size": 11,
          "text-letter-spacing": 0.08,
          "text-transform": "uppercase",
          "text-max-width": 9,
        },
        paint: {
          "text-color": C.label,
          "text-halo-color": C.halo,
          "text-halo-width": 1.4,
        },
      }
    );
  }

  return style;
}
