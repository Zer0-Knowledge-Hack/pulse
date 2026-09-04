import { CATEGORY_JOBS, CATEGORY_LABELS, type AgentSignal, type Category } from "@era/domain";
import { Badge } from "@/components/ui";

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 font-mono text-sm text-paper">{value}</p>
    </div>
  );
}

export function CategorySignal({ signal }: { signal: AgentSignal }) {
  if (signal.category === "rebalancing") {
    return (
      <div className="grid grid-cols-2 gap-3">
        <Metric label="In range" value={`${signal.inRangePct.toFixed(1)}%`} />
        <Metric label="Fees vs IL" value={`$${signal.feesUsd.toFixed(0)} / $${signal.impermanentLossUsd.toFixed(0)}`} />
        <Metric label="Last rebalance" value={new Date(signal.lastRebalanceAt).toLocaleString()} />
      </div>
    );
  }
  if (signal.category === "grid_trading") {
    return (
      <div className="grid grid-cols-2 gap-3">
        <Metric label="Bounds" value={`${signal.lowerBound} – ${signal.upperBound}`} />
        <Metric label="Fill rate" value={`${signal.fillRatePct.toFixed(1)}%`} />
        <Metric label="Realized PnL" value={`$${signal.realizedPnlUsd.toFixed(1)}`} />
        <Metric label="Window" value={`${signal.windowHours}h`} />
      </div>
    );
  }
  if (signal.category === "yield") {
    return (
      <div className="grid grid-cols-2 gap-3">
        <Metric label="Venue" value={signal.venue} />
        <Metric label="Net APR" value={`${signal.netAprPct.toFixed(2)}%`} />
        <Metric label="Allocation" value={`${signal.allocationPct}%`} />
        <Metric label="Last hop" value={new Date(signal.lastHopAt).toLocaleString()} />
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-3">
      <Metric label="Health factor" value={signal.healthFactor.toFixed(2)} />
      <Metric label="Liq. price" value={`$${signal.liquidationPrice.toFixed(1)}`} />
      <Metric label="Protocol" value={signal.protocol} />
      <Metric label="Last action" value={new Date(signal.lastActionAt).toLocaleString()} />
    </div>
  );
}

export function CategoryPitch({ category }: { category: Category }) {
  return (
    <div className="flex items-center gap-2">
      <Badge>{CATEGORY_LABELS[category]}</Badge>
      <p className="text-sm text-muted">{CATEGORY_JOBS[category]}</p>
    </div>
  );
}
