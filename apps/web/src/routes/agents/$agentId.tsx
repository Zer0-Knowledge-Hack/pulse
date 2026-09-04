import { useEffect, useState } from "react";
import { getRouteApi } from "@tanstack/react-router";
import type { AgentListing, AgentSignal } from "@era/domain";
import { Badge } from "@/components/ui";
import { CategorySignal } from "@/features/signals/category-signal";
import { HirePanel } from "@/features/hire/hire-cta";
import { getAgent, getSignal } from "@/lib/api";

const agentRoute = getRouteApi("/agents/$agentId");

export function AgentDetailPage() {
  const { agentId } = agentRoute.useParams();
  const [agent, setAgent] = useState<AgentListing | null>(null);
  const [signal, setSignal] = useState<AgentSignal | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getAgent(agentId), getSignal(agentId)])
      .then(([agentRes, signalRes]) => {
        if (cancelled) return;
        setAgent(agentRes.agent);
        setSignal(signalRes.signal);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load agent");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [agentId]);

  if (error) {
    return <p className="text-danger">{error}</p>;
  }
  if (!agent) {
    return <p className="text-muted">Loading…</p>;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-4">
        <Badge>{agent.category.replaceAll("_", " ")}</Badge>
        <h1 className="text-3xl font-semibold">{agent.name}</h1>
        <p className="text-muted">{agent.description}</p>
        {signal ? <CategorySignal signal={signal} /> : null}
        <p className="font-mono text-xs text-muted">
          provider {agent.commerce.erc8183Provider}
        </p>
      </div>
      <HirePanel agent={agent} />
    </div>
  );
}
