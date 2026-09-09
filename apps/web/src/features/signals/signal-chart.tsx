import { useId, useMemo, useState, type PointerEvent } from "react";
import { RefreshCw } from "lucide-react";
import type { AgentSignal } from "@era/domain";
import { Button, ChartSkeleton, EmptyState } from "@/components/ui";
import { Icon } from "@/components/ui/icon";

type Point = { label: string; value: number; max: number; display: string };

export function SignalChart({
  signal,
  loading = false,
  refreshing = false,
  onRefresh,
}: {
  signal: AgentSignal | null;
  loading?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
}) {
  if (loading) return <ChartSkeleton />;
  if (!signal) {
    return (
      <EmptyState
        title="Signal unavailable"
        action={
          onRefresh ? (
            <Button variant="ghost" onClick={onRefresh}>
              Reload
            </Button>
          ) : undefined
        }
      >
        <p>This agent has no live snapshot right now.</p>
      </EmptyState>
    );
  }

  const points = pointsFor(signal);
  if (points.length === 0) {
    return (
      <EmptyState title="No chart data">
        <p>This signal has no numeric snapshot to plot.</p>
      </EmptyState>
    );
  }

  return <BinancePanel points={points} refreshing={refreshing} onRefresh={onRefresh} />;
}

function BinancePanel({
  points,
  refreshing,
  onRefresh,
}: {
  points: Point[];
  refreshing: boolean;
  onRefresh?: () => void;
}) {
  const gid = useId().replaceAll(":", "");
  const [hover, setHover] = useState<number | null>(null);
  const primary = points[0];
  const layout = useMemo(() => layoutPoints(points), [points]);
  const active = (hover !== null ? points[hover] : primary) ?? primary;
  if (!primary || !active) return null;

  function onMove(event: PointerEvent<SVGSVGElement>) {
    const svg = event.currentTarget;
    const box = svg.getBoundingClientRect();
    const x = ((event.clientX - box.left) / box.width) * 360;
    const index = nearestIndex(layout.xs, x);
    setHover(index);
  }

  return (
    <figure className="space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="meta">Live snapshot</p>
          <p className="mt-0.5 font-mono text-xl font-semibold leading-none tracking-tight sm:text-2xl">
            {active.display}
          </p>
          <p className="lede mt-1">{active.label}</p>
        </div>
        {onRefresh ? (
          <Button
            variant="ghost"
            className="size-9 min-h-9 min-w-9 px-0"
            onClick={onRefresh}
            disabled={refreshing}
            aria-label="Reload signal"
          >
            <Icon icon={RefreshCw} className={refreshing ? "animate-spin" : undefined} />
          </Button>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-ink">
        <svg
          viewBox="0 0 360 168"
          className="h-44 w-full touch-pan-y sm:h-52"
          role="img"
          aria-label="Latest signal snapshot"
          onPointerMove={onMove}
          onPointerLeave={() => setHover(null)}
        >
          <defs>
            <linearGradient id={`${gid}-fill`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F0B90B" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#F0B90B" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0, 0.25, 0.5, 0.75, 1].map((t) => {
            const y = 16 + t * 120;
            return (
              <g key={t}>
                <line x1="40" y1={y} x2="352" y2={y} stroke="#2a2e35" strokeWidth="1" />
                <text x="36" y={y + 3} textAnchor="end" fill="#9aa0a6" fontSize="9" fontFamily="IBM Plex Mono, monospace">
                  {axisLabel(primary.max, 1 - t)}
                </text>
              </g>
            );
          })}
          <path d={`${layout.area} L 352 136 L 40 136 Z`} fill={`url(#${gid}-fill)`} />
          <path d={layout.line} fill="none" stroke="#F0B90B" strokeWidth="2" />
          {layout.xs.map((x, index) => {
            const point = points[index];
            const y = layout.ys[index];
            if (!point || y === undefined) return null;
            return (
              <circle
                key={point.label}
                cx={x}
                cy={y}
                r={hover === index ? 4.5 : 3}
                fill="#0B0E11"
                stroke="#F0B90B"
                strokeWidth="2"
              />
            );
          })}
          {hover !== null && layout.xs[hover] !== undefined ? (
            <line
              x1={layout.xs[hover]}
              x2={layout.xs[hover]}
              y1="16"
              y2="136"
              stroke="#F0B90B"
              strokeDasharray="3 3"
              strokeOpacity="0.7"
            />
          ) : null}
          {points.map((point, index) => (
            <text
              key={point.label}
              x={layout.xs[index]}
              y="156"
              textAnchor="middle"
              fill="#9aa0a6"
              fontSize="9"
              fontFamily="IBM Plex Mono, monospace"
            >
              {point.label}
            </text>
          ))}
        </svg>
      </div>

      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
        {points.map((point, index) => (
          <li key={point.label} className={hover === index ? "text-paper" : undefined}>
            <span className="mr-1 inline-block size-1.5 rounded-full bg-accent" aria-hidden />
            {point.label}: {point.display}
          </li>
        ))}
      </ul>
      <p className="meta">Now · no historical range is stored</p>
    </figure>
  );
}

function layoutPoints(points: Point[]): { xs: number[]; ys: number[]; line: string; area: string } {
  const left = 40;
  const right = 352;
  const top = 16;
  const height = 120;
  const span = right - left;
  const xs = points.map((_, index) =>
    points.length === 1 ? (left + right) / 2 : left + (span * index) / (points.length - 1),
  );
  const ys = points.map((point) => top + (1 - clamp(point.value / point.max, 0, 1)) * height);
  const line = smoothPath(xs, ys);
  return { xs, ys, line, area: line };
}

function smoothPath(xs: number[], ys: number[]): string {
  const firstX = xs[0];
  const firstY = ys[0];
  if (firstX === undefined || firstY === undefined) return "";
  if (xs.length === 1) return `M ${firstX} ${firstY}`;
  const secondX = xs[1];
  const secondY = ys[1];
  if (xs.length === 2 && secondX !== undefined && secondY !== undefined) {
    return `M ${firstX} ${firstY} L ${secondX} ${secondY}`;
  }
  let d = `M ${firstX} ${firstY}`;
  for (let i = 0; i < xs.length - 1; i += 1) {
    const x0 = xs[i];
    const y0 = ys[i];
    const x1 = xs[i + 1];
    const y1 = ys[i + 1];
    if (x0 === undefined || y0 === undefined || x1 === undefined || y1 === undefined) continue;
    const c = (x1 - x0) / 2;
    d += ` C ${x0 + c} ${y0}, ${x1 - c} ${y1}, ${x1} ${y1}`;
  }
  return d;
}

function nearestIndex(xs: number[], x: number): number {
  let best = 0;
  let dist = Infinity;
  xs.forEach((value, index) => {
    const next = Math.abs(value - x);
    if (next < dist) {
      dist = next;
      best = index;
    }
  });
  return best;
}

function axisLabel(max: number, t: number): string {
  const value = max * t;
  if (max >= 100) return value.toFixed(0);
  if (max >= 10) return value.toFixed(1);
  return value.toFixed(2);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function pointsFor(signal: AgentSignal): Point[] {
  if (signal.category === "rebalancing") {
    return [
      { label: "In range", value: signal.inRangePct, max: 100, display: `${signal.inRangePct.toFixed(1)}%` },
      {
        label: "Fees",
        value: signal.feesUsd,
        max: Math.max(signal.feesUsd, signal.impermanentLossUsd, 1),
        display: `$${signal.feesUsd.toFixed(0)}`,
      },
      {
        label: "IL",
        value: signal.impermanentLossUsd,
        max: Math.max(signal.feesUsd, signal.impermanentLossUsd, 1),
        display: `$${signal.impermanentLossUsd.toFixed(0)}`,
      },
    ];
  }
  if (signal.category === "grid_trading") {
    return [
      { label: "Fill", value: signal.fillRatePct, max: 100, display: `${signal.fillRatePct.toFixed(1)}%` },
      {
        label: "PnL",
        value: Math.abs(signal.realizedPnlUsd),
        max: Math.max(Math.abs(signal.realizedPnlUsd), 1),
        display: `$${signal.realizedPnlUsd.toFixed(1)}`,
      },
    ];
  }
  if (signal.category === "yield") {
    return [
      {
        label: "APR",
        value: signal.netAprPct,
        max: Math.max(signal.netAprPct, 20),
        display: `${signal.netAprPct.toFixed(2)}%`,
      },
      { label: "Alloc", value: signal.allocationPct, max: 100, display: `${signal.allocationPct}%` },
    ];
  }
  return [
    {
      label: "HF",
      value: signal.healthFactor,
      max: Math.max(signal.healthFactor, 3),
      display: signal.healthFactor.toFixed(2),
    },
    {
      label: "Liq",
      value: signal.liquidationPrice,
      max: Math.max(signal.liquidationPrice, 1),
      display: `$${signal.liquidationPrice.toFixed(1)}`,
    },
  ];
}
