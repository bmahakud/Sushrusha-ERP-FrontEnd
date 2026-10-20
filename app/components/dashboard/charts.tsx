"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { formatCount, formatINR, formatINRCompact } from "../../lib/dashboard/format";

/**
 * Lightweight SVG charts for the dashboards — no chart dependency.
 * Specs: 2px lines, 10% area wash, bars ≤ 24px with 4px rounded data-ends,
 * hairline solid gridlines, hover tooltip on every chart, and a visually hidden
 * table so values never depend on the graphic alone.
 */

const PAD = { top: 14, right: 16, bottom: 26, left: 52 };

// Validated pair (dataviz palette check): teal + orange pass CVD and contrast on white.
const COLORS = { primary: "#0d9488", secondary: "#eb6834" } as const;
const GRID = "#e2e8f0";
const CROSSHAIR = "#cbd5e1";
const HOVER_BAND = "#f1f5f9";

/** Serializable unit so server pages can configure client charts. Money is paise. */
export type ChartUnit = "inr" | "count";

const FORMATS: Record<ChartUnit, { value: (v: number) => string; tick: (v: number) => string }> = {
  inr: { value: (v) => formatINR(v, { decimals: false }), tick: formatINRCompact },
  count: { value: formatCount, tick: formatCount },
};

function useWidth<T extends HTMLElement>(fallback = 640) {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(fallback);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.max(240, Math.round(entry.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}

/** Rounds the axis maximum up to a clean step so ticks read 0 / 5K / 10K … */
function niceScale(max: number, ticks = 4) {
  if (max <= 0) return { top: ticks, step: 1 };
  const raw = max / ticks;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * pow).find((s) => s >= raw) ?? 10 * pow;
  return { top: step * Math.ceil(max / step), step };
}

function roundedTop(x: number, y: number, w: number, h: number, r = 4) {
  const rr = Math.max(0, Math.min(r, w / 2, h));
  return `M${x},${y + h}V${y + rr}Q${x},${y} ${x + rr},${y}H${x + w - rr}Q${x + w},${y} ${x + w},${y + rr}V${y + h}Z`;
}

function SrTable({ caption, headers, rows }: { caption: string; headers: string[]; rows: string[][] }) {
  return (
    <table className="sr-only">
      <caption>{caption}</caption>
      <thead><tr>{headers.map((h) => <th key={h} scope="col">{h}</th>)}</tr></thead>
      <tbody>{rows.map((r) => <tr key={r[0]}>{r.map((c, i) => <td key={i}>{c}</td>)}</tr>)}</tbody>
    </table>
  );
}

// ─── Area / line trend (single series) ──────────────────────────────────────

export function AreaTrend({
  data, label, unit, height = 220,
}: {
  data: { label: string; value: number }[];
  label: string;
  unit: ChartUnit;
  height?: number;
}) {
  const { value: format, tick: tickFormat } = FORMATS[unit];
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);

  const right = PAD.right + 44; // room for the end label
  const innerW = width - PAD.left - right;
  const innerH = height - PAD.top - PAD.bottom;
  const { top, step } = niceScale(Math.max(...data.map((d) => d.value)));
  const n = data.length;
  const x = (i: number) => PAD.left + (n === 1 ? innerW / 2 : (i * innerW) / (n - 1));
  const y = (v: number) => PAD.top + innerH - (v / top) * innerH;

  const line = data.map((d, i) => `${i ? "L" : "M"}${x(i)},${y(d.value)}`).join("");
  const area = `${line}L${x(n - 1)},${PAD.top + innerH}L${x(0)},${PAD.top + innerH}Z`;
  const ticks = Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step);
  const labelEvery = Math.max(1, Math.ceil(n / Math.max(1, Math.floor(innerW / 64))));
  const last = data[n - 1];

  const onMove = (e: ReactPointerEvent<SVGRectElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - box.left;
    setHover(Math.max(0, Math.min(n - 1, Math.round((px / box.width) * (n - 1)))));
  };

  return (
    <div className="ws-chart" ref={ref}>
      <svg width={width} height={height} role="img" aria-label={`${label}. Latest ${format(last.value)}.`}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={width - right} y1={y(t)} y2={y(t)} stroke={GRID} strokeWidth={1} />
            <text x={PAD.left - 8} y={y(t)} textAnchor="end" dominantBaseline="middle" style={{ fontVariantNumeric: "tabular-nums" }}>{tickFormat(t)}</text>
          </g>
        ))}
        {data.map((d, i) => (i % labelEvery === 0 || i === n - 1) && (
          <text key={d.label} x={x(i)} y={height - 6} textAnchor="middle">{d.label}</text>
        ))}

        <path d={area} fill={COLORS.primary} opacity={0.1} />
        <path d={line} fill="none" stroke={COLORS.primary} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

        {/* End marker + direct label */}
        <circle cx={x(n - 1)} cy={y(last.value)} r={4} fill={COLORS.primary} stroke="#fff" strokeWidth={2} />
        <text x={x(n - 1) + 8} y={y(last.value)} dominantBaseline="middle" style={{ fill: "var(--navy)", fontWeight: 600 }}>
          {tickFormat(last.value)}
        </text>

        {hover !== null && (
          <g pointerEvents="none">
            <line x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={PAD.top + innerH} stroke={CROSSHAIR} strokeWidth={1} />
            <circle cx={x(hover)} cy={y(data[hover].value)} r={5} fill={COLORS.primary} stroke="#fff" strokeWidth={2} />
          </g>
        )}
        <rect
          x={PAD.left} y={PAD.top} width={innerW} height={innerH} fill="transparent"
          onPointerMove={onMove} onPointerLeave={() => setHover(null)}
        />
      </svg>
      {hover !== null && (
        <div className="ws-tooltip" style={{ left: x(hover), top: y(data[hover].value) }}>
          {data[hover].label}<br /><b>{format(data[hover].value)}</b>
        </div>
      )}
      <SrTable caption={label} headers={["Period", "Value"]} rows={data.map((d) => [d.label, format(d.value)])} />
    </div>
  );
}

// ─── Column chart (one or two series) ───────────────────────────────────────

export interface Series { name: string; color: keyof typeof COLORS }

export function ColumnChart({
  data, series, label, unit, height = 220, highlightLast = false,
}: {
  data: { label: string; values: number[] }[];
  series: Series[];
  label: string;
  unit: ChartUnit;
  height?: number;
  /** De-emphasise history and accent the current (last) period. */
  highlightLast?: boolean;
}) {
  const { value: format, tick: tickFormat } = FORMATS[unit];
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);

  const innerW = width - PAD.left - PAD.right;
  const innerH = height - PAD.top - PAD.bottom;
  const { top, step } = niceScale(Math.max(...data.flatMap((d) => d.values)));
  const band = innerW / data.length;
  const k = series.length;
  const gap = 2;
  const barW = Math.max(4, Math.min(24, (band * 0.72 - gap * (k - 1)) / k));
  const groupW = barW * k + gap * (k - 1);
  const y = (v: number) => PAD.top + innerH - (v / top) * innerH;
  const ticks = Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step);
  const labelEvery = Math.max(1, Math.ceil(data.length / Math.max(1, Math.floor(innerW / 40))));

  return (
    <div className="ws-chart" ref={ref}>
      {k > 1 && (
        <div className="ws-legend" style={{ marginBottom: "0.5rem" }}>
          {series.map((s) => <span key={s.name}><i style={{ background: COLORS[s.color] }} />{s.name}</span>)}
        </div>
      )}
      <svg width={width} height={height} role="img" aria-label={label}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} stroke={GRID} strokeWidth={1} />
            <text x={PAD.left - 8} y={y(t)} textAnchor="end" dominantBaseline="middle" style={{ fontVariantNumeric: "tabular-nums" }}>{tickFormat(t)}</text>
          </g>
        ))}
        {data.map((d, i) => {
          const gx = PAD.left + i * band + (band - groupW) / 2;
          const dim = highlightLast && i !== data.length - 1 && hover !== i;
          return (
            <g key={d.label}>
              {hover === i && <rect x={PAD.left + i * band} y={PAD.top} width={band} height={innerH} fill={HOVER_BAND} opacity={0.6} />}
              {d.values.map((v, s) => {
                const h = Math.max(0, PAD.top + innerH - y(v));
                return (
                  <path
                    key={series[s].name}
                    d={roundedTop(gx + s * (barW + gap), y(v), barW, h)}
                    fill={COLORS[series[s].color]}
                    opacity={dim ? 0.45 : 1}
                  />
                );
              })}
              {(i % labelEvery === 0 || i === data.length - 1) && (
                <text x={PAD.left + i * band + band / 2} y={height - 6} textAnchor="middle">{d.label}</text>
              )}
              <rect
                x={PAD.left + i * band} y={PAD.top} width={band} height={innerH} fill="transparent"
                onPointerEnter={() => setHover(i)} onPointerLeave={() => setHover(null)}
              />
            </g>
          );
        })}
      </svg>
      {hover !== null && (
        <div className="ws-tooltip" style={{ left: PAD.left + hover * band + band / 2, top: y(Math.max(...data[hover].values)) }}>
          {data[hover].label}
          {data[hover].values.map((v, s) => (
            <div key={series[s].name}>{k > 1 ? `${series[s].name}: ` : ""}<b>{format(v)}</b></div>
          ))}
        </div>
      )}
      <SrTable
        caption={label}
        headers={["Period", ...series.map((s) => s.name)]}
        rows={data.map((d) => [d.label, ...d.values.map(format)])}
      />
    </div>
  );
}
