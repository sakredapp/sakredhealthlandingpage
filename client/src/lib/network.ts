/**
 * Client-side access to the Sakred Health Network.
 *
 * Every network read on the site goes through a hook in this file, so there is
 * exactly one place that knows the route shapes, the cache policy, and — most
 * importantly — how to tell "no results here" apart from "we couldn't ask".
 * The pages downstream branch on `available`, and getting that wrong is how a
 * site ends up claiming a city has no practitioners because an env var is
 * missing.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import type {
  HealthLocation,
  HealthPractitioner,
  LocationSummary,
  MapBounds,
  Modality,
  NetworkSearchResult,
  VerificationState,
} from "@shared/health-network";
import type {
  MediaKind,
  MediaUploadResult,
  RecommendationInput,
} from "@shared/network-submissions";
import { MEDIA_MAX_BYTES } from "@shared/network-submissions";

/* ==================================================================== *
 * Query shape
 * ==================================================================== */

export interface DiscoverQuery {
  q?: string;
  modalities?: string[];
  /** From `/discover/:modality/:city`; sent as the search function's text query. */
  city?: string;
  bounds?: MapBounds | null;
  openNow?: boolean;
  sameDay?: boolean;
  walkIns?: boolean;
  minVerification?: VerificationState | null;
  limit?: number;
}

/** Stable, sorted query string — two equivalent queries must hit one cache key. */
function toSearchParams(query: DiscoverQuery): string {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.modalities?.length) params.set("modalities", [...query.modalities].sort().join(","));
  if (query.city) params.set("city", query.city);
  if (query.bounds) {
    const b = query.bounds;
    params.set(
      "bounds",
      [b.south, b.west, b.north, b.east].map((n) => n.toFixed(5)).join(",")
    );
  }
  if (query.openNow) params.set("openNow", "true");
  if (query.sameDay) params.set("sameDay", "true");
  if (query.walkIns) params.set("walkIns", "true");
  if (query.minVerification) params.set("verification", query.minVerification);
  if (query.limit) params.set("limit", String(query.limit));
  return params.toString();
}

/**
 * The result the whole site renders against.
 *
 * `available: false` is not an error state and is not a loading state — it is
 * "the network is not live here". Pages show the Recommend path for it, which
 * is a real, useful thing for a visitor to do.
 */
export interface NetworkResult<T> {
  data: T;
  isLoading: boolean;
  /** The network answered. */
  available: boolean;
  /** The network answered and had nothing to say for this query. */
  isEmpty: boolean;
}

const EMPTY_RESULT: NetworkSearchResult = { locations: [], total: 0, available: false };

/* ==================================================================== *
 * Search
 * ==================================================================== */

/**
 * Searches the network.
 *
 * `enabled` exists for the map: a viewport search must not fire until the map
 * has actually reported a viewport, or the first request is for the whole
 * planet and is thrown away a frame later.
 */
export function useNetworkSearch(
  query: DiscoverQuery,
  { enabled = true }: { enabled?: boolean } = {}
): NetworkResult<NetworkSearchResult> {
  const qs = toSearchParams(query);

  const { data, isLoading } = useQuery<NetworkSearchResult>({
    queryKey: ["/api/network/search", qs],
    queryFn: async () => {
      const res = await fetch(`/api/network/search${qs ? `?${qs}` : ""}`);
      if (!res.ok) return EMPTY_RESULT;
      return res.json();
    },
    enabled,
    // Directory data changes on publication, not per visit; but unlike the
    // global default (staleTime: Infinity) a visitor panning the map back to a
    // previous viewport after a few minutes should get fresh results.
    staleTime: 60_000,
  });

  const result = data ?? EMPTY_RESULT;
  return {
    data: result,
    isLoading,
    available: result.available,
    isEmpty: result.available && result.locations.length === 0,
  };
}

/* ==================================================================== *
 * Modalities
 * ==================================================================== */

export function useModalities(): NetworkResult<Modality[]> {
  const { data, isLoading } = useQuery<{ modalities: Modality[]; available: boolean }>({
    queryKey: ["/api/network/modalities"],
    queryFn: async () => {
      const res = await fetch("/api/network/modalities");
      if (!res.ok) return { modalities: [], available: false };
      return res.json();
    },
    staleTime: 10 * 60_000,
  });

  const modalities = data?.modalities ?? [];
  return {
    data: modalities,
    isLoading,
    available: Boolean(data?.available),
    isEmpty: Boolean(data?.available) && modalities.length === 0,
  };
}

/**
 * The modalities worth linking to as destinations.
 *
 * A modality with no published locations is still a valid filter chip — it
 * just isn't a page. This is the guard against generating a thousand thin
 * category pages (brief §8).
 */
export function useLinkableModalities(): Modality[] {
  const { data } = useModalities();
  return useMemo(() => data.filter((m) => (m.locationCount ?? 0) > 0), [data]);
}

/* ==================================================================== *
 * Single records
 * ==================================================================== */

export interface LocationPageData {
  location: HealthLocation;
  nearby: LocationSummary[];
}

export function useLocation(slug: string | undefined) {
  return useQuery<LocationPageData | null>({
    queryKey: ["/api/network/locations", slug],
    queryFn: async () => {
      const res = await fetch(`/api/network/locations/${encodeURIComponent(slug!)}`);
      // 404 (not published) and 503 (can't reach the network) both mean "no
      // page to render", but the caller distinguishes them via `isError`.
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(String(res.status));
      return res.json();
    },
    enabled: Boolean(slug),
    staleTime: 5 * 60_000,
  });
}

export function usePractitioner(slug: string | undefined) {
  return useQuery<{ practitioner: HealthPractitioner } | null>({
    queryKey: ["/api/network/practitioners", slug],
    queryFn: async () => {
      const res = await fetch(`/api/network/practitioners/${encodeURIComponent(slug!)}`);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(String(res.status));
      return res.json();
    },
    enabled: Boolean(slug),
    staleTime: 5 * 60_000,
  });
}

/* ==================================================================== *
 * Recommendations
 * ==================================================================== */

/**
 * Files a public recommendation.
 *
 * Posts to the server route, never to Supabase — the browser has no key and no
 * direct path to the queue. The Turnstile token and honeypot ride along and are
 * checked server-side; nothing here can influence provenance or status.
 */
export function useRecommendMutation() {
  return useMutation({
    mutationFn: async (
      input: RecommendationInput & {
        memberId?: string | null;
        turnstileToken?: string;
        website_url?: string;
      }
    ) => {
      const res = await fetch("/api/network/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error || "Something went wrong. Please try again.");
      return body as { ok: true };
    },
  });
}

/* ==================================================================== *
 * Application media
 * ==================================================================== */

/**
 * Uploads one application photo.
 *
 * Sends the file to our own server, never to storage directly. The server holds
 * the only credential that can write to the app's private application-media
 * bucket, and it re-encodes every image on the way through — which is what
 * strips the GPS coordinates and device serial that phone cameras write into
 * practice photos. A signed direct-upload URL would skip both of those.
 *
 * The token came back from the application submission and is scoped to that one
 * submission; it is not a session and grants no read access.
 */
export async function uploadApplicationMedia(args: {
  token: string;
  kind: MediaKind;
  file: File;
}): Promise<MediaUploadResult> {
  if (args.file.size > MEDIA_MAX_BYTES) {
    return { ok: false, error: "That image is over 12MB." };
  }

  const data = await fileToDataUrl(args.file);

  const res = await fetch("/api/network/application-media", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: args.token, kind: args.kind, data }),
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, error: body?.error || "That image didn't upload." };
  return { ok: true, kind: args.kind, path: body?.path };
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read that file."));
    reader.readAsDataURL(file);
  });
}

/* ==================================================================== *
 * Map plumbing
 * ==================================================================== */

/**
 * Holds the map's viewport and tells you when it has drifted away from the
 * results on screen.
 *
 * Deliberately *not* a live query: re-querying on every camera frame would
 * mean dozens of requests per drag and a result list that reshuffles under the
 * user's cursor. The map reports where it is; the user decides when to search
 * there (brief §5).
 */
export function usePendingViewport() {
  const [committed, setCommitted] = useState<MapBounds | null>(null);
  const [current, setCurrent] = useState<MapBounds | null>(null);
  const firstReport = useRef(true);
  /** Mirrors `current` so `commit` can read it without being re-created on
   *  every camera move (it is a dependency of the button that calls it). */
  const currentRef = useRef<MapBounds | null>(null);

  const onViewportChange = useCallback((bounds: MapBounds) => {
    currentRef.current = bounds;
    setCurrent(bounds);
    // The map's opening report is where we put it, not where the user went.
    if (firstReport.current) {
      firstReport.current = false;
      setCommitted(bounds);
    }
  }, []);

  const commit = useCallback(() => setCommitted(currentRef.current), []);

  /**
   * True once the viewport has moved far enough to be looking somewhere else.
   *
   * A tolerance rather than strict inequality: a two-pixel nudge, or the
   * rounding that comes back from `fitBounds`, should not put a "Search this
   * area" button on screen.
   */
  const hasMoved = useMemo(() => {
    if (!current || !committed) return false;
    const span = Math.max(committed.north - committed.south, 0.0001);
    const drift =
      Math.abs(current.north - committed.north) +
      Math.abs(current.south - committed.south) +
      Math.abs(current.east - committed.east) +
      Math.abs(current.west - committed.west);
    return drift > span * 0.35;
  }, [current, committed]);

  return { bounds: committed, pendingBounds: current, hasMoved, onViewportChange, commit };
}

/**
 * Debounces a value — used for the search field so typing "acupuncture" is one
 * request rather than eleven.
 */
export function useDebounced<T>(value: T, ms = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return debounced;
}
