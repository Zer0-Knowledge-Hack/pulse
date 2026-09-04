import { useEffect, useState } from "react";
import { getRouteApi } from "@tanstack/react-router";
import {
  CATEGORY_LABELS,
  categorySchema,
  type AgentListing,
  type AgentSignal,
  type Category,
} from "@era/domain";
import { AgentCard } from "@/features/catalog/agent-card";
import { CategoryNav } from "@/features/catalog/category-nav";
import { getSignal, listAgents } from "@/lib/api";

const browseRoute = getRouteApi("/browse/$category");

export function BrowsePage() {
  const { category: raw } = browseRoute.useParams();
  const category = categorySchema.parse(raw) as Category;
  const [agents, setAgents] = useState<AgentListing[]>([]);
  const [signals, setSignals] = useState<Record<string, AgentSignal>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    listAgents(category)
      .then(async ({ agents: rows }) => {
        if (cancelled) return;
        setAgents(rows);
        const entries = await Promise.all(
          rows.map(async (agent) => {
            const { signal } = await getSignal(agent.id);
            return [agent.id, signal] as const;
          }),
        );
        if (!cancelled) {
          setSignals(Object.fromEntries(entries));
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load agents");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [category]);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">{CATEGORY_LABELS[category]}</h1>
        <p className="text-muted">
          Featured agents first. Compare the signal, then hire.
        </p>
      </div>
      <CategoryNav active={category} />
      {error ? <p className="text-danger">{error}</p> : null}
      <div className="grid gap-4 lg:grid-cols-2">
        {agents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} signal={signals[agent.id]} />
        ))}
      </div>
    </div>
  );
}
