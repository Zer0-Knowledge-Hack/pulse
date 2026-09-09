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
        title="No data available"
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
      <EmptyState title="No data available">
        <p>This signal has no numeric snapshot to plot.</p>
      </EmptyState>
    );
  }

  return <SnapshotBars points={points} refreshing={refreshing} onRefresh={onRefresh} />;
}

function SnapshotBars({
  points,
  refreshing,
  onRefresh,
}: {
  points: Point[];
  refreshing: boolean;
  onRefresh?: () => void;
}) {
  return (
    <figure className="space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="meta">Live snapshot</p>
          <p className="lede mt-1">Current values from the catalog. No historical series is stored.</p>
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

      <ul className="space-y-3 rounded-xl border border-line bg-ink px-3 py-3">
        {points.map((point) => {
          const width = `${Math.round(clamp(point.value / point.max, 0, 1) * 100)}%`;
          return (
            <li key={point.label}>
              <div className="mb-1 flex items-baseline justify-between gap-3">
                <span className="text-xs text-muted">{point.label}</span>
                <span className="font-mono text-sm text-paper">{point.display}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-line">
                <div className="h-full rounded-full bg-accent" style={{ width }} />
              </div>
            </li>
          );
        })}
      </ul>
    </figure>
  );
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
      { label: "Fill rate", value: signal.fillRatePct, max: 100, display: `${signal.fillRatePct.toFixed(1)}%` },
      {
        label: "Realized PnL",
        value: Math.abs(signal.realizedPnlUsd),
        max: Math.max(Math.abs(signal.realizedPnlUsd), 1),
        display: `$${signal.realizedPnlUsd.toFixed(1)}`,
      },
    ];
  }
  if (signal.category === "yield") {
    return [
      {
        label: "Net APR",
        value: signal.netAprPct,
        max: Math.max(signal.netAprPct, 20),
        display: `${signal.netAprPct.toFixed(2)}%`,
      },
      { label: "Allocation", value: signal.allocationPct, max: 100, display: `${signal.allocationPct}%` },
    ];
  }
  return [
    {
      label: "Health factor",
      value: signal.healthFactor,
      max: Math.max(signal.healthFactor, 3),
      display: signal.healthFactor.toFixed(2),
    },
    {
      label: "Liquidation price",
      value: signal.liquidationPrice,
      max: Math.max(signal.liquidationPrice, 1),
      display: `$${signal.liquidationPrice.toFixed(1)}`,
    },
  ];
}
