import { CATEGORY_JOBS, CATEGORY_LABELS, type AgentSignal, type Category } from "@era/domain";
import { Badge } from "@/components/ui";
import { formatDateTime } from "@/lib/format";

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="font-mono text-[11px] uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 break-words font-mono text-sm text-paper">{value}</p>
    </div>
  );
}

function metricsFor(signal: AgentSignal, compact: boolean): Array<{ label: string; value: string }> {
  if (signal.category === "rebalancing") {
    const rows = [
      { label: "In range", value: `${signal.inRangePct.toFixed(1)}%` },
      {
        label: "Fees vs IL",
        value: `$${signal.feesUsd.toFixed(0)} / $${signal.impermanentLossUsd.toFixed(0)}`,
      },
    ];
    if (!compact) {
      rows.push({ label: "Last rebalance", value: formatDateTime(signal.lastRebalanceAt) });
    }
    return rows;
  }
  if (signal.category === "grid_trading") {
    if (compact) {
      return [
        { label: "Fill rate", value: `${signal.fillRatePct.toFixed(1)}%` },
        { label: "Realized PnL", value: `$${signal.realizedPnlUsd.toFixed(1)}` },
      ];
    }
    return [
      { label: "Bounds", value: `${signal.lowerBound} – ${signal.upperBound}` },
      { label: "Fill rate", value: `${signal.fillRatePct.toFixed(1)}%` },
      { label: "Realized PnL", value: `$${signal.realizedPnlUsd.toFixed(1)}` },
      { label: "Window", value: `${signal.windowHours}h` },
    ];
  }
  if (signal.category === "yield") {
    if (compact) {
      return [
        { label: "Net APR", value: `${signal.netAprPct.toFixed(2)}%` },
        { label: "Venue", value: signal.venue },
      ];
    }
    return [
      { label: "Venue", value: signal.venue },
      { label: "Net APR", value: `${signal.netAprPct.toFixed(2)}%` },
      { label: "Allocation", value: `${signal.allocationPct}%` },
      { label: "Last hop", value: formatDateTime(signal.lastHopAt) },
    ];
  }
  if (compact) {
    return [
      { label: "Health factor", value: signal.healthFactor.toFixed(2) },
      { label: "Liq. price", value: `$${signal.liquidationPrice.toFixed(1)}` },
    ];
  }
  return [
    { label: "Health factor", value: signal.healthFactor.toFixed(2) },
    { label: "Liq. price", value: `$${signal.liquidationPrice.toFixed(1)}` },
    { label: "Protocol", value: signal.protocol },
    { label: "Last action", value: formatDateTime(signal.lastActionAt) },
  ];
}

export function CategorySignal({
  signal,
  compact = false,
}: {
  signal: AgentSignal;
  compact?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {metricsFor(signal, compact).map((metric) => (
        <Metric key={metric.label} label={metric.label} value={metric.value} />
      ))}
    </div>
  );
}

export function CategoryPitch({ category }: { category: Category }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge>{CATEGORY_LABELS[category]}</Badge>
      <p className="text-sm text-muted">{CATEGORY_JOBS[category]}</p>
    </div>
  );
}
