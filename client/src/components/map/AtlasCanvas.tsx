/**
 * The drawn atlas — an SVG stand-in for the live map.
 *
 * Three jobs, all the same picture:
 *   · what shows while MapLibre downloads and the first tiles land
 *   · what shows if tiles can't be reached at all
 *   · the ambient background for sections that want the atlas language but
 *     have no coordinates to show (the empty-city state, the app band)
 *
 * It is drawn, not a screenshot of a real place: an invented coastline and
 * contour set. A blurred picture of an actual city would imply the network
 * covers it.
 *
 * Everything is one inline SVG with no external request, so it paints in the
 * same frame as the rest of the hero.
 */
interface AtlasCanvasProps {
  className?: string;
  /** Adds slow drift to the contour group. Off inside a live map's backdrop. */
  animated?: boolean;
}

export function AtlasCanvas({ className, animated = false }: AtlasCanvasProps) {
  return (
    <div className={`overflow-hidden bg-sakred-canvas ${className ?? ""}`} aria-hidden="true">
      <svg
        viewBox="0 0 800 600"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
        role="presentation"
      >
        <defs>
          {/* The graticule: a surveyor's grid, kept faint enough to read as
              paper texture until you look for it. */}
          <pattern id="atlas-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0H0V40" fill="none" stroke="#1C1A17" strokeOpacity="0.045" strokeWidth="1" />
          </pattern>
          <linearGradient id="atlas-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F1EEE7" stopOpacity="0" />
            <stop offset="100%" stopColor="#F1EEE7" stopOpacity="0.55" />
          </linearGradient>
        </defs>

        <rect width="800" height="600" fill="#F1EEE7" />
        <rect width="800" height="600" fill="url(#atlas-grid)" />

        {/* Water body — the one large shape that gives the plate composition. */}
        <path
          d="M0 452c78-6 132-34 196-31s96 33 158 27 96-42 168-38 118 34 180 26 74-22 98-31v195H0z"
          fill="#DADFD9"
          fillOpacity="0.85"
        />
        <path
          d="M0 452c78-6 132-34 196-31s96 33 158 27 96-42 168-38 118 34 180 26 74-22 98-31"
          fill="none"
          stroke="#C7CFC6"
          strokeWidth="1.5"
        />

        {/* Parkland */}
        <path
          d="M92 148c56-26 118-14 148 22s16 86-30 106-108 6-134-32 -40-70 16-96z"
          fill="#E4E7D9"
          fillOpacity="0.9"
        />
        <path
          d="M596 96c44 4 78 40 74 84s-46 74-88 66-70-48-60-92 30-62 74-58z"
          fill="#E4E7D9"
          fillOpacity="0.75"
        />

        {/* Contours — the gold "terrain" lines. Nested, never crossing. */}
        <g
          fill="none"
          stroke="#C5A059"
          strokeOpacity="0.28"
          strokeWidth="1"
          className={animated ? "animate-drift" : undefined}
        >
          <path d="M-40 330c120-58 208 24 322-10s176-104 300-72 246 18 268-4" />
          <path d="M-40 366c126-56 214 26 328-10s180-100 302-68 240 16 262-6" />
          <path d="M-40 402c132-54 220 28 334-10s184-96 304-64 234 14 256-8" />
          <path d="M-40 122c98 44 174-26 268-6s142 76 246 54 200-46 246-24" />
          <path d="M-40 86c104 44 180-26 274-6s146 74 250 52 196-44 242-22" />
        </g>

        {/* Roads: the pale structure that makes it read as a street map rather
            than a topographic one. */}
        <g stroke="#FFFDF9" strokeWidth="7" strokeLinecap="round" fill="none">
          <path d="M-20 258h840" />
          <path d="M188 -20v560" />
          <path d="M552 -20v560" />
          <path d="M-20 62c180 34 300 130 420 148s280 6 420-40" />
        </g>
        <g stroke="#F6EEDE" strokeWidth="3" strokeLinecap="round" fill="none" strokeOpacity="0.9">
          <path d="M-20 178h840" />
          <path d="M-20 340h840" />
          <path d="M330 -20v560" />
          <path d="M700 -20v560" />
        </g>

        {/* Coordinate ticks — the small marginalia that says "atlas". */}
        <g fill="#1C1A17" fillOpacity="0.16">
          {[80, 200, 320, 440, 560, 680].map((x) => (
            <rect key={x} x={x} y="8" width="1" height="7" />
          ))}
          {[80, 200, 320, 440].map((y) => (
            <rect key={y} x="8" y={y} width="7" height="1" />
          ))}
        </g>

        <rect width="800" height="600" fill="url(#atlas-fade)" />
      </svg>
    </div>
  );
}
