import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";

// Chart palette validated for CVD separation + contrast on white
// (deepened brand gold + companion blue; brand #C5A059 is too light for marks).
const SERIES_COLORS = ["#B58527", "#3B6FC4"];
// Semantic colors for before/after comparisons — validated for colorblind
// separation and contrast, so a swap reads instantly without the caption.
const TONE_COLORS: Record<string, string> = { bad: "#C1442E", good: "#2E7D53", neutral: "#8A8578" };
const INK = "#0F172A";

/* ---------------------------------- stats --------------------------------- */

interface StatSpec {
  value?: number;
  display?: string;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  label: string;
  source?: string;
}

function CountUp({ stat }: { stat: StatSpec }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [shown, setShown] = useState(0);
  const target = stat.value ?? 0;
  const decimals = stat.decimals ?? (Number.isInteger(target) ? 0 : 1);

  useEffect(() => {
    if (!inView) return;
    const duration = 1100;
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setShown(target * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, target]);

  const text =
    stat.display ??
    `${stat.prefix ?? ""}${shown.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}${stat.suffix ?? ""}`;

  return (
    <span ref={ref} className="tabular-nums">
      {text}
    </span>
  );
}

export function BlogStats({ stats }: { stats: StatSpec[] }) {
  return (
    <div className="not-prose my-8 grid grid-cols-2 gap-3 lg:grid-cols-2">
      {stats.map((s, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.45, delay: (i % 4) * 0.08, ease: "easeOut" }}
          className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-5 shadow-sm"
        >
          <div className="font-display text-2xl sm:text-3xl text-[#0F172A]">
            <CountUp stat={s} />
          </div>
          <div className="mt-1 text-sm leading-snug text-[#0F172A]/70">{s.label}</div>
          {s.source && (
            <div className="mt-2 text-xs text-[#0F172A]/45">{s.source}</div>
          )}
        </motion.div>
      ))}
    </div>
  );
}

/* ---------------------------------- chart --------------------------------- */

interface ChartSpec {
  type: "bar" | "hbar" | "line";
  title?: string;
  data: Array<{ label: string; value: number; value2?: number; tone?: "good" | "bad" | "neutral" }>;
  series?: [string] | [string, string];
  prefix?: string;
  suffix?: string;
  source?: string;
  height?: number;
}

function formatValue(v: number, spec: ChartSpec) {
  return `${spec.prefix ?? ""}${v.toLocaleString("en-US")}${spec.suffix ?? ""}`;
}

function ChartTooltip({ active, payload, label, spec }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-stone-200 bg-white px-3 py-2 shadow-md">
      <div className="text-xs font-medium text-[#0F172A]">{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} className="mt-0.5 flex items-center gap-1.5 text-xs text-[#0F172A]/70">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: p.color || p.fill }}
          />
          {p.name !== "value" && p.name !== "value2" ? `${p.name}: ` : ""}
          <span className="tabular-nums">{formatValue(p.value, spec)}</span>
        </div>
      ))}
    </div>
  );
}

export function BlogChart({ spec }: { spec: ChartSpec }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const twoSeries = spec.data.some((d) => typeof d.value2 === "number");
  const names = spec.series ?? [];
  const height = spec.height ?? (spec.type === "hbar" ? Math.max(200, spec.data.length * 44) : 280);
  const axisTick = { fill: "rgba(15,23,42,0.55)", fontSize: 12 };
  const gridStroke = "rgba(15,23,42,0.07)";

  return (
    <motion.figure
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="not-prose my-8 rounded-2xl border border-stone-200 bg-white p-4 sm:p-6 shadow-sm"
    >
      {spec.title && (
        <div className="mb-1 text-sm font-medium text-[#0F172A]">{spec.title}</div>
      )}
      {twoSeries && names.length === 2 && (
        <div className="mb-3 flex flex-wrap gap-4">
          {names.map((n, i) => (
            <span key={n} className="flex items-center gap-1.5 text-xs text-[#0F172A]/70">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: SERIES_COLORS[i] }}
              />
              {n}
            </span>
          ))}
        </div>
      )}
      <div style={{ height }} className="mt-2">
        {inView && (
          <ResponsiveContainer width="100%" height="100%">
            {spec.type === "line" ? (
              <LineChart data={spec.data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke={gridStroke} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={axisTick} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={axisTick}
                  width={54}
                  tickFormatter={(v: number) => formatValue(v, spec)}
                />
                <Tooltip content={<ChartTooltip spec={spec} />} cursor={{ stroke: gridStroke }} />
                <Line
                  dataKey="value"
                  name={names[0] ?? "value"}
                  stroke={SERIES_COLORS[0]}
                  strokeWidth={2}
                  dot={{ r: 3, fill: SERIES_COLORS[0], strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                  animationDuration={900}
                />
                {twoSeries && (
                  <Line
                    dataKey="value2"
                    name={names[1] ?? "value2"}
                    stroke={SERIES_COLORS[1]}
                    strokeWidth={2}
                    dot={{ r: 3, fill: SERIES_COLORS[1], strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                    animationDuration={900}
                  />
                )}
              </LineChart>
            ) : spec.type === "hbar" ? (
              <BarChart
                data={spec.data}
                layout="vertical"
                margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
                barCategoryGap="28%"
              >
                <CartesianGrid horizontal={false} stroke={gridStroke} />
                <XAxis
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  tick={axisTick}
                  tickFormatter={(v: number) => formatValue(v, spec)}
                />
                <YAxis
                  type="category"
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={axisTick}
                  width={150}
                />
                <Tooltip content={<ChartTooltip spec={spec} />} cursor={{ fill: "rgba(15,23,42,0.04)" }} />
                <Bar
                  dataKey="value"
                  name={names[0] ?? "value"}
                  fill={SERIES_COLORS[0]}
                  radius={[0, 4, 4, 0]}
                  barSize={18}
                  animationDuration={900}
                >
                  {spec.data.map((d, i) => (
                    <Cell key={i} fill={d.tone ? TONE_COLORS[d.tone] : SERIES_COLORS[0]} />
                  ))}
                </Bar>
                {twoSeries && (
                  <Bar
                    dataKey="value2"
                    name={names[1] ?? "value2"}
                    fill={SERIES_COLORS[1]}
                    radius={[0, 4, 4, 0]}
                    barSize={18}
                    animationDuration={900}
                  />
                )}
              </BarChart>
            ) : (
              <BarChart data={spec.data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }} barCategoryGap="28%">
                <CartesianGrid vertical={false} stroke={gridStroke} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={axisTick} interval={0} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={axisTick}
                  width={54}
                  tickFormatter={(v: number) => formatValue(v, spec)}
                />
                <Tooltip content={<ChartTooltip spec={spec} />} cursor={{ fill: "rgba(15,23,42,0.04)" }} />
                <Bar
                  dataKey="value"
                  name={names[0] ?? "value"}
                  fill={SERIES_COLORS[0]}
                  radius={[4, 4, 0, 0]}
                  barSize={28}
                  animationDuration={900}
                >
                  {spec.data.map((d, i) => (
                    <Cell key={i} fill={d.tone ? TONE_COLORS[d.tone] : SERIES_COLORS[0]} />
                  ))}
                </Bar>
                {twoSeries && (
                  <Bar
                    dataKey="value2"
                    name={names[1] ?? "value2"}
                    fill={SERIES_COLORS[1]}
                    radius={[4, 4, 0, 0]}
                    barSize={28}
                    animationDuration={900}
                  />
                )}
              </BarChart>
            )}
          </ResponsiveContainer>
        )}
      </div>
      {spec.source && (
        <figcaption className="mt-3 text-xs text-[#0F172A]/45">
          Source: {spec.source}
        </figcaption>
      )}
    </motion.figure>
  );
}

/* ------------------------- markdown fence integration ---------------------- */

function parseJson<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/** Renders a ```stats or ```chart fenced block; returns null if not one. */
export function DataFence({ language, raw }: { language: string; raw: string }) {
  if (language === "stats") {
    const stats = parseJson<StatSpec[]>(raw);
    return stats ? <BlogStats stats={stats} /> : null;
  }
  if (language === "chart") {
    const spec = parseJson<ChartSpec>(raw);
    return spec?.data?.length ? <BlogChart spec={spec} /> : null;
  }
  return null;
}

export function fenceLanguage(className: unknown): string {
  const m = /language-(\w+)/.exec(typeof className === "string" ? className : "");
  return m ? m[1] : "";
}

export const DATA_FENCE_LANGUAGES = ["stats", "chart"];

export default DataFence;
